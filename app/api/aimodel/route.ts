// import { GoogleGenAI } from "@google/genai";
// import { NextRequest, NextResponse } from "next/server";

// const ai = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY!,
// });

// const PROMPT = `You are an AI Trip Planner Agent. Your goal is to help the user plan a trip by **asking one relevant trip-related question at a time**.

//  Only ask questions about the following details in order, and wait for the user's answer before asking the next: 
//  and for asking always ask in json format as shown below

//  {
//   "resp": "<the message to show the user>",
//   "ui": "groupSize | budget | tripDuration | final | source | destination"
//  }

// 1. Starting location (source) 
// 2. Destination city or country 
// 3. Group size (Solo, Couple, Family, Friends) 
// 4. Budget (Low, Medium, High) 
// 5. Trip duration (number of days)

// Do not ask multiple questions at once, and never ask irrelevant questions.
// If any answer is missing or unclear, politely ask the user to clarify before proceeding.
// Always maintain a conversational, interactive style while asking questions.
// Along wth response also send which ui component to display for generative UI for example 'budget/groupSize/tripDuration/final) , where final means AI generating complete final output

// Once all required information is collected, 
// IMPORTANT — ALWAYS respond ONLY in valid JSON.
// No explanation, no markdown, no extra text outside JSON.

// If your response is not valid JSON, the system will break.
// So you MUST ALWAYS return valid JSON and follow exactly this format:
// {
//   "resp": "<the message to show the user>",
//   "ui": "<one of: groupSize | budget | tripDuration | final | source | destination>"
// }
// }`;

// const FINAL_PROMPT = `Generate Travel Plan with give details, give me Hotels options list with HotelName, 
// Hotel address, Price(should be in INR), hotel image url, geo coordinates, rating, descriptions and  suggest itinerary with placeName, Place Details, Place Image Url,
//  Geo Coordinates,Place address, ticket Pricing, Time travel each of the location , with each day plan with best time to visit in JSON format.
//  Output Schema:
//  {
//   "trip_plan": {
//     "destination": "string",
//     "duration": "string",
//     "origin": "string",
//     "budget": "string",
//     "group_size": "string",
//     "hotels": [
//       {
//         "hotel_name": "string",
//         "hotel_address": "string",
//         "price_per_night": "string",
//         "hotel_image_url": "string",
//         "geo_coordinates": {
//           "latitude": "number",
//           "longitude": "number"
//         },
//         "rating": "number",
//         "description": "string"
//       }
//     ],
//     "itinerary": [
//       {
//         "day": "number",
//         "day_plan": "string",
//         "best_time_to_visit_day": "string",
//         "activities": [
//           {
//             "place_name": "string",
//             "place_details": "string",
//             "place_image_url": "string",
//             "geo_coordinates": {
//               "latitude": "number",
//               "longitude": "number"
//             },
//             "place_address": "string",
//             "ticket_pricing": "string",
//             "time_travel_each_location": "string",
//             "best_time_to_visit": "string"
//           }
//         ]
//       }
//     ]
//   }
// }
// `;


// export async function POST(req: NextRequest) {
//   try {
//     const { messages, isFinal } = await req.json();

//     const formattedMessages = [
//       {
//         role: "user",
//         parts: [{ text: isFinal ? FINAL_PROMPT : PROMPT }],
//       },
//       ...(messages || []).map((msg: any) => ({
//         role: msg.role === "assistant" ? "model" : "user",
//         parts: [{ text: msg.content }],
//         // parts: [{ text: JSON.stringify({ user_message: msg.content }) }]

//       })),
//     ];

//     const response = await ai.models.generateContent({
//       model: "gemini-2.5-flash",
//       // model: "gemini-2.0-flash-lite",
//       contents: formattedMessages,
//     });

//     let text =
//       (response as any).text ??
//       response.candidates?.[0]?.content?.parts?.[0]?.text ??
//       "No text returned";

//     console.log("AI raw output", text);

//     const jsonMatch = text.match(/\{[\s\S]*\}/);
//     let parsed;

//     if (jsonMatch) {
//       try {
//         parsed = JSON.parse(jsonMatch[0]);
//       } catch {
//         parsed = { resp: text.trim() || "Sorry, please clarify.", ui: "Final" };
//       }
//     } else {
//       parsed = { resp: text.trim() || "Sorry, please clarify.", ui: "Final" };
//     }

//     return NextResponse.json(parsed);

//   } catch (err: any) {
//     console.error("Gemini error:", err?.response?.data || err?.message || err);
//     return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
//   }
// }



// 6. Travel interests (e.g., adventure, sightseeing, cultural, food, nightlife, relaxation)
// 7. Special requirements or preferences(if any)

// generate and return a ** strict JSON response only ** (no explanations or extra text) with following JSON schema:

// {
//   resp: 'Text Resp',
//     ui: 'budget/groupSize/tripDuration/final)'
// }



