"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTripDetails, useUserDetails } from '@/app/Provider';
import axios from 'axios';
import { Loader, MapPin, Calendar, Users, Wallet, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { v4 as uuid } from 'uuid';
import toast from 'react-hot-toast';

function IndiaItineraryForm() {
    const [destination, setDestination] = useState('');
    const [durationDays, setDurationDays] = useState('');
    const [budget, setBudget] = useState('');
    const [groupSize, setGroupSize] = useState('');
    const [loading, setLoading] = useState(false);
    const [destinationError, setDestinationError] = useState('');

    const tripContext = useTripDetails();
    const { userDetails } = useUserDetails();
    const saveTripDetail = useMutation(api.tripDetail.CreateTripDetail);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!destination || !durationDays || !budget || !groupSize) {
            toast.error('Please fill in all required fields');
            return;
        }

        // Clear any previous destination error
        setDestinationError('');
        setLoading(true);

        try {
            // Step 1: Validate destination is in India using Gemini
            const validationResponse = await axios.post('/api/validate-india-destination', {
                destination,
            }, {
                validateStatus: (status) => status < 500,
            });

            // Check if validation failed
            if (!validationResponse.data?.is_india) {
                setDestinationError('Please enter an Indian destination. This feature is only available for India travel.');
                toast.error('Please enter a destination in India');
                setLoading(false);
                return;
            }

            // Step 2: Proceed with RAG API if destination is valid
            const response = await axios.post('/api/india-itinerary-rag', {
                destination,
                duration_days: parseInt(durationDays),
                budget,
                group_size: groupSize,
            }, {
                validateStatus: (status) => status < 500, // Don't throw on 4xx errors
            });

            // Check if response has error field (API returned error as 200 OK)
            if (response.data?.error) {
                // Handle errors from API
                if (response.data.error === 'india_only') {
                    setDestinationError('Please enter an Indian destination. This feature is only available for India travel.');
                    toast.error('Please enter a destination in India');
                } else if (response.data.error === 'rate_limit') {
                    toast.error('No free credits remaining. Please upgrade to Pro.');
                } else if (response.data.error === 'no_context') {
                    setDestinationError('Could not find information for this destination. Please try another Indian city.');
                    toast.error('Destination not found in our database');
                } else {
                    toast.error(response.data.message || 'Something went wrong');
                }
                setLoading(false);
                return;
            }

            // Validate response data structure
            if (!response.data?.trip_summary || !response.data?.itinerary) {
                throw new Error('Invalid response format from API');
            }

            // Transform India RAG response to match existing TripInfo format
            const indiaItinerary = response.data;

            const transformedTripPlan = {
                destination: indiaItinerary.trip_summary?.destination || destination,
                duration: `${indiaItinerary.trip_summary?.duration_days || durationDays} days`,
                origin: 'India', // Default for India trips
                budget: budget,
                group_size: groupSize,
                total_estimated_budget: indiaItinerary.estimated_budget?.range || 'Not specified',
                hotels: [], // India RAG doesn't return hotels
                itinerary: (indiaItinerary.itinerary || []).map((day: any) => ({
                    day: day.day || 1,
                    day_plan: day.title || `Day ${day.day}`,
                    best_time_to_visit_day: `Day ${day.day || 1}`,
                    activities: (day.activities || []).map((activity: string, idx: number) => ({
                        place_name: activity,
                        place_details: activity,
                        place_image_url: '',
                        geo_coordinates: { latitude: 0, longitude: 0 },
                        place_address: indiaItinerary.trip_summary?.destination || destination,
                        ticket_pricing: 'Varies',
                        time_travel_each_location: '2-3 hours',
                        best_time_to_visit: indiaItinerary.trip_summary?.best_time_to_visit || 'Anytime',
                    })),
                })),
            };

            // Set trip detail info for display
            tripContext?.setTripDetailInfo?.(transformedTripPlan);

            // Save to database
            if (userDetails?._id) {
                try {
                    const tripId = uuid();
                    await saveTripDetail({
                        tripDetail: transformedTripPlan,
                        tripId: tripId,
                        uid: userDetails._id,
                    });
                    toast.success('India itinerary generated successfully! 🇮🇳');
                } catch (saveError) {
                    console.error('Error saving trip:', saveError);
                    toast.error('Itinerary generated but failed to save. Please try again.');
                }
            } else {
                toast.success('India itinerary generated successfully! 🇮🇳');
            }

        } catch (error: any) {
            console.error('Error generating itinerary:', error);

            // Handle axios errors (network errors, 4xx, 5xx responses)
            if (error.response) {
                // Server responded with error status
                const errorData = error.response.data;

                if (errorData?.error === 'india_only') {
                    setDestinationError('Please enter an Indian destination. This feature is only available for India travel.');
                    toast.error('Please enter a destination in India');
                } else if (errorData?.error === 'rate_limit') {
                    toast.error('No free credits remaining. Please upgrade to Pro.');
                } else if (errorData?.error === 'no_context') {
                    setDestinationError('Could not find information for this destination. Please try another Indian city.');
                    toast.error('Destination not found');
                } else {
                    toast.error(errorData?.message || 'Failed to generate itinerary. Please try again.');
                }
            } else if (error.request) {
                // Request was made but no response received (network error)
                toast.error('Network error. Please check your connection and try again.');
            } else {
                // Something else happened
                toast.error(error.message || 'An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='h-[80vh] md:h-[81.5vh] flex flex-col bg-muted/50 dark:bg-muted/20 rounded-2xl p-6'>
            <div className='mb-6'>
                <h2 className='text-2xl font-bold text-foreground flex items-center gap-2'>
                    <MapPin className='h-6 w-6 text-primary' />
                    Plan Your India Trip
                </h2>
                <p className='text-sm text-muted-foreground mt-2'>
                    Explore incredible India with AI-powered itineraries 🇮🇳
                </p>
            </div>

            <form onSubmit={handleSubmit} className='flex-1 overflow-y-auto space-y-6 scrollbar-hide'>
                {/* Destination */}
                <div className='space-y-2'>
                    <Label htmlFor='destination' className='flex items-center gap-2'>
                        <MapPin className='h-4 w-4' />
                        Destination in India *
                    </Label>
                    <Input
                        id='destination'
                        placeholder='e.g., Goa, Jaipur, Kerala, Mumbai...'
                        value={destination}
                        onChange={(e) => {
                            setDestination(e.target.value);
                            // Clear error when user types
                            if (destinationError) setDestinationError('');
                        }}
                        className={`bg-background/50 ${destinationError ? 'border-red-500 focus-visible:ring-red-500' : ''
                            }`}
                    />
                    {destinationError && (
                        <p className='text-sm text-red-500 flex items-center gap-1'>
                            <span>⚠️</span>
                            {destinationError}
                        </p>
                    )}
                </div>

                {/* Duration */}
                <div className='space-y-2'>
                    <Label htmlFor='duration' className='flex items-center gap-2'>
                        <Calendar className='h-4 w-4' />
                        Trip Duration (days) *
                    </Label>
                    <Input
                        id='duration'
                        type='number'
                        min='1'
                        max='30'
                        placeholder='e.g., 5'
                        value={durationDays}
                        onChange={(e) => setDurationDays(e.target.value)}
                        className='bg-background/50'
                    />
                </div>

                {/* Group Size */}
                <div className='space-y-2'>
                    <Label htmlFor='groupSize' className='flex items-center gap-2'>
                        <Users className='h-4 w-4' />
                        Group Size *
                    </Label>
                    <Select value={groupSize} onValueChange={setGroupSize}>
                        <SelectTrigger className='bg-background/50'>
                            <SelectValue placeholder='Select group size' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='Solo'>Solo</SelectItem>
                            <SelectItem value='Couple'>Couple</SelectItem>
                            <SelectItem value='Family'>Family</SelectItem>
                            <SelectItem value='Friends'>Friends</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Budget */}
                <div className='space-y-2'>
                    <Label htmlFor='budget' className='flex items-center gap-2'>
                        <Wallet className='h-4 w-4' />
                        Budget *
                    </Label>
                    <Select value={budget} onValueChange={setBudget}>
                        <SelectTrigger className='bg-background/50'>
                            <SelectValue placeholder='Select budget range' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='Low'>Low (Budget-friendly)</SelectItem>
                            <SelectItem value='Medium'>Medium (Moderate)</SelectItem>
                            <SelectItem value='High'>High (Luxury)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Submit Button */}
                <Button
                    type='submit'
                    size='lg'
                    disabled={loading}
                    className='w-full glass-button text-primary-foreground'
                >
                    {loading ? (
                        <>
                            <Loader className='animate-spin h-5 w-5 mr-2' />
                            Generating Your India Itinerary...
                        </>
                    ) : (
                        <>
                            <Sparkles className='h-5 w-5 mr-2' />
                            Generate India Itinerary
                        </>
                    )}
                </Button>

                {/* Upgrade Prompt */}
                <div className='mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20'>
                    <p className='text-sm text-muted-foreground text-center'>
                        Want to explore destinations worldwide?
                        <a href='/pricing' className='text-primary font-semibold ml-1 hover:underline'>
                            Upgrade to Pro
                        </a>
                    </p>
                </div>
            </form>
        </div>
    );
}

export default IndiaItineraryForm;
