/**
 * gameAudio.js
 * 
 * Synthesized Web Audio Engine for "Time Travelers of Space" — NovaQuest Games
 * 
 * 100% self-contained synthesized audio:
 * - Zero network latency, zero broken external audio paths.
 * - Gentle, friendly cartoon-adventure feedback tailored for ages 8-14.
 * - Full support for mute, volume control, and safe browser audio-context unlocking.
 */

class GameAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.volume = 0.7;
    this.isUnlocked = false;

    // Check localStorage preference
    if (typeof window !== 'undefined') {
      try {
        const savedMute = localStorage.getItem('novaquest_game_muted');
        if (savedMute !== null) this.isMuted = savedMute === 'true';
        const savedVol = localStorage.getItem('novaquest_game_volume');
        if (savedVol !== null) this.volume = parseFloat(savedVol);
      } catch (e) {
        // Safe fallback
      }
    }
  }

  initContext() {
    if (this.ctx) return this.ctx;
    if (typeof window === 'undefined') return null;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;

    this.ctx = new AudioContext();
    return this.ctx;
  }

  ensureUnlocked() {
    const ctx = this.initContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    this.isUnlocked = true;
  }

  setMuted(muted) {
    this.isMuted = Boolean(muted);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('novaquest_game_muted', String(this.isMuted));
      } catch (e) {}
    }
  }

  toggleMute() {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('novaquest_game_volume', String(this.volume));
      } catch (e) {}
    }
  }

  // 1. UI Click Pop (Bubbly, soft, playful)
  playClick() {
    if (this.isMuted) return;
    this.ensureUnlocked();
    const ctx = this.ctx;
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(this.volume * 0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // 2. Success Chime (Bright major triad for correct component or objective)
  playSuccess() {
    if (this.isMuted) return;
    this.ensureUnlocked();
    const ctx = this.ctx;
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const now = ctx.currentTime + idx * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(this.volume * 0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    });
  }

  // 3. Educational Error / Try-Again (Gentle boing, not jarring)
  playError() {
    if (this.isMuted) return;
    this.ensureUnlocked();
    const ctx = this.ctx;
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.25);

    gain.gain.setValueAtTime(this.volume * 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  // 4. Mission Control 1967 Emergency Alarm
  playAlarm() {
    if (this.isMuted) return;
    this.ensureUnlocked();
    const ctx = this.ctx;
    if (!ctx) return;

    for (let i = 0; i < 3; i++) {
      const now = ctx.currentTime + i * 0.28;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.setValueAtTime(600, now + 0.12);

      gain.gain.setValueAtTime(this.volume * 0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    }
  }

  // 5. Thruster Burn (Smooth filtered noise rumble)
  playThruster(durationSec = 1.2) {
    if (this.isMuted) return;
    this.ensureUnlocked();
    const ctx = this.ctx;
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * durationSec;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(380, ctx.currentTime + durationSec * 0.5);
    filter.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + durationSec);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.28, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
  }

  // 6. Time Travel Cosmic Jump (Magical rising resonant glissando)
  playTimeTravel() {
    if (this.isMuted) return;
    this.ensureUnlocked();
    const ctx = this.ctx;
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 1.2);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(this.volume * 0.35, now + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 1.3);
  }

  // 7. Scientific Telemetry / Alpha-Scattering Spectrometer
  playAnalyze() {
    if (this.isMuted) return;
    this.ensureUnlocked();
    const ctx = this.ctx;
    if (!ctx) return;

    for (let i = 0; i < 5; i++) {
      const now = ctx.currentTime + i * 0.12;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200 + i * 150, now);

      gain.gain.setValueAtTime(this.volume * 0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    }
  }

  // 8. Victory Fanfare (Celebratory multi-note arpeggio)
  playVictory() {
    if (this.isMuted) return;
    this.ensureUnlocked();
    const ctx = this.ctx;
    if (!ctx) return;

    const fanfare = [
      { f: 523.25, d: 0.15 }, // C5
      { f: 659.25, d: 0.15 }, // E5
      { f: 783.99, d: 0.15 }, // G5
      { f: 1046.50, d: 0.45 } // C6
    ];

    let offset = 0;
    fanfare.forEach(note => {
      const now = ctx.currentTime + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, now);

      gain.gain.setValueAtTime(this.volume * 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + note.d);
      offset += note.d * 0.85;
    });
  }
}

export const gameAudio = new GameAudioEngine();
