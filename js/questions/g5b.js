/*
 * 5 下（第十冊）出題規則。
 * 題型參考該冊月考卷與教師手冊，數字皆為隨機產生，不收錄原題。
 * 分數答案寫成最簡分數；小數用整數運算後再換回小數，避免浮點誤差。
 */
(function (NP) {
  'use strict';

  /** 整數 x 除以 10 的 k 次方，寫成小數字串 */
  function dp(x, k) {
    return String(x / 10 ** k);
  }

  /** 題目裡的帶分數：分數部分約成最簡（值不變，答案照原本的分子分母計算） */
  function mixedQ(H, num, den) {
    const w = Math.floor(num / den);
    const r = num % den;
    if (!r) return String(w);
    const [n, d] = H.reduce(r, den);
    return H.f(w, n, d);
  }

  /** 1～d-1 中和 d 互質的數，讓題目裡的分數一開始就是最簡分數 */
  function coprime(H, d) {
    for (;;) {
      const n = H.r(1, d - 1);
      if (H.gcd(n, d) === 1) return n;
    }
  }

  /** 隨機真分數 [分子, 分母]（最簡） */
  function proper(H, dens) {
    for (;;) {
      const d = H.pick(dens || [2, 3, 4, 5, 6, 7, 8, 9, 10, 12]);
      const n = H.r(1, d - 1);
      if (H.gcd(n, d) === 1) return [n, d];
    }
  }

  /** 秒數 → 「幾時幾分幾秒」，只列出不是 0 的部分 */
  function hms(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const parts = [];
    if (h) parts.push(h + ' 時');
    if (m) parts.push(m + ' 分');
    if (s) parts.push(s + ' 秒');
    return parts.join(' ') || '0 秒';
  }

  NP.bank.register({
    id: 'g5b',
    grade: 5,
    term: '下',
    label: '5 下',
    units: [
      {
        id: 'g5b-01',
        no: 1,
        name: '體積',
        gens: [
          (H) => {
            const l = H.r(3, 30);
            const w = H.r(2, 20);
            const h = H.r(2, 15);
            return {
              q: ['長方體的長 ' + l + ' 公分、寬 ' + w + ' 公分、高 ' + h + ' 公分，體積是多少立方公分？'],
              a: [l * w * h + ' 立方公分'],
            };
          },
          (H) => {
            const a = H.r(2, 20);
            return { q: ['正方體的邊長是 ' + a + ' 公分，體積是多少立方公分？'], a: [a * a * a + ' 立方公分'] };
          },
          (H) => {
            const m = H.r(1, 30);
            if (H.r(0, 1)) return { q: [m + ' 立方公尺 ＝ ？立方公分'], a: [m * 1000000 + ' 立方公分'] };
            return { q: [m * 1000000 + ' 立方公分 ＝ ？立方公尺'], a: [m + ' 立方公尺'] };
          },
          (H) => {
            const l1 = H.r(4, 15);
            const w = H.r(3, 10);
            const h1 = H.r(2, 10);
            const l2 = H.r(2, 10);
            const h2 = H.r(2, 10);
            return {
              q: ['兩個長方體黏在一起：一個是長 ' + l1 + '、寬 ' + w + '、高 ' + h1 + ' 公分，另一個是長 ' + l2 + '、寬 ' + w + '、高 ' + h2 + ' 公分，合起來體積是多少立方公分？'],
              a: [l1 * w * h1 + l2 * w * h2 + ' 立方公分'],
            };
          },
        ],
      },
      {
        id: 'g5b-02',
        no: 2,
        name: '分數的計算',
        gens: [
          (H) => {
            const [n, d] = proper(H);
            const k = H.r(2, 30);
            return { q: [k + ' × ', H.f(0, n, d), ' ＝ ？'], a: [H.frac(k * n, d)] };
          },
          (H) => {
            const [n1, d1] = proper(H);
            const [n2, d2] = proper(H);
            return { q: [H.f(0, n1, d1), ' × ', H.f(0, n2, d2), ' ＝ ？'], a: [H.frac(n1 * n2, d1 * d2)] };
          },
          (H) => {
            const d1 = H.r(2, 6);
            const a = H.r(1, 3) * d1 + H.r(1, d1 - 1);
            const [n2, d2] = proper(H);
            return { q: [mixedQ(H, a, d1), ' × ', H.f(0, n2, d2), ' ＝ ？'], a: [H.frac(a * n2, d1 * d2)] };
          },
          (H) => {
            const [n, d] = proper(H);
            const k = H.r(2, 9);
            return { q: [H.f(0, n, d), ' ÷ ' + k + ' ＝ ？'], a: [H.frac(n, d * k)] };
          },
          (H) => {
            // 全班人數控制在 20～36 人，而且要能被分母整除
            const [n, d] = proper(H, [2, 3, 4, 5, 6, 8, 10]);
            const total = d * H.r(Math.ceil(20 / d), Math.floor(36 / d));
            return {
              q: ['全班有 ' + total + ' 人，其中 ', H.f(0, n, d), ' 是男生，男生有幾人？'],
              a: [(total * n) / d + ' 人'],
            };
          },
        ],
      },
      {
        id: 'g5b-03',
        no: 3,
        name: '容積',
        gens: [
          (H) => {
            const l = H.r(5, 30);
            const w = H.r(5, 25);
            const h = H.r(5, 20);
            return {
              q: ['長方體容器內部長 ' + l + ' 公分、寬 ' + w + ' 公分、高 ' + h + ' 公分，容積是多少立方公分？'],
              a: [l * w * h + ' 立方公分'],
            };
          },
          (H) => {
            const t = H.r(1, 2);
            const l = H.r(8, 30);
            const w = H.r(8, 25);
            const h = H.r(8, 20);
            const lid = H.r(0, 1);
            const inner = (l - 2 * t) * (w - 2 * t) * (h - (lid ? 2 : 1) * t);
            return {
              q: [(lid ? '有蓋' : '無蓋') + '的長方體木盒，外面量長 ' + l + ' 公分、寬 ' + w + ' 公分、高 ' + h + ' 公分，木板厚 ' + t + ' 公分，容積是多少立方公分？'],
              a: [inner + ' 立方公分'],
            };
          },
          (H) => {
            const kind = H.r(0, 2);
            if (kind === 0) {
              const l = H.r(1, 30);
              return { q: [l + ' 公升 ＝ ？立方公分'], a: [l * 1000 + ' 立方公分'] };
            }
            if (kind === 1) {
              const ml = H.r(5, 999);
              return { q: [ml + ' 毫升 ＝ ？立方公分'], a: [ml + ' 立方公分'] };
            }
            const m = H.r(1, 20);
            return { q: [m + ' 立方公尺 ＝ ？公升'], a: [m * 1000 + ' 公升'] };
          },
          (H) => {
            const l = H.r(10, 30);
            const w = H.r(10, 25);
            const rise = H.r(1, 6);
            const before = H.r(5, 15);
            return {
              q: ['長方體水箱內部長 ' + l + ' 公分、寬 ' + w + ' 公分，放入一顆石頭後，水深從 ' + before + ' 公分升到 ' + (before + rise) + ' 公分，石頭的體積是多少立方公分？'],
              a: [l * w * rise + ' 立方公分'],
            };
          },
        ],
      },
      {
        id: 'g5b-04',
        no: 4,
        name: '小數的乘法',
        gens: [
          (H) => {
            const a = H.r(1001, 9999);
            const k = H.r(2, 9);
            return { q: [dp(a, 3) + ' × ' + k + ' ＝ ？'], a: [dp(a * k, 3)] };
          },
          (H) => {
            const n = H.r(2, 99);
            const b = H.r(11, 99);
            const k = H.r(1, 2);
            return { q: [n + ' × ' + dp(b, k) + ' ＝ ？'], a: [dp(n * b, k)] };
          },
          (H) => {
            const a = H.r(11, 999);
            const ka = H.r(1, 2);
            const b = H.r(2, 99);
            const kb = H.r(1, 2);
            return { q: [dp(a, ka) + ' × ' + dp(b, kb) + ' ＝ ？'], a: [dp(a * b, ka + kb)] };
          },
          (H) => {
            const price = H.r(20, 150);
            const kg = H.r(11, 99);
            return {
              q: ['一公斤的香蕉賣 ' + price + ' 元，買 ' + dp(kg, 1) + ' 公斤要多少元？'],
              a: [dp(price * kg, 1) + ' 元'],
            };
          },
        ],
      },
      {
        id: 'g5b-05',
        no: 5,
        name: '大數與折線圖',
        gens: [
          (H) => {
            const yi = H.r(1, 9999);
            const wan = H.r(0, 9999);
            const n = yi * 100000000 + wan * 10000;
            const text = yi + ' 億' + (wan ? ' ' + wan + ' 萬' : '');
            return { q: [text + '，用數字寫是多少？'], a: [String(n)] };
          },
          (H) => {
            const zhao = H.r(1, 999);
            const yi = H.r(1, 9999);
            return { q: [zhao + ' 兆 ' + yi + ' 億 是幾個億？'], a: [zhao * 10000 + yi + ' 個億'] };
          },
          (H) => {
            const [from, fromV] = H.pick([
              ['0.001', -3],
              ['0.01', -2],
              ['0.1', -1],
              ['1', 0],
            ]);
            const k = H.r(1, 3);
            const times = 10 ** k;
            const result = fromV + k;
            const ans = result >= 0 ? String(10 ** result) : String(1 / 10 ** -result);
            return { q: [from + ' 的 ' + times + ' 倍是多少？'], a: [ans] };
          },
          (H) => {
            const places = [
              ['千億', 11],
              ['百億', 10],
              ['十億', 9],
              ['億', 8],
              ['千萬', 7],
              ['百萬', 6],
            ];
            const digits = [H.r(1, 9)];
            for (let i = 0; i < 11; i++) digits.push(H.r(0, 9));
            const text = digits.join('');
            const [name, pow] = H.pick(places);
            const digit = digits[11 - pow];
            return { q: ['在 ' + text + ' 這個數中，' + name + '位的數字是多少？'], a: [String(digit)] };
          },
        ],
      },
      {
        id: 'g5b-06',
        no: 6,
        name: '整數、小數除以整數',
        gens: [
          (H) => {
            // 除數是 2、4、5、8 時一定除得盡，商最多三位小數
            const d = H.pick([2, 4, 5, 8]);
            let a = H.r(3, 299);
            if (a % d === 0) a += 1;
            return { q: [a + ' ÷ ' + d + ' ＝ ？（除到沒有餘數）'], a: [String(a / d)] };
          },
          (H) => {
            const d = H.r(2, 9);
            const q = H.r(101, 999);
            const k = H.r(1, 2);
            return { q: [dp(q * d, k) + ' ÷ ' + d + ' ＝ ？'], a: [dp(q, k)] };
          },
          (H) => {
            for (;;) {
              const a = H.r(10, 99);
              const d = H.pick([3, 6, 7, 9, 11]);
              if (a % d === 0) continue;
              // 四捨五入到小數第二位：用整數運算 round(a × 100 / d)
              const r = Math.round((a * 100) / d);
              return {
                q: [a + ' ÷ ' + d + '，商用四捨五入法取概數到小數第二位。'],
                a: ['約 ' + (r / 100).toFixed(2)],
              };
            }
          },
          (H) => {
            const [n, d] = H.pick([
              [1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 8], [3, 8], [5, 8], [7, 8],
              [1, 20], [3, 20], [7, 20], [9, 20], [1, 25], [4, 25], [12, 25],
            ]);
            const w = H.r(0, 3);
            const value = String(w + n / d);
            return { q: [H.f(w, n, d), ' 化成小數是多少？'], a: [value] };
          },
          (H) => {
            const w = H.r(0, 5);
            const x = H.r(1, 99);
            const k = x % 10 === 0 ? 1 : 2;
            const num = k === 1 ? x / 10 : x;
            const value = w + num / 10 ** k;
            return { q: [String(H.dec(value, 2)) + ' 化成分數是多少？（約成最簡分數）'], a: [H.frac(w * 10 ** k + num, 10 ** k)] };
          },
        ],
      },
      {
        id: 'g5b-07',
        no: 7,
        name: '表面積',
        gens: [
          (H) => {
            const a = H.r(2, 25);
            return { q: ['正方體的邊長 ' + a + ' 公分，表面積是多少平方公分？'], a: [a * a * 6 + ' 平方公分'] };
          },
          (H) => {
            const l = H.r(3, 25);
            const w = H.r(2, 20);
            const h = H.r(2, 15);
            return {
              q: ['長方體的長 ' + l + ' 公分、寬 ' + w + ' 公分、高 ' + h + ' 公分，表面積是多少平方公分？'],
              a: [2 * (l * w + l * h + w * h) + ' 平方公分'],
            };
          },
          (H) => {
            const a = H.r(2, 12);
            const n = H.r(2, 5);
            return {
              q: ['把 ' + n + ' 個邊長 ' + a + ' 公分的正方體排成一排，黏成一個長方體，表面積是多少平方公分？'],
              a: [a * a * (4 * n + 2) + ' 平方公分'],
            };
          },
        ],
      },
      {
        id: 'g5b-08',
        no: 8,
        name: '比率與百分率',
        gens: [
          (H) => {
            const total = H.pick([20, 25, 40, 50]);
            const part = H.r(1, total - 1);
            return {
              q: ['全班 ' + total + ' 人，有 ' + part + ' 人戴眼鏡，戴眼鏡的人占全班的百分之幾？'],
              a: [(part * 100) / total + '%'],
            };
          },
          (H) => {
            const p = H.r(1, 99);
            if (H.r(0, 1)) return { q: [dp(p, 2) + ' ＝ ？%'], a: [p + '%'] };
            return { q: [p + '% 化成小數是多少？'], a: [dp(p, 2)] };
          },
          (H) => {
            const [n, d] = H.pick([
              [1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 10], [3, 10], [7, 10], [9, 10],
              [1, 20], [7, 20], [1, 25], [6, 25], [1, 50], [13, 50],
            ]);
            return { q: [H.f(0, n, d), ' ＝ ？%'], a: [(n * 100) / d + '%'] };
          },
          (H) => {
            const price = H.r(10, 200) * 10;
            const off = H.r(5, 9);
            return {
              q: ['一件衣服原價 ' + price + ' 元，打 ' + off + ' 折後賣多少元？'],
              a: [(price * off) / 10 + ' 元'],
            };
          },
          (H) => {
            const price = H.r(5, 15) * 10;
            const up = H.r(1, 3);
            return {
              q: ['一個便當原價 ' + price + ' 元，漲價 ' + up + ' 成，現在賣多少元？'],
              a: [(price * (10 + up)) / 10 + ' 元'],
            };
          },
        ],
      },
      {
        id: 'g5b-09',
        no: 9,
        name: '時間的乘除',
        gens: [
          (H) => {
            const m = H.r(1, 40);
            const s = H.r(5, 59);
            const k = H.r(2, 9);
            return { q: [hms(m * 60 + s) + ' × ' + k + ' ＝ ？'], a: [hms((m * 60 + s) * k)] };
          },
          (H) => {
            const h = H.r(1, 9);
            const m = H.r(5, 59);
            const k = H.r(2, 6);
            return { q: [hms(h * 3600 + m * 60) + ' × ' + k + ' ＝ ？'], a: [hms((h * 3600 + m * 60) * k)] };
          },
          (H) => {
            const k = H.r(2, 9);
            const each = H.r(2, 40) * 60 + H.r(0, 59);
            return { q: [hms(each * k) + ' ÷ ' + k + ' ＝ ？'], a: [hms(each)] };
          },
          (H) => {
            const [n, d] = H.pick([[1, 4], [1, 2], [3, 4], [1, 5], [2, 5], [1, 3], [2, 3], [1, 6], [5, 6], [1, 10], [3, 10], [1, 12], [5, 12]]);
            if (H.r(0, 1)) return { q: [H.f(0, n, d), ' 時 ＝ ？分'], a: [(60 * n) / d + ' 分'] };
            return { q: [(60 * n) / d + ' 分 ＝ ？時（用最簡分數表示）'], a: [H.f(0, n, d), ' 時'] };
          },
          (H) => {
            const per = H.r(2, 9) * 60 + H.r(5, 55);
            const n = H.r(3, 8);
            return {
              q: ['做一個風箏要 ' + hms(per) + '，做 ' + n + ' 個要多久？'],
              a: [hms(per * n)],
            };
          },
        ],
      },
      {
        id: 'g5b-10',
        no: 10,
        name: '生活中的大單位',
        gens: [
          (H) => {
            const m = H.r(1, 99999);
            if (H.r(0, 1)) return { q: [m + ' 公尺 ＝ ？公里'], a: [dp(m, 3) + ' 公里'] };
            return { q: [dp(m, 3) + ' 公里 ＝ ？公尺'], a: [m + ' 公尺'] };
          },
          (H) => {
            const kg = H.r(1, 99999);
            if (H.r(0, 1)) return { q: [kg + ' 公斤 ＝ ？公噸'], a: [dp(kg, 3) + ' 公噸'] };
            return { q: [dp(kg, 3) + ' 公噸 ＝ ？公斤'], a: [kg + ' 公斤'] };
          },
          (H) => {
            const kind = H.r(0, 3);
            const n = H.r(1, 99);
            if (kind === 0) return { q: [n + ' 公畝 ＝ ？平方公尺'], a: [n * 100 + ' 平方公尺'] };
            if (kind === 1) return { q: [n + ' 公頃 ＝ ？平方公尺'], a: [n * 10000 + ' 平方公尺'] };
            if (kind === 2) return { q: [n + ' 公頃 ＝ ？公畝'], a: [n * 100 + ' 公畝'] };
            return { q: [n + ' 平方公里 ＝ ？公頃'], a: [n * 100 + ' 公頃'] };
          },
          (H) => {
            const truck = H.r(2, 15);
            const box = H.r(10, 60);
            const n = H.r(20, 300);
            const total = box * n;
            return {
              q: ['卡車最多可載 ' + truck + ' 公噸，每箱貨物重 ' + box + ' 公斤，' + n + ' 箱共重幾公噸？卡車載得動嗎？'],
              a: [dp(total, 3) + ' 公噸，' + (total <= truck * 1000 ? '載得動' : '載不動')],
            };
          },
        ],
      },
    ],
  });
})((window.NP = window.NP || {}));
