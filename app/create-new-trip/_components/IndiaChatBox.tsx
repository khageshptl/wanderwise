"use client";

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import axios from 'axios';
import { Loader, Send, Sparkles } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useTripDetails, useUserDetails } from '@/app/Provider';
import { v4 as uuid } from 'uuid';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import toast from 'react-hot-toast';
import { TripInfo } from './ChatBox';
import BudgetUi from './BudgetUi';
import GroupSizeUi from './GroupSizeUi';
import SelectDaysUi from './SelectDaysUi';

type Message = {
    role: 'user' | 'assistant';
    content: string;
    ui?: 'budget' | 'group_size' | 'trip_duration';
}

type ConversationStage = 'destination' | 'duration' | 'budget' | 'group_size' | 'generating' | 'complete';

function IndiaChatBox() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: 'Hi! I\'ll help you plan your perfect India trip. Where in India would you like to visit? (e.g., Goa, Jaipur, Kerala, Mumbai)'
        }
    ]);
    const [userInput, setUserInput] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [stage, setStage] = useState<ConversationStage>('destination');

    // Collected data
    const [destination, setDestination] = useState('');
    const [duration, setDuration] = useState('');
    const [budget, setBudget] = useState('');
    const [groupSize, setGroupSize] = useState('');

    const tripContext = useTripDetails();
    const { userDetails } = useUserDetails();
    const saveTripDetail = useMutation(api.tripDetail.CreateTripDetail);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const addMessage = (role: 'user' | 'assistant', content: string, ui?: 'budget' | 'group_size' | 'trip_duration') => {
        setMessages(prev => [...prev, { role, content, ui }]);
    };

    const handleSend = async () => {
        if (!userInput.trim() || loading) return;

        const input = userInput.trim();
        addMessage('user', input);
        setUserInput('');
        setLoading(true);

        try {
            if (stage === 'destination') {
                // Validate destination is in India
                const validationResponse = await axios.post('/api/validate-india-destination', {
                    destination: input,
                }, {
                    validateStatus: (status) => status < 500,
                });

                if (!validationResponse.data?.is_india) {
                    addMessage('assistant', `I'm sorry, but "${input}" doesn't appear to be in India. This feature is only for India destinations. Please try another Indian city or state.`);
                    setLoading(false);
                    return;
                }

                setDestination(input);
                addMessage('assistant', `Great choice! ${input} is beautiful!\n\nHow many days are you planning to stay?`, 'trip_duration');
                setStage('duration');
            }
            else if (stage === 'duration') {
                const days = parseInt(input);
                if (isNaN(days) || days < 1 || days > 30) {
                    addMessage('assistant', 'Please enter a valid number of days (1-30). How many days would you like to travel?');
                    setLoading(false);
                    return;
                }

                setDuration(days.toString());
                addMessage('assistant', `Perfect! ${days} days will be great!\n\nWhat's your budget preference?`, 'budget');
                setStage('budget');
            }
            else if (stage === 'budget') {
                const normalizedBudget = input.toLowerCase();
                let selectedBudget = '';

                if (normalizedBudget.includes('budget') || normalizedBudget.includes('cheap') || normalizedBudget.includes('low')) {
                    selectedBudget = 'Budget';
                } else if (normalizedBudget.includes('moderate') || normalizedBudget.includes('mid') || normalizedBudget.includes('medium')) {
                    selectedBudget = 'Moderate';
                } else if (normalizedBudget.includes('luxury') || normalizedBudget.includes('high') || normalizedBudget.includes('premium')) {
                    selectedBudget = 'Luxury';
                } else {
                    addMessage('assistant', 'Please choose from: Budget, Moderate, or Luxury');
                    setLoading(false);
                    return;
                }

                setBudget(selectedBudget);
                addMessage('assistant', `${selectedBudget} it is!\n\nAnd how many people will be traveling?`, 'group_size');
                setStage('group_size');
            }
            else if (stage === 'group_size') {
                const normalizedSize = input.toLowerCase();
                let selectedSize = '';

                if (normalizedSize.includes('solo') || normalizedSize === '1') {
                    selectedSize = 'Solo';
                } else if (normalizedSize.includes('couple') || normalizedSize === '2') {
                    selectedSize = 'Couple (2 people)';
                } else if (normalizedSize.includes('family') || ['3', '4', '5'].includes(normalizedSize)) {
                    selectedSize = 'Family (3-5 people)';
                } else if (normalizedSize.includes('group') || parseInt(normalizedSize) >= 6) {
                    selectedSize = 'Group (6+ people)';
                } else {
                    addMessage('assistant', 'Please specify: Solo, Couple, Family (3-5), or Group (6+)');
                    setLoading(false);
                    return;
                }

                setGroupSize(selectedSize);
                setStage('generating');

                addMessage('assistant', `Awesome! Let me create a personalized ${duration}-day itinerary for ${selectedSize} in ${destination} with a ${budget} budget...`);

                // Generate itinerary
                await generateItinerary(destination, duration, budget, selectedSize);
            }

        } catch (error) {
            console.error('Error:', error);
            addMessage('assistant', 'Sorry, something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const generateItinerary = async (dest: string, dur: string, budg: string, group: string) => {
        try {
            const response = await axios.post('/api/india-itinerary-rag', {
                destination: dest,
                duration_days: parseInt(dur),
                budget: budg,
                group_size: group,
            }, {
                validateStatus: (status) => status < 500,
            });

            if (response.data?.error) {
                if (response.data.error === 'rate_limit') {
                    addMessage('assistant', 'You\'ve used all your free credits. Upgrade to Pro for unlimited global itineraries!');
                } else {
                    addMessage('assistant', `Error: ${response.data.message || 'Failed to generate itinerary'}`);
                }
                setStage('complete');
                return;
            }

            const indiaItinerary = response.data;

            const transformedTripPlan: TripInfo = {
                destination: indiaItinerary.trip_summary?.destination || dest,
                duration: `${indiaItinerary.trip_summary?.duration_days || dur} days`,
                origin: 'India',
                budget: budg,
                group_size: group,
                total_estimated_budget: indiaItinerary.estimated_budget?.range || 'Not specified',
                hotels: [],
                itinerary: (indiaItinerary.itinerary || []).map((day: any) => ({
                    day: day.day || 1,
                    day_plan: day.title || `Day ${day.day}`,
                    best_time_to_visit_day: `Day ${day.day || 1}`,
                    activities: (day.activities || []).map((activity: string) => ({
                        place_name: activity,
                        place_details: activity,
                        place_image_url: '',
                        geo_coordinates: { latitude: 0, longitude: 0 },
                        place_address: indiaItinerary.trip_summary?.destination || dest,
                        ticket_pricing: 'Varies',
                        time_travel_each_location: '2-3 hours',
                        best_time_to_visit: indiaItinerary.trip_summary?.best_time_to_visit || 'Anytime',
                    })),
                })),
            };

            tripContext?.setTripDetailInfo?.(transformedTripPlan);

            // Free plan: Don't save to database, just display
            addMessage('assistant', `Your ${dest} itinerary is ready! Check it out on the right.\n\nUpgrade to Pro to save your trips and access global destinations!`);
            toast.success('India itinerary generated! Upgrade to Pro to save trips.');

            setStage('complete');

        } catch (error: any) {
            console.error('Error generating itinerary:', error);
            if (error.response?.data?.error === 'rate_limit') {
                addMessage('assistant', 'You\'ve used all your free credits. Upgrade to Pro for unlimited global itineraries!');
            } else {
                addMessage('assistant', 'Sorry, failed to generate itinerary. Please try again.');
            }
            setStage('complete');
        }
    };

    // Handlers for UI component selections
    const handleDaysConfirm = (days: string) => {
        setUserInput(days);
        setTimeout(handleSend, 100);
    };

    const handleBudgetSelect = (budgetOption: string) => {
        // Extract just the budget level (e.g., "Cheap:Keep costs low" -> "Cheap")
        const budget = budgetOption.split(':')[0];
        setUserInput(budget);
        setTimeout(handleSend, 100);
    };

    const handleGroupSizeSelect = (groupOption: string) => {
        // Extract group type (e.g., "Me:1" -> "Me")
        const group = groupOption.split(':')[0];
        setUserInput(group);
        setTimeout(handleSend, 100);
    };

    // Render generative UI components
    const renderGenerativeUi = (ui?: string) => {
        if (ui === 'trip_duration') {
            return <SelectDaysUi onConfirm={handleDaysConfirm} />;
        }
        else if (ui === 'budget') {
            return <BudgetUi onSelectedOption={handleBudgetSelect} />;
        }
        else if (ui === 'group_size') {
            return <GroupSizeUi onSelectedOption={handleGroupSizeSelect} />;
        }
        return null;
    };

    return (
        <div className='h-[80vh] md:h-[81.5vh] flex flex-col bg-muted/50 dark:bg-muted/20 rounded-2xl p-3'>
            {/* Messages */}
            <section className='flex-1 overflow-y-auto p-2 md:p-4 scrollbar-hide'>
                {messages.map((msg, index) => (
                    msg.role === 'user' ?
                        <div className='flex justify-end mt-2' key={index}>
                            <div className='max-w-[85%] md:max-w-lg bg-primary text-primary-foreground px-4 py-2 rounded-3xl text-sm md:text-base'>
                                {msg.content}
                            </div>
                        </div>
                        :
                        <div className='flex justify-start mt-2' key={index}>
                            <div className='max-w-[95%] md:max-w-lg bg-muted dark:bg-muted/50 text-foreground px-4 py-2 rounded-3xl text-sm md:text-base whitespace-pre-line'>
                                {msg.content}
                                {/* Render generative UI if present */}
                                {renderGenerativeUi(msg.ui)}
                            </div>
                        </div>
                ))}
                {loading && <div className='flex justify-start mt-2'>
                    <div className='max-w-lg bg-muted dark:bg-muted/50 text-foreground px-4 py-2 rounded-3xl'>
                        <Loader className='animate-spin h-5 w-5' />
                    </div>
                </div>}
                <div ref={messagesEndRef} />
            </section>

            {/* Input */}
            <section className='mt-2'>
                <div className='border rounded-2xl p-2 md:p-4 shadow-xl relative bg-background/50 backdrop-blur-sm'>
                    <Textarea
                        placeholder={
                            stage === 'destination' ? 'Type an Indian city or state...' :
                                stage === 'duration' ? 'Enter number of days...' :
                                    stage === 'budget' ? 'Budget, Moderate, or Luxury...' :
                                        stage === 'group_size' ? 'Solo, Couple, Family, or Group...' :
                                            'Planning your trip...'
                        }
                        className='w-full h-20 md:h-28 bg-transparent border-none focus-visible:ring-0 shadow-none resize-none pr-12'
                        onChange={(event) => setUserInput(event.target.value ?? '')}
                        value={userInput}
                        disabled={loading || stage === 'generating' || stage === 'complete'}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />
                    <Button
                        size={'icon'}
                        className='absolute bottom-4 right-4 md:bottom-6 md:right-6 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 glass-button'
                        onClick={handleSend}
                        disabled={loading || stage === 'generating' || stage === 'complete'}
                    >
                        <Send className='h-3 w-3' />
                    </Button>
                </div>
            </section>
        </div>
    )
}

export default IndiaChatBox;
