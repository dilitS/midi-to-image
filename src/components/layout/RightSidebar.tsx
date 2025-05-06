"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { 
  X, 
  PlayCircle, 
  StopCircle, 
  Clock, 
  Music, 
  Wand2, 
  RotateCcw,
  Piano, 
  Guitar, 
  Headphones, 
  Drumstick, 
  Waves, 
  TreePine, 
  Disc3,
  Mic,
  Film,
  Radio
} from "lucide-react";
import useMidiStore from "@/store/useMidiStore";
import useToast from "@/hooks/useToast";
import useSidebarState from "@/hooks/useSidebarState";
import { useEffect, useRef, useState } from "react";
import { ImageGallery } from "@/components/gallery/ImageGallery";

// Time signature examples by musical style
const timeSignatureExamples = {
  "4/4": "Rock, Pop, Classical",
  "3/4": "Waltzes, Country, Classical",
  "6/8": "Irish folk, Ballads, Blues",
  "5/4": "Jazz, Progressive rock",
  "7/8": "Balkan folk, Progressive metal"
};

// Musical styles with icons
const musicalStyles = [
  { value: "classical", label: "Classical", icon: <Piano className="h-4 w-4 mr-2" /> },
  { value: "jazz", label: "Jazz", icon: <Disc3 className="h-4 w-4 mr-2" /> },
  { value: "electronic", label: "Electronic", icon: <Headphones className="h-4 w-4 mr-2" /> },
  { value: "rock", label: "Rock", icon: <Guitar className="h-4 w-4 mr-2" /> },
  { value: "ambient", label: "Ambient", icon: <Waves className="h-4 w-4 mr-2" /> },
  { value: "folk", label: "Folk", icon: <TreePine className="h-4 w-4 mr-2" /> },
  { value: "blues", label: "Blues", icon: <Drumstick className="h-4 w-4 mr-2" /> },
  { value: "pop", label: "Pop", icon: <Music className="h-4 w-4 mr-2" /> },
  { value: "hiphop", label: "Hip Hop", icon: <Mic className="h-4 w-4 mr-2" /> },
  { value: "reggae", label: "Reggae", icon: <Music className="h-4 w-4 mr-2" /> },
  { value: "country", label: "Country", icon: <Guitar className="h-4 w-4 mr-2" /> },
  { value: "cinematic", label: "Cinematic", icon: <Film className="h-4 w-4 mr-2" /> },
  { value: "lofi", label: "Lo-Fi", icon: <Radio className="h-4 w-4 mr-2" /> },
];

export default function RightSidebar() {
  const { 
    musicalStyle,
    tempoBPM,
    timeSignature,
    recordedNotes,
    isGeneratingDescription,
    isGeneratingPrompt,
    isGeneratingImage,
    isRecording,
    setMusicalStyle,
    setTempoBPM,
    setTimeSignature,
    generateAll,
    resetGenerated
  } = useMidiStore();

  const { toggleRightSidebar } = useSidebarState();
  const toast = useToast();
  const isGenerating = isGeneratingDescription || isGeneratingPrompt || isGeneratingImage;
  
  // Metronome state
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContext = useRef<AudioContext | null>(null);
  const metronomeInterval = useRef<NodeJS.Timeout | null>(null);

  // Metronome sound function
  const playClick = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const ctx = audioContext.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = 800;
    gainNode.gain.value = 0.5;
    
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    oscillator.stop(ctx.currentTime + 0.05);
  };
  
  // Toggle metronome
  const toggleMetronome = () => {
    if (isPlaying) {
      // Stop metronome
      if (metronomeInterval.current) {
        clearInterval(metronomeInterval.current);
        metronomeInterval.current = null;
      }
      setIsPlaying(false);
    } else {
      // Start metronome
      playClick(); // Play first click immediately
      const intervalTime = (60 / tempoBPM) * 1000; // Convert BPM to milliseconds
      metronomeInterval.current = setInterval(playClick, intervalTime);
      setIsPlaying(true);
    }
  };
  
  // Update metronome timing when tempo changes
  useEffect(() => {
    if (isPlaying) {
      // Reset the interval with new timing
      if (metronomeInterval.current) {
        clearInterval(metronomeInterval.current);
      }
      const intervalTime = (60 / tempoBPM) * 1000;
      metronomeInterval.current = setInterval(playClick, intervalTime);
    }
    
    // Cleanup function
    return () => {
      if (metronomeInterval.current) {
        clearInterval(metronomeInterval.current);
      }
    };
  }, [tempoBPM, isPlaying]);

  const handleGenerateClick = async () => {
    if (isRecording) {
      toast.showWarning("Please stop recording before generating an image");
      return;
    }
    
    if (recordedNotes.length === 0) {
      toast.showWarning("Please record a melody before generating an image");
      return;
    }

    try {
      const toastId = toast.showLoading("Starting generation process...");
      await generateAll();
      toast.dismiss(toastId);
      toast.showSuccess("Image generated successfully!");
    } catch (error) {
      toast.showError("Failed to generate image. Please try again.");
    }
  };

  return (
    <div className="w-80 h-full border-l bg-background/80 backdrop-blur-sm p-4 overflow-y-auto flex flex-col gap-4 shadow-lg md:shadow-none">
      <div className="flex items-center justify-between md:hidden mb-2">
        <h2 className="text-sm font-medium">Controls</h2>
        <Button variant="ghost" size="sm" onClick={toggleRightSidebar} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Music className="h-4 w-4" />
            <span>Musical Style</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={musicalStyle}
            onValueChange={setMusicalStyle}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a musical style" />
            </SelectTrigger>
            <SelectContent>
              {musicalStyles.map((style) => (
                <SelectItem key={style.value} value={style.value} className="flex items-center">
                  <div className="flex items-center">
                    {style.icon}
                    {style.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Tempo: {tempoBPM} BPM</span>
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMetronome} 
            className="h-8 w-8"
            title={isPlaying ? "Stop metronome" : "Start metronome"}
          >
            {isPlaying ? <StopCircle className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
          </Button>
        </CardHeader>
        <CardContent>
          <Slider
            value={[tempoBPM]}
            min={40}
            max={240}
            step={1}
            onValueChange={(value) => setTempoBPM(value[0])}
            className="my-4"
          />
        </CardContent>
      </Card>
      
      {/* Image Gallery */}
      <ImageGallery />

      <div className="flex flex-col gap-2 mt-auto">
        <Button 
          variant="default" 
          size="lg" 
          onClick={handleGenerateClick}
          disabled={isGenerating || recordedNotes.length === 0 || isRecording}
          className="w-full flex items-center gap-2"
        >
          <Wand2 className="h-4 w-4" />
          <span>
            {isGenerating ? "Generating..." : 
             isRecording ? "Finish Recording First" : 
             "Generate Image"}
          </span>
        </Button>
        
        {isRecording && (
          <div className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs p-2 rounded text-center">
            Please stop recording before generating
          </div>
        )}
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={resetGenerated}
          disabled={isGenerating || isRecording}
          className="flex items-center gap-2 mt-1"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Generation</span>
        </Button>
      </div>
    </div>
  );
} 