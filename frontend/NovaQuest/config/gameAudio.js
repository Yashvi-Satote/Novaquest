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

  /**
   * Authentic Apollo Quindar Beep (Intro/outro radio cue)
   */
  playQuindarBeep() {
    if (this.isMuted) return;
    this.ensureUnlocked();
    const ctx = this.ctx;
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2525, now); // Standard Apollo intro quindar beep frequency

    gain.gain.setValueAtTime(this.volume * 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  /**
   * Hydraulic hatch close sound
   */
  playHatchClose() {
    if (this.isMuted) return;
    this.ensureUnlocked();
    const ctx = this.ctx;
    if (!ctx) return;

    const now = ctx.currentTime;
    // Servo motor slide
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.6);

    gain.gain.setValueAtTime(this.volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.65);

    // Mechanical latch clank at 0.5s
    setTimeout(() => {
      if (!this.ctx || this.isMuted) return;
      const t = this.ctx.currentTime;
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(75, t);
      gain2.gain.setValueAtTime(this.volume * 0.35, t);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(t);
      osc2.stop(t + 0.2);
    }, 500);
  }

  /**
   * Countdown telemetry beep
   */
  playCountdownBeep(isFinal = false) {
    if (this.isMuted) return;
    this.ensureUnlocked();
    const ctx = this.ctx;
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isFinal ? 1200 : 800, now);

    gain.gain.setValueAtTime(this.volume * 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isFinal ? 0.4 : 0.15));

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + (isFinal ? 0.45 : 0.2));
  }

  /**
   * Rewarding Component Pickup Chime (Ascending triad sparkle)
   */
  playPickup() {
    if (this.isMuted) return;
    this.ensureUnlocked();
    const ctx = this.ctx;
    if (!ctx) return;

    const notes = [1046.5, 1318.5, 1567.98, 2093.0]; // C6, E6, G6, C7
    notes.forEach((freq, i) => {
      const now = ctx.currentTime + i * 0.06;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(this.volume * 0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    });
  }

  /**
   * Component Mechanical Attach & Snap Clank
   */
  playAttachSnap() {
    if (this.isMuted) return;
    this.ensureUnlocked();
    const ctx = this.ctx;
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.18);

    gain.gain.setValueAtTime(this.volume * 0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  /**
   * Dynamic Proximity Locator Radar Ping
   */
  playLocatorPing(dist = 30) {
    if (this.isMuted) return;
    this.ensureUnlocked();
    const ctx = this.ctx;
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Closer distance = higher pitch and louder chirp
    const pitch = Math.min(2200, Math.max(900, 2200 - dist * 35));
    const vol = Math.min(0.25, Math.max(0.05, 0.28 - (dist / 60) * 0.2));

    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(pitch * 1.25, now + 0.08);

    gain.gain.setValueAtTime(vol * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  /**
   * Lunar surface footstep crunch
   */
  playFootstep() {
    if (this.isMuted) return;
    this.ensureUnlocked();
    const ctx = this.ctx;
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(60 + Math.random() * 30, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);

    gain.gain.setValueAtTime(this.volume * 0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * High-tech handheld scanner pulse
   */
  playScanner() {
    if (this.isMuted) return;
    this.ensureUnlocked();
    const ctx = this.ctx;
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.linearRampToValueAtTime(1400, now + 0.25);

    gain.gain.setValueAtTime(this.volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  /**
   * Electrical repair sparks / welding sound
   */
  playRepairSparks() {
    if (this.isMuted) return;
    this.ensureUnlocked();
    const ctx = this.ctx;
    if (!ctx) return;

    for (let i = 0; i < 4; i++) {
      const now = ctx.currentTime + i * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200 + Math.random() * 400, now);

      gain.gain.setValueAtTime(this.volume * 0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    }
  }

  /**
   * Electrical power-up surge & system online hum
   */
  playPowerUp() {
    if (this.isMuted) return;
    this.ensureUnlocked();
    const ctx = this.ctx;
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 1.2);

    gain.gain.setValueAtTime(this.volume * 0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 1.5);
  }

  /**
   * Character Voice Speech with Browser Synthesis
   */
  speakDialogue(text, speaker = 'jaffe', onBoundary = null, onEnd = null) {
    this.playQuindarBeep();

    if (typeof window === 'undefined' || !window.speechSynthesis) {
      if (onEnd) setTimeout(onEnd, 3500);
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';

      // Find best available English voice
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        if (speaker === 'jaffe') {
          // Look for male, warm, or natural voice
          const maleVoice = voices.find(v => 
            v.lang.startsWith('en') && (v.name.includes('David') || v.name.includes('Mark') || v.name.includes('Guy') || v.name.includes('Male'))
          ) || voices.find(v => v.lang.startsWith('en'));
          if (maleVoice) utterance.voice = maleVoice;
          utterance.rate = 0.94;
          utterance.pitch = 0.92;
        } else {
          // Leo / Explorer: youthful, energetic
          const childVoice = voices.find(v => 
            v.lang.startsWith('en') && (v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Natural'))
          ) || voices.find(v => v.lang.startsWith('en'));
          if (childVoice) utterance.voice = childVoice;
          utterance.rate = 1.05;
          utterance.pitch = 1.15;
        }
      }

      if (onBoundary) {
        utterance.onboundary = onBoundary;
      }

      let finished = false;
      const finish = () => {
        if (!finished) {
          finished = true;
          if (onEnd) onEnd();
        }
      };

      utterance.onend = finish;
      utterance.onerror = finish;

      // Safe fallback timer in case headless browser suppresses audio events
      const expectedDurationMs = Math.max(3200, (text.length / 14) * 1000 + 1200);
      setTimeout(finish, expectedDurationMs);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      if (onEnd) setTimeout(onEnd, 3200);
    }
  }

  stopSpeech() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
  }

  /**
   * Helper to play an external audio asset with volume control, mute check, and Web Audio fallback
   */
  playAudioFile(path, fallbackSynthFn = null, volumeMultiplier = 1.0) {
    if (this.isMuted) return null;
    this.ensureUnlocked();

    if (typeof Audio !== 'undefined') {
      try {
        const audio = new Audio(path);
        audio.volume = Math.max(0, Math.min(1, this.volume * volumeMultiplier));
        if (!this.activeLaunchSounds) this.activeLaunchSounds = new Set();
        this.activeLaunchSounds.add(audio);
        audio.onended = () => {
          this.activeLaunchSounds?.delete(audio);
        };
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn(`[GameAudioEngine] Audio file (${path}) playback error:`, err);
            this.activeLaunchSounds?.delete(audio);
            if (fallbackSynthFn) fallbackSynthFn.call(this);
          });
        }
        return audio;
      } catch (err) {
        if (fallbackSynthFn) fallbackSynthFn.call(this);
        return null;
      }
    } else if (fallbackSynthFn) {
      fallbackSynthFn.call(this);
    }
    return null;
  }

  stopLaunchAudio() {
    if (this.activeLaunchSounds) {
      this.activeLaunchSounds.forEach((audio) => {
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch (_) {}
      });
      this.activeLaunchSounds.clear();
    }
  }

  /**
   * 1. Countdown + ambience bed (3 sec)
   * Vintage 1960s NASA radio voice quickly counting "three, two, one" with slight crackle,
   * faint mission control murmur and teletype in the background, tense, 3 seconds.
   */
  playLaunchCountdown() {
    return this.playAudioFile('/audio/launch/01_countdown_ambience.mp3', () => {
      this.playQuindarBeep();
      this.playCountdownBeep(false);
      setTimeout(() => this.playCountdownBeep(false), 1000);
      setTimeout(() => this.playCountdownBeep(true), 2000);
    }, 1.0);
  }

  /**
   * 2. Ignition (0.5 sec)
   * Sharp rocket engine ignition burst, sudden crackling whoosh with deep thump, 0.5 seconds.
   */
  playLaunchIgnition() {
    return this.playAudioFile('/audio/launch/02_ignition.mp3', () => {
      this.playAttachSnap();
    }, 1.0);
  }

  /**
   * 3. Liftoff roar (3.5 sec)
   * Powerful rocket liftoff roar that builds rapidly from a deep rumble to a thunderous peak,
   * heavy bass, rattling vibration, cinematic, 3.5 seconds.
   */
  playLaunchRoar() {
    return this.playAudioFile('/audio/launch/03_liftoff_roar.mp3', () => {
      this.playThruster(3.5);
    }, 1.0);
  }

  /**
   * 4. Stage separation (0.5 sec)
   * Short metallic clunk with a quick pneumatic hiss and whoosh, 0.5 seconds.
   */
  playStageSeparation() {
    return this.playAudioFile('/audio/launch/04_stage_separation.mp3', () => {
      this.playHatchClose();
    }, 0.95);
  }

  /**
   * 5. Celebration (2 sec)
   * Mission control team cheering and applauding with a few whoops, room echo,
   * plus a bright retro success chime at the start, 2 seconds.
   */
  playLaunchCelebration() {
    return this.playAudioFile('/audio/launch/05_celebration.mp3', () => {
      this.playVictory();
    }, 1.0);
  }

  /**
   * Optional single-file version (9.5 sec)
   * 9.5 second rocket launch sequence: countdown, ignition, liftoff roar,
   * metallic stage separation clunk, mission control cheers with bright retro chime.
   */
  playFullLaunchSequence() {
    return this.playAudioFile('/audio/launch/launch_sequence_9_5s.mp3', () => {
      this.playLaunchCountdown();
      setTimeout(() => this.playLaunchIgnition(), 3000);
      setTimeout(() => this.playLaunchRoar(), 3500);
      setTimeout(() => this.playStageSeparation(), 7000);
      setTimeout(() => this.playLaunchCelebration(), 7500);
    }, 1.0);
  }

  /**
   * Emergency Anomaly Alarm Siren (2.2 sec loopable)
   * Alternating 1967 NASA telemetry hazard alarm.
   */
  playEmergencyAlarm() {
    return this.playAudioFile('/audio/launch/emergency_alarm.mp3', () => {
      this.playAlarm();
    }, 0.9);
  }

  /**
   * Successful Lunar Landing Touchdown (3.5 sec)
   * Quindar cue, touchdown crunch, and grand victory fanfare.
   */
  playLandingTouchdown() {
    return this.playAudioFile('/audio/launch/landing_touchdown.mp3', () => {
      this.playQuindarBeep();
      this.playVictory();
    }, 1.0);
  }
}

export const gameAudio = new GameAudioEngine();

