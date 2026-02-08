import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { aj } from "../arcjet/route";
import fs from "fs";
import path from "path";

// Initialize Gemini AI
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
});

// Cache for embeddings and documents
let embeddingsCache: { text: string; embedding: number[]; metadata: any }[] = [];
let indiaDestinations: Set<string> = new Set();
let isInitialized = false;

/**
 * Document interface
 */
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

/**
 * Generate embeddings using Gemini 2.5 Flash
 */
async function generateGeminiEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];

    // Gemini embedding API processes one text at a time
    for (const text of texts) {
        try {
            const result = await ai.models.embedContent({
                model: "gemini-embedding-001",
                contents: {
                    parts: [{ text }]
                }
            });

            // Extract embedding values
            const embedding = result.embeddings?.[0]?.values || [];
            embeddings.push(embedding);
        } catch (error) {
            console.error("Error generating embedding:", error);
            // Return zero vector on error
            embeddings.push(new Array(768).fill(0));
        }
    }

    return embeddings;
}

/**
 * Generate single embedding using Gemini 2.5 Flash
 */
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

/**
 * Load and process India_travel.json dataset
 */
async function loadAndProcessDataset(): Promise<{
    documents: CityDocument[];
    destinations: Set<string>;
}> {
    const datasetPath = path.join(process.cwd(), "public", "India_travel.json");
    const rawData = fs.readFileSync(datasetPath, "utf-8");
    const indiaData = JSON.parse(rawData);

    const documents: CityDocument[] = [];
    const destinations = new Set<string>();

    // Process nested structure: State -> City -> Data
    for (const [state, cities] of Object.entries(indiaData)) {
        for (const [city, cityData] of Object.entries(cities as any)) {
            destinations.add(city.toLowerCase());
            destinations.add(state.toLowerCase());

            const data = cityData as any;

            // Create comprehensive text chunk for this city
            let chunkText = `Destination: ${city}, ${state}, India\n\n`;
            chunkText += `Budget: ${data.budget || "Not specified"}\n`;
            chunkText += `Total Estimated Budget: ${data.total_estimated_budget || "Not specified"}\n\n`;

            // Add itinerary details
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

            // Add additional context
            chunkText += `\n\nClimate: ${data.climate || "Not specified"}\n`;
            chunkText += `Local Foods: ${data.foods || "Not specified"}\n`;
            chunkText += `Travel Tips: ${data.travel_tips || "Not specified"}\n`;
            chunkText += `Local Transport: ${data.local_transport || "Not specified"}\n`;

            // Create document
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

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Initialize embeddings cache using Gemini
 */
async function initializeEmbeddings() {
    if (isInitialized) {
        return;
    }

    console.log("Initializing embeddings with Gemini 2.5 Flash...");
    const { documents, destinations } = await loadAndProcessDataset();
    indiaDestinations = destinations;

    // Generate embeddings for all documents using Gemini
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

/**
 * Retrieve top-k most relevant documents using Gemini embeddings
 */
async function retrieveRelevantDocs(
    query: string,
    k: number = 3
): Promise<{ text: string; metadata: any }[]> {
    // Generate embedding for query using Gemini
    const queryEmbedding = await generateGeminiEmbedding(query);

    // Calculate similarities
    const similarities = embeddingsCache.map((doc) => ({
        ...doc,
        similarity: cosineSimilarity(queryEmbedding, doc.embedding),
    }));

    // Sort by similarity and return top-k
    similarities.sort((a, b) => b.similarity - a.similarity);
    return similarities.slice(0, k).map((doc) => ({
        text: doc.text,
        metadata: doc.metadata,
    }));
}

/**
 * Validate if destination is in India
 */
function validateIndiaDestination(destination: string): boolean {
    const normalizedDest = destination.toLowerCase().trim();

    // Check if destination matches any city or state in our dataset
    for (const place of indiaDestinations) {
        if (normalizedDest.includes(place) || place.includes(normalizedDest)) {
            return true;
        }
    }

    // Additional keyword check for India
    if (normalizedDest.includes("india")) {
        return true;
    }

    return false;
}

/**
 * Construct RAG prompt with retrieved context
 */
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
7. If you cannot find enough information in the context, then add sufficient information from your knowledge base to make the itinerary realistic and comprehensive.

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

/**
 * Main POST handler for India RAG itinerary generation
 */
export async function POST(req: NextRequest) {
    try {
        const user = await currentUser();
        const { has } = await auth();

        // Check if user has premium access
        const hasPremiumAccess = has({ plan: "monthly" });

        // Parse request body
        const {
            destination,
            duration_days,
            budget,
            group_size,
            travel_style,
        } = await req.json();

        // Validate required fields
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

        // Initialize embeddings (lazy loading)
        await initializeEmbeddings();

        // Validate India destination
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

        // Rate limiting with Arcjet
        const decision = await aj.protect(req, {
            userId: user?.primaryEmailAddress?.emailAddress ?? "",
            requested: 5, // Treat as final generation
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

        // Retrieve relevant context
        const queryText = `${destination} ${travel_style || ""} ${duration_days} days ${budget} budget`;
        const relevantDocs = await retrieveRelevantDocs(queryText, 3);

        // Combine context from retrieved documents
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

        // Construct prompt with RAG context
        const prompt = constructPrompt(
            context,
            destination,
            duration_days,
            budget,
            group_size,
            travel_style
        );

        // Call Gemini AI with retry logic
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

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        let parsed;

        if (jsonMatch) {
            try {
                parsed = JSON.parse(jsonMatch[0]);

                // Ensure required fields are present
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

/**
 * Retry handler for Gemini API (503 errors)
 */
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
