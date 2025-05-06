"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MidiKeyboard } from "@/components/midi/MidiKeyboard";
import { Mic, Square, Music, ImageIcon, LoaderCircle, Download } from "lucide-react";
import useMidiStore from "@/store/useMidiStore";
import { useEffect, useState, useRef } from "react";
import { findBaseChord } from "@/lib/midi";
import useSidebarState from "@/hooks/useSidebarState";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader } from "@/components/ui/dialog";

export default function MainContent() {
  const { 
    isRecording,
    recordingStartTime,
    generatedImage,
    imagePrompt,
    playedNotes,
    isGeneratingDescription,
    isGeneratingPrompt,
    isGeneratingImage,
    startRecording,
    stopRecording,
    recordedNotes,
    musicalStyle
  } = useMidiStore();

  const [recordingProgress, setRecordingProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hasRecordedNotes, setHasRecordedNotes] = useState(false);
  const [baseChord, setBaseChord] = useState("");
  const [downloadFileName, setDownloadFileName] = useState("melody-image.png");
  const [imageError, setImageError] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const isGenerating = isGeneratingDescription || isGeneratingPrompt || isGeneratingImage;
  
  const { 
    leftSidebarOpen,
    rightSidebarOpen
  } = useSidebarState();
  
  // Get the current generation step
  const getGenerationStep = () => {
    if (isGeneratingDescription) return "Analyzing melody...";
    if (isGeneratingPrompt) return "Creating prompt...";
    if (isGeneratingImage) return "Generating image...";
    return "";
  };

  // Update recording progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording && recordingStartTime) {
      interval = setInterval(() => {
        const elapsed = Date.now() - recordingStartTime;
        const elapsedSeconds = Math.floor(elapsed / 1000);
        const progress = Math.min((elapsed / (30 * 1000)) * 100, 100);
        
        setElapsedTime(elapsedSeconds);
        setRecordingProgress(progress);
        
        // Auto-stop after 30 seconds
        if (elapsed >= 30 * 1000) {
          stopRecording();
        }
      }, 100);
    } else {
      setRecordingProgress(0);
      setElapsedTime(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, recordingStartTime, stopRecording]);

  // Check if we have recorded notes and detect chord
  useEffect(() => {
    setHasRecordedNotes(recordedNotes.length > 0);
    
    // Detect base chord when recording stops and we have notes
    if (!isRecording && recordedNotes.length > 0) {
      setBaseChord(findBaseChord(recordedNotes));
    } else if (isRecording) {
      setBaseChord("");
    }
  }, [recordedNotes, isRecording]);

  // Set download filename when a new image is generated
  useEffect(() => {
    if (generatedImage) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const style = musicalStyle || 'melody';
      setDownloadFileName(`${style}-image-${timestamp}.png`);
    }
  }, [generatedImage, musicalStyle]);

  // Handle image download
  const handleDownloadImage = () => {
    if (!generatedImage || !imageRef.current) return;
    
    // Create an anchor element and set properties for download
    const link = document.createElement('a');
    
    // For data URLs, we can download directly
    if (generatedImage.startsWith('data:')) {
      link.href = generatedImage;
      link.download = downloadFileName;
      link.click();
    } 
    // For remote URLs, we need to convert the image to a local blob
    else {
      // Get the rendered image and convert to blob
      const canvas = document.createElement('canvas');
      const img = imageRef.current;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.download = downloadFileName;
            link.click();
            
            // Clean up
            setTimeout(() => URL.revokeObjectURL(url), 100);
          }
        });
      }
    }
  };

  // Handle image loading error
  const handleImageError = () => {
    setImageError("Failed to load the generated image. Please try again.");
  };

  // Reset image error when image changes
  useEffect(() => {
    setImageError(null);
  }, [generatedImage]);

  return (
    <div className={`flex-1 flex flex-col ${!leftSidebarOpen && !rightSidebarOpen ? 'w-full' : ''}`}>
      {/* Main Content Area with Fixed Height and Internal Scrolling */}
      <div className="flex-1 p-6 flex flex-col gap-6 h-[calc(100vh-110px)] overflow-hidden">
        <div className="flex-1 overflow-y-auto pr-2">
          <Card className="flex-1 shadow-md border-muted mb-6">
            <CardHeader className="py-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                <span>Melody Visualization</span>
              </CardTitle>
              <div className="flex items-center gap-4">
                {hasRecordedNotes && !isRecording && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                      <Music className="h-3 w-3" />
                      <span>{recordedNotes.length} notes recorded</span>
                    </div>
                    
                    {baseChord && (
                      <div className="bg-muted/50 px-2 py-1 rounded text-xs font-medium">
                        {baseChord}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 h-full flex flex-col">
              {isGenerating ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                  <div className="relative">
                    <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                      {Math.floor(Math.random() * 100) + 1}%
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{getGenerationStep()}</p>
                    <p className="text-xs text-muted-foreground mt-1">This may take a moment</p>
                  </div>
                </div>
              ) : generatedImage ? (
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="relative w-full max-w-md mx-auto mb-4 cursor-pointer group">
                        {imageError ? (
                          <div className="w-full aspect-video bg-muted flex items-center justify-center rounded-lg">
                            <div className="text-center p-4">
                              <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">{imageError}</p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <img 
                              ref={imageRef}
                              src={generatedImage} 
                              alt="Generated visualization based on your melody" 
                              className="w-full h-auto rounded-lg shadow-md transition-all group-hover:brightness-90"
                              onError={handleImageError}
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="bg-black/40 rounded-full p-2">
                                <ImageIcon className="h-6 w-6 text-white" />
                              </div>
                            </div>
                          </>
                        )}
                        
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadImage();
                          }}
                          variant="outline" 
                          size="sm"
                          disabled={!!imageError}
                          className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                      </div>
                    </DialogTrigger>
                    
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Generated Image</DialogTitle>
                      </DialogHeader>
                      <div className="flex flex-col space-y-4">
                        <div className="rounded-md overflow-hidden border">
                          <img 
                            src={generatedImage} 
                            alt="Generated visualization based on your melody" 
                            className="w-full h-auto"
                          />
                        </div>
                        
                        {imagePrompt && (
                          <div>
                            <h3 className="text-sm font-medium mb-1">Generated from prompt:</h3>
                            <div className="bg-muted p-3 rounded-md">
                              <p className="text-sm">{imagePrompt}</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-end">
                          <Button 
                            onClick={handleDownloadImage}
                            variant="default" 
                            disabled={!!imageError}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download Image
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  {imagePrompt && (
                    <div className="w-full max-w-md mx-auto">
                      <p className="text-sm font-medium mb-1">Generated from prompt:</p>
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm">{imagePrompt}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                  <div className="max-w-md space-y-4">
                    <div className="bg-primary/10 rounded-full p-4 inline-block mx-auto">
                      <Music className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">Play a melody to visualize</h3>
                    <p className="text-sm text-muted-foreground">
                      Use the keyboard below to record a melody, then we'll generate a unique visualization based on your music.
                    </p>
                    
                    <div className="flex justify-center">
                      {playedNotes.length > 0 && (
                        <div className="flex flex-wrap gap-1 max-w-sm justify-center">
                          {playedNotes.slice(0, 10).map((note, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {note}
                            </Badge>
                          ))}
                          {playedNotes.length > 10 && (
                            <Badge variant="outline" className="text-xs">
                              +{playedNotes.length - 10} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Fixed Footer with Keyboard and Recording Controls */}
      <div className={`border-t ${isRecording ? 'bg-primary/5 shadow-inner' : 'bg-background/80 backdrop-blur-sm'}`}>
        {/* Recording Controls */}
        <div className="flex items-center justify-between px-6 py-2 border-b">
          {isRecording ? (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={stopRecording}
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Stop Recording
            </Button>
          ) : (
            <Button 
              variant="default" 
              size="sm" 
              onClick={startRecording}
              className="flex items-center gap-2"
            >
              <Mic className="h-4 w-4" />
              Start Recording
            </Button>
          )}
          
          {isRecording && (
            <div className="flex items-center gap-2 flex-1 max-w-xs ml-4">
              <Progress value={recordingProgress} className="h-2" />
              <span className="text-xs text-muted-foreground font-medium min-w-[48px] text-right">
                {elapsedTime}s / 30s
              </span>
              <Badge variant="secondary" className="bg-primary/20">Recording</Badge>
            </div>
          )}
        </div>
        
        {/* Keyboard */}
        <div className="p-2">
          <MidiKeyboard />
        </div>
      </div>
    </div>
  );
} 