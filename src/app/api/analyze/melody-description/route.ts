import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MelodyData } from "@/store/useMidiStore";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const melodyData: MelodyData = body;
    
    if (!melodyData.notes || melodyData.notes.length === 0) {
      return NextResponse.json(
        { error: "No notes data provided" },
        { status: 400 }
      );
    }
    
    // Format notes data for the AI model
    const formattedNotes = melodyData.notes.map(note => 
      `{ pitch: ${note.note}, startTime: ${note.startTime.toFixed(2)}, duration: ${note.duration.toFixed(2)} }`
    ).join(",\n");
    
    // Create AI prompt based on prompty.md
    const prompt = `
You are a music theory expert and analyst.
Analyze the following 30-second musical fragment and provide a structured musical analysis.

Input data:
- Note sequence (pitch, start time, duration): [
${formattedNotes}
]
- Musical style: ${melodyData.musicalStyle}
- Tempo: ${melodyData.tempoBPM} BPM
- Time signature: ${melodyData.timeSignature}

Provide your analysis in this JSON structured format:
{
  "harmonicAnalysis": "Detailed analysis of key, chord progressions, and harmonic patterns.",
  "melodicStructure": "Description of melodic contour, patterns, and notable intervals.",
  "rhythmAndTiming": "Analysis of rhythmic patterns, timing variations, and tempo feel.",
  "stylisticElements": "How this fragment reflects the ${melodyData.musicalStyle} style.",
  "moodAndCharacter": "Description of emotional quality and character of the piece.",
  "instrumentation": "Suggested instruments that would suit this fragment.",
  "summary": "Brief overall summary of the piece in 2-3 sentences."
}

Generate a concise, technical analysis focusing on musical elements. Include emotional qualities but prioritize musical structure. Ensure the output is valid JSON that can be parsed.
    `;
    
    // Use mock response for development if no API key
    if (!process.env.GEMINI_API_KEY) {
      console.log("Using mock response for melody description - no Gemini API key provided");
      return NextResponse.json({
        description: {
          harmonicAnalysis: `The fragment is centered in a ${melodyData.musicalStyle === 'jazz' ? 'minor 7th' : 'minor'} tonality with a subtle progression that suggests modal interchange. There's a recurring i-iv-VII pattern that creates tension and release.`,
          melodicStructure: `The melody follows a descending contour overall, featuring several stepwise passages interrupted by occasional larger intervals (perfect 4ths). The phrases typically begin on weak beats, creating a floating quality.`,
          rhythmAndTiming: `At ${melodyData.tempoBPM} BPM in ${melodyData.timeSignature}, the rhythm establishes a gentle pulse with notes often falling slightly ahead or behind the beat, creating a human, organic feel.`,
          stylisticElements: `This fragment captures the ${melodyData.musicalStyle} style through its ${melodyData.musicalStyle === 'jazz' ? 'extended harmonies and improvisational feel' : melodyData.musicalStyle === 'classical' ? 'formal phrase structure and harmonic tension' : 'characteristic rhythmic patterns and tonal center'}.`,
          moodAndCharacter: `The piece evokes a contemplative, slightly melancholic atmosphere with moments of unexpected warmth. There's an introspective quality that suggests thoughtful reflection.`,
          instrumentation: `This would be well-suited for ${melodyData.musicalStyle === 'jazz' ? 'piano trio with upright bass and brushed drums' : melodyData.musicalStyle === 'classical' ? 'piano and strings, particularly cello' : 'synthesizer with subtle percussion and ambient textures'}.`,
          summary: `A contemplative ${melodyData.musicalStyle} piece with a minor tonality that builds tension through recurring progressions. The descending melodic contour and gentle rhythmic feel create an introspective, slightly melancholic atmosphere.`
        }
      });
    }
    
    try {
      // Generate description with Gemini
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
          responseMimeType: "application/json"
        }
      });
      
      if (!result.response) {
        throw new Error("Empty response from Gemini API");
      }
      
      const descriptionText = result.response.text();
      
      if (!descriptionText || descriptionText.trim() === "") {
        throw new Error("Empty description generated");
      }
      
      // Parse the response as JSON
      let descriptionJson;
      try {
        descriptionJson = JSON.parse(descriptionText);
      } catch (e) {
        console.error("Failed to parse JSON response:", e);
        console.log("Raw response:", descriptionText);
        
        // If JSON parsing fails, create a structured response manually
        descriptionJson = {
          harmonicAnalysis: "Analysis unavailable in structured format.",
          melodicStructure: "Analysis unavailable in structured format.",
          rhythmAndTiming: "Analysis unavailable in structured format.",
          stylisticElements: "Analysis unavailable in structured format.",
          moodAndCharacter: "Analysis unavailable in structured format.",
          instrumentation: "Analysis unavailable in structured format.",
          summary: "The melody analysis could not be structured properly.",
          rawText: descriptionText // Include the full text for fallback display
        };
      }
      
      return NextResponse.json({ description: descriptionJson });
      
    } catch (geminiError) {
      console.error("Gemini API error:", geminiError);
      
      // Return a meaningful error response
      return NextResponse.json(
        { error: `Gemini API error: ${geminiError instanceof Error ? geminiError.message : 'Unknown error'}` },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error("Error generating melody description:", error);
    return NextResponse.json(
      { error: "Failed to generate melody description" },
      { status: 500 }
    );
  }
} 