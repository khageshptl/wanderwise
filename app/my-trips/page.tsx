"use client";

import { Button } from '@/components/ui/button';
import { api } from '@/convex/_generated/api';
import { useConvex } from 'convex/react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { useUserDetails } from '../Provider';
import { TripInfo } from '../create-new-trip/_components/ChatBox';
import { ArrowBigRight } from 'lucide-react';
import Image from 'next/image';
import MyTripCardItem from './_components/MyTripCardItem';

export type Trip = {
    tripId:any,
    tripDetail:TripInfo,
    _id:string
}

function MyTrips() {
    const [myTrips, setMyTrips] = useState<Trip[]>([]);
    const convex = useConvex();
    const userContext = useUserDetails();
    const userDetails = userContext?.userDetails;

    useEffect(() => {
        const fetchTrips = async () => {
            if (!userDetails?._id) return;
            const result = await convex.query(api.tripDetail.GetUserTrips, {
                uid: userDetails._id,
            });
            setMyTrips(result);
        };
        fetchTrips();
    }, [convex, userDetails?._id]);

    return (
        <div className='px-10 p-10 md:px-24 lg:px-48'>
            <h2 className='font-bold text-3xl'>My Trips</h2>
            {myTrips?.length == 0 &&
                <div className='p-7 border rounded-2xl flex flex-col items-center justify-center gap-5 mt-6'>
                    <h2 className='font-bold text-2xl'>You haven't planned any <span className='text-primary text-3xl'>Trip</span> yet!</h2>
                    <Link href={'/create-new-trip'}>
                        <Button>Create New Trip</Button>
                    </Link>
                </div>
            }
            <div className='grid grid-cols-2 lg:grid-cols-3 gap-5 mt-6 '>
                {myTrips?.map((trip, index) => (
                    <MyTripCardItem key={index} trip={trip} />
                ))}
            </div>
        </div>
    )
}

export default MyTrips