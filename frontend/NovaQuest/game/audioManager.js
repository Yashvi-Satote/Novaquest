/**
 * Web Audio API Sound Synthesizer for Novaquest
 * Synthesizes procedural sci-fi UI sound effects, lunar EVA cues, and vacuum helmet telemetry
 * without relying on external MP3 downloads.
 * 
 * LUNAR VACUUM ACOUSTICS:
 * The Moon has no atmosphere to carry ordinary sound waves.
 * All sound is conducted via:
 * 1. Internal helmet life-support (respirator breathing & telemetry).
 * 2. Suit UHF radio communications & squelch bursts.
 * 3. Direct mechanical/bone conduction through the astronaut's boots & suit chassis.
 * 4. Intentional long periods of vacuum silence between waypoints.
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

    // Vacuum Helmet Life-Support Breathing State
    this.isBreathingPlaying = false;
    this.breathingTimeout = null;

    // Alien Structure Sub-Bass Mechanical Bedrock Vibration State
    this.isAlienVibrationPlaying = false;
    this.alienVibrationGain = null;
    this.alienVibrationFilter = null;
    this.alienOscA = null;
    this.alienOscB = null;
    this.alienOscC = null;
    this.alienLfo = null;
    this.alienLfoGain = null;

    // Robotic Machinery Hydraulic Drone State (Zone 6)
    this.isRoboticMachineryPlaying = false;
    this.roboticMachineryGain = null;
    this.machineryFilter = null;
    this.machineryOscA = null;
    this.machineryOscB = null;
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
   * Helper: Generate an in-memory procedural white noise buffer for radio squelches & airflow
   */
  createNoiseBuffer(duration = 2.0) {
    const ctx = this.ensureContext();
    if (!ctx) return null;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
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
   * Scanner Ping: Ethereal radar frequency ping for the scanner wave inside helmet audio
   */
  playScannerPing() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const { sfx } = this.getVolumes();
    if (sfx <= 0.001) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1320, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.35);

      gain.gain.setValueAtTime(sfx * 0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch {}
  }

  /**
   * Footstep on lunar regolith: Muffled low-frequency dust crunch transmitted via suit boots
   */
  playFootstepLunar() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const { sfx } = this.getVolumes();
    if (sfx <= 0.001) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(105 + Math.random() * 20, now);
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.08);

      gain.gain.setValueAtTime(sfx * 0.10, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  /**
   * Low-gravity jump lift / EVA suit boost sound
   */
  playJumpLunar() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const { sfx } = this.getVolumes();
    if (sfx <= 0.001) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.2);

      gain.gain.setValueAtTime(sfx * 0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.24);
    } catch {}
  }

  /**
   * Resonant harmonic 432 Hz extraterrestrial monolith hum (Anomalous transmission)
   */
  playAnomalyHarmonic() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const { sfx } = this.getVolumes();
    if (sfx <= 0.001) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(432.06, now); // Anomaly Carrier Frequency

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(sfx * 0.28, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.2);
    } catch {}
  }

  /**
   * Interactive inspect / sample analyzer confirmation inside helmet HUD
   */
  playInteract() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const { sfx } = this.getVolumes();
    if (sfx <= 0.001) return;

    try {
      const now = ctx.currentTime;
      [587, 880, 1174].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(sfx * 0.14, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.12);
      });
    } catch {}
  }

  /**
   * Electrical spark / glitch burst for scanning anomalies & interface arcs
   */
  playGlitchBurst() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const { sfx } = this.getVolumes();
    if (sfx <= 0.001) return;

    try {
      const now = ctx.currentTime;
      // High-voltage dielectric discharge snap
      const snapOsc = ctx.createOscillator();
      const snapGain = ctx.createGain();
      snapOsc.type = 'sawtooth';
      snapOsc.frequency.setValueAtTime(2600, now);
      snapOsc.frequency.exponentialRampToValueAtTime(70, now + 0.12);
      snapGain.gain.setValueAtTime(sfx * 0.26, now);
      snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
      snapOsc.connect(snapGain);
      snapGain.connect(ctx.destination);
      snapOsc.start(now);
      snapOsc.stop(now + 0.14);

      // Filtered static crackle
      const noiseBuffer = this.createNoiseBuffer(0.14);
      if (noiseBuffer) {
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(3400, now);
        noiseFilter.Q.setValueAtTime(4.5, now);
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(sfx * 0.20, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noiseSource.start(now);
      }
    } catch {}
  }

  /* =========================================================================
   * ZONE 1: SUIT BREATHING, RADIO COMMUNICATION, EQUIPMENT FEEDBACK
   * ========================================================================= */

  /**
   * Suit Breathing Loop: Astronaut life-support O2 regulator airflow cycle.
   * Rhythmic, quiet, intimate inhalation (~1.8s) and exhalation (~2.0s) inside the helmet.
   */
  startSuitBreathing() {
    if (this.isBreathingPlaying) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.isBreathingPlaying = true;

    const runBreathingCycle = () => {
      if (!this.isBreathingPlaying) return;
      const { sfx } = this.getVolumes();
      if (sfx <= 0.001) {
        this.breathingTimeout = setTimeout(runBreathingCycle, 6200);
        return;
      }

      try {
        const now = ctx.currentTime;
        const noiseBuf = this.createNoiseBuffer(3.0);
        if (!noiseBuf) return;

        // Inhalation (~1.8s) — life-support O2 regulator opening
        const inhaleSrc = ctx.createBufferSource();
        inhaleSrc.buffer = noiseBuf;
        const inhaleFilter = ctx.createBiquadFilter();
        inhaleFilter.type = 'bandpass';
        inhaleFilter.frequency.setValueAtTime(820, now);
        inhaleFilter.Q.setValueAtTime(2.4, now);
        inhaleFilter.frequency.linearRampToValueAtTime(960, now + 1.2);

        const inhaleGain = ctx.createGain();
        inhaleGain.gain.setValueAtTime(0.0001, now);
        inhaleGain.gain.linearRampToValueAtTime(sfx * 0.035, now + 0.8);
        inhaleGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

        inhaleSrc.connect(inhaleFilter);
        inhaleFilter.connect(inhaleGain);
        inhaleGain.connect(ctx.destination);

        inhaleSrc.start(now);
        inhaleSrc.stop(now + 1.85);

        // Exhalation (~2.0s) — smooth air pressure exhaust valve
        const exhaleTime = now + 2.5;
        const exhaleSrc = ctx.createBufferSource();
        exhaleSrc.buffer = noiseBuf;
        const exhaleFilter = ctx.createBiquadFilter();
        exhaleFilter.type = 'bandpass';
        exhaleFilter.frequency.setValueAtTime(680, exhaleTime);
        exhaleFilter.Q.setValueAtTime(1.9, exhaleTime);
        exhaleFilter.frequency.linearRampToValueAtTime(520, exhaleTime + 1.4);

        const exhaleGain = ctx.createGain();
        exhaleGain.gain.setValueAtTime(0.0001, exhaleTime);
        exhaleGain.gain.linearRampToValueAtTime(sfx * 0.024, exhaleTime + 0.8);
        exhaleGain.gain.exponentialRampToValueAtTime(0.0001, exhaleTime + 2.0);

        exhaleSrc.connect(exhaleFilter);
        exhaleFilter.connect(exhaleGain);
        exhaleGain.connect(ctx.destination);

        exhaleSrc.start(exhaleTime);
        exhaleSrc.stop(exhaleTime + 2.05);

        // Schedule next breathing cycle (total ~6.6s loop)
        this.breathingTimeout = setTimeout(runBreathingCycle, 6600);
      } catch {
        this.breathingTimeout = setTimeout(runBreathingCycle, 7000);
      }
    };

    runBreathingCycle();
  }

  stopSuitBreathing() {
    this.isBreathingPlaying = false;
    if (this.breathingTimeout) {
      clearTimeout(this.breathingTimeout);
      this.breathingTimeout = null;
    }
  }

  /**
   * Radio Communication Chatter: Synthesized spacesuit VHF/UHF comms burst.
   * Features authentic mic key squelch click, band-pass radio filter (300Hz-3.2kHz),
   * tactical voice telemetry packet tones, and release squelch.
   */
  playRadioCommsChatter(speaker = 'chen') {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const { sfx } = this.getVolumes();
    if (sfx <= 0.001) return;

    try {
      const now = ctx.currentTime;

      // 1. Mic key squelch click
      const squelchBuf = this.createNoiseBuffer(0.05);
      if (squelchBuf) {
        const squelchSrc = ctx.createBufferSource();
        squelchSrc.buffer = squelchBuf;
        const squelchFilter = ctx.createBiquadFilter();
        squelchFilter.type = 'bandpass';
        squelchFilter.frequency.setValueAtTime(2400, now);
        squelchFilter.Q.setValueAtTime(3.8, now);

        const squelchGain = ctx.createGain();
        squelchGain.gain.setValueAtTime(sfx * 0.08, now);
        squelchGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

        squelchSrc.connect(squelchFilter);
        squelchFilter.connect(squelchGain);
        squelchGain.connect(ctx.destination);
        squelchSrc.start(now);
      }

      // 2. Synthesized digital voice telemetry packets
      const pitches = speaker === 'chen'
        ? [520, 680, 580, 760, 620]
        : speaker === 'vance'
        ? [340, 420, 380, 500, 400]
        : [580, 740, 860, 660]; // Mission Control

      const startDelay = 0.05;
      pitches.forEach((freq, idx) => {
        const toneTime = now + startDelay + idx * 0.065;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const bandpass = ctx.createBiquadFilter();

        // Narrowband spacesuit helmet radio response
        bandpass.type = 'bandpass';
        bandpass.frequency.setValueAtTime(1450, toneTime);
        bandpass.Q.setValueAtTime(2.2, toneTime);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, toneTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.94, toneTime + 0.06);

        gain.gain.setValueAtTime(sfx * 0.068, toneTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, toneTime + 0.06);

        osc.connect(bandpass);
        bandpass.connect(gain);
        gain.connect(ctx.destination);

        osc.start(toneTime);
        osc.stop(toneTime + 0.065);
      });

      // 3. Trailing mic release squelch
      const endSquelchTime = now + startDelay + pitches.length * 0.065 + 0.02;
      if (squelchBuf) {
        const endSrc = ctx.createBufferSource();
        endSrc.buffer = squelchBuf;
        const endFilter = ctx.createBiquadFilter();
        endFilter.type = 'bandpass';
        endFilter.frequency.setValueAtTime(1900, endSquelchTime);
        endFilter.Q.setValueAtTime(4.2, endSquelchTime);

        const endGain = ctx.createGain();
        endGain.gain.setValueAtTime(sfx * 0.075, endSquelchTime);
        endGain.gain.exponentialRampToValueAtTime(0.0001, endSquelchTime + 0.045);

        endSrc.connect(endFilter);
        endFilter.connect(endGain);
        endGain.connect(ctx.destination);
        endSrc.start(endSquelchTime);
      }
    } catch {}
  }

  /**
   * Equipment Feedback: Crisp digital telemetry chirps for portable terminal & suit HUD
   */
  playEquipmentFeedback() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const { sfx } = this.getVolumes();
    if (sfx <= 0.001) return;

    try {
      const now = ctx.currentTime;
      [1560, 2340].forEach((freq, idx) => {
        const t = now + idx * 0.05;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.04, t + 0.045);

        gain.gain.setValueAtTime(sfx * 0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.055);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.055);
      });
    } catch {}
  }

  /* =========================================================================
   * ZONE 2: SURVEYOR 1 SCANNER BEEPS & INTERFACE TONES
   * ========================================================================= */

  /**
   * Surveyor Scanner Beep: Vidicon sensor diagnostic calibration tones
   */
  playSurveyorScannerBeep() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const { sfx } = this.getVolumes();
    if (sfx <= 0.001) return;

    try {
      const now = ctx.currentTime;
      [980, 1470, 1960].forEach((freq, idx) => {
        const t = now + idx * 0.075;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(sfx * 0.14, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.07);
      });
    } catch {}
  }

  /**
   * Surveyor Interface: Rapid 5-step FSK (Frequency Shift Keying) telemetry handshake
   */
  playSurveyorInterface() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const { sfx } = this.getVolumes();
    if (sfx <= 0.001) return;

    try {
      const now = ctx.currentTime;
      const fskFreqs = [1200, 2400, 1200, 1800, 2400];
      fskFreqs.forEach((freq, idx) => {
        const t = now + idx * 0.042;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(sfx * 0.11, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.04);
      });
    } catch {}
  }

  /* =========================================================================
   * ZONE 3: CRATER SIGNAL INTERFERENCE & SCANNER PULSES
   * ========================================================================= */

  /**
   * Crater Signal Interference: Electromagnetic RF static crackle through helmet comms
   */
  playCraterInterference(intensity = 0.5) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const { sfx } = this.getVolumes();
    if (sfx <= 0.001) return;

    try {
      const now = ctx.currentTime;
      const noiseBuf = this.createNoiseBuffer(0.12);
      if (!noiseBuf) return;

      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = noiseBuf;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(950 + Math.random() * 850, now);
      filter.Q.setValueAtTime(6.5, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(sfx * 0.11 * Math.min(Math.max(intensity, 0.1), 1.0), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);

      noiseSrc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noiseSrc.start(now);
    } catch {}
  }

  /**
   * Crater Scanner Pulse: High-cadence sonar-like downward sweep pulse
   */
  playCraterScannerPulse() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const { sfx } = this.getVolumes();
    if (sfx <= 0.001) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.18);

      gain.gain.setValueAtTime(sfx * 0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch {}
  }

  /* =========================================================================
   * ZONE 4: ALIEN STRUCTURE LOW SYNTHETIC VIBRATION TRANSMITTED THROUGH SUIT
   * ========================================================================= */

  /**
   * Low Synthetic Vibration: Deep sub-bass resonance conducted through astronaut's
   * boots from lunar bedrock into the suit chassis (44Hz fundamental + 66Hz harmonic).
   */
  startAlienStructureVibration() {
    if (this.isAlienVibrationPlaying) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      this.alienVibrationGain = ctx.createGain();
      this.alienVibrationGain.gain.setValueAtTime(0.0001, now);

      // Lowpass filter representing solid boot bone-conduction
      this.alienVibrationFilter = ctx.createBiquadFilter();
      this.alienVibrationFilter.type = 'lowpass';
      this.alienVibrationFilter.frequency.setValueAtTime(95, now);
      this.alienVibrationFilter.Q.setValueAtTime(3.2, now);

      // 44.0 Hz deep synthetic fundamental
      this.alienOscA = ctx.createOscillator();
      this.alienOscA.type = 'sine';
      this.alienOscA.frequency.setValueAtTime(44.0, now);

      // 66.0 Hz harmonic fifth
      this.alienOscB = ctx.createOscillator();
      this.alienOscB.type = 'sine';
      this.alienOscB.frequency.setValueAtTime(66.0, now);

      // 33.0 Hz sub-bass triangle
      this.alienOscC = ctx.createOscillator();
      this.alienOscC.type = 'triangle';
      this.alienOscC.frequency.setValueAtTime(33.0, now);

      // Slow 0.35 Hz pulsing LFO
      this.alienLfo = ctx.createOscillator();
      this.alienLfo.type = 'sine';
      this.alienLfo.frequency.setValueAtTime(0.35, now);
      this.alienLfoGain = ctx.createGain();
      this.alienLfoGain.gain.setValueAtTime(0.3, now);

      this.alienOscA.connect(this.alienVibrationFilter);
      this.alienOscB.connect(this.alienVibrationFilter);
      this.alienOscC.connect(this.alienVibrationFilter);

      this.alienVibrationFilter.connect(this.alienVibrationGain);
      this.alienVibrationGain.connect(ctx.destination);

      this.alienOscA.start(now);
      this.alienOscB.start(now);
      this.alienOscC.start(now);
      this.alienLfo.start(now);

      this.isAlienVibrationPlaying = true;
    } catch {}
  }

  updateAlienStructureVibration(intensity = 0.0) {
    if (!this.isAlienVibrationPlaying || !this.alienVibrationGain || !this.ctx) return;
    const { sfx } = this.getVolumes();
    const clamped = Math.max(0, Math.min(1, intensity));
    const targetGain = sfx * 0.32 * clamped;
    this.alienVibrationGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.2);
  }

  stopAlienStructureVibration() {
    if (!this.isAlienVibrationPlaying || !this.alienVibrationGain) return;
    try {
      const now = this.ctx.currentTime;
      this.alienVibrationGain.gain.linearRampToValueAtTime(0.0001, now + 0.4);
      setTimeout(() => {
        try {
          if (this.alienOscA) this.alienOscA.stop();
          if (this.alienOscB) this.alienOscB.stop();
          if (this.alienOscC) this.alienOscC.stop();
          if (this.alienLfo) this.alienLfo.stop();
        } catch {}
        this.isAlienVibrationPlaying = false;
      }, 450);
    } catch {
      this.isAlienVibrationPlaying = false;
    }
  }

  /* =========================================================================
   * ZONE 5: MISSION ECHO DIGITAL ACTIVATION TONES & ARCHIVAL AUDIO
   * ========================================================================= */

  /**
   * Digital Activation Chime: Ethereal resonant 432 Hz Pythagorean harmonic chord sequence
   */
  playMissionEchoActivation() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const { sfx } = this.getVolumes();
    if (sfx <= 0.001) return;

    try {
      const now = ctx.currentTime;
      const chord = [432, 648, 864, 1296];
      chord.forEach((freq, idx) => {
        const t = now + idx * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(sfx * 0.16, t + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 1.85);
      });
    } catch {}
  }

  /**
   * Archival Telemetry Audio: 1966 Goldstone NASA Surveyor 1 descent audio simulation.
   * Features retro-rocket Doppler shift descending from 2400Hz to 1200Hz,
   * high-speed FSK telemetry bitstream, and muffled analog radio carrier.
   */
  playMissionEchoArchivalAudio() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const { sfx } = this.getVolumes();
    if (sfx <= 0.001) return;

    try {
      const now = ctx.currentTime;

      // 1. Doppler descent carrier sweep
      const dopplerOsc = ctx.createOscillator();
      const dopplerGain = ctx.createGain();
      const bandpass = ctx.createBiquadFilter();

      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(1600, now);
      bandpass.Q.setValueAtTime(4.0, now);

      dopplerOsc.type = 'sawtooth';
      dopplerOsc.frequency.setValueAtTime(2400, now);
      dopplerOsc.frequency.exponentialRampToValueAtTime(1200, now + 1.4);

      dopplerGain.gain.setValueAtTime(0.0001, now);
      dopplerGain.gain.linearRampToValueAtTime(sfx * 0.12, now + 0.1);
      dopplerGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

      dopplerOsc.connect(bandpass);
      bandpass.connect(dopplerGain);
      dopplerGain.connect(ctx.destination);

      dopplerOsc.start(now);
      dopplerOsc.stop(now + 1.6);

      // 2. FSK bitstream chirps
      const fskFreqs = [1800, 2200, 1800, 2400, 2000, 1600, 2400];
      fskFreqs.forEach((freq, idx) => {
        const t = now + 0.3 + idx * 0.055;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(sfx * 0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.052);
      });
    } catch {}
  }

  /* =========================================================================
   * ZONE 6: RECOVERY AREA ROBOTIC MACHINERY & SUIT COMMUNICATION
   * ========================================================================= */

  /**
   * Robotic Machinery Drone: Mechanical hydraulic servo motor hum and low gear whine
   * conducted through the suit frame when near the recovery crane & transport rig.
   */
  startRoboticMachineryLoop() {
    if (this.isRoboticMachineryPlaying) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      this.roboticMachineryGain = ctx.createGain();
      this.roboticMachineryGain.gain.setValueAtTime(0.0001, now);

      this.machineryFilter = ctx.createBiquadFilter();
      this.machineryFilter.type = 'lowpass';
      this.machineryFilter.frequency.setValueAtTime(240, now);

      // 82 Hz servo drone + 164 Hz hydraulic harmonic
      this.machineryOscA = ctx.createOscillator();
      this.machineryOscA.type = 'triangle';
      this.machineryOscA.frequency.setValueAtTime(82, now);

      this.machineryOscB = ctx.createOscillator();
      this.machineryOscB.type = 'sine';
      this.machineryOscB.frequency.setValueAtTime(164, now);

      this.machineryOscA.connect(this.machineryFilter);
      this.machineryOscB.connect(this.machineryFilter);
      this.machineryFilter.connect(this.roboticMachineryGain);
      this.roboticMachineryGain.connect(ctx.destination);

      this.machineryOscA.start(now);
      this.machineryOscB.start(now);

      this.isRoboticMachineryPlaying = true;
    } catch {}
  }

  updateRoboticMachineryLoop(intensity = 0.0) {
    if (!this.isRoboticMachineryPlaying || !this.roboticMachineryGain || !this.ctx) return;
    const { sfx } = this.getVolumes();
    const clamped = Math.max(0, Math.min(1, intensity));
    const targetGain = sfx * 0.22 * clamped;
    this.roboticMachineryGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.2);
  }

  stopRoboticMachineryLoop() {
    if (!this.isRoboticMachineryPlaying || !this.roboticMachineryGain) return;
    try {
      const now = this.ctx.currentTime;
      this.roboticMachineryGain.gain.linearRampToValueAtTime(0.0001, now + 0.4);
      setTimeout(() => {
        try {
          if (this.machineryOscA) this.machineryOscA.stop();
          if (this.machineryOscB) this.machineryOscB.stop();
        } catch {}
        this.isRoboticMachineryPlaying = false;
      }, 450);
    } catch {
      this.isRoboticMachineryPlaying = false;
    }
  }

  /* =========================================================================
   * AMBIENT VACUUM QUIET & SILENCE
   * ========================================================================= */

  /**
   * Subtle vacuum stillness drone — kept exceedingly quiet so long periods of silence
   * make the anomalous 432 Hz signal and equipment tones sharply noticeable.
   */
  startAmbience() {
    if (this.isAmbiencePlaying) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const { music } = this.getVolumes();
      const now = ctx.currentTime;

      this.ambienceGain = ctx.createGain();
      this.ambienceGain.gain.setValueAtTime(0.0001, now);
      // Notice: Very low gain (0.035) to maintain the authentic airless quiet of the Moon
      this.ambienceGain.gain.linearRampToValueAtTime(music * 0.035, now + 3);

      this.ambienceOscA = ctx.createOscillator();
      this.ambienceOscA.type = 'sine';
      this.ambienceOscA.frequency.setValueAtTime(55, now); // 55 Hz sub-drone

      this.ambienceOscB = ctx.createOscillator();
      this.ambienceOscB.type = 'sine';
      this.ambienceOscB.frequency.setValueAtTime(82.4, now); // E2 fifth

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(140, now);

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
    this.ambienceGain.gain.setValueAtTime(music * 0.035, this.ctx.currentTime);
  }

  /**
   * Soft Boundary Warning Chime: NASA Suit Telemetry Boundary Alert (dual-tone)
   */
  playBoundaryWarning() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const { sfx } = this.getVolumes();
    if (sfx <= 0.001) return;

    try {
      const now = ctx.currentTime;
      [580, 440].forEach((freq, idx) => {
        const t = now + idx * 0.14;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(sfx * 0.14, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.24);
      });
    } catch {}
  }

  /**
   * Scanner Negative Tone: Inert material / No relevant signal detected
   */
  playScanNoSignal() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const { sfx } = this.getVolumes();
    if (sfx <= 0.001) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.35);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(sfx * 0.12, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch {}
  }

  /**
   * Suit EVA Headlamp Switch Toggle: Heavy glove relay click + capacitor surge
   */
  playHeadlampToggle(isOn = true) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const { sfx } = this.getVolumes();
    if (sfx <= 0.001) return;

    try {
      const now = ctx.currentTime;
      // Mechanical switch click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(isOn ? 1800 : 920, now);
      osc.frequency.exponentialRampToValueAtTime(isOn ? 800 : 420, now + 0.035);

      gain.gain.setValueAtTime(sfx * 0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.045);

      // Capacitor power hum on ignition
      if (isOn) {
        const humOsc = ctx.createOscillator();
        const humGain = ctx.createGain();
        humOsc.type = 'sine';
        humOsc.frequency.setValueAtTime(140, now);
        humOsc.frequency.linearRampToValueAtTime(440, now + 0.08);

        humGain.gain.setValueAtTime(0.0001, now);
        humGain.gain.linearRampToValueAtTime(sfx * 0.09, now + 0.02);
        humGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

        humOsc.connect(humGain);
        humGain.connect(ctx.destination);
        humOsc.start(now);
        humOsc.stop(now + 0.14);
      }
    } catch {}
  }

  /**
   * Stop all persistent audio loops upon level exit or pause
   */
  stopAllLoops() {
    this.stopSuitBreathing();
    this.stopAlienStructureVibration();
    this.stopRoboticMachineryLoop();
    this.stopAmbience();
  }
}

export const audio = new AudioManager();
