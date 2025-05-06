import { midiNoteToFrequency } from "./midi";

// A sophisticated grand piano sound synthesizer
export class PianoSynth {
  private audioContext: AudioContext | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private masterGain: GainNode | null = null;
  private reverb: ConvolverNode | null = null;
  private activeVoices: Map<number, { 
    oscs: OscillatorNode[],
    gain: GainNode
  }> = new Map();
  
  constructor() {}
  
  async init(): Promise<void> {
    if (this.audioContext) return;
    
    this.audioContext = new AudioContext();
    
    // Create master gain
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.8; // Slightly louder for grand piano
    
    // Create compressor for more even dynamics
    this.compressor = this.audioContext.createDynamicsCompressor();
    this.compressor.threshold.value = -20; // Higher threshold for grand piano dynamics
    this.compressor.knee.value = 25;
    this.compressor.ratio.value = 10;
    this.compressor.attack.value = 0.002; // Faster attack for grand piano
    this.compressor.release.value = 0.3;
    
    // Create signal chain
    this.masterGain.connect(this.compressor);
    this.compressor.connect(this.audioContext.destination);
    
    // Create reverb
    await this.createReverb();
  }
  
  private async createReverb(): Promise<void> {
    if (!this.audioContext || !this.compressor) return;
    
    // Create reverb
    this.reverb = this.audioContext.createConvolver();
    
    // Create impulse response for reverb
    const sampleRate = this.audioContext.sampleRate;
    const length = 2.5 * sampleRate; // 2.5 seconds reverb tail for concert hall sound
    const impulse = this.audioContext.createBuffer(2, length, sampleRate);
    
    const leftChannel = impulse.getChannelData(0);
    const rightChannel = impulse.getChannelData(1);
    
    // Fill impulse with decaying white noise
    for (let i = 0; i < length; i++) {
      // Decay curve for reverb - more realistic for grand piano in concert hall
      const decay = Math.pow(1 - i / length, 1.8);
      
      // Random values for left and right channels
      leftChannel[i] = (Math.random() * 2 - 1) * decay;
      rightChannel[i] = (Math.random() * 2 - 1) * decay;
    }
    
    this.reverb.buffer = impulse;
    
    // Connect reverb to output
    const reverbGain = this.audioContext.createGain();
    reverbGain.gain.value = 0.18; // Slightly more reverb for grand piano sound
    
    this.reverb.connect(reverbGain);
    reverbGain.connect(this.compressor);
  }
  
