"use client";

import Header from "@/components/layout/Header";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import MainContent from "@/components/layout/MainContent";
import { useEffect } from "react";
import useSidebarState from "@/hooks/useSidebarState";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

export default function Home() {
  const { 
    leftSidebarOpen, 
    rightSidebarOpen, 
    setLeftSidebarOpen, 
    setRightSidebarOpen 
  } = useSidebarState();

  // Set initial sidebar states based on screen size
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768; // md breakpoint
      setLeftSidebarOpen(!isMobile);
      setRightSidebarOpen(!isMobile);
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [setLeftSidebarOpen, setRightSidebarOpen]);

  const toggleLeftSidebar = () => {
    setLeftSidebarOpen(!leftSidebarOpen);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar Toggle Button - Fixed to left edge */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleLeftSidebar}
            className="h-10 w-6 rounded-r-md rounded-l-none bg-muted/50 hover:bg-muted/80 border-l-0 border border-border/50 px-0"
            aria-label={leftSidebarOpen ? "Close left sidebar" : "Open left sidebar"}
          >
            {leftSidebarOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {leftSidebarOpen && (
          <div className="md:relative absolute z-10 h-full md:h-auto">
            <LeftSidebar />
          </div>
        )}
        <MainContent />
        {rightSidebarOpen && (
          <div className="md:relative absolute right-0 z-10 h-full md:h-auto">
            <RightSidebar />
          </div>
        )}
      </div>
    </div>
  );
}
