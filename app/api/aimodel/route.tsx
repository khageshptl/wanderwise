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
 Output Schema:
 {
  "trip_plan": {
    "destination": "string",
    "duration": "string",
    "origin": "string",
    "budget": "string",
    "group_size": "string",
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

  // const decision = await aj.protect(req, { userId: user?.primaryEmailAddress?.emailAddress ?? '', requested: isFinal ? 5 : 0 });

  // // @ts-ignore
  // if (decision?.reason?.remaining == 0 && !hasPremiumAccess) {
  //   return NextResponse.json({
  //     resp: 'No Free Credits Remaining',
  //     ui: 'limit'
  //   })
  // }

  try {

    const formattedMessages = [
      {
        role: "user",
        parts: [{ text: isFinal ? FINAL_PROMPT : PROMPT }],
      },
      ...(messages || []).map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
    ];

    // 🔥 Wrapped ONLY this call with retry handler
    const response = await retryGeminiRequest(() =>
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        // model: "gemini-2.0-flash-lite",
        contents: formattedMessages,
      })
    );

    let text =
      (response as any).text ??
      response.candidates?.[0]?.content?.parts?.[0]?.text ??
      "No text returned";

    console.log("AI raw output", text);

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
