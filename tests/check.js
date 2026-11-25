/*
 * 題庫與「太吵判定」自我檢查（不需安裝任何套件）
 * 執行：node tests/check.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const context = { window: {}, Math, Number, String, JSON, Set, Object, Array, console };
context.window = context;
vm.createContext(context);
['js/detector.js', 'js/questions/core.js', 'js/questions/g4a.js', 'js/questions/g4b.js'].forEach((file) => {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
});

const NP = context.NP;
const H = NP.bank.H;
const RUNS = 3000;
const errors = [];
let total = 0;

function tokenText(tokens) {
  return tokens
    .map((t) => (t && typeof t === 'object' ? '[' + t.f.join(',') + ']' : String(t)))
    .join('');
}

function checkTokens(where, tokens) {
  if (!Array.isArray(tokens) || !tokens.length) return 'empty';
  for (const t of tokens) {
    if (t && typeof t === 'object') {
      if (!Array.isArray(t.f) || t.f.length !== 3) return 'bad fraction';
      const [w, n, d] = t.f;
      if (typeof w !== 'number' || w < 0) return 'bad whole ' + w;
      if (n !== '？' && (typeof n !== 'number' || n <= 0)) return 'bad numerator ' + n;
      if (d !== '？' && (typeof d !== 'number' || d <= 1)) return 'bad denominator ' + d;
      if (typeof n === 'number' && typeof d === 'number' && w > 0 && n >= d) return 'mixed not proper';
    } else if (typeof t !== 'string') {
      return 'non-string token';
    }
  }
  const text = tokenText(tokens);
  if (/NaN|undefined|Infinity|null/.test(text)) return 'invalid text';
  if (/－\s*\d/.test(text) && where === 'a') return 'negative answer';
  if (/(^|[^\d.])-\d/.test(text)) return 'negative number';
  if (/\d\.\d{3,}/.test(text)) return 'float noise';
  return '';
}

const samples = [];
NP.bank.books.forEach((book) => {
  book.units.forEach((unit) => {
    unit.gens.forEach((gen, gi) => {
      for (let i = 0; i < RUNS; i++) {
        const r = gen(H);
        total += 1;
        const problem = checkTokens('q', r.q) || checkTokens('a', r.a);
        if (problem) {
          errors.push(`${unit.id} gen${gi}: ${problem} | ${tokenText(r.q)} => ${tokenText(r.a)}`);
          break;
        }
        // 除法題：檢查等式是否成立（被除數 = 商 × 除數 + 餘數，餘數 < 除數）
        const qt = tokenText(r.q);
        const m = qt.match(/^(\d+) ÷ (\d+) ＝ ？$/);
        if (m) {
          const [a, d] = [Number(m[1]), Number(m[2])];
          const [q, rem = 0] = tokenText(r.a).split(' … ').map(Number);
          if (q * d + rem !== a || rem >= d) errors.push(`${unit.id} gen${gi}: wrong division ${qt} => ${tokenText(r.a)}`);
        }
        if (i < 2) samples.push(`${book.label} ${unit.no} ${unit.name}｜${qt}  →  ${tokenText(r.a)}`);
      }
    });
  });
});

// 除法位數：4 上「二位數 ÷ 二位數」被除數必須是二位數
const u4 = NP.bank.unit('g4a-04');
for (let i = 0; i < RUNS; i++) {
  const a = Number(tokenText(u4.gens[1](H).q).split(' ')[0]);
  if (a < 12 || a > 99) {
    errors.push('g4a-04 二位數÷二位數 dividend out of range: ' + a);
    break;
  }
}

// 太吵判定：模擬時間軸
function simulate(levels, opts) {
  const det = NP.createDetector(Object.assign({ threshold: 50, cooldownSec: 20, maxQuestions: 6 }, opts));
  const dt = 0.05;
  const hits = [];
  let t = 0;
  for (const [level, seconds] of levels) {
    for (let s = 0; s < seconds; s += dt) {
      t += dt;
      if (det.update(level, dt, false).trigger) hits.push(Number(t.toFixed(2)));
    }
  }
  return hits;
}

const expect = (name, cond, detail) => {
  if (!cond) errors.push('detector: ' + name + ' ' + JSON.stringify(detail));
};

let hits = simulate([[55, 2.9]]);
expect('slightly over < 3s should not trigger', hits.length === 0, hits);
hits = simulate([[55, 3.2]]);
expect('slightly over 3s should trigger once', hits.length === 1, hits);
hits = simulate([[70, 0.9]]);
expect('far over < 1s should not trigger', hits.length === 0, hits);
hits = simulate([[70, 1.1]]);
expect('far over 1s should trigger', hits.length === 1, hits);
hits = simulate([[90, 0.3], [20, 5], [90, 0.3], [20, 5]]);
expect('short bangs should not trigger', hits.length === 0, hits);
hits = simulate([[70, 25]]);
expect('cooldown 20s then trigger again', hits.length === 2 && hits[1] - hits[0] >= 20, hits);
hits = simulate([[70, 600]], { maxQuestions: 6 });
expect('cap at maxQuestions', hits.length === 6, hits.length);

console.log('出題規則檢查：' + total + ' 題');
console.log('\n範例題目：');
samples.forEach((s) => console.log('  ' + s));
if (errors.length) {
  console.log('\n發現問題：');
  errors.forEach((e) => console.log('  ✗ ' + e));
  process.exit(1);
}
console.log('\n全部通過 ✓');
