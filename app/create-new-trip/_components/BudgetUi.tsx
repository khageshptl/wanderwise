"use client";
import React from 'react'

export const SelectBudgetOptions = [
    {
        id: 1,
        title: 'Cheap',
        desc: 'Stay conscious of costs',
        icon: '💵',
        color: 'bg-green-100 text-green-600',
        after: 'shadow-blue-300'
    },
    {
        id: 2,
        title: 'Moderate',
        desc: 'Keep cost on the average side',
        icon: '💰',
        color: 'bg-yellow-100 text-yellow-600',
        after: 'shadow-blue-300'
    },
    {
        id: 3,
        title: 'Luxury',
        desc: 'Don’t worry about cost',
        icon: '💸',
        color: 'bg-purple-100 text-purple-600',
        after: 'shadow-blue-300'
    },
]



function BudgetUi({ onSelectedOption }: any) {
    return (
        <div className='grid grid-cols-2 md:grid-cols-3 gap-2 items-center my-2'>
            {SelectBudgetOptions.map((item, index) => (
                <div key={index} className="border m-2 p-3 rounded-2xl flex flex-col items-center text-center bg-white hover:shadow-lg hover:text-primary transition-all cursor-pointer"
                    onClick={() => onSelectedOption(item.title + ":" + item.desc)}
                >
                    <div className={`text-2xl p-3 rounded-full ${item.color}`}>{item.icon}</div>
                    <h2 className='text-lg font-semibold mt-2'>{item.title}</h2>
                    <h2 className='text-gray-500 text-sm'>{item.desc}</h2>
                </div>
            ))}
        </div>
    )
}

export default BudgetUi