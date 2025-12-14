"use client";
import { PricingTable } from '@clerk/nextjs'
import React, { useEffect, useState } from 'react'

function Pricing() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className='mt-20 px-4'>
            <h2 className='font-bold text-3xl my-5 text-center gradient-text'>
                AI powered Trip Planning - Pick Your Plan
            </h2>
            <div className='flex flex-col md:flex-row justify-center items-center md:items-stretch gap-6 glass-container rounded-2xl max-w-3xl mx-auto p-8'>
                <PricingTable />
            </div>
        </div>
    )
}

export default Pricing