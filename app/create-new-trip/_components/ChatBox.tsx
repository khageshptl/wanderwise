"use client";

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import axios from 'axios';
import { Loader, Send } from 'lucide-react'
import React, { useState } from 'react'
import EmptyBoxState from './EmptyBoxState';
import GroupSizeUi from './GroupSizeUi';
import BudgetUi from './BudgetUi';
import SelectDaysUi from './SelectDaysUi';
import { v } from 'convex/values';

type Message = {
    role: string,
    content: string,
    ui?:string
}

function ChatBox() {

    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

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
            messages: [...messages, newMsg]
        });

        setMessages((prev: Message[]) => [...prev, {
            role: 'assistant',
            content: result?.data?.resp,
            ui:result?.data?.ui
        }]);
        console.log(result?.data);
        setLoading(false);
    }

    const RenderGenerativeUi=(ui:string)=>{
        if(ui=='groupSize'){
            return <GroupSizeUi onSelectedOption={(v:string)=>{ setUserInput(v);  onSend()}} />
        } 
        else if(ui=='budget'){
            return <BudgetUi onSelectedOption={(v:string)=>{ setUserInput(v);  onSend()}} />
        } 
        else if(ui=='tripDuration'){
            return <SelectDaysUi onConfirm={(v:string) => { setUserInput(v + "days"); onSend()}}/>
        } 
        else if(ui=='Final'){
            return <div>Final Component</div>
        }
        return null;
    }

    return (
        <div className='h-[79vh] flex flex-col'>
            {/* Display messages */}
            {messages.length === 0 && 
                <EmptyBoxState onSelectOption={(v:string)=>{ setUserInput(v);  onSend()}}/>
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
                                {msg.content}
                                {RenderGenerativeUi(msg.ui??'')}
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