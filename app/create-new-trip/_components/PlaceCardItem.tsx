"use client";

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Clock, ExternalLinkIcon, Ticket } from 'lucide-react'
import Link from 'next/dist/client/link'
import { Button } from '@/components/ui/button'
import { Activity } from './ChatBox'
import axios from 'axios'

type Props = {
    activity: Activity
}

function PlaceCardItem({ activity }: Props) {


    const [photoUrl, setPhotoUrl] = useState<string>();

    useEffect(() => {
        activity && getGooglePlaceDetail();
    }, [activity])

    const getGooglePlaceDetail = async () => {
        try {
            const result = await axios.post('/api/google-place', {
                placeName: activity?.place_name + ":" + activity?.place_address
            });
            if (result?.data?.err) {
                console.warn('No photo found for place:', activity?.place_name);
                return;
            }
            setPhotoUrl(result.data);
        } catch (error: any) {
            // console.error('Error fetching place photo:', error.message);
            // Fallback to placeholder image
        }
    }

    return (
        <div className='flex flex-col gap-1 m-2 p-2 rounded-xl glass-card cursor-pointer hover:scale-105 transition-all duration-300'>
            <div className='relative w-full aspect-video mb-2'>
                <Image
                    src={photoUrl ? photoUrl : '/scene.jpg'}
                    alt={activity.place_name}
                    fill
                    className='rounded-xl shadow object-cover'
                />
            </div>
            <h2 className='font-semibold text-lg line-clamp-2'>{activity.place_name}</h2>
            <p className='text-muted-foreground line-clamp-2'>{activity?.place_details}</p>
            {/* Hide ticket pricing for Free plan (India RAG returns 'Varies') */}
            {activity?.ticket_pricing && activity.ticket_pricing !== 'Varies' && (
                <h2 className='flex items-start gap-2 text-blue-500 dark:text-blue-400'>
                    <Ticket className='w-5 h-5 mt-0.5 shrink-0' />
                    <span className='line-clamp-2'>{activity.ticket_pricing}</span>
                </h2>
            )}
            {/* Hide timing for Free plan (India RAG returns 'Anytime' or generic values) */}
            {activity?.best_time_to_visit &&
                !['Anytime', '2-3 hours'].includes(activity.best_time_to_visit) && (
                    <p className='flex gap-2 text-green-700 dark:text-green-400'><Clock />{activity.best_time_to_visit}</p>
                )}
            <Link href={'https://www.google.com/maps/search/?api=1&query=' + activity?.place_name} target='_blank' >
                <div className='w-full mt-1'>
                    <Button variant='outline' className='w-full hover:text-primary justify-center glass-chip'>
                        View <ExternalLinkIcon className='ml-2' />
                    </Button>
                </div>
            </Link>
        </div>
    )
}

export default PlaceCardItem