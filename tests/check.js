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
const BOOK_FILES = ['g3a', 'g3b', 'g4a', 'g4b', 'g5a', 'g5b', 'g6a', 'g6b', 'xuefu-data', 'xuefu'].map((id) => 'js/questions/' + id + '.js');
['js/detector.js', 'js/questions/core.js', ...BOOK_FILES].forEach((file) => {
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
  // 5 下有小數乘小數，答案最多 4 位小數；超過就是浮點誤差（例如 0.30000000000000004）
  if (/\d\.\d{5,}/.test(text)) return 'float noise';
  return '';
}

/** 5、6 年級的分數答案要是最簡分數（擴分、通分單元除外） */
function checkReduced(tokens) {
  for (const t of tokens) {
    if (t && typeof t === 'object' && typeof t.f[1] === 'number' && typeof t.f[2] === 'number') {
      if (NP.bank.H.gcd(t.f[1], t.f[2]) !== 1) return 'not reduced ' + t.f.join(',');
    }
  }
  return '';
}

const samples = [];

/* ---------------- 學習扶助單元（選擇題） ---------------- */

const CIRC = '①②③④';

/** 片段轉文字（含圖片、選項），比對選項是否重複用 */
function flat(tokens) {
  return tokens
    .map((t) => {
      if (t && typeof t === 'object' && Array.isArray(t.f)) return '[' + t.f.join(',') + ']';
      if (t && typeof t === 'object' && t.img) return '<' + t.img + '>';
      if (t && typeof t === 'object' && Array.isArray(t.opts)) return '{' + t.opts.map(flat).join('|') + '}';
      return String(t);
    })
    .join('');
}

/** 檢查片段格式；strict 為 false 時允許原題裡刻意寫錯的分數（例如誘答的 2又7/4） */
function checkRich(tokens, strict) {
  if (!Array.isArray(tokens) || !tokens.length) return 'empty';
  for (const t of tokens) {
    if (typeof t === 'string') continue;
    if (!t || typeof t !== 'object') return 'non-string token';
    if (Array.isArray(t.f)) {
      const [w, n, d] = t.f;
      if (typeof w !== 'number' || w < 0) return 'bad whole ' + w;
      if (typeof n === 'number' && n <= 0) return 'bad numerator ' + n;
      if (typeof d === 'number' && d <= 1) return 'bad denominator ' + d;
      if (strict && w > 0 && n >= d) return 'mixed not proper';
    } else if (t.img) {
      if (!fs.existsSync(path.join(root, t.img))) return 'missing image ' + t.img;
      if (!(t.w > 0 && t.h > 0)) return 'image without size ' + t.img;
    } else if (Array.isArray(t.opts)) {
      if (t.opts.length !== 4) return 'options ' + t.opts.length;
      for (const o of t.opts) {
        const p = o.length ? checkRich(o, strict) : 'empty option';
        if (p) return 'option: ' + p;
      }
      const texts = t.opts.map(flat);
      if (new Set(texts).size !== 4) return 'duplicate options ' + texts.join(' | ');
    } else {
      return 'unknown token ' + JSON.stringify(t);
    }
  }
  // 圖片檔名（例如 g3-mA-1.png）不算進文字，避免被當成負數
  const text = flat(tokens).replace(/<[^>]*>/g, '<圖>');
  if (/NaN|undefined|Infinity|null|\[圖/.test(text)) return 'invalid text';
  if (/(^|[^\d.])-\d/.test(text)) return 'negative number';
  // 原題本來就有 0.98176 這種長小數，只檢查電腦出題
  if (strict && /\d\.\d{5,}/.test(text)) return 'float noise';
  return '';
}

/** 選擇題：答案的代號要對得上選項內容 */
function checkChoice(r, strict) {
  const opts = r.q[r.q.length - 1];
  if (!opts || !Array.isArray(opts.opts)) return 'last token is not options';
  const p = checkRich(r.q, strict) || checkRich(r.a, strict);
  if (p) return p;
  const at = CIRC.indexOf(String(r.a[0]).trim()[0]);
  if (at < 0) return 'answer has no option number';
  if (!strict) return '';
  const body = flat(r.a.slice(1)).trim();
  if (body !== flat(opts.opts[at]).trim()) return 'answer does not match option ' + CIRC[at];
  return '';
}

let xfFixed = 0;
let xfGen = 0;
NP.bank.books.forEach((book) => {
  book.units
    .filter((u) => u.xuefu)
    .forEach((unit) => {
      if (unit.fixed.length !== 150) errors.push(unit.id + ': 原題應有 150 題，實際 ' + unit.fixed.length);
      unit.fixed.forEach((r, i) => {
        xfFixed += 1;
        const p = checkChoice(r, false);
        if (p) errors.push(`${unit.id} 原題 ${i + 1}: ${p}`);
      });
      unit.gens.forEach((gen, gi) => {
        const seen = new Set();
        for (let i = 0; i < RUNS; i++) {
          let r;
          try {
            r = gen(H);
          } catch (err) {
            errors.push(`${unit.id} 電腦出題 ${gi}: 出題失敗 ${err.message}`);
            break;
          }
          xfGen += 1;
          // 5、6 年級正確答案要是最簡分數；考擴分的題目（raw）除外
          const p =
            checkChoice(r, true) ||
            (book.grade >= 5 && !r.raw ? checkReduced(r.a.filter((t) => t && typeof t === 'object' && Array.isArray(t.f))) : '');
          if (p) {
            errors.push(`${unit.id} 電腦出題 ${gi}: ${p} | ${flat(r.q)} => ${flat(r.a)}`);
            break;
          }
          seen.add(flat(r.q));
          if (i < 1) samples.push(`${book.label} 學習扶助 規則${gi}｜${flat(r.q)}  →  ${flat(r.a)}`);
        }
        if (seen.size < 5) errors.push(`${unit.id} 電腦出題 ${gi}: 只有 ${seen.size} 種題目`);
      });
    });
});

NP.bank.books.forEach((book) => {
  book.units.forEach((unit) => {
    if (unit.xuefu) return;
    unit.gens.forEach((gen, gi) => {
      for (let i = 0; i < RUNS; i++) {
        const r = gen(H);
        total += 1;
        const problem =
          checkTokens('q', r.q) ||
          checkTokens('a', r.a) ||
          (book.grade >= 5 && !unit.raw ? checkReduced(r.a) || checkReduced(r.q) : '');
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
console.log('學習扶助：原題 ' + xfFixed + ' 題，電腦出題 ' + xfGen + ' 題');
console.log('\n範例題目：');
samples.forEach((s) => console.log('  ' + s));
if (errors.length) {
  console.log('\n發現問題：');
  errors.forEach((e) => console.log('  ✗ ' + e));
  process.exit(1);
}
console.log('\n全部通過 ✓');
