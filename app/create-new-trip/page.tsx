import React from 'react'
import ChatBox from './_components/ChatBox'

function CreateNewTrip() {
    return (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-5 p-10'>
            <div>
                <ChatBox />
            </div>
            <div className='text-center'>
                Itinerary will be displayed here
            </div>
        </div>
    )
}

export default CreateNewTrip