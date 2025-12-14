import { findCityInKB, KBChunk } from './loadKB';

export interface TripDetails {
    destination: string;
    origin: string;
    groupSize: string;
    budget: string;
    duration: string;
}

/**
 * Generates trip plan directly from knowledge base (no AI generation)
 * Used for free tier users
 */
export function generateTripPlanFromKB(tripDetails: TripDetails): any {
    const { destination, origin, groupSize, budget, duration } = tripDetails;

    console.log('📚 Generating trip plan from KB:', { destination });

    // Find destination in KB
    const cityMatch = findCityInKB(destination);

    if (!cityMatch) {
        console.log('❌ Destination not found in KB:', destination);
        return {
            error: true,
            message: `Sorry, "${destination}" is not available on the free plan. Please upgrade to premium or choose from our available destinations in India.`,
        };
    }

    console.log('✅ Found destination in KB:', cityMatch.city);

    // Extract KB data
    const kbData = cityMatch.data;
    const durationNum = parseInt(duration) || 5;

    // Select itinerary days based on requested duration
    const selectedDays = kbData.itinerary.slice(0, durationNum);

    // Format itinerary with day numbers
    const formattedItinerary = selectedDays.map((day, index) => ({
        day: index + 1,
        day_plan: `Day ${index + 1} in ${cityMatch.city}`,
        best_time_to_visit_day: day.best_time_to_visit_day,
        activities: day.activities.map((activity) => ({
            place_name: activity.place_name,
            place_details: activity.place_details,
            place_image_url: '', // KB doesn't have images
            geo_coordinates: activity.geo_coordinates,
            place_address: activity.place_address,
            ticket_pricing: activity.ticket_pricing,
            time_travel_each_location: activity.time_travel_each_location,
            best_time_to_visit: activity.best_time_to_visit,
        })),
    }));

    // Generate hotel suggestions based on budget
    const hotels = generateHotelSuggestions(cityMatch, budget);

    // Build trip plan response
    const tripPlan = {
        trip_plan: {
            destination: cityMatch.city,
            duration: `${durationNum} days`,
            origin: origin,
            budget: budget,
            group_size: groupSize,
            total_estimated_budget: kbData.total_estimated_budget,
            climate: kbData.climate,
            foods: kbData.foods,
            travel_tips: kbData.travel_tips,
            local_transport: kbData.local_transport,
            hotels: hotels,
            itinerary: formattedItinerary,
        },
    };

    console.log('✅ Trip plan generated from KB successfully');
    return tripPlan;
}

/**
 * Generates hotel suggestions based on budget tier
 */
function generateHotelSuggestions(cityData: KBChunk, budget: string): any[] {
    const { city, state } = cityData;

    // Generate 3 hotel suggestions based on budget
    const budgetRanges = {
        Low: { min: 800, max: 1500, rating: 3 },
        Medium: { min: 1500, max: 3500, rating: 3.5 },
        High: { min: 3500, max: 8000, rating: 4.5 },
    };

    const range = budgetRanges[budget as keyof typeof budgetRanges] || budgetRanges.Medium;

    // Get first activity coordinates for hotel location reference
    const firstActivity = cityData.data.itinerary[0]?.activities[0];
    const baseLat = firstActivity?.geo_coordinates.latitude || 0;
    const baseLng = firstActivity?.geo_coordinates.longitude || 0;

    return [
        {
            hotel_name: `${city} ${budget} Budget Hotel`,
            hotel_address: `Near City Center, ${city}, ${state}`,
            price_per_night: `₹${range.min} - ₹${Math.floor((range.min + range.max) / 2)}`,
            hotel_image_url: '',
            geo_coordinates: {
                latitude: baseLat + 0.01,
                longitude: baseLng + 0.01,
            },
            rating: range.rating,
            description: `Comfortable ${budget.toLowerCase()} budget accommodation in ${city} with modern amenities.`,
        },
        {
            hotel_name: `${city} Central Inn`,
            hotel_address: `Main Market Area, ${city}, ${state}`,
            price_per_night: `₹${Math.floor((range.min + range.max) / 2)} - ₹${range.max}`,
            hotel_image_url: '',
            geo_coordinates: {
                latitude: baseLat + 0.02,
                longitude: baseLng + 0.02,
            },
            rating: range.rating + 0.2,
            description: `Well-located hotel in ${city} offering great value for ${budget.toLowerCase()} budget travelers.`,
        },
        {
            hotel_name: `${city} Heritage Stay`,
            hotel_address: `Heritage District, ${city}, ${state}`,
            price_per_night: `₹${Math.floor((range.min + range.max) / 2)}`,
            hotel_image_url: '',
            geo_coordinates: {
                latitude: baseLat - 0.01,
                longitude: baseLng - 0.01,
            },
            rating: range.rating + 0.3,
            description: `Traditional ${budget.toLowerCase()} budget hotel in ${city} with local charm and hospitality.`,
        },
    ];
}
