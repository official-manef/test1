const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { test, before, after } = require('node:test');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const html = readFileSync(resolve(process.env.HABIT_HTML || 'index.html'), 'utf8');
const KEY = 'habit-tracker-v2';
const name = '<img src=x onerror="window.__habitXss = true">';
const snapshot = (habits, date = '2026-10-18') => ({ date, habits });
const habit = (value = 'Read & rest') => ({ name: value, done: false, streak: 0, lastDoneDate: null });
let browser;
before(async () => { browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH }); });
after(async () => { await browser?.close(); });

async function open(stored, timezoneId = 'UTC', time = '2026-10-18T12:00:00Z') {
    const context = await browser.newContext({ timezoneId });
    const page = await context.newPage();
    await page.clock.install({ time: new Date(time) });
    await page.route('**/*', route => {
        if (route.request().url() === 'http://habit.test/') {
            return route.fulfill({ contentType: 'text/html', body: html });
        }
        return route.abort();
    });
    await page.addInitScript(({ stored, KEY }) => {
        window.lucide = { createIcons() {} };
        window.confetti = () => {};
        if (stored !== undefined && !sessionStorage.getItem('seeded')) {
            localStorage.setItem(KEY, stored);
            sessionStorage.setItem('seeded', 'yes');
        }
    }, { stored, KEY });
    page.on('dialog', dialog => dialog.dismiss());
    await page.goto('http://habit.test/');
    return { context, page };
}

async function upload(page, value) {
    await page.locator('#file').setInputFiles({ name: 'habits.json', mimeType: 'application/json', buffer: Buffer.from(value) });
    await page.waitForFunction(() => document.getElementById('file').value === '');
}

test('import and reload render HTML-shaped names only as text', async () => {
    const { context, page } = await open();
    try {
        // Do not wait for reset here: the vulnerable baseline never resets the input.
        await page.locator('#file').setInputFiles({ name: 'habits.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(snapshot([habit(name)]))) });
        await page.waitForFunction(() => document.querySelectorAll('#list li').length === 1 && localStorage.getItem('habit-tracker-v2')?.includes('onerror'));
        if (await page.locator('#list img').count()) {
            await page.waitForFunction(() => window.__habitXss === true);
        }
        assert.equal(await page.evaluate(() => window.__habitXss), undefined, 'untrusted import executed its event handler');
        assert.equal(await page.locator('#list img').count(), 0, 'untrusted import created an HTML element');
        assert.equal(await page.locator('#list p').textContent(), name);
        assert.equal(await page.evaluate(() => window.__habitXss), undefined);
        await page.reload();
        assert.equal(await page.locator('#list img').count(), 0);
        assert.equal(await page.locator('#list p').textContent(), name);
        assert.equal(await page.evaluate(() => window.__habitXss), undefined);
    } finally { await context.close(); }
});

test('valid exports and legacy minimal habits retain values and controls', async () => {
    const data = snapshot([{ ...habit('Walk <outside> & breathe'), done: true, streak: 4, lastDoneDate: '2026-10-18' }]);
    const { context, page } = await open(JSON.stringify(data));
    try {
        assert.equal(await page.locator('#list p').textContent(), data.habits[0].name);
        assert.equal(await page.locator('#list input').isChecked(), true);
        assert.match(await page.locator('#list').textContent(), /4 day streak/);
        await page.locator('#list input').uncheck();
        assert.equal(JSON.parse(await page.evaluate(KEY => localStorage.getItem(KEY), KEY)).habits[0].streak, 3);
        await upload(page, JSON.stringify({ habits: [{ name: 'Legacy habit' }] }));
        assert.equal(await page.locator('#list p').textContent(), 'Legacy habit');
        const downloadPromise = page.waitForEvent('download');
        await page.getByText('Export', { exact: true }).click();
        const download = await downloadPromise;
        const stream = await download.createReadStream();
        let exported = '';
        for await (const chunk of stream) exported += chunk;
        assert.deepEqual(JSON.parse(exported), snapshot([habit('Legacy habit')]));
        await upload(page, exported);
        assert.equal(await page.locator('#list p').textContent(), 'Legacy habit');
    } finally { await context.close(); }
});

test('invalid imports reject the entire file and preserve stored and visible state', async () => {
    const original = JSON.stringify(snapshot([habit('Keep me')]));
    const { context, page } = await open(original);
    try {
        const badValues = [
            '{', 'null', '[]', '{"habits":null}',
            JSON.stringify(snapshot([habit('First'), { ...habit(), done: 'false' }])),
            JSON.stringify(snapshot([{ ...habit(), streak: -1 }])),
            JSON.stringify(snapshot([{ ...habit(), streak: 1.5 }])),
            JSON.stringify(snapshot([{ ...habit(), streak: 1000001 }])),
            JSON.stringify(snapshot([{ ...habit(), lastDoneDate: '2026-02-30' }])),
            JSON.stringify(snapshot([habit('')])),
            JSON.stringify(snapshot([habit('x'.repeat(501))])),
            JSON.stringify(snapshot(Array.from({ length: 501 }, () => habit()))),
            JSON.stringify(snapshot([habit()], 'not-a-date')),
            ' '.repeat(1024 * 1024 + 1)
        ];
        for (const value of badValues) {
            await upload(page, value);
            assert.equal(await page.evaluate(KEY => localStorage.getItem(KEY), KEY), original);
            assert.equal(await page.locator('#list p').textContent(), 'Keep me');
            assert.match(await page.locator('#notice').textContent(), /import|large/i);
        }
    } finally { await context.close(); }
});

test('corrupt storage recovers without overwriting the original bytes', async () => {
    for (const raw of ['{broken', 'null', JSON.stringify(snapshot([{ name: {} }]))]) {
        const { context, page } = await open(raw);
        try {
            assert.match(await page.locator('#list').textContent(), /No habits yet/);
            assert.equal(await page.evaluate(KEY => localStorage.getItem(KEY), KEY), raw);
            assert.match(await page.locator('#notice').textContent(), /stored data/i);
        } finally { await context.close(); }
    }
});

test('storage write failure leaves imported state unchanged', async () => {
    const original = JSON.stringify(snapshot([habit('Keep me')]));
    const { context, page } = await open(original);
    try {
        await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException('Full', 'QuotaExceededError'); }; });
        await upload(page, JSON.stringify(snapshot([habit('Replacement')])));
        assert.equal(await page.locator('#list p').textContent(), 'Keep me');
        assert.equal(await page.evaluate(KEY => localStorage.getItem(KEY), KEY), original);
        assert.match(await page.locator('#notice').textContent(), /save/i);
    } finally { await context.close(); }
});

