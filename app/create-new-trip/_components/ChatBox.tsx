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
import { useUserDetails } from '@/app/Provider';
import { v4 as uuid } from 'uuid';
import { useUser } from '@clerk/nextjs';

type Message = {
    role: string,
    content: string,
    ui?: string
}

export type TripInfo = {
    budget: string,
    destination: string
    duration: string,
    group_size: string,
    origin: string,
    hotels: any,
    itinerary: any
}

function ChatBox() {

    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [isFinal, setIsFinal] = useState<boolean>(false);
    const [tripDetail, setTripDetail] = useState<TripInfo>();
    const saveTripDetail = useMutation(api.tripDetail.CreateTripDetail);
    const { userDetails, setUserDetails } = useUserDetails();

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
        <div className='h-[79vh] flex flex-col'>
            {/* Display messages */}
            {messages.length === 0 &&
                <EmptyBoxState onSelectOption={(v: string) => { setUserInput(v); onSend() }} />
            }
            <section className='flex-1 overflow-y-auto p-4'>
                {messages.map((msg: Message, index) => (
                    msg.role === 'user' ?
                        <div className='flex justify-end mt-2' key={index}>
                            <div className='max-w-lg bg-primary text-white px-4 py-2 rounded-3xl'>
                                {msg.content}
                            </div>
                        </div>
                        :
                        <div className='flex justify-start mt-2' key={index}>
                            <div className='max-w-lg bg-gray-100 text-black px-4 py-2 rounded-3xl'>
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
                    <div className='max-w-lg bg-gray-100 text-black px-4 py-2 rounded-3xl'>
                        <Loader className='animate-spin' />
                    </div>
                </div>}
            </section>
            {/* User Input */}
            <section>
                <div className='border rounded-2xl p-4 shadow-xl relative'>
                    <Textarea placeholder='Start Planning Your Trip From Here...'
                        className='w-full h-28 bg-transparent border-none focus-visible:ring-0 shadow-none resize-none'
                        onChange={(event) => setUserInput(event.target.value ?? '')}
                        value={userInput}
                    />
                    <Button size={'icon'} className='absolute bottom-6 right-6' onClick={() => onSend()}>
                        <Send className='h-3 w-3' />
                    </Button>
                </div>
            </section>
        </div>
    )
}

export default ChatBox