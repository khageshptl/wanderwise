"use client";

import { Button } from '@/components/ui/button';
import { api } from '@/convex/_generated/api';
import { useConvex } from 'convex/react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { useUserDetails } from '../Provider';
import { TripInfo } from '../create-new-trip/_components/ChatBox';
import { ArrowBigRight, Lock, Sparkles } from 'lucide-react';
import Image from 'next/image';
import MyTripCardItem from './_components/MyTripCardItem';
import { useAuth } from '@clerk/nextjs';

export type Trip = {
    tripId: any,
    tripDetail: TripInfo,
    _id: string
}

function MyTrips() {
    const [myTrips, setMyTrips] = useState<Trip[]>([]);
    const convex = useConvex();
    const userContext = useUserDetails();
    const userDetails = userContext?.userDetails;
    const { has } = useAuth();
    const hasPremiumAccess = has?.({ plan: 'monthly' }) ?? false;

    useEffect(() => {
        const fetchTrips = async () => {
            if (!userDetails?._id || !hasPremiumAccess) return;
            const result = await convex.query(api.tripDetail.GetUserTrips, {
                uid: userDetails._id,
            });
            setMyTrips(result);
        };
        fetchTrips();
    }, [convex, userDetails?._id, hasPremiumAccess]);

    // Show premium upgrade message for free users
    if (!hasPremiumAccess) {
        return (
            <div className='px-4 py-6 md:px-10 md:py-10 lg:px-24 xl:px-48'>
                <h2 className='font-bold text-2xl md:text-3xl'>My Trips</h2>
                <div className='p-10 border-2 border-dashed border-primary/30 rounded-2xl flex flex-col items-center justify-center gap-6 mt-6 bg-muted/30'>
                    <div className='bg-primary/10 p-4 rounded-full'>
                        <Lock className='h-12 w-12 text-primary' />
                    </div>
                    <div className='text-center max-w-md'>
                        <h2 className='font-bold text-xl md:text-2xl mb-3'>
                            Upgrade to <span className='text-primary'>Premium</span> to Save Your Trips
                        </h2>
                        <p className='text-muted-foreground mb-6'>
                            Free users can plan trips but cannot save them. Upgrade to premium to store unlimited trips, access your trip history, and enjoy all premium features!
                        </p>
                    </div>
                    <div className='flex flex-col sm:flex-row gap-3'>
                        <Link href={'/pricing'}>
                            <Button size='lg' className='gap-2'>
                                <Sparkles className='h-4 w-4' />
                                Upgrade to Premium
                            </Button>
                        </Link>
                        <Link href={'/create-new-trip'}>
                            <Button size='lg' variant='outline'>
                                Plan a Trip (Free)
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='px-4 py-6 md:px-10 md:py-10 lg:px-24 xl:px-48'>
            <h2 className='font-bold text-2xl md:text-3xl'>My Trips</h2>
            {myTrips?.length == 0 &&
                <div className='p-7 border rounded-2xl flex flex-col items-center justify-center gap-5 mt-6'>
                    <h2 className='font-bold text-xl md:text-2xl text-center'>You haven't planned any <span className='text-primary text-2xl md:text-3xl'>Trip</span> yet!</h2>
                    <Link href={'/create-new-trip'}>
                        <Button>Create New Trip</Button>
                    </Link>
                </div>
            }
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6 '>
                {myTrips?.map((trip, index) => (
                    <MyTripCardItem key={index} trip={trip} />
                ))}
            </div>
        </div>
    )
}

export default MyTrips