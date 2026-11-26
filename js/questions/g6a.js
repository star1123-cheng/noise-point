/*
 * 6 上（第十一冊）出題規則。
 * 題型參考該冊月考卷與教師手冊，數字皆為隨機產生，不收錄原題。
 * 分數答案用最簡分數；圓周率用 3.14（與考卷一致）。
 */
(function (NP) {
  'use strict';

  function factorize(n) {
    const list = [];
    let x = n;
    for (let p = 2; p * p <= x; p++) {
      while (x % p === 0) {
        list.push(p);
        x /= p;
      }
    }
    if (x > 1) list.push(x);
    return list;
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

  /** 隨機最簡真分數 [分子, 分母] */
  function proper(H, dens) {
    for (;;) {
      const d = H.pick(dens || [2, 3, 4, 5, 6, 7, 8, 9, 10, 12]);
      const n = H.r(1, d - 1);
      if (H.gcd(n, d) === 1) return [n, d];
    }
  }

  /** 以「百分之一」為單位的整數 → 小數字串，例如 2826 → 28.26 */
  function cent(x) {
    return String(x / 100);
  }

  /**
   * 圓與扇形：挑一組半徑與圓心角，使答案剛好是兩位以內的小數。
   * kind 'len' 算周長、'area' 算面積；回傳 [半徑, 圓心角, 答案×100]
   */
  function circlePick(H, kind, angles) {
    for (;;) {
      const r = H.r(2, 20);
      const angle = H.pick(angles);
      // 弧長×100 = 2 × r × 314 × 角度 ÷ 360；面積×100 = r × r × 314 × 角度 ÷ 360
      const top = kind === 'len' ? 2 * r * 314 * angle : r * r * 314 * angle;
      if (top % 360 === 0) return [r, angle, top / 360];
    }
  }

  const ANGLE_WORD = { 360: '圓', 180: '半圓', 90: '四分之一圓' };

  NP.bank.register({
    id: 'g6a',
    grade: 6,
    term: '上',
    label: '6 上',
    units: [
      {
        id: 'g6a-01',
        no: 1,
        name: '最大公因數與最小公倍數',
        gens: [
          (H) => {
            const n = H.pick([12, 18, 20, 24, 28, 30, 36, 40, 42, 45, 48, 50, 54, 56, 60, 63, 68, 72, 75, 84, 90, 96, 98, 100, 108, 120]);
            return { q: ['把 ' + n + ' 做質因數分解。'], a: [n + ' ＝ ' + factorize(n).join(' × ')] };
          },
          (H) => {
            const g = H.r(2, 15);
            const [x, y] = H.sample([2, 3, 4, 5, 7, 9], 2);
            const a = g * x;
            const b = g * y;
            return { q: [a + ' 和 ' + b + ' 的最大公因數是多少？'], a: [String(H.gcd(a, b))] };
          },
          (H) => {
            const g = H.r(2, 8);
            const [x, y] = H.sample([2, 3, 5, 7, 9, 11], 2);
            const a = g * x;
            const b = g * y;
            return { q: [a + ' 和 ' + b + ' 的最小公倍數是多少？'], a: [String((a * b) / H.gcd(a, b))] };
          },
          (H) => {
            const g = H.r(3, 15);
            const [x, y] = H.sample([2, 3, 4, 5, 7], 2);
            const a = g * x;
            const b = g * y;
            return {
              q: ['把長 ' + a + ' 公分、寬 ' + b + ' 公分的長方形紙，剪成大小相同的正方形，沒有剩下，正方形的邊長最長是幾公分？'],
              a: [H.gcd(a, b) + ' 公分'],
            };
          },
          (H) => {
            const [a, b] = H.sample([6, 8, 9, 10, 12, 15, 16, 18, 20], 2);
            return {
              q: ['用長 ' + a + ' 公分、寬 ' + b + ' 公分的長方形磁磚，拼成一個最小的正方形，正方形的邊長是幾公分？'],
              a: [(a * b) / H.gcd(a, b) + ' 公分'],
            };
          },
        ],
      },
      {
        id: 'g6a-02',
        no: 2,
        name: '分數除法',
        gens: [
          (H) => {
            const [n1, d1] = proper(H);
            const [n2, d2] = proper(H);
            return { q: [H.f(0, n1, d1), ' ÷ ', H.f(0, n2, d2), ' ＝ ？'], a: [H.frac(n1 * d2, d1 * n2)] };
          },
          (H) => {
            const k = H.r(2, 20);
            const [n, d] = proper(H);
            return { q: [k + ' ÷ ', H.f(0, n, d), ' ＝ ？'], a: [H.frac(k * d, n)] };
          },
          (H) => {
            const d1 = H.r(2, 6);
            const a = H.r(1, 4) * d1 + H.r(1, d1 - 1);
            const d2 = H.r(2, 6);
            const b = H.r(1, 3) * d2 + H.r(1, d2 - 1);
            return { q: [mixedQ(H, a, d1), ' ÷ ', mixedQ(H, b, d2), ' ＝ ？'], a: [H.frac(a * d2, d1 * b)] };
          },
          (H) => {
            const [n, d] = proper(H, [2, 3, 4, 5, 6, 8]);
            const bags = H.r(3, 20);
            const total = bags * n;
            return {
              q: ['有 ', H.frac(total, d), ' 公斤的米，每 ', H.f(0, n, d), ' 公斤裝一袋，可以裝成幾袋？'],
              a: [bags + ' 袋'],
            };
          },
        ],
      },
      {
        id: 'g6a-03',
        no: 3,
        name: '數量關係',
        gens: [
          (H) => {
            const gap = H.r(2, 15);
            const n = H.r(5, 40);
            return {
              q: ['一條路長 ' + gap * n + ' 公尺，從頭到尾每隔 ' + gap + ' 公尺種一棵樹（兩端都種），共種幾棵？'],
              a: [n + 1 + ' 棵'],
            };
          },
          (H) => {
            const gap = H.r(2, 15);
            const n = H.r(5, 40);
            return {
              q: ['圓形水池一圈長 ' + gap * n + ' 公尺，沿著池邊每隔 ' + gap + ' 公尺插一面旗子，共插幾面？'],
              a: [n + ' 面'],
            };
          },
          (H) => {
            const len = H.r(2, 9);
            const n = H.r(4, 15);
            return {
              q: ['把一根木頭鋸成 ' + n + ' 段，每鋸一次要 ' + len + ' 分鐘，共要幾分鐘？'],
              a: [(n - 1) * len + ' 分鐘'],
            };
          },
          (H) => {
            const first = H.r(3, 8);
            const add = H.r(2, 6);
            const n = H.r(8, 20);
            return {
              q: ['排桌子：1 張桌子坐 ' + first + ' 人，每多接 1 張桌子就多坐 ' + add + ' 人，接成 ' + n + ' 張可以坐幾人？'],
              a: [first + add * (n - 1) + ' 人'],
            };
          },
        ],
      },
      {
        id: 'g6a-04',
        no: 4,
        name: '小數除法',
        gens: [
          (H) => {
            // 整數 ÷ 小數：a ÷ (b/10) = q
            // 除數是一位小數，被除數要剛好是整數
            for (;;) {
              const b = H.r(2, 49);
              const q = H.r(2, 80);
              if (b % 10 === 0 || (b * q) % 10) continue;
              return { q: [(b * q) / 10 + ' ÷ ' + b / 10 + ' ＝ ？'], a: [String(q)] };
            }
          },
          (H) => {
            // 小數 ÷ 小數，商是整數或一位小數
            const b = H.r(2, 99);
            const q = H.r(11, 199);
            return { q: [(b * q) / 1000 + ' ÷ ' + b / 100 + ' ＝ ？'], a: [String(q / 10)] };
          },
          (H) => {
            for (;;) {
              const a = H.r(101, 999);
              const b = H.pick([3, 6, 7, 9, 11, 12, 13]);
              if ((a * 10) % b === 0) continue;
              // a/100 ÷ b/10 = a / (10b)，取到小數第二位
              const r = Math.round((a * 100) / (b * 10));
              return {
                q: [a / 100 + ' ÷ ' + b / 10 + '，商用四捨五入法取概數到小數第二位。'],
                a: ['約 ' + (r / 100).toFixed(2)],
              };
            }
          },
          (H) => {
            const each = H.r(12, 95) / 10;
            const n = H.r(3, 25);
            const total = H.dec(each * n, 2);
            return {
              q: ['一條長 ' + total + ' 公尺的緞帶，每 ' + each + ' 公尺做一朵花，可以做幾朵？'],
              a: [n + ' 朵'],
            };
          },
        ],
      },
      {
        id: 'g6a-05',
        no: 5,
        name: '比與比值',
        gens: [
          (H) => {
            const [x, y] = H.reduce(H.r(1, 12), H.r(1, 12));
            const k = H.r(2, 12);
            return { q: ['把 ' + x * k + '：' + y * k + ' 化成最簡整數比。'], a: [x + '：' + y] };
          },
          (H) => {
            const a = H.r(1, 20);
            let b = H.r(2, 20);
            if (a === b) b += 1;
            return { q: [a + '：' + b + ' 的比值是多少？'], a: [H.frac(a, b)] };
          },
          (H) => {
            const [x, y] = H.reduce(H.r(1, 9), H.r(1, 9));
            const k = H.r(2, 9);
            if (H.r(0, 1)) return { q: [x + '：' + y + ' ＝ ' + x * k + '：？'], a: [String(y * k)] };
            return { q: [x + '：' + y + ' ＝ ？：' + y * k], a: [String(x * k)] };
          },
          (H) => {
            const [x, y] = H.reduce(H.r(2, 7), H.r(2, 7));
            const k = H.r(3, 8);
            return {
              q: ['全班男生和女生人數的比是 ' + x + '：' + y + '，全班共 ' + (x + y) * k + ' 人，女生有幾人？'],
              a: [y * k + ' 人'],
            };
          },
        ],
      },
      {
        id: 'g6a-06',
        no: 6,
        name: '圓周長與扇形周長',
        gens: [
          (H) => {
            const d = H.r(2, 40);
            return { q: ['圓的直徑是 ' + d + ' 公分，圓周長是幾公分？（圓周率用 3.14）'], a: [cent(d * 314) + ' 公分'] };
          },
          (H) => {
            const r = H.r(2, 25);
            return { q: ['圓的半徑是 ' + r + ' 公分，圓周長是幾公分？（圓周率用 3.14）'], a: [cent(r * 2 * 314) + ' 公分'] };
          },
          (H) => {
            const d = H.r(2, 40);
            return { q: ['圓周長是 ' + cent(d * 314) + ' 公分，直徑是幾公分？（圓周率用 3.14）'], a: [d + ' 公分'] };
          },
          (H) => {
            const [r, angle, arc] = circlePick(H, 'len', [180, 90, 60, 120, 45, 30, 270]);
            const word = ANGLE_WORD[angle] ? '（' + ANGLE_WORD[angle] + '）' : '';
            return {
              q: ['半徑 ' + r + ' 公分、圓心角 ' + angle + '° 的扇形' + word + '，周長是幾公分？（圓周率用 3.14）'],
              a: [cent(arc + r * 200) + ' 公分'],
            };
          },
        ],
      },
      {
        id: 'g6a-07',
        no: 7,
        name: '圓面積與扇形面積',
        gens: [
          (H) => {
            const r = H.r(2, 25);
            return { q: ['圓的半徑是 ' + r + ' 公分，面積是多少平方公分？（圓周率用 3.14）'], a: [cent(r * r * 314) + ' 平方公分'] };
          },
          (H) => {
            const r = H.r(1, 15);
            return { q: ['圓的直徑是 ' + r * 2 + ' 公分，面積是多少平方公分？（圓周率用 3.14）'], a: [cent(r * r * 314) + ' 平方公分'] };
          },
          (H) => {
            const [r, angle, area] = circlePick(H, 'area', [180, 90, 60, 120, 45, 30, 270]);
            const word = ANGLE_WORD[angle] ? '（' + ANGLE_WORD[angle] + '）' : '';
            return {
              q: ['半徑 ' + r + ' 公分、圓心角 ' + angle + '° 的扇形' + word + '，面積是多少平方公分？（圓周率用 3.14）'],
              a: [cent(area) + ' 平方公分'],
            };
          },
          (H) => {
            const r = H.r(1, 10);
            const side = r * 2;
            return {
              q: ['邊長 ' + side + ' 公分的正方形裡畫一個最大的圓，正方形扣掉圓之後剩下的面積是多少平方公分？（圓周率用 3.14）'],
              a: [cent(side * side * 100 - r * r * 314) + ' 平方公分'],
            };
          },
        ],
      },
      {
        id: 'g6a-08',
        no: 8,
        name: '認識速率',
        gens: [
          (H) => {
            const v = H.r(30, 90);
            const t = H.r(2, 9);
            return { q: ['汽車時速 ' + v + ' 公里，' + t + ' 小時可以行駛幾公里？'], a: [v * t + ' 公里'] };
          },
          (H) => {
            const v = H.r(40, 300);
            const t = H.r(5, 40);
            return { q: ['小明走了 ' + v * t + ' 公尺，花了 ' + t + ' 分鐘，他走路的分速是幾公尺？'], a: ['分速 ' + v + ' 公尺'] };
          },
          (H) => {
            const v = H.r(40, 150);
            const t = H.r(2, 8);
            return { q: ['火車時速 ' + v + ' 公里，要行駛 ' + v * t + ' 公里，需要幾小時？'], a: [t + ' 小時'] };
          },
          (H) => {
            const kind = H.r(0, 2);
            if (kind === 0) {
              const km = H.r(3, 120) * 3;
              return { q: ['時速 ' + km + ' 公里 ＝ 分速幾公尺？'], a: ['分速 ' + (km * 1000) / 60 + ' 公尺'] };
            }
            if (kind === 1) {
              const s = H.r(2, 40);
              return { q: ['秒速 ' + s + ' 公尺 ＝ 分速幾公尺？'], a: ['分速 ' + s * 60 + ' 公尺'] };
            }
            const s = H.r(2, 40);
            return { q: ['秒速 ' + s + ' 公尺 ＝ 時速幾公里？'], a: ['時速 ' + H.dec((s * 3600) / 1000, 1) + ' 公里'] };
          },
        ],
      },
      {
        id: 'g6a-09',
        no: 9,
        name: '放大圖、縮圖與比例尺',
        gens: [
          (H) => {
            const scale = H.pick([1000, 2000, 5000, 10000, 20000, 25000, 50000, 100000]);
            const cm = H.r(2, 20);
            const realM = (cm * scale) / 100;
            return {
              q: ['在比例尺 1：' + scale + ' 的地圖上量得 ' + cm + ' 公分，實際距離是幾公尺？'],
              a: [realM + ' 公尺'],
            };
          },
          (H) => {
            const scale = H.pick([10000, 20000, 25000, 50000, 100000, 200000]);
            const km = H.r(1, 20);
            const cm = (km * 100000) / scale;
            return {
              q: ['兩地實際相距 ' + km + ' 公里，畫在比例尺 1：' + scale + ' 的地圖上是幾公分？'],
              a: [cm + ' 公分'],
            };
          },
          (H) => {
            const k = H.r(2, 5);
            const a = H.r(2, 15);
            return {
              q: ['把邊長 ' + a + ' 公分的正方形放大成 ' + k + ' 倍的放大圖，放大圖的邊長是幾公分？面積是原來的幾倍？'],
              a: [a * k + ' 公分，' + k * k + ' 倍'],
            };
          },
          (H) => {
            const k = H.pick([2, 3, 4, 5]);
            const a = k * H.r(2, 12);
            const b = k * H.r(2, 12);
            return {
              q: ['長 ' + a + ' 公分、寬 ' + b + ' 公分的長方形，畫成 ', H.f(0, 1, k), ' 倍的縮圖，縮圖的長和寬各是幾公分？'],
              a: ['長 ' + a / k + ' 公分，寬 ' + b / k + ' 公分'],
            };
          },
        ],
      },
    ],
  });
})((window.NP = window.NP || {}));
