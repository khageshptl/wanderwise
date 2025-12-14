import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { renderToStream } from '@react-pdf/renderer';
import TripPdfDocument from './TripPdfDocument';
import axios from 'axios';

// Helper function to fetch image and convert to base64
async function fetchImageAsBase64(placeName: string): Promise<string | null> {
    try {
        const apiKey = process.env.GOOGLE_PLACE_API_KEY;
        if (!apiKey) {
            console.warn('Google Places API key not found');
            return null;
        }

        // Search for place
        const searchUrl = "https://places.googleapis.com/v1/places:searchText";
        const searchResponse = await axios.post(searchUrl, {
            textQuery: placeName
        }, {
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": apiKey,
                'X-Goog-FieldMask': 'places.photos,places.displayName'
            }
        });

        const place = searchResponse?.data?.places?.[0];
        if (!place?.photos || place.photos.length === 0) {
            console.warn(`No photos found for: ${placeName}`);
            return null;
        }

        // Get photo URL
        const photoName = place.photos[0].name;
        const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=800&maxWidthPx=800&key=${apiKey}`;

        // Fetch image as buffer
        const imageResponse = await axios.get(photoUrl, {
            responseType: 'arraybuffer'
        });

        // Convert to base64
        const base64 = Buffer.from(imageResponse.data, 'binary').toString('base64');
        const mimeType = imageResponse.headers['content-type'] || 'image/jpeg';

        return `data:${mimeType};base64,${base64}`;
    } catch (error: any) {
        console.error(`Error fetching image for ${placeName}:`, error.message);
        return null;
    }
}

export async function POST(req: NextRequest) {
    try {
        const tripData = await req.json();

        if (!tripData) {
            return NextResponse.json({ error: 'Missing trip data' }, { status: 400 });
        }

        // console.log('📄 Generating PDF with images...');

        // Fetch images for hotels
        if (tripData.hotels && tripData.hotels.length > 0) {
            // console.log(`🏨 Fetching images for ${tripData.hotels.length} hotels...`);
            const hotelImagePromises = tripData.hotels.map(async (hotel: any) => {
                const base64Image = await fetchImageAsBase64(hotel.hotel_name);
                return { ...hotel, hotel_image_base64: base64Image };
            });
            tripData.hotels = await Promise.all(hotelImagePromises);
        }

        // Fetch images for places in itinerary
        if (tripData.itinerary && tripData.itinerary.length > 0) {
            // console.log(`📍 Fetching images for itinerary places...`);
            for (const day of tripData.itinerary) {
                if (day.activities && day.activities.length > 0) {
                    const activityImagePromises = day.activities.map(async (activity: any) => {
                        const base64Image = await fetchImageAsBase64(activity.place_name);
                        return { ...activity, place_image_base64: base64Image };
                    });
                    day.activities = await Promise.all(activityImagePromises);
                }
            }
        }

        // console.log('✅ Images fetched, generating PDF...');

        // Render the PDF to a stream
        const formattedData = { trip_plan: tripData };
        const stream = await renderToStream(<TripPdfDocument tripData={formattedData} />);

        // console.log('✅ PDF generated successfully');

        return new NextResponse(stream as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="trip-plan.pdf"`,
            },
        });

    } catch (error: any) {
        console.error('Error generating PDF:', error);
        return NextResponse.json({
            error: 'Failed to generate PDF',
            details: error.message
        }, { status: 500 });
    }
}
