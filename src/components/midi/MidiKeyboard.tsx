"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import useMidiStore from "@/store/useMidiStore";
import { keyboardToMidiMap, pianoSound, DEFAULT_VELOCITY } from "@/lib/midi";
import { KeyboardInstructions } from "./KeyboardInstructions";

// Define the key type
type Key = {
  note: number;
  name: string;
  isBlack: boolean;
  isPressed: boolean;
  keyboardKey?: string;
};

// Create the initial keyboard state
const createInitialKeyboardState = (): Key[] => {
  const keys: Key[] = [];
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  // Generate 2 octaves starting from C3 (MIDI note 48)
  for (let octave = 0; octave < 2; octave++) {
    for (let i = 0; i < 12; i++) {
      const note = 48 + i + (octave * 12);
      const name = `${noteNames[i]}${Math.floor(note / 12) - 1}`;
      const isBlack = noteNames[i].includes('#');
      
      // Find keyboard key for this note
      const keyboardKey = Object.entries(keyboardToMidiMap)
        .find(([k, midiNote]) => midiNote === note)?.[0];
      
      keys.push({
        note,
        name,
        isBlack,
        isPressed: false,
        keyboardKey,
      });
    }
  }
  
  return keys;
};

export function MidiKeyboard() {
  const [keys, setKeys] = useState<Key[]>(createInitialKeyboardState);
  const audioInitialized = useRef<boolean>(false);
  const activeNotes = useRef<Set<number>>(new Set()); // Track currently active notes
  const lastKeyTime = useRef<Record<number, number>>({});  // Track when each key was last pressed
  const mouseIsDown = useRef<boolean>(false); // Track if mouse is currently down
  const touchedNotes = useRef<Set<number>>(new Set()); // Track touched notes for multi-touch
  
  // Get store actions
  const { 
    isRecording, 
    addNote, 
    releaseNote,
    addPlayedNote 
  } = useMidiStore();

  // Initialize piano sound on component mount
  useEffect(() => {
    const initAudio = async () => {
      // Only initialize audio on user interaction
      const handleUserInteraction = () => {
        if (!audioInitialized.current) {
          pianoSound.init();
          audioInitialized.current = true;
          
          // Remove the event listeners once audio is initialized
          window.removeEventListener('click', handleUserInteraction);
          window.removeEventListener('keydown', handleUserInteraction);
          window.removeEventListener('touchstart', handleUserInteraction);
        }
      };

      window.addEventListener('click', handleUserInteraction);
      window.addEventListener('keydown', handleUserInteraction);
      window.addEventListener('touchstart', handleUserInteraction);

      return () => {
        window.removeEventListener('click', handleUserInteraction);
        window.removeEventListener('keydown', handleUserInteraction);
        window.removeEventListener('touchstart', handleUserInteraction);
      };
    };

    initAudio();
    
    // Clear active notes and stop all sounds when component unmounts
    return () => {
      stopAllNotes();
    };
  }, []);

  // Handle global mouse events to fix cases where mouse up happens outside the keyboard
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (mouseIsDown.current) {
        mouseIsDown.current = false;
        
        // Stop all notes that were activated by mouse
        Array.from(activeNotes.current).forEach(note => {
          stopNote(note);
        });
      }
    };
    
    // Safety mechanism to stop all notes when window loses focus
    const handleBlur = () => {
      stopAllNotes();
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('blur', handleBlur);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle computer keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keyboardToMidiMap[key] !== undefined && !e.repeat) {
        playNote(keyboardToMidiMap[key]);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keyboardToMidiMap[key] !== undefined) {
        stopNote(keyboardToMidiMap[key]);
      }
    };

    // When user switches tabs or windows, stop all sounds
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAllNotes();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRecording]);

  // Ensure all notes are properly stopped when recording state changes
  useEffect(() => {
    // Stop all active notes when recording starts or stops
    stopAllNotes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  // Add extra cleanup for safety
  useEffect(() => {
    // Stop all notes when component is about to unmount
    return () => {
      stopAllNotes();
    };
  }, []);

  // Safety reset function to stop all notes
  const resetKeyboard = () => {
    stopAllNotes();
    mouseIsDown.current = false;
    touchedNotes.current.clear();
  };

  // Add global click handler to reset keyboard if something goes wrong
  useEffect(() => {
    const handleDoubleClick = () => {
      resetKeyboard();
    };
    
    window.addEventListener('dblclick', handleDoubleClick);
    
    return () => {
      window.removeEventListener('dblclick', handleDoubleClick);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper function to stop all active notes
  const stopAllNotes = () => {
    // Stop all active notes
    Array.from(activeNotes.current).forEach(note => {
      pianoSound.stopNote(note);
    });
    
    // Reset state
    activeNotes.current.clear();
    touchedNotes.current.clear();
    mouseIsDown.current = false;
    
    // Update UI to show no pressed keys
    setKeys(prevKeys => 
      prevKeys.map(key => ({...key, isPressed: false}))
    );
  };

  // Play a note
  const playNote = (note: number) => {
    const now = Date.now();
    
    // If a note is already playing, explicitly stop it first
    // This fixes the bug where rapidly playing notes doesn't stop the previous notes
    if (activeNotes.current.has(note)) {
      // Force stop the note before playing it again
      pianoSound.stopNote(note);
      
      // If the note was played very recently (within 50ms), return to avoid double triggering
      if (lastKeyTime.current[note] && now - lastKeyTime.current[note] < 50) {
        return;
      }
    }
    
    // Add to active notes set
    activeNotes.current.add(note);
    lastKeyTime.current[note] = now;
    
    // Update UI state
    setKeys(prevKeys => 
      prevKeys.map(key => 
        key.note === note ? { ...key, isPressed: true } : key
      )
    );
    
    // Record the note if recording is active
    if (isRecording) {
      addNote(note, DEFAULT_VELOCITY);
      
      // Find the key object to get its name
      const keyObj = keys.find(k => k.note === note);
      if (keyObj) {
        addPlayedNote(keyObj.name);
      }
    }
    
    // Play the note using our piano sound
    try {
      pianoSound.playNote(note, DEFAULT_VELOCITY);
    } catch (error) {
      console.error("Error playing note:", error);
      // If there's an error playing the note, make sure we clean up
      activeNotes.current.delete(note);
    }
  };

  // Stop a note
  const stopNote = (note: number) => {
    // If note isn't playing, don't do anything
    if (!activeNotes.current.has(note)) {
      return;
    }
    
    // Remove from active notes set
    activeNotes.current.delete(note);
    
    // Update UI state
    setKeys(prevKeys => 
      prevKeys.map(key => 
        key.note === note ? { ...key, isPressed: false } : key
      )
    );
    
    // Update note duration if recording
    if (isRecording) {
      releaseNote(note);
    }
    
    // Stop the note
    try {
      pianoSound.stopNote(note);
    } catch (error) {
      console.error("Error stopping note:", error);
    }
  };

  // Improved mouse event handlers
  const handleMouseDown = (note: number, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default behavior
    mouseIsDown.current = true;
    playNote(note);
  };

  const handleMouseUp = (note: number, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default behavior
    if (activeNotes.current.has(note)) {
      stopNote(note);
    }
    // Don't set mouseIsDown to false here - use the global handler instead
  };

  const handleMouseEnter = (note: number) => {
    // Only play if mouse is already down (for dragging across keys)
    if (mouseIsDown.current) {
      // First stop any currently playing notes to avoid overlapping
      Array.from(activeNotes.current).forEach(activeNote => {
        if (activeNote !== note) {
          stopNote(activeNote);
        }
      });
      playNote(note);
    }
  };

  const handleMouseLeave = (note: number) => {
    // Only stop if the key is pressed and we're dragging
    if (mouseIsDown.current && activeNotes.current.has(note)) {
      stopNote(note);
    }
  };

  // Improved touch handlers for multi-touch support
  const handleTouchStart = (e: React.TouchEvent, note: number) => {
    e.preventDefault(); // Prevent scrolling when touching the keyboard
    touchedNotes.current.add(note);
    playNote(note);
  };

  const handleTouchEnd = (e: React.TouchEvent, note: number) => {
    e.preventDefault();
    touchedNotes.current.delete(note);
    stopNote(note);
  };

  const handleTouchCancel = (e: React.TouchEvent, note: number) => {
    e.preventDefault();
    touchedNotes.current.delete(note);
    stopNote(note);
  };

  // Get all white keys and black keys
  const whiteKeys = keys.filter(key => !key.isBlack);
  const blackKeys = keys.filter(key => key.isBlack);
  
  // Calculate white key width as percentage
  const whiteKeyWidth = 100 / whiteKeys.length;
  
  // Define positions for black keys
  // C# is positioned after C, D# after D, F# after F, G# after G, A# after A
  const getBlackKeyPosition = (noteName: string): number => {
    const baseNote = noteName.charAt(0);  // The base note (C, D, F, G, A)
    const octave = parseInt(noteName.slice(-1));  // The octave number
    
    // Find the corresponding white key index
    const whiteKeyIndex = whiteKeys.findIndex(k => 
      k.name.charAt(0) === baseNote && 
      parseInt(k.name.slice(-1)) === octave
    );
    
    if (whiteKeyIndex === -1) return 0;
    
    // Calculate position - black keys should be positioned between white keys
    // Different offsets based on the note type
    let offset = 0.7;
    
    // For C# and F#, position them a bit more to the right
    if (baseNote === 'C' || baseNote === 'F') {
      offset = 0.7;
    } 
    // For D#, G#, and A#, position them a bit more to the left
    else if (baseNote === 'D' || baseNote === 'G' || baseNote === 'A') {
      offset = 0.65;
    }
    
    return (whiteKeyIndex * whiteKeyWidth) + (whiteKeyWidth * offset);
  };

  
  return (
    <div className="flex flex-col bg-muted/10 rounded-md overflow-hidden shadow-sm dark:shadow-md dark:shadow-black/20">
      <div className="relative h-40 bg-gradient-to-b from-background to-muted/40 dark:from-zinc-900 dark:to-zinc-950">
        {/* White keys */}
        <div className="absolute inset-0 flex">
          {whiteKeys.map((key) => (
            <div
              key={key.note}
              className={cn(
                "flex-1 h-full border-r border-muted flex items-end justify-center pb-1 select-none",
                key.isPressed 
                  ? "bg-primary/10" 
                  : "bg-white hover:bg-muted/5 dark:hover:bg-blue-400"
              )}
              onMouseDown={(e) => handleMouseDown(key.note, e)}
              onMouseUp={(e) => handleMouseUp(key.note, e)}
              onMouseEnter={() => handleMouseEnter(key.note)}
              onMouseLeave={() => handleMouseLeave(key.note)}
              onTouchStart={(e) => handleTouchStart(e, key.note)}
              onTouchEnd={(e) => handleTouchEnd(e, key.note)}
              onTouchCancel={(e) => handleTouchCancel(e, key.note)}
              data-note={key.note}
            >
              {key.keyboardKey && (
                <span className="text-xs text-muted-foreground pointer-events-none">
                  {key.keyboardKey}
                </span>
              )}
            </div>
          ))}
        </div>
        
        {/* Black keys - made sure these are above white keys with z-index */}
        <div className="absolute inset-0 pointer-events-none">
          {blackKeys.map((key) => (
            <div
              key={key.note}
              style={{
                position: 'absolute',
                left: `${getBlackKeyPosition(key.name)}%`,
                width: `${whiteKeyWidth * 0.6}%`,
                height: '60%',
                backgroundColor: key.isPressed ? '#6366f1' : '#111',
                borderBottomLeftRadius: '4px',
                borderBottomRightRadius: '4px',
                zIndex: 10,
              }}
              className="pointer-events-auto"
              onMouseDown={(e) => handleMouseDown(key.note, e)}
              onMouseUp={(e) => handleMouseUp(key.note, e)}
              onMouseEnter={() => handleMouseEnter(key.note)}
              onMouseLeave={() => handleMouseLeave(key.note)}
              onTouchStart={(e) => handleTouchStart(e, key.note)}
              onTouchEnd={(e) => handleTouchEnd(e, key.note)}
              onTouchCancel={(e) => handleTouchCancel(e, key.note)}
              data-note={key.note}
            >
              {key.keyboardKey && (
                <span className="text-xs text-gray-400 absolute bottom-1 left-0 right-0 text-center pointer-events-none">
                  {key.keyboardKey}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-2 bg-muted/5 border-t">
        <KeyboardInstructions />
      </div>
    </div>
  );
} 