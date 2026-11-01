/**
 * Web Audio API Sound Synthesizer for Novaquest
 * Synthesizes procedural sci-fi UI sound effects and ambient deep-space drones
 * without relying on external MP3 downloads.
 */

import { getSettings } from './saveManager';

class AudioManager {
  constructor() {
    this.ctx = null;
    this.ambienceGain = null;
    this.ambienceOscA = null;
    this.ambienceOscB = null;
    this.noiseNode = null;
    this.isAmbiencePlaying = false;
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  getVolumes() {
    const settings = getSettings();
    if (settings.audio.muted) {
      return { master: 0, sfx: 0, music: 0 };
    }
    const master = (settings.audio.masterVolume ?? 80) / 100;
    const sfx = ((settings.audio.sfxVolume ?? 80) / 100) * master;
    const music = ((settings.audio.musicVolume ?? 70) / 100) * master;
    return { master, sfx, music };
  }

  /**
   * Hover sound: Subtle, high-tech electronic blip
   */
  playHover() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const { sfx } = this.getVolumes();
    if (sfx <= 0.001) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.04);

      gain.gain.setValueAtTime(sfx * 0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }

  /**
   * Click sound: Crisp resonant sci-fi confirm chirp
   */
  playClick() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const { sfx } = this.getVolumes();
    if (sfx <= 0.001) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(sfx * 0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {}
  }

  /**
   * Start Game: Rising resonant sweep with sub-bass pulse
   */
  playStartGame() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const { sfx } = this.getVolumes();
    if (sfx <= 0.001) return;

    try {
      const now = ctx.currentTime;

      // High sweep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.7);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(4000, now + 0.7);

      gain.gain.setValueAtTime(sfx * 0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.85);

      // Low rumble
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(110, now);
      sub.frequency.exponentialRampToValueAtTime(45, now + 0.9);

      subGain.gain.setValueAtTime(sfx * 0.35, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

      sub.connect(subGain);
      subGain.connect(ctx.destination);

      sub.start(now);
      sub.stop(now + 1.1);
    } catch {}
  }

  /**
   * Ambient deep space background hum
   */
  startAmbience() {
    if (this.isAmbiencePlaying) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const { music } = this.getVolumes();
      const now = ctx.currentTime;

      this.ambienceGain = ctx.createGain();
      this.ambienceGain.gain.setValueAtTime(0.001, now);
      this.ambienceGain.gain.linearRampToValueAtTime(music * 0.12, now + 2);

      // Warm low drone chord (F1 and C2)
      this.ambienceOscA = ctx.createOscillator();
      this.ambienceOscA.type = 'sine';
      this.ambienceOscA.frequency.setValueAtTime(55, now); // A1

      this.ambienceOscB = ctx.createOscillator();
      this.ambienceOscB.type = 'sine';
      this.ambienceOscB.frequency.setValueAtTime(82.4, now); // E2 fifth

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(220, now);

      this.ambienceOscA.connect(lowpass);
      this.ambienceOscB.connect(lowpass);
      lowpass.connect(this.ambienceGain);
      this.ambienceGain.connect(ctx.destination);

      this.ambienceOscA.start(now);
      this.ambienceOscB.start(now);
      this.isAmbiencePlaying = true;
    } catch (e) {
      console.warn('Could not start audio ambience:', e);
    }
  }

  stopAmbience() {
    if (!this.isAmbiencePlaying || !this.ambienceGain) return;
    try {
      const now = this.ctx.currentTime;
      this.ambienceGain.gain.linearRampToValueAtTime(0.0001, now + 0.5);
      setTimeout(() => {
        try {
          if (this.ambienceOscA) this.ambienceOscA.stop();
          if (this.ambienceOscB) this.ambienceOscB.stop();
        } catch {}
        this.isAmbiencePlaying = false;
      }, 550);
    } catch {
      this.isAmbiencePlaying = false;
    }
  }

  updateAmbienceVolume() {
    if (!this.isAmbiencePlaying || !this.ambienceGain || !this.ctx) return;
    const { music } = this.getVolumes();
    this.ambienceGain.gain.setValueAtTime(music * 0.12, this.ctx.currentTime);
  }
}

export const audio = new AudioManager();
