import React, { useState } from 'react';
import {v4 as uuidv4} from 'uuid';
import toast from 'react-hot-toast';
import {useNavigate} from 'react-router-dom'

const Home = () => {
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    const createNewRoom = (e) => {
         e.preventDefault();
         const id = uuidv4();
         setRoomId(id);
         toast.success('Created a new room');
    }

    const joinRoom = () => {
        if (!roomId || !username) {
            toast.error('Please enter a room id and username');
            return;
        }
        navigate(`/editor/${roomId}`, {
            state: {
                username,
            }
        })
    }

    const handleInputEnter = (e) => {
        if (e.code === 'Enter') {
            joinRoom();
        } 
    }

    return (
        <div className='bg-black h-screen flex justify-center items-center'>
            <div className='bg-gray-800 rounded-lg p-8 w-full max-w-md mx-4 shadow-2xl border border-gray-600'>
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <span className="h-8 w-8 text-red-500">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                                <path fillRule="evenodd" d="M14.447 3.026a.75.75 0 0 1 .527.921l-4.5 16.5a.75.75 0 0 1-1.448-.394l4.5-16.5a.75.75 0 0 1 .921-.527ZM16.72 6.22a.75.75 0 0 1 1.06 0l5.25 5.25a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 1 1-1.06-1.06L21.44 12l-4.72-4.72a.75.75 0 0 1 0-1.06Zm-9.44 0a.75.75 0 0 1 0 1.06L2.56 12l4.72 4.72a.75.75 0 0 1-1.06 1.06L.97 12.53a.75.75 0 0 1 0-1.06l5.25-5.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                            </svg>
                        </span>
                        <h1 className='text-white text-3xl font-bold'>CodeEditor Pro</h1>
                    </div>
                    <p className='text-gray-300 text-sm'>Enter your credentials to access your room</p>
                </div>

                {/* Form */}
                <div className='space-y-6'>
                    {/* Room ID Input */}
                    <div>
                        <label className='block text-white text-sm font-medium mb-2'>Room ID</label>
                        <input 
                            type="text" 
                            className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all' 
                            placeholder='Enter room ID' 
                            value={roomId} 
                            onChange={(e) => setRoomId(e.target.value)} 
                            onKeyUp={handleInputEnter}
                        />
                    </div>

                    {/* Username Input */}
                    <div>
                        <label className='block text-white text-sm font-medium mb-2'>Username</label>
                        <input 
                            type="text" 
                            className='w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all' 
                            placeholder='Enter your username' 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            onKeyUp={handleInputEnter}
                        />
                    </div>

                    {/* Join Button */}
                    <button 
                        className='w-full bg-white text-black font-bold py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50' 
                        onClick={joinRoom}
                    >
                        Join Room
                    </button>

                    {/* Create New Room Link */}
                    <div className='text-center'>
                        <span className='text-gray-300 text-sm'>
                            Don't have a room? 
                            <button 
                                onClick={createNewRoom} 
                                className='text-white font-semibold ml-1 hover:text-gray-200 transition-colors underline underline-offset-2'
                            >
                                Create New Room
                            </button>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home    