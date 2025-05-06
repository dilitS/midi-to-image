"use client";

import { Github, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import useSidebarState from "@/hooks/useSidebarState";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Image from "next/image";
export default function Header() {
  const { leftSidebarOpen, rightSidebarOpen, toggleLeftSidebar, toggleRightSidebar } = useSidebarState();

  return (
    <header className="h-12 md:h-16 bg-background/80 backdrop-blur-sm border-b flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center md:hidden">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleLeftSidebar}
          className="mr-2"
          aria-label="Toggle left sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex items-center">
        <Image src="/logo.webp" alt="MIDI to Image" width={32} height={32} />
        <h1 className="text-lg md:text-xl font-semibold tracking-tight ml-2">
          MIDI to Image
        </h1>
      </div>
      
      <div className="flex items-center gap-2">
        <ThemeToggle />
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          asChild
          aria-label="GitHub repository"
        >
          <a href="https://github.com/dilitS/midi-to-image" target="_blank" rel="noopener noreferrer">
            <Github className="h-4 w-4" />
          </a>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleRightSidebar}
          className="md:hidden h-8 w-8 p-0"
          aria-label="Toggle right sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
} 