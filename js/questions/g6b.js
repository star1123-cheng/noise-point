/*
 * 6 下（第十二冊）出題規則。
 * 題型參考該冊月考卷與教師手冊，數字皆為隨機產生，不收錄原題。
 * 分數答案用最簡分數；圓周率用 3.14（與考卷一致）。
 */
(function (NP) {
  'use strict';

  /** 隨機最簡真分數 [分子, 分母] */
  function proper(H, dens) {
    for (;;) {
      const d = H.pick(dens || [2, 3, 4, 5, 6, 8, 9, 10, 12]);
      const n = H.r(1, d - 1);
      if (H.gcd(n, d) === 1) return [n, d];
    }
  }

  /** 以「百分之一」為單位的整數 → 小數字串 */
  function cent(x) {
    return String(x / 100);
  }

  // 能化成有限小數的分數（分母 2、4、5、8、10、20、25）
  const DEC_FRACS = [
    [1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 8], [3, 8], [5, 8], [7, 8],
    [1, 10], [3, 10], [7, 10], [9, 10], [1, 20], [3, 20], [1, 25],
  ];

  NP.bank.register({
    id: 'g6b',
    grade: 6,
    term: '下',
    label: '6 下',
    units: [
      {
        id: 'g6b-01',
        no: 1,
        name: '小數與分數的計算',
        gens: [
          (H) => {
            // 分數加減乘除混合：a/b ＋ c/d × e
            const [n1, d1] = proper(H);
            const [n2, d2] = proper(H);
            const k = H.r(2, 9);
            return {
              q: [H.f(0, n1, d1), ' ＋ ', H.f(0, n2, d2), ' × ' + k + ' ＝ ？'],
              a: [H.frac(n1 * d2 + n2 * k * d1, d1 * d2)],
            };
          },
          (H) => {
            const [n1, d1] = proper(H);
            const [n2, d2] = proper(H);
            const [n3, d3] = proper(H);
            // n1/d1 × n2/d2 ÷ n3/d3
            return {
              q: [H.f(0, n1, d1), ' × ', H.f(0, n2, d2), ' ÷ ', H.f(0, n3, d3), ' ＝ ？'],
              a: [H.frac(n1 * n2 * d3, d1 * d2 * n3)],
            };
          },
          (H) => {
            // 小數與分數混合加法，答案用分數
            const [n, d] = H.pick(DEC_FRACS);
            const x = H.r(1, 99);
            const k = x % 10 === 0 ? 1 : 2;
            const num = k === 1 ? x / 10 : x;
            const den = 10 ** k;
            return {
              q: [num / den + ' ＋ ', H.f(0, n, d), ' ＝ ？（用分數表示）'],
              a: [H.frac(num * d + n * den, den * d)],
            };
          },
          (H) => {
            // 小數四則：a ＋ b × c（b 一位小數、c 整數）
            const a = H.r(11, 999) / 10;
            const b = H.r(11, 99) / 10;
            const c = H.r(2, 9);
            return { q: [a + ' ＋ ' + b + ' × ' + c + ' ＝ ？'], a: [String(H.dec(a + b * c, 1))] };
          },
          (H) => {
            // 簡化計算：用分配律
            const [x, y] = H.pick([
              [0.25, 0.75],
              [1.25, 0.75],
              [2.6, 7.4],
              [3.7, 6.3],
              [0.48, 0.52],
              [1.5, 8.5],
            ]);
            const n = H.r(3, 48);
            return {
              q: [n + ' × ' + x + ' ＋ ' + n + ' × ' + y + ' ＝ ？（用簡便的方法算）'],
              a: [String(H.dec(n * (x + y), 2))],
            };
          },
        ],
      },
      {
        id: 'g6b-02',
        no: 2,
        name: '速率的應用',
        gens: [
          (H) => {
            const a = H.r(40, 90);
            const b = H.r(40, 90);
            const t = H.r(2, 5);
            return {
              q: ['甲、乙兩地相距 ' + (a + b) * t + ' 公里，兩輛車同時從兩地出發相向而行，時速分別是 ' + a + ' 公里和 ' + b + ' 公里，幾小時後相遇？'],
              a: [t + ' 小時'],
            };
          },
          (H) => {
            const a = H.r(50, 120);
            const b = H.r(40, a - 5);
            const t = H.r(3, 20);
            return {
              q: ['哥哥分速 ' + a + ' 公尺，弟弟分速 ' + b + ' 公尺，兩人同時從同一地點往同方向走，' + t + ' 分鐘後相距幾公尺？'],
              a: [(a - b) * t + ' 公尺'],
            };
          },
          (H) => {
            const fast = H.r(60, 120);
            const slow = H.r(30, fast - 10);
            const t = H.r(3, 15);
            const head = (fast - slow) * t;
            return {
              q: ['弟弟先出發，走了 ' + head + ' 公尺後，哥哥才從同一地點出發追趕。哥哥分速 ' + fast + ' 公尺，弟弟分速 ' + slow + ' 公尺，哥哥幾分鐘後追上弟弟？'],
              a: [t + ' 分鐘'],
            };
          },
          (H) => {
            // 先決定平均時速，再反推單程距離，答案一定是整數
            const t1 = H.r(1, 4);
            const t2 = H.r(1, 4);
            let avg = H.r(20, 80);
            if ((avg * (t1 + t2)) % 2) avg += 1;
            const d = (avg * (t1 + t2)) / 2;
            return {
              q: ['從家到外婆家 ' + d + ' 公里，去程花 ' + t1 + ' 小時，回程花 ' + t2 + ' 小時，來回的平均時速是幾公里？'],
              a: ['時速 ' + avg + ' 公里'],
            };
          },
          (H) => {
            const boat = H.r(10, 30);
            const water = H.r(2, 6);
            const t = H.r(2, 6);
            const down = H.r(0, 1);
            const v = down ? boat + water : boat - water;
            return {
              q: ['船在靜水中時速 ' + boat + ' 公里，水流時速 ' + water + ' 公里，船' + (down ? '順流' : '逆流') + '航行 ' + v * t + ' 公里，要幾小時？'],
              a: [t + ' 小時'],
            };
          },
        ],
      },
      {
        id: 'g6b-03',
        no: 3,
        name: '柱體體積與表面積',
        gens: [
          (H) => {
            const a = H.r(3, 20);
            let b = H.r(3, 20);
            if ((a * b) % 2) b += 1;
            const h = H.r(3, 30);
            return {
              q: ['三角柱的底面是直角三角形，兩股長 ' + a + ' 公分和 ' + b + ' 公分，柱高 ' + h + ' 公分，體積是多少立方公分？'],
              a: [((a * b) / 2) * h + ' 立方公分'],
            };
          },
          (H) => {
            const r = H.r(1, 12);
            const h = H.r(2, 25);
            return {
              q: ['圓柱的底面半徑 ' + r + ' 公分、高 ' + h + ' 公分，體積是多少立方公分？（圓周率用 3.14）'],
              a: [cent(r * r * 314 * h) + ' 立方公分'],
            };
          },
          (H) => {
            const b = H.r(3, 20);
            const hb = H.r(2, 15);
            const h = H.r(3, 25);
            return {
              q: ['四角柱的底面是平行四邊形，底 ' + b + ' 公分、高 ' + hb + ' 公分，柱高 ' + h + ' 公分，體積是多少立方公分？'],
              a: [b * hb * h + ' 立方公分'],
            };
          },
          (H) => {
            const r = H.r(1, 10);
            const h = H.r(2, 20);
            // 表面積 = 兩個底面 ＋ 側面 = 2 × r × r × 3.14 ＋ 2 × r × 3.14 × h
            const total = 2 * r * r * 314 + 2 * r * 314 * h;
            return {
              q: ['圓柱的底面半徑 ' + r + ' 公分、高 ' + h + ' 公分，表面積是多少平方公分？（圓周率用 3.14）'],
              a: [cent(total) + ' 平方公分'],
            };
          },
          (H) => {
            const base = H.r(12, 300);
            const h = H.r(3, 20);
            return {
              q: ['柱體的底面積是 ' + base + ' 平方公分，體積是 ' + base * h + ' 立方公分，柱高是幾公分？'],
              a: [h + ' 公分'],
            };
          },
        ],
      },
      {
        id: 'g6b-04',
        no: 4,
        name: '基準量與比較量',
        gens: [
          (H) => {
            const [n, d] = proper(H, [2, 3, 4, 5, 6, 7, 8]);
            const base = d * H.r(5, 60);
            return {
              q: ['哥哥有 ' + base + ' 元，弟弟的錢是哥哥的 ', H.f(0, n, d), '，弟弟有幾元？'],
              a: [(base * n) / d + ' 元'],
            };
          },
          (H) => {
            const [n, d] = proper(H, [2, 3, 4, 5, 6, 7, 8]);
            const base = d * H.r(5, 60);
            return {
              q: ['弟弟有 ' + (base * n) / d + ' 元，是哥哥的 ', H.f(0, n, d), '，哥哥有幾元？'],
              a: [base + ' 元'],
            };
          },
          (H) => {
            const [n, d] = proper(H, [2, 3, 4, 5, 6, 7, 8]);
            const k = H.r(3, 40);
            const base = d * k;
            const other = n * k;
            return {
              q: ['妹妹的彩色筆枝數是姐姐的 ', H.f(0, n, d), '，兩人共有 ' + (base + other) + ' 枝，姐姐有幾枝？'],
              a: [base + ' 枝'],
            };
          },
          (H) => {
            const [n, d] = proper(H, [3, 4, 5, 6, 7, 8]);
            const k = H.r(3, 40);
            return {
              q: ['乙繩長是甲繩的 ', H.f(0, n, d), '，甲繩比乙繩長 ' + (d - n) * k + ' 公分，甲繩長幾公分？'],
              a: [d * k + ' 公分'],
            };
          },
          (H) => {
            const [n, d] = proper(H, [3, 4, 5, 6, 7, 8, 9]);
            return {
              q: ['以哥哥的身高當作 1，弟弟的身高是 ', H.f(0, n, d), '。如果以弟弟的身高當作 1，哥哥的身高是多少？'],
              a: [H.frac(d, n)],
            };
          },
        ],
      },
      {
        id: 'g6b-05',
        no: 5,
        name: '怎樣解題',
        gens: [
          (H) => {
            const big = H.r(20, 200);
            const small = H.r(5, big - 2);
            return {
              q: ['兩數的和是 ' + (big + small) + '，差是 ' + (big - small) + '，較大的數是多少？'],
              a: [String(big)],
            };
          },
          (H) => {
            // 爸爸要比小美大 22～45 歲才合理
            let child;
            let k;
            let later;
            let dad;
            do {
              child = H.r(5, 12);
              k = H.r(2, 4);
              later = H.r(1, 15);
              dad = k * (child + later) - later;
            } while (dad - child < 22 || dad - child > 45);
            return {
              q: ['爸爸今年 ' + dad + ' 歲，小美今年 ' + child + ' 歲，幾年後爸爸的年齡是小美的 ' + k + ' 倍？'],
              a: [later + ' 年後'],
            };
          },
          (H) => {
            const chick = H.r(3, 30);
            const rabbit = H.r(3, 30);
            return {
              q: ['籠子裡有雞和兔共 ' + (chick + rabbit) + ' 隻，腳共有 ' + (chick * 2 + rabbit * 4) + ' 隻，兔子有幾隻？'],
              a: [rabbit + ' 隻'],
            };
          },
          (H) => {
            const a = H.r(2, 6);
            const b = H.r(2, 6);
            const c = H.r(2, 4);
            return {
              q: ['有 ' + a + ' 件上衣、' + b + ' 件褲子和 ' + c + ' 雙鞋子，各選一樣來搭配，共有幾種穿法？'],
              a: [a * b * c + ' 種'],
            };
          },
          (H) => {
            const n = H.r(4, 12);
            return {
              q: [n + ' 個人，每兩人都要握一次手，共要握幾次手？'],
              a: [(n * (n - 1)) / 2 + ' 次'],
            };
          },
        ],
      },
      {
        id: 'g6b-06',
        no: 6,
        name: '圓形圖',
        gens: [
          (H) => {
            const p = H.r(1, 19) * 5;
            const total = H.pick([20, 40, 60, 80, 100, 200, 300, 400, 500]);
            return {
              q: ['有 ' + total + ' 人參加興趣調查，在圓形百分圖中，喜歡打球的人占 ' + p + '%，喜歡打球的有幾人？'],
              a: [(total * p) / 100 + ' 人'],
            };
          },
          (H) => {
            const angle = H.r(1, 19) * 18;
            return {
              q: ['圓形圖中，某一部分的扇形圓心角是 ' + angle + '°，這部分占全部的百分之幾？'],
              a: [(angle / 18) * 5 + '%'],
            };
          },
          (H) => {
            const p = H.r(1, 19) * 5;
            return {
              q: ['在圓形圖中，占全部 ' + p + '% 的部分，扇形的圓心角是幾度？'],
              a: [H.dec(p * 3.6, 1) + '°'],
            };
          },
        ],
      },
    ],
  });
})((window.NP = window.NP || {}));
