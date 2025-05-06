import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, musicalStyle } = body;
    
    if (!description) {
      return NextResponse.json(
        { error: "No musical description provided" },
        { status: 400 }
      );
    }
    
    // Create AI prompt based on prompty.md
    const prompt = `
You are creating a prompt for DALL-E to generate an image inspired by the following musical description.

Music description (generated from melody analysis):
"${description}"

Musical style: ${musicalStyle || "classical"}

Create a CONCISE, clear image prompt with these characteristics:
1. Keep the prompt under 80 words, optimized for DALL-E
2. Focus on a clear subject, style, and mood that matches the music
3. Mention key visual elements, colors, and lighting that represent the musical feeling
4. Include artistic style (like "digital art", "photorealistic", "impressionistic")
5. Start with the most important element
6. DO include people, places, or scenes that reflect the mood of the music (e.g., a solitary figure gazing at a vista, a lively city square, a contemplative person by a window)
7. No musical instruments or performers playing music should be shown

Just provide the prompt without explanation. Example format:
"A [subject/scene] with [distinctive features], [lighting description]. [Color palette]. [Artistic style]. [Mood/atmosphere]."

Your prompt:
    `;
    
    // Use mock response for development if no API key
    if (!process.env.GEMINI_API_KEY) {
      console.log("Using mock response for image prompt - no Gemini API key provided");
      return NextResponse.json({
        prompt: "Misty forest at dawn with golden light filtering through trees. Deep blues and greens with amber accents. Impressionistic digital art. Contemplative atmosphere with dewdrops catching light."
      });
    }
    
    try {
      // Generate image prompt with Gemini
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      });
      
      if (!result.response) {
        throw new Error("Empty response from Gemini API");
      }
      
      const imagePrompt = result.response.text().trim();
      
      if (!imagePrompt || imagePrompt === "") {
        throw new Error("Empty image prompt generated");
      }
      
      // Clean up the prompt: remove quotes if present
      const cleanPrompt = imagePrompt.replace(/^["']|["']$/g, '');
      
      return NextResponse.json({ prompt: cleanPrompt });
    } catch (geminiError) {
      console.error("Gemini API error:", geminiError);
      
      // Return a meaningful error response
      return NextResponse.json(
        { error: `Gemini API error: ${geminiError instanceof Error ? geminiError.message : 'Unknown error'}` },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error("Error generating image prompt:", error);
    return NextResponse.json(
      { error: "Failed to generate image prompt" },
      { status: 500 }
    );
  }
} 