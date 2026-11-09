/**
 * Super Pixel Bros - Web Audio API Sound Synthesizer & Chiptune Engine
 * Generates pure 8-bit retro sounds and melodies without external asset files.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private masterGain: GainNode | null = null;

  private isMuted: boolean = false;
  private sfxVolume: number = 0.7;
  private bgmVolume: number = 0.45;

  private currentBgmLoopTimer: number | null = null;
  private currentTrack: 'overworld' | 'underground' | 'star' | null = null;
  private isBgmPlaying: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 1;
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = this.bgmVolume;
      this.bgmGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setBgmVolume(val: number) {
    this.bgmVolume = Math.max(0, Math.min(1, val));
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
    }
  }

  public setSfxVolume(val: number) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  /* ---------------- SOUND EFFECTS ---------------- */

  /** Jump Sound (Square wave with rapid pitch bend) */
  public playJump(isSuper: boolean = false) {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isSuper ? 'triangle' : 'square';
    const startFreq = isSuper ? 130 : 160;
    const endFreq = isSuper ? 420 : 540;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.14);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  /** Coin Sound (Classic 2-tone chime: B5 to E6) */
  public playCoin() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.setValueAtTime(0.35, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.38);
  }

  /** Powerup Item Spawn / Rising Sound */
  public playPowerupSpawn() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const notes = [330, 392, 659, 523, 587, 784];
    const step = 0.045;
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + idx * step);
      gain.gain.setValueAtTime(0.2, now + idx * step);
      gain.gain.linearRampToValueAtTime(0.01, now + (idx + 1) * step);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + idx * step);
      osc.stop(now + (idx + 1) * step);
    });
  }

  /** Powerup Collect (Fanfare arpeggio when Mario powers up) */
  public playPowerupCollect() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    const step = 0.055;
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * step);
      gain.gain.setValueAtTime(0.3, now + idx * step);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * step + 0.12);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + idx * step);
      osc.stop(now + idx * step + 0.12);
    });
  }

  /** Stomp Enemy Sound (Satisfying low-end squish pop) */
  public playStomp() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  /** Shell Kick / Solid Impact */
  public playKick() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  /** Fireball Shoot */
  public playFireball() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(750, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  /** Break Brick Sound (Crisp crunch) */
  public playBrickBreak() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  /** Head Bump Solid Block */
  public playBump() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.09);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  /** Enter Warp Pipe (Low descending slide) */
  public playPipeWarp() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.35);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  /** Player Hurt / Shrink */
  public playHurt() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  /** Player Death Jingle */
  public playDeath() {
    this.stopBgm();
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const notes = [
      { f: 493.88, d: 0.12 }, // B4
      { f: 523.25, d: 0.12 }, // C5
      { f: 587.33, d: 0.12 }, // D5
      { f: 493.88, d: 0.12 }, // B4
      { f: 440.00, d: 0.18 }, // A4
      { f: 392.00, d: 0.18 }, // G4
      { f: 329.63, d: 0.45 }, // E4
    ];

    let t = this.ctx.currentTime;
    notes.forEach((n) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(n.f, t);
      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + n.d);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + n.d);
      t += n.d + 0.03;
    });
  }

  /** Flagpole / Level Clear Fanfare */
  public playLevelClear() {
    this.stopBgm();
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const melody = [
      { f: 392, d: 0.1 },  // G4
      { f: 523, d: 0.1 },  // C5
      { f: 659, d: 0.1 },  // E5
      { f: 784, d: 0.15 }, // G5
      { f: 659, d: 0.1 },  // E5
      { f: 784, d: 0.35 }, // G5
      { f: 1046, d: 0.5 }, // C6
    ];

    let t = this.ctx.currentTime + 0.1;
    melody.forEach((n) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, t);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + n.d);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + n.d);
      t += n.d + 0.04;
    });
  }

  /** 1-Up Mushroom Sound */
  public play1Up() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const notes = [330, 392, 659, 523, 587, 784];
    let t = this.ctx.currentTime;
    notes.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 0.08);
      t += 0.07;
    });
  }

  /* ---------------- BACKGROUND MUSIC SEQUENCER ---------------- */

  public playBgm(track: 'overworld' | 'underground' | 'star') {
    if (this.currentTrack === track && this.isBgmPlaying) return;
    this.stopBgm();
    this.initContext();

    this.currentTrack = track;
    this.isBgmPlaying = true;
    this.loopBgmTrack(track);
  }

  public stopBgm() {
    if (this.currentBgmLoopTimer !== null) {
      window.clearTimeout(this.currentBgmLoopTimer);
      this.currentBgmLoopTimer = null;
    }
    this.isBgmPlaying = false;
    this.currentTrack = null;
  }

  private loopBgmTrack(track: 'overworld' | 'underground' | 'star') {
    if (!this.isBgmPlaying || !this.ctx || !this.bgmGain) return;

    const now = this.ctx.currentTime + 0.05;
    let loopDuration = 4; // seconds

    if (track === 'star') {
      loopDuration = this.scheduleStarMelody(now);
    } else if (track === 'underground') {
      loopDuration = this.scheduleUndergroundMelody(now);
    } else {
      loopDuration = this.scheduleOverworldMelody(now);
    }

    this.currentBgmLoopTimer = window.setTimeout(() => {
      if (this.isBgmPlaying && this.currentTrack === track) {
        this.loopBgmTrack(track);
      }
    }, (loopDuration - 0.05) * 1000);
  }

  /** Classic energetic Overworld melody sequence */
  private scheduleOverworldMelody(startT: number): number {
    const tempo = 0.14; // seconds per 16th note approx
    // Simplified, delightful Mario-esque retro melodic motif
    const leadNotes: { f: number; d: number }[] = [
      { f: 659.25, d: 1 }, // E5
      { f: 659.25, d: 1 }, // E5
      { f: 0, d: 1 },
      { f: 659.25, d: 1 }, // E5
      { f: 0, d: 1 },
      { f: 523.25, d: 1 }, // C5
      { f: 659.25, d: 2 }, // E5
      { f: 783.99, d: 2 }, // G5
      { f: 0, d: 2 },
      { f: 392.00, d: 2 }, // G4
      { f: 0, d: 2 },

      // phrase B
      { f: 523.25, d: 2 }, // C5
      { f: 0, d: 1 },
      { f: 392.00, d: 1 }, // G4
      { f: 0, d: 2 },
      { f: 329.63, d: 2 }, // E4
      { f: 0, d: 1 },
      { f: 440.00, d: 1 }, // A4
      { f: 493.88, d: 1 }, // B4
      { f: 466.16, d: 1 }, // Bb4
      { f: 440.00, d: 2 }, // A4
      { f: 392.00, d: 2 }, // G4
      { f: 659.25, d: 1 }, // E5
      { f: 783.99, d: 1 }, // G5
      { f: 880.00, d: 2 }, // A5
      { f: 698.46, d: 1 }, // F5
      { f: 783.99, d: 1 }, // G5
      { f: 0, d: 1 },
      { f: 659.25, d: 2 }, // E5
      { f: 523.25, d: 1 }, // C5
      { f: 587.33, d: 1 }, // D5
      { f: 493.88, d: 2 }, // B4
      { f: 0, d: 2 },
    ];

    let t = startT;
    for (const note of leadNotes) {
      if (note.f > 0) {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(note.f, t);

        const dur = note.d * tempo;
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.005, t + dur * 0.9);

        osc.connect(gain);
        gain.connect(this.bgmGain!);

        osc.start(t);
        osc.stop(t + dur);
      }
      t += note.d * tempo;
    }

    return t - startT;
  }

  /** Invincible Star Power melody: fast, high-octane 16th note sprint */
  private scheduleStarMelody(startT: number): number {
    const tempo = 0.085;
    const notes = [
      659, 659, 659, 0, 587, 659, 587, 659,
      784, 784, 784, 0, 698, 784, 698, 784,
      880, 880, 880, 0, 784, 880, 784, 880,
      1046, 1046, 987, 880, 784, 659, 587, 523,
    ];

    let t = startT;
    for (const f of notes) {
      if (f > 0) {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(f, t);

        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + tempo * 0.85);

        osc.connect(gain);
        gain.connect(this.bgmGain!);

        osc.start(t);
        osc.stop(t + tempo);
      }
      t += tempo;
    }

    return t - startT;
  }

  /** Deep subterranean caverns theme */
  private scheduleUndergroundMelody(startT: number): number {
    const tempo = 0.16;
    const notes = [
      { f: 196, d: 1 }, // G3
      { f: 392, d: 1 }, // G4
      { f: 185, d: 1 }, // F#3
      { f: 370, d: 1 }, // F#4
      { f: 174, d: 1 }, // F3
      { f: 349, d: 1 }, // F4
      { f: 164, d: 2 }, // E3
      { f: 0, d: 2 },

      { f: 220, d: 1 }, // A3
      { f: 440, d: 1 }, // A4
      { f: 207, d: 1 }, // G#3
      { f: 415, d: 1 }, // G#4
      { f: 196, d: 1 }, // G3
      { f: 392, d: 1 }, // G4
      { f: 185, d: 2 }, // F#3
      { f: 0, d: 2 },
    ];

    let t = startT;
    for (const note of notes) {
      if (note.f > 0) {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, t);

        const dur = note.d * tempo;
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + dur * 0.9);

        osc.connect(gain);
        gain.connect(this.bgmGain!);

        osc.start(t);
        osc.stop(t + dur);
      }
      t += note.d * tempo;
    }

    return t - startT;
  }
}

export const sound = new SoundEngine();