  playNote(note: number, velocity: number = 127): void {
    if (!this.audioContext || !this.masterGain) {
      this.init();
      return;
    }
    
    // If this note is already playing, stop it first
    this.stopNote(note);
    
    // Normalize velocity (0-1)
    const normalizedVelocity = Math.min(Math.max(velocity / 127, 0), 1);
    
    // Create a gain node for this note
    const noteGain = this.audioContext.createGain();
    noteGain.gain.value = 0.0001; // Start with very low gain to avoid clicks
    noteGain.connect(this.masterGain);
    
    // Send some signal to reverb if available
    if (this.reverb) {
      const reverbSend = this.audioContext.createGain();
      // More reverb for bass notes, less for treble - like a grand piano
      const reverbAmount = 0.1 + (normalizedVelocity * 0.2) + ((127 - note) / 127 * 0.1);
      reverbSend.gain.value = reverbAmount; 
      noteGain.connect(reverbSend);
      reverbSend.connect(this.reverb);
    }
    
    // Calculate base frequency
    const frequency = midiNoteToFrequency(note);
    
    // Create multiple oscillators for a richer sound
    const oscillators: OscillatorNode[] = [];
    
    // Main tone
    const mainOsc = this.createPianoOscillator(frequency, 0);
    mainOsc.connect(noteGain);
    oscillators.push(mainOsc);
    
    // First overtone (one octave higher) - prominent in grand pianos
    const firstHarmonicOsc = this.createPianoOscillator(frequency * 2, 0.01);
    firstHarmonicOsc.connect(noteGain);
    oscillators.push(firstHarmonicOsc);
    
    // Second overtone (octave + fifth) - gives richness to grand piano sound
    const secondHarmonicOsc = this.createPianoOscillator(frequency * 3, 0.02);
    secondHarmonicOsc.connect(noteGain);
    oscillators.push(secondHarmonicOsc);
    
    // Slight detuned oscillators for chorus effect and string resonance
    const detuneOsc1 = this.createPianoOscillator(frequency, -5);
    detuneOsc1.connect(noteGain);
    oscillators.push(detuneOsc1);
    
    const detuneOsc2 = this.createPianoOscillator(frequency, 5);
    detuneOsc2.connect(noteGain);
    oscillators.push(detuneOsc2);
    
    // Apply envelopes
    if (this.audioContext) {
      const now = this.audioContext.currentTime;
      
      // Attack - grand pianos have a quick attack
      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.exponentialRampToValueAtTime(
        normalizedVelocity * 0.9, // Higher peak volume
        now + 0.005 + ((1 - normalizedVelocity) * 0.01) // Faster attack for grand piano
      );
      
      // Decay to sustain - grand pianos have a fairly quick initial decay
      noteGain.gain.exponentialRampToValueAtTime(
        normalizedVelocity * 0.5, // Sustain level
        now + 0.1 + ((1 - normalizedVelocity) * 0.2) // Shorter decay for authentic grand sound
      );
      
      // Store the voice so we can release it later
      this.activeVoices.set(note, { oscs: oscillators, gain: noteGain });
    }
  }
  
  private createPianoOscillator(
    frequency: number, 
    detune: number
  ): OscillatorNode {
    if (!this.audioContext) {
      throw new Error("AudioContext not initialized");
    }
    
    // Create oscillator
    const osc = this.audioContext.createOscillator();
    
    // Configure oscillator
    osc.frequency.value = frequency;
    osc.detune.value = detune;
    
    // Use a custom wave for grand piano-like timbre
    try {
      // Grand piano waveform with more prominent harmonics
      // These values create a tone with richer upper harmonics
      const real = new Float32Array([0, 0.5, 0.15, 0.3, 0.45, 0.15, 0.08, 0.05, 0.01]);
      const imag = new Float32Array(real.length).fill(0);
      const wave = this.audioContext.createPeriodicWave(real, imag);
      osc.setPeriodicWave(wave);
    } catch (_) {
      // Fallback to sine wave if custom wave fails
      osc.type = 'sine';
    }
    
    // Start the oscillator
    osc.start();
    
    return osc;
  }
  
  stopNote(note: number): void {
    const voice = this.activeVoices.get(note);
    
    if (voice && this.audioContext) {
      const { oscs } = voice;
      const now = this.audioContext.currentTime;
      
      // Release envelope
      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setValueAtTime(voice.gain.gain.value, now);
      
      // Grand piano has longer release for lower notes, shorter for higher notes
      // This models the natural behavior of piano strings
      const notePosition = note / 127; // 0 to 1, bass to treble
      const releaseTime = 0.1 + (1 - notePosition) * 2.0; // Up to 2.1 seconds for lowest notes
      
      // Exponential release (piano-like)
      voice.gain.gain.exponentialRampToValueAtTime(0.0001, now + releaseTime);
      
      // Schedule oscillator stop
      setTimeout(() => {
        oscs.forEach(osc => {
          try {
            osc.stop();
            osc.disconnect();
          } catch (_) {
            // Ignore errors if oscillator already stopped
          }
        });
        voice.gain.disconnect();
        this.activeVoices.delete(note);
      }, releaseTime * 1000 + 50);
    }
  }
  
  stopAll(): void {
    if (this.audioContext) {
      this.activeVoices.forEach((voice, note) => {
        this.stopNote(note);
      });
    }
  }
}

// Singleton instance
export const pianoSynth = new PianoSynth(); 