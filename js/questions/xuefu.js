/*
 * 學習扶助單元：放在 3～6 年級下學期的最後一個單元。
 * 題目有兩種來源，出題時各一半機率：
 *   1. 原題：學扶數學網站整理的考古題與模擬卷（xuefu-data.js），每年級 150 題。
 *   2. 電腦出題：依 docs/學習扶助命題原則.md 寫成的出題規則，數字隨機產生。
 * 全部是四選一選擇題，誘答選項對應命題原則第二節的常見錯誤（E1～E12）。
 */
(function (NP) {
  'use strict';

  const H = NP.bank.H;
  const CIRC = '①②③④';
  const CN = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

  /* ---------------- 小工具 ---------------- */

  const r = (a, b) => H.r(a, b);
  const pick = (list) => H.pick(list);
  const gcd = (a, b) => H.gcd(a, b);
  const lcm = (a, b) => (a / gcd(a, b)) * b;
  const dec = (x, d) => H.dec(x, d === undefined ? 6 : d);
  const fmt = (x) => String(dec(x));
  const digits = (n) => String(n).split('').map(Number);
  const isInt = (x) => Number.isInteger(dec(x, 9));

  /** 分數（不約分）；格式不對回傳 null，選項會自動跳過 */
  function F(n, d) {
    return Number.isInteger(n) && Number.isInteger(d) && n > 0 && d > 1 ? { f: [0, n, d] } : null;
  }

  /** 帶分數（不約分）：整數 w、分子 n、分母 d */
  function M(w, n, d) {
    if (!(Number.isInteger(w) && Number.isInteger(n) && Number.isInteger(d)) || w < 0 || n < 0 || d < 2) return null;
    if (n === 0) return w > 0 ? w : null;
    if (n >= d) return null;
    return { f: [w, n, d] };
  }

  /** 假分數 n/d 寫成帶分數，不約分（3、4 年級） */
  function MX(n, d) {
    if (!(n > 0 && d > 1)) return null;
    const w = Math.floor(n / d);
    const k = n % d;
    if (!k) return w;
    return { f: [w, k, d] };
  }

  /** 最簡分數，假分數寫成帶分數（5、6 年級） */
  function RF(n, d) {
    if (!(Number.isInteger(n) && Number.isInteger(d)) || n <= 0 || d <= 0) return null;
    const v = H.frac(n, d);
    return typeof v === 'string' ? Number(v) : v;
  }

  /** 文字選項，附上排序用的數值 */
  const V = (text, val) => ({ text, val });

  /** 選項 → 題目片段 */
  function toTokens(v, unit) {
    if (v === null || v === undefined) return null;
    if (typeof v === 'number') return Number.isFinite(v) && v >= 0 ? [fmt(v) + unit] : null;
    if (typeof v === 'string') return [v + unit];
    if (Array.isArray(v)) return v.some((t) => t === null || t === undefined) ? null : v;
    if (v.text !== undefined) return Number.isFinite(v.val) && v.val < 0 ? null : [v.text + unit];
    if (Array.isArray(v.f)) return unit ? [v, unit] : [v];
    return null;
  }

  /** 選項的數值（排序與「不能有兩個正確答案」的比對用） */
  function value(v) {
    if (typeof v === 'number') return v;
    if (v && v.val !== undefined) return v.val;
    if (v && Array.isArray(v.f) && typeof v.f[1] === 'number' && typeof v.f[2] === 'number') {
      return v.f[0] + v.f[1] / v.f[2];
    }
    return NaN;
  }

  /**
   * 組成四選一選擇題。
   * wrongs 可以多給幾個；重複、格式不對、和正確答案一樣大的會跳過，取前 3 個。
   * 選項都有數值時由小到大排列，否則隨機排列。
   * o.unit：數值後面接的單位；o.shuffle：一律隨機排列；o.allowEqual：允許和正確答案等值（考寫法時用）；
   * o.raw：正確答案刻意不約分（考擴分時用）。
   */
  function choice(stem, correct, wrongs, o) {
    o = o || {};
    const unit = o.unit || '';
    const cv = value(correct);
    const items = [];
    const seen = new Set();
    function add(v, wrong) {
      const t = toTokens(v, unit);
      if (!t) return;
      const key = JSON.stringify(t);
      if (seen.has(key)) return;
      const val = value(v);
      if (wrong && !o.allowEqual && Number.isFinite(cv) && Math.abs(val - cv) < 1e-9) return;
      seen.add(key);
      items.push({ t, val, len: key.length });
    }
    add(correct, false);
    if (!items.length) throw new Error('正確答案格式錯誤');
    for (const w of wrongs) {
      if (items.length >= 4) break;
      add(w, true);
    }
    if (items.length < 4) throw new Error('錯誤選項不夠：' + items.map((it) => JSON.stringify(it.t)).join(' | '));
    const right = items[0];
    const list =
      !o.shuffle && items.every((it) => Number.isFinite(it.val))
        ? items.slice().sort((a, b) => a.val - b.val || a.len - b.len)
        : H.sample(items, 4);
    const at = list.indexOf(right);
    const q = (Array.isArray(stem) ? stem : [stem]).concat([{ opts: list.map((it) => it.t) }]);
    const out = { q, a: [CIRC[at] + ' '].concat(right.t) };
    if (o.raw) out.raw = true;
    return out;
  }

  /** 每一位相加不進位（E1） */
  function noCarryAdd(a, b) {
    let out = 0;
    let p = 1;
    for (let x = a, y = b; x || y; x = Math.floor(x / 10), y = Math.floor(y / 10)) {
      out += ((x % 10) + (y % 10)) % 10 * p;
      p *= 10;
    }
    return out;
  }

  /** 每一位大減小、不退位（E1） */
  function noBorrowSub(a, b) {
    let out = 0;
    let p = 1;
    for (let x = a, y = b; x || y; x = Math.floor(x / 10), y = Math.floor(y / 10)) {
      out += Math.abs((x % 10) - (y % 10)) * p;
      p *= 10;
    }
    return out;
  }

  /** 每一位乘完直接接起來（E2），例如 476 × 5 → 203530 */
  const concatMul = (a, b) => Number(digits(a).map((d) => d * b).join(''));
  /** 每一位乘完只寫個位、不進位（E1） */
  const noCarryMul = (a, b) => Number(digits(a).map((d) => (d * b) % 10).join(''));

  /** 從清單挑一個不等於 except 的數 */
  function pickNot(list, except) {
    return pick(list.filter((x) => !except.includes(x)));
  }

  /** 重複產生直到 ok 成立（避免出到不合適的數字） */
  function until(make, ok) {
    for (let i = 0; i < 2000; i++) {
      const v = make();
      if (ok(v)) return v;
    }
    throw new Error('找不到合適的數字');
  }

  /** 「幾公升幾毫升」這類複名數文字 */
  function compound(total, size, big, small) {
    const a = Math.floor(total / size);
    const b = total % size;
    if (!a) return V(b + ' ' + small, total);
    return V(b ? a + ' ' + big + ' ' + b + ' ' + small : a + ' ' + big, total);
  }

  /** 「X萬Y」 */
  function wan(x, y) {
    return V(y ? x + '萬' + y : x + '萬', x * 10000 + y);
  }

  /** 「商是 X，餘數是 Y」 */
  const qr = (q, rem) => V('商是 ' + q + '，餘數是 ' + rem, q + rem / 100000);

  /** 小數取概數：place 位小數，mode 'round'／'floor'／'ceil' */
  function roundTo(x, place, mode) {
    const p = Math.pow(10, place);
    const n = dec(x * p, 6);
    const v = mode === 'floor' ? Math.floor(n) : mode === 'ceil' ? Math.ceil(n) : Math.round(n);
    return dec(v / p, place);
  }

  /** 小數固定位數的文字（保留末尾 0，例如 3.40） */
  const fixed = (x, place) => V(x.toFixed(place), x);

  /* ---------------- 3 年級 ---------------- */

  const G3 = [
    // N-3-1 位值換算：幾個千、幾個百、幾個十合起來
    () => {
      const a = r(1, 8);
      const b = r(10, 19);
      const c = r(1, 9);
      const ok = a * 1000 + b * 100 + c * 10;
      return choice(
        '請問 ' + a + ' 個千、' + b + ' 個百和 ' + c + ' 個十合起來是多少？',
        ok,
        [Number('' + a + b + c), Number('' + a + b + c + '0'), a * 1000 + (b % 10) * 100 + c * 10, ok + 1000]
      );
    },
    // N-3-1 某一位的數字代表幾個百（幾個十）
    () => {
      const d = r(2, 9);
      const others = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      const n = d * 1000 + pickNot(others, [d]) * 100 + pickNot(others, [d]) * 10 + pickNot(others, [d]);
      const [name, size] = pick([
        ['百', 100],
        ['十', 10],
      ]);
      const ok = (d * 1000) / size;
      return choice(
        '請問 ' + n + ' 的「' + d + '」所代表的數，可以換成多少個' + name + '？',
        ok,
        [d, Math.floor(n / size), ok * 10, ok / 10, d * 1000, d * 10],
        { unit: ' 個' }
      );
    },
    // N-3-2 四位數加法連續進位
    () => {
      const [a, b] = until(
        () => {
          const x = r(1000, 7999);
          return [x, r(300, 9999 - x)];
        },
        ([x, y]) => noCarryAdd(x, y) !== x + y && x + y >= 1000
      );
      const ok = a + b;
      return choice('算算看，' + a + ' ＋ ' + b + ' ＝ ？', ok, [noCarryAdd(a, b), ok - 1000, ok - 100, ok + 10, ok + 1000]);
    },
    // N-3-2 四位數減法連續退位（被減數常是整千）
    () => {
      const [a, b] = until(
        () => {
          const x = pick([r(2, 10) * 1000, r(2, 9) * 1000 + r(0, 9) * 10, r(2, 9) * 1000 + r(1, 9)]);
          return [x, r(100, x - 100)];
        },
        ([x, y]) => noBorrowSub(x, y) !== x - y
      );
      const ok = a - b;
      const story = pick([
        ['算算看，' + a + ' － ' + b + ' ＝ ？', ''],
        ['哥哥買了一組 ' + b + ' 元的玩具，付了 ' + a + ' 元，找回多少元？', ' 元'],
      ]);
      return choice(story[0], ok, [noBorrowSub(a, b), ok + 1000, ok - 100, ok + 10, ok + 100], { unit: story[1] });
    },
    // N-3-3 三位數乘一位數（可能中間有 0）
    () => {
      const b = r(3, 9);
      const a = Math.random() < 0.35 ? r(1, 9) * 100 + r(1, 9) : r(102, 989);
      const ok = a * b;
      const story = pick([
        ['算算看，' + a + ' × ' + b + ' ＝ ？', ''],
        ['一本故事書賣 ' + a + ' 元，學校買了 ' + b + ' 本，共要付多少元？', ' 元'],
        ['月餅一盒裝 ' + b + ' 個，' + a + ' 盒共有幾個月餅？', ' 個'],
      ]);
      return choice(story[0], ok, [concatMul(a, b), noCarryMul(a, b), ok - 100, ok + 100, ok - b * 10], { unit: story[1] });
    },
    // N-3-4 有餘數的分裝、平分應用題
    () => {
      const b = r(3, 9);
      const q = until(() => r(3, 9), (x) => x !== b);
      const rem = r(1, b - 1);
      const n = q * b + rem;
      const story = pick([
        [
          '有 ' + n + ' 顆蘋果，每 ' + b + ' 顆裝成 1 盒，最多可以裝成多少盒？還剩下多少顆？',
          (x, y) => '最多可以裝成 ' + x + ' 盒，剩下 ' + y + ' 顆',
        ],
        [
          '把 ' + n + ' 張貼紙平分給 ' + b + ' 個小朋友，每人最多可以分到多少張？還剩下多少張？',
          (x, y) => '每人分到 ' + x + ' 張，剩下 ' + y + ' 張',
        ],
        [
          '有 ' + n + ' 個人，每 ' + b + ' 個人排成一排，最多可以排成多少排？還剩下多少個人？',
          (x, y) => '最多可以排成 ' + x + ' 排，剩下 ' + y + ' 個人',
        ],
      ]);
      const o = (x, y) => V(story[1](x, y), x + y / 1000);
      return choice(story[0], o(q, rem), [o(q - 1, rem + b), o(rem, q), o(q + 1, rem), o(q, b), o(b, rem)]);
    },
    // N-3-5 三位數除以一位數，商的十位是 0（E3）
    () => {
      const [a, b, q, rem] = until(
        () => {
          const y = r(2, 9);
          const qq = r(1, 9) * 100 + r(0, 9);
          const rr = r(0, y - 1);
          return [qq * y + rr, y, qq, rr];
        },
        ([x]) => x <= 999
      );
      const h = Math.floor(q / 100);
      const o = q % 10;
      return choice('算算看，「' + a + ' ÷ ' + b + '」的商和餘數各是多少？', qr(q, rem), [
        qr(h * 10 + o, rem),
        qr(h * 100 + o * 10, rem),
        qr(h, a % 100),
        qr(q, rem + b),
      ]);
    },
    // N-3-7 兩步驟應用題：連乘
    () => {
      const [p, k, m] = until(() => [r(6, 15), r(3, 10), r(2, 9)], ([x, y, z]) => x * y * z <= 1000 && x !== z);
      const ok = p * k * m;
      const thing = pick([
        ['色紙', '張', '包', '袋'],
        ['巧克力', '顆', '包', '盒'],
        ['卡片', '張', '包', '盒'],
      ]);
      return choice(
        '一' + thing[2] + thing[0] + '有 ' + p + ' ' + thing[1] + '，一' + thing[3] + '有 ' + k + ' ' + thing[2] + '，' + m + ' ' + thing[3] + '共有多少' + thing[1] + thing[0] + '？',
        ok,
        [p * k, p * m, p + k + m, p * k + m, k * m],
        { unit: ' ' + thing[1] }
      );
    },
    // N-3-7 兩步驟應用題：先除再減、先減再除、先加再除
    () => {
      const kind = r(0, 2);
      if (kind === 0) {
        const b = r(4, 9);
        const t = r(10, 40);
        const s = r(2, t - 2);
        return choice(
          '麵包店烤了 ' + b * t + ' 個餐包，每 ' + b + ' 個裝一袋，全部裝完後賣掉 ' + s + ' 袋，還剩下多少袋？',
          t - s,
          [t, b * t - s, t + s, s, b * (t - s)],
          { unit: ' 袋' }
        );
      }
      if (kind === 1) {
        const k = r(3, 9);
        const e = r(3, 9);
        const c = r(20, 70);
        const m = c + k * e;
        return choice(
          '弟弟有 ' + m + ' 元，買了 1 個 ' + c + ' 元的鉛筆盒後，剩下的錢剛好可以買 ' + k + ' 塊橡皮擦，1 塊橡皮擦是多少元？',
          e,
          [m - c, k, Math.floor(m / k), e + k, m, e * 2, c],
          { unit: ' 元' }
        );
      }
      const k = r(3, 6);
      const e = r(20, 60);
      const boys = r(Math.floor(k * e * 0.4), Math.floor(k * e * 0.6));
      return choice(
        '男生有 ' + boys + ' 人，女生有 ' + (k * e - boys) + ' 人，把男生、女生合起來再平分成 ' + k + ' 組，每組有多少人？',
        e,
        [k * e, Math.floor(boys / k), e * 2, e + k, boys],
        { unit: ' 人' }
      );
    },
    // N-3-8 估算：接近整百的價錢乘一位數
    () => {
      const hundreds = r(1, 4);
      const p = hundreds * 100 - pick([1, 2]);
      const n = r(3, 9);
      const ok = hundreds * 100 * n;
      return choice(
        '一件上衣特價 ' + p + ' 元，老師買了 ' + n + ' 件。' + n + ' 件上衣的價錢最接近下列哪個選項？',
        ok,
        [hundreds * 100, n * 100, ok - 100, ok + 100, ok - 200],
        { unit: ' 元' }
      );
    },
    // N-3-8 估算：四位數加減取整千
    () => {
      const near = (k) => k * 1000 + pick([-1, 1]) * r(1, 12);
      const add = Math.random() < 0.5;
      const [A, B] = add ? until(() => [r(1, 5), r(1, 4)], ([x, y]) => x + y <= 8) : until(() => [r(3, 9), r(1, 5)], ([x, y]) => x - y >= 2);
      const a = near(A);
      const b = near(B);
      const ok = (add ? A + B : A - B) * 1000;
      const stem = add ? '「' + a + ' ＋ ' + b + '」的答案最接近哪個選項？' : '「' + a + ' － ' + b + '」的答案最接近哪個選項？';
      return choice(stem, ok, [ok - 1000, ok + 1000, ok + 2000, ok - 2000]);
    },
    // N-3-9 同分母分數加法（E7：分子分母各自相加）
    () => {
      const d = r(5, 12);
      const [a, b] = until(() => [r(1, d - 1), r(1, d - 1)], ([x, y]) => x !== y && x + y !== d);
      const thing = pick(['個蛋糕', '條緞帶', '盒果凍']);
      return choice(
        ['請問 ', F(a, d), ' ' + thing + '和 ', F(b, d), ' ' + thing + '合起來是多少' + thing + '？'],
        F(a + b, d),
        [F(a + b, d + d), F(Math.abs(b - a), d), F(Math.abs(b - a), d + d), a + b],
        { unit: ' ' + thing[0] }
      );
    },
    // N-3-9 幾分之幾盒是幾個；幾個是幾分之幾盒
    () => {
      const d = r(5, 12);
      if (Math.random() < 0.5) {
        const n = r(2, d - 1);
        return choice(['一盒蘋果有 ' + d + ' 顆，', F(n, d), ' 盒蘋果有多少顆？'], n, [F(n, d), d, d + n, d - n], { unit: ' 顆' });
      }
      const n = until(() => r(2, d + 6), (x) => x !== d && x !== d * 2);
      return choice('一盒餅乾有 ' + d + ' 片，' + n + ' 片餅乾是多少盒？', F(n, d), [F(1, d), F(d, n), F(n, d + n), n], { unit: ' 盒' });
    },
    // N-3-9 單位分數比大小
    () => {
      const d = r(5, 12);
      if (Math.random() < 0.5) {
        return choice(['下面哪個分數比 ', F(1, d), ' 小？'], F(1, d + 1), [F(1, d - 1), F(1, d - 2), F(1, d - 3)]);
      }
      return choice(['下面哪個分數比 ', F(1, d), ' 大？'], F(1, d - 1), [F(1, d + 1), F(1, d + 2), F(1, d + 3)]);
    },
    // N-3-15、16 公升毫升、公斤公克：化成小單位（E4）
    () => {
      const [big, small] = pick([
        ['公升', '毫升'],
        ['公斤', '公克'],
      ]);
      const x = r(2, 9);
      const y = pick([r(1, 9), r(1, 9) * 10]);
      const ok = x * 1000 + y;
      return choice(
        '請問 ' + x + ' ' + big + ' ' + y + ' ' + small + '和多少' + small + '一樣多？',
        ok,
        [Number('' + x + y), x * 100 + y, x * 10000 + y, x * 1000 + y * 10, y % 10 === 0 ? x * 1000 + y / 10 : null],
        { unit: ' ' + small }
      );
    },
    // N-3-15、16 毫升化成公升毫升、公克化成公斤公克
    () => {
      const [big, small] = pick([
        ['公升', '毫升'],
        ['公斤', '公克'],
      ]);
      const x = r(2, 9);
      const y = pick([r(1, 9), r(1, 9) * 10]);
      const n = x * 1000 + y;
      const c = (t) => compound(t, 1000, big, small);
      return choice('「' + n + ' ' + small + '」和多少' + big + '多少' + small + '一樣多？', c(n), [
        c(x * 1000 + y * 10),
        y % 10 === 0 ? c(x * 1000 + y / 10) : c(x * 1000 + y * 100),
        V(x * 10 + ' ' + big + ' ' + y + ' ' + small, x * 10000 + y),
        c(x * 1000 + y + 100),
      ]);
    },
    // N-3-16 複名數相加，公克超過 1000 要換算
    () => {
      const a = r(1, 6);
      const b = r(10, 90);
      const g = until(() => r(1050, 1890), (x) => b + (x % 1000) < 1000 && x % 10 === 0);
      const c = (t) => compound(t, 1000, '公斤', '公克');
      const ok = a * 1000 + b + g;
      return choice(
        '一袋米重 ' + a + ' 公斤 ' + b + ' 公克，一袋紅豆重 ' + g + ' 公克，合起來重多少公斤多少公克？',
        c(ok),
        [c(a * 1000 + b + g - 1000), c(ok + 100), c((a + Math.floor(g / 100)) * 1000 + b), c(ok - 100)]
      );
    },
    // R-3-2 數列規律：每次多（少）10 或 100，跨過整百或整千
    () => {
      const step = pick([10, 100]);
      const k = step === 10 ? r(12, 98) : r(2, 9);
      const down = Math.random() < 0.5;
      const big = step * 10;
      const t3 = down ? k * big : k * big - step;
      const terms = [3, 2, 1, 0].map((i) => (down ? t3 + i * step : t3 - i * step));
      const next = down ? t3 - step : t3 + step;
      return choice('「' + terms.join(' → ') + ' → （　）」，請問（　）內應填入哪個數？', next, [
        terms[1],
        next + 1,
        next - 1,
        down ? next + step * 2 : next - step * 2,
      ]);
    },
    // S-3-2 正方形周長的算式（E11：周長和面積混淆）
    () => {
      const s = r(6, 25);
      const o = (expr, v) => expr + ' ＝ ' + v + '，答：' + v + ' 公分';
      return choice(
        '「一張正方形色紙，邊長是 ' + s + ' 公分，這張色紙的周長是多少公分？」下列哪個算式和答案都正確？',
        o(s + ' × 4', s * 4),
        [o(s + ' × ' + s, s * s), o(s + ' ＋ 4', s + 4), o(s + ' ＋ ' + s, s * 2)],
        { shuffle: true }
      );
    },
    // S-3-3 圓規張開的距離就是半徑（E11：半徑和直徑混淆）
    () => {
      if (Math.random() < 0.5) {
        const rr = r(2, 8) * 2;
        return choice('圓規兩腳張開 ' + rr + ' 公分畫一個圓，這個圓的半徑是多少公分？', rr, [rr * 2, rr / 2, rr * 4, rr / 4], {
          unit: ' 公分',
        });
      }
      const d = r(3, 8) * 2;
      return choice('畫一個直徑 ' + d + ' 公分的圓，圓規的筆尖與針尖要張開多少公分？', d / 2, [d, d * 2, d / 4, d + 2], {
        unit: ' 公分',
      });
    },
  ];

  /* ---------------- 4 年級 ---------------- */

  const G4 = [
    // N-4-1 以萬為單位的加法，萬以下滿 1 萬要進位
    () => {
      const a = r(100, 699);
      const c = r(10, 299);
      const b = r(1000, 9999);
      const d = r(10000 - b, 9999);
      const low = b + d - 10000;
      return choice('算算看，' + a + '萬' + b + ' ＋ ' + c + '萬' + d + ' ＝ ？', wan(a + c + 1, low), [
        wan(a + c, low),
        low + 1000 < 10000 ? wan(a + c + 1, low + 1000) : wan(a + c + 2, low),
        wan(a + c + 10, low),
        wan(a + c - 1, low),
      ]);
    },
    // N-4-1 以萬為單位的減法，萬以下不夠減要借 1 萬
    () => {
      const c = r(10, 299);
      const a = r(c + 2, c + 500);
      const b = r(100, 4999);
      const d = r(b + 1, 9999);
      const low = b + 10000 - d;
      return choice('算算看，' + a + '萬' + b + ' － ' + c + '萬' + d + ' ＝ ？', wan(a - c - 1, low), [
        wan(a - c, d - b),
        wan(a - c, low),
        wan(a - c - 1, d - b),
        wan(a - c + 1, low),
        wan(a - c - 2, low),
      ]);
    },
    // N-4-2 末尾有 0 的乘法（E4：0 的個數錯）
    () => {
      const a = pick([r(12, 99), r(2, 9) * 100 + r(1, 9) * 10, r(2, 9) * 100 + r(1, 9)]) * Math.pow(10, r(1, 2));
      const b = pick([r(2, 9), r(12, 56)]) * Math.pow(10, r(1, 2));
      const ok = a * b;
      return choice('算算看，' + a + ' × ' + b + ' ＝ ？', ok, [ok / 10, ok * 10, ok / 100, ok * 100]);
    },
    // N-4-2 二位數乘三位數，乘數中間有 0
    () => {
      const a = r(13, 79);
      const h = r(1, 9);
      const o = r(1, 9);
      const b = h * 100 + o;
      const ok = a * b;
      return choice('算算看，' + a + ' × ' + b + ' ＝ ？', ok, [a * (h * 10 + o), ok * 10, ok + a * 100, ok - a * 100]);
    },
    // N-4-2 四位數除以二位數，商有 0（E3）
    () => {
      const [n, b, q, rem] = until(
        () => {
          const y = r(12, 49);
          const h = r(1, 9);
          const t = r(1, 9);
          const qq = Math.random() < 0.5 ? h * 100 + t : h * 100 + t * 10;
          const rr = r(1, y - 1);
          return [qq * y + rr, y, qq, rr];
        },
        ([x]) => x >= 1000 && x <= 9999
      );
      const h = Math.floor(q / 100);
      const rest = q % 100;
      const two = rest < 10 ? h * 10 + rest : h * 10 + rest / 10;
      const swapped = rest < 10 ? h * 100 + rest * 10 : h * 100 + rest / 10;
      return choice('請問「' + n + ' ÷ ' + b + '」的商和餘數各是多少？', qr(q, rem), [qr(two, rem), qr(swapped, rem), qr(q, rem + b), qr(q + 10, rem)]);
    },
    // R-4-1 先乘除後加減（E8：由左往右算）
    () => {
      const kind = r(0, 3);
      if (kind === 0) {
        const [a, b, c] = until(() => [r(30, 120), r(2, 9), r(3, 12)], ([x, y, z]) => x > y * z && (x - y) * z > 0);
        return choice('算算看，' + a + ' － ' + b + ' × ' + c + ' ＝ ？', a - b * c, [b * c, a - b, (a - b) * c, a - b - c]);
      }
      if (kind === 1) {
        const [a, b, c] = until(() => [r(12, 99), r(2, 9), r(2, 9)], ([x]) => x > 10);
        return choice('算算看，' + a + ' ＋ ' + b + ' × ' + c + ' ＝ ？', a + b * c, [(a + b) * c, a + b, b * c, a * b + c]);
      }
      const c = r(2, 9);
      const k = r(2, 9);
      const b = c * k;
      const a = until(() => r(b + 1, 120), (x) => (x + b) % c === 0 || (x - b) % c === 0);
      if (kind === 2) {
        return choice('算算看，' + a + ' ＋ ' + b + ' ÷ ' + c + ' ＝ ？', a + k, [isInt((a + b) / c) ? (a + b) / c : null, a + b, k, a + b * c, a]);
      }
      return choice('算算看，' + a + ' － ' + b + ' ÷ ' + c + ' ＝ ？', a - k, [
        isInt((a - b) / c) && a > b ? (a - b) / c : null,
        a - b,
        k,
        a + k,
        a,
      ]);
    },
    // R-4-1 兩步驟問題選併式
    () => {
      const kind = r(0, 3);
      let stem;
      let ok;
      let wrongs;
      if (kind === 0) {
        const p = r(45, 199);
        const n = r(2, 6);
        const m = until(() => pick([500, 1000, 2000]), (x) => x > p * n);
        stem = '「漫畫 1 本 ' + p + ' 元，哥哥買了 ' + n + ' 本，付了 ' + m + ' 元，可以找回多少元？」下列哪個算式可以算出正確答案？';
        ok = m + ' － ' + p + ' × ' + n;
        wrongs = [p + ' × ' + n + ' － ' + m, m + ' － ' + p, p + ' × ' + n];
      } else if (kind === 1) {
        const k = r(2, 5);
        const per = r(20, 60);
        const e = r(5, per - 5);
        stem = '「' + k + ' 箱奇異果有 ' + k * per + ' 個，媽媽買 1 箱，吃掉 ' + e + ' 個，還剩下多少個奇異果？」下面哪個算式能算出正確的答案？';
        ok = k * per + ' ÷ ' + k + ' － ' + e;
        wrongs = [k * per + ' － ' + e + ' × ' + k, k * per + ' × ' + k + ' － ' + e, k * per + ' ÷ ' + k + ' ＋ ' + e];
      } else if (kind === 2) {
        const x = r(3, 9) * 10;
        const y = r(1, 5) * 10;
        const n = r(3, 9);
        stem = '「一個漢堡 ' + x + ' 元，一個薯餅 ' + y + ' 元，各買 ' + n + ' 個共要付幾元？」下列哪個算式能算出正確答案？';
        ok = '(' + x + ' ＋ ' + y + ') × ' + n;
        wrongs = [x + ' ＋ ' + y + ' × ' + n, '(' + x + ' ＋ ' + y + ') ÷ ' + n, x + ' × ' + y + ' × ' + n];
      } else {
        const s = pick([4, 5, 8, 10]);
        const p = s * r(3, 10);
        const n = r(2, 6);
        stem = '「一包餅乾有 ' + p + ' 片。老師買了 ' + n + ' 包，平分給 ' + s + ' 位學生，每位學生可以分到多少片餅乾？」下列哪個算式可以算出正確的答案？';
        ok = p + ' × ' + n + ' ÷ ' + s;
        wrongs = [p + ' × ' + n + ' × ' + s, p + ' ÷ ' + n + ' × ' + s, p + ' ÷ ' + n + ' ÷ ' + s];
      }
      return choice(stem, ok, wrongs, { shuffle: true });
    },
    // R-4-2 連乘的結合律：選「無法算出正確答案」的算式
    () => {
      const a = r(12, 25);
      const b = pick([4, 5, 8]);
      const c = r(6, 12);
      return choice(
        '「' + a + ' 顆珠子裝成一包，' + b + ' 包裝成一盒，' + c + ' 盒裝成一箱，一箱有多少顆珠子？」請問下列哪個算式無法算出正確的答案？',
        '(' + a + ' ＋ ' + b + ') × ' + c,
        [a + ' × ' + b + ' × ' + c, '(' + a + ' × ' + b + ') × ' + c, a + ' × (' + b + ' × ' + c + ')'],
        { shuffle: true }
      );
    },
    // N-4-3 兩步驟（連除、先乘再除）（E9：只做一步）
    () => {
      const kind = r(0, 2);
      if (kind === 0) {
        const b = r(4, 9);
        const c = r(3, 6);
        const k = r(2, 9);
        const n = b * c * k;
        return choice(
          '有 ' + n + ' 顆蘋果，' + b + ' 顆裝成 1 盒，再把 ' + c + ' 盒裝成 1 箱，全部裝完，共裝成多少箱？',
          k,
          [n / b, n / c, b * c, n, k + b],
          { unit: ' 箱' }
        );
      }
      if (kind === 1) {
        const [p, n, s] = until(() => [r(6, 24), r(2, 6), r(3, 8)], ([x, y, z]) => (x * y) % z === 0 && x * y > z);
        return choice(
          '一盒巧克力有 ' + p + ' 顆，老師買了 ' + n + ' 盒，平分給 ' + s + ' 位學生，每位學生可以分到多少顆巧克力？',
          (p * n) / s,
          [p * n, p * n * s, p, isInt(p / s) ? p / s : null, n * s, p + n],
          { unit: ' 顆' }
        );
      }
      const a = r(2, 5);
      const b = r(2, 6);
      const k = r(3, 12);
      return choice(
        '園遊會準備了 ' + a * b * k + ' 個氣球，先平分給 ' + a + ' 個班，每個班再把分到的氣球平分給 ' + b + ' 個小組，每個小組可以分到多少個氣球？',
        k,
        [b * k, a * k, a * b * k, a * b, k + a],
        { unit: ' 個' }
      );
    },
    // N-4-4 四捨五入到萬位；付千元鈔票要無條件進位（E12）
    () => {
      if (Math.random() < 0.5) {
        const n = r(1000000, 9899999);
        const ok = Math.round(n / 10000);
        const other = Math.round(n / 10000) === Math.floor(n / 10000) ? Math.ceil(n / 10000) : Math.floor(n / 10000);
        const big = Math.round(n / 100000);
        const w = (x) => V(x + ' 萬', x);
        return choice('用四捨五入法將 ' + n + ' 取概數到萬位是多少？', w(ok), [w(other === ok ? ok + 1 : other), w(big), w(big + 1), w(ok * 10)]);
      }
      const n = until(() => r(12001, 89999), (x) => x % 1000 !== 0 && x % 1000 < 500);
      const ok = Math.ceil(n / 1000);
      return choice(
        '一臺電視機賣 ' + n + ' 元，全部用千元鈔票付款，最少要付多少張？',
        ok,
        [Math.floor(n / 1000), Math.ceil(n / 10000) * 10, Math.floor(n / 10000) * 10, ok + 1],
        { unit: ' 張' }
      );
    },
    // N-4-5 帶分數化成假分數
    () => {
      const d = r(3, 9);
      const w = r(2, 5);
      const n = r(1, d - 1);
      const thing = pick(['張蔥油餅', '個披薩', '盒蛋糕']);
      return choice(
        ['請問 ', M(w, n, d), ' ' + thing + '也可以說是多少' + thing + '？'],
        F(w * d + n, d),
        [F(w + n, d), F(w * n, d), F(w * 10 + n, d), F(w * d, d)]
      );
    },
    // N-4-5 假分數化成帶分數
    () => {
      const d = r(3, 9);
      const q = r(2, 6);
      const k = r(1, d - 1);
      const n = q * d + k;
      return choice(['下面哪個分數和 ', F(n, d), ' 一樣大？'], M(q, k, d), [
        M(q + 1, k, d),
        M(q, d - k, d),
        M(q - 1, k, d),
        M(k, q, d),
        M(q, k, d + 1),
        M(q, k + 1, d),
      ]);
    },
    // N-4-5 帶分數相減要退位
    () => {
      const d = r(4, 9);
      const [n1, n2] = until(() => [r(1, d - 1), r(1, d - 1)], ([x, y]) => x < y);
      const w2 = r(1, 4);
      const w1 = w2 + r(2, 5);
      return choice(
        ['算算看，', M(w1, n1, d), ' － ', M(w2, n2, d), ' ＝ ？'],
        M(w1 - w2 - 1, n1 + d - n2, d),
        [
          M(w1 - w2, n2 - n1, d),
          M(w1 - w2, n1 + d - n2, d),
          M(w1 - w2 - 1, n2 - n1, d),
          M(w1 - w2 + 1, n2 - n1, d),
          M(w1 - w2 - 2, n1 + d - n2, d),
        ]
      );
    },
    // N-4-5 帶分數乘以整數（E1：分數部分滿 1 沒有進位）
    () => {
      const d = r(3, 9);
      const [w, n, k] = until(() => [r(1, 4), r(1, d - 1), r(3, 5)], ([, y, z]) => y * z > d && (y * z) % d !== 0);
      return choice(
        ['一桶水重 ', M(w, n, d), ' 公斤，' + k + ' 桶水共重多少公斤？'],
        MX((w * d + n) * k, d),
        [
          M(w * k, n, d),
          M(w * k, (n * k) % d, d),
          M(w + k, n, d),
          M(w * k + Math.floor((n * k) / d), n, d),
          M(w * k + Math.floor((n * k) / d) + 1, (n * k) % d, d),
          M(w * k - 1, (n * k) % d, d),
        ],
        { unit: ' 公斤' }
      );
    },
    // N-4-5 離散量：幾個是幾盒
    () => {
      const [d, name, unit] = pick([
        [12, '一打鉛筆有 12 枝', '枝'],
        [10, '一盒糖果有 10 顆', '顆'],
        [8, '一包糖果有 8 顆', '顆'],
      ]);
      const n = until(() => r(d + 1, d * 3 - 1), (x) => x % d !== 0);
      const box = d === 12 ? '打' : name[1];
      return choice(name + '，' + n + ' ' + unit + '是多少' + box + '？', MX(n, d), [F(d, n), M(Math.floor(n / d), n % d, n), n, F(n % d, d)], {
        unit: ' ' + box,
      });
    },
    // N-4-7 幾個 0.01、0.1、1 合起來（E1、E4）
    () => {
      const a = r(1, 9);
      const b = r(10, 19);
      const c = r(1, 9);
      const ok = dec(c + b / 10 + a / 100, 2);
      return choice(
        '「' + a + ' 個 0.01，' + b + ' 個 0.1，' + c + ' 個 1」合起來是多少？',
        ok,
        [
          dec(c + (b % 10) / 10 + a / 100, 2),
          dec(a + (b % 10) / 10 + c / 100, 2),
          dec(ok + 1, 2),
          dec(a + b / 10 + c / 100, 2),
          dec(ok + 0.1, 2),
          dec(ok - 1, 2),
        ]
      );
    },
    // N-4-7 二位小數相減（E1）
    () => {
      const [A, B] = until(() => [r(150, 899), r(110, 799)], ([x, y]) => x > y + 20 && noBorrowSub(x, y) !== x - y);
      const ok = (A - B) / 100;
      return choice(
        '公園的步道全長 ' + A / 100 + ' 公里，芊芊已經走了 ' + B / 100 + ' 公里，還剩下多少公里就可以走完整條步道？',
        ok,
        [(A + B) / 100, noBorrowSub(A, B) / 100, dec(ok + 0.1, 2), dec(ok + 1, 2)],
        { unit: ' 公里' }
      );
    },
    // N-4-9 公里公尺複名數乘以整數
    () => {
      const [x, y, n] = until(() => [r(1, 4), r(1, 9) * pick([10, 50]), r(3, 6)], ([, b, k]) => b * k >= 1000 || Math.random() < 0.3);
      const t = (x * 1000 + y) * n;
      const c = (v) => compound(v, 1000, '公里', '公尺');
      return choice('算算看，' + x + ' 公里 ' + y + ' 公尺 × ' + n + ' ＝ ？', c(t), [
        c(x * n * 1000 + y),
        c(x * n * 1000 + ((y * n) % 1000)),
        c(t + 1000),
        c(t - 1000),
        c(t + 100),
        c(t - 100),
      ]);
    },
    // N-4-9 公里公尺化成公尺（E4）
    () => {
      const x = r(2, 30);
      const y = pick([r(1, 9), r(10, 90)]);
      const ok = x * 1000 + y;
      return choice('「' + x + ' 公里 ' + y + ' 公尺」也可以說是多少公尺？', ok, [Number('' + x + y), x * 100 + y, x * 1000 + y * 10, x * 10000 + y], {
        unit: ' 公尺',
      });
    },
    // N-4-11 平方公尺換平方公分（E4）
    () => {
      const a = r(2, 12);
      return choice('「' + a + ' 平方公尺 ＝（　）平方公分」，（　）內應填入哪個數？', a * 10000, [a * 100, a * 1000, a * 100000]);
    },
    // S-4-2 時針、分針旋轉的角度
    () => {
      if (Math.random() < 0.5) {
        const k = r(1, 5);
        const h1 = r(1, 12);
        const h2 = ((h1 + k - 1) % 12) + 1;
        return choice('鐘面上的時針從數字 ' + h1 + ' 旋轉到數字 ' + h2 + '，旋轉了多少度？', k * 30, [k * 10, k * 5, k * 60, 90], { unit: ' 度' });
      }
      const m = pick([5, 10, 15, 20, 25, 30, 40, 45]);
      const h = r(1, 11);
      return choice('從 ' + h + ' 時到 ' + h + ' 時 ' + m + ' 分，分針旋轉了多少度？', m * 6, [m, m * 2, m * 12, m * 3], { unit: ' 度' });
    },
    // S-4-3 面積與單位（E11：周長和面積混淆）
    () => {
      const square = Math.random() < 0.4;
      const [a, b] = square
        ? until(() => {
            const s = r(3, 12);
            return [s, s];
          }, ([s]) => s !== 4)
        : until(() => [r(5, 15), r(2, 9)], ([x, y]) => x > y && x * y !== 2 * (x + y));
      const per = 2 * (a + b);
      const area = a * b;
      const stem = square
        ? '有一個正方形，邊長是 ' + a + ' 公尺，它的面積是多少？'
        : '長方形的長是 ' + a + ' 公尺、寬是 ' + b + ' 公尺，請問長方形的面積是多少？';
      return choice(stem, V(area + ' 平方公尺', area), [V(area + ' 公尺', area), V(per + ' 平方公尺', per), V(per + ' 公尺', per)], {
        allowEqual: true,
      });
    },
    // S-4-3 由周長求正方形邊長再求面積；長方形周長算式
    () => {
      if (Math.random() < 0.5) {
        const s = until(() => r(3, 12), (x) => x !== 4);
        const L = s * 4;
        return choice('用一條長 ' + L + ' 公分的鐵絲，剛好圍成一個正方形。這個正方形的面積是多少平方公分？', s * s, [L, L * 4, L * L, s]);
      }
      const a = r(5, 15);
      const b = r(2, a - 1);
      return choice(
        '長方形的長是 ' + a + ' 公分、寬是 ' + b + ' 公分，請問哪個算式可以算出長方形的周長是多少公分？',
        '(' + a + ' ＋ ' + b + ') × 2',
        [a + ' × ' + b, a + ' ＋ ' + b, a + ' ＋ ' + b + ' × 2'],
        { shuffle: true }
      );
    },
  ];

  /* ---------------- 5 年級 ---------------- */

  /** 小數四捨五入（5、6 年級共用） */
  function decimalRound(place) {
    return () => {
      const p = place || pick([1, 2]);
      const [x, ok] = until(
        () => {
          const v = dec(r(1, 60) + r(1, 9999) / 10000, 4);
          return [v, roundTo(v, p, 'round')];
        },
        ([v, o]) => !o.toFixed(p).endsWith('0') && roundTo(v, p, 'floor') !== roundTo(v, p, 'ceil')
      );
      const other = roundTo(x, p, ok === roundTo(x, p, 'floor') ? 'ceil' : 'floor');
      const word = p === 1 ? '一' : '二';
      return choice('用四捨五入法將「' + x.toFixed(4).replace(/0+$/, '') + '」取概數到小數點後第' + word + '位，結果是多少？', fixed(ok, p), [
        fixed(other, p),
        fixed(roundTo(x, p + 1, 'round'), p + 1),
        fixed(roundTo(x, p + 1, 'floor'), p + 1),
        fixed(roundTo(x, p + 1, 'ceil'), p + 1),
        p === 2 ? fixed(roundTo(x, 1, 'round'), 1) : fixed(roundTo(x, 0, 'round'), 0),
        fixed(roundTo(x, p + 2, 'round'), p + 2),
      ]);
    };
  }

  const G5 = [
    // N-5-2 三步驟找錢問題選併式（E8：括號位置）
    () => {
      if (Math.random() < 0.5) {
        const p = r(6, 19) * 5;
        const d = r(2, Math.floor(p / 5) - 1) * 2;
        const n = r(2, 5);
        const m = until(() => pick([500, 1000]), (x) => x > (p - d) * n);
        return choice(
          '「一瓶鮮奶原價 ' + p + ' 元，今天特價便宜 ' + d + ' 元。媽媽買了 ' + n + ' 瓶鮮奶，付了 ' + m + ' 元，可以找回多少元？」下列哪個算式可以算出正確答案？',
          m + ' － (' + p + ' － ' + d + ') × ' + n,
          ['(' + p + ' － ' + d + ') × ' + n + ' － ' + m, m + ' － ' + p + ' － ' + d + ' × ' + n, m + ' － (' + p + ' － ' + d + ' × ' + n + ')'],
          { shuffle: true }
        );
      }
      const a = r(25, 80);
      const b = r(15, 45);
      const n = r(3, 6);
      const m = until(() => pick([500, 1000]), (x) => x > a * n + b);
      return choice(
        '「麵包 1 個 ' + a + ' 元、飲料 1 瓶 ' + b + ' 元。小明有 ' + m + ' 元，買了 ' + n + ' 個麵包和 1 瓶飲料後，還剩下多少元？」下列哪個算式可以算出正確答案？',
        m + ' － ' + a + ' × ' + n + ' － ' + b,
        [m + ' ＋ ' + a + ' × ' + n + ' ＋ ' + b, m + ' － ' + a + ' × ' + n + ' ＋ ' + b, m + ' ＋ ' + a + ' × ' + n + ' － ' + b],
        { shuffle: true }
      );
    },
    // N-5-2 平均
    () => {
      const s = until(() => [r(70, 98), r(70, 98), r(70, 98), r(70, 98)], (x) => x.reduce((p, c) => p + c, 0) % 4 === 0);
      const ok = s.reduce((p, c) => p + c, 0) / 4;
      return choice(
        '樂樂這次考試，國語、數學、自然、社會的分數分別是 ' + s.join(' 分、') + ' 分，四科的平均分數是多少分？',
        ok,
        [ok - 1, ok + 1, ok - 2, ok + 2],
        { unit: ' 分' }
      );
    },
    // N-5-3 最大公因數的應用（E11：和最小公倍數混淆）
    () => {
      const g = pick([4, 6, 8, 9, 10, 12]);
      const [m1, m2] = until(() => [r(2, 5), r(2, 5)], ([x, y]) => x < y && gcd(x, y) === 1);
      const a = g * m1;
      const b = g * m2;
      const wrongs = [lcm(a, b), g / 2, g / 3, m1 + m2, a + b].filter((x) => x === null || isInt(x));
      if (Math.random() < 0.5) {
        return choice(
          '老師把 ' + a + ' 顆糖果和 ' + b + ' 顆巧克力全部分給班上學生，每位學生分到的糖果一樣多、巧克力也一樣多，全班最多有多少位學生？',
          g,
          wrongs,
          { unit: ' 位' }
        );
      }
      return choice(
        '有一張長 ' + b + ' 公分、寬 ' + a + ' 公分的長方形紙板，全部裁成一樣大小的正方形小卡，正方形小卡的邊長最長可能是多少公分？',
        g,
        wrongs,
        { unit: ' 公分' }
      );
    },
    // N-5-3 最小公倍數的應用（E11）
    () => {
      const g = r(2, 6);
      const [m1, m2] = until(() => [r(2, 5), r(2, 5)], ([x, y]) => x < y && gcd(x, y) === 1);
      const a = g * m1;
      const b = g * m2;
      return choice(
        '甲燈每 ' + a + ' 秒閃一次，乙燈每 ' + b + ' 秒閃一次。兩個燈同時閃了一次之後，最少要再過多少秒才會再同時閃？',
        lcm(a, b),
        [g, a * b, a + b, lcm(a, b) * 2],
        { unit: ' 秒' }
      );
    },
    // N-5-3 3 的倍數
    () => {
      const ok = r(334, 3333) * 3;
      return choice('下列哪個數是 3 的倍數？', ok, [ok + 1, ok - 1, ok + 2, ok - 2]);
    },
    // N-5-4 異分母分數加法（E7）
    () => {
      const [a, b, c, d] = until(
        () => [r(1, 9), r(2, 10), r(1, 9), r(2, 10)],
        ([w, x, y, z]) => w < x && y < z && x !== z && gcd(w, x) === 1 && gcd(y, z) === 1 && lcm(x, z) <= 40 && x % z !== 0 && z % x !== 0
      );
      const L = lcm(b, d);
      const num = (a * L) / b + (c * L) / d;
      const stem = pick([
        ['算算看，', F(a, b), ' ＋ ', F(c, d), ' ＝ ？'],
        ['算算看，', F(a, b), ' 公斤和 ', F(c, d), ' 公斤，合起來是多少公斤？'],
      ]);
      return choice(stem, RF(num, L), [F(a + c, b + d), F(a + c, L), F(a * (L / b) + c, L), F(a + c, b * d), F(a * c, L)]);
    },
    // N-5-4 異分母分數減法（E7）
    () => {
      const [a, b, c, d] = until(
        () => [r(1, 9), r(2, 10), r(1, 9), r(2, 10)],
        ([w, x, y, z]) => w < x && y < z && x !== z && gcd(w, x) === 1 && gcd(y, z) === 1 && lcm(x, z) <= 40 && w * z > y * x
      );
      const L = lcm(b, d);
      const num = (a * L) / b - (c * L) / d;
      const stem = pick([
        ['算算看，', F(a, b), ' － ', F(c, d), ' ＝ ？'],
        ['空桶重 ', F(c, d), ' 公斤，裝了一些水之後，重 ', F(a, b), ' 公斤，裝入的水是多少公斤？'],
      ]);
      return choice(stem, RF(num, L), [
        a > c && b > d ? F(a - c, b - d) : null,
        F(Math.abs(a - c), L),
        RF((a * L) / b + (c * L) / d, L),
        F(a * (L / b) - c, L),
        F(Math.abs(a - c), b * d),
        F(Math.abs(a - c), b + d),
        F(num + 1, L),
        F(num, L + 1),
      ]);
    },
    // N-5-4 等值分數（擴分）
    () => {
      const [n, d] = until(() => [r(1, 8), r(3, 9)], ([x, y]) => x < y && gcd(x, y) === 1);
      const k = r(2, 5);
      if (Math.random() < 0.5) {
        return choice(
          ['下列哪個分數和 ', F(n, d), ' 一樣大？'],
          F(n * k, d * k),
          [F(n + k, d + k), F(n * k, d + k), F(n + k, d * k), F(n * k + 1, d * k), F(n * k, d * k + 1), F(n * k - 1, d * k), F(n + 1, d + 1)],
          { raw: true }
        );
      }
      return choice(
        ['已知「', F(n, d), ' ＝ ', { f: [0, '□', d * k] }, '」，□ 內要填入哪個數？'],
        n * k,
        [n + d * k - d, n * d * k, n * k * 2, n * k + k, n + k]
      );
    },
    // N-5-5 整數的幾分之幾（E10：算成剩下的部分）
    () => {
      const [a, b] = until(() => [r(1, 7), r(3, 8)], ([x, y]) => x < y && gcd(x, y) === 1);
      const m = r(3, 9);
      const n = b * m;
      const thing = pick([
        ['一袋橘子有', '顆', '袋', '橘子'],
        ['一盒鳳梨酥有', '個', '盒', '鳳梨酥'],
      ]);
      return choice(
        [thing[0] + ' ' + n + ' ' + thing[1] + '，小宇全家吃了 ', F(a, b), ' ' + thing[2] + '，請問他們吃了多少' + thing[1] + thing[3] + '？'],
        m * a,
        [m, n - m * a, n * b, isInt((n * b) / a) ? (n * b) / a : null, n + a],
        { unit: ' ' + thing[1] }
      );
    },
    // N-5-5 整數 × 分數
    () => {
      const [a, b, L] = until(() => [r(1, 7), r(3, 9), r(2, 9)], ([x, y, z]) => x < y && gcd(x, y) === 1 && z % y !== 0);
      return choice(
        ['已知 1 條緞帶長 ' + L + ' 公尺，', F(a, b), ' 條緞帶長多少公尺？'],
        RF(L * a, b),
        [F(a, b), F(a, L * b), F(L * a, L * b), F(L + a, b)],
        { unit: ' 公尺' }
      );
    },
    // N-5-6 整數相除用分數表示
    () => {
      if (Math.random() < 0.5) {
        const [a, b] = until(() => [r(3, 9), r(2, 20)], ([x, y]) => x !== y && gcd(x, y) === 1);
        return choice('一盒月餅有 ' + a + ' 個，' + b + ' 個月餅相當於多少盒？', RF(b, a), [F(a, b), a * b, a + b, Math.abs(b - a)], {
          unit: ' 盒',
        });
      }
      const [p, g] = until(() => [r(2, 7), r(3, 9)], ([x, y]) => x < y && gcd(x, y) === 1);
      const s = g * r(2, 5);
      return choice(
        '一包色紙有 ' + s + ' 張。老師把 ' + p + ' 包色紙全部平分給 ' + g + ' 組，請問每組可以分到多少包色紙？',
        RF(p, g),
        [(p * s) / g, F(g, p), F(p, s), p * s],
        { unit: ' 包' }
      );
    },
    // N-5-7 分數除以整數（分子分母對調、分子分母同乘）
    () => {
      const [a, b, n] = until(() => [r(2, 9), r(3, 11), r(2, 5)], ([x, y, z]) => x < y && gcd(x, y) === 1 && gcd(x, z) === 1);
      return choice(
        ['將 ', F(a, b), ' 公斤的糖平分成 ' + n + ' 包，每一包糖重多少公斤？'],
        RF(a, b * n),
        [F(a, n), F(n, a), F(a * n, b * n), F(a * n, b)],
        { unit: ' 公斤' }
      );
    },
    // N-5-8 由整數乘法推小數乘法的積（E4：小數點位置）
    () => {
      const A = until(() => r(101, 989), (x) => x % 10 !== 0);
      const B = until(() => r(12, 98), (x) => x % 10 !== 0);
      const P = A * B;
      // 積最多 3 位小數，錯的選項最多 4 位（不出現太長的小數）
      const i = r(1, 2);
      const j = 1;
      const t = Math.pow(10, i + j);
      return choice(
        '已知 ' + A + ' × ' + B + ' ＝ ' + P + '，請問 ' + dec(A / Math.pow(10, i)) + ' × ' + dec(B / Math.pow(10, j)) + ' ＝ ？',
        dec(P / t),
        [dec(P / t / 10), dec((P / t) * 10), dec((P / t) * 100), dec((P / t) * 1000)]
      );
    },
    // N-5-8 乘以純小數，積變小
    () => {
      const x = dec(r(101, 1999) / 100, 2);
      const tail = () => r(1, 9);
      return choice(
        '下列哪個乘法算式的積比 ' + x + ' 小？',
        x + ' × 0.' + tail(),
        [x + ' × 1.' + tail(), x + ' × ' + r(2, 4) + '.' + tail(), x + ' × ' + r(5, 9) + '.' + tail()],
        { shuffle: true }
      );
    },
    // N-5-11 小數取概數（E12）
    decimalRound(),
    // N-5-16 時間的乘法，秒滿 60 要進位
    () => {
      const [m, s, n] = until(() => [r(1, 9), r(10, 50), r(3, 6)], ([, y, z]) => y * z >= 60 && (y * z) % 60 !== 0);
      const t = (m * 60 + s) * n;
      const ms = (x) => (x % 60 ? V(Math.floor(x / 60) + ' 分鐘 ' + (x % 60) + ' 秒鐘', x) : V(x / 60 + ' 分鐘', x));
      return choice('小英走操場一圈平均要花 ' + m + ' 分鐘 ' + s + ' 秒鐘，連續走 ' + n + ' 圈，共要花多少時間？', ms(t), [
        ms(m * n * 60 + s),
        ms(m * n * 60 + ((s * n) % 60)),
        ms(t + 60),
        ms(t - 60),
        ms(t + 120),
        ms(t - 10),
      ]);
    },
    // R-5-2 四則混合計算的順序（E8）
    () => {
      const c = r(2, 9);
      const k = r(2, 12);
      const b = c * k;
      const d = r(2, 5);
      if (Math.random() < 0.5) {
        const a = r(20, 300);
        return choice('算算看，' + a + ' ＋ ' + b + ' ÷ ' + c + ' × ' + d + ' ＝ ？', a + k * d, [
          isInt(((a + b) / c) * d) ? ((a + b) / c) * d : null,
          isInt(a + b / (c * d)) ? a + b / (c * d) : null,
          (a + k) * d,
          k * d,
          a + k,
          a + b,
          a + k * d + d,
        ]);
      }
      const a = r(k * d + 10, 300);
      return choice('算算看，' + a + ' － ' + b + ' ÷ ' + c + ' × ' + d + ' ＝ ？', a - k * d, [
        isInt(((a - b) / c) * d) && a > b ? ((a - b) / c) * d : null,
        (a - k) * d,
        k * d,
        a - k,
        a + k * d,
        a - b > 0 ? a - b : null,
        a - k * d + d,
      ]);
    },
    // R-5-2 分配律
    () => {
      const a = r(12, 99);
      if (Math.random() < 0.5) {
        const t = pick([10, 100]);
        const s = r(2, t === 10 ? 8 : 90);
        return choice('已知「' + a + ' × ' + s + ' ＋ ' + a + ' × □ ＝ ' + a + ' × ' + t + '」，□ 內要填入哪個數？', t - s, [t, t + s, s, a, t * 2, a + t]);
      }
      const b = r(12, 160);
      const c = r(10, 90);
      return choice(
        '下列哪個算式的答案和「' + a + ' × ' + b + ' ＋ ' + a + ' × ' + c + '」一樣？',
        a + ' × (' + b + ' ＋ ' + c + ')',
        [a + ' × ' + b + ' ＋ ' + c, a + ' × ' + b + ' × ' + c, '(' + a + ' ＋ ' + a + ') × (' + b + ' ＋ ' + c + ')'],
        { shuffle: true }
      );
    },
    // S-5-1 三角形內角和 180 度
    () => {
      const [x, y] = until(() => [r(20, 85), r(20, 85)], ([p, q]) => p !== q && p + q < 165);
      return choice('三角形 ABC 中，∠A ＝ ' + x + ' 度，∠B ＝ ' + y + ' 度，∠C 是多少度？', 180 - x - y, [x + y, 360 - x - y, Math.abs(x - y), 90 - Math.min(x, y)], {
        unit: ' 度',
      });
    },
    // S-5-1 三根吸管能不能圍成三角形
    () => {
      const tri = () =>
        until(
          () => [r(3, 15), r(3, 15), r(3, 15)].sort((p, q) => p - q),
          ([p, q, s]) => p + q > s
        );
      const bad = until(
        () => {
          const p = r(3, 10);
          const q = r(3, 10);
          return [p, q, p + q + pick([0, 0, r(1, 3)])].sort((u, v) => u - v);
        },
        () => true
      );
      const t = (x) => x.join(' 公分、') + ' 公分';
      const good = [];
      for (let i = 0; i < 8; i++) good.push(t(tri()));
      return choice('下列哪組長度的吸管無法圍成三角形？', t(bad), good, { shuffle: true });
    },
    // S-5-2 三角形、平行四邊形、梯形面積（忘了 ÷ 2）
    () => {
      const kind = r(0, 2);
      if (kind === 0) {
        const [b, h] = until(() => [r(4, 20), r(3, 15)], ([x, y]) => (x * y) % 2 === 0);
        return choice('底 ' + b + ' 公分、高 ' + h + ' 公分的三角形，面積是多少平方公分？', (b * h) / 2, [
          b * h,
          b + h,
          (b + h) * 2,
          b * h * 2,
          isInt((b * h) / 4) ? (b * h) / 4 : null,
          (b * h) / 2 + b,
        ]);
      }
      if (kind === 1) {
        const b = r(4, 20);
        const h = r(3, 15);
        return choice('底 ' + b + ' 公分、高 ' + h + ' 公分的平行四邊形，面積是多少平方公分？', b * h, [
          isInt((b * h) / 2) ? (b * h) / 2 : null,
          (b + h) * 2,
          b + h,
          b * h * 2,
          b * h + b,
          b * h - h,
        ]);
      }
      const [a, c, h] = until(() => [r(3, 12), r(5, 18), r(2, 12)], ([x, y, z]) => x < y && ((x + y) * z) % 2 === 0);
      return choice(
        '上底 ' + a + ' 公分、下底 ' + c + ' 公分、高 ' + h + ' 公分的梯形，面積是多少平方公分？',
        ((a + c) * h) / 2,
        [(a + c) * h, a + c + h, c * h, isInt(((a + c) * h) / 4) ? ((a + c) * h) / 4 : null, a * c * h]
      );
    },
    // S-5-3 扇形：圓心角和幾分之幾圓
    () => {
      if (Math.random() < 0.5) {
        const t = pick([30, 40, 45, 60, 72, 90, 120, 135, 150, 216, 240, 270, 300]);
        const rr = r(3, 20);
        return choice('半徑 ' + rr + ' 公分、圓心角 ' + t + ' 度的扇形是幾分之幾圓？', RF(t, 360), [
          t < 180 ? RF(t, 180) : null,
          RF(360 - t, 360),
          isInt(t / 10) ? F(1, t / 10) : null,
          RF(t + 30, 360),
          F(t, 100),
        ]);
      }
      const [a, b] = until(() => [r(1, 7), pick([3, 4, 5, 6, 8, 9, 10, 12])], ([x, y]) => x < y && gcd(x, y) === 1);
      const ok = (360 * a) / b;
      return choice(['', F(a, b), ' 圓的圓心角是多少度？'], ok, [isInt((180 * a) / b) ? (180 * a) / b : null, 360 - ok, 360 / b, ok * 2, a * b], {
        unit: ' 度',
      });
    },
    // S-5-7 角柱、角錐的頂點、面、邊
    () => {
      const n = r(3, 9);
      const prism = Math.random() < 0.5;
      const name = CN[n] + (prism ? '角柱' : '角錐');
      const facts = prism
        ? { 頂點: 2 * n, 面: n + 2, 邊: 3 * n }
        : { 頂點: n + 1, 面: n + 1, 邊: 2 * n };
      const key = pick(['頂點', '面', '邊']);
      const all = [2 * n, n + 2, 3 * n, n + 1, 2 * n, n, n * 4];
      return choice(name + '有多少' + (key === '邊' ? '條邊' : '個' + key) + '？', facts[key], all, { unit: key === '邊' ? ' 條' : ' 個' });
    },
  ];

  /* ---------------- 6 年級 ---------------- */

  const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
  const ODD_COMPOSITES = [9, 15, 21, 25, 27];

  /** 質因數清單（由小到大） → 「2 × 2 × 3」 */
  const prod = (list) => (list.length ? list.slice().sort((a, b) => a - b).join(' × ') : '1');

  /** 指數表 {2:1, 3:2} → 質因數清單 */
  function expand(exp) {
    const out = [];
    Object.keys(exp).forEach((p) => {
      for (let i = 0; i < exp[p]; i++) out.push(Number(p));
    });
    return out;
  }

  const G6 = [
    // N-5-11 小數取概數到第二位
    decimalRound(2),
    // N-6-1 找合數、找不是質數的數（1 不是質數也不是合數）
    () => {
      const c = pick(ODD_COMPOSITES);
      if (Math.random() < 0.5) {
        return choice('下列哪個數是合數？', c, [1, ...H.sample(PRIMES.slice(0, 8), 3)]);
      }
      return choice('下列哪個數不是質數？', c, H.sample(PRIMES.slice(0, 9), 3));
    },
    // N-6-1 質因數分解（分解式裡不能有合數）
    () => {
      const ps = until(
        () => H.sample([2, 2, 2, 3, 3, 5, 7], r(3, 4)),
        (x) => {
          const n = x.reduce((p, c) => p * c, 1);
          return n >= 24 && n <= 140;
        }
      ).sort((a, b) => a - b);
      const n = ps.reduce((p, c) => p * c, 1);
      // 錯誤選項：把兩個質因數合成合數；或少乘、多乘一個質因數
      const merges = [prod(ps.slice(0, -1)), prod(ps.concat([ps[0]]))];
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const rest = ps.filter((_, k) => k !== i && k !== j);
          merges.push(prod(rest.concat([ps[i] * ps[j]])));
        }
      }
      const composite = H.sample(merges.slice(2), merges.length - 2);
      return choice('下列哪個選項是 ' + n + ' 的質因數分解？', prod(ps), composite.concat(merges.slice(0, 2)), { shuffle: true });
    },
    // N-6-2 由質因數分解求最小公倍數、最大公因數（E11）
    () => {
      const [A, B] = until(
        () => {
          const a = {};
          const b = {};
          [2, 3, 5, 7].forEach((p) => {
            a[p] = r(0, 2);
            b[p] = r(0, 2);
          });
          return [a, b];
        },
        ([a, b]) => {
          const ea = expand(a);
          const eb = expand(b);
          const common = [2, 3, 5, 7].some((p) => a[p] && b[p]);
          return common && ea.length >= 2 && eb.length >= 2 && ea.length <= 4 && eb.length <= 4 && prod(ea) !== prod(eb);
        }
      );
      const L = {};
      const G = {};
      [2, 3, 5, 7].forEach((p) => {
        L[p] = Math.max(A[p], B[p]);
        G[p] = Math.min(A[p], B[p]);
      });
      const all = expand(A).concat(expand(B));
      const lcmList = expand(L);
      const gcdList = expand(G);
      // 少乘一個質因數：每一種拿掉一個都可以當錯的選項
      const dropOne = (list) => [...new Set(list)].map((p) => prod(list.filter((x, i) => i !== list.indexOf(p))));
      const extra = [2, 3, 5, 7].filter((p) => L[p] > G[p]);
      const stem = '已知 甲 ＝ ' + prod(expand(A)) + '，乙 ＝ ' + prod(expand(B)) + '，請問下列何者是甲和乙的';
      if (Math.random() < 0.5) {
        return choice(stem + '最小公倍數？', prod(lcmList), [prod(gcdList), prod(all), ...dropOne(lcmList), prod(expand(A)), prod(expand(B))], {
          shuffle: true,
        });
      }
      return choice(
        stem + '最大公因數？',
        prod(gcdList),
        [prod(lcmList), prod(all), ...extra.map((p) => prod(gcdList.concat([p]))), ...dropOne(gcdList), prod(expand(A)), prod(expand(B))],
        { shuffle: true }
      );
    },
    // N-6-2 最簡分數（只約一次沒約到最簡）
    () => {
      const [n, d] = until(() => [r(1, 9), r(2, 13)], ([x, y]) => x < y && gcd(x, y) === 1);
      const g = pick([4, 6, 8, 9, 12]);
      const p = g % 2 === 0 ? 2 : 3;
      return choice(
        ['下列何者是 ', F(n * g, d * g), ' 的最簡分數？'],
        F(n, d),
        [F((n * g) / p, (d * g) / p), F(n * g, d * g), F(n + 1, d), F(n, d + 1)],
        { allowEqual: true }
      );
    },
    // N-6-2 互質（互質不必是質數）
    () => {
      const n = pick([6, 8, 9, 10, 12, 14, 15, 21]);
      const range = [];
      for (let x = 7; x <= 49; x++) range.push(x);
      const ok = pick(range.filter((x) => gcd(x, n) === 1 && !PRIMES.includes(x)));
      const share = H.sample(range.filter((x) => gcd(x, n) > 1 && x !== n), 3);
      return choice('下列哪個數和 ' + n + ' 互質？', ok, share);
    },
    // N-6-2 最小公倍數的應用（E11）
    () => {
      const g = r(2, 6);
      const [m1, m2] = until(() => [r(2, 5), r(2, 5)], ([x, y]) => x < y && gcd(x, y) === 1);
      const a = g * m1;
      const b = g * m2;
      if (Math.random() < 0.5) {
        return choice(
          '倉庫裡有一堆杯子，每 ' + a + ' 個裝一箱剛好裝完，每 ' + b + ' 個裝一箱也剛好裝完，請問這堆杯子最少會有多少個？',
          lcm(a, b),
          [g, a * b, a + b],
          { unit: ' 個' }
        );
      }
      return choice(
        '用一些長 ' + b + ' 公分、寬 ' + a + ' 公分的長方形磁磚，拼成一個正方形，請問正方形的邊長最短是多少公分？',
        lcm(a, b),
        [g, a * b, a + b],
        { unit: ' 公分' }
      );
    },
    // N-6-3 已知部分量求全部（E10：用錯運算）
    () => {
      const [a, b] = until(() => [r(1, 7), r(3, 9)], ([x, y]) => x < y && gcd(x, y) === 1);
      const W = a * r(1, 6);
      return choice(
        ['已知 ', F(a, b), ' 袋麵粉重 ' + W + ' 公斤，請問 1 袋麵粉重多少公斤？'],
        (W * b) / a,
        [RF(W * a, b), RF(W * b - a, b), RF(W * b + a, b), W, W * b, RF(W, a * b), W + b],
        { unit: ' 公斤' }
      );
    },
    // N-6-3 包含除：每段多長，可以剪成幾段
    () => {
      const [k, p, q] = until(() => [r(3, 9), r(1, 7), r(2, 9)], ([x, y, z]) => y < z && gcd(y, z) === 1 && (x * y) % z !== 0 && x * y > z);
      return choice(
        ['一條繩子長 ', RF(k * p, q), ' 公尺，每 ', F(p, q), ' 公尺剪成一段，全部剪完，可以剪成多少段？'],
        k,
        [RF(k * p * p, q * q), F(1, k), RF((k - 1) * p, q), k + 1],
        { unit: ' 段' }
      );
    },
    // N-6-4 小數除法的商與餘數（E4：小數點位置）
    () => {
      const [pd, k, rd] = until(() => [r(3, 9), r(5, 30), r(1, 8)], ([p, , q]) => q < p);
      const A = dec((k * pd + rd) / 10, 1);
      const p = pd / 10;
      const rem = rd / 10;
      const o = (x, y) => V('裝滿 ' + x + ' 瓶，還剩下 ' + y + ' 公升', x + y / 1000);
      return choice('把 ' + A + ' 公升的果汁，每 ' + p + ' 公升裝成一瓶，最多可以裝滿幾瓶？還剩下多少公升？', o(k, rem), [o(k, rd), o(k * 10, rem), o(k * 10, rd)]);
    },
    // N-6-4 至少要幾個（無條件進位）
    () => {
      const [p, A] = until(() => [dec(r(55, 95) / 100, 2), r(10, 60)], ([x, y]) => !isInt(y / x));
      const ok = Math.ceil(A / p);
      return choice(
        '一個空瓶可以裝 ' + p + ' 公升的果汁，如果想將 ' + A + ' 公升的果汁全部裝完，至少需要多少個空瓶？',
        ok,
        [ok - 1, ok * 10, (ok - 1) * 10, ok + 1],
        { unit: ' 個' }
      );
    },
    // N-6-6 由比和一個量求另一個量（求成 1 份、全部）
    () => {
      const [a, b] = until(() => [r(2, 9), r(2, 9)], ([x, y]) => x !== y && gcd(x, y) === 1);
      const u = r(5, 40);
      if (Math.random() < 0.5) {
        return choice(
          '平安國小男生和女生的人數比是 ' + a + ' : ' + b + '，男生有 ' + a * u + ' 人，女生有多少人？',
          b * u,
          [u, (a + b) * u, a * u * b, a * u + b],
          { unit: ' 人' }
        );
      }
      const T = (a + b) * u;
      return choice('全校有 ' + T + ' 人，男生和女生的人數比是 ' + a + ' : ' + b + '，女生有多少人？', b * u, [a * u, u, T - b, isInt(T / b) ? T / b : null, T], {
        unit: ' 人',
      });
    },
    // N-6-6 比值
    () => {
      const [p, q] = until(() => [r(2, 9), r(2, 9)], ([x, y]) => x !== y && gcd(x, y) === 1);
      const g = r(2, 7);
      return choice(
        '一顆蘋果賣 ' + p * g + ' 元，一顆梨子賣 ' + q * g + ' 元。請問 1 顆蘋果和 1 顆梨子售價的比值是多少？',
        RF(p, q),
        [p + ' : ' + q, q + ' : ' + p, RF(q, p)],
        { shuffle: true }
      );
    },
    // N-6-7 速度單位換算（E4：乘除 60 用反）
    () => {
      const kind = r(0, 3);
      if (kind === 0) {
        const k = r(1, 30);
        const X = 60 * k;
        return choice('「' + X + ' 公尺/分鐘」和「秒速多少公尺」一樣快？', k, [dec(X / 100), X * 60, X * 100, dec(X / 10)]);
      }
      if (kind === 1) {
        const X = r(2, 60);
        return choice('算算看，' + X + ' 公尺/秒鐘 ＝（　）公尺/分鐘，（　）中應填入哪個數？', X * 60, [X * 3600, X * 24, X, X * 100]);
      }
      if (kind === 2) {
        const k = r(1, 3);
        const X = 60 * k;
        return choice('時速 ' + X + ' 公里，也可以說速率是多少公里/分鐘？', k, [X / 6, X * 10, X * 60]);
      }
      const x = dec(r(5, 30) / 10, 1);
      return choice('分速 ' + x + ' 公里，也可以說時速是多少公里？', dec(x * 60), [dec(x * 10), dec(x * 3600), dec(x * 100)]);
    },
    // N-6-7 由距離和時間求速率；等速求時間
    () => {
      if (Math.random() < 0.5) {
        const t = r(4, 15);
        const v = r(3, 9) * 10;
        const d = t * v;
        return choice('小明花 ' + t + ' 分鐘游完 ' + d + ' 公尺，小明游泳的分速是多少公尺？', v, [d * t, RF(t, d), d + t, d - t]);
      }
      const t1 = r(2, 5);
      const v = r(4, 9) * 10;
      const t2 = until(() => r(2, 9), (x) => x !== t1);
      return choice(
        '車子 ' + t1 + ' 小時行駛 ' + t1 * v + ' 公里，用相同的速率行駛 ' + t2 * v + ' 公里，需要多少小時？',
        t2,
        [v, isInt((t2 * v) / t1) ? (t2 * v) / t1 : null, t2 * v - t1 * v, t1 + t2, t2 * 10, t2 + 1, t2 * 2, v / 10],
        { unit: ' 小時' }
      );
    },
    // N-6-8 和與倍數：兩人共有多少，甲是乙的幾倍
    () => {
      const k = r(2, 5);
      const u = r(10, 90) * pick([1, 2, 5]);
      const T = (k + 1) * u;
      if (Math.random() < 0.5) {
        return choice('哥哥和弟弟共存了 ' + T + ' 元，哥哥存的錢是弟弟的 ' + k + ' 倍，弟弟存了多少元？', u, [k * u, isInt(T / k) ? T / k : null, T - k, T, T * k], {
          unit: ' 元',
        });
      }
      return choice('阿志和小宇共有 ' + T + ' 顆彈珠，阿志的彈珠數量是小宇的 ' + k + ' 倍，阿志有多少顆彈珠？', k * u, [u, isInt(T / k) ? T / k : null, T, T * k], {
        unit: ' 顆',
      });
    },
    // N-6-9 用 y 表示未知數列式（E10）
    () => {
      const [a, b] = until(() => [r(1, 7), r(3, 15)], ([x, y]) => x < y && gcd(x, y) === 1);
      const W = a * r(2, 20);
      const f = F(a, b);
      const story = pick([
        ['「', f, ' 杯糯米粉的重量是 ' + W + ' 公克，1 杯糯米粉重幾公克？」如果用 y 公克表示 1 杯糯米粉的重量，下列哪個列式正確？'],
        ['「一桶油漆用掉 ', f, ' 桶，剛好用掉 ' + W + ' 公升，一桶油漆有多少公升？」如果用 y 公升表示一桶油漆的量，下列哪個列式正確？'],
      ]);
      const eq = (op) => ['y ' + op + ' ', f, ' ＝ ' + W];
      return choice(story, eq('×'), [eq('＋'), eq('－'), eq('÷')], { shuffle: true });
    },
    // R-6-1 除以分數等於乘以倒數
    () => {
      const [a, b, c, d] = until(
        () => [r(1, 9), r(2, 12), r(1, 9), r(2, 12)],
        ([w, x, y, z]) => w < x && y < z && gcd(w, x) === 1 && gcd(y, z) === 1 && w * z !== x * y && w > 1 && y > 1
      );
      const t = (p, q, s, u) => [F(p, q), ' × ', F(s, u)];
      return choice(
        ['下列哪個算式的答案和「', F(a, b), ' ÷ ', F(c, d), '」一樣大？'],
        t(a, b, d, c),
        [t(b, a, c, d), t(b, a, d, c), t(a, b, c, d)],
        { shuffle: true }
      );
    },
    // S-6-2 比例尺（E4：公分、公尺換算）
    () => {
      const S = pick([1000, 2000, 5000, 10000, 20000, 50000]);
      if (Math.random() < 0.5) {
        const c = r(2, 9);
        const ok = (c * S) / 100;
        return choice(
          '在比例尺為 1 : ' + S + ' 的地圖上，甲、乙兩地間的距離是 ' + c + ' 公分。請問甲、乙兩地間實際的距離是多少公尺？',
          ok,
          [ok * 10, dec(ok / 10), ok * 100, c * 100],
          { unit: ' 公尺' }
        );
      }
      const cm = r(2, 20);
      const L = (cm * S) / 100;
      return choice('地圖的比例尺是 1 : ' + S + '。一條跑道長 ' + L + ' 公尺，在地圖上的長是多少公分？', cm, [cm * 10, dec(cm / 10), dec(cm / 100), cm * 100], {
        unit: ' 公分',
      });
    },
    // S-6-3 圓面積（E11：直徑代入、算成圓周長）
    () => {
      const d = r(2, 12) * 2;
      const rr = d / 2;
      if (Math.random() < 0.5) {
        return choice(
          '一個直徑長 ' + d + ' 公分的圓，面積是多少平方公分？（圓周率 ＝ 3.14）',
          dec(rr * rr * 3.14, 2),
          [dec(d * 3.14, 2), dec(d * d * 3.14, 2), dec(rr * 3.14, 2), dec(rr * rr * 3.14 * 2, 2)]
        );
      }
      return choice(
        '「直徑 ' + d + ' 公尺的圓，面積是多少平方公尺？」下列哪個算式可以算出正確答案？（圓周率 ＝ 3.14）',
        '(' + d + ' ÷ 2) × (' + d + ' ÷ 2) × 3.14',
        [d + ' × 3.14', '(' + d + ' ÷ 2) × 3.14', d + ' × ' + d + ' × 3.14'],
        { shuffle: true }
      );
    },
    // S-6-3 扇形面積與扇形周長算式（扇形周長要加兩條半徑）
    () => {
      if (Math.random() < 0.5) {
        const [rr, t] = until(
          () => [r(2, 12), pick([30, 45, 60, 90, 120, 180])],
          ([x, y]) => isInt(dec(x * x * 3.14 * y / 360, 6) * 100)
        );
        const ok = dec((rr * rr * 3.14 * t) / 360, 2);
        return choice(
          '半徑是 ' + rr + ' 公分、圓心角是 ' + t + ' 度的扇形，面積是多少平方公分？（圓周率 ＝ 3.14）',
          ok,
          [
            dec(rr * rr * 3.14, 2),
            dec(ok * 2, 2),
            dec((rr * 2 * 3.14 * t) / 360, 4),
            dec(ok / 2, 4),
            dec((rr * rr * t) / 360, 4),
            dec((rr * 3.14 * t) / 360, 4),
            dec(ok * 4, 2),
          ]
        );
      }
      const rr = r(3, 12);
      const k = pick([2, 3, 4, 6, 8, 12]);
      const f = F(1, k);
      return choice(
        ['「半徑 ' + rr + ' 公分的 ', f, ' 圓，它的周長是多少公分？」下列哪個算式可以算出正確答案？（圓周率 ＝ 3.14）'],
        [rr + ' × 2 ＋ ' + rr + ' × 2 × 3.14 × ', f],
        [
          [rr + ' × 2 × 3.14 × ', f],
          [rr + ' × ' + rr + ' × 3.14 × ', f],
          [rr + ' × 2 ＋ ' + rr + ' × ' + rr + ' × 3.14 × ', f],
        ],
        { shuffle: true }
      );
    },
    // S-6-4 柱體體積＝底面積 × 高
    () => {
      if (Math.random() < 0.5) {
        const A = r(10, 60);
        const h = r(3, 15);
        return choice(
          '一個四角柱的底面積是 ' + A + ' 平方公分，高是 ' + h + ' 公分，這個四角柱的體積是多少立方公分？',
          A * h,
          [A * h * 2, isInt((A * h) / 2) ? (A * h) / 2 : null, A + h, A * h * h],
          { unit: ' 立方公分' }
        );
      }
      const [a, b, h] = until(() => [r(3, 12), r(3, 12), r(4, 15)], ([x, y]) => (x * y) % 2 === 0);
      return choice(
        '一個三角柱的底面是直角三角形，兩條直角邊長 ' + a + ' 公分和 ' + b + ' 公分，柱高 ' + h + ' 公分，這個三角柱的體積是多少立方公分？',
        (a * b * h) / 2,
        [a * b * h, (a + b) * h, (a * b) / 2 + h, a * b + h, a * b * h * 2, isInt(((a + b) * h) / 2) ? ((a + b) * h) / 2 : null],
        { unit: ' 立方公分' }
      );
    },
    // N-6-5 先取概數再計算
    () => {
      const [x, n] = until(
        () => [dec(r(101, 999) / 1000, 3), r(3, 9)],
        ([v, k]) => !isInt(v * 100) && roundTo(v * k, 2, 'round') !== dec(roundTo(v, 2, 'round') * k, 2)
      );
      const ok = dec(roundTo(x, 2, 'round') * n, 2);
      return choice(
        '一包紅豆重 ' + x + ' 公斤，' + n + ' 包紅豆大約重幾公斤？（先用四捨五入法將一包紅豆的重量取概數到小數點後第二位，再計算）',
        ok,
        [
          roundTo(x * n, 2, 'round'),
          dec(roundTo(x, 2, 'floor') * n, 2),
          dec(roundTo(x, 2, 'ceil') * n, 2),
          dec(roundTo(x, 1, 'round') * n, 2),
          dec(ok + 0.01, 2),
          dec(ok - 0.01, 2),
          dec(ok + 0.1, 2),
        ]
      );
    },
  ];

  /* ---------------- 註冊單元 ---------------- */

  /** 原題 → 題目片段；答案後面註明出處，方便老師對照原卷 */
  function toFixed(item) {
    const opt = item.o[item.a - 1].filter((t) => !(t && t.img));
    const answer = [CIRC[item.a - 1]];
    if (opt.length) answer.push(' ', ...opt);
    answer.push('　［' + item.src + '］');
    return { q: item.q.concat([{ opts: item.o }]), a: answer };
  }

  const GENS = { 3: G3, 4: G4, 5: G5, 6: G6 };
  const data = NP.xuefuData || {};
  [3, 4, 5, 6].forEach((g) => {
    const bookId = 'g' + g + 'b';
    const book = NP.bank.books.find((b) => b.id === bookId);
    if (!book) return;
    NP.bank.addUnit(bookId, {
      id: bookId + '-xf',
      no: book.units.length + 1,
      name: '學習扶助',
      // 分數選項可能刻意不約分（誘答），由測試另外檢查正確答案
      raw: true,
      xuefu: true,
      fixed: (data[g] || []).map(toFixed),
      gens: GENS[g],
    });
  });
})((window.NP = window.NP || {}));
