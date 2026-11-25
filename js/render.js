/*
 * 把題目片段畫成畫面元素。一律用 textContent，不用 innerHTML。
 * 分數畫成上下排的直式分數，帶分數的整數放在左邊。
 */
(function (NP) {
  'use strict';

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function fraction(whole, num, den) {
    const wrap = el('span', 'frac');
    wrap.setAttribute('role', 'math');
    wrap.setAttribute('aria-label', (whole ? whole + ' 又 ' : '') + den + ' 分之 ' + num);
    if (whole) wrap.appendChild(el('span', 'frac-whole', String(whole)));
    const part = el('span', 'frac-part');
    part.appendChild(el('span', 'frac-num', String(num)));
    part.appendChild(el('span', 'frac-den', String(den)));
    wrap.appendChild(part);
    return wrap;
  }

  /** 把片段陣列放進 container（會先清空） */
  function tokens(container, list) {
    container.replaceChildren();
    (list || []).forEach((token) => {
      if (token && typeof token === 'object' && Array.isArray(token.f)) {
        container.appendChild(fraction(token.f[0], token.f[1], token.f[2]));
      } else if (token === '\n') {
        container.appendChild(el('br'));
      } else {
        container.appendChild(document.createTextNode(String(token)));
      }
    });
    return container;
  }

  /** 片段轉成純文字（給螢幕報讀與除錯用） */
  function plain(list) {
    return (list || [])
      .map((t) => {
        if (t && typeof t === 'object' && Array.isArray(t.f)) {
          const [w, n, d] = t.f;
          return (w ? w + ' 又 ' : '') + n + '/' + d;
        }
        return t === '\n' ? ' ' : String(t);
      })
      .join('');
  }

  /** 秒數 → 「12:05」 */
  function clock(totalSec) {
    const s = Math.max(0, Math.ceil(totalSec));
    const m = Math.floor(s / 60);
    return String(m).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }

  /** 秒數 → 「第 3 分 05 秒」 */
  function elapsed(sec) {
    const s = Math.max(0, Math.floor(sec));
    return '第 ' + Math.floor(s / 60) + ' 分 ' + String(s % 60).padStart(2, '0') + ' 秒';
  }

  NP.render = { el, tokens, plain, clock, elapsed };
})((window.NP = window.NP || {}));
