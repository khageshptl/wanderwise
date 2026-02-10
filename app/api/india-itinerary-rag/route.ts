import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { aj } from "../arcjet/route";
import fs from "fs";
import path from "path";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
});

let embeddingsCache: { text: string; embedding: number[]; metadata: any }[] = [];
let indiaDestinations: Set<string> = new Set();
let isInitialized = false;

interface CityDocument {
    text: string;
    metadata: {
        state: string;
        city: string;
        budget: string;
        total_estimated_budget: string;
        climate: string;
        itinerary_days: number;
    };
}

async function generateGeminiEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];

    for (const text of texts) {
        try {
            const result = await ai.models.embedContent({
                model: "gemini-embedding-001",
                contents: {
                    parts: [{ text }]
                }
            });

            const embedding = result.embeddings?.[0]?.values || [];
            embeddings.push(embedding);
        } catch (error) {
            console.error("Error generating embedding:", error);
            embeddings.push(new Array(768).fill(0));
        }
    }

    return embeddings;
}

async function generateGeminiEmbedding(text: string): Promise<number[]> {
    try {
        const result = await ai.models.embedContent({
            model: "gemini-embedding-001",
            contents: {
                parts: [{ text }]
            }
        });

        return result.embeddings?.[0]?.values || [];
    } catch (error) {
        console.error("Error generating embedding:", error);
        return new Array(768).fill(0);
    }
}

async function loadAndProcessDataset(): Promise<{
    documents: CityDocument[];
    destinations: Set<string>;
}> {
    const datasetPath = path.join(process.cwd(), "public", "India_travel.json");
    const rawData = fs.readFileSync(datasetPath, "utf-8");
    const indiaData = JSON.parse(rawData);

    const documents: CityDocument[] = [];
    const destinations = new Set<string>();

    for (const [state, cities] of Object.entries(indiaData)) {
        for (const [city, cityData] of Object.entries(cities as any)) {
            destinations.add(city.toLowerCase());
            destinations.add(state.toLowerCase());

            const data = cityData as any;

            let chunkText = `Destination: ${city}, ${state}, India\n\n`;
            chunkText += `Budget: ${data.budget || "Not specified"}\n`;
            chunkText += `Total Estimated Budget: ${data.total_estimated_budget || "Not specified"}\n\n`;

            if (data.itinerary && Array.isArray(data.itinerary)) {
                chunkText += `Itinerary (${data.itinerary.length} days):\n`;
                data.itinerary.forEach((day: any, idx: number) => {
                    chunkText += `\nDay ${idx + 1}: ${day.best_time_to_visit_day || ""}\n`;
                    if (day.activities && Array.isArray(day.activities)) {
                        day.activities.forEach((activity: any) => {
                            chunkText += `- ${activity.place_name}: ${activity.place_details}\n`;
                            chunkText += `  Address: ${activity.place_address}\n`;
                            chunkText += `  Pricing: ${activity.ticket_pricing}\n`;
                            chunkText += `  Duration: ${activity.time_travel_each_location}\n`;
                            chunkText += `  Best time: ${activity.best_time_to_visit}\n`;
                        });
                    }
                });
            }

            chunkText += `\n\nClimate: ${data.climate || "Not specified"}\n`;
            chunkText += `Local Foods: ${data.foods || "Not specified"}\n`;
            chunkText += `Travel Tips: ${data.travel_tips || "Not specified"}\n`;
            chunkText += `Local Transport: ${data.local_transport || "Not specified"}\n`;

            documents.push({
                text: chunkText,
                metadata: {
                    state,
                    city,
                    budget: data.budget || "",
                    total_estimated_budget: data.total_estimated_budget || "",
                    climate: data.climate || "",
                    itinerary_days: data.itinerary?.length || 0,
                },
            });
        }
    }

    return { documents, destinations };
}

function cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}

async function initializeEmbeddings() {
    if (isInitialized) {
        return;
    }

    console.log("Initializing embeddings with Gemini 2.5 Flash...");
    const { documents, destinations } = await loadAndProcessDataset();
    indiaDestinations = destinations;

    const texts = documents.map((doc) => doc.text);
    const embeddingVectors = await generateGeminiEmbeddings(texts);

    embeddingsCache = documents.map((doc, idx) => ({
        text: doc.text,
        embedding: embeddingVectors[idx],
        metadata: doc.metadata,
    }));

    isInitialized = true;
    console.log(`Embeddings initialized for ${embeddingsCache.length} cities using Gemini`);
}

async function retrieveRelevantDocs(
    query: string,
    k: number = 3
): Promise<{ text: string; metadata: any }[]> {
    const queryEmbedding = await generateGeminiEmbedding(query);

    const similarities = embeddingsCache.map((doc) => ({
        ...doc,
        similarity: cosineSimilarity(queryEmbedding, doc.embedding),
    }));

    similarities.sort((a, b) => b.similarity - a.similarity);
    return similarities.slice(0, k).map((doc) => ({
        text: doc.text,
        metadata: doc.metadata,
    }));
}

function validateIndiaDestination(destination: string): boolean {
    const normalizedDest = destination.toLowerCase().trim();

    for (const place of indiaDestinations) {
        if (normalizedDest.includes(place) || place.includes(normalizedDest)) {
            return true;
        }
    }

    if (normalizedDest.includes("india")) {
        return true;
    }

    return false;
}

