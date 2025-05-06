"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ImageIcon, Music, Sparkles, HeartPulse, Clock, Layers, Guitar, FileText } from "lucide-react";
import useMidiStore from "@/store/useMidiStore";
import useSidebarState from "@/hooks/useSidebarState";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function LeftSidebar() {
  const { musicalDescription, imagePrompt } = useMidiStore();
  const { toggleLeftSidebar } = useSidebarState();

  return (
    <div className="w-80 h-full border-r bg-background/80 backdrop-blur-sm p-4 overflow-y-auto flex flex-col gap-4 shadow-lg md:shadow-none">
      <div className="flex items-center justify-between md:hidden mb-2">
        <h2 className="text-sm font-medium">Analysis</h2>
        <Button variant="ghost" size="sm" onClick={toggleLeftSidebar} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            <span>Image Prompt</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {imagePrompt ? (
            <p className="text-sm">{imagePrompt}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>A musical description will be transformed into an image prompt</span>
            </p>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Music className="h-4 w-4" />
            <span>Musical Description</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {musicalDescription ? (
            <div className="text-sm space-y-3">
              {/* Summary section at the top */}
              {musicalDescription.summary && (
                <div className="bg-primary/5 p-3 rounded-md border border-primary/10">
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <p>{musicalDescription.summary}</p>
                  </div>
                </div>
              )}
              
              {/* Accordion for detailed sections */}
              <Accordion type="multiple" defaultValue={['item-0']} className="w-full">
                {musicalDescription.harmonicAnalysis && (
                  <AccordionItem value="item-0">
                    <AccordionTrigger className="text-sm py-2 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        <span>Harmonic Analysis</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm pt-1">{musicalDescription.harmonicAnalysis}</p>
                    </AccordionContent>
                  </AccordionItem>
                )}
                
                {musicalDescription.melodicStructure && (
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-sm py-2 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Music className="h-4 w-4" />
                        <span>Melodic Structure</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm pt-1">{musicalDescription.melodicStructure}</p>
                    </AccordionContent>
                  </AccordionItem>
                )}
                
                {musicalDescription.rhythmAndTiming && (
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-sm py-2 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Rhythm & Timing</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm pt-1">{musicalDescription.rhythmAndTiming}</p>
                    </AccordionContent>
                  </AccordionItem>
                )}
                
                {musicalDescription.stylisticElements && (
                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-sm py-2 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        <span>Stylistic Elements</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm pt-1">{musicalDescription.stylisticElements}</p>
                    </AccordionContent>
                  </AccordionItem>
                )}
                
                {musicalDescription.moodAndCharacter && (
                  <AccordionItem value="item-4">
                    <AccordionTrigger className="text-sm py-2 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <HeartPulse className="h-4 w-4" />
                        <span>Mood & Character</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm pt-1">{musicalDescription.moodAndCharacter}</p>
                    </AccordionContent>
                  </AccordionItem>
                )}
                
                {musicalDescription.instrumentation && (
                  <AccordionItem value="item-5">
                    <AccordionTrigger className="text-sm py-2 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Guitar className="h-4 w-4" />
                        <span>Instrumentation</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm pt-1">{musicalDescription.instrumentation}</p>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
              
              {/* Fallback for raw text if structured parsing failed */}
              {musicalDescription.rawText && !musicalDescription.summary && (
                <pre className="whitespace-pre-wrap">{musicalDescription.rawText}</pre>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic flex items-center gap-2">
              <Music className="h-3.5 w-3.5" />
              <span>Play and record a melody to generate a musical description</span>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 