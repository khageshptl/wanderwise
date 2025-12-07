import React, { useEffect, useState } from 'react'
import { Trip } from '../page'
import Image from 'next/image'
import { ArrowBigRight } from 'lucide-react'
import axios from 'axios'
import Link from 'next/link'

type props = {
    trip: Trip
}

function MyTripCardItem({ trip }: props) {
    const [photoUrl, setPhotoUrl] = useState<string>();

    useEffect(() => {
        trip && getGooglePlaceDetail();
    }, [trip])

    const getGooglePlaceDetail = async () => {
        const result = await axios.post('/api/google-place', {
            placeName: trip?.tripDetail?.destination
        });
        if (result?.data?.err) return;
        setPhotoUrl(result.data);
    }
    return (
        <Link href={'/view-trips/' + trip?.tripId} className='p-5 rounded-2xl glass-card hover:scale-105 transition-all duration-300'>
            <div className='relative w-full aspect-[4/3]'>
                <Image
                    src={photoUrl ? photoUrl : '/scene.jpg'}
                    className='object-cover rounded-xl'
                    alt={trip?.tripDetail?.destination}
                    fill
                />
            </div>
            <h2 className='flex gap-2 font-semibold text-xl mt-2'><span className='text-wrap'>{trip?.tripDetail?.origin}</span><ArrowBigRight className='mt-1' />{trip?.tripDetail?.destination} </h2>
            <h2 className='mt-2 text-muted-foreground'>{trip?.tripDetail?.duration} Trip with {trip?.tripDetail?.budget} budget</h2>
        </Link>
    )
}

export default MyTripCardItem