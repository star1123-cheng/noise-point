/*
 * 本機儲存：設定與最近 10 次的統整紀錄。
 * 全部存在這台電腦瀏覽器的 localStorage，不上傳、不含學生資料。
 */
(function (NP) {
  'use strict';

  const KEY_SETTINGS = 'noise-point:settings:v1';
  const KEY_HISTORY = 'noise-point:history:v1';
  const HISTORY_LIMIT = 10;

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      return false; // 例如無痕模式或儲存空間已滿，不影響上課使用
    }
  }

  NP.storage = {
    HISTORY_LIMIT,

    loadSettings() {
      const saved = read(KEY_SETTINGS, {});
      return saved && typeof saved === 'object' ? saved : {};
    },

    saveSettings(settings) {
      write(KEY_SETTINGS, settings);
    },

    loadHistory() {
      const list = read(KEY_HISTORY, []);
      return Array.isArray(list) ? list : [];
    },

    addHistory(record) {
      const list = [record, ...this.loadHistory()].slice(0, HISTORY_LIMIT);
      write(KEY_HISTORY, list);
    },

    clearHistory() {
      try {
        localStorage.removeItem(KEY_HISTORY);
      } catch (err) {
        /* 忽略 */
      }
    },
  };
})((window.NP = window.NP || {}));
