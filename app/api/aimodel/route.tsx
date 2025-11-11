// import { GoogleGenAI } from "@google/genai";
// import { NextRequest, NextResponse } from "next/server";

// const ai = new GoogleGenAI({
//     apiKey: process.env.GEMINI_API_KEY!,
// });

// export async function POST(req: NextRequest) {
//     try {
//         const { messages } = await req.json();

//         const PROMPT = `You are an AI Trip Planner Agent. Your goal is to help the user plan a trip by **asking one relevant trip-related question at a time**.

//   Only ask questions about the following details in order, and wait for the user's answer before asking the next: 

//  1. Starting location (source) 
//  2. Destination city or country 
//  3. Group size (Solo, Couple, Family, Friends) 
//  4. Budget (Low, Medium, High) 
//  5. Trip duration (number of days) 
//  6. Travel interests (e.g., adventure, sightseeing, cultural, food, nightlife, relaxation) 
//  7. Special requirements or preferences (if any)
//  Do not ask multiple questions at once, and never ask irrelevant questions.
//  If any answer is missing or unclear, politely ask the user to clarify before proceeding.
//  Always maintain a conversational, interactive style while asking questions.
//  Along wth response also send which ui component to display for generative UI for example 'budget/groupSize/TripDuration/Final) , where Final means AI generating complete final output
//  Once all required information is collected, generate and return a **strict JSON response only** (no explanations or extra text) with following JSON schema:
//  {
//  resp:'Text Resp',
//  ui:'budget/groupSize/TripDuration/Final)'
//  }`;

//         const formattedMessages = [
//             {
//                 role: "user", // acts as the system prompt
//                 parts: [{ text: PROMPT }],
//             },
//             ...(messages || []).map((msg: any) => ({
//                 role: msg.role === "assistant" ? "model" : "user",
//                 parts: [{ text: msg.content }],
//             })),
//         ];

//         const response = await ai.models.generateContent({
//             model: "gemini-2.5-flash",
//             contents: formattedMessages,
//         });

//         const text = (response as any).text ?? response.candidates?.[0]?.content?.parts?.[0]?.text ?? "No text returned";

//         let parsed;
//         try {
//             parsed = JSON.parse(text);
//         } catch {
//             parsed = { resp: text.trim() || "Sorry, please clarify.", ui: "Final" };
//         }

//         return NextResponse.json(parsed);

//     } catch (err: any) {
//         console.error("Gemini error:", err?.response?.data || err?.message || err);
//         return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
//     }

// }


import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();

        const PROMPT = `You are an AI Trip Planner Agent. Your goal is to help the user plan a trip by **asking one relevant trip-related question at a time**.

Only ask questions about the following details in order, and wait for the user's answer before asking the next:

1. Starting location (source)
2. Destination city or country
3. Group size (Solo, Couple, Family, Friends)
4. Budget (Low, Medium, High)
5. Trip duration (number of days)
6. Travel interests (e.g., adventure, sightseeing, cultural, food, nightlife, relaxation)
7. Special requirements or preferences (if any)

Do not ask multiple questions at once, and never ask irrelevant questions.
If any answer is missing or unclear, politely ask the user to clarify before proceeding.
Always maintain a conversational, interactive style while asking questions.
Along with each response also send which UI component to display for generative UI for example 'budget/groupSize/tripDuration/final', where 'Final' means AI generating complete final output.
Once all required information is collected, generate and return a **strict JSON response only** (no explanations or extra text) with the following JSON schema:
{
  "resp": "Text Resp",
  "ui": "budget/groupSize/tripDuration/final"
}`;

        const formattedMessages = [
            {
                role: "user", 
                parts: [{ text: PROMPT }],
            },
            ...(messages || []).map((msg: any) => ({
                role: msg.role === "assistant" ? "model" : "user",
                parts: [{ text: msg.content }],
            })),
        ];

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: formattedMessages,
        });

        let text =
            (response as any).text ??
            response.candidates?.[0]?.content?.parts?.[0]?.text ??
            "No text returned";

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        let parsed;

        if (jsonMatch) {
            try {
                parsed = JSON.parse(jsonMatch[0]);
            } catch {
                parsed = { resp: text.trim() || "Sorry, please clarify.", ui: "Final" };
            }
        } else {
            parsed = { resp: text.trim() || "Sorry, please clarify.", ui: "Final" };
        }

        return NextResponse.json(parsed);
    } catch (err: any) {
        console.error("Gemini error:", err?.response?.data || err?.message || err);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
