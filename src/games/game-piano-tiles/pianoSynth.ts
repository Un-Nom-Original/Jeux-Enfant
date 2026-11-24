import { soundEngine } from '../../utils/soundEngine';

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

class PianoSynth {
  private ctx: AudioContext | null = null;
  private audioEl: HTMLAudioElement | null = null;

  private getContext(): AudioContext | null {
    if (soundEngine.isMuted() || typeof window === 'undefined') return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /** Joue une note de piano électrique / synthé K-Pop brillante + basse optionnelle */
  public playNote(midi: number, bassMidi = 0): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freq = midiToFreq(midi);

    // Voix principale : piano brillant (triangle + harmonique sine)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, now);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3400, now);
    filter.frequency.exponentialRampToValueAtTime(900, now + 0.45);

    const osc2Gain = ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.22, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.24, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.16);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc1.connect(filter);
    osc2.connect(osc2Gain);
    osc2Gain.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.58);
    osc2.stop(now + 0.58);

    // Basse synthé K-Pop douce en accompagnement
    if (bassMidi > 0) {
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(midiToFreq(bassMidi), now);
      bassGain.gain.setValueAtTime(0.001, now);
      bassGain.gain.linearRampToValueAtTime(0.14, now + 0.015);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      bassOsc.connect(bassGain);
      bassGain.connect(ctx.destination);
      bassOsc.start(now);
      bassOsc.stop(now + 0.45);
    }
  }

  /** Son doux mais clair lorsqu'une note est ratée ou une colonne vide est touchée */
  public playMiss(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(95, now + 0.14);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.17);
  }

  /** Gestion d'un éventuel MP3 local importé par les parents */
  public startCustomAudio(url: string | undefined, playbackRate: number): void {
    this.stopCustomAudio();
    if (!url || soundEngine.isMuted()) return;
    const audio = new Audio(url);
    audio.playbackRate = playbackRate;
    audio.volume = 0.85;
    audio.play().catch(() => {});
    this.audioEl = audio;
  }

  public pauseCustomAudio(): void {
    if (this.audioEl && !this.audioEl.paused) {
      this.audioEl.pause();
    }
  }

  public resumeCustomAudio(): void {
    if (this.audioEl && this.audioEl.paused && !soundEngine.isMuted()) {
      this.audioEl.play().catch(() => {});
    }
  }

  public stopCustomAudio(): void {
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.currentTime = 0;
      this.audioEl = null;
    }
  }
}

export const pianoSynth = new PianoSynth();
