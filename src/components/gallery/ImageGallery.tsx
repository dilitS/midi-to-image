"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavedImage, getImages, deleteImage } from "@/lib/storage";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImageIcon, CalendarIcon, Clock, Music, Trash2, Info, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator"; 
import { toast } from "@/components/ui/use-toast";

export function ImageGallery() {
  const [images, setImages] = useState<SavedImage[]>([]);
  
  // Load images on component mount and refresh every minute
  useEffect(() => {
    const loadImages = () => {
      const savedImages = getImages();
      setImages(savedImages);
    };
    
    // Initial load
    loadImages();
    
    // Set up a refresh interval (every minute)
    const interval = setInterval(loadImages, 60 * 1000);
    
    // Clean up
    return () => clearInterval(interval);
  }, []);
  
  const handleDeleteImage = (id: string) => {
    deleteImage(id);
    setImages(prev => prev.filter(img => img.id !== id));
  };
  
  if (images.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            <span>Image History</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground italic py-4">
          No saved images yet. Generate some images and they'll appear here for 3 days.
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          <span>Image History</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px] px-4 py-2">
          <div className="grid grid-cols-2 gap-2">
            {images.map((image) => (
              <ImageCard 
                key={image.id} 
                image={image} 
                onDelete={() => handleDeleteImage(image.id)}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function ImageCard({ image, onDelete }: { image: SavedImage; onDelete: () => void }) {
  const timeAgo = formatDistanceToNow(new Date(image.timestamp), { addSuffix: true });
  const [isOpen, setIsOpen] = useState(false);
  
  // If image doesn't have notes saved, try extracting them from the prompt
  const extractNotesFromPrompt = (prompt: string) => {
    // Common musical notes pattern (A, B, C, D, E, F, G with optional sharps/flats)
    const notePattern = /\b([A-G](#|b)?[0-9]?)\b/g;
    const matches = [...prompt.matchAll(notePattern)];
    
    // Get unique notes
    const uniqueNotes = Array.from(new Set(matches.map(match => match[0])));
    return uniqueNotes.length > 0 ? uniqueNotes : null;
  };
  
  // Use saved notes if available, otherwise try to extract from prompt
  const usedNotes = image.notes && image.notes.length > 0 
    ? image.notes 
    : extractNotesFromPrompt(image.prompt);
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
    setIsOpen(false);
  };
  
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Create a download link
    const link = document.createElement('a');
    link.href = image.imageUrl;
    link.download = `${image.style}-image-${new Date(image.timestamp).toISOString().split('T')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="rounded-md overflow-hidden border cursor-pointer hover:opacity-90 transition-opacity">
          <div className="relative">
            <AspectRatio ratio={1/1}>
              <img 
                src={image.imageUrl}
                alt={image.prompt.substring(0, 20) + '...'}
                className="object-cover w-full h-full"
              />
            </AspectRatio>
            <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3 opacity-80" />
                  <span className="text-xs truncate">{timeAgo}</span>
                </div>
                <button 
                  onClick={handleDelete} 
                  className="text-white/80 hover:text-white focus:outline-none"
                  aria-label="Delete image"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generated Image - {image.style} Style</DialogTitle>
        </DialogHeader>
        
        {/* Image at the top */}
        <div className="rounded-md overflow-hidden border mb-4">
          <img 
            src={image.imageUrl}
            alt="Generated image"
            className="w-full h-auto"
          />
        </div>
        
        {/* Details below in a structured grid */}
        <div className="space-y-4">
          {/* Notes used section */}
          {usedNotes && usedNotes.length > 0 && (
            <div className="bg-muted/30 rounded-md p-3">
              <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                <Music className="h-4 w-4" />
                <span>Notes Used</span>
              </h3>
              <div className="flex flex-wrap gap-1">
                {usedNotes.map((note, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {note}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Style and Info sections */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <h3 className="text-sm font-medium flex items-center gap-1">
                <Info className="h-4 w-4" />
                <span>Style</span>
              </h3>
              <p className="bg-muted rounded-md px-3 py-2 text-sm">{image.style}</p>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-medium flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                <span>Created</span>
              </h3>
              <p className="bg-muted rounded-md px-3 py-2 text-sm">{timeAgo}</p>
            </div>
          </div>
          
          {/* Prompt section */}
          <div className="space-y-1">
            <h3 className="text-sm font-medium">Generated Prompt</h3>
            <p className="bg-muted rounded-md px-3 py-2 text-sm max-h-28 overflow-y-auto">
              {image.prompt}
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex flex-row justify-between">
          <Button variant="outline" size="sm" onClick={handleDownload} className="mt-2">
            <Download className="h-4 w-4 mr-1" />
            Download Image
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} className="mt-2">
            <Trash2 className="h-4 w-4 mr-1" />
            Delete Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 