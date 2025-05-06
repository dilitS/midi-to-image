// Simple MIDI utility functions without external dependencies
import { pianoSynth } from './piano-synth';

// Convert MIDI note number to note name (e.g., 60 -> "C4")
export const midiNoteToName = (note: number): string => {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(note / 12) - 1;
  const noteName = noteNames[note % 12];
  return `${noteName}${octave}`;
};

// Get note name without octave (e.g., 60 -> "C")
export const midiNoteToNoteName = (note: number): string => {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return noteNames[note % 12];
};

// Convert frequency (Hz) to MIDI note number
export const frequencyToMidiNote = (frequency: number): number => {
  // A4 (MIDI note 69) is 440 Hz
  return Math.round(12 * Math.log2(frequency / 440)) + 69;
};

// Convert MIDI note number to frequency (Hz)
export const midiNoteToFrequency = (note: number): number => {
  // A4 (MIDI note 69) is 440 Hz
  return 440 * Math.pow(2, (note - 69) / 12);
};

// Map of computer keyboard keys to MIDI notes (shifted down one octave)
export const keyboardToMidiMap: Record<string, number> = {
  // Lower octave
  'z': 48, // C3
  's': 49, // C#3
  'x': 50, // D3
  'd': 51, // D#3
  'c': 52, // E3
  'v': 53, // F3
  'g': 54, // F#3
  'b': 55, // G3
  'h': 56, // G#3
  'n': 57, // A3
  'j': 58, // A#3
  'm': 59, // B3
  // Upper octave
  ',': 60, // C4
  'l': 61, // C#4
  '.': 62, // D4
  ';': 63, // D#4
  '/': 64, // E4
  // Add additional keys to cover more notes
  'q': 60, // C4 (alternative)
  '2': 61, // C#4 (alternative)
  'w': 62, // D4 (alternative)
  '3': 63, // D#4 (alternative)
  'e': 64, // E4 (alternative)
  'r': 65, // F4
  '5': 66, // F#4
  't': 67, // G4
  '6': 68, // G#4
  'y': 69, // A4
  '7': 70, // A#4
  'u': 71, // B4
};

// MIDI Velocity Constants
export const DEFAULT_VELOCITY = 127; // Maximum velocity

// Define common chord types and their interval patterns
const chordPatterns = {
  'maj': [0, 4, 7],      // Major (1, 3, 5)
  'min': [0, 3, 7],      // Minor (1, b3, 5)
  'dim': [0, 3, 6],      // Diminished (1, b3, b5)
  'aug': [0, 4, 8],      // Augmented (1, 3, #5)
  'sus4': [0, 5, 7],     // Suspended 4th (1, 4, 5)
  'sus2': [0, 2, 7],     // Suspended 2nd (1, 2, 5)
  '7': [0, 4, 7, 10],    // Dominant 7th (1, 3, 5, b7)
  'maj7': [0, 4, 7, 11], // Major 7th (1, 3, 5, 7)
  'min7': [0, 3, 7, 10], // Minor 7th (1, b3, 5, b7)
};

// Function to detect the chord from a set of notes
export const detectChord = (notes: number[]): string | null => {
  if (notes.length < 3) return null;
  
  // Get unique notes (C, C#, etc.) regardless of octave
  const uniqueNoteClasses = Array.from(new Set(notes.map(note => note % 12))).sort((a, b) => a - b);
  
  if (uniqueNoteClasses.length < 3) return null;
  
  // Try each note as a potential root
  for (const potentialRoot of uniqueNoteClasses) {
    // Normalize all notes to be relative to this root
    const intervals = uniqueNoteClasses.map(note => {
      let interval = note - potentialRoot;
      if (interval < 0) interval += 12;
      return interval;
    }).sort((a, b) => a - b);
    
    // Check if these intervals match any known chord pattern
    for (const [chordType, pattern] of Object.entries(chordPatterns)) {
      // Check if all pattern intervals are included in our intervals
      const isMatch = pattern.every(interval => intervals.includes(interval));
      
      if (isMatch) {
        const rootNoteName = midiNoteToNoteName(potentialRoot);
        return `${rootNoteName}${chordType}`;
      }
    }
  }
  
  return null;
};

// Function to find the base chord from a sequence of notes
export const findBaseChord = (notes: NoteData[]): string => {
  if (notes.length === 0) return "No notes played";
  
  // Extract only the note numbers
  const noteNumbers = notes.map(note => note.note);
  
  // Try to detect chord
  const chord = detectChord(noteNumbers);
  
  if (chord) {
    return `Base chord: ${chord}`;
  }
  
  // If no chord detected, find the most common note
  const noteCounts: Record<number, number> = {};
  noteNumbers.forEach(note => {
    const noteClass = note % 12;
    noteCounts[noteClass] = (noteCounts[noteClass] || 0) + 1;
  });
  
  let mostCommonNote = 0;
  let highestCount = 0;
  
  for (const [noteClass, count] of Object.entries(noteCounts)) {
    if (count > highestCount) {
      highestCount = count;
      mostCommonNote = parseInt(noteClass);
    }
  }
  
  return `Key center: ${midiNoteToNoteName(mostCommonNote)}`;
};

// Piano sound class (wrapper for pianoSynth)
export class PianoSound {
  private initialized = false;

  constructor() {}

  async init(): Promise<void> {
    if (this.initialized) return;
    
    await pianoSynth.init();
    this.initialized = true;
  }
  
  playNote(note: number, velocity = DEFAULT_VELOCITY): void {
    if (!this.initialized) {
      this.init();
    }
    
    pianoSynth.playNote(note, velocity);
  }
  
  stopNote(note: number): void {
    pianoSynth.stopNote(note);
  }
  
  stopAll(): void {
    pianoSynth.stopAll();
  }
}

// Interface for note data (needed for findBaseChord)
export interface NoteData {
  note: number;
  startTime: number;
  duration: number;
  velocity: number;
}

// Create a singleton instance
export const pianoSound = new PianoSound(); 