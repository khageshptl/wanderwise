import { GoogleGenAI } from '@google/genai';
import { findCityInKB } from './loadKB';
import { vectorSearch, formatContextForRAG } from './vectorSearch';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export interface TripDetails {
  destination: string;
  origin: string;
  groupSize: string;
  budget: string;
  duration: string;
}

export interface PlannerOptions {
  isPremium: boolean;
  tripDetails: TripDetails;
  conversationHistory?: Array<{ role: string; content: string }>;
}

/**
 * Main RAG planner that orchestrates retrieval and generation
 */
export async function generateTripPlanWithRAG(
  options: PlannerOptions
): Promise<any> {
  const { isPremium, tripDetails } = options;
  const { destination, origin, groupSize, budget, duration } = tripDetails;

  console.log('🧠 RAG Planner invoked:', { destination, isPremium });

  // Step 1: Check if destination is in KB
  const cityMatch = findCityInKB(destination);

  // Step 2: Free user validation
  if (!isPremium && !cityMatch) {
    console.log('❌ Free user requested non-KB destination:', destination);
    return {
      error: true,
      message: `Sorry, "${destination}" is not available on the free plan. Please upgrade to premium or choose from our available destinations in India.`,
    };
  }

  // Step 3: Retrieve relevant context
  let context = '';
  let useRAG = false;

  if (cityMatch) {
    // Direct match - use exact KB data
    console.log('✅ Exact match found in KB:', cityMatch.city);
    context = formatContextForRAG([cityMatch]);
    useRAG = true;
  } else if (isPremium) {
    // Premium user - try vector search for similar destinations
    console.log('🔍 Premium user - performing vector search...');
    try {
      const results = await vectorSearch(
        `${destination} travel itinerary budget hotels attractions`,
        3
      );

      if (results.length > 0 && results[0].score > 0.5) {
        context = formatContextForRAG(results);
        useRAG = true;
        console.log('✅ Using vector search results for context');
      } else {
        console.log('⚠️ Low similarity - falling back to Gemini general knowledge');
      }
    } catch (error) {
      console.error('❌ Vector search failed:', error);
      // Fall back to general Gemini knowledge
    }
  }

  // Step 4: Construct RAG-enhanced prompt
  const prompt = useRAG
    ? constructRAGPrompt(tripDetails, context)
    : constructFallbackPrompt(tripDetails);

  // Step 5: Generate with Gemini
  console.log('🤖 Generating trip plan with Gemini...');
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite',
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
  });

  let text =
    (response as any).text ??
    response.candidates?.[0]?.content?.parts?.[0]?.text ??
    'No text returned';

  // Step 6: Parse JSON response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  let parsed;

  if (jsonMatch) {
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      console.error('❌ Failed to parse Gemini JSON response');
      throw new Error('Failed to parse trip plan response');
    }
  } else {
    console.error('❌ No JSON found in Gemini response');
    throw new Error('Invalid response format from AI');
  }

  console.log('✅ Trip plan generated successfully');
  return parsed;
}

/**
 * Constructs a RAG-enhanced prompt with KB context
 */
function constructRAGPrompt(tripDetails: TripDetails, context: string): string {
  return `You are an AI Trip Planner for WanderWise, specializing in Indian travel destinations.

**IMPORTANT: Use ONLY the knowledge base information provided below to generate the trip plan. Do NOT make up hotels, places, or prices.**

=== KNOWLEDGE BASE CONTEXT ===
${context}
=== END KNOWLEDGE BASE ===

User Trip Requirements:
- Destination: ${tripDetails.destination}
- Origin: ${tripDetails.origin}
- Group Size: ${tripDetails.groupSize}
- Budget: ${tripDetails.budget}
- Duration: ${tripDetails.duration} days

**Instructions:**
1. Use the exact hotels, places, prices, and details from the knowledge base above
2. Match the trip duration to the user's requested ${tripDetails.duration} days
3. Adjust the itinerary to fit the user's budget preference (${tripDetails.budget})
4. Use the exact geo-coordinates, addresses, and pricing from the KB
5. Include the total estimated budget from the KB
6. Maintain the same JSON structure as shown in the schema below

**CRITICAL: Return ONLY valid JSON. No explanations, no markdown, no extra text.**

Output Schema:
{
  "trip_plan": {
    "destination": "string",
    "duration": "string",
    "origin": "string",
    "budget": "string",
    "group_size": "string",
    "total_estimated_budget": "string (from KB)",
    "hotels": [
      {
        "hotel_name": "string",
        "hotel_address": "string",
        "price_per_night": "string",
        "hotel_image_url": "string",
        "geo_coordinates": {
          "latitude": number,
          "longitude": number
        },
        "rating": number,
        "description": "string"
      }
    ],
    "itinerary": [
      {
        "day": number,
        "day_plan": "string",
        "best_time_to_visit_day": "string",
        "activities": [
          {
            "place_name": "string (from KB)",
            "place_details": "string (from KB)",
            "place_image_url": "string",
            "geo_coordinates": {
              "latitude": number (from KB),
              "longitude": number (from KB)
            },
            "place_address": "string (from KB)",
            "ticket_pricing": "string (from KB)",
            "time_travel_each_location": "string (from KB)",
            "best_time_to_visit": "string (from KB)"
          }
        ]
      }
    ]
  }
}`;
}

/**
 * Constructs a fallback prompt for premium users (non-KB destinations)
 */
function constructFallbackPrompt(tripDetails: TripDetails): string {
  return `You are an AI Trip Planner for WanderWise. Generate a comprehensive travel plan for the following trip:

- Destination: ${tripDetails.destination}
- Origin: ${tripDetails.origin}
- Group Size: ${tripDetails.groupSize}
- Budget: ${tripDetails.budget}
- Duration: ${tripDetails.duration} days

Provide realistic hotels with addresses, prices in INR, and ratings. Include a detailed day-by-day itinerary with places to visit, addresses, ticket prices, and geo-coordinates.

**CRITICAL: Return ONLY valid JSON. No explanations, no markdown, no extra text.**

Output Schema:
{
  "trip_plan": {
    "destination": "string",
    "duration": "string",
    "origin": "string",
    "budget": "string",
    "group_size": "string",
    "total_estimated_budget": "string (estimate in INR)",
    "hotels": [
      {
        "hotel_name": "string",
        "hotel_address": "string",
        "price_per_night": "string",
        "hotel_image_url": "string",
        "geo_coordinates": {
          "latitude": number,
          "longitude": number
        },
        "rating": number,
        "description": "string"
      }
    ],
    "itinerary": [
      {
        "day": number,
        "day_plan": "string",
        "best_time_to_visit_day": "string",
        "activities": [
          {
            "place_name": "string",
            "place_details": "string",
            "place_image_url": "string",
            "geo_coordinates": {
              "latitude": number,
              "longitude": number
            },
            "place_address": "string",
            "ticket_pricing": "string",
            "time_travel_each_location": "string",
            "best_time_to_visit": "string"
          }
        ]
      }
    ]
  }
}`;
}
