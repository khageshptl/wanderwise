"use client";

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import axios from 'axios';
import { Loader, Send } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import EmptyBoxState from './EmptyBoxState';
import GroupSizeUi from './GroupSizeUi';
import BudgetUi from './BudgetUi';
import SelectDaysUi from './SelectDaysUi';
import { v } from 'convex/values';
import FinalUi from './FinalUi';
import { tr } from 'motion/react-client';
import { mutation } from '@/convex/_generated/server';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useTripDetails, useUserDetails } from '@/app/Provider';
import { v4 as uuid } from 'uuid';
import { useUser } from '@clerk/nextjs';

type Message = {
    role: string,
    content: string,
    ui?: string
}

export type Itinerary = {
    day: number;
    day_plan: string;
    best_time_to_visit_day: string;
    activities: Activity[];
}

export type TripInfo = {
    budget: string,
    destination: string
    duration: string,
    group_size: string,
    origin: string,
    hotels: Hotel[],
    itinerary: Itinerary[]
}

export type Hotel = {
    hotel_name: string;
    hotel_address: string;
    price_per_night: string;
    hotel_image_url: string;
    geo_coordinates: {
        latitude: number,
        longitude: number
    };
    rating: number;
    description: string;
}

export type Activity = {
    place_name: string;
    place_details: string;
    place_image_url: string;
    geo_coordinates: {
        latitude: number,
        longitude: number
    };
    place_address: string;
    ticket_pricing: string;
    time_travel_each_location: string;
    best_time_to_visit: string;
};


function ChatBox() {

    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [isFinal, setIsFinal] = useState<boolean>(false);
    const [tripDetail, setTripDetail] = useState<TripInfo>();
    const saveTripDetail = useMutation(api.tripDetail.CreateTripDetail);
    const { userDetails, setUserDetails } = useUserDetails();
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    //@ts-ignore
    const { tripDetailInfo, setTripDetailInfo } = useTripDetails();

    console.log(userDetails?._id);
    const onSend = async () => {
        if (typeof userInput !== 'string' || !userInput.trim()) return;

        setLoading(true);
        setUserInput("");
        const newMsg: Message = {
            role: 'user',
            content: userInput
        };

        setMessages((prev: Message[]) => [...prev, newMsg]);

        const result = await axios.post('/api/aimodel', {
            messages: [...messages, newMsg],
            isFinal: isFinal
        });

        console.log("TRIP", result.data);


        !isFinal && setMessages((prev: Message[]) => [...prev, {
            role: 'assistant',
            content: result?.data?.resp,
            ui: result?.data?.ui
        }]);

        if (isFinal) {
            setTripDetail(result?.data?.trip_plan);

            setTripDetailInfo(result?.data?.trip_plan);
            setIsFinal(false);
            const tripId = uuid();

            if (!userDetails?._id) {
                console.error("User ID is missing. Cannot save trip detail.");
                setLoading(false);
                return;
            }

            await saveTripDetail({
                tripDetail: result?.data?.trip_plan,
                tripId: tripId,
                uid: userDetails._id
            });
        }

        console.log(result?.data);
        setLoading(false);
    }

    const RenderGenerativeUi = (ui: string) => {
        if (ui == 'groupSize') {
            return <GroupSizeUi onSelectedOption={(v: string) => { setUserInput(v); onSend() }} />
        }
        else if (ui == 'budget') {
            return <BudgetUi onSelectedOption={(v: string) => { setUserInput(v); onSend() }} />
        }
        else if (ui == 'tripDuration') {
            return <SelectDaysUi onConfirm={(v: string) => { setUserInput(v + " days"); onSend() }} />
        }
        else if (ui == 'final') {
            return <FinalUi ViewTrip={() => console.log()}
                disable={!tripDetail}
            />
        }
    }

    useEffect(() => {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg?.ui == 'final') {
            setIsFinal(true);
            setUserInput('ok, Great!');
        }
    }, [messages])

    useEffect(() => {
        if (isFinal && userInput) {
            onSend();
        }
    }, [isFinal])

    return (
        <div className='h-[80vh] md:h-[81.5vh] flex flex-col bg-muted/50 dark:bg-muted/20 rounded-2xl p-3'>
            {/* Display messages */}
            {messages.length === 0 &&
                <EmptyBoxState onSelectOption={(v: string) => { setUserInput(v); onSend() }} />
            }
            <section className='flex-1 overflow-y-auto p-2 md:p-4 scrollbar-hide'>
                {messages.map((msg: Message, index) => (
                    msg.role === 'user' ?
                        <div className='flex justify-end mt-2' key={index}>
                            <div className='max-w-[85%] md:max-w-lg bg-primary text-primary-foreground px-4 py-2 rounded-3xl text-sm md:text-base'>
                                {msg.content}
                            </div>
                        </div>
                        :
                        <div className='flex justify-start mt-2' key={index}>
                            <div className='max-w-[95%] md:max-w-lg bg-muted dark:bg-muted/50 text-foreground px-4 py-2 rounded-3xl text-sm md:text-base'>
                                {/* {msg.content} */}
                                {typeof msg.content === "object" ? (
                                    <pre className="whitespace-pre-wrap text-sm">
                                        {JSON.stringify(msg.content, null, 2)}
                                    </pre>
                                ) : (
                                    msg.content
                                )}
                                {RenderGenerativeUi(msg.ui ?? '')}
                            </div>
                        </div>
                ))}
                {loading && <div className='flex justify-start mt-2'>
                    <div className='max-w-lg bg-muted dark:bg-muted/50 text-foreground px-4 py-2 rounded-3xl'>
                        <Loader className='animate-spin' />
                    </div>
                </div>}
                <div ref={messagesEndRef} />
            </section>
            {/* User Input */}
            <section className='mt-2'>
                <div className='border rounded-2xl p-2 md:p-4 shadow-xl relative bg-background/50 backdrop-blur-sm'>
                    <Textarea placeholder='Start Planning Your Trip From Here...'
                        className='w-full h-20 md:h-28 bg-transparent border-none focus-visible:ring-0 shadow-none resize-none pr-12'
                        onChange={(event) => setUserInput(event.target.value ?? '')}
                        value={userInput}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                onSend();
                            }
                        }}
                    />
                    <Button size={'icon'} className='absolute bottom-4 right-4 md:bottom-6 md:right-6 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 glass-button text-primary-foreground' onClick={() => onSend()}>
                        <Send className='h-3 w-3' />
                    </Button>
                </div>
            </section>
        </div>
    )
}

export default ChatBox