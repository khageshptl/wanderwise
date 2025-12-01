import { Globe2 } from 'lucide-react'
import React from 'react'

function FinalUi({ ViewTrip, disable }: any) {
    return (
        <div className='flex flex-col items-center justify-center mt-6 p-6 bg-card rounded-2xl mb-2'>
            <Globe2 className='text-primary text-4xl animate-bounce' />
            <h2 className='mt-3 text-lg font-semibold text-primary'>
                ✈️ Planning Your Dream Trip...
            </h2>
            <p className='text-muted-foreground text-sm text-center mt-1'>
                Gathering best destinations, activities and travel details for you.
            </p>
            <button disabled={disable} onClick={ViewTrip} className='my-3 w-full bg-primary text-white py-2 rounded-full hover:shadow-blue-300 hover:shadow-lg transition-shadow shadow-sm text-center glass-button text-primary-foreground'>
                View Trip
            </button>
        </div>
    )
}

export default FinalUi;