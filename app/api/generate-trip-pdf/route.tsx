import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { renderToStream } from '@react-pdf/renderer';
import TripPdfDocument from './TripPdfDocument';

export async function POST(req: NextRequest) {
    try {
        const tripData = await req.json();

        if (!tripData) {
            return NextResponse.json({ error: 'Missing trip data' }, { status: 400 });
        }

        // Render the PDF to a stream
        const formattedData = { trip_plan: tripData };
        const stream = await renderToStream(<TripPdfDocument tripData={formattedData} />);

        // Convert the stream to a buffer (or pipe it directly if possible, but Next.js Response expects a BodyInit)
        // For simplicity and compatibility, we'll convert to buffer.
        // However, renderToStream returns a NodeJS.ReadableStream.
        // We can construct a Response with the stream directly in modern Next.js.

        return new NextResponse(stream as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="trip-plan.pdf"`,
            },
        });

    } catch (error) {
        console.error('Error generating PDF:', error);
        return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
    }
}
