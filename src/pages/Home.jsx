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
        <div className='bg-slate-300 h-screen flex justify-center text-[#fff]'>
            <div className='flex flex-col justify-center '>
                <div className='rounded-lg bg-blue text-center h-max p-2'>
                    <div className="flex items-center gap-2 font-semibold p-2 pt-1 border-slate-300 border-b-2">
                        <span className="h-6 w-6 text-red-600"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path fill-rule="evenodd" d="M14.447 3.026a.75.75 0 0 1 .527.921l-4.5 16.5a.75.75 0 0 1-1.448-.394l4.5-16.5a.75.75 0 0 1 .921-.527ZM16.72 6.22a.75.75 0 0 1 1.06 0l5.25 5.25a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 1 1-1.06-1.06L21.44 12l-4.72-4.72a.75.75 0 0 1 0-1.06Zm-9.44 0a.75.75 0 0 1 0 1.06L2.56 12l4.72 4.72a.75.75 0 0 1-1.06 1.06L.97 12.53a.75.75 0 0 1 0-1.06l5.25-5.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" /></svg></span>
                        <span className='text-[#fff] text-2xl '>CompileX</span>
                    </div>
                    <div>
                        <h4 className='w-28 my-1 mr-auto mt-2'>Enter room Id</h4>
                        <div className='flex flex-col'>
                            <input type="text" className='p-1 bg-[#eee] rounded border-none m-1 font-bold text-sm text-black' placeholder='ROOM ID' value={roomId} onChange={(e) => setRoomId(e.target.value)} onKeyUp={handleInputEnter}></input>
                            <input type="text" className='p-1 bg-[#eee] rounded border-none m-1 font-bold text-sm text-black' placeholder='USERNAME'  value={username} onChange={(e) => setUsername(e.target.value)} onKeyUp={handleInputEnter}></input>
                            <button className='p-1 rounded border-none text-sm bg-[#4aed88]	w-16 m-1 ml-auto text-black hover:bg-[#2b824c]' onClick={joinRoom}>Join</button>
                            <span className='m-1 p-1 text-sm'>If you don't have any invite then create &nbsp;<a onClick={createNewRoom} href="" className='text-[#4aed88] rounded hover:text-[#368654] underline underline-offset-4'>new room</a></span>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    )
}

export default Home    