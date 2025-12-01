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
        const result = await axios.post('/api/google-place', {
            placeName: activity?.place_name + ":" + activity?.place_address
        });
        if (result?.data?.err) return;
        setPhotoUrl(result.data);
    }

    return (
        <div className='flex flex-col gap-1 m-2 p-2 rounded-xl glass-card cursor-pointer'>
            <Image src={photoUrl ? photoUrl : '/scene.jpg'} alt={activity.place_name} width={400} height={200} className='rounded-xl shadow object-cover mb-2' />
            <h2 className='font-semibold text-lg'>{activity.place_name}</h2>
            <p className='text-muted-foreground line-clamp-2'>{activity?.place_details}</p>
            <h2 className='flex gap-2 text-blue-500 dark:text-blue-400 line-clamp-1'><Ticket />{activity?.ticket_pricing}</h2>
            <p className='flex gap-2 text-green-700 dark:text-green-400'><Clock />{activity?.best_time_to_visit}</p>
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