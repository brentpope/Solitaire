/**
 * audio.js - Synthesized Web Audio API sound effects for Klondike Solitaire
 * Zero external audio files required!
 */

class SoundController {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('solitaire_sound_muted') === 'true';
    this.volume = parseFloat(localStorage.getItem('solitaire_volume') || '0.5');
    this.unlocked = false;

    // Listen to first user gesture to unlock Web Audio in Safari/iOS/Chrome
    const unlockAudio = () => {
      this.initContext();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.unlocked = true;
      ['click', 'touchstart', 'keydown'].forEach(evt => {
        window.removeEventListener(evt, unlockAudio, { passive: true });
      });
    };

    ['click', 'touchstart', 'keydown'].forEach(evt => {
      window.addEventListener(evt, unlockAudio, { passive: true, once: true });
    });
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  setMuted(muted) {
    this.muted = !!muted;
    localStorage.setItem('solitaire_sound_muted', this.muted);
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('solitaire_volume', this.volume);
  }

  getMasterGain() {
    if (!this.ctx) return null;
    const gain = this.ctx.createGain();
    gain.gain.value = this.muted ? 0 : this.volume;
    gain.connect(this.ctx.destination);
    return gain;
  }

  /**
   * Sound when dealing or drawing a card (gentle whoosh/flick)
   */
  playDeal() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const master = this.getMasterGain();
      const now = this.ctx.currentTime;

      // Filtered noise burst for paper friction
      const bufferSize = this.ctx.sampleRate * 0.08;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.4;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(450, now + 0.08);
      filter.Q.value = 1.2;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(master);

      noise.start(now);
      noise.stop(now + 0.08);
    } catch (e) {
      // Audio might be blocked before first interaction
    }
  }

  /**
   * Sound when a card lands on a pile (soft, satisfying felt/card snap)
   */
  playCardPlace() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const master = this.getMasterGain();
      const now = this.ctx.currentTime;

      // Short tone with rapid pitch drop
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(65, now + 0.07);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(master);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch (e) {}
  }

  /**
   * Sound when flipping a face-down card face-up (crisp snap)
   */
  playCardFlip() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const master = this.getMasterGain();
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(680, now + 0.035);
      osc.frequency.linearRampToValueAtTime(140, now + 0.07);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(master);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch (e) {}
  }

  /**
   * Musical chime when placing a card on a Foundation pile
   * Higher rank = higher pitch!
   */
  playFoundation(rank = 1) {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const master = this.getMasterGain();
      const now = this.ctx.currentTime;

      // Pentatonic scale base frequencies for ranks 1..13
      const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];
      const freq = scale[Math.min(scale.length - 1, Math.max(0, rank - 1))];

      // Primary chime
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);

      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc1.connect(gain1);
      gain1.connect(master);
      osc1.start(now);
      osc1.stop(now + 0.45);

      // Overtone sparkle (1 octave higher)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, now);

      gain2.gain.setValueAtTime(0.15, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc2.connect(gain2);
      gain2.connect(master);
      osc2.start(now);
      osc2.stop(now + 0.3);
    } catch (e) {}
  }

  /**
   * Sound when user makes an illegal move
   */
  playError() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const master = this.getMasterGain();
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.setValueAtTime(90, now + 0.08);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(master);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch (e) {}
  }

  /**
   * Triumphant fanfare when player wins!
   */
  playWin() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const master = this.getMasterGain();
      const now = this.ctx.currentTime;

      // C major arpeggio fanfare: C4, E4, G4, C5, E5, G5
      const notes = [
        { f: 261.63, t: 0.0, d: 0.18 },
        { f: 329.63, t: 0.15, d: 0.18 },
        { f: 392.00, t: 0.30, d: 0.18 },
        { f: 523.25, t: 0.45, d: 0.25 },
        { f: 659.25, t: 0.65, d: 0.25 },
        { f: 783.99, t: 0.85, d: 0.70 }
      ];

      notes.forEach(({ f, t, d }) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + t);

        gain.gain.setValueAtTime(0.01, now + t);
        gain.gain.linearRampToValueAtTime(0.3, now + t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);

        osc.connect(gain);
        gain.connect(master);

        osc.start(now + t);
        osc.stop(now + t + d);
      });
    } catch (e) {}
  }
}

// Global sound singleton
const sound = new SoundController();
