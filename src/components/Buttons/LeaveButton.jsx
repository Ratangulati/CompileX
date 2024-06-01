import React, { useRef } from 'react';
import tippy from 'tippy.js';

export function LeaveButton({onClick}) {
    const buttonRef = useRef(null);

    tippy(buttonRef.current, {
      content: 'Leave room', 
      placement: 'top', 
      delay: 1,
    });
  
    return (
    <button onClick={onClick}
    type="button" className="text-[#fff] hover:bg-red-500 hover:text-[#333] rounded-full p-1" >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><title>Leave room</title> <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>
    </button>
    )
}

