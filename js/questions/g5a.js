/*
 * 5 上（第九冊）出題規則。
 * 題型參考該冊月考卷與教師手冊，數字皆為隨機產生，不收錄原題。
 * 5 年級已學約分：分數答案寫成最簡分數（考卷也接受未約分的寫法，由老師判斷）。
 */
(function (NP) {
  'use strict';

  function divisors(n) {
    const list = [];
    for (let i = 1; i <= n; i++) if (n % i === 0) list.push(i);
    return list;
  }

  function lcm(H, a, b) {
    return (a / H.gcd(a, b)) * b;
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

  /** 千分位整數 → 小數字串，例如 12345 → 12.345 */
  function thou(x) {
    return String(x / 1000);
  }

  NP.bank.register({
    id: 'g5a',
    grade: 5,
    term: '上',
    label: '5 上',
    units: [
      {
        id: 'g5a-01',
        no: 1,
        name: '多位小數與加減',
        gens: [
          (H) => {
            const a = H.r(1001, 29999);
            const b = H.r(1001, 29999);
            return { q: [thou(a) + ' ＋ ' + thou(b) + ' ＝ ？'], a: [thou(a + b)] };
          },
          (H) => {
            const a = H.r(5001, 39999);
            const b = H.r(1001, a - 100);
            return { q: [thou(a) + ' － ' + thou(b) + ' ＝ ？'], a: [thou(a - b)] };
          },
          (H) => {
            const n = H.r(11, 999);
            if (H.r(0, 1)) return { q: [n + ' 個 0.001 是多少？'], a: [thou(n)] };
            return { q: [thou(n) + ' 是幾個 0.001？'], a: [n + ' 個'] };
          },
          (H) => {
            // 用整數運算做四捨五入，避免小數誤差
            let x = H.r(1001, 99999);
            if (x % 10 === 0) x += 3;
            if (H.r(0, 1)) {
              const r2 = Math.floor((x + 5) / 10);
              return {
                q: ['把 ' + thou(x) + ' 用四捨五入法取概數到小數第二位。'],
                a: [(r2 / 100).toFixed(2)],
              };
            }
            const r1 = Math.floor((x + 50) / 100);
            return {
              q: ['把 ' + thou(x) + ' 用四捨五入法取概數到小數第一位。'],
              a: [(r1 / 10).toFixed(1)],
            };
          },
          (H) => {
            const a = H.r(1100, 4999);
            const b = H.r(205, 1999);
            return {
              q: ['小明跑了 ' + thou(a) + ' 公里，小華比小明多跑 ' + thou(b) + ' 公里，小華跑了幾公里？'],
              a: [thou(a + b) + ' 公里'],
            };
          },
        ],
      },
      {
        id: 'g5a-02',
        no: 2,
        name: '因數與公因數',
        gens: [
          (H) => {
            const n = H.pick([12, 16, 18, 20, 24, 28, 30, 32, 36, 40, 42, 45, 48, 50, 54, 56, 60, 63, 64, 72]);
            return { q: ['寫出 ' + n + ' 的所有因數。'], a: [divisors(n).join('、')] };
          },
          (H) => {
            const g = H.r(2, 9);
            let a = g * H.r(2, 9);
            let b = g * H.r(2, 9);
            if (a === b) b += g;
            const common = divisors(H.gcd(a, b));
            return { q: [a + ' 和 ' + b + ' 的公因數有哪些？'], a: [common.join('、')] };
          },
          (H) => {
            const g = H.r(2, 12);
            const [x, y] = H.sample([2, 3, 5, 7], 2);
            const a = g * x;
            const b = g * y;
            return { q: [a + ' 和 ' + b + ' 的最大公因數是多少？'], a: [String(g)] };
          },
          (H) => {
            const g = H.r(3, 12);
            const [x, y] = H.sample([2, 3, 4, 5, 7], 2);
            const a = g * x;
            const b = g * y;
            const kids = H.gcd(a, b);
            return {
              q: ['有 ' + a + ' 顆糖果和 ' + b + ' 塊餅乾，要平分給一些小朋友，兩樣都剛好分完，最多可以分給幾人？'],
              a: [kids + ' 人'],
            };
          },
        ],
      },
      {
        id: 'g5a-03',
        no: 3,
        name: '倍數與公倍數',
        gens: [
          (H) => {
            const a = H.r(3, 15);
            const n = H.r(3, 6);
            const list = [];
            for (let i = 1; i <= n; i++) list.push(a * i);
            return { q: ['依序寫出 ' + a + ' 最小的 ' + n + ' 個倍數。'], a: [list.join('、')] };
          },
          (H) => {
            const [a, b] = H.sample([2, 3, 4, 5, 6, 8, 9, 10, 12, 15], 2);
            return { q: [a + ' 和 ' + b + ' 的最小公倍數是多少？'], a: [String(lcm(H, a, b))] };
          },
          (H) => {
            const a = H.r(3, 15);
            const limit = H.pick([50, 60, 80, 100]);
            return { q: [limit + ' 以內，' + a + ' 的倍數有幾個？'], a: [Math.floor(limit / a) + ' 個'] };
          },
          (H) => {
            const [a, b] = H.sample([4, 5, 6, 8, 9, 10, 12, 15], 2);
            return {
              q: ['甲公車每 ' + a + ' 分鐘一班，乙公車每 ' + b + ' 分鐘一班。兩車同時發車後，最少再過幾分鐘又會同時發車？'],
              a: [lcm(H, a, b) + ' 分鐘'],
            };
          },
        ],
      },
      {
        id: 'g5a-04',
        no: 4,
        name: '擴分、約分與通分',
        // 擴分與通分的答案本來就不是最簡分數
        raw: true,
        gens: [
          (H) => {
            const d = H.r(2, 9);
            const n = coprime(H, d);
            const k = H.r(2, 8);
            return { q: [H.f(0, n, d), ' ＝ ', H.f(0, '？', d * k), '（擴分）'], a: [H.f(0, n * k, d * k)] };
          },
          (H) => {
            let d = H.r(3, 12);
            let n = H.r(1, d - 1);
            [n, d] = H.reduce(n, d);
            if (d < 2) [n, d] = [1, 2];
            const k = H.r(2, 9);
            return { q: ['把 ', H.f(0, n * k, d * k), ' 約成最簡分數。'], a: [H.f(0, n, d)] };
          },
          (H) => {
            const [d1, d2] = H.sample([2, 3, 4, 5, 6, 8, 9, 10, 12], 2);
            const n1 = coprime(H, d1);
            const n2 = coprime(H, d2);
            const L = lcm(H, d1, d2);
            return {
              q: ['用最小公分母把 ', H.f(0, n1, d1), ' 和 ', H.f(0, n2, d2), ' 通分。'],
              a: [H.f(0, (n1 * L) / d1, L), ' 和 ', H.f(0, (n2 * L) / d2, L)],
            };
          },
          (H) => {
            // 兩個最簡分數、分母不同，所以一定不相等
            let n1;
            let d1;
            let n2;
            let d2;
            do {
              [d1, d2] = H.sample([3, 4, 5, 6, 7, 8, 9, 10, 12], 2);
              n1 = coprime(H, d1);
              n2 = coprime(H, d2);
            } while (H.gcd(n1, d1) !== 1 || H.gcd(n2, d2) !== 1);
            const big = n1 * d2 > n2 * d1 ? H.f(0, n1, d1) : H.f(0, n2, d2);
            return { q: [H.f(0, n1, d1), ' 和 ', H.f(0, n2, d2), ' 哪一個比較大？'], a: [big] };
          },
        ],
      },
      {
        id: 'g5a-05',
        no: 5,
        name: '多邊形與扇形',
        gens: [
          (H) => {
            const n = H.r(5, 12);
            return { q: [n + ' 邊形的內角和是幾度？'], a: [(n - 2) * 180 + '°'] };
          },
          (H) => {
            const a = H.r(30, 110);
            const b = H.r(30, 140 - Math.min(a, 100));
            const c = H.r(40, 120);
            const d = 360 - a - b - c;
            if (d <= 10 || d >= 180) return { q: ['四邊形的三個角是 90°、90°、' + a + '°，第四個角是幾度？'], a: [180 - a + '°'] };
            return { q: ['四邊形的三個角是 ' + a + '°、' + b + '°、' + c + '°，第四個角是幾度？'], a: [d + '°'] };
          },
          (H) => {
            const a = H.r(20, 100);
            const b = H.r(20, 150 - a);
            return { q: ['三角形的兩個角是 ' + a + '° 和 ' + b + '°，第三個角是幾度？'], a: [180 - a - b + '°'] };
          },
          (H) => {
            const angle = H.pick([30, 40, 45, 60, 72, 90, 120, 135, 144, 150, 180, 210, 240, 270, 300]);
            return { q: ['圓心角 ' + angle + '° 的扇形是圓的幾分之幾？'], a: [H.frac(angle, 360), ' 圓'] };
          },
        ],
      },
      {
        id: 'g5a-06',
        no: 6,
        name: '異分母分數的加減',
        gens: [
          (H) => {
            const [d1, d2] = H.sample([2, 3, 4, 5, 6, 8, 9, 10, 12], 2);
            const n1 = coprime(H, d1);
            const n2 = coprime(H, d2);
            return {
              q: [H.f(0, n1, d1), ' ＋ ', H.f(0, n2, d2), ' ＝ ？'],
              a: [H.frac(n1 * d2 + n2 * d1, d1 * d2)],
            };
          },
          (H) => {
            const [d1, d2] = H.sample([2, 3, 4, 5, 6, 8, 9, 10, 12], 2);
            const a = H.r(1, 5) * d1 + coprime(H, d1);
            const b = H.r(1, 4) * d2 + coprime(H, d2);
            return {
              q: [mixedQ(H, a, d1), ' ＋ ', mixedQ(H, b, d2), ' ＝ ？'],
              a: [H.frac(a * d2 + b * d1, d1 * d2)],
            };
          },
          (H) => {
            const [d1, d2] = H.sample([2, 3, 4, 5, 6, 8, 9, 10, 12], 2);
            let a = H.r(2, 6) * d1 + coprime(H, d1);
            let b = H.r(1, 4) * d2 + coprime(H, d2);
            let [x, y] = [d1, d2];
            if (a * d2 <= b * d1) [a, b, x, y] = [b, a, d2, d1];
            if (a * y === b * x) a += x;
            return {
              q: [mixedQ(H, a, x), ' － ', mixedQ(H, b, y), ' ＝ ？'],
              a: [H.frac(a * y - b * x, x * y)],
            };
          },
          (H) => {
            const [d1, d2] = H.sample([3, 4, 5, 6, 8, 10], 2);
            const a = H.r(1, 3) * d1 + coprime(H, d1);
            const b = H.r(1, 3) * d2 + coprime(H, d2);
            return {
              q: ['一瓶果汁有 ', mixedQ(H, a, d1), ' 公升，另一瓶有 ', mixedQ(H, b, d2), ' 公升，兩瓶共有幾公升？'],
              a: [H.frac(a * d2 + b * d1, d1 * d2), ' 公升'],
            };
          },
        ],
      },
      {
        id: 'g5a-07',
        no: 7,
        name: '線對稱圖形',
        gens: [
          (H) => {
            const n = H.r(3, 12);
            const names = { 3: '正三角形', 4: '正方形' };
            const name = names[n] || '正 ' + n + ' 邊形';
            return { q: [name + '有幾條對稱軸？'], a: [n + ' 條'] };
          },
          (H) => {
            const shape = H.pick([
              ['長方形', 2],
              ['菱形', 2],
              ['等腰三角形', 1],
              ['平行四邊形（不是長方形或菱形）', 0],
              ['等腰梯形', 1],
              ['箏形', 1],
            ]);
            return { q: [shape[0] + '有幾條對稱軸？'], a: [shape[1] + ' 條'] };
          },
        ],
      },
      {
        id: 'g5a-08',
        no: 8,
        name: '整數四則運算',
        gens: [
          (H) => {
            const a = H.r(12, 99);
            const b = H.r(2, 9);
            const c = H.r(100, 999);
            const d = H.r(2, 9);
            return { q: [a + ' × ' + b + ' ＋ ' + c * d + ' ÷ ' + d + ' ＝ ？'], a: [String(a * b + c)] };
          },
          (H) => {
            const n = H.r(12, 999);
            const base = H.pick([99, 999, 101, 1001]);
            return { q: [base + ' × ' + n + ' ＝ ？（用簡便的方法算）'], a: [String(base * n)] };
          },
          (H) => {
            const n = H.r(12, 99);
            const [x, y] = H.pick([
              [25, 4],
              [125, 8],
              [50, 2],
              [20, 5],
            ]);
            return { q: [x + ' × ' + n + ' × ' + y + ' ＝ ？'], a: [String(x * n * y)] };
          },
          (H) => {
            const price = H.r(10, 120) * 10 - 1;
            const n = H.r(12, 99);
            return {
              q: ['一個玩具賣 ' + price + ' 元，賣出 ' + n + ' 個，共賣得多少元？'],
              a: [price * n + ' 元'],
            };
          },
          (H) => {
            const per = H.r(10, 25);
            const box = H.r(5, 12);
            const boxes = H.r(10, 50);
            const price = H.r(50, 300) * 10;
            return {
              q: ['工廠做了 ' + per * box * boxes + ' 個蛋捲，每 ' + per + ' 個裝一袋，每 ' + box + ' 袋裝一箱，每箱賣 ' + price + ' 元，全部賣完可得多少元？'],
              a: [price * boxes + ' 元'],
            };
          },
        ],
      },
      {
        id: 'g5a-09',
        no: 9,
        name: '面積',
        gens: [
          (H) => {
            const b = H.r(4, 40);
            const h = H.r(3, 30);
            return { q: ['平行四邊形的底是 ' + b + ' 公分、高是 ' + h + ' 公分，面積是多少平方公分？'], a: [b * h + ' 平方公分'] };
          },
          (H) => {
            const b = H.r(4, 40);
            let h = H.r(3, 30);
            if ((b * h) % 2) h += 1;
            return { q: ['三角形的底是 ' + b + ' 公分、高是 ' + h + ' 公分，面積是多少平方公分？'], a: [(b * h) / 2 + ' 平方公分'] };
          },
          (H) => {
            const top = H.r(3, 25);
            const bottom = top + H.r(2, 20);
            let h = H.r(3, 20);
            if (((top + bottom) * h) % 2) h += 1;
            return {
              q: ['梯形的上底 ' + top + ' 公分、下底 ' + bottom + ' 公分、高 ' + h + ' 公分，面積是多少平方公分？'],
              a: [((top + bottom) * h) / 2 + ' 平方公分'],
            };
          },
          (H) => {
            const b = H.r(4, 30);
            const h = H.r(3, 25);
            if (H.r(0, 1)) {
              return { q: ['平行四邊形的面積是 ' + b * h + ' 平方公分，底是 ' + b + ' 公分，高是幾公分？'], a: [h + ' 公分'] };
            }
            return { q: ['三角形的面積是 ' + b * h + ' 平方公分，底是 ' + b * 2 + ' 公分，高是幾公分？'], a: [h + ' 公分'] };
          },
        ],
      },
      {
        id: 'g5a-10',
        no: 10,
        name: '柱體、錐體和球',
        gens: [
          (H) => {
            const n = H.r(3, 10);
            const ask = H.r(0, 2);
            const name = n + ' 角柱';
            if (ask === 0) return { q: [name + '有幾個面？'], a: [n + 2 + ' 個'] };
            if (ask === 1) return { q: [name + '有幾個頂點？'], a: [n * 2 + ' 個'] };
            return { q: [name + '有幾條邊？'], a: [n * 3 + ' 條'] };
          },
          (H) => {
            const n = H.r(3, 10);
            const ask = H.r(0, 2);
            const name = n + ' 角錐';
            if (ask === 0) return { q: [name + '有幾個面？'], a: [n + 1 + ' 個'] };
            if (ask === 1) return { q: [name + '有幾個頂點？'], a: [n + 1 + ' 個'] };
            return { q: [name + '有幾條邊？'], a: [n * 2 + ' 條'] };
          },
          (H) => {
            const n = H.r(3, 10);
            const prism = H.r(0, 1);
            const faces = prism ? n + 2 : n + 1;
            return {
              q: ['一個' + (prism ? '角柱' : '角錐') + '有 ' + faces + ' 個面，它是幾角' + (prism ? '柱' : '錐') + '？'],
              a: [n + ' 角' + (prism ? '柱' : '錐')],
            };
          },
          (H) => {
            const r = H.r(2, 30);
            return { q: ['球的半徑是 ' + r + ' 公分，直徑是幾公分？'], a: [r * 2 + ' 公分'] };
          },
        ],
      },
    ],
  });
})((window.NP = window.NP || {}));
