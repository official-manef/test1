#!/usr/bin/env node
// Diffs env names the code reads against names .env.example declares.
// Catches the portfolio-wide finding: env files written at scaffold time,
// reads added later. Add as `"env:check": "node scripts/env-check.mjs"`.
//
// ponytail: regex scan, not a parser. Misses dynamic access like process.env[key].
// Upgrade path: swap the regexes for the bundler's define table if false positives appear.

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = process.cwd();
const EXAMPLE = [".env.example", ".env.sample", ".env.template"].find((f) => existsSync(join(ROOT, f)));
const SKIP = new Set(["node_modules", ".git", ".next", ".svelte-kit", "dist", "build", ".turbo", "coverage", ".vercel"]);
const EXT = new Set([".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx", ".svelte", ".vue", ".astro"]);
// This file contains the regex source itself, so it matches its own pattern. Skip it.
const SELF = "scripts/env-check.mjs";

if (!EXAMPLE) {
  console.error("env:check — no .env.example in the repo root. Create one and re-run.");
  process.exit(1);
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (EXT.has(extname(p))) out.push(p);
  }
  return out;
}

const declared = new Set(
  readFileSync(join(ROOT, EXAMPLE), "utf8")
    .split(/\r?\n/)
    .map((l) => l.match(/^\s*([A-Z][A-Z0-9_]*)\s*=/)?.[1])
    .filter(Boolean),
);

// process.env.FOO · import.meta.env.FOO · process.env["FOO"] · import.meta.env["FOO"]
const READ = /(?:process\.env|import\.meta\.env)(?:\.([A-Z][A-Z0-9_]*)|\[\s*["']([A-Z][A-Z0-9_]*)["']\s*\])/g;
const read = new Map();
for (const file of walk(ROOT)) {
  if (file.endsWith(SELF)) continue;
  const src = readFileSync(file, "utf8");
  for (const m of src.matchAll(READ)) {
    const name = m[1] ?? m[2];
    if (!read.has(name)) read.set(name, file.replace(ROOT + "/", ""));
  }
}

const undeclared = [...read.keys()].filter((n) => !declared.has(n)).sort();
const unused = [...declared].filter((n) => !read.has(n)).sort();

for (const n of undeclared) console.error(`read but not declared: ${n}  (${read.get(n)})`);
for (const n of unused) console.warn(`declared but never read: ${n}`);

console.log(`env:check — ${declared.size} declared, ${read.size} read, ${undeclared.length} undeclared, ${unused.length} unused`);
process.exit(undeclared.length ? 1 : 0);
