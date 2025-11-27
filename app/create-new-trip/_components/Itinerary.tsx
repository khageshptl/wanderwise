"use client";
import { Timeline } from '@/components/ui/timeline';
import React, { Activity, useEffect, useState } from 'react'
import Image from 'next/image';
import { ArrowBigLeft, ArrowLeft, Clock, ClockAlert, ExternalLinkIcon, Hotel, Star, Ticket, Timer, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { title } from 'process';
import { action } from '@/convex/_generated/server';
import Link from 'next/dist/client/link';
import { small } from 'motion/react-client';
import HotelCardItem from './HotelCardItem';
import PlaceCardItem from './PlaceCardItem';
import { useTripDetails } from '@/app/Provider';
import { TripInfo } from './ChatBox';

// const TRIP_DATA = {

//     "budget": "Moderate",
//     "destination": "Kashmir (Srinagar, Gulmarg, Pahalgam)",
//     "duration": "5 days",
//     "group_size": "2 people (Couple)",
//     "hotels": [
//         {
//             "description":
//                 "A charming and well-maintained houseboat on Dal Lake, offering a traditional Kashmiri experience with modern comforts. Known for its hospitality and scenic views.",
//             "geo_coordinates": {
//                 "latitude": 34.0935,
//                 "longitude": 74.8329,
//             },
//             "hotel_address":
//                 "Ghat No 9, Boulevard Road, Dal Lake, Srinagar, Jammu and Kashmir 190001",
//             "hotel_image_url":
//                 "https://example.com/new_shahnaz_houseboat.jpg",
//             "hotel_name": "New Shahnaz Houseboat",
//             "price_per_night": "INR 4000 - 6000",
//             "rating": 4.2,
//         },
//         {
//             "description":
//                 "A comfortable 3-star hotel located conveniently near city attractions. Offers clean rooms, good service, and essential amenities suitable for couples.",
//             "geo_coordinates": {
//                 "latitude": 34.0886,
//                 "longitude": 74.8085,
//             },
//             "hotel_address":
//                 "Near Khayam Chowk, M.A Road, Srinagar, Jammu and Kashmir 190001",
//             "hotel_image_url":
//                 "https://example.com/hotel_welcome_srinagar.jpg",
//             "hotel_name": "Hotel Welcome",
//             "price_per_night": "INR 3500 - 5500",
//             "rating": 3.9,
//         },
//         {
//             "description":
//                 "Nestled in a peaceful part of Dal Lake, this houseboat provides a cozy and serene stay. Known for its traditional decor, delicious food, and friendly staff.",
//             "geo_coordinates": {
//                 "latitude": 34.0887,
//                 "longitude": 74.8351,
//             },
//             "hotel_address":
//                 "Opposite Ghat No 2, Nehru Park, Dal Lake, Srinagar, Jammu and Kashmir 190001",
//             "hotel_image_url":
//                 "https://example.com/kabo_palace_houseboat.jpg",
//             "hotel_name": "The Kabo Palace Houseboat",
//             "price_per_night": "INR 3800 - 5800",
//             "rating": 4.1,
//         },
//         {
//             "description":
//                 "A budget-friendly yet comfortable option in Srinagar, offering good value for money. Features clean rooms and a central location for exploring the city.",
//             "geo_coordinates": {
//                 "latitude": 34.0952,
//                 "longitude": 74.8071,
//             },
//             "hotel_address":
//                 "Near TRC, Gagan Gali, Srinagar, Jammu and Kashmir 190001",
//             "hotel_image_url":
//                 "https://example.com/hotel_grand_mahal_srinagar.jpg",
//             "hotel_name": "Hotel Grand Mahal",
//             "price_per_night": "INR 3000 - 5000",
//             "rating": 3.8,
//         },
//     ],
//     "itinerary": [
//         {
//             "activities": [
//                 {
//                     "best_time_to_visit": "Afternoon",
//                     "geo_coordinates": {
//                         "latitude": 33.9871,
//                         "longitude": 74.7745,
//                     },
//                     "place_address":
//                         "Indragam, Srinagar, Jammu and Kashmir 190007",
//                     "place_details":
//                         "Arrival point in Kashmir. Transfer to your chosen hotel or houseboat.",
//                     "place_image_url":
//                         "https://example.com/srinagar_airport.jpg",
//                     "place_name":
//                         "Srinagar International Airport (SXR)",
//                     "ticket_pricing":
//                         "N/A (Flight cost not included in local activities)",
//                     "time_travel_each_location":
//                         "1 hour (Airport procedures + transfer to accommodation)",
//                 },
//                 {
//                     "best_time_to_visit":
//                         "Late Afternoon to Sunset (best light and ambiance)",
//                     "geo_coordinates": {
//                         "latitude": 34.0926,
//                         "longitude": 74.8327,
//                     },
//                     "place_address":
//                         "Boulevard Road, Srinagar, Jammu and Kashmir",
//                     "place_details":
//                         "Experience a romantic Shikara ride on the iconic Dal Lake, passing by floating gardens, markets, and houseboats. Enjoy the serene beauty.",
//                     "place_image_url":
//                         "https://example.com/dal_lake_shikara.jpg",
//                     "place_name": "Dal Lake (Shikara Ride)",
//                     "ticket_pricing":
//                         "INR 700 - 1500 per hour (for a private Shikara)",
//                     "time_travel_each_location": "1.5 - 2 hours",
//                 },
//             ],
//             "best_time_to_visit_day": "Afternoon to Evening",
//             "day": 1,
//             "day_plan":
//                 "Arrival in Srinagar, transfer to accommodation, and an evening Shikara ride on Dal Lake.",
//         },
//         {
//             "activities": [
//                 {
//                     "best_time_to_visit":
//                         "Morning (fewer crowds, pleasant weather)",
//                     "geo_coordinates": {
//                         "latitude": 34.1309,
//                         "longitude": 74.8732,
//                     },
//                     "place_address":
//                         "Nishat-Shalimar Road, Srinagar, Jammu and Kashmir 191121",
//                     "place_details":
//                         "The 'Garden of Pleasure,' a terraced Mughal garden built on the eastern side of Dal Lake, offering stunning views of the lake and Zabarwan mountains.",
//                     "place_image_url":
//                         "https://example.com/nishat_bagh.jpg",
//                     "place_name": "Nishat Bagh",
//                     "ticket_pricing": "INR 30 per person",
//                     "time_travel_each_location": "1 - 1.5 hours",
//                 },
//                 {
//                     "best_time_to_visit":
//                         "Morning (fewer crowds, pleasant weather)",
//                     "geo_coordinates": {
//                         "latitude": 34.1485,
//                         "longitude": 74.8872,
//                     },
//                     "place_address":
//                         "Shalimar, Srinagar, Jammu and Kashmir 190025",
//                     "place_details":
//                         "The 'Abode of Love,' another beautiful Mughal garden famous for its intricate design, fountains, and black marble pavilion. It's the largest of the three Mughal gardens.",
//                     "place_image_url":
//                         "https://example.com/shalimar_bagh.jpg",
//                     "place_name": "Shalimar Bagh",
//                     "ticket_pricing": "INR 30 per person",
//                     "time_travel_each_location": "1 - 1.5 hours",
//                 },
//                 {
//                     "best_time_to_visit":
//                         "Late Morning (before it gets too hot)",
//                     "geo_coordinates": {
//                         "latitude": 34.0945,
//                         "longitude": 74.8373,
//                     },
//                     "place_address":
//                         "Chashma Shahi, Srinagar, Jammu and Kashmir 190001",
//                     "place_details":
//                         "A smaller, charming Mughal garden known for its natural spring, which is believed to have medicinal properties. Offers beautiful views over Dal Lake.",
//                     "place_image_url":
//                         "https://example.com/chashma_shahi.jpg",
//                     "place_name": "Chashma Shahi",
//                     "ticket_pricing": "INR 30 per person",
//                     "time_travel_each_location": "45 minutes - 1 hour",
//                 },
//                 {
//                     "best_time_to_visit":
//                         "Afternoon (for sunset views or clear city views)",
//                     "geo_coordinates": {
//                         "latitude": 34.0673,
//                         "longitude": 74.8358,
//                     },
//                     "place_address":
//                         "Durgjan, Srinagar, Jammu and Kashmir 190001",
//                     "place_details":
//                         "An ancient temple dedicated to Lord Shiva, located on top of the Shankaracharya Hill. Offers panoramic views of Srinagar city, Dal Lake, and the surrounding mountains.",
//                     "place_image_url":
//                         "https://example.com/shankaracharya_temple.jpg",
//                     "place_name": "Shankaracharya Temple",
//                     "ticket_pricing":
//                         "Free entry (camera restrictions apply, parking fee might be extra)",
//                     "time_travel_each_location":
//                         "1 - 1.5 hours (including ascent/descent)",
//                 },
//             ],
//             "best_time_to_visit_day": "Morning to Afternoon",
//             "day": 2,
//             "day_plan":
//                 "Explore Srinagar's famous Mughal Gardens and Shankaracharya Temple.",
//         },
//         {
//             "activities": [
//                 {
//                     "best_time_to_visit":
//                         "Morning (to reach early and avoid queues)",
//                     "geo_coordinates": {
//                         latitude: 34.0484,
//                         longitude: 74.3941,
//                     },
//                     "place_address":
//                         "Gulmarg, Jammu and Kashmir 193402",
//                     "place_details":
//                         "Known as the 'Meadow of Flowers,' Gulmarg is a stunning hill station famous for its lush green meadows in summer and ski slopes in winter. Enjoy the scenic drive.",
//                     "place_image_url":
//                         "https://example.com/gulmarg_meadows.jpg",
//                     "place_name": "Gulmarg",
//                     "ticket_pricing":
//                         "N/A (entry to town is free, activities extra)",
//                     "time_travel_each_location":
//                         "2-3 hours (drive from Srinagar)",
//                 },
//                 {
//                     "best_time_to_visit":
//                         "Late Morning (after arrival, to enjoy the views)",
//                     "geo_coordinates": {
//                         "latitude": 34.0487,
//                         "longitude": 74.3837,
//                     },
//                     "place_address":
//                         "Gondola Road, Gulmarg, Jammu and Kashmir 193402",
//                     "place_details":
//                         "One of the highest cable cars in the world, offering breathtaking panoramic views of the Himalayan peaks. Phase 1 takes you to Kongdori Station.",
//                     "place_image_url":
//                         "https://example.com/gulmarg_gondola.jpg",
//                     "place_name": "Gulmarg Gondola (Phase 1)",
//                     "ticket_pricing": "INR 740 per person (Phase 1)",
//                     "time_travel_each_location":
//                         "2-3 hours (including waiting time and ride)",
//                 },
//             ],
//             "best_time_to_visit_day": "Full Day",
//             "day": 3,
//             "day_plan":
//                 "Day trip to Gulmarg, experiencing the Gondola ride and scenic meadows.",
//         },
//         {
//             "activities": [
//                 {
//                     "best_time_to_visit":
//                         "Morning (while driving to Pahalgam)",
//                     "geo_coordinates": {
//                         "latitude": 34.0049,
//                         "longitude": 74.9272,
//                     },
//                     "place_address":
//                         "Pampore, Pulwama, Jammu and Kashmir",
//                     "place_details":
//                         "En route to Pahalgam, stop at Pampore, known as the 'Saffron Town of Kashmir.' Witness the vast saffron fields (best during autumn blooming, but visible otherwise).",
//                     "place_image_url":
//                         "https://example.com/pampore_saffron.jpg",
//                     "place_name": "Pampore Saffron Fields",
//                     "ticket_pricing": "Free",
//                     "time_travel_each_location": "30 minutes",
//                 },
//                 {
//                     "best_time_to_visit":
//                         "Late Morning (after saffron fields, en route)",
//                     "geo_coordinates": {
//                         "latitude": 33.9189,
//                         "longitude": 75.0396,
//                     },
//                     "place_address":
//                         "Awantipora, Pulwama, Jammu and Kashmir 192122",
//                     "place_details":
//                         "Visit the ruins of ancient Hindu temples built by King Avantivarman in the 9th century, dedicated to Vishnu and Shiva. Offers a glimpse into Kashmir's rich history.",
//                     "place_image_url":
//                         "https://example.com/avantipur_ruins.jpg",
//                     "place_name": "Avantipur Ruins",
//                     "ticket_pricing": "INR 25 per person",
//                     "time_travel_each_location": "45 minutes - 1 hour",
//                 },
//                 {
//                     "best_time_to_visit":
//                         "Afternoon (to spend time by Lidder River)",
//                     "geo_coordinates": {
//                         "latitude": 34.0152,
//                         "longitude": 75.1925,
//                     },
//                     "place_address":
//                         "Pahalgam, Anantnag, Jammu and Kashmir 192123",
//                     "place_details":
//                         "The 'Valley of Shepherds,' a serene town situated on the banks of the Lidder River. Enjoy the breathtaking landscapes, lush greenery, and peaceful ambiance.",
//                     "place_image_url":
//                         "https://example.com/pahalgam_valley.jpg",
//                     "place_name": "Pahalgam",
//                     "ticket_pricing":
//                         "N/A (entry to town is free, local pony rides/sightseeing extra)",
//                     "time_travel_each_location":
//                         "2-3 hours (drive from Avantipur, plus exploring the main area)",
//                 },
//                 {
//                     "best_time_to_visit": "Afternoon",
//                     "geo_coordinates": {
//                         "latitude": 34.0142,
//                         "longitude": 75.1915,
//                     },
//                     "place_address":
//                         "Pahalgam, Anantnag, Jammu and Kashmir",
//                     "place_details":
//                         "Spend time by the pristine Lidder River in Pahalgam. You can enjoy a relaxing walk, photography, or simply sit by the banks and soak in the natural beauty.",
//                     "place_image_url":
//                         "https://example.com/lidder_river.jpg",
//                     "place_name": "Lidder River",
//                     "ticket_pricing": "Free",
//                     "time_travel_each_location": "1 - 1.5 hours",
//                 },
//             ],
//             "best_time_to_visit_day": "Full Day",
//             "day": 4,
//             "day_plan":
//                 "Day trip to Pahalgam, visiting saffron fields and enjoying the Lidder River valley.",
//         },
//         {
//             "activities": [
//                 {
//                     "best_time_to_visit":
//                         "Morning (depending on flight schedule)",
//                     "geo_coordinates": {
//                         "latitude": 33.9871,
//                         "longitude": 74.7745,
//                     },
//                     "place_address":
//                         "Indragam, Srinagar, Jammu and Kashmir 190007",
//                     "place_details":
//                         "Transfer from your hotel/houseboat to Srinagar Airport for your return flight to Bangalore, concluding your Kashmir trip.",
//                     "place_image_url":
//                         "https://example.com/srinagar_airport.jpg",
//                     "place_name":
//                         "Srinagar International Airport (SXR)",
//                     "ticket_pricing":
//                         "N/A (Flight cost not included in local activities)",
//                     "time_travel_each_location":
//                         "1 hour (transfer + check-in)",
//                 },
//             ],
//             "best_time_to_visit_day": "Morning to Afternoon",
//             "day": 5,
//             "day_plan": "Departure from Srinagar.",
//         },
//     ],
//     "origin": "Bangalore",
// }

function Itinerary() {
    //@ts-ignore
    const { tripDetailInfo, setTripDetailInfo } = useTripDetails();
    const [tripsData, setTripsData] = useState<TripInfo | null>(null);

    useEffect(() => {
        tripDetailInfo && setTripsData(tripDetailInfo);
    }, [tripDetailInfo])

    const data = tripsData ? [
        {
            title: "Recommended Hotels",
            content: (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                    {tripsData?.hotels.map((hotel) => (
                        <HotelCardItem hotel={hotel} key={hotel.hotel_name} />
                    ))}
                </div>
            ),
        },
        ...tripsData?.itinerary.map((dayData) => ({
            title: `Day ${dayData.day}`,
            content: (
                <div>
                    {/* <p>Best Time: {dayData.best_time_to_visit_day}</p> */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {dayData.activities.map((activity) => (
                            <PlaceCardItem activity={activity} key={activity.place_name} />
                        ))}
                    </div>
                </div>
            )
        }))
    ] : [];
    return (
        <div className="relative w-full h-[82.5vh] overflow-auto">
            {/* @ts-ignore */}
            {tripsData ? <Timeline data={data} tripData={tripsData} /> 
            : 
                <div className='relative w-full h-full overflow-hidden'>
                <Image src={'/travel.jpg'} alt='Travel' height={800} width={800} className='w-full h-full object-cover rounded-2xl'/>

                    {/* <img
                        src='/back.gif'
                        alt='travel background'
                        width={800} height={800} className='w-full h-full object-cover rounded-3xl'
                    /> */}

                <h2 className='flex gap-2 text-3xl text-white items-center absolute bottom-10 left-10'> <ArrowLeft/> Getting to know you to build perfect Trip here...</h2>

            </div>
            }
        </div>
    );
}

export default Itinerary;