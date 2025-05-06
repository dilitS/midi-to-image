import { NextRequest, NextResponse } from "next/server";

/**
 * API endpoint to generate a placeholder image for when image generation fails
 * Uses a simple SVG image since it doesn't require external dependencies
 */
export async function GET(request: NextRequest) {
  try {
    // Extract prompt from URL
    const { searchParams } = new URL(request.url);
    const prompt = searchParams.get("prompt") || "Music visualization";
    
    // Generate a color based on the prompt
    const getColorFromString = (str: string): string => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
      return "#" + "00000".substring(0, 6 - c.length) + c;
    };
    
    // Create colors
    const bgColor = getColorFromString(prompt);
    const textColor = "#FFFFFF";
    const width = 800;
    const height = 600;
    
    // Create an SVG image
    // Break the prompt into lines if it's too long
    const lines = [];
    const words = prompt.split(" ");
    let currentLine = words[0];
    const maxLineLength = 30;
    
    for (let i = 1; i < words.length; i++) {
      if ((currentLine + " " + words[i]).length <= maxLineLength) {
        currentLine += " " + words[i];
      } else {
        lines.push(currentLine);
        currentLine = words[i];
      }
    }
    lines.push(currentLine);
    
    // Create an SVG with gradient background and text
    const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${getColorFromString(prompt + "alt")};stop-opacity:1" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="shadow"/>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
      
      <!-- Decorative elements -->
      ${Array.from({ length: 7 }).map((_, i) => {
        const x = Math.sin(i / 7 * Math.PI * 2) * 200 + width / 2;
        const y = Math.cos(i / 7 * Math.PI * 2) * 150 + height / 2;
        const size = 20 + (i * 10);
        const color = getColorFromString(prompt + i);
        return `<circle cx="${x}" cy="${y}" r="${size}" fill="${color}" opacity="0.5" />`;
      }).join('\n')}
      
      <!-- Text shadow -->
      <text x="50%" y="50%" 
        font-family="Arial, sans-serif" 
        font-size="24" 
        text-anchor="middle" 
        fill="#000000" 
        opacity="0.7"
        filter="url(#shadow)"
        dy="${lines.length > 1 ? -(lines.length - 1) * 15 : 0}"
      >
        ${lines.map((line, i) => `<tspan x="50%" dy="${i === 0 ? 0 : 30}">${line}</tspan>`).join('')}
      </text>
      
      <!-- Text -->
      <text x="50%" y="50%" 
        font-family="Arial, sans-serif" 
        font-size="24" 
        text-anchor="middle" 
        fill="${textColor}"
        dy="${lines.length > 1 ? -(lines.length - 1) * 15 : 0}"
      >
        ${lines.map((line, i) => `<tspan x="50%" dy="${i === 0 ? 0 : 30}">${line}</tspan>`).join('')}
      </text>
      
      <!-- Watermark -->
      <text x="50%" y="${height - 20}" 
        font-family="Arial, sans-serif" 
        font-size="12" 
        text-anchor="middle" 
        fill="${textColor}"
      >
        Placeholder Image Generated
      </text>
    </svg>
    `;
    
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error generating placeholder SVG:", error);
    
    // Create a very simple SVG if everything else fails
    const simpleSvg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#6495ED" />
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="20" text-anchor="middle" fill="white">
        Placeholder Image
      </text>
    </svg>
    `;
    
    return new NextResponse(simpleSvg, {
      headers: {
        "Content-Type": "image/svg+xml",
      },
    });
  }
} 