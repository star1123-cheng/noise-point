/*
 * 3 下（第六冊）出題規則。
 * 題型參考該冊月考卷與教師手冊，數字皆為隨機產生，不收錄原題。
 * 3 年級分數答案不約分；結果等於 1 時寫「1（或 6/6）」，與考卷一致。
 */
(function (NP) {
  'use strict';

  /** 同分母分數的答案：等於 1 或 2 時寫整數，其餘維持假分數或真分數 */
  function fracAns(H, n, d) {
    if (n === d) return ['1（或 ', H.f(0, n, d), '）'];
    if (n === d * 2) return ['2（或 ', H.f(0, n, d), '）'];
    return [H.f(0, n, d)];
  }

  /** 公克 → 「幾公斤幾公克」 */
  function kgg(x) {
    const kg = Math.floor(x / 1000);
    const g = x % 1000;
    if (!kg) return g + ' 公克';
    return g ? kg + ' 公斤 ' + g + ' 公克' : kg + ' 公斤';
  }

  /** 一天中的分鐘數 → 「幾時幾分」（24 時制） */
  function hm(x) {
    const h = Math.floor(x / 60);
    const m = x % 60;
    return m ? h + ' 時 ' + m + ' 分' : h + ' 時';
  }

  /** 分鐘數 → 「幾小時幾分鐘」 */
  function dur(x) {
    const h = Math.floor(x / 60);
    const m = x % 60;
    if (!h) return m + ' 分鐘';
    return m ? h + ' 小時 ' + m + ' 分鐘' : h + ' 小時';
  }

  NP.bank.register({
    id: 'g3b',
    grade: 3,
    term: '下',
    label: '3 下',
    units: [
      {
        id: 'g3b-01',
        no: 1,
        name: '分數的加減',
        gens: [
          (H) => {
            const d = H.r(3, 11);
            const a = H.r(1, d - 1);
            const b = H.r(1, d - 1);
            return { q: [H.f(0, a, d), ' ＋ ', H.f(0, b, d), ' ＝ ？'], a: fracAns(H, a + b, d) };
          },
          (H) => {
            const d = H.r(3, 11);
            const a = H.r(2, d - 1);
            const b = H.r(1, a - 1);
            return { q: [H.f(0, a, d), ' － ', H.f(0, b, d), ' ＝ ？'], a: [H.f(0, a - b, d)] };
          },
          (H) => {
            const d = H.r(3, 11);
            const b = H.r(1, d - 1);
            return { q: ['1 － ', H.f(0, b, d), ' ＝ ？'], a: [H.f(0, d - b, d)] };
          },
          (H) => {
            const d = H.r(4, 11);
            const a = H.r(1, d - 2);
            const b = H.r(1, d - 1 - a);
            return {
              q: ['一條蛋糕平分切成 ' + d + ' 塊，哥哥吃了 ', H.f(0, a, d), ' 條，妹妹吃了 ', H.f(0, b, d), ' 條，兩人共吃了幾條？'],
              a: [H.f(0, a + b, d), ' 條'],
            };
          },
          (H) => {
            const d = H.r(4, 11);
            const n = H.r(1, d - 1);
            return {
              q: ['一盒餅乾有 ' + d + ' 個，吃掉 ' + n + ' 個後，還剩下幾盒？'],
              a: [H.f(0, d - n, d), ' 盒'],
            };
          },
        ],
      },
      {
        id: 'g3b-02',
        no: 2,
        name: '除法',
        gens: [
          (H) => {
            const d = H.r(2, 9);
            const q = H.r(10, Math.floor(99 / d));
            const rem = H.r(0, Math.min(d - 1, 99 - q * d));
            const a = q * d + rem;
            return { q: [a + ' ÷ ' + d + ' ＝ ？'], a: [rem ? q + ' … ' + rem : String(q)] };
          },
          (H) => {
            const d = H.r(2, 9);
            const q = H.r(Math.ceil(100 / d), Math.floor(999 / d));
            const rem = H.r(0, Math.min(d - 1, 999 - q * d));
            const a = q * d + rem;
            return { q: [a + ' ÷ ' + d + ' ＝ ？'], a: [rem ? q + ' … ' + rem : String(q)] };
          },
          (H) => {
            const d = H.r(3, 9);
            const q = H.r(12, 99);
            const rem = H.r(1, d - 1);
            return {
              q: [q * d + rem + ' 本故事書平分給 ' + d + ' 個班級，每班分到幾本？還剩下幾本？'],
              a: [q + ' 本，剩下 ' + rem + ' 本'],
            };
          },
          (H) => {
            const n = H.r(3, 9);
            const each = H.r(25, 160);
            const total = each * n;
            const a = H.r(Math.ceil(total / 3), total - 20);
            return {
              q: ['姐姐有 ' + a + ' 元，妹妹有 ' + (total - a) + ' 元，兩人的錢合起來剛好買 ' + n + ' 個相框，一個相框多少元？'],
              a: [each + ' 元'],
            };
          },
          (H) => {
            const d = H.r(4, 9);
            const q = H.r(20, 99);
            const bad = H.r(3, 30);
            return {
              q: ['有 ' + (q * d + bad) + ' 個蘋果，其中 ' + bad + ' 個壞掉了，剩下的每 ' + d + ' 個裝一盒，可以裝成幾盒？'],
              a: [q + ' 盒'],
            };
          },
        ],
      },
      {
        id: 'g3b-03',
        no: 3,
        name: '尋找規律',
        gens: [
          (H) => {
            const step = H.r(2, 12);
            const up = H.r(0, 2) > 0;
            const start = up ? H.r(1, 50) : H.r(step * 6, step * 6 + 60);
            const seq = [];
            for (let i = 0; i < 5; i++) seq.push(start + (up ? 1 : -1) * step * i);
            const next = start + (up ? 1 : -1) * step * 5;
            return { q: ['找出規律，下一個數是多少？' + seq.join('、') + '、？'], a: [String(next)] };
          },
          (H) => {
            const first = H.r(3, 6);
            const add = H.r(2, 5);
            const n = H.r(5, 10);
            return {
              q: ['用火柴排圖形：第 1 個圖形用 ' + first + ' 根，之後每個圖形都比前一個多 ' + add + ' 根，第 ' + n + ' 個圖形要用幾根？'],
              a: [first + add * (n - 1) + ' 根'],
            };
          },
          (H) => {
            const rows = H.r(3, 6);
            const col = H.r(2, 7);
            const row = H.r(1, rows);
            return {
              q: ['置物櫃有 ' + rows + ' 列，號碼從第 1 排由上往下依序編號，排完再換下一排。第 ' + col + ' 排第 ' + row + ' 列是幾號？'],
              a: [(col - 1) * rows + row + ' 號'],
            };
          },
        ],
      },
      {
        id: 'g3b-04',
        no: 4,
        name: '公斤和公克',
        gens: [
          (H) => {
            const kg = H.r(1, 9);
            const g = H.r(1, 999);
            return { q: [kg + ' 公斤 ' + g + ' 公克 ＝ ？公克'], a: [kg * 1000 + g + ' 公克'] };
          },
          (H) => {
            const x = H.r(1001, 9999);
            return { q: [x + ' 公克 ＝ ？公斤 ？公克'], a: [kgg(x)] };
          },
          (H) => {
            const a = H.r(1100, 5999);
            const b = H.r(150, 1999);
            return {
              q: ['芒果重 ' + kgg(a) + '，紙盒重 ' + b + ' 公克，裝在一起共重多少？'],
              a: [kgg(a + b) + '（' + (a + b) + ' 公克）'],
            };
          },
          (H) => {
            const a = H.r(2000, 5999);
            const b = H.r(500, a - 300);
            return {
              q: ['豬肉重 ' + kgg(a) + '，牛肉重 ' + b + ' 公克，兩種肉相差多少？'],
              a: [kgg(a - b)],
            };
          },
        ],
      },
      {
        id: 'g3b-05',
        no: 5,
        name: '小數',
        gens: [
          (H) => {
            const n = H.r(11, 99);
            if (H.r(0, 1)) return { q: [n + ' 個 0.1 是多少？'], a: [String(n / 10)] };
            return { q: [n / 10 + ' 是幾個 0.1？'], a: [n + ' 個'] };
          },
          (H) => {
            const a = H.r(11, 199);
            const b = H.r(11, 199);
            return { q: [a / 10 + ' ＋ ' + b / 10 + ' ＝ ？'], a: [String((a + b) / 10)] };
          },
          (H) => {
            const a = H.r(30, 199);
            const b = H.r(11, a - 5);
            return { q: [a / 10 + ' － ' + b / 10 + ' ＝ ？'], a: [String((a - b) / 10)] };
          },
          (H) => {
            const cm = H.r(1, 30);
            const mm = H.r(1, 9);
            return { q: [cm + ' 公分 ' + mm + ' 毫米 ＝ ？公分（用小數表示）'], a: [(cm * 10 + mm) / 10 + ' 公分'] };
          },
          (H) => {
            const a = H.r(11, 99);
            let b = H.r(11, 99);
            if (a === b) b = a + 1;
            return { q: [a / 10 + ' 和 ' + b / 10 + ' 哪一個比較大？'], a: [String(Math.max(a, b) / 10)] };
          },
        ],
      },
      {
        id: 'g3b-06',
        no: 6,
        name: '圓',
        gens: [
          (H) => {
            const r = H.r(2, 30);
            return { q: ['圓的半徑是 ' + r + ' 公分，直徑是幾公分？'], a: [r * 2 + ' 公分'] };
          },
          (H) => {
            const r = H.r(2, 30);
            return { q: ['圓的直徑是 ' + r * 2 + ' 公分，半徑是幾公分？'], a: [r + ' 公分'] };
          },
          (H) => {
            const r = H.r(2, 9);
            const n = H.r(2, 6);
            return {
              q: ['把 ' + n + ' 個半徑 ' + r + ' 公分的圓形餅乾排成一排、互相緊貼，這一排長幾公分？'],
              a: [r * 2 * n + ' 公分'],
            };
          },
        ],
      },
      {
        id: 'g3b-07',
        no: 7,
        name: '乘法與除法',
        gens: [
          (H) => {
            const each = H.r(6, 45);
            const n = H.r(3, 9);
            return {
              q: ['每盒彩色筆的枝數一樣多，' + n + ' 盒共有 ' + each * n + ' 枝，一盒有幾枝？'],
              a: [each + ' 枝'],
            };
          },
          (H) => {
            const each = H.r(6, 45);
            const n = H.r(3, 9);
            return {
              q: ['一包貼紙有 ' + each + ' 張，買了幾包才會有 ' + each * n + ' 張？'],
              a: [n + ' 包'],
            };
          },
          (H) => {
            const d = H.r(3, 9);
            const q = H.r(6, 40);
            const rem = H.r(0, d - 1);
            return {
              q: ['一些橘子平分給 ' + d + ' 人，每人分到 ' + q + ' 個，還剩下 ' + rem + ' 個，原來有幾個橘子？'],
              a: [q * d + rem + ' 個'],
            };
          },
          (H) => {
            const d = H.r(3, 9);
            const q = H.r(6, 40);
            return {
              q: [q * d + ' 顆彈珠，每人分 ' + q + ' 顆，剛好分完，分給了幾人？'],
              a: [d + ' 人'],
            };
          },
        ],
      },
      {
        id: 'g3b-08',
        no: 8,
        name: '時間',
        gens: [
          (H) => {
            const kind = H.r(0, 2);
            const n = H.r(2, 9);
            if (kind === 0) return { q: [n + ' 小時 ＝ ？分鐘'], a: [n * 60 + ' 分鐘'] };
            if (kind === 1) return { q: [n + ' 分鐘 ＝ ？秒鐘'], a: [n * 60 + ' 秒鐘'] };
            return { q: [n + ' 日 ＝ ？小時'], a: [n * 24 + ' 小時'] };
          },
          (H) => {
            const h = H.r(1, 11);
            const m = H.r(0, 11) * 5;
            const t = '下午 ' + h + ' 點' + (m ? ' ' + m + ' 分' : '');
            return { q: [t + '，用 24 時制要怎麼記？'], a: [hm((h + 12) * 60 + m)] };
          },
          (H) => {
            const h = H.r(7, 14);
            const m = H.r(0, 40);
            const dh = H.r(1, 4);
            const dm = H.r(5, 59 - m);
            return {
              q: [hm(h * 60 + m) + ' 出發，經過 ' + dur(dh * 60 + dm) + ' 到達，到達時是幾時幾分？'],
              a: [hm((h + dh) * 60 + m + dm)],
            };
          },
          (H) => {
            const h1 = H.r(7, 13);
            const m1 = H.r(0, 30);
            const dh = H.r(1, 5);
            const dm = H.r(1, 59 - m1);
            return {
              q: ['從 ' + hm(h1 * 60 + m1) + ' 到 ' + hm((h1 + dh) * 60 + m1 + dm) + '，經過了多久？'],
              a: [dur(dh * 60 + dm)],
            };
          },
        ],
      },
      {
        id: 'g3b-09',
        no: 9,
        name: '統計表',
        note: '需要看表作答，不出題',
        gens: [],
      },
    ],
  });
})((window.NP = window.NP || {}));
