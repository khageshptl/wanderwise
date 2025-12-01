"use client";
import { select } from 'motion/react-client'
import React from 'react'

export const SelectTravelesList = [
    {
        id: 1,
        title: 'Me',
        desc: 'A sole traveles in exploration',
        icon: '✈️',
        people: '1',
        color: 'bg-green-100 text-green-600'
    },
    {
        id: 2,
        title: 'Couple',
        desc: 'Two traveles in tandem',
        icon: '💍',
        people: '2 People',
        color: 'bg-pink-100 text-pink-600'
    },
    {
        id: 3,
        title: 'Family',
        desc: 'A group of fun loving adv',
        icon: '🏡',
        people: '3 to 5 People',
        color: 'bg-blue-100 text-blue-600'
    },
    {
        id: 4,
        title: 'Friends',
        desc: 'A bunch of thrill-seekes',
        icon: '⛵',
        people: '5 to 10 People',
        color: 'bg-purple-100 text-purple-600'
    },
]


function GroupSizeUi({ onSelectedOption }: any) {
    return (
        <div className='grid grid-cols-2 md:grid-cols-4 gap-2 items-center my-2'>
            {SelectTravelesList.map((item, index) => (
                <div
                    key={index}
                    className='glass-card m-2 p-3 flex flex-col items-center text-center rounded-2xl cursor-pointer'
                    onClick={() => onSelectedOption(item.title + ":" + item.people)}
                >
                    <div className={`text-2xl p-3 rounded-full ${item.color}`}>{item.icon}</div>
                    <h2 className='font-bold mt-2'>{item.title}</h2>
                </div>
            ))}
        </div>
    )
}

export default GroupSizeUi