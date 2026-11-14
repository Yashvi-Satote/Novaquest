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
    // Ambient space hum disabled to maintain clean lunar audio
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
  // 1. BEACON PING (Sonar ping with simulated reverb/delay) - SILENCED
  // =========================================================================
  playBeaconPing() {
    // Proximity sonar pings permanently disabled per mission audio requirements
    return;
  }

  // =========================================================================
  // 2. BEACON ACTIVATED - SILENCED
  // =========================================================================
  playBeaconActivated() {
    // Beacon sound disabled per requirements
    return;
  }

  // =========================================================================
  // 3. MARKER APPEARS - SILENCED
  // =========================================================================
  playMarkerAppears() {
    // Proximity approach whoosh/chime completely removed per requirements
    return;
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
  // 5. AMBIENT SPACE HUM LOOP - SILENCED
  // =========================================================================
  startSpaceHum() {
    // Unwanted space hum disabled per audio requirements
    if (this.isSpaceHumPlaying) {
      this.stopSpaceHum();
    }
    return;
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
