import React, { useRef } from 'react';
import tippy from 'tippy.js';
import { IoPlayOutline } from "react-icons/io5";


export function RunButton({onClick}) {
    const buttonRef = useRef(null);

    tippy(buttonRef.current, {
      content: 'Run Code', 
      placement: 'top',
    });
  
    return (
    <button onClick={onClick}
    type="button" className="flex items-center gap-1.5 text-sm text-[#000] hover:bg-[#f5f5f5] rounded-md p-2" >
    <IoPlayOutline className='w-4 h-4' />
    Run
    </button>
    )
}

