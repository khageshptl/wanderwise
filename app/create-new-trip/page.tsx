"use client";
import React, { useEffect, useState } from 'react'
import ChatBox from './_components/ChatBox'
import Itinerary from './_components/Itinerary'
import GlobalMap from './_components/GlobalMap';
import { Button } from '@/components/ui/button';
import { Globe2, Plane } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAuth } from '@clerk/nextjs';

const TRIP_DATA = {

}


function CreateNewTrip() {
    // @ts-ignore
    // const { tripDetailInf, setTripDetailInfo } = useTripDetails();
    const [activeIndex, setActiveIndex] = useState(0);
    const { has } = useAuth();
    const hasPremiumAccess = has?.({ plan: 'monthly' }) ?? false;

    // useEffect(() => {
    //     setTripDetailInfo(null)
    // }, [])

    return (
        <div className={`grid ${hasPremiumAccess ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 place-items-center'} gap-3 p-5`}>
            <div className={hasPremiumAccess ? '' : 'w-full max-w-4xl'}>
                <ChatBox />
            </div>

            {/* Only show itinerary and map for premium users */}
            {hasPremiumAccess && (
                <div className='col-span-2 relative'>
                    {activeIndex == 0 ? <Itinerary /> : <GlobalMap />}

                    <Tooltip>
                        <TooltipTrigger className='absolute bottom-10 left-1/2 -translate-x-1/2 hover:shadow-2xl hover:scale-105 transition-transform transform-ease-in-out glass-button text-primary-foreground
                        glass-button-globe '>
                            <Button size={'lg'} onClick={() => setActiveIndex(activeIndex == 0 ? 1 : 0)}>
                                {activeIndex == 0 ? <Plane /> : <Globe2 />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>

                            {activeIndex == 0 ? "Switch To Global Map" : "Switch To Itinerary"}
                        </TooltipContent>
                    </Tooltip>

                </div>
            )}
        </div>
    )
}

export default CreateNewTrip