#!/usr/bin/env node
// Builds dist/index.html from src/.
//
// The game's source files share one scope: src/data/*.js and then src/game/*.js
// are concatenated, each folder in filename order, inside a single 'use strict'
// closure, exactly like the original one-file build, so any file can read and
// reassign state declared in an earlier one. Keep the numeric prefixes in
// src/game/ when adding files - they define load order.
//
//   node scripts/build.mjs           build once
//   node scripts/build.mjs --serve   build, serve on http://localhost:5173 and rebuild on change
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');
const read = f => fs.readFileSync(path.join(src, f), 'utf8');

// Data tables load first, so any game file can use them at load time.
function gameFiles() {
  return ['data', 'game'].flatMap(d =>
    fs.readdirSync(path.join(src, d)).filter(f => f.endsWith('.js')).sort().map(f => `${d}/${f}`));
}

// Syntax-check the joined game code and report errors against the source file, not the bundle.
function check(files, code) {
  try {
    new vm.Script(`(()=>{'use strict';\n${code}})`, { filename: 'game.js' });
  } catch (err) {
    const m = /game\.js:(\d+)/.exec(err.stack || '');
    let line = m ? +m[1] - 1 : 0, where = 'src';
    for (const f of files) {
      const n = read(f).split('\n').length - 1;
      if (line <= n) { where = `src/${f}:${line}`; break; }
      line -= n;
    }
    throw new Error(`${err.name}: ${err.message}\n    at ${where}`);
  }
}

export function build() {
  const files = gameFiles();
  const code = files.map(f => {
    const s = read(f);
    if (!s.endsWith('\n')) throw new Error(`src/${f} must end with a newline`);
    return s;
  }).join('');
  check(files, code);
  const html = read('index.html')
    .replace('{{styles}}', () => read('styles.css'))
    .replace('{{boot}}', () => read('boot.js'))
    .replace('{{game}}', () => code);
  fs.mkdirSync(dist, { recursive: true });
  fs.writeFileSync(path.join(dist, 'index.html'), html);
  fs.writeFileSync(path.join(dist, '.nojekyll'), '');
  return { files: files.length, bytes: Buffer.byteLength(html) };
}

function rebuild() {
  try {
    const r = build();
    console.log(`built dist/index.html (${r.files} source files, ${(r.bytes / 1024).toFixed(0)} KB)`);
    return true;
  } catch (err) {
    console.error('build failed: ' + err.message);
    return false;
  }
}

if (process.argv.includes('--serve')) {
  rebuild();
  let timer = null;
  fs.watch(src, { recursive: true }, () => { clearTimeout(timer); timer = setTimeout(rebuild, 50); });
  const port = +process.env.PORT || 5173;
  http.createServer((req, res) => {
    const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = path.join(dist, p.endsWith('/') ? p + 'index.html' : p);
    if (!file.startsWith(dist) || !fs.existsSync(file)) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'content-type': file.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream', 'cache-control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  }).listen(port, () => console.log(`serving http://localhost:${port}  (rebuilds on save; refresh the page)`));
} else if (!rebuild()) {
  process.exit(1);
}
