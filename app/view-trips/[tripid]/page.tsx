"use client";
import GlobalMap from '@/app/create-new-trip/_components/GlobalMap';
import Itinerary from '@/app/create-new-trip/_components/Itinerary';
import { Trip } from '@/app/my-trips/page';
import { useTripDetails, useUserDetails } from '@/app/Provider';
import { api } from '@/convex/_generated/api';
import { useConvex } from 'convex/react';
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

function ViewTrip() {
    const params = useParams<{ tripid: string }>();
    const convex = useConvex();
    const userContext = useUserDetails();
    const userDetails = userContext?.userDetails;
    const [tripData, setTripData] = useState<Trip>();
    const { setTripDetailInfo } = useTripDetails() ?? {};

    useEffect(() => {
        const fetchTrip = async () => {
            if (!userDetails?._id || !params?.tripid) return;
            const result = await convex.query(api.tripDetail.GetTripById, {
                uid: userDetails._id,
                tripid: params.tripid,
            });
            setTripData(result);
            setTripDetailInfo?.(result?.tripDetail ?? null);
        };
        fetchTrip();
    }, [convex, params?.tripid, setTripDetailInfo, userDetails?._id]);

    return (
        <div className='grid grid-cols-5'>
            <div className='col-span-3'>
                <Itinerary />
            </div>
            <div className='col-span-2'>
                <GlobalMap />
            </div>
        </div>
    )
}

export default ViewTrip