"use client";
import { suggestions } from '@/app/_components/Hero'
import React from 'react'

function EmptyBoxState({ onSelectOption }: any) {
  return (
    <div className='mt-7'>
      <h2 className='font-bold text-2xl text-center'>Start with<strong className='text-primary text-3xl'>WanderWise</strong> to plan your dream trip</h2>
      <p className='text-center text-gray-400 mt-2'>Discover personalized itineraries, find the best destinations, and plan your dream vacation effortlessly with the power of AI. Let Wander Wise do the hard work while you enjoy the journey.</p>

      <div className='flex justify-center gap-3 mt-5'>
        {suggestions.map((suggestion, index) => (
          <div key={index} 
            onClick={() => onSelectOption(suggestion.title)}
            className='text-xs text-center flex items-center border rounded-full p-2 hover:scale-105 transition-all cursor-pointer hover:text-primary'
          >
            {suggestion.icon}
            <h2 className='text-sm'>&nbsp;{suggestion.title}</h2>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EmptyBoxState