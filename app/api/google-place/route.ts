import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { placeName } = await req.json();

        // Validate API key
        const apiKey = process.env.GOOGLE_PLACE_API_KEY;
        if (!apiKey) {
            console.error('GOOGLE_PLACE_API_KEY not found in environment variables');
            return NextResponse.json({
                err: 'Google Places API key not configured',
                message: 'Please add GOOGLE_PLACE_API_KEY to your .env file'
            }, { status: 500 });
        }

        // console.log('🔍 Searching Google Places for:', placeName);

        const BASE_URL = "https://places.googleapis.com/v1/places:searchText";
        const config = {
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": apiKey,
                'X-Goog-FieldMask': 'places.photos,places.displayName,places.id'
            }
        };

        const result = await axios.post(BASE_URL, {
            textQuery: placeName
        }, config);

        // console.log('📍 Places API response:', {
        //     placesFound: result?.data?.places?.length || 0,
        //     placeName: result?.data?.places?.[0]?.displayName?.text
        // });

        // Check if we got results
        if (!result?.data?.places || result.data.places.length === 0) {
            // console.warn('⚠️ No places found for:', placeName);
            return NextResponse.json({
                err: 'No places found',
                message: `No results found for "${placeName}"`
            }, { status: 404 });
        }

        // Check if place has photos
        const place = result.data.places[0];
        if (!place.photos || place.photos.length === 0) {
            // console.warn('⚠️ No photos found for:', placeName);
            return NextResponse.json({
                err: 'No photos found',
                message: `No photos available for "${placeName}"`
            }, { status: 404 });
        }

        const placeRefName = place.photos[0].name;
        const photoRefUrl = `https://places.googleapis.com/v1/${placeRefName}/media?maxHeightPx=1000&maxWidthPx=1000&key=${apiKey}`;

        // console.log('✅ Photo URL generated for:', placeName);
        return NextResponse.json(photoRefUrl);

    } catch (err: any) {
        console.error('❌ Google Places API error:', {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status
        });

        return NextResponse.json({
            err: err.message,
            details: err.response?.data || 'Unknown error',
            message: 'Failed to fetch place photo from Google Places API'
        }, { status: 500 });
    }
}