/*
 * Noise Point 主程式：設定 → 上課偵測 → 統整頁 → 歷史紀錄。
 */
(function (NP) {
  'use strict';

  const R = NP.render;
  const $ = (id) => document.getElementById(id);

  const DEFAULTS = {
    minutes: 20,
    threshold: 46,
    preset: 'whisper',
    calib: null,
    units: [],
    book: '',
    cooldownSec: 20,
    maxQuestions: 6,
    popupSec: 10,
    deviceId: '',
  };

  // 畫面上列出的年級與學期（還沒有題庫的會顯示但不能選）
  const GRADES = [3, 4, 5, 6];
  const TERMS = [
    ['上', '上學期'],
    ['下', '下學期'],
  ];

  // 題數 → 網格欄列數與題目字級（vmin）
  const LAYOUT = { 1: [1, 1], 2: [2, 1], 3: [2, 2], 4: [2, 2], 5: [3, 2], 6: [3, 2], 7: [4, 2], 8: [4, 2] };
  const SIZE = { 1: 9, 2: 7, 3: 6, 4: 6, 5: 5, 6: 5, 7: 4.2, 8: 4.2 };
  const MIN_FONT_PX = 24;

  /* ---------------- 設定 ---------------- */

  function clampInt(value, min, max, fallback) {
    const n = Math.round(Number(value));
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }

  function usableUnit(id) {
    return NP.bank.usable(NP.bank.unit(id));
  }

  function sanitize(raw) {
    const s = Object.assign({}, DEFAULTS, raw);
    s.minutes = clampInt(s.minutes, 1, 120, DEFAULTS.minutes);
    s.threshold = clampInt(s.threshold, 5, 95, DEFAULTS.threshold);
    s.cooldownSec = clampInt(s.cooldownSec, 5, 120, DEFAULTS.cooldownSec);
    s.maxQuestions = clampInt(s.maxQuestions, 1, 8, DEFAULTS.maxQuestions);
    s.popupSec = clampInt(s.popupSec, 3, 30, DEFAULTS.popupSec);
    if (!['silent', 'whisper', 'group', 'custom'].includes(s.preset)) s.preset = DEFAULTS.preset;
    const c = s.calib;
    s.calib =
      c && Number.isFinite(Number(c.quiet)) && Number.isFinite(Number(c.talk))
        ? { quiet: Number(c.quiet), talk: Number(c.talk) }
        : null;
    s.units = Array.isArray(s.units) ? [...new Set(s.units.filter((id) => typeof id === 'string' && usableUnit(id)))] : [];
    s.book = NP.bank.books.some((b) => b.id === s.book) ? s.book : NP.bank.books.length ? NP.bank.books[0].id : '';
    s.deviceId = typeof s.deviceId === 'string' ? s.deviceId : '';
    return s;
  }

  let settings = sanitize(NP.storage.loadSettings());
  const save = () => NP.storage.saveSettings(settings);

  /** 依校正結果（沒校正就用預設值）算出三個檔位的門檻 */
  function presetValues() {
    const quiet = settings.calib ? settings.calib.quiet : 20;
    const talk = settings.calib ? settings.calib.talk : 60;
    const span = Math.max(talk - quiet, 10);
    const c = (v) => clampInt(v, 5, 95, 50);
    return { silent: c(quiet + span * 0.3), whisper: c(quiet + span * 0.65), group: c(talk + span * 0.35) };
  }

  /* ---------------- 畫面切換 ---------------- */

  let current = 'setup';
  function show(name) {
    ['setup', 'run', 'summary', 'history'].forEach((n) => {
      $('screen-' + n).hidden = n !== name;
    });
    current = name;
    window.scrollTo(0, 0);
    if (name === 'setup') startSetupLoop();
  }

  /** 確認視窗（回傳 true 表示按下確定） */
  function confirmBox(text, okLabel) {
    const dialog = $('confirm');
    if (typeof dialog.showModal !== 'function') return Promise.resolve(window.confirm(text));
    return new Promise((resolve) => {
      $('confirm-text').textContent = text;
      $('confirm-ok').textContent = okLabel || '確定';
      dialog.returnValue = '';
      dialog.addEventListener('close', () => resolve(dialog.returnValue === 'ok'), { once: true });
      dialog.showModal();
    });
  }

  /* ---------------- 麥克風 ---------------- */

  const TEST_MODE = new URLSearchParams(location.search).has('test');

  /** 測試模式用的假麥克風：音量由 NP.testLevel 控制 */
  class FakeMic {
    constructor() {
      this.on = false;
      this.onEnded = null;
    }
    static get supported() {
      return true;
    }
    get active() {
      return this.on;
    }
    get deviceId() {
      return 'test';
    }
    async start() {
      this.on = true;
    }
    read() {
      return Number(NP.testLevel) || 10;
    }
    stop() {
      this.on = false;
    }
    static async listInputs() {
      return [{ deviceId: 'test', label: '測試用假麥克風' }];
    }
  }

  const MicClass = TEST_MODE ? FakeMic : NP.Mic;
  const mic = new MicClass();
  if (TEST_MODE) NP.testLevel = 10;

  function micErrorText(err) {
    const name = err && err.name;
    if (name === 'NotAllowedError' || name === 'SecurityError') {
      return '麥克風權限被拒絕了。請點網址列左邊的圖示，把「麥克風」改成允許，再重新整理網頁。';
    }
    if (name === 'NotFoundError') return '找不到麥克風，請確認麥克風已經接上電腦。';
    if (name === 'NotReadableError') return '麥克風正被其他程式使用（例如視訊軟體），請先關掉那個程式再試一次。';
    return '無法啟用麥克風：' + ((err && err.message) || '未知的錯誤');
  }

  function showMicError(text) {
    const el = $('mic-error');
    el.textContent = text;
    el.hidden = !text;
  }

  async function enableMic(deviceId) {
    showMicError('');
    if (!MicClass.supported) {
      showMicError('這個瀏覽器不支援麥克風。請改用 Chrome 或 Edge，並用 https 網址開啟。');
      return false;
    }
    try {
      await mic.start(deviceId || undefined);
    } catch (err) {
      const stale = err && (err.name === 'OverconstrainedError' || err.name === 'NotFoundError');
      if (deviceId && stale) {
        settings.deviceId = '';
        save();
        return enableMic('');
      }
      $('mic-off').hidden = false;
      $('mic-on').hidden = true;
      showMicError(micErrorText(err));
      updateStart();
      return false;
    }
    mic.onEnded = onMicLost;
    $('mic-off').hidden = true;
    $('mic-on').hidden = false;
    await fillMicSelect();
    startSetupLoop();
    updateStart();
    return true;
  }

  async function fillMicSelect() {
    const select = $('mic-select');
    let inputs = [];
    try {
      inputs = await MicClass.listInputs();
    } catch (err) {
      inputs = [];
    }
    select.replaceChildren();
    inputs.forEach((d, i) => {
      const opt = document.createElement('option');
      opt.value = d.deviceId;
      opt.textContent = d.label || '麥克風 ' + (i + 1);
      select.appendChild(opt);
    });
    select.value = mic.deviceId;
    select.parentElement.hidden = inputs.length < 2;
  }

  function onMicLost() {
    if (run) {
      // 上課中斷線：試著自動重新連接，失敗就在狀態列顯示「麥克風中斷」
      enableMic(settings.deviceId);
      return;
    }
    $('mic-off').hidden = false;
    $('mic-on').hidden = true;
    showMicError('麥克風中斷了，請重新啟用。');
    updateStart();
  }

  /* ---------------- 音量條 ---------------- */

  function bindMeter(root) {
    const fill = root.querySelector('.meter-fill');
    const line = root.querySelector('.meter-line');
    return {
      set(level, threshold, state) {
        fill.style.width = level.toFixed(1) + '%';
        line.style.left = threshold + '%';
        root.dataset.state = state;
        if (line.hasAttribute('role')) {
          line.setAttribute('aria-valuenow', String(threshold));
          line.setAttribute('aria-valuetext', '門檻 ' + threshold);
        }
      },
    };
  }

  function meterState(level, threshold) {
    if (level > threshold) return 'over';
    if (level > threshold - 8) return 'near';
    return 'ok';
  }

  const setupMeter = bindMeter($('setup-meter'));
  const runMeter = bindMeter($('run-meter'));

  function setThreshold(value, preset) {
    settings.threshold = clampInt(value, 5, 95, settings.threshold);
    settings.preset = preset;
    save();
    renderPresets();
  }

  function initThresholdDrag() {
    const root = $('setup-meter');
    const line = root.querySelector('.meter-line');
    const fromX = (x) => {
      const rect = root.getBoundingClientRect();
      return ((x - rect.left) / rect.width) * 100;
    };
    let dragging = false;
    root.addEventListener('pointerdown', (e) => {
      dragging = true;
      root.setPointerCapture(e.pointerId);
      setThreshold(fromX(e.clientX), 'custom');
    });
    root.addEventListener('pointermove', (e) => {
      if (dragging) setThreshold(fromX(e.clientX), 'custom');
    });
    const stop = () => {
      dragging = false;
    };
    root.addEventListener('pointerup', stop);
    root.addEventListener('pointercancel', stop);
    line.addEventListener('keydown', (e) => {
      const step = e.shiftKey ? 5 : 1;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') setThreshold(settings.threshold - step, 'custom');
      else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') setThreshold(settings.threshold + step, 'custom');
      else return;
      e.preventDefault();
    });
  }

  function renderPresets() {
    document.querySelectorAll('#preset-chips .chip').forEach((chip) => {
      chip.setAttribute('aria-checked', String(chip.dataset.preset === settings.preset));
    });
  }

  function initPresets() {
    document.querySelectorAll('#preset-chips .chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const key = chip.dataset.preset;
        setThreshold(presetValues()[key], key);
      });
    });
    renderPresets();
  }

  /* ---------------- 校正 ---------------- */

  const CALIB_PHASES = [
    { key: 'quiet', text: '請全班保持安靜' },
    { key: 'talk', text: '請用平常說話的音量聊天' },
  ];
  const CALIB_SEC = 5;
  let calib = null;

  function median(list) {
    if (!list.length) return 0;
    const sorted = [...list].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  }

  function startCalibration() {
    if (!mic.active || calib) return;
    calib = { phase: 0, startAt: performance.now(), samples: { quiet: [], talk: [] } };
    $('btn-calib').disabled = true;
    $('calib-status').classList.add('is-live');
    updateStart();
  }

  function stepCalibration(now, level) {
    const phase = CALIB_PHASES[calib.phase];
    const elapsed = (now - calib.startAt) / 1000;
    if (elapsed < CALIB_SEC) {
      if (elapsed > 0.8) calib.samples[phase.key].push(level); // 跳過剛開始的反應時間
      $('calib-status').textContent = phase.text + '…' + Math.ceil(CALIB_SEC - elapsed);
      return;
    }
    if (calib.phase < CALIB_PHASES.length - 1) {
      calib.phase += 1;
      calib.startAt = now;
      return;
    }
    const quiet = Math.round(median(calib.samples.quiet));
    const talk = Math.round(median(calib.samples.talk));
    settings.calib = { quiet, talk };
    if (settings.preset !== 'custom') settings.threshold = presetValues()[settings.preset];
    save();
    renderPresets();
    calib = null;
    $('btn-calib').disabled = false;
    $('calib-status').classList.remove('is-live');
    $('calib-status').textContent =
      talk - quiet < 8
        ? '校正完成，但安靜和說話的音量差距很小。建議把麥克風擺得離學生近一點，再校正一次。'
        : '校正完成！三個檔位已經依這間教室調整好了。';
    updateStart();
  }

  let setupRAF = 0;
  function startSetupLoop() {
    if (setupRAF || current !== 'setup' || !mic.active) return;
    const step = (now) => {
      if (current !== 'setup' || !mic.active) {
        setupRAF = 0;
        return;
      }
      const level = mic.read();
      if (calib) stepCalibration(now, level);
      setupMeter.set(level, settings.threshold, meterState(level, settings.threshold));
      setupRAF = requestAnimationFrame(step);
    };
    setupRAF = requestAnimationFrame(step);
  }

  /* ---------------- 上課時間與進階設定 ---------------- */

  function initDuration() {
    const chips = [...document.querySelectorAll('#minute-chips .chip')];
    const input = $('minutes');
    const render = () => {
      chips.forEach((c) => c.setAttribute('aria-checked', String(Number(c.dataset.min) === settings.minutes)));
      input.value = settings.minutes;
    };
    chips.forEach((c) =>
      c.addEventListener('click', () => {
        settings.minutes = Number(c.dataset.min);
        save();
        render();
        updateStart();
      })
    );
    input.addEventListener('change', () => {
      settings.minutes = clampInt(input.value, 1, 120, settings.minutes);
      save();
      render();
      updateStart();
    });
    render();
  }

  function initAdvanced() {
    const fields = [
      ['cooldown', 'cooldownSec', 5, 120],
      ['max-q', 'maxQuestions', 1, 8],
      ['popup-sec', 'popupSec', 3, 30],
    ];
    fields.forEach(([id, key, min, max]) => {
      const input = $(id);
      input.value = settings[key];
      input.addEventListener('change', () => {
        settings[key] = clampInt(input.value, min, max, settings[key]);
        input.value = settings[key];
        save();
      });
    });
  }

  /* ---------------- 出題範圍 ---------------- */

  function currentBook() {
    return NP.bank.books.find((b) => b.id === settings.book) || NP.bank.books[0];
  }

  function findBook(grade, term) {
    return NP.bank.books.find((b) => b.grade === grade && b.term === term);
  }

  function pickedCount(books) {
    return books.reduce((sum, b) => sum + b.units.filter((u) => settings.units.includes(u.id)).length, 0);
  }

  function tabButton(text, selected, count, disabled, onClick) {
    const btn = R.el('button', 'book-tab', text);
    btn.type = 'button';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', String(selected));
    btn.disabled = disabled;
    if (disabled) btn.title = '題庫尚未建立';
    if (count) btn.appendChild(R.el('span', 'tab-count', String(count)));
    if (!disabled) btn.addEventListener('click', onClick);
    return btn;
  }

  /** 兩層選擇：先選年級，再選上學期或下學期；數字標籤是該處已勾選的單元數 */
  function renderBooks() {
    const active = currentBook();
    const grades = $('grade-tabs');
    grades.replaceChildren();
    GRADES.forEach((grade) => {
      const books = NP.bank.books.filter((b) => b.grade === grade);
      grades.appendChild(
        tabButton(grade + ' 年級', Boolean(active && active.grade === grade), pickedCount(books), !books.length, () => {
          const keep = active && findBook(grade, active.term);
          settings.book = (keep || books[0]).id;
          save();
          renderBooks();
          renderUnits();
        })
      );
    });

    const terms = $('term-tabs');
    terms.replaceChildren();
    TERMS.forEach(([term, label]) => {
      const book = active && findBook(active.grade, term);
      terms.appendChild(
        tabButton(label, Boolean(book && book.id === settings.book), book ? pickedCount([book]) : 0, !book, () => {
          settings.book = book.id;
          save();
          renderBooks();
          renderUnits();
        })
      );
    });
  }

  function renderUnits() {
    const list = $('unit-list');
    const book = currentBook();
    list.replaceChildren();
    if (!book) return;
    book.units.forEach((unit) => {
      const usable = NP.bank.usable(unit);
      const li = R.el('li', usable ? '' : 'is-disabled');
      const label = R.el('label');
      const box = document.createElement('input');
      box.type = 'checkbox';
      box.disabled = !usable;
      box.checked = settings.units.includes(unit.id);
      box.addEventListener('change', () => {
        toggleUnit(unit.id, box.checked);
      });
      const name = R.el('span', 'unit-name');
      name.appendChild(R.el('span', 'unit-no', String(unit.no)));
      name.appendChild(document.createTextNode(unit.name));
      label.append(box, name);
      if (!usable) label.appendChild(R.el('span', 'unit-note', unit.note || '尚無題目'));
      li.appendChild(label);
      list.appendChild(li);
    });
    updateUnitCount();
  }

  function toggleUnit(id, on) {
    const set = new Set(settings.units);
    if (on) set.add(id);
    else set.delete(id);
    settings.units = [...set];
    save();
    renderBooks();
    updateUnitCount();
    updateStart();
  }

  function setBookAll(on) {
    const book = currentBook();
    if (!book) return;
    const set = new Set(settings.units);
    book.units.forEach((u) => {
      if (!NP.bank.usable(u)) return;
      if (on) set.add(u.id);
      else set.delete(u.id);
    });
    settings.units = [...set];
    save();
    renderBooks();
    renderUnits();
    updateStart();
  }

  function updateUnitCount() {
    $('unit-count').textContent = settings.units.length ? '共選 ' + settings.units.length + ' 個單元' : '尚未選擇單元';
  }

  function updateStart() {
    let reason = '';
    if (!mic.active) reason = '請先啟用麥克風';
    else if (calib) reason = '校正中，請稍候…';
    else if (!settings.units.length) reason = '請勾選出題單元';
    $('btn-start').disabled = Boolean(reason);
    $('start-reason').textContent =
      reason || settings.minutes + ' 分鐘・' + settings.units.length + ' 個單元・最多 ' + settings.maxQuestions + ' 題';
  }

  /* ---------------- 上課中 ---------------- */

  let run = null;

  function startRun() {
    if ($('btn-start').disabled) return;
    save();
    const snapshot = JSON.parse(JSON.stringify(settings));
    run = {
      settings: snapshot,
      startedAt: Date.now(),
      endAt: Date.now() + snapshot.minutes * 60000,
      last: performance.now(),
      paused: false,
      items: [],
      bankSession: NP.bank.createSession(),
      detector: NP.createDetector({
        threshold: snapshot.threshold,
        cooldownSec: snapshot.cooldownSec,
        maxQuestions: snapshot.maxQuestions,
      }),
      timer: 0,
      popupTimer: 0,
      wake: null,
    };
    show('run');
    setPaused(false);
    renderGrid(0);
    updateRunCount();
    $('run-clock').textContent = R.clock(snapshot.minutes * 60);
    run.timer = setInterval(tick, 50);
    requestWake();
  }

  function tick() {
    if (!run) return;
    const now = performance.now();
    // 分頁在背景時瀏覽器會把計時器放慢到約每秒一次，所以容許到 1.2 秒
    const dt = Math.min(1.2, (now - run.last) / 1000);
    run.last = now;

    const remain = (run.endAt - Date.now()) / 1000;
    $('run-clock').textContent = R.clock(remain);
    if (remain <= 0) {
      finishRun(false);
      return;
    }

    const live = mic.active;
    const level = live ? mic.read() : 0;
    const threshold = run.settings.threshold;
    const res = run.detector.update(level, dt, run.paused || !live);

    let state = meterState(level, threshold);
    let text = state === 'over' ? '太吵了！' : '偵測中';
    if (run.paused) {
      state = 'paused';
      text = '暫停中';
    } else if (!live) {
      state = 'over';
      text = '麥克風中斷';
    } else if (res.capped) {
      text = '已達上限';
    }
    runMeter.set(level, threshold, state);
    const status = $('run-status');
    if (status.textContent !== text) status.textContent = text;
    status.dataset.state = state;

    if (res.trigger) addQuestion();
  }

  function addQuestion() {
    const item = NP.bank.generate(run.settings.units, run.bankSession);
    if (!item) return;
    item.no = run.items.length + 1;
    item.atSec = (Date.now() - run.startedAt) / 1000;
    run.items.push(item);
    renderGrid(item.no);
    updateRunCount();
    showPopup(item);
  }

  function updateRunCount() {
    $('run-count').textContent = run.items.length + ' / ' + run.settings.maxQuestions + ' 題';
  }

  function renderGrid(newNo) {
    const grid = $('q-grid');
    const n = run ? run.items.length : 0;
    $('q-empty').hidden = n > 0;
    grid.hidden = n === 0;
    grid.replaceChildren();
    if (!n) return;

    const [cols, rows] = LAYOUT[Math.min(n, 8)];
    grid.style.setProperty('--cols', cols);
    grid.style.setProperty('--rows', rows);
    const vmin = Math.min(window.innerWidth, window.innerHeight) / 100;
    const size = Math.max(MIN_FONT_PX, Math.round(vmin * SIZE[Math.min(n, 8)]));
    grid.style.setProperty('--q-size', size + 'px');

    run.items.forEach((item) => {
      const card = R.el('li', 'q-card' + (item.no === newNo ? ' is-new' : ''));
      card.appendChild(R.el('span', 'q-no', String(item.no)));
      const text = R.el('p', 'q-text');
      text.setAttribute('aria-label', '第 ' + item.no + ' 題：' + R.plain(item.q));
      R.tokens(text, item.q);
      card.appendChild(text);
      grid.appendChild(card);
    });
    fitCards(size);
  }

  /** 題目太長放不下時，逐步縮小該張卡片的字（不低於最小字級） */
  function fitCards(size) {
    $('q-grid')
      .querySelectorAll('.q-card')
      .forEach((card) => {
        const text = card.querySelector('.q-text');
        const hasImg = Boolean(text.querySelector('.q-img'));
        let px = size;
        let fit = 1; // 題目圖片的縮放比例（學習扶助的原題有圖）
        card.style.setProperty('--card-w', card.clientWidth + 'px');
        card.style.setProperty('--card-h', card.clientHeight + 'px');
        text.style.fontSize = px + 'px';
        card.style.setProperty('--fit', fit);
        let guard = 0;
        while (
          (text.scrollHeight > card.clientHeight - 8 || text.scrollWidth > card.clientWidth) &&
          (px > MIN_FONT_PX || (hasImg && fit > 0.2)) &&
          guard < 40
        ) {
          px = Math.max(MIN_FONT_PX, Math.floor(px * 0.92));
          fit *= 0.92;
          text.style.fontSize = px + 'px';
          card.style.setProperty('--fit', fit);
          guard += 1;
        }
      });
  }

  function showPopup(item) {
    closePopup();
    $('popup-no').textContent = '第 ' + item.no + ' 題';
    const text = $('popup-q');
    R.tokens(text, item.q);
    const bar = $('popup-bar');
    bar.style.animation = 'none';
    void bar.offsetWidth; // 重新開始倒數動畫
    bar.style.animation = '';
    bar.style.animationDuration = run.settings.popupSec + 's';
    $('popup').hidden = false;
    fitPopup(text);
    run.popupTimer = setTimeout(closePopup, run.settings.popupSec * 1000);
  }

  /** 學習扶助的題目較長（有選項、圖片），放大顯示放不下時逐步縮小字級 */
  function fitPopup(text) {
    const card = text.closest('.popup-card');
    text.style.fontSize = '';
    let px = parseFloat(getComputedStyle(text).fontSize);
    let guard = 0;
    while (card.scrollHeight > card.clientHeight + 1 && px > MIN_FONT_PX && guard < 30) {
      px = Math.max(MIN_FONT_PX, Math.floor(px * 0.92));
      text.style.fontSize = px + 'px';
      guard += 1;
    }
  }

  function closePopup() {
    if (run) clearTimeout(run.popupTimer);
    $('popup').hidden = true;
  }

  function setPaused(paused) {
    run.paused = paused;
    const btn = $('btn-pause');
    btn.setAttribute('aria-pressed', String(paused));
    btn.replaceChildren(document.createTextNode(paused ? '繼續偵測' : '暫停偵測'), R.el('kbd', '', '空白鍵'));
    $('paused-banner').hidden = !paused;
  }

  async function endEarly() {
    if (!run) return;
    const ok = await confirmBox('確定要提早結束嗎？會直接進入統整頁。', '結束');
    if (ok) finishRun(true);
  }

  function finishRun(early) {
    if (!run) return;
    clearInterval(run.timer);
    closePopup();
    releaseWake();
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
    const s = run.settings;
    const record = {
      id: run.startedAt.toString(36),
      startedAt: run.startedAt,
      endedAt: Date.now(),
      plannedMinutes: s.minutes,
      early,
      threshold: s.threshold,
      items: run.items.map((i) => ({
        no: i.no,
        q: i.q,
        a: i.a,
        unit: i.bookLabel + '・' + i.unitNo + ' ' + i.unitName,
        atSec: Math.round(i.atSec),
      })),
    };
    NP.storage.addHistory(record);
    run = null;
    showSummary(record, 'setup');
  }

  async function requestWake() {
    try {
      if (run && 'wakeLock' in navigator) run.wake = await navigator.wakeLock.request('screen');
    } catch (err) {
      /* 不支援或被拒絕時就讓螢幕照平常設定 */
    }
  }

  function releaseWake() {
    if (run && run.wake) run.wake.release().catch(() => {});
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
  }

  /* ---------------- 統整頁 ---------------- */

  let summaryBack = 'setup';

  function dateText(ms) {
    const d = new Date(ms);
    const week = '日一二三四五六'[d.getDay()];
    const pad = (n) => String(n).padStart(2, '0');
    return (
      d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate()) +
      '（' + week + '）' + pad(d.getHours()) + ':' + pad(d.getMinutes())
    );
  }

  function durationText(rec) {
    const min = Math.round((rec.endedAt - rec.startedAt) / 60000);
    return min < 1 ? '不到 1 分鐘' : min + ' 分鐘';
  }

  function setAnswers(on) {
    document.body.classList.toggle('show-answers', on);
    const btn = $('btn-answers');
    btn.setAttribute('aria-pressed', String(on));
    btn.textContent = on ? '隱藏答案' : '顯示答案';
  }

  function showSummary(rec, back) {
    summaryBack = back;
    setAnswers(false);
    const items = Array.isArray(rec.items) ? rec.items : [];
    $('summary-title').textContent = items.length ? '這節課出了 ' + items.length + ' 題' : '這節課沒有出題';
    $('summary-meta').textContent =
      dateText(rec.startedAt) + '・上課 ' + durationText(rec) + (rec.early ? '（提早結束）' : '');
    $('summary-empty').hidden = items.length > 0;
    $('summary-table').hidden = items.length === 0;
    $('btn-answers').hidden = items.length === 0;

    const body = $('summary-body');
    body.replaceChildren();
    items.forEach((item) => {
      const tr = document.createElement('tr');
      tr.appendChild(R.el('td', '', '第 ' + item.no + ' 題'));
      tr.appendChild(R.tokens(R.el('td', 'td-q'), item.q));
      tr.appendChild(R.el('td', 'td-unit', String(item.unit || '')));
      tr.appendChild(R.el('td', 'td-time', R.elapsed(item.atSec || 0)));
      tr.appendChild(R.tokens(R.el('td', 'td-answer'), item.a));
      body.appendChild(tr);
    });
    show('summary');
  }

  /* ---------------- 歷史紀錄 ---------------- */

  function showHistory() {
    const records = NP.storage.loadHistory().filter((r) => r && Number.isFinite(r.startedAt));
    const list = $('history-list');
    list.replaceChildren();
    $('history-empty').hidden = records.length > 0;
    $('btn-clear').hidden = records.length === 0;
    records.forEach((rec) => {
      const count = Array.isArray(rec.items) ? rec.items.length : 0;
      const li = document.createElement('li');
      const btn = R.el('button', 'history-item');
      btn.type = 'button';
      const info = R.el('div');
      info.appendChild(R.el('div', 'history-date', dateText(rec.startedAt)));
      info.appendChild(R.el('div', 'history-detail', '上課 ' + durationText(rec) + (rec.early ? '（提早結束）' : '')));
      btn.append(info, R.el('span', 'history-count', count + ' 題'));
      btn.addEventListener('click', () => showSummary(rec, 'history'));
      li.appendChild(btn);
      list.appendChild(li);
    });
    show('history');
  }

  /* ---------------- 事件綁定 ---------------- */

  function blurAfterClick(btn, fn) {
    btn.addEventListener('click', (e) => {
      e.currentTarget.blur(); // 避免按鈕留著焦點，空白鍵又觸發一次
      fn();
    });
  }

  function init() {
    initDuration();
    initPresets();
    initThresholdDrag();
    initAdvanced();
    renderBooks();
    renderUnits();
    updateStart();

    $('btn-mic').addEventListener('click', () => enableMic(settings.deviceId));
    $('mic-select').addEventListener('change', (e) => {
      settings.deviceId = e.target.value;
      save();
      enableMic(settings.deviceId);
    });
    $('btn-calib').addEventListener('click', startCalibration);
    $('btn-all').addEventListener('click', () => setBookAll(true));
    $('btn-none').addEventListener('click', () => setBookAll(false));
    $('btn-start').addEventListener('click', startRun);
    $('btn-history').addEventListener('click', showHistory);

    blurAfterClick($('btn-pause'), () => run && setPaused(!run.paused));
    blurAfterClick($('btn-full'), toggleFullscreen);
    blurAfterClick($('btn-end'), endEarly);
    $('popup').addEventListener('click', closePopup);

    $('btn-answers').addEventListener('click', () => setAnswers(!document.body.classList.contains('show-answers')));
    $('btn-print').addEventListener('click', () => window.print());
    $('btn-back').addEventListener('click', () => (summaryBack === 'history' ? showHistory() : show('setup')));
    $('btn-history-back').addEventListener('click', () => show('setup'));
    $('btn-clear').addEventListener('click', async () => {
      const ok = await confirmBox('確定要清除全部紀錄嗎？清除後無法復原。', '清除');
      if (ok) {
        NP.storage.clearHistory();
        showHistory();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (current !== 'run' || !run || $('confirm').open) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (!e.repeat) setPaused(!run.paused);
      } else if (e.key === 'Escape' && !$('popup').hidden) {
        closePopup();
      }
    });
    document.addEventListener('keyup', (e) => {
      if (current === 'run' && e.code === 'Space') e.preventDefault();
    });

    document.addEventListener('fullscreenchange', () => {
      $('btn-full').textContent = document.fullscreenElement ? '離開全螢幕' : '全螢幕';
      if (run) renderGrid(0);
    });
    window.addEventListener('resize', () => {
      if (run && current === 'run') renderGrid(0);
    });
    document.addEventListener('visibilitychange', () => {
      if (run && document.visibilityState === 'visible' && (!run.wake || run.wake.released)) requestWake();
    });
    window.addEventListener('beforeunload', (e) => {
      if (run) {
        e.preventDefault();
        e.returnValue = '';
      }
    });

    // 已經允許過麥克風的電腦，打開網頁就自動啟用
    if (TEST_MODE) {
      enableMic('');
    } else if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'microphone' })
        .then((status) => {
          if (status.state === 'granted') enableMic(settings.deviceId);
        })
        .catch(() => {});
    }
  }

  init();
})((window.NP = window.NP || {}));
