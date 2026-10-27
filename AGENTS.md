# test1

Habit tracker, single page. Vite-free static HTML with inline JS.

## Stack

- One `index.html` with inline CSS and JS. No framework, no bundler, no build.
- Node.js only for the helper scripts in `scripts/`.

## Commands

| what | command |
|---|---|
| serve | open `index.html` in a browser; `scripts/` has a local server |
| env check | `npm run env:check` |

There is no build step and no test suite. Opening `index.html` is a complete install.

## Layout

- `index.html` — the tracker: habit list, streak state, localStorage persistence
- `scripts/` — the local server
- `DESIGN.md` — palette with computed ratios and the dial line

## Design direction

`DESIGN.md` is the source of truth. The greys in this file were previously `text-slate-400` (`#94a3b8`), which is 2.56:1 on white — a real accessibility failure. Do not reintroduce them.

## Guardrails

- Every interactive element has a real behaviour or it is removed.
- No invented content: no fabricated streak history, achievements or completion percentages. First run has no data and must say so.
- Text never goes below 12px, body never below 16px.
- Never delete or overwrite without an explicit instruction from Rahman.

## Verify a change

Open `index.html`, add and complete a habit, reload, and confirm the state survived. Tab through every control and confirm focus is visible.
