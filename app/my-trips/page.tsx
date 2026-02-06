"use client";

import { Button } from '@/components/ui/button';
import { api } from '@/convex/_generated/api';
import { useConvex, useMutation } from 'convex/react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { useUserDetails } from '../Provider';
import { TripInfo } from '../create-new-trip/_components/ChatBox';
import { ArrowBigRight } from 'lucide-react';
import Image from 'next/image';
import MyTripCardItem from './_components/MyTripCardItem';
import toast from 'react-hot-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Id } from '@/convex/_generated/dataModel';

export type Trip = {
    tripId: any,
    tripDetail: TripInfo,
    _id: string
}

function MyTrips() {
    const [myTrips, setMyTrips] = useState<Trip[]>([]);
    const [tripToDelete, setTripToDelete] = useState<string | null>(null);
    const convex = useConvex();
    const userContext = useUserDetails();
    const userDetails = userContext?.userDetails;
    const deleteTrip = useMutation(api.tripDetail.DeleteTrip);

    useEffect(() => {
        const fetchTrips = async () => {
            if (!userDetails?._id) return;
            const result = await convex.query(api.tripDetail.GetUserTrips, {
                uid: userDetails._id,
            });
            setMyTrips(result);
        };
        fetchTrips();
    }, [convex, userDetails?._id]);

    const handleDeleteClick = (tripId: string) => {
        setTripToDelete(tripId);
    };

    const handleConfirmDelete = async () => {
        if (!tripToDelete || !userDetails?._id) return;

        // Optimistic update - remove from UI immediately
        const tripToRemove = myTrips.find(trip => trip._id === tripToDelete);
        setMyTrips(prev => prev.filter(trip => trip._id !== tripToDelete));
        setTripToDelete(null);

        try {
            await deleteTrip({
                tripDocId: tripToDelete as Id<"TripDetailTable">,
                uid: userDetails._id
            });
            toast.success('Trip deleted successfully!', {
                duration: 3000,
                style: {
                    background: 'rgba(16, 185, 129, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: 'inherit',
                },
            });
        } catch (error) {
            // Revert optimistic update on error
            if (tripToRemove) {
                setMyTrips(prev => [...prev, tripToRemove]);
            }
            toast.error('Failed to delete trip. Please try again.', {
                duration: 3000,
                style: {
                    background: 'rgba(239, 68, 68, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: 'inherit',
                },
            });
        }
    };

    const handleCancelDelete = () => {
        setTripToDelete(null);
    };

    return (
        <div className='px-4 py-6 md:px-10 md:py-10 lg:px-24 xl:px-48'>
            <h2 className='font-bold text-2xl md:text-3xl'>My Trips</h2>
            {myTrips?.length == 0 &&
                <div className='p-7 border rounded-2xl flex flex-col items-center justify-center gap-5 mt-6'>
                    <h2 className='font-bold text-xl md:text-2xl text-center'>You haven't planned any <span className='text-primary text-2xl md:text-3xl'>Trip</span> yet!</h2>
                    <Link href={'/create-new-trip'}>
                        <Button>Create New Trip</Button>
                    </Link>
                </div>
            }
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6 '>
                {myTrips?.map((trip, index) => (
                    <MyTripCardItem key={index} trip={trip} onDelete={handleDeleteClick} />
                ))}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={tripToDelete !== null} onOpenChange={(open: boolean) => !open && handleCancelDelete()}>
                <AlertDialogContent className="glass-card border-red-500/30">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold">Delete Trip?</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            Are you sure you want to delete this trip? This action cannot be undone and all trip details will be permanently removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancelDelete} className="glass-card hover:bg-muted/50">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/50 hover:border-red-500/70"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

export default MyTrips