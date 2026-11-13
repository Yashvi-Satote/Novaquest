/**
 * guidanceAudio.js
 * 
 * 100% Self-Contained Sci-Fi Web Audio Engine for Surveyor 5 Guidance System
 * 
 * Features:
 * - Pure Web Audio API synthesis (oscillators, biquad filters, delays, procedural noise)
 * - Zero external asset dependencies — works offline out of the box
 * - Ready to swap in .mp3/.ogg files at any time via optional soundUrls config
 * - Sonar beacon ping with simulated reverb/delay (rate & pitch scale with proximity)
 * - Beacon activation sweep & digital chirp
 * - Holographic marker whoosh + crystalline chime
 * - Retrieve confirm power-up sound with triumph major chord
 * - Atmospheric low space hum loop (subtle ambient drone)
 * - Autoplay unlocking on first user interaction
 * - Master volume & M key mute/unmute
 */

class GuidanceAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterVolume = 0.65;
    this.isUnlocked = false;

    // Ambient space hum nodes
    this.spaceHumGain = null;
    this.spaceHumOsc1 = null;
    this.spaceHumOsc2 = null;
    this.isSpaceHumPlaying = false;

    // Optional external audio URLs (easy swap in for .mp3 / .ogg)
    this.soundUrls = {
      beaconPing: null,       // e.g. '/audio/beacon_ping.mp3'
      beaconActivated: null,  // e.g. '/audio/beacon_activated.mp3'
      markerChime: null,      // e.g. '/audio/marker_chime.mp3'
      retrieveConfirm: null,  // e.g. '/audio/retrieve_confirm.mp3'
      spaceHum: null          // e.g. '/audio/space_hum_loop.mp3'
    };

    // Load saved preferences
    if (typeof window !== 'undefined') {
      try {
        const savedMute = localStorage.getItem('novaquest_guidance_muted');
        if (savedMute !== null) this.isMuted = savedMute === 'true';
        const savedVol = localStorage.getItem('novaquest_guidance_volume');
        if (savedVol !== null) this.masterVolume = parseFloat(savedVol);
      } catch (e) {}

      // Register user interaction unlocking
      const unlockHandler = () => {
        this.unlock();
      };
      window.addEventListener('pointerdown', unlockHandler, { once: true, passive: true });
      window.addEventListener('keydown', unlockHandler, { once: true, passive: true });
    }
  }

  /**
   * Initializes or returns existing AudioContext
   */
  getContext() {
    if (this.ctx) return this.ctx;
    if (typeof window === 'undefined') return null;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    this.ctx = new AudioContextClass();
    return this.ctx;
  }

  /**
   * Unlocks AudioContext on user interaction
   */
  unlock() {
    const ctx = this.getContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    this.isUnlocked = true;
    if (!this.isMuted && !this.isSpaceHumPlaying) {
      this.startSpaceHum();
    }
  }

  setVolume(vol) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('novaquest_guidance_volume', String(this.masterVolume));
      } catch (e) {}
    }
    if (this.spaceHumGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.spaceHumGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume * 0.035, now);
    }
  }

  setMuted(muted) {
    this.isMuted = Boolean(muted);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('novaquest_guidance_muted', String(this.isMuted));
      } catch (e) {}
    }
    if (this.spaceHumGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.spaceHumGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume * 0.035, now);
    }
  }

  toggleMute() {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Helper: Plays external audio file if URL configured, otherwise returns false
   */
  _tryPlayExternal(soundKey) {
    const url = this.soundUrls[soundKey];
    if (url && typeof Audio !== 'undefined') {
      const audio = new Audio(url);
      audio.volume = this.masterVolume;
      audio.muted = this.isMuted;
      audio.play().catch(() => {});
      return true;
    }
    return false;
  }

  // =========================================================================
  // 1. BEACON PING (Sonar ping with simulated reverb/delay)
  // =========================================================================
  playBeaconPing(distance = 50, minDistance = 8, maxDistance = 140, basePitch = 600) {
    if (this.isMuted) return;
    if (this._tryPlayExternal('beaconPing')) return;

    this.unlock();
    const ctx = this.ctx;
    if (!ctx) return;

    const now = ctx.currentTime;

    // Pitch scales higher as distance decreases (closer = more urgent)
    const factor = Math.max(0, Math.min(1, (distance - minDistance) / (maxDistance - minDistance)));
    const targetPitch = basePitch + (1.0 - factor) * 320; // 600 Hz far -> 920 Hz close

    // Master node for this ping instance
    const pingOutput = ctx.createGain();
    const vol = (0.24 + (1.0 - factor) * 0.12) * this.masterVolume;
    pingOutput.gain.setValueAtTime(vol, now);

    // Primary Sonar Tone Oscillator
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(targetPitch, now);
    // Subtle downward glissando gives sonar acoustic feel
    osc.frequency.exponentialRampToValueAtTime(targetPitch * 0.94, now + 0.22);

    oscGain.gain.setValueAtTime(1.0, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    // Sub-Harmonic Accent for depth
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(targetPitch * 0.5, now);
    subGain.gain.setValueAtTime(0.35, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    // Simulated Reverb / Stereo Delay Network
    const delay = ctx.createDelay();
    delay.delayTime.setValueAtTime(0.14, now);
    const feedback = ctx.createGain();
    feedback.gain.setValueAtTime(0.38, now);
    const delayFilter = ctx.createBiquadFilter();
    delayFilter.type = 'lowpass';
    delayFilter.frequency.setValueAtTime(1400, now);

    // Connections
    osc.connect(oscGain);
    subOsc.connect(subGain);
    oscGain.connect(pingOutput);
    subGain.connect(pingOutput);

    // Feed to Delay Reverb loop
    pingOutput.connect(delay);
    delay.connect(delayFilter);
    delayFilter.connect(feedback);
    feedback.connect(delay);
    delayFilter.connect(ctx.destination);

    // Direct Dry output
    pingOutput.connect(ctx.destination);

    osc.start(now);
    subOsc.start(now);
    osc.stop(now + 0.3);
    subOsc.stop(now + 0.2);

    // Clean disconnect after echoes finish
    setTimeout(() => {
      try {
        pingOutput.disconnect();
        delay.disconnect();
        feedback.disconnect();
      } catch (e) {}
    }, 900);
  }

  // =========================================================================
  // 2. BEACON ACTIVATED (Rising synth sweep + short digital chirp)
  // =========================================================================
  playBeaconActivated() {
    if (this.isMuted) return;
    if (this._tryPlayExternal('beaconActivated')) return;

    this.unlock();
    const ctx = this.ctx;
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Rising Synth Sweep
    const sweepOsc = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    const sweepFilter = ctx.createBiquadFilter();

    sweepOsc.type = 'sawtooth';
    sweepOsc.frequency.setValueAtTime(130, now);
    sweepOsc.frequency.exponentialRampToValueAtTime(1250, now + 0.75);

    sweepFilter.type = 'bandpass';
    sweepFilter.frequency.setValueAtTime(280, now);
    sweepFilter.frequency.exponentialRampToValueAtTime(2400, now + 0.75);
    sweepFilter.Q.setValueAtTime(4.0, now);

    sweepGain.gain.setValueAtTime(0.01, now);
    sweepGain.gain.linearRampToValueAtTime(this.masterVolume * 0.28, now + 0.45);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.82);

    sweepOsc.connect(sweepFilter);
    sweepFilter.connect(sweepGain);
    sweepGain.connect(ctx.destination);

    sweepOsc.start(now);
    sweepOsc.stop(now + 0.85);

    // 2. Dual Digital Chirp at apex (0.65s)
    const chirpTime = now + 0.65;
    [1760, 2349].forEach((freq, idx) => {
      const chirpOsc = ctx.createOscillator();
      const chirpGain = ctx.createGain();

      chirpOsc.type = 'sine';
      chirpOsc.frequency.setValueAtTime(freq, chirpTime + idx * 0.05);

      chirpGain.gain.setValueAtTime(this.masterVolume * 0.32, chirpTime + idx * 0.05);
      chirpGain.gain.exponentialRampToValueAtTime(0.001, chirpTime + idx * 0.05 + 0.14);

      chirpOsc.connect(chirpGain);
      chirpGain.connect(ctx.destination);

      chirpOsc.start(chirpTime + idx * 0.05);
      chirpOsc.stop(chirpTime + idx * 0.05 + 0.16);
    });
  }

  // =========================================================================
  // 3. MARKER APPEARS (Holographic whoosh + crystalline chime)
  // =========================================================================
  playMarkerAppears() {
    if (this.isMuted) return;
    if (this._tryPlayExternal('markerChime')) return;

    this.unlock();
    const ctx = this.ctx;
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Holographic Soft Whoosh (Procedural filtered noise)
    const bufferSize = ctx.sampleRate * 0.35;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.7;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const whooshFilter = ctx.createBiquadFilter();
    whooshFilter.type = 'bandpass';
    whooshFilter.frequency.setValueAtTime(2200, now);
    whooshFilter.frequency.exponentialRampToValueAtTime(450, now + 0.32);
    whooshFilter.Q.setValueAtTime(2.5, now);

    const whooshGain = ctx.createGain();
    whooshGain.gain.setValueAtTime(0.01, now);
    whooshGain.gain.linearRampToValueAtTime(this.masterVolume * 0.22, now + 0.12);
    whooshGain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);

    whiteNoise.connect(whooshFilter);
    whooshFilter.connect(whooshGain);
    whooshGain.connect(ctx.destination);
    whiteNoise.start(now);

    // 2. Crystalline Chime Triad (High glitter sine notes)
    const chimeNotes = [1046.5, 1318.51, 1567.98, 2093.0]; // C6, E6, G6, C7
    chimeNotes.forEach((f, i) => {
      const cTime = now + 0.08 + i * 0.05;
      const cOsc = ctx.createOscillator();
      const cGain = ctx.createGain();

      cOsc.type = 'sine';
      cOsc.frequency.setValueAtTime(f, cTime);

      cGain.gain.setValueAtTime(this.masterVolume * 0.24, cTime);
      cGain.gain.exponentialRampToValueAtTime(0.001, cTime + 0.38);

      cOsc.connect(cGain);
      cGain.connect(ctx.destination);

      cOsc.start(cTime);
      cOsc.stop(cTime + 0.4);
    });
  }

  // =========================================================================
  // 4. RETRIEVE CONFIRM (Power-up sound with success chord)
  // =========================================================================
  playRetrieveConfirm() {
    if (this.isMuted) return;
    if (this._tryPlayExternal('retrieveConfirm')) return;

    this.unlock();
    const ctx = this.ctx;
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Resonant Power-Up Swell
    const swellOsc = ctx.createOscillator();
    const swellGain = ctx.createGain();
    swellOsc.type = 'sawtooth';
    swellOsc.frequency.setValueAtTime(110, now);
    swellOsc.frequency.exponentialRampToValueAtTime(880, now + 0.6);

    const swellFilter = ctx.createBiquadFilter();
    swellFilter.type = 'lowpass';
    swellFilter.frequency.setValueAtTime(300, now);
    swellFilter.frequency.exponentialRampToValueAtTime(3200, now + 0.6);

    swellGain.gain.setValueAtTime(0.02, now);
    swellGain.gain.linearRampToValueAtTime(this.masterVolume * 0.32, now + 0.45);
    swellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    swellOsc.connect(swellFilter);
    swellFilter.connect(swellGain);
    swellGain.connect(ctx.destination);

    swellOsc.start(now);
    swellOsc.stop(now + 0.85);

    // 2. Triumphant Major Chord at 0.4s: C4, G4, C5, E5, G5, C6
    const chordTime = now + 0.4;
    const notes = [261.63, 392.00, 523.25, 659.25, 783.99, 1046.50];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, chordTime);

      const noteVol = (idx >= 4 ? 0.16 : 0.22) * this.masterVolume;
      gain.gain.setValueAtTime(noteVol, chordTime);
      gain.gain.exponentialRampToValueAtTime(0.001, chordTime + 1.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(chordTime);
      osc.stop(chordTime + 1.3);
    });
  }

  // =========================================================================
  // 5. AMBIENT SPACE HUM LOOP (Low, immersive atmospheric sub-bass)
  // =========================================================================
  startSpaceHum() {
    if (this.isSpaceHumPlaying || this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      this.spaceHumGain = ctx.createGain();
      this.spaceHumGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume * 0.035, now);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(130, now);

      // Low 55 Hz Sine + 110 Hz Triangle
      this.spaceHumOsc1 = ctx.createOscillator();
      this.spaceHumOsc1.type = 'sine';
      this.spaceHumOsc1.frequency.setValueAtTime(55.0, now); // Sub-bass A1

      this.spaceHumOsc2 = ctx.createOscillator();
      this.spaceHumOsc2.type = 'triangle';
      this.spaceHumOsc2.frequency.setValueAtTime(110.0, now); // A2 harmonic

      this.spaceHumOsc1.connect(filter);
      this.spaceHumOsc2.connect(filter);
      filter.connect(this.spaceHumGain);
      this.spaceHumGain.connect(ctx.destination);

      this.spaceHumOsc1.start();
      this.spaceHumOsc2.start();
      this.isSpaceHumPlaying = true;
    } catch (e) {
      console.warn('Could not start ambient space hum:', e);
    }
  }

  stopSpaceHum() {
    if (!this.isSpaceHumPlaying) return;
    try {
      if (this.spaceHumOsc1) {
        this.spaceHumOsc1.stop();
        this.spaceHumOsc1.disconnect();
      }
      if (this.spaceHumOsc2) {
        this.spaceHumOsc2.stop();
        this.spaceHumOsc2.disconnect();
      }
      if (this.spaceHumGain) {
        this.spaceHumGain.disconnect();
      }
    } catch (e) {}
    this.isSpaceHumPlaying = false;
    this.spaceHumOsc1 = null;
    this.spaceHumOsc2 = null;
    this.spaceHumGain = null;
  }

  dispose() {
    this.stopSpaceHum();
    if (this.ctx && typeof this.ctx.close === 'function') {
      try {
        this.ctx.close();
      } catch (e) {}
      this.ctx = null;
    }
  }
}

export const guidanceAudio = new GuidanceAudioEngine();