function constructPrompt(
    context: string,
    destination: string,
    duration_days: number,
    budget: string,
    group_size: string,
    travel_style?: string
): string {
    return `You are an expert travel planner specializing in India tourism. Your task is to create a detailed travel itinerary based ONLY on the provided context from our India travel database.

**CONTEXT FROM DATABASE:**
${context}

**USER REQUEST:**
- Destination: ${destination}
- Duration: ${duration_days} days
- Budget: ${budget}
- Group Size: ${group_size}
- Travel Style: ${travel_style || "General sightseeing"}

**INSTRUCTIONS:**
1. Use ONLY the information from the context above
2. Create a realistic ${duration_days}-day itinerary
3. Respect the ${budget} budget constraint
4. Tailor activities for ${group_size} travelers
5. Include cultural tips specific to India
6. All prices must be in INR (Indian Rupees)
7. If you cannot find user given destination in the context, then just reply politely that you cannot find the destination in the context and ask them to try another Indian city. Do NOT attempt to generate an itinerary without relevant context.
8. If you find the user given destination in the context but cannot find enough information in the context, then add sufficient information from your knowledge base to make the itinerary realistic and comprehensive.

**CRITICAL: You MUST respond with ONLY valid JSON in this exact format:**

{
  "plan_type": "free",
  "country": "India",
  "trip_summary": {
    "destination": "${destination}",
    "duration_days": ${duration_days},
    "best_time_to_visit": "Based on context",
    "travel_style": "${travel_style || "General"}"
  },
  "itinerary": [
    {
      "day": 1,
      "title": "Day title",
      "activities": ["Activity 1", "Activity 2"],
      "local_transport": "Transport info",
      "food_suggestions": ["Food 1", "Food 2"]
    }
  ],
  "estimated_budget": {
    "currency": "INR",
    "range": "₹X,XXX - ₹Y,YYY"
  },
  "notes": [
    "India-specific cultural tip 1",
    "India-specific cultural tip 2"
  ]
}

**IMPORTANT:** Return ONLY the JSON object, no explanations, no markdown, no extra text.`;
}

export async function POST(req: NextRequest) {
    try {
        const user = await currentUser();
        const { has } = await auth();

        const hasPremiumAccess = has({ plan: "monthly" });

        const {
            destination,
            duration_days,
            budget,
            group_size,
            travel_style,
        } = await req.json();

        if (!destination || !duration_days || !budget || !group_size) {
            return NextResponse.json(
                {
                    error: "missing_fields",
                    message:
                        "Please provide destination, duration_days, budget, and group_size",
                },
                { status: 400 }
            );
        }

        await initializeEmbeddings();

        if (!validateIndiaDestination(destination)) {
            return NextResponse.json(
                {
                    error: "india_only",
                    message:
                        "This feature is only available for India destinations. Please upgrade to Pro for global itineraries.",
                    upgrade_link: "/pricing",
                },
                { status: 400 }
            );
        }

        const decision = await aj.protect(req, {
            userId: user?.primaryEmailAddress?.emailAddress ?? "",
            requested: 5, 
        });

        // @ts-ignore
        if (decision?.reason?.remaining == 0 && !hasPremiumAccess) {
            return NextResponse.json(
                {
                    error: "rate_limit",
                    message:
                        "No free credits remaining. Please upgrade to Pro for unlimited itineraries.",
                    upgrade_link: "/pricing",
                },
                { status: 429 }
            );
        }

        const queryText = `${destination} ${travel_style || ""} ${duration_days} days ${budget} budget`;
        const relevantDocs = await retrieveRelevantDocs(queryText, 3);

        const context = relevantDocs
            .map((doc, idx) => `\n--- City ${idx + 1} ---\n${doc.text}`)
            .join("\n");

        if (!context || context.trim().length === 0) {
            return NextResponse.json(
                {
                    error: "no_context",
                    message:
                        "Could not find relevant information for this destination. Please try another Indian city.",
                },
                { status: 404 }
            );
        }

        const prompt = constructPrompt(
            context,
            destination,
            duration_days,
            budget,
            group_size,
            travel_style
        );

        const response = await retryGeminiRequest(() =>
            ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [
                    {
                        role: "user",
                        parts: [{ text: prompt }],
                    },
                ],
            })
        );

        let text =
            (response as any).text ??
            response.candidates?.[0]?.content?.parts?.[0]?.text ??
            "No text returned";

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        let parsed;

        if (jsonMatch) {
            try {
                parsed = JSON.parse(jsonMatch[0]);

                if (!parsed.plan_type) parsed.plan_type = "free";
                if (!parsed.country) parsed.country = "India";
            } catch (parseError) {
                console.error("JSON parse error:", parseError);
                return NextResponse.json(
                    {
                        error: "invalid_response",
                        message: "Failed to generate valid itinerary. Please try again.",
                    },
                    { status: 500 }
                );
            }
        } else {
            return NextResponse.json(
                {
                    error: "invalid_response",
                    message: "Failed to generate valid itinerary. Please try again.",
                },
                { status: 500 }
            );
        }

        return NextResponse.json(parsed);
    } catch (err: any) {
        console.error("India RAG API error:", err?.message || err);
        return NextResponse.json(
            {
                error: "server_error",
                message: "Something went wrong. Please try again later.",
            },
            { status: 500 }
        );
    }
}

async function retryGeminiRequest(requestFn: any, retries = 4, delay = 600) {
    try {
        return await requestFn();
    } catch (err: any) {
        const status = err?.response?.status || err?.status;

        if (status === 503 && retries > 0) {
            console.log(`Gemini overloaded — retrying... (${retries} retries left)`);
            await new Promise((res) => setTimeout(res, delay));
            return retryGeminiRequest(requestFn, retries - 1, delay * 1.6);
        }
        throw err;
    }
}
