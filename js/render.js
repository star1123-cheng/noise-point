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

  const CIRCLED = '①②③④⑤⑥';

  /** 題目圖片：寬高先寫好，圖片還沒載入時版面也算得出來 */
  function picture(token) {
    const img = document.createElement('img');
    img.className = token.inline ? 'q-img is-inline' : 'q-img';
    img.src = token.img;
    img.alt = '題目圖';
    if (token.w && token.h) {
      img.width = token.w;
      img.height = token.h;
      img.style.setProperty('--ratio', token.w / token.h);
      img.style.setProperty('--h', token.h);
    }
    img.decoding = 'async';
    return img;
  }

  /** 選擇題選項：①②③④ 排成一列，放不下就換行 */
  function options(list) {
    const wrap = el('span', 'q-opts');
    list.forEach((opt, i) => {
      const item = el('span', 'q-opt');
      item.appendChild(el('span', 'q-opt-no', CIRCLED[i]));
      append(item, opt);
      wrap.appendChild(item);
    });
    return wrap;
  }

  function append(container, list) {
    (list || []).forEach((token) => {
      if (token && typeof token === 'object' && Array.isArray(token.f)) {
        container.appendChild(fraction(token.f[0], token.f[1], token.f[2]));
      } else if (token && typeof token === 'object' && token.img) {
        container.appendChild(picture(token));
      } else if (token && typeof token === 'object' && Array.isArray(token.opts)) {
        container.appendChild(options(token.opts));
      } else if (token === '\n') {
        container.appendChild(el('br'));
      } else {
        container.appendChild(document.createTextNode(String(token)));
      }
    });
  }

  /** 把片段陣列放進 container（會先清空） */
  function tokens(container, list) {
    container.replaceChildren();
    append(container, list);
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
        if (t && typeof t === 'object' && t.img) return '（圖）';
        if (t && typeof t === 'object' && Array.isArray(t.opts)) {
          return ' ' + t.opts.map((o, i) => CIRCLED[i] + ' ' + plain(o)).join('　');
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

  NP.render = { el, tokens, plain, clock, elapsed, CIRCLED };
})((window.NP = window.NP || {}));
