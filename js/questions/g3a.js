/*
 * 3 上（第五冊）出題規則。
 * 題型參考該冊月考卷與教師手冊，數字皆為隨機產生，不收錄原題。
 * 3 年級分數只到「幾分之幾」，答案不約分（與考卷一致）。
 */
(function (NP) {
  'use strict';

  const PLACES = [
    ['千', 1000],
    ['百', 100],
    ['十', 10],
    ['一', 1],
  ];

  /** 毫米 → 「幾公分幾毫米」 */
  function cmmm(x) {
    const cm = Math.floor(x / 10);
    const mm = x % 10;
    if (!cm) return mm + ' 毫米';
    return mm ? cm + ' 公分 ' + mm + ' 毫米' : cm + ' 公分';
  }

  /** 毫升 → 「幾公升幾毫升」 */
  function lml(x) {
    const l = Math.floor(x / 1000);
    const ml = x % 1000;
    if (!l) return ml + ' 毫升';
    return ml ? l + ' 公升 ' + ml + ' 毫升' : l + ' 公升';
  }

  NP.bank.register({
    id: 'g3a',
    grade: 3,
    term: '上',
    label: '3 上',
    units: [
      {
        id: 'g3a-01',
        no: 1,
        name: '10000 以內的數',
        gens: [
          (H) => {
            // 隨機挑 2～4 個位值，例如「4 個千、5 個百和 13 個一」
            const chosen = PLACES.filter(() => Math.random() < 0.6);
            while (chosen.length < 2) {
              const p = H.pick(PLACES);
              if (!chosen.includes(p)) chosen.push(p);
            }
            chosen.sort((x, y) => y[1] - x[1]);
            let total = 0;
            const parts = chosen.map(([name, value], i) => {
              // 最後一個位值偶爾給超過 9 個，練習進位
              const d = i === chosen.length - 1 && value < 1000 && H.r(0, 2) === 0 ? H.r(10, 19) : H.r(1, 9);
              total += d * value;
              return d + ' 個' + name;
            });
            const text = parts.slice(0, -1).join('、') + '和 ' + parts[parts.length - 1];
            return { q: [text + '合起來是多少？'], a: [String(total)] };
          },
          (H) => {
            const step = H.pick([1, 10, 100, 1000]);
            const sign = H.pick([1, -1]);
            const len = 5;
            const start = sign > 0 ? H.r(1000, 9999 - step * len) : H.r(1000 + step * len, 9999);
            const seq = [];
            for (let i = 0; i < len; i++) seq.push(start + sign * step * i);
            const hole = H.r(1, len - 1);
            const ans = seq[hole];
            const shown = seq.map((v, i) => (i === hole ? '？' : String(v)));
            return { q: ['按照順序填填看：' + shown.join('、')], a: [String(ans)] };
          },
          (H) => {
            const digits = H.sample([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 4);
            const desc = digits.slice().sort((x, y) => y - x);
            const asc = digits.slice().sort((x, y) => x - y);
            if (asc[0] === 0) [asc[0], asc[1]] = [asc[1], asc[0]];
            if (H.r(0, 1)) {
              return { q: ['用 ' + digits.join('、') + ' 四個數字，組成最大的四位數是多少？'], a: [desc.join('')] };
            }
            return { q: ['用 ' + digits.join('、') + ' 四個數字，組成最小的四位數是多少？'], a: [asc.join('')] };
          },
          (H) => {
            const n = H.r(1000, 9999);
            const [name, value] = H.pick(PLACES);
            const digit = Math.floor(n / value) % 10;
            const label = name === '一' ? '個' : name;
            return {
              q: ['在 ' + n + ' 這個數中，' + label + '位數字是多少？表示多少？'],
              a: [digit + '，表示 ' + digit * value],
            };
          },
        ],
      },
      {
        id: 'g3a-02',
        no: 2,
        name: '四位數的加減',
        gens: [
          (H) => {
            const a = H.r(1000, 8999);
            const b = H.r(100, 9999 - a);
            return { q: [a + ' ＋ ' + b + ' ＝ ？'], a: [String(a + b)] };
          },
          (H) => {
            const a = H.r(2000, 9999);
            const b = H.r(100, a - 100);
            return { q: [a + ' － ' + b + ' ＝ ？'], a: [String(a - b)] };
          },
          (H) => {
            const a = H.r(1000, 5000);
            const b = H.r(300, 3999);
            return {
              q: ['圖書館有故事書 ' + a + ' 本，又買進 ' + b + ' 本，現在有多少本？'],
              a: [a + b + ' 本'],
            };
          },
          (H) => {
            const a = H.r(3000, 9999);
            const b = H.r(500, a - 500);
            return {
              q: ['學校有 ' + a + ' 張色紙，用掉 ' + b + ' 張，還剩下多少張？'],
              a: [a - b + ' 張'],
            };
          },
        ],
      },
      {
        id: 'g3a-03',
        no: 3,
        name: '毫米',
        gens: [
          (H) => {
            const x = H.r(11, 299);
            return { q: [x + ' 毫米 ＝ ？公分 ？毫米'], a: [cmmm(x)] };
          },
          (H) => {
            const cm = H.r(1, 40);
            const mm = H.r(1, 9);
            return { q: [cm + ' 公分 ' + mm + ' 毫米 ＝ ？毫米'], a: [cm * 10 + mm + ' 毫米'] };
          },
          (H) => {
            const a = H.r(12, 199);
            const b = H.r(12, 199);
            return { q: [cmmm(a) + ' ＋ ' + cmmm(b) + ' ＝ ？'], a: [cmmm(a + b)] };
          },
          (H) => {
            const a = H.r(50, 299);
            const b = H.r(12, a - 5);
            return {
              q: ['鉛筆長 ' + cmmm(a) + '，橡皮擦長 ' + cmmm(b) + '，鉛筆比橡皮擦長多少？'],
              a: [cmmm(a - b)],
            };
          },
        ],
      },
      {
        id: 'g3a-04',
        no: 4,
        name: '乘法',
        gens: [
          (H) => {
            const a = H.r(12, 99);
            const b = H.r(2, 9);
            return { q: [a + ' × ' + b + ' ＝ ？'], a: [String(a * b)] };
          },
          (H) => {
            const a = H.r(101, 999);
            const b = H.r(2, 9);
            return { q: [a + ' × ' + b + ' ＝ ？'], a: [String(a * b)] };
          },
          (H) => {
            const a = H.r(2, 9);
            const b = H.r(2, 9);
            const c = H.r(2, 9);
            return {
              q: ['一盒有 ' + a + ' 顆巧克力，一箱裝 ' + b + ' 盒，' + c + ' 箱共有幾顆巧克力？'],
              a: [a * b * c + ' 顆'],
            };
          },
          (H) => {
            const price = H.r(15, 250);
            const n = H.r(3, 9);
            return {
              q: ['一本筆記本 ' + price + ' 元，買 ' + n + ' 本要付多少元？'],
              a: [price * n + ' 元'],
            };
          },
        ],
      },
      {
        id: 'g3a-05',
        no: 5,
        name: '角',
        gens: [
          (H) => {
            const h = H.pick([1, 2, 3, 4, 5, 7, 8, 9, 10, 11]);
            const kind = h === 3 || h === 9 ? '直角' : h <= 2 || h >= 10 ? '銳角' : '鈍角';
            return {
              q: ['時鐘 ' + h + ' 點整時，長針和短針所夾的角是直角、銳角還是鈍角？'],
              a: [kind],
            };
          },
          (H) => {
            const s = H.r(3, 30);
            return { q: ['正方形的一邊長 ' + s + ' 公分，四條邊合起來是幾公分？'], a: [s * 4 + ' 公分'] };
          },
          (H) => {
            const a = H.r(6, 40);
            const b = H.r(2, a - 1);
            return {
              q: ['長方形的長是 ' + a + ' 公分、寬是 ' + b + ' 公分，四條邊合起來是幾公分？'],
              a: [(a + b) * 2 + ' 公分'],
            };
          },
        ],
      },
      {
        id: 'g3a-06',
        no: 6,
        name: '面積',
        gens: [
          (H) => {
            const a = H.r(3, 12);
            const b = H.r(2, 9);
            return {
              q: ['用 1 平方公分的小正方形排成長方形，每排 ' + a + ' 個，排了 ' + b + ' 排，面積是多少平方公分？'],
              a: [a * b + ' 平方公分'],
            };
          },
          (H) => {
            const whole = H.r(4, 20);
            const half = H.r(1, 5) * 2;
            return {
              q: ['一個圖形由 ' + whole + ' 個 1 平方公分的正方形和 ' + half + ' 個半個 1 平方公分的三角形拼成，面積是多少平方公分？'],
              a: [whole + half / 2 + ' 平方公分'],
            };
          },
          (H) => {
            const a = H.r(15, 60);
            const b = H.r(5, a - 3);
            return {
              q: ['甲圖形的面積是 ' + a + ' 平方公分，乙圖形是 ' + b + ' 平方公分，甲比乙大多少平方公分？'],
              a: [a - b + ' 平方公分'],
            };
          },
        ],
      },
      {
        id: 'g3a-07',
        no: 7,
        name: '除法',
        gens: [
          (H) => {
            const d = H.r(2, 9);
            const q = H.r(2, 9);
            const rem = H.r(0, d - 1);
            const a = q * d + rem;
            return { q: [a + ' ÷ ' + d + ' ＝ ？'], a: [rem ? q + ' … ' + rem : String(q)] };
          },
          (H) => {
            const d = H.r(3, 9);
            const q = H.r(3, 9);
            const rem = H.r(1, d - 1);
            return {
              q: [q * d + rem + ' 顆糖果，每人分 ' + d + ' 顆，可以分給幾人？剩下幾顆？'],
              a: [q + ' 人，剩下 ' + rem + ' 顆'],
            };
          },
          (H) => {
            const d = H.r(3, 9);
            const q = H.r(3, 9);
            return {
              q: [q * d + ' 枝鉛筆平分給 ' + d + ' 人，每人分到幾枝？'],
              a: [q + ' 枝'],
            };
          },
        ],
      },
      {
        id: 'g3a-08',
        no: 8,
        name: '公升和毫升',
        gens: [
          (H) => {
            const l = H.r(1, 9);
            const ml = H.r(1, 999);
            return { q: [l + ' 公升 ' + ml + ' 毫升 ＝ ？毫升'], a: [l * 1000 + ml + ' 毫升'] };
          },
          (H) => {
            const x = H.r(1001, 9999);
            return { q: [x + ' 毫升 ＝ ？公升 ？毫升'], a: [lml(x)] };
          },
          (H) => {
            const a = H.r(1100, 4999);
            const b = H.r(150, 2999);
            return {
              q: ['水壺有 ' + lml(a) + ' 的水，再倒入 ' + lml(b) + '，共有多少水？'],
              a: [lml(a + b)],
            };
          },
          (H) => {
            const a = H.r(2000, 5999);
            const b = H.r(150, a - 200);
            return {
              q: ['一桶果汁有 ' + lml(a) + '，喝掉 ' + lml(b) + '，還剩下多少？'],
              a: [lml(a - b)],
            };
          },
        ],
      },
      {
        id: 'g3a-09',
        no: 9,
        name: '分數',
        gens: [
          (H) => {
            const d = H.r(3, 12);
            const n = H.r(1, d - 1);
            return {
              q: ['把一個披薩平分成 ' + d + ' 片，吃了 ' + n + ' 片，吃了幾分之幾個披薩？'],
              a: [H.f(0, n, d)],
            };
          },
          (H) => {
            const d = H.r(3, 12);
            const n = H.r(2, d - 1);
            return { q: [H.f(0, n, d), ' 是幾個 ', H.f(0, 1, d), '？'], a: [n + ' 個'] };
          },
          (H) => {
            const d = H.r(4, 12);
            const [a, b] = H.sample(Array.from({ length: d - 1 }, (_, i) => i + 1), 2);
            return {
              q: [H.f(0, a, d), ' 和 ', H.f(0, b, d), ' 哪一個比較大？'],
              a: [H.f(0, Math.max(a, b), d)],
            };
          },
          (H) => {
            const [a, b] = H.sample([2, 3, 4, 5, 6, 7, 8, 9, 10, 12], 2);
            return {
              q: [H.f(0, 1, a), ' 和 ', H.f(0, 1, b), ' 哪一個比較大？'],
              a: [H.f(0, 1, Math.min(a, b))],
            };
          },
        ],
      },
    ],
  });
})((window.NP = window.NP || {}));
