"use client";
import { Button } from '@/components/ui/button'
import { ExternalLinkIcon, Star, Wallet } from 'lucide-react'
import Link from 'next/dist/client/link'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Hotel } from './ChatBox'
import axios from 'axios'

type Props = {
    hotel: Hotel,
}


function HotelCardItem({ hotel }: Props) {

    const [photoUrl, setPhotoUrl] = useState<string>();

    useEffect(() => {
        hotel && getGooglePlaceDetail();
    }, [hotel])

    const getGooglePlaceDetail = async () => {
        const result = await axios.post('/api/google-place', {
            placeName: hotel?.hotel_name
        });
        if (result?.data?.err) return;
        setPhotoUrl(result.data);
    }

    return (
        <div className='flex flex-col gap-1 m-2 p-2 rounded-xl glass-card cursor-pointer hover:scale-105 transition-all duration-300'>
            <div className='relative w-full aspect-video mb-2'>
                <Image
                    src={photoUrl ? photoUrl : '/scene.jpg'}
                    alt='place-image'
                    fill
                    className='rounded-xl shadow object-cover'
                />
            </div>
            <h2 className='font-semibold text-lg'>{hotel?.hotel_name}</h2>
            <h2 className='text-muted-foreground'>{hotel?.hotel_address}</h2>
            <div className='flex justify-between items-center'>
                <p className='flex gap-2 text-green-700 dark:text-green-400'><Wallet />{hotel.price_per_night}</p>
                <p className='text-yellow-400 flex gap-2'><Star />{hotel?.rating}</p>
            </div>
            <Link href={'https://www.google.com/maps/search/?api=1&query=' + hotel?.hotel_name} target='_blank' >
                <div className='w-full mt-1'>
                    <Button variant='outline' className='w-full hover:text-primary justify-center glass-chip'>
                        View <ExternalLinkIcon className='ml-2' />
                    </Button>
                </div>
            </Link>
            {/* <p className='line-clamp-2 text-gray-500'>{hotel?.description}</p> */}
        </div>
    )
}

export default HotelCardItem