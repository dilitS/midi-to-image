import { create } from 'zustand';
import { saveImage } from '@/lib/storage';

// Define the note data type
export type NoteData = {
  note: number;
  startTime: number;
  duration: number;
  velocity: number;
};

// Define the melody data type to send to the API
export type MelodyData = {
  notes: NoteData[];
  musicalStyle: string;
  tempoBPM: number;
  timeSignature: string;
};

// Define the musical description type
export type MusicalDescriptionType = {
  harmonicAnalysis: string;
  melodicStructure: string;
  rhythmAndTiming: string;
  stylisticElements: string;
  moodAndCharacter: string;
  instrumentation: string;
  summary: string;
  rawText?: string;
} | null;

// Define the store state
type MidiState = {
  // Recording state
  isRecording: boolean;
  recordingStartTime: number | null;
  recordedNotes: NoteData[];
  playedNotes: string[]; // For displaying recently played notes
  
  // Settings
  musicalStyle: string;
  tempoBPM: number;
  timeSignature: string;
  
  // Generated content
  musicalDescription: MusicalDescriptionType;
  imagePrompt: string | null;
  generatedImage: string | null;
  
  // Loading states
  isGeneratingDescription: boolean;
  isGeneratingPrompt: boolean;
  isGeneratingImage: boolean;

  // Actions
  startRecording: () => void;
  stopRecording: () => void;
  addNote: (note: number, velocity: number) => void;
  releaseNote: (note: number) => void;
  addPlayedNote: (noteName: string) => void; // Add note name to display
  setMusicalStyle: (style: string) => void;
  setTempoBPM: (bpm: number) => void;
  setTimeSignature: (timeSignature: string) => void;
  generateAll: () => Promise<void>;
  resetGenerated: () => void;
};

// Create the store
const useMidiStore = create<MidiState>((set, get) => ({
  // Recording state
  isRecording: false,
  recordingStartTime: null,
  recordedNotes: [],
  playedNotes: [], // Initialize empty array
  
  // Settings
  musicalStyle: 'classical',
  tempoBPM: 120,
  timeSignature: '4/4',
  
  // Generated content
  musicalDescription: null,
  imagePrompt: null,
  generatedImage: null,
  
  // Loading states
  isGeneratingDescription: false,
  isGeneratingPrompt: false,
  isGeneratingImage: false,

  // Actions
  startRecording: () => {
    set({
      isRecording: true,
      recordingStartTime: Date.now(),
      recordedNotes: [],
      playedNotes: [] // Reset played notes when recording starts
    });
  },
  
  stopRecording: () => {
    set({ isRecording: false });
  },
  
  addPlayedNote: (noteName) => {
    // Add note name to the array (keeping all notes)
    set(state => {
      const newNotes = [noteName, ...state.playedNotes];
      // Limit to prevent excessive memory usage (still generous at 50 notes)
      return { playedNotes: newNotes.slice(0, 50) };
    });
  },
  
  addNote: (note, velocity) => {
    const { isRecording, recordingStartTime } = get();
    if (isRecording && recordingStartTime) {
      const startTime = (Date.now() - recordingStartTime) / 1000; // Convert to seconds
      
      set(state => ({
        recordedNotes: [
          ...state.recordedNotes,
          { note, startTime, duration: 0, velocity }
        ]
      }));
    }
  },
  
  releaseNote: (note) => {
    const { isRecording, recordingStartTime, recordedNotes } = get();
    if (isRecording && recordingStartTime) {
      const currentTime = (Date.now() - recordingStartTime) / 1000; // Convert to seconds
      
      // Find the matching note and update its duration
      const updatedNotes = recordedNotes.map(n => {
        if (n.note === note && n.duration === 0) {
          return { ...n, duration: currentTime - n.startTime };
        }
        return n;
      });
      
      set({ recordedNotes: updatedNotes });
    }
  },
  
  setMusicalStyle: (style) => {
    set({ musicalStyle: style });
  },
  
  setTempoBPM: (bpm) => {
    set({ tempoBPM: bpm });
  },
  
  setTimeSignature: (timeSignature) => {
    set({ timeSignature });
  },
  
  generateAll: async () => {
    const { recordedNotes, musicalStyle, tempoBPM, timeSignature, playedNotes } = get();
    
    if (recordedNotes.length === 0) {
      console.error('No notes recorded');
      return;
    }
    
    // Reset any previous generation results
    set({ 
      musicalDescription: null,
      imagePrompt: null,
      generatedImage: null,
    });
    
    // Step 1: Generate musical description
    set({ isGeneratingDescription: true });
    try {
      const melodyData: MelodyData = {
        notes: recordedNotes,
        musicalStyle,
        tempoBPM,
        timeSignature
      };
      
      const descriptionResponse = await fetch('/api/analyze/melody-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(melodyData),
        cache: 'no-store',
      });
      
      if (!descriptionResponse.ok) {
        const errorData = await descriptionResponse.json().catch(() => ({}));
        throw new Error(`Failed to generate musical description: ${errorData.error || descriptionResponse.statusText}`);
      }
      
      const { description } = await descriptionResponse.json();
      set({ musicalDescription: description, isGeneratingDescription: false });
      
      // Step 2: Generate image prompt
      set({ isGeneratingPrompt: true });
      const promptResponse = await fetch('/api/analyze/image-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          musicalStyle,
        }),
        cache: 'no-store',
      });
      
      if (!promptResponse.ok) {
        const errorData = await promptResponse.json().catch(() => ({}));
        throw new Error(`Failed to generate image prompt: ${errorData.error || promptResponse.statusText}`);
      }
      
      const { prompt } = await promptResponse.json();
      set({ imagePrompt: prompt, isGeneratingPrompt: false });
      
      // Step 3: Generate image
      set({ isGeneratingImage: true });
      const imageResponse = await fetch('/api/analyze/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
        }),
        cache: 'no-store',
      });
      
      if (!imageResponse.ok) {
        const errorData = await imageResponse.json().catch(() => ({}));
        throw new Error(`Failed to generate image: ${errorData.error || imageResponse.statusText}`);
      }
      
      const imageData = await imageResponse.json();
      const finalPrompt = imageData.imagePrompt || prompt;
      
      // Save the image to local storage
      if (imageData.imageUrl) {
        saveImage({
          imageUrl: imageData.imageUrl,
          prompt: finalPrompt,
          style: musicalStyle,
          notes: playedNotes.slice(0, 20), // Save up to 20 played notes
        });
      }
      
      set({ 
        generatedImage: imageData.imageUrl, 
        // If API returns an imagePrompt, use it (it might include adjustments)
        imagePrompt: finalPrompt,
        isGeneratingImage: false 
      });
      
    } catch (error) {
      console.error('Error in generation chain:', error);
      // Show more specific error messages in console for debugging
      if (error instanceof Error) {
        console.error(`Generation error details: ${error.message}`);
      }
      
      // Reset all loading states
      set({
        isGeneratingDescription: false,
        isGeneratingPrompt: false,
        isGeneratingImage: false,
      });
      
      // Add error handling or notification to UI here if needed
    }
  },
  
  resetGenerated: () => {
    set({
      musicalDescription: null,
      imagePrompt: null,
      generatedImage: null,
    });
  },
}));

export default useMidiStore; 