/*
 * 題庫核心：註冊各冊單元、隨機出題、避免同一節課出重複題。
 *
 * 每個單元有數個「出題規則」(gens)，每個規則是一個函式，回傳：
 *   { q: [...題目片段], a: [...答案片段] }
 * 單元也可以有固定題目 (fixed)，例如學習扶助單元的原題，格式同樣是 { q, a }。
 * 片段可以是文字、分數 { f: [整數, 分子, 分母] }（整數為 0 表示真分數）、
 * 圖片 { img: 路徑, w, h, inline }，或選擇題選項 { opts: [[片段], [片段], ...] }。
 */
(function (NP) {
  'use strict';

  /** 出題用小工具 */
  const H = {
    /** min 到 max 之間的整數（含兩端） */
    r(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    pick(list) {
      return list[Math.floor(Math.random() * list.length)];
    },
    gcd(a, b) {
      a = Math.abs(a);
      b = Math.abs(b);
      while (b) [a, b] = [b, a % b];
      return a;
    },
    /** 分數片段 */
    f(whole, num, den) {
      return { f: [whole, num, den] };
    },
    /** 數字加上千分位逗號，例如 12345 → 12,345 */
    n(value) {
      return Number(value).toLocaleString('en-US', { maximumFractionDigits: 10 });
    },
    /** 小數運算後去掉浮點誤差，例如 0.1 + 0.2 → 0.3 */
    dec(value, digits) {
      return Number(value.toFixed(digits === undefined ? 6 : digits));
    },
    /** 約分：回傳 [分子, 分母] */
    reduce(num, den) {
      const g = H.gcd(num, den);
      return [num / g, den / g];
    },
    /** 5、6 年級的分數答案：先約成最簡分數，再寫成整數、真分數或帶分數 */
    frac(num, den) {
      const [n, d] = H.reduce(num, den);
      if (d === 1) return String(n);
      if (n > d) return H.f(Math.floor(n / d), n % d, d);
      return H.f(0, n, d);
    },
    /** 從清單隨機挑 k 個不重複的項目 */
    sample(list, k) {
      const copy = list.slice();
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy.slice(0, k);
    },
  };

  const books = [];
  const unitIndex = {};

  function prepare(book, unit) {
    unit.book = book;
    unit.gens = unit.gens || [];
    unit.fixed = unit.fixed || [];
    unitIndex[unit.id] = unit;
  }

  function register(book) {
    book.units.forEach((unit) => prepare(book, unit));
    books.push(book);
  }

  /** 在已註冊的冊別最後面加一個單元（學習扶助單元用） */
  function addUnit(bookId, unit) {
    const book = books.find((b) => b.id === bookId);
    if (!book) throw new Error('找不到冊別 ' + bookId);
    prepare(book, unit);
    book.units.push(unit);
  }

  /** 單元有沒有題目可以出（出題規則或固定題目） */
  function usable(unit) {
    return Boolean(unit && (unit.gens.length || unit.fixed.length));
  }

  /**
   * 從單元抽一題：有固定題目又有出題規則時，各一半機率（fixedRatio 可調整）。
   * 出題規則出錯時回傳 null，由呼叫的地方重抽。
   */
  function draw(unit) {
    const ratio = unit.fixedRatio === undefined ? 0.5 : unit.fixedRatio;
    if (unit.fixed.length && (!unit.gens.length || Math.random() < ratio)) return H.pick(unit.fixed);
    try {
      return H.pick(unit.gens)(H);
    } catch (err) {
      return null;
    }
  }

  /** 建立一節課的出題狀態：記錄出過的題目與各單元出題次數 */
  function createSession() {
    return { used: new Set(), unitUse: {} };
  }

  /**
   * 從勾選的單元中出一題。
   * 優先挑「這節課出題次數最少」的單元，讓題目平均分散到各單元。
   */
  function generate(unitIds, session) {
    const units = unitIds.map((id) => unitIndex[id]).filter(usable);
    if (!units.length) return null;

    const minUse = Math.min(...units.map((u) => session.unitUse[u.id] || 0));
    const candidates = units.filter((u) => (session.unitUse[u.id] || 0) === minUse);

    let result = null;
    let unit = null;
    for (let tries = 0; tries < 40; tries++) {
      const u = H.pick(tries < 20 ? candidates : units);
      const r = draw(u);
      if (!r) continue;
      unit = u;
      result = r;
      const key = unit.id + '|' + JSON.stringify(result.q);
      if (!session.used.has(key)) {
        session.used.add(key);
        break;
      }
    }
    if (!result) return null;

    session.unitUse[unit.id] = (session.unitUse[unit.id] || 0) + 1;
    return {
      unitId: unit.id,
      unitName: unit.name,
      unitNo: unit.no,
      bookLabel: unit.book.label,
      q: result.q,
      a: result.a,
    };
  }

  NP.bank = {
    books,
    H,
    register,
    addUnit,
    usable,
    unit: (id) => unitIndex[id],
    createSession,
    generate,
  };
})((window.NP = window.NP || {}));
