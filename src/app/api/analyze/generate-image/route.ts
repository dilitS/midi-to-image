import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, BlockReason, FinishReason } from "@google/generative-ai";

// Initialize Gemini AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;
    
    if (!prompt) {
      return NextResponse.json(
        { error: "No musical description provided to create an image prompt" },
        { status: 400 }
      );
    }
    
    const apiKeyPresent = !!process.env.GEMINI_API_KEY;
    console.log(`Gemini API Key Present: ${apiKeyPresent}`);
    
    if (!apiKeyPresent) {
      console.log("Using placeholder image - no Gemini API key provided");
      return NextResponse.json({
        imageUrl: `/api/placeholder-image?prompt=${encodeURIComponent(prompt)}`,
        imagePrompt: prompt,
        error: "Gemini API Key not configured",
      });
    }
    
    try {
      // First, generate a detailed image prompt based on the musical description
      const promptGenerationPrompt = `Based on this musical description: "${prompt}", 
create a detailed image prompt that captures the emotional essence of the music.

Focus on visual elements like:
- Scene description (landscape, cityscape, abstract, etc.)
- Lighting and atmosphere
- Color palette
- Mood and emotional tone
- Texture and depth
- Time of day/weather conditions (if applicable)

The prompt should be cohesive and create a vivid mental image. 
DO NOT include any text, musical notes, sheet music, or musical instruments in the description.
DO NOT include any musicians in the description.
DO NOT mention that this is based on music.

Format the response as only the image prompt text with no additional commentary.`;

      console.log("Generating detailed image prompt...");
      
      const textModel = genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro",
      });
      
      const textConfig = {
        temperature: 0.7,
        topK: 30,
        topP: 0.9,
        maxOutputTokens: 800,
      };
      
      // First generate a detailed image prompt
      const textResult = await textModel.generateContent({
        contents: [{ role: "user", parts: [{ text: promptGenerationPrompt }] }],
        generationConfig: textConfig,
      });
      
      console.log("Image prompt generated. Now creating image...");
      
      const textResponse = textResult.response;
      if (!textResponse || !textResponse.candidates || textResponse.candidates.length === 0) {
        throw new Error("Failed to generate image prompt");
      }
      
      const generatedImagePrompt = textResponse.candidates[0].content.parts[0].text || "";
      if (!generatedImagePrompt) {
        throw new Error("Empty image prompt generated");
      }
      
      console.log("Generated image prompt:", generatedImagePrompt.substring(0, 200) + "...");
      
      // Now use Gemini to create the image
      const imageGenerationPrompt = `Create a detailed, photorealistic image of the following scene:

${generatedImagePrompt}

Make it visually compelling with rich details, dramatic lighting, and emotional depth.`;
      
      console.log("Requesting image generation...");
      
      const imageModel = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp-image-generation",
      });
      
      const imageConfig = {
        temperature: 0.7,
        topK: 32,
        topP: 0.95,
        responseModalities: ["TEXT", "IMAGE"],
        // No MIME type specified for image generation
      };
      
      const result = await imageModel.generateContent({
        contents: [{ role: "user", parts: [{ text: imageGenerationPrompt }] }],
        generationConfig: imageConfig,
      });
      
      console.log("Gemini API call completed. Processing response...");
      
      const response = result.response;
      if (!response) {
        console.error("Gemini API Error: Response object is undefined.");
        throw new Error("Empty response object from Gemini API.");
      }
      
      if (response.promptFeedback?.blockReason) {
        console.error(
          `Gemini API Error: Prompt was blocked. Reason: ${response.promptFeedback.blockReason}`,
          `Safety Ratings: ${JSON.stringify(response.promptFeedback.safetyRatings)}`
        );
        throw new Error(
          `Request blocked by API due to: ${response.promptFeedback.blockReason}`
        );
      }
      
      if (!response.candidates || response.candidates.length === 0) {
        console.error("Gemini API Error: No candidates found in response.", JSON.stringify(response));
        throw new Error("No candidates in Gemini API response.");
      }
      
      const candidate = response.candidates[0];
      if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        console.error(
          "Gemini API Error: No content parts found in the first candidate.",
          `Candidate Finish Reason: ${candidate.finishReason}`,
          `Candidate Safety Ratings: ${JSON.stringify(candidate.safetyRatings)}`,
          JSON.stringify(candidate)
        );
        throw new Error("No content parts in Gemini API response candidate.");
      }
      
      if (candidate.finishReason && candidate.finishReason !== FinishReason.STOP) {
         console.error(
          `Gemini API Error: Generation finished for a non-STOP reason: ${candidate.finishReason}`,
          `Safety Ratings: ${JSON.stringify(candidate.safetyRatings)}`
        );
        throw new Error(`Image generation stopped prematurely: ${candidate.finishReason}`);
      }
      
      let imageBase64 = null;
      console.log("Scanning response parts for image data...");
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.mimeType === "image/png") {
          imageBase64 = part.inlineData.data;
          console.log("Found image/png data in response part.");
          break;
        } else if (part.text) {
          console.log("Received text part instead of image:", part.text.substring(0,100) + "...");
        }
      }
      
      if (!imageBase64) {
        console.error(
          "Gemini API Error: Could not extract image/png data from response parts.",
          "Full candidate content:", JSON.stringify(candidate.content)
        );
        
        // If we didn't get an image, use the placeholder image with our generated prompt
        console.log("Falling back to placeholder image with generated prompt");
        return NextResponse.json({
          imageUrl: `/api/placeholder-image?prompt=${encodeURIComponent(generatedImagePrompt)}`,
          imagePrompt: generatedImagePrompt,
          error: "Could not generate image, using placeholder instead",
        });
      }
      
      const imageUrl = `data:image/png;base64,${imageBase64}`;
      console.log("Image successfully processed. Returning image URL.");
      
      return NextResponse.json({ 
        imageUrl,
        imagePrompt: generatedImagePrompt
      });
      
    } catch (geminiError) {
      console.error("Gemini API call failed:", geminiError instanceof Error ? geminiError.message : geminiError, geminiError);
      
      // Check for MIME type error specifically
      const errorMessage = geminiError instanceof Error ? geminiError.message : String(geminiError);
      if (errorMessage.includes("response_mime_type") || errorMessage.includes("mime")) {
        console.log("MIME type error detected, using fallback strategy");
        return NextResponse.json({
          imageUrl: `/api/placeholder-image?prompt=${encodeURIComponent(prompt)}`,
          imagePrompt: prompt,
          error: "MIME type configuration error - using placeholder image",
        });
      }
      
      return NextResponse.json({
        imageUrl: `/api/placeholder-image?prompt=${encodeURIComponent(prompt)}`,
        imagePrompt: prompt,
        error:
          geminiError instanceof Error
            ? `Gemini API Error: ${geminiError.message}`
            : "Unknown error during Gemini API call.",
      });
    }
    
  } catch (error) {
    console.error("Overall error in generate-image endpoint:", error);
    return NextResponse.json(
      { error: "Failed to generate image due to an internal server error." },
      { status: 500 }
    );
  }
} 