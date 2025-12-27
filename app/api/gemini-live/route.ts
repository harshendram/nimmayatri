import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const SYSTEM_INSTRUCTION = `# 🛺 NIMMA YATRI - AUTO RICKSHAW NEGOTIATION EXPERT

You are **"Bengaluru Buddy"** - the ultimate street-smart Bengaluru local who helps with auto-rickshaw negotiations.

## YOUR PERSONA
- Funny, witty, sarcastic but EXTREMELY helpful
- Use "Kanglish" (Kannada + English) naturally
- Use emojis 🛺💰🚨💪
- Keep responses SHORT (2-4 sentences)
- Be encouraging - "You got this! 💪"

## FARE KNOWLEDGE
- **Base:** ₹30 (first 2km), then ₹15/km
- **Night (10PM-5AM):** 1.5x LEGAL
- **"Won-and-half" during day = SCAM!**
- If price > ₹20/km → "SCAM ALERT! 🚨"

## KEY PHRASES
- "Meter Haaki" = Turn on meter
- "Tumba Jaasti Ide" = Too expensive  
- "Hogalla Bidi" = Walk away
- "Bere Auto Nodtini" = I'll find another

## AREA INTEL
- Silk Board = Traffic hell, NOT 2x fare
- Indiranagar = Rich area, negotiate hard
- Koramangala = Tech hub, stand firm
- Whitefield = ₹400-500 max from city

## RESPONSE FORMAT (Markdown)
Use **bold**, bullet points, and blockquotes for clarity.
Give: distance, fair price, Kannada phrase, negotiation tip.

ONLY answer Bengaluru/travel questions. Be specific, actionable, encouraging!`;

// This endpoint provides the WebSocket URL and configuration for the Gemini Live API
// The actual WebSocket connection happens client-side

export async function GET() {
  return NextResponse.json({
    wsUrl: `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${GEMINI_API_KEY}`,
    model: "gemini-2.0-flash-live-001",
    config: {
      response_modalities: ["TEXT"],
      system_instruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }],
      },
    },
  });
}

// POST endpoint for text-based chat (fallback when WebSocket not available)
export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${SYSTEM_INSTRUCTION}\n\nUser: ${message}\n\nRespond with helpful, actionable advice using markdown formatting:`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 500,
            topP: 0.95,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API error:", errorData);
      return NextResponse.json(
        { error: "Failed to get AI response" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const aiText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't process that. Try again!";

    return NextResponse.json({ response: aiText });
  } catch (error) {
    console.error("Gemini Live API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
