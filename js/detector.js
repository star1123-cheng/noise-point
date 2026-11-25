/*
 * 「太吵判定」規則（不碰麥克風與畫面，方便單獨測試）。
 *
 * 用一個 0 到 1 的「吵鬧值」累積：
 *   - 稍微超過門檻：約 3 秒累積滿
 *   - 大幅超過門檻（高出 15 以上）：約 1 秒累積滿
 *   - 低於門檻：約 2 秒退回 0，所以掉書、關門這種短暫聲響不會出題
 * 累積滿就出一題，接著進入冷卻時間；冷卻中不累積，冷卻完還是吵就再累積。
 */
(function (NP) {
  'use strict';

  const BIG_MARGIN = 15;
  const SLOW_SEC = 3;
  const FAST_SEC = 1;
  const DECAY_SEC = 2;
  const WARN_AT = 0.3;

  function createDetector(options) {
    const opts = Object.assign({ threshold: 45, cooldownSec: 20, maxQuestions: 6 }, options);
    let pressure = 0;
    let cooldownLeft = 0;
    let count = 0;

    return {
      get count() {
        return count;
      },

      setThreshold(value) {
        opts.threshold = value;
      },

      /**
       * @param {number} level  目前音量 0–100
       * @param {number} dt     距離上次的秒數
       * @param {boolean} paused 老師暫停偵測中
       */
      update(level, dt, paused) {
        const capped = count >= opts.maxQuestions;
        const over = level > opts.threshold;
        let trigger = false;

        if (cooldownLeft > 0) cooldownLeft = Math.max(0, cooldownLeft - dt);

        if (paused || capped || cooldownLeft > 0) {
          pressure = 0;
        } else if (level > opts.threshold + BIG_MARGIN) {
          pressure += dt / FAST_SEC;
        } else if (over) {
          pressure += dt / SLOW_SEC;
        } else {
          pressure = Math.max(0, pressure - dt / DECAY_SEC);
        }

        if (pressure >= 1) {
          pressure = 0;
          count += 1;
          cooldownLeft = opts.cooldownSec;
          trigger = true;
        }

        return {
          trigger,
          over,
          pressure,
          warning: !paused && !capped && cooldownLeft === 0 && pressure >= WARN_AT,
          cooling: cooldownLeft > 0,
          cooldownLeft,
          capped: count >= opts.maxQuestions,
        };
      },
    };
  }

  NP.createDetector = createDetector;
  NP.detectorConst = { BIG_MARGIN, SLOW_SEC, FAST_SEC, DECAY_SEC, WARN_AT };
})((window.NP = window.NP || {}));
