"use client"

import React, { useRef, useState } from 'react'
import { Button } from '../ui/button'

const Bot = () => {

    // const { current: isLoaded } = useRef<boolean>(false)
    const [started, setStarted] = useState(false)

    const initializeBot = () => {
        // if not loaded, load the script
        setStarted(true)
    }


    return (
        <div>
            <Button onClick={() => setStarted(true)} className='w-full md:max-w-max'>
                Start Bot
            </Button>
            
            {
                started && <div className="absolute bottom-5 right-5 shadow-lg bg-white dark:bg-gray-700">
                    <div className='min-h-min flex justify-end p-3'>
                        <button onClick={() => setStarted(false)}>
                            <b>X</b>
                        </button>
                    </div>
                    <iframe
                        allow="microphone;"
                        width="350"
                        height="430"
                        src="https://console.dialogflow.com/api-client/demo/embedded/76f9bcb7-00c8-4c27-bd87-ba2511660c34">
                    </iframe>
                </div>
            }
        </div>
    )
}

export default Bot