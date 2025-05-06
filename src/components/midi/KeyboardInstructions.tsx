"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Keyboard, Mouse, MusicIcon, HelpCircle } from "lucide-react";

export function KeyboardInstructions() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full flex items-center justify-center gap-1">
          <HelpCircle className="h-4 w-4 text-primary" />
          <span className="text-xs">Keyboard Guide</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-4 w-4" />
            Piano Keyboard Guide
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-sm space-y-6 mt-2">
          {/* Computer Keyboard Section */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2 text-sm border-b pb-1">
              <Keyboard className="h-4 w-4 text-primary" />
              <span>Computer Keyboard</span>
            </h3>
            <div className="space-y-2 text-muted-foreground">
              <p>Use these keys to play notes:</p>
              <div className="grid grid-cols-6 md:grid-cols-8 gap-1.5 mt-2">
                {['a', 'w', 's', 'e', 'd', 'f', 't', 'g', 'y', 'h', 'u', 'j', 'k', 'o', 'l', 'p', ';'].map((key) => (
                  <Badge 
                    key={key} 
                    variant="outline" 
                    className="text-center px-2 py-1 border-primary/20"
                  >
                    {key}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          {/* Mouse Control Section */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2 text-sm border-b pb-1">
              <Mouse className="h-4 w-4 text-primary" />
              <span>Mouse Control</span>
            </h3>
            <div className="pl-2 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary" className="h-6 min-w-6 flex items-center justify-center p-0">•</Badge>
                <span>Click keys to play notes</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary" className="h-6 min-w-6 flex items-center justify-center p-0">•</Badge>
                <span>Drag across keys for glissando effect</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary" className="h-6 min-w-6 flex items-center justify-center p-0">•</Badge>
                <span>Double-click anywhere to reset stuck notes</span>
              </div>
            </div>
          </div>
          
          {/* Recording Tips Section */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2 text-sm border-b pb-1">
              <MusicIcon className="h-4 w-4 text-primary" />
              <span>Recording Tips</span>
            </h3>
            <div className="pl-2 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary" className="h-6 min-w-6 flex items-center justify-center p-0">1</Badge>
                <span>Record a 10-30 second melody</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary" className="h-6 min-w-6 flex items-center justify-center p-0">2</Badge>
                <span>Try different musical styles from the right sidebar</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary" className="h-6 min-w-6 flex items-center justify-center p-0">3</Badge>
                <span>Shorter melodic phrases work best for image generation</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 