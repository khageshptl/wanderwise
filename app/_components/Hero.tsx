"use client";
import { Button } from '@/components/ui/button';
import { HeroVideoDialog } from '@/components/ui/hero-video-dialog';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@clerk/nextjs';
import { Globe2Icon, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

export const suggestions = [
    {
        title:"Create New Trip",
        icon:<Globe2Icon className='text-blue-400 h-5 w-5' />
    },
    {
        title:"Inspire me Where to go",
        icon:<Globe2Icon className='text-green-400 h-5 w-5' />
    },
    {
        title:"Discover Hidden Gems",
        icon:<Globe2Icon className='text-red-400 h-5 w-5' />
    },
    {
        title:"Adventure Destination",
        icon:<Globe2Icon className='text-yellow-400 h-5 w-5' />
    },
    
]

function Hero() {

    const { user }=useUser();
    const router=useRouter();
    console.log(user);
    const onSend=()=>{
        if(!user){
            router.push('/sign-in')
            return;
        }
        router.push('/create-new-trip');
    }

    return (
        <div className='mt-24 w-full flex justify-center'>
            <div className='max-w-3xl w-full text-center space-y-6'>
                <h1 className='text-l md:text-4xl font-bold'>Hey, i'm your personal <span className='text-primary'>Trip Planner</span></h1>
                <p>Tell me what you want, and I'll handle the rest: Flights, Hotels, Trip Planning - All in Seconds</p>
                <div>
                    <div className='border rounded-2xl p-4 shadow-xl relative'>
                        <Textarea placeholder='Create a Trip for Paris form New York'
                            className='w-full h-28 bg-transparent border-none focus-visible:ring-0 shadow-none resize-none' />
                        <Button size={'icon'} className='absolute bottom-6 right-6' onClick={()=>onSend()}>
                            <Send className='h-3 w-3'/>
                        </Button>
                    </div>
                </div>
                <div className='flex justify-center gap-5'>
                    {suggestions.map((suggestion, index) => (
                        <div key={index} className='flex items-center border rounded-full p-2 hover:scale-105 transition-all cursor-pointer hover:text-primary' onClick={() => onSend()}>
                            {suggestion.icon}
                            <h2 className='text-sm'>&nbsp;{suggestion.title}</h2>
                        </div>
                    ))}
                </div>
                {/* <HeroVideoDialog
                    className="block dark:hidden"
                    animationStyle="from-center"
                    videoSrc="https://www.example.com/dummy-video"
                    thumbnailSrc="https://youtu.be/hTqxfkWRimk?si=CNkOgOOGwMIHa14h"
                    thumbnailAlt="Dummy Video Thumbnail"
                /> */}
            </div>
        </div>
    )
}
export default Hero;