import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { aj } from "../arcjet/route";
import { auth, currentUser } from "@clerk/nextjs/server";
import { generateTripPlanFromKB } from "@/lib/kbGenerator";
import { generateTripPlanWithRAG } from "@/lib/planner";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

// Added minimal retry handler (nothing else modified)
async function retryGeminiRequest(requestFn: any, retries = 4, delay = 600) {
  try {
    return await requestFn();
  } catch (err: any) {
    const status = err?.response?.status || err?.status;

    if (status === 503 && retries > 0) {
      console.log(`Gemini overloaded — retrying... (${retries} retries left)`);
      await new Promise(res => setTimeout(res, delay));
      return retryGeminiRequest(requestFn, retries - 1, delay * 1.6);
    }
    throw err;
  }
}

/**
 * Extracts trip details from conversation history
 */
function extractTripDetailsFromMessages(messages: any[]): {
  destination: string;
  origin: string;
  groupSize: string;
  budget: string;
  duration: string;
} {
  const details = {
    destination: '',
    origin: '',
    groupSize: '',
    budget: '',
    duration: '',
  };

  // Parse messages to extract trip details
  messages.forEach((msg) => {
    if (msg.role === 'user') {
      const content = msg.content.toLowerCase();

      // Extract destination (look for city/country names)
      if (content.includes('destination') || content.includes('going to') || content.includes('visit')) {
        const match = msg.content.match(/(?:destination|going to|visit)\s*:?\s*([a-zA-Z\s]+)/i);
        if (match) details.destination = match[1].trim();
      } else if (!details.destination && msg.content.length < 50 && /^[a-zA-Z\s]+$/.test(msg.content)) {
        // Likely a destination name
        details.destination = msg.content.trim();
      }

      // Extract origin
      if (content.includes('from') || content.includes('origin') || content.includes('starting')) {
        const match = msg.content.match(/(?:from|origin|starting)\s*:?\s*([a-zA-Z\s]+)/i);
        if (match) details.origin = match[1].trim();
      }

      // Extract group size
      if (content.includes('solo') || content.includes('alone')) {
        details.groupSize = 'Solo';
      } else if (content.includes('couple') || content.includes('two')) {
        details.groupSize = 'Couple';
      } else if (content.includes('family')) {
        details.groupSize = 'Family';
      } else if (content.includes('friends') || content.includes('group')) {
        details.groupSize = 'Friends';
      }

      // Extract budget
      if (content.includes('low budget') || content.includes('cheap') || content.includes('budget')) {
        details.budget = 'Low';
      } else if (content.includes('medium') || content.includes('moderate')) {
        details.budget = 'Medium';
      } else if (content.includes('high') || content.includes('luxury') || content.includes('premium')) {
        details.budget = 'High';
      }

      // Extract duration
      const durationMatch = msg.content.match(/(\d+)\s*(?:day|days)/i);
      if (durationMatch) {
        details.duration = durationMatch[1];
      }
    }
  });

  return details;
}

const FREE_TIER_PROMPT = `You are an AI Trip Planner Agent for WanderWise. Your goal is to help the user plan a trip by **asking one relevant trip-related question at a time**. 

**IMPORTANT: Free tier users can ONLY plan trips within India. If a user enters a destination outside India, politely inform them and ask them to choose an Indian destination.**

Only ask questions about the following details in order, and wait for the user's answer before asking the next: 
1. Starting location (source) 
2. Destination city or country **WITHIN INDIA ONLY**
   - If the user provides a destination outside India (e.g., Paris, Tokyo, New York, Dubai, etc.), respond with:
     "I'm sorry, but the free plan only supports trip planning within India. Please choose a destination within India (e.g., Goa, Jaipur, Kerala, Himachal Pradesh, etc.)."
   - Then ask them to provide an Indian destination.
   - Only proceed to the next question once they provide a valid Indian destination.
3. Group size (Solo, Couple, Family, Friends) 
4. Budget (Low, Medium, High) 
5. Trip duration (number of days) 

**Validation Rules:**
- Carefully check if the destination is in India before proceeding
- Common Indian destinations include: Goa, Jaipur, Kerala, Mumbai, Delhi, Bangalore, Amritsar, Varanasi, Udaipur, Manali, Shimla, Rishikesh, Agra, Chennai, Hyderabad, Kolkata, etc.
- If unsure whether a destination is in India, ask the user to confirm or suggest popular Indian alternatives

Do not ask multiple questions at once, and never ask irrelevant questions. 
If any answer is missing or unclear, politely ask the user to clarify before proceeding. 
Always maintain a conversational, interactive style while asking questions.`;


