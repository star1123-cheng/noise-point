/*
 * 4 下（第八冊）出題規則。
 * 題型參考該冊月考卷與課本，數字皆為隨機產生，不收錄原題。
 * 分數答案維持不約分（與考卷一致）。
 */
(function (NP) {
  'use strict';

  const WEEK = ['日', '一', '二', '三', '四', '五', '六'];

  /** 24 小時制的分鐘數 → 「上午 9 時 35 分」或「下午 2 時 25 分」 */
  function clockText(totalMin) {
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    const label = h < 12 ? '上午' : '下午';
    const h12 = h > 12 ? h - 12 : h;
    return label + ' ' + h12 + ' 時' + (m ? ' ' + m + ' 分' : '');
  }

  function hm(totalMin) {
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    if (!h) return m + ' 分鐘';
    return h + ' 小時' + (m ? ' ' + m + ' 分鐘' : '');
  }

  function mixedOrProper(H, num, den) {
    const w = Math.floor(num / den);
    const r = num % den;
    if (!r) return String(w);
    return H.f(w, r, den);
  }

  NP.bank.register({
    id: 'g4b',
    grade: 4,
    term: '下',
    label: '4 下',
    units: [
      {
        id: 'g4b-01',
        no: 1,
        name: '多位數的乘與除',
        gens: [
          (H) => {
            const a = H.r(101, 999);
            const b = H.r(101, 999);
            return { q: [a + ' × ' + b + ' ＝ ？'], a: [String(a * b)] };
          },
          (H) => {
            const a = H.r(1001, 9999);
            const b = H.pick([H.r(101, 999), H.r(2, 9) * 100 + H.r(1, 9)]);
            return { q: [a + ' × ' + b + ' ＝ ？'], a: [String(a * b)] };
          },
          (H) => {
            const a = H.pick([H.r(11, 99) * 10, H.r(11, 99) * 100]);
            const b = H.r(2, 9) * 100;
            return { q: [a + ' × ' + b + ' ＝ ？'], a: [String(a * b)] };
          },
          (H) => {
            const d = H.r(101, 499);
            const q = H.r(2, Math.floor(9999 / d));
            const rem = H.r(0, Math.min(d - 1, 9999 - q * d));
            const a = q * d + rem;
            return { q: [a + ' ÷ ' + d + ' ＝ ？'], a: [rem ? q + ' … ' + rem : String(q)] };
          },
          (H) => {
            const d = H.r(2, 9) * 100;
            const q = H.pick([H.r(12, 99), H.r(101, 999)]);
            return { q: [d * q + ' ÷ ' + d + ' ＝ ？'], a: [String(q)] };
          },
          (H) => {
            const price = H.r(12, 98) * 100;
            const qty = H.r(101, 299);
            return {
              q: ['每臺麵包機賣 ' + price + ' 元，賣出 ' + qty + ' 臺，共賣得多少元？'],
              a: [price * qty + ' 元'],
            };
          },
        ],
      },
      {
        id: 'g4b-02',
        no: 2,
        name: '四邊形',
        gens: [
          (H) => {
            const s = H.r(4, 45);
            const shape = H.pick(['正方形', '菱形']);
            return { q: [shape + '的一邊長 ' + s + ' 公分，周長是幾公分？'], a: [s * 4 + ' 公分'] };
          },
          (H) => {
            const a = H.r(8, 40);
            const b = H.r(4, a - 1);
            return {
              q: ['平行四邊形相鄰的兩邊長 ' + a + ' 公分和 ' + b + ' 公分，周長是幾公分？'],
              a: [(a + b) * 2 + ' 公分'],
            };
          },
          (H) => {
            const s = H.r(6, 40);
            return { q: ['菱形的周長是 ' + s * 4 + ' 公分，一邊長幾公分？'], a: [s + ' 公分'] };
          },
        ],
      },
      {
        id: 'g4b-03',
        no: 3,
        name: '概數',
        gens: [
          (H) => {
            const places = [
              ['十', 10],
              ['百', 100],
              ['千', 1000],
              ['萬', 10000],
            ];
            const [name, p] = H.pick(places);
            const n = H.r(p === 10000 ? 12000 : 1001, 99999);
            const methods = [
              ['四捨五入法', Math.round(n / p) * p],
              ['無條件捨去法', Math.floor(n / p) * p],
              ['無條件進入法', Math.ceil(n / p) * p],
            ];
            const [method, ans] = H.pick(methods);
            return { q: ['把 ' + n + ' 用' + method + '取概數到' + name + '位'], a: [String(ans)] };
          },
          (H) => {
            const a = H.r(10000, 49999);
            const b = H.r(10000, 49999);
            const ra = Math.round(a / 1000) * 1000;
            const rb = Math.round(b / 1000) * 1000;
            return {
              q: ['先用四捨五入法取概數到千位，再算 ' + a + ' ＋ ' + b + ' 大約是多少？'],
              a: ['約 ' + (ra + rb)],
            };
          },
        ],
      },
      {
        id: 'g4b-04',
        no: 4,
        name: '數量規律',
        gens: [
          (H) => {
            const d1 = H.r(1, 10);
            const d2 = d1 + H.r(5, 20);
            const w = H.r(0, 6);
            return {
              q: ['某個月的 ' + d1 + ' 日是星期' + WEEK[w] + '，同一個月的 ' + d2 + ' 日是星期幾？'],
              a: ['星期' + WEEK[(w + d2 - d1) % 7]],
            };
          },
          (H) => {
            const a = H.r(1001, 9999);
            const b = H.r(1001, 9999);
            const op = H.pick(['＋', '×']);
            const odd = op === '×' ? a % 2 === 1 && b % 2 === 1 : (a + b) % 2 === 1;
            return { q: [a + ' ' + op + ' ' + b + ' 的結果是奇數還是偶數？'], a: [odd ? '奇數' : '偶數'] };
          },
          (H) => {
            const k = H.r(4, 7);
            const n = H.r(k * 3 + 1, k * 15);
            const row = Math.ceil(n / k);
            const pos = ((n - 1) % k) + 1;
            return {
              q: ['從 1 開始，每一列依序寫 ' + k + ' 個數字（第 1 列是 1～' + k + '），' + n + ' 寫在第幾列的第幾個？'],
              a: ['第 ' + row + ' 列的第 ' + pos + ' 個'],
            };
          },
        ],
      },
      {
        id: 'g4b-05',
        no: 5,
        name: '小數乘法',
        gens: [
          (H) => {
            const a = H.r(11, 99) / 10;
            const b = H.r(2, 9);
            return { q: [a + ' × ' + b + ' ＝ ？'], a: [String(H.dec(a * b, 2))] };
          },
          (H) => {
            const a = H.r(101, 999) / 100;
            const b = H.r(2, 9);
            return { q: [a + ' × ' + b + ' ＝ ？'], a: [String(H.dec(a * b, 2))] };
          },
          (H) => {
            const a = H.pick([H.r(11, 99) / 10, H.r(101, 999) / 100]);
            const b = H.r(11, 49);
            return { q: [a + ' × ' + b + ' ＝ ？'], a: [String(H.dec(a * b, 2))] };
          },
          (H) => {
            const a = H.r(25, 99) / 100;
            const b = H.r(3, 12);
            return {
              q: ['每瓶果汁有 ' + a + ' 公升，' + b + ' 瓶共有幾公升？'],
              a: [H.dec(a * b, 2) + ' 公升'],
            };
          },
        ],
      },
      {
        id: 'g4b-06',
        no: 6,
        name: '周長與面積',
        gens: [
          (H) => {
            const l = H.r(6, 40);
            const w = H.r(3, l - 1);
            return H.pick([
              { q: ['長方形長 ' + l + ' 公分、寬 ' + w + ' 公分，周長是幾公分？'], a: [(l + w) * 2 + ' 公分'] },
              { q: ['長方形長 ' + l + ' 公分、寬 ' + w + ' 公分，面積是幾平方公分？'], a: [l * w + ' 平方公分'] },
            ]);
          },
          (H) => {
            const s = H.r(3, 30);
            return H.pick([
              { q: ['正方形一邊長 ' + s + ' 公分，面積是幾平方公分？'], a: [s * s + ' 平方公分'] },
              { q: ['正方形的周長是 ' + s * 4 + ' 公分，面積是幾平方公分？'], a: [s * s + ' 平方公分'] },
            ]);
          },
          (H) => {
            const l = H.r(4, 15);
            const w = H.r(3, 12);
            return {
              q: ['長方形的面積是 ' + l * w + ' 平方公分，長 ' + l + ' 公分，寬是幾公分？'],
              a: [w + ' 公分'],
            };
          },
          (H) => {
            const k = H.r(2, 30);
            return { q: [k + ' 平方公尺 ＝ ？ 平方公分'], a: [k * 10000 + ' 平方公分'] };
          },
        ],
      },
      {
        id: 'g4b-07',
        no: 7,
        name: '等值分數',
        gens: [
          (H) => {
            const [n, d] = simple(H);
            const k = H.r(2, 6);
            return { q: [H.f(0, n, d), ' ＝ ', H.f(0, '？', d * k)], a: [String(n * k)] };
          },
          (H) => {
            const [n, d] = simple(H);
            const k = H.r(2, 6);
            return { q: [H.f(0, n * k, d * k), ' ＝ ', H.f(0, n, '？')], a: [String(d)] };
          },
          (H) => {
            const den = H.pick([10, 100]);
            const w = H.r(0, 1) ? 0 : H.r(1, 5);
            const num = H.r(1, den - 1);
            const dec = H.dec(w + num / den, 2);
            return H.pick([
              { q: [dec + ' ＝ ？（用分數表示）'], a: [H.f(w, num, den)] },
              { q: [mixedOrProper(H, w * den + num, den), ' ＝ ？（用小數表示）'], a: [String(dec)] },
            ]);
          },
          (H) => {
            const [n, d] = simple(H);
            const k = H.r(2, 4);
            let other = n * k + H.pick([-1, 1]) * H.r(1, 2);
            if (other <= 0) other = n * k + 1;
            if (other >= d * k) other = n * k - 1;
            const left = H.f(0, n, d);
            const right = H.f(0, other, d * k);
            const bigger = n * k > other ? left : right;
            return { q: [left, ' 和 ', right, '，哪一個比較大？'], a: [bigger] };
          },
        ],
      },
      {
        id: 'g4b-08',
        no: 8,
        name: '簡化計算',
        gens: [
          (H) => {
            const a = H.r(101, 489);
            const c = (Math.floor(a / 100) + 1 + H.r(0, 2)) * 100 - a;
            const b = H.r(101, 899);
            return { q: [a + ' ＋ ' + b + ' ＋ ' + c + ' ＝ ？'], a: [String(a + b + c)] };
          },
          (H) => {
            const round = H.r(1, 2) * 100;
            const b = H.r(11, round - 11);
            const c = round - b;
            const a = H.r(round + 100, 999);
            return { q: [a + ' － ' + b + ' － ' + c + ' ＝ ？'], a: [String(a - b - c)] };
          },
          (H) => {
            const c = H.r(101, 399);
            const a = c + H.r(1, 5) * 100;
            const b = H.r(11, 99);
            return { q: [a + ' ＋ ' + b + ' － ' + c + ' ＝ ？'], a: [String(a + b - c)] };
          },
          (H) => {
            const k = H.r(11, 99);
            return H.pick([
              { q: ['125 × ' + k + ' × 8 ＝ ？'], a: [String(1000 * k)] },
              { q: ['25 × ' + k + ' × 4 ＝ ？'], a: [String(100 * k)] },
            ]);
          },
          (H) => {
            const c = H.r(3, 9);
            const a = c * H.r(12, 120);
            const b = H.r(3, 9);
            return { q: [a + ' × ' + b + ' ÷ ' + c + ' ＝ ？'], a: [String((a / c) * b)] };
          },
        ],
      },
      {
        id: 'g4b-09',
        no: 9,
        name: '時間的計算',
        gens: [
          (H) => {
            const d = H.r(1, 6);
            const h = H.r(1, 23);
            return { q: [d + ' 日 ' + h + ' 小時 ＝ ？ 小時'], a: [d * 24 + h + ' 小時'] };
          },
          (H) => {
            let total = H.r(61, 599);
            if (total % 60 === 0) total += 7;
            return { q: [total + ' 分鐘 ＝ ？ 小時 ？ 分鐘'], a: [hm(total)] };
          },
          (H) => {
            const m = H.r(2, 15);
            const s = H.r(1, 59);
            return { q: [m + ' 分鐘 ' + s + ' 秒鐘 ＝ ？ 秒鐘'], a: [m * 60 + s + ' 秒鐘'] };
          },
          (H) => {
            const d1 = H.r(1, 6);
            const h1 = H.r(5, 23);
            const d2 = H.r(1, 5);
            const h2 = H.r(5, 23);
            const total = (d1 + d2) * 24 + h1 + h2;
            const dd = Math.floor(total / 24);
            const hh = total % 24;
            return {
              q: [d1 + ' 日 ' + h1 + ' 小時 ＋ ' + d2 + ' 日 ' + h2 + ' 小時 ＝ ？'],
              a: [dd + ' 日' + (hh ? ' ' + hh + ' 小時' : '')],
            };
          },
          (H) => {
            const start = H.r(13 * 60, 16 * 60) + H.r(1, 11) * 5 - 5;
            let dur = H.r(35, 170);
            if (dur % 60 === 0) dur += 5;
            const end = Math.min(start + dur, 18 * 60 + 55);
            return {
              q: ['從' + clockText(start) + '到' + clockText(end) + '，共經過多久？'],
              a: [hm(end - start)],
            };
          },
          (H) => {
            const start = H.r(7, 10) * 60 + H.r(1, 11) * 5;
            const end = H.r(13 * 60 + 5, 17 * 60 + 50);
            const dur = end - start;
            return {
              q: ['' + clockText(start) + '出發，經過 ' + hm(dur) + '後抵達，抵達時是幾時幾分？'],
              a: [clockText(end)],
            };
          },
        ],
      },
      {
        id: 'g4b-10',
        no: 10,
        name: '立方公分',
        gens: [
          (H) => {
            const a = H.r(2, 9);
            const b = H.r(2, 9);
            const c = H.r(2, 6);
            return {
              q: ['用 1 立方公分的積木排長方體：每層 ' + a + ' 排，每排 ' + b + ' 個，共 ' + c + ' 層，體積是多少立方公分？'],
              a: [a * b * c + ' 立方公分'],
            };
          },
          (H) => {
            const top = H.r(1, 3) ** 2;
            const mid = (Math.sqrt(top) + 1) ** 2;
            const low = (Math.sqrt(top) + 2) ** 2;
            return {
              q: ['形體上層有 ' + top + ' 個、中層有 ' + mid + ' 個、下層有 ' + low + ' 個 1 立方公分的積木，體積是多少立方公分？'],
              a: [top + mid + low + ' 立方公分'],
            };
          },
          (H) => {
            const x = H.r(12, 99);
            const y = H.r(12, 99);
            return {
              q: ['把 ' + x + ' 立方公分和 ' + y + ' 立方公分的兩個形體黏在一起，體積是多少立方公分？'],
              a: [x + y + ' 立方公分'],
            };
          },
        ],
      },
    ],
  });

  /** 隨機的最簡真分數 [分子, 分母] */
  function simple(H) {
    for (;;) {
      const d = H.r(2, 9);
      const n = H.r(1, d - 1);
      if (H.gcd(n, d) === 1) return [n, d];
    }
  }
})((window.NP = window.NP || {}));
