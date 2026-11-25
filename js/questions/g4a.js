/*
 * 4 上（第七冊）出題規則。
 * 題型參考該冊月考卷與教師手冊，數字皆為隨機產生，不收錄原題。
 * 4 年級尚未學約分，分數答案維持不約分（與考卷一致）。
 */
(function (NP) {
  'use strict';

  /** 456789 → 「45 萬 6789」 */
  function wan(x) {
    const w = Math.floor(x / 10000);
    const rest = x % 10000;
    return w + ' 萬' + (rest ? ' ' + rest : '');
  }

  /** 帶分數（或整數、真分數）片段 */
  function mixed(H, num, den) {
    const w = Math.floor(num / den);
    const r = num % den;
    if (r === 0) return String(w);
    return H.f(w, r, den);
  }

  const ITEMS_MUL = [
    ['一盒鉛筆有', '枝', '盒', '枝'],
    ['一箱蘋果有', '顆', '箱', '顆'],
    ['一列排', '人', '列', '人'],
    ['一包餅乾', '元', '包', '元'],
    ['一本故事書', '元', '本', '元'],
  ];

  NP.bank.register({
    id: 'g4a',
    grade: 4,
    term: '上',
    label: '4 上',
    units: [
      {
        id: 'g4a-01',
        no: 1,
        name: '一億以內的數',
        gens: [
          (H) => {
            const a = H.r(100, 899) * 10000 + H.r(1000, 9999);
            const b = H.r(10, 99) * 10000 + H.r(1000, 9999);
            return H.pick([
              { q: [a + ' ＋ ' + b + ' ＝ ？'], a: [String(a + b)] },
              { q: [a + ' － ' + b + ' ＝ ？'], a: [String(a - b)] },
            ]);
          },
          (H) => {
            const a = H.r(20, 99) * 10000 + H.r(1, 9) * 1000;
            const b = H.r(10, 89) * 10000 + H.r(1, 9) * 1000;
            const big = Math.max(a, b);
            const small = Math.min(a, b);
            if (H.r(0, 1) || a === b) {
              return { q: [wan(a) + ' ＋ ' + wan(b) + ' ＝ ？'], a: [wan(a + b) + '（' + (a + b) + '）'] };
            }
            return {
              q: [wan(big) + ' － ' + wan(small) + ' ＝ ？'],
              a: [wan(big - small) + '（' + (big - small) + '）'],
            };
          },
          (H) => {
            const places = [
              ['千萬', 10000000],
              ['百萬', 1000000],
              ['十萬', 100000],
              ['萬', 10000],
              ['千', 1000],
              ['百', 100],
            ];
            const chosen = places.filter(() => Math.random() < 0.55);
            while (chosen.length < 2) {
              const p = H.pick(places);
              if (!chosen.includes(p)) chosen.push(p);
            }
            chosen.sort((x, y) => y[1] - x[1]);
            let total = 0;
            const parts = chosen.map(([name, value]) => {
              const d = H.r(1, 9);
              total += d * value;
              return d + ' 個' + name;
            });
            const text = parts.slice(0, -1).join('、') + '和 ' + parts[parts.length - 1];
            return { q: [text + '合起來是多少？'], a: [String(total)] };
          },
        ],
      },
      {
        id: 'g4a-02',
        no: 2,
        name: '整數的乘法',
        gens: [
          (H) => {
            const a = H.r(1001, 9999);
            const b = H.r(3, 9);
            return { q: [a + ' × ' + b + ' ＝ ？'], a: [String(a * b)] };
          },
          (H) => {
            const a = H.r(13, 99);
            const b = H.r(13, 99);
            return { q: [a + ' × ' + b + ' ＝ ？'], a: [String(a * b)] };
          },
          (H) => {
            const a = H.r(101, 999);
            const b = H.r(13, 99);
            return { q: [a + ' × ' + b + ' ＝ ？'], a: [String(a * b)] };
          },
          (H) => {
            const [pre, unit, pack, ans] = H.pick(ITEMS_MUL);
            const each = H.r(12, 99);
            const count = H.r(12, 48);
            return {
              q: [pre + ' ' + each + ' ' + unit + '，' + count + ' ' + pack + '共是多少' + ans + '？'],
              a: [each * count + ' ' + ans],
            };
          },
        ],
      },
      {
        id: 'g4a-03',
        no: 3,
        name: '角度',
        gens: [
          (H) => {
            const a = H.r(10, 170);
            return { q: ['一個平角減去 ' + a + '°，剩下幾度？'], a: [180 - a + '°'] };
          },
          (H) => {
            const a = H.r(5, 85);
            return { q: ['一個直角和一個 ' + a + '° 的角合起來是幾度？'], a: [90 + a + '°'] };
          },
          (H) => {
            const a = H.r(20, 340);
            return {
              q: ['指針順時針轉了 ' + a + '°，再轉幾度就剛好轉一圈？'],
              a: [360 - a + '°'],
            };
          },
          (H) => {
            const angles = [30, 45, 60, 90];
            const a = H.pick(angles);
            let b = H.pick(angles);
            if (a === b) b = a === 90 ? 45 : 90;
            return H.pick([
              { q: ['三角板的 ' + a + '° 角和 ' + b + '° 角拼在一起，是幾度？'], a: [a + b + '°'] },
              { q: ['從平角裡拿掉三角板的 ' + a + '° 角，剩下幾度？'], a: [180 - a + '°'] },
            ]);
          },
        ],
      },
      {
        id: 'g4a-04',
        no: 4,
        name: '整數的除法',
        gens: [
          (H) => divide(H, H.r(3, 9), 1000, 9999),
          (H) => divide(H, H.r(12, 45), 12, 99),
          (H) => divide(H, H.r(12, 99), 100, 999),
          (H) => divide(H, H.r(12, 99), 1000, 9999),
          (H) => {
            const d = H.r(6, 25);
            const q = H.r(15, 150);
            const rem = H.r(1, d - 1);
            const total = q * d + rem;
            return {
              q: ['每 ' + d + ' 個蛋塔裝一盒，' + total + ' 個蛋塔最多可以裝滿幾盒？剩下幾個？'],
              a: [q + ' 盒，剩下 ' + rem + ' 個'],
            };
          },
        ],
      },
      {
        id: 'g4a-05',
        no: 5,
        name: '公里',
        gens: [
          (H) => {
            const k = H.r(1, 30);
            const m = H.r(1, 999);
            return { q: [k + ' 公里 ' + m + ' 公尺 ＝ ？ 公尺'], a: [k * 1000 + m + ' 公尺'] };
          },
          (H) => {
            const total = H.r(1001, 39999);
            const k = Math.floor(total / 1000);
            const m = total % 1000;
            return {
              q: [total + ' 公尺 ＝ ？ 公里 ？ 公尺'],
              a: [m ? k + ' 公里 ' + m + ' 公尺' : k + ' 公里'],
            };
          },
          (H) => {
            const a = H.r(1, 40) * 1000 + H.r(100, 999);
            const b = H.r(1, 30) * 1000 + H.r(100, 999);
            const fmt = (x) => Math.floor(x / 1000) + ' 公里 ' + (x % 1000) + ' 公尺';
            const res = (x) => (x % 1000 ? fmt(x) : x / 1000 + ' 公里');
            if (H.r(0, 1)) return { q: [fmt(a) + ' ＋ ' + fmt(b) + ' ＝ ？'], a: [res(a + b)] };
            const big = Math.max(a, b);
            const small = Math.min(a, b);
            if (big === small) return { q: [fmt(a) + ' ＋ ' + fmt(b) + ' ＝ ？'], a: [res(a + b)] };
            return { q: [fmt(big) + ' － ' + fmt(small) + ' ＝ ？'], a: [res(big - small)] };
          },
        ],
      },
      {
        id: 'g4a-06',
        no: 6,
        name: '三角形',
        gens: [
          (H) => {
            const kind = H.r(0, 2);
            let angles;
            if (kind === 0) {
              const a = H.r(15, 75);
              angles = [90, a, 90 - a];
            } else if (kind === 1) {
              const big = H.r(95, 150);
              const a = H.r(10, 180 - big - 10);
              angles = [big, a, 180 - big - a];
            } else {
              const a = H.r(50, 85);
              const b = H.r(Math.max(10, 95 - a), 85);
              angles = [a, b, 180 - a - b];
              if (angles[2] >= 90 || angles[2] <= 0) angles = [60, 60, 60];
            }
            angles.sort(() => Math.random() - 0.5);
            const name = angles.includes(90) ? '直角' : angles.some((x) => x > 90) ? '鈍角' : '銳角';
            return {
              q: ['三角形的 3 個角是 ' + angles.join('°、') + '°，是哪一種三角形？（銳角、直角、鈍角）'],
              a: [name + '三角形'],
            };
          },
          (H) => {
            const s = H.r(4, 39);
            return { q: ['正三角形的一邊長 ' + s + ' 公分，周長是幾公分？'], a: [s * 3 + ' 公分'] };
          },
          (H) => {
            const leg = H.r(6, 30);
            const base = H.r(3, leg * 2 - 1);
            return {
              q: ['等腰三角形的兩腰各長 ' + leg + ' 公分，底邊長 ' + base + ' 公分，周長是幾公分？'],
              a: [leg * 2 + base + ' 公分'],
            };
          },
        ],
      },
      {
        id: 'g4a-07',
        no: 7,
        name: '小數',
        gens: [
          (H) => {
            const a = H.r(101, 9999) / 100;
            const b = H.r(101, 9999) / 100;
            if (H.r(0, 1)) return { q: [a + ' ＋ ' + b + ' ＝ ？'], a: [String(H.dec(a + b, 2))] };
            const big = Math.max(a, b);
            const small = Math.min(a, b);
            if (big === small) return { q: [a + ' ＋ ' + b + ' ＝ ？'], a: [String(H.dec(a + b, 2))] };
            return { q: [big + ' － ' + small + ' ＝ ？'], a: [String(H.dec(big - small, 2))] };
          },
          (H) => {
            const m = H.r(1, 20);
            const cm = H.r(1, 99);
            const value = H.dec(m + cm / 100, 2);
            if (H.r(0, 1)) return { q: [m + ' 公尺 ' + cm + ' 公分 ＝ ？ 公尺'], a: [value + ' 公尺'] };
            return { q: [value + ' 公尺 ＝ ？ 公尺 ？ 公分'], a: [m + ' 公尺 ' + cm + ' 公分'] };
          },
          (H) => {
            const a = H.r(105, 1999) / 100;
            const b = H.r(105, 1999) / 100;
            return {
              q: ['小狗重 ' + a + ' 公斤，小羊重 ' + b + ' 公斤，兩隻共重多少公斤？'],
              a: [H.dec(a + b, 2) + ' 公斤'],
            };
          },
        ],
      },
      {
        id: 'g4a-08',
        no: 8,
        name: '整數四則計算',
        gens: [
          (H) => {
            const a = H.r(20, 60);
            const b = H.r(5, a - 5);
            const c = H.r(6, 35);
            return { q: ['（' + a + ' － ' + b + '）× ' + c + ' ＝ ？'], a: [String((a - b) * c)] };
          },
          (H) => {
            const a = H.r(12, 75);
            const b = H.r(5, 40);
            const c = H.r(5, 40);
            return { q: [a + ' ×（' + b + ' ＋ ' + c + '）＝ ？'], a: [String(a * (b + c))] };
          },
          (H) => {
            const b = H.r(3, 15);
            const c = H.r(2, 9);
            const q = H.r(3, 15);
            const a = b * c * q;
            return { q: [a + ' ÷（' + b + ' × ' + c + '）＝ ？'], a: [String(q)] };
          },
          (H) => {
            const b = H.r(3, 9);
            const q = H.r(50, 200);
            const c = H.r(10, q - 5);
            return { q: [q * b + ' ÷ ' + b + ' － ' + c + ' ＝ ？'], a: [String(q - c)] };
          },
          (H) => {
            const a = H.r(100, 500);
            const b = H.r(12, 45);
            const c = H.r(3, 9);
            return { q: [a + ' ＋ ' + b + ' × ' + c + ' ＝ ？'], a: [String(a + b * c)] };
          },
          (H) => {
            const a = H.r(105, 499);
            const b = H.r(105, 499);
            return {
              q: ['買 ' + a + ' 元的皮夾和 ' + b + ' 元的皮帶，付 1000 元，找回多少元？（用一個算式）'],
              a: [1000 - a - b + ' 元'],
            };
          },
        ],
      },
      {
        id: 'g4a-09',
        no: 9,
        name: '分數',
        gens: [
          (H) => {
            const den = H.r(3, 12);
            const num = H.r(den + 1, den * 6);
            return { q: [H.f(0, num, den), ' ＝ ？（換成帶分數或整數）'], a: [mixed(H, num, den)] };
          },
          (H) => {
            const den = H.r(3, 12);
            const w = H.r(1, 6);
            const r = H.r(1, den - 1);
            return { q: [H.f(w, r, den), ' ＝ ？（換成假分數）'], a: [H.f(0, w * den + r, den)] };
          },
          (H) => {
            const den = H.r(5, 15);
            const a = H.r(1, 8) * den + H.r(1, den - 1);
            const b = H.r(1, 6) * den + H.r(1, den - 1);
            return {
              q: [mixed(H, a, den), ' ＋ ', mixed(H, b, den), ' ＝ ？'],
              a: [mixed(H, a + b, den)],
            };
          },
          (H) => {
            const den = H.r(5, 15);
            let a = H.r(2, 9) * den + H.r(1, den - 1);
            let b = H.r(1, 6) * den + H.r(1, den - 1);
            if (a <= b) [a, b] = [b + den, a];
            return {
              q: [mixed(H, a, den), ' － ', mixed(H, b, den), ' ＝ ？'],
              a: [mixed(H, a - b, den)],
            };
          },
          (H) => {
            const den = H.r(3, 9);
            const num = H.r(1, den - 1);
            const k = H.r(3, 9);
            const total = num * k;
            let ans;
            if (total % den === 0) ans = [String(total / den)];
            else if (total < den) ans = [H.f(0, total, den)];
            else ans = [H.f(0, total, den), '（', mixed(H, total, den), '）'];
            return { q: [H.f(0, num, den), ' × ' + k + ' ＝ ？'], a: ans };
          },
        ],
      },
      {
        id: 'g4a-10',
        no: 10,
        name: '統計圖',
        note: '需要看圖作答，不出題',
        gens: [],
      },
    ],
  });

  /** 除法題：答案寫成「商 … 餘數」 */
  function divide(H, d, min, max) {
    // 商的範圍：被除數一定落在 min～max 之間
    const qMin = Math.max(2, Math.ceil(min / d));
    const qMax = Math.max(qMin, Math.floor(max / d));
    const q = H.r(qMin, qMax);
    const rem = H.r(0, Math.min(d - 1, max - q * d));
    const a = q * d + rem;
    return { q: [a + ' ÷ ' + d + ' ＝ ？'], a: [rem ? q + ' … ' + rem : String(q)] };
  }
})((window.NP = window.NP || {}));