const PROMPT = `You are an AI Trip Planner Agent. Your goal is to help the user plan a trip by **asking one relevant trip-related question at a time**.

 Only ask questions about the following details in order, and wait for the user's answer before asking the next: 
 and for asking always ask in json format as shown below

 {
  "resp": "<the message to show the user>",
  "ui": "groupSize | budget | tripDuration | final | source | destination"
 }

1. Starting location (source) 
2. Destination city or country 
3. Group size (Solo, Couple, Family, Friends) 
4. Budget (Low, Medium, High) 
5. Trip duration (number of days)

Do not ask multiple questions at once, and never ask irrelevant questions.
If any answer is missing or unclear, politely ask the user to clarify before proceeding.
Always maintain a conversational, interactive style while asking questions.
Along wth response also send which ui component to display for generative UI for example 'budget/groupSize/tripDuration/final) , where final means AI generating complete final output

Once all required information is collected, 
IMPORTANT — ALWAYS respond ONLY in valid JSON.
No explanation, no markdown, no extra text outside JSON.

If your response is not valid JSON, the system will break.
So you MUST ALWAYS return valid JSON and follow exactly this format:
{
  "resp": "<the message to show the user>",
  "ui": "<one of: groupSize | budget | tripDuration | final | source | destination>"
}
}`;

const FINAL_PROMPT = `Generate Travel Plan with give details, give me Hotels options list with HotelName, 
Hotel address, Price(should be in INR), hotel image url, geo coordinates, rating, descriptions and  suggest itinerary with placeName, Place Details, Place Image Url,
 Geo Coordinates,Place address, ticket Pricing, Time travel each of the location , with each day plan with best time to visit in JSON format.
 Also provide a total estimated budget for the entire trip (excluding flights) in INR as a range (e.g. "INR 15000 - 20000").
 Output Schema:
 {
  "trip_plan": {
    "destination": "string",
    "duration": "string",
    "origin": "string",
    "budget": "string",
    "group_size": "string",
    "total_estimated_budget": "string",
    "hotels": [
      {
        "hotel_name": "string",
        "hotel_address": "string",
        "price_per_night": "string",
        "hotel_image_url": "string",
        "geo_coordinates": {
          "latitude": "number",
          "longitude": "number"
        },
        "rating": "number",
        "description": "string"
      }
    ],
    "itinerary": [
      {
        "day": "number",
        "day_plan": "string",
        "best_time_to_visit_day": "string",
        "activities": [
          {
            "place_name": "string",
            "place_details": "string",
            "place_image_url": "string",
            "geo_coordinates": {
              "latitude": "number",
              "longitude": "number"
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
}
`;

export async function POST(req: NextRequest) {

  const { messages, isFinal } = await req.json();

  const user = await currentUser();

  const { has } = await auth();

  const hasPremiumAccess = has({ plan: 'monthly' });

  console.log('hasPremiumAccess', hasPremiumAccess);

  const decision = await aj.protect(req, { userId: user?.primaryEmailAddress?.emailAddress ?? '', requested: isFinal ? 5 : 0 });

  // @ts-ignore
  if (decision?.reason?.remaining == 0 && !hasPremiumAccess) {
    return NextResponse.json({
      resp: 'No Free Credits Remaining',
      ui: 'limit'
    })
  }

  try {
    // If this is the final trip generation
    if (isFinal) {
      console.log('🎯 Final trip generation');

      // Extract trip details from conversation history
      const tripDetails = extractTripDetailsFromMessages(messages);

      if (!tripDetails.destination || !tripDetails.origin || !tripDetails.duration) {
        return NextResponse.json({
          resp: 'Missing required trip details. Please provide destination, origin, and duration.',
          ui: 'error'
        });
      }

      // Free users: Use KB-only generation (no AI, no storage)
      if (!hasPremiumAccess) {
        console.log('📚 Free user - using KB-only generation');
        const result = generateTripPlanFromKB(tripDetails);

        // Handle error responses (e.g., destination not in KB)
        if (result.error) {
          return NextResponse.json({
            resp: result.message,
            ui: 'error'
          });
        }

        // Return the trip plan (not stored)
        return NextResponse.json(result);
      }

      // Premium users: Use Gemini API with RAG
      console.log('🤖 Premium user - using Gemini API with RAG');
      const result = await generateTripPlanWithRAG({
        isPremium: true,
        tripDetails,
      });

      // Handle error responses
      if (result.error) {
        return NextResponse.json({
          resp: result.message,
          ui: 'error'
        });
      }

      // Return the trip plan
      return NextResponse.json(result);
    }

    // Otherwise, continue with conversational flow
    // Use different prompts based on user tier
    const promptToUse = hasPremiumAccess ? PROMPT : FREE_TIER_PROMPT;

    const formattedMessages = [
      {
        role: "user",
        parts: [{ text: promptToUse }],
      },
      ...(messages || []).map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
    ];

    const response = await retryGeminiRequest(() =>
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        // model: "gemini-2.5-flash-lite",
        contents: formattedMessages,
      })
    );

    let text =
      (response as any).text ??
      response.candidates?.[0]?.content?.parts?.[0]?.text ??
      "No text returned";

    // console.log("AI raw output", text);

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
