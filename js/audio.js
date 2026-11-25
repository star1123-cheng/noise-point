/*
 * 麥克風音量計：用瀏覽器內建的 Web Audio API 算出 0–100 的音量數值。
 * 只計算音量大小，不錄音、不儲存、不傳送任何聲音。
 */
(function (NP) {
  'use strict';

  // 把分貝（dBFS）換算成 0–100：-75 dB 以下算 0，-15 dB 以上算 100
  const DB_FLOOR = -75;
  const DB_CEIL = -15;

  class Mic {
    constructor() {
      this.ctx = null;
      this.stream = null;
      this.analyser = null;
      this.buf = null;
      this.level = 0;
      this.onEnded = null; // 麥克風被拔掉或停用時呼叫
    }

    static get supported() {
      return Boolean(
        navigator.mediaDevices &&
          navigator.mediaDevices.getUserMedia &&
          (window.AudioContext || window.webkitAudioContext)
      );
    }

    get active() {
      return Boolean(
        this.stream && this.stream.getAudioTracks().some((t) => t.readyState === 'live')
      );
    }

    get deviceId() {
      const track = this.stream && this.stream.getAudioTracks()[0];
      return (track && track.getSettings && track.getSettings().deviceId) || '';
    }

    async start(deviceId) {
      this.stop();
      // 關掉回音消除、降噪與自動增益，量到的才是教室真實音量
      const audio = { echoCancellation: false, noiseSuppression: false, autoGainControl: false };
      if (deviceId) audio.deviceId = { exact: deviceId };

      this.stream = await navigator.mediaDevices.getUserMedia({ audio });
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      const source = this.ctx.createMediaStreamSource(this.stream);
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 2048;
      source.connect(this.analyser);
      this.buf = new Float32Array(this.analyser.fftSize);
      if (this.ctx.state === 'suspended') await this.ctx.resume();

      this.stream.getAudioTracks().forEach((track) => {
        track.addEventListener('ended', () => {
          if (typeof this.onEnded === 'function') this.onEnded();
        });
      });
    }

    /** 讀取目前音量（0–100，已平滑處理：變大反應快、變小慢慢降） */
    read() {
      if (!this.analyser) return 0;
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      this.analyser.getFloatTimeDomainData(this.buf);
      let sum = 0;
      for (let i = 0; i < this.buf.length; i++) sum += this.buf[i] * this.buf[i];
      const rms = Math.sqrt(sum / this.buf.length);
      const db = 20 * Math.log10(Math.max(rms, 1e-8));
      const raw = Math.min(100, Math.max(0, ((db - DB_FLOOR) / (DB_CEIL - DB_FLOOR)) * 100));
      const speed = raw > this.level ? 0.35 : 0.08;
      this.level += (raw - this.level) * speed;
      return this.level;
    }

    stop() {
      if (this.stream) this.stream.getTracks().forEach((t) => t.stop());
      if (this.ctx) this.ctx.close().catch(() => {});
      this.stream = null;
      this.ctx = null;
      this.analyser = null;
      this.level = 0;
    }

    /** 列出可用的麥克風（要先允許權限後才看得到名稱） */
    static async listInputs() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return [];
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter((d) => d.kind === 'audioinput');
    }
  }

  NP.Mic = Mic;
})((window.NP = window.NP || {}));
