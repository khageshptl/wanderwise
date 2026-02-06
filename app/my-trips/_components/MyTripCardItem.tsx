import React, { useEffect, useState } from 'react'
import { Trip } from '../page'
import Image from 'next/image'
import { ArrowBigRight, Trash2 } from 'lucide-react'
import axios from 'axios'
import Link from 'next/link'

type props = {
    trip: Trip,
    onDelete?: (tripId: string) => void
}

function MyTripCardItem({ trip, onDelete }: props) {
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

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation
        e.stopPropagation();
        if (onDelete) {
            onDelete(trip._id);
        }
    }

    return (
        <Link href={'/view-trips/' + trip?.tripId} className='relative p-5 rounded-2xl glass-card hover:scale-105 transition-all duration-300 group'>
            {/* Delete Button */}
            <button
                onClick={handleDelete}
                className='absolute top-3 right-3 z-10 p-2 rounded-lg glass-card bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 transition-all duration-300 opacity-0 group-hover:opacity-100'
                aria-label="Delete trip"
            >
                <Trash2 className='w-5 h-5 text-red-500' />
            </button>

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