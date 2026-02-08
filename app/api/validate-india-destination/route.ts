import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Initialize Gemini AI
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
});

/**
 * Validate if a destination is in India using Gemini Flash
 */
export async function POST(req: NextRequest) {
    try {
        const { destination } = await req.json();

        if (!destination || typeof destination !== 'string') {
            return NextResponse.json(
                { error: "invalid_input", message: "Destination is required" },
                { status: 400 }
            );
        }

        // Use Gemini to determine if destination is in India
        const prompt = `Is "${destination}" located in India?

You must answer with EXACTLY one word: either "YES" or "NO".

Examples:
- "Bangalore" → YES (it's in India)
- "Mumbai" → YES (it's in India)  
- "Goa" → YES (it's in India)
- "Paris" → NO (it's in France)
- "New York" → NO (it's in USA)

Rules:
- If it's a city, state, region, landmark, or tourist destination in India, answer YES
- If it's outside India, answer NO
- Common variations like "Bengaluru" (Bangalore) should be YES

Your answer (one word only):`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }],
                },
            ],
        });

        const text = (response as any).text ??
            response.candidates?.[0]?.content?.parts?.[0]?.text ??
            "NO";

        console.log(`[Validation] Destination: "${destination}" | Gemini response: "${text.trim()}"`);

        // More robust checking - look for YES anywhere in response
        const normalizedText = text.trim().toUpperCase();
        const isIndia = normalizedText.includes("YES") || normalizedText === "Y";

        return NextResponse.json({
            destination,
            is_india: isIndia,
            gemini_response: text.trim(), // Include for debugging
            message: isIndia
                ? "Valid India destination"
                : "This destination is not in India",
        });

    } catch (err: any) {
        console.error("Validation API error:", err?.message || err);
        return NextResponse.json(
            {
                error: "server_error",
                message: "Failed to validate destination",
            },
            { status: 500 }
        );
    }
}
