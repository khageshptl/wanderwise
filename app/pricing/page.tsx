"use client";
import { PricingTable } from '@clerk/nextjs'
import React from 'react'

function Pricing() {
    return (
        <div className='mt-20'>
            <h2 className='font-bold text-3xl my-5 text-center gradient-text'>
                AI powered Trip Planning - Pick Your Plan
            </h2>
            <div className='glass-container rounded-2xl' style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem 1rem' }}>
                {/* <PricingTable /> */}
            </div>
        </div>
    )
}

export default Pricing