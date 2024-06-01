import React from 'react'
import Avatar from 'react-avatar'

const Client = ({username}) => {
    return (
        <div className="flex items-center flex-col col-span-1 " >
            <Avatar className='pt-0.5' name={username} size={30} round="50px" />
            <span className="flex pt-0.5 items-center text-xs font-bold ">{username}</span>
        </div>
    )
}

export default Client 