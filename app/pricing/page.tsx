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
        <div className='mt-20'>
            <h2 className='font-bold text-3xl my-5 text-center gradient-text'>
                AI powered Trip Planning - Pick Your Plan
            </h2>
            <div className='flex flex-col glass-container rounded-2xl' style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem 1rem' }}>
                <PricingTable />
            </div>
        </div>
    )
}

export default Pricing