test('add and edit also keep markup-shaped names inert', async () => {
    const { context, page } = await open();
    try {
        await page.locator('#habitInput').fill(name);
        await page.locator('button[onclick="addHabit()"]').click();
        assert.equal(await page.locator('#list p').textContent(), name);
        assert.equal(await page.locator('#list img').count(), 0);
        await page.evaluate(value => { window.prompt = () => value; }, '<svg onload="window.__habitXss=true"></svg>');
        await page.locator('#list button').first().click();
        assert.equal(await page.locator('#list svg').count(), 0);
        assert.equal(await page.locator('#list p').textContent(), '<svg onload="window.__habitXss=true"></svg>');
        assert.equal(await page.evaluate(() => window.__habitXss), undefined);
    } finally { await context.close(); }
});

test('documented size boundaries remain usable and save valid data', async () => {
    const { context, page } = await open();
    try {
        const data = snapshot(Array.from({ length: 500 }, () => ({ ...habit('x'.repeat(500)), streak: 1000000 })));
        await upload(page, JSON.stringify(data));
        assert.equal(await page.locator('#list li').count(), 500);
        await page.locator('#list input').first().check();
        const stored = JSON.parse(await page.evaluate(KEY => localStorage.getItem(KEY), KEY));
        assert.equal(stored.habits[0].streak, 1000000);
        await page.reload();
        assert.equal(await page.locator('#list li').count(), 500);
    } finally { await context.close(); }
});

test('local calendar date rollover preserves yesterday streak in a UTC-offset zone', async () => {
    const data = snapshot([{ ...habit(), done: true, streak: 4, lastDoneDate: '2026-10-17' }], '2026-10-17');
    const { context, page } = await open(JSON.stringify(data), 'Asia/Jakarta', '2026-10-17T18:00:00Z');
    try {
        assert.equal(await page.locator('#list input').isChecked(), false);
        const stored = JSON.parse(await page.evaluate(KEY => localStorage.getItem(KEY), KEY));
        assert.equal(stored.date, '2026-10-18');
        assert.equal(stored.habits[0].streak, 4);
    } finally { await context.close(); }
});
