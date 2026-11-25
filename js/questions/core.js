/*
 * 題庫核心：註冊各冊單元、隨機出題、避免同一節課出重複題。
 *
 * 每個單元有數個「出題規則」(gens)，每個規則是一個函式，回傳：
 *   { q: [...題目片段], a: [...答案片段] }
 * 片段可以是文字，或分數 { f: [整數, 分子, 分母] }（整數為 0 表示真分數）。
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
  };

  const books = [];
  const unitIndex = {};

  function register(book) {
    book.units.forEach((unit) => {
      unit.book = book;
      unit.gens = unit.gens || [];
      unitIndex[unit.id] = unit;
    });
    books.push(book);
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
    const units = unitIds.map((id) => unitIndex[id]).filter((u) => u && u.gens.length);
    if (!units.length) return null;

    const minUse = Math.min(...units.map((u) => session.unitUse[u.id] || 0));
    const candidates = units.filter((u) => (session.unitUse[u.id] || 0) === minUse);

    let result = null;
    let unit = null;
    for (let tries = 0; tries < 40; tries++) {
      unit = H.pick(tries < 20 ? candidates : units);
      result = H.pick(unit.gens)(H);
      const key = unit.id + '|' + JSON.stringify(result.q);
      if (!session.used.has(key)) {
        session.used.add(key);
        break;
      }
    }

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
    unit: (id) => unitIndex[id],
    createSession,
    generate,
  };
})((window.NP = window.NP || {}));
