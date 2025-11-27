import React from 'react'
import ChatBox from './_components/ChatBox'
import Itinerary from './_components/Itinerary'

const TRIP_DATA = {
    
}


function CreateNewTrip() {
    return (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-3 p-7'>
            <div>
                <ChatBox />
            </div>
            <div className='col-span-2'>
                <Itinerary />
            </div>
        </div>
    )
}

export default CreateNewTrip