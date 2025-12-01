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

const TRIP_DATA = {

}


function CreateNewTrip() {
    // @ts-ignore
    // const { tripDetailInf, setTripDetailInfo } = useTripDetails();
    const [activeIndex, setActiveIndex] = useState(0);

    // useEffect(() => {
    //     setTripDetailInfo(null)
    // }, [])

    return (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-3 p-7'>
            <div>
                <ChatBox />
            </div>
            <div className='col-span-2 relative'>
                {activeIndex == 0 ? <Itinerary /> : <GlobalMap />}

                <Tooltip>
                    <TooltipTrigger className='absolute bottom-10 left-[50%] hover:shadow-2xl hover:scale-105 transition-transform transform-ease-in-out glass-button text-primary-foreground
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
        </div>
    )
}

export default CreateNewTrip