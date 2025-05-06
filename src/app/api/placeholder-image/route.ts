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
    
    // Generate a color based on the prompt (with safe fallback)
    const getColorFromString = (str: string): string => {
      try {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
        return "#" + "00000".substring(0, 6 - c.length) + c;
      } catch (_) {
        // Fallback colors if something goes wrong
        return "#6495ED";
      }
    };
    
    // Create colors
    const bgColor = getColorFromString(prompt);
    const textColor = "#FFFFFF";
    const width = 800;
    const height = 600;
    
    // Create an SVG image
    // Break the prompt into lines if it's too long
    const lines: string[] = [];
    const words = prompt.split(" ");
    let currentLine = words[0] || "Music";
    const maxLineLength = 30;
    
    for (let i = 1; i < Math.min(words.length, 50); i++) { // Limit to 50 words for safety
      if ((currentLine + " " + words[i]).length <= maxLineLength) {
        currentLine += " " + words[i];
      } else {
        lines.push(currentLine);
        currentLine = words[i];
      }
    }
    lines.push(currentLine);
    
    // Limit to maximum 5 lines
    const displayLines = lines.slice(0, 5);
    if (lines.length > 5) {
      displayLines.push("...");
    }
    
    // Sanitize text for SVG safety
    const sanitize = (text: string): string => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };
    
    // Create decorative elements for decoration (with safety checks)
    const decorativeElements = Array.from({ length: 7 }).map((_, i) => {
      try {
        const x = Math.round(Math.sin(i / 7 * Math.PI * 2) * 200 + width / 2);
        const y = Math.round(Math.cos(i / 7 * Math.PI * 2) * 150 + height / 2);
        const size = Math.round(20 + (i * 10));
        const color = getColorFromString(prompt + i);
        return `<circle cx="${x}" cy="${y}" r="${size}" fill="${color}" opacity="0.5" />`;
      } catch (_) {
        // Return empty string if circle generation fails
        return '';
      }
    }).join('\n');
    
    // Generate text spans safely
    const textSpans = displayLines.map((line, i) => {
      try {
        return `<tspan x="50%" dy="${i === 0 ? 0 : 30}">${sanitize(line)}</tspan>`;
      } catch (_) {
        return '<tspan x="50%" dy="30">Text error</tspan>';
      }
    }).join('');
    
    // Calculate vertical position based on number of lines
    const textYPosition = Math.round(height / 2 - (displayLines.length - 1) * 15);
    
    // Create an SVG with gradient background and text
    const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${getColorFromString(prompt + "alt")};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
      
      <!-- Decorative elements -->
      ${decorativeElements}
      
      <!-- Background for text -->
      <rect x="100" y="${textYPosition - 40}" width="600" height="${displayLines.length * 40 + 30}" 
        fill="rgba(0,0,0,0.3)" rx="10" ry="10" />
      
      <!-- Text -->
      <text x="50%" y="${textYPosition}" 
        font-family="Arial, sans-serif" 
        font-size="24" 
        text-anchor="middle" 
        fill="${textColor}"
      >
        ${textSpans}
      </text>
      
      <!-- Watermark -->
      <text x="50%" y="${height - 20}" 
        font-family="Arial, sans-serif" 
        font-size="14" 
        text-anchor="middle" 
        fill="${textColor}"
      >
        Placeholder Image - API Generation Failed
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
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#4B70CA" />
      <rect x="100" y="250" width="600" height="100" fill="rgba(0,0,0,0.3)" rx="10" ry="10" />
      <text x="50%" y="300" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="white">
        Image Generation Unavailable
      </text>
      <text x="50%" y="340" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="white">
        Please try again later
      </text>
    </svg>
    `;
    
    return new NextResponse(simpleSvg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-cache",
      },
    });
  }
} 