"use client";
import { Button } from '@/components/ui/button';
import { HeroVideoDialog } from '@/components/ui/hero-video-dialog';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@clerk/nextjs';
import { Globe2Icon, Send } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import React, { use, useEffect, useState } from 'react';

export const suggestions = [
    {
        title: "Create New Trip",
        icon: <Globe2Icon className='text-blue-400 h-5 w-5' />
    },
    {
        title: "Inspire me Where to go",
        icon: <Globe2Icon className='text-green-400 h-5 w-5' />
    },
    {
        title: "Discover Hidden Gems",
        icon: <Globe2Icon className='text-red-400 h-5 w-5' />
    },
    {
        title: "Adventure Destination",
        icon: <Globe2Icon className='text-yellow-400 h-5 w-5' />
    },

]

function Hero() {

    const { user } = useUser();
    const router = useRouter();
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    // console.log(user);
    const onSend = () => {
        if (!user) {
            router.push('/sign-in')
            return;
        }
        router.push('/create-new-trip');
    }

    const videoSrc = mounted && theme === 'dark' ? '/HeroDark3.mp4' : '/HeroLight.mp4';
    const blurEffect = mounted && theme === 'dark' ? '' : 'blur-xs';
    return (
        <div className='h-screen w-full flex justify-center relative overflow-hidden target snap-start pt-40 md:pt-24 pb-10 md:pb-49'>
            <video
                autoPlay
                loop
                muted
                playsInline
                className={`absolute inset-0 w-full h-full object-cover z-0 pointer-events-none ${blurEffect}`}
                key={videoSrc}
            >
                <source src={videoSrc} type="video/mp4" />
            </video>
            <div className='max-w-3xl w-full text-center space-y-6 relative px-4'>
                <h1 className='text-3xl md:text-4xl font-bold'>
                    Hey, i'm your personal <span className='gradient-text'>Trip Planner</span>
                </h1>
                <p className='text-foreground/80'>
                    Tell me what you want, and I'll handle the rest: Flights, Hotels, Trip Planning - All in Seconds
                </p>
                <div>
                    <div className='glass-container rounded-2xl p-4 shadow-xl relative'>
                        <Textarea
                            placeholder='Create a Trip for Paris from New York'
                            className='w-full h-28 bg-transparent border-none focus-visible:ring-0 shadow-none resize-none text-foreground placeholder:text-foreground/50'
                        />
                        <Button
                            size={'icon'}
                            className='absolute bottom-6 right-6 glass-button text-primary-foreground'
                            onClick={() => onSend()}
                        >
                            <Send className='h-3 w-3' />
                        </Button>
                    </div>
                </div>
                <div className='flex justify-center gap-5 flex-wrap'>
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            className='flex items-center glass-chip rounded-full p-2 px-4 cursor-pointer'
                            onClick={() => onSend()}
                        >
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