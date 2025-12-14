import fs from 'fs';
import path from 'path';

export interface GeoCoordinates {
    latitude: number;
    longitude: number;
}

export interface Activity {
    place_name: string;
    place_details: string;
    geo_coordinates: GeoCoordinates;
    place_address: string;
    ticket_pricing: string;
    time_travel_each_location: string;
    best_time_to_visit: string;
}

export interface DayItinerary {
    best_time_to_visit_day: string;
    activities: Activity[];
}

export interface CityData {
    budget: string;
    total_estimated_budget: string;
    itinerary: DayItinerary[];
    climate: string;
    foods: string;
    travel_tips: string;
    local_transport: string;
}

export interface KBChunk {
    id: string;
    state: string;
    city: string;
    text: string;
    metadata: {
        budget: string;
        total_estimated_budget: string;
        climate: string;
        foods: string;
        travel_tips: string;
        local_transport: string;
    };
    data: CityData;
}

let cachedKB: KBChunk[] | null = null;

/**
 * Loads and chunks the India travel knowledge base
 * Each chunk represents a city with all its details
 */
export function loadKnowledgeBase(): KBChunk[] {
    if (cachedKB) {
        return cachedKB;
    }

    const kbPath = path.join(process.cwd(), 'public', 'India_travel.json');
    const rawData = fs.readFileSync(kbPath, 'utf-8');
    const kb = JSON.parse(rawData);

    const chunks: KBChunk[] = [];

    // Iterate through states and cities
    for (const [state, cities] of Object.entries(kb)) {
        for (const [city, cityData] of Object.entries(cities as Record<string, CityData>)) {
            // Create a comprehensive text representation for embedding
            const text = createCityText(state, city, cityData);

            chunks.push({
                id: `${state}-${city}`,
                state,
                city,
                text,
                metadata: {
                    budget: cityData.budget,
                    total_estimated_budget: cityData.total_estimated_budget,
                    climate: cityData.climate,
                    foods: cityData.foods,
                    travel_tips: cityData.travel_tips,
                    local_transport: cityData.local_transport,
                },
                data: cityData,
            });
        }
    }

    cachedKB = chunks;
    console.log(`✅ Loaded ${chunks.length} destinations from knowledge base`);
    return chunks;
}

/**
 * Creates a rich text representation of a city for embedding
 */
function createCityText(state: string, city: string, data: CityData): string {
    const parts: string[] = [];

    // Basic info
    parts.push(`Destination: ${city}, ${state}, India`);
    parts.push(`Budget: ${data.budget}`);
    parts.push(`Total Estimated Budget: ${data.total_estimated_budget}`);
    parts.push(`Climate: ${data.climate}`);
    parts.push(`Foods: ${data.foods}`);
    parts.push(`Travel Tips: ${data.travel_tips}`);
    parts.push(`Local Transport: ${data.local_transport}`);

    // Itinerary highlights
    parts.push('\nKey Attractions:');
    data.itinerary.forEach((day, idx) => {
        day.activities.forEach((activity) => {
            parts.push(
                `- ${activity.place_name}: ${activity.place_details} (${activity.ticket_pricing})`
            );
        });
    });

    return parts.join('\n');
}

/**
 * Find a city in the knowledge base (case-insensitive, fuzzy matching)
 */
export function findCityInKB(destination: string): KBChunk | null {
    const kb = loadKnowledgeBase();
    const normalizedDest = destination.toLowerCase().trim();

    // Exact match
    let match = kb.find(
        (chunk) =>
            chunk.city.toLowerCase() === normalizedDest ||
            chunk.state.toLowerCase() === normalizedDest
    );

    if (match) return match;

    // Partial match
    match = kb.find(
        (chunk) =>
            chunk.city.toLowerCase().includes(normalizedDest) ||
            normalizedDest.includes(chunk.city.toLowerCase()) ||
            chunk.state.toLowerCase().includes(normalizedDest) ||
            normalizedDest.includes(chunk.state.toLowerCase())
    );

    return match || null;
}
