import React, { useRef } from 'react';
import tippy from 'tippy.js';

export function RunButton({onClick}) {
    const buttonRef = useRef(null);

    tippy(buttonRef.current, {
      content: 'Run Code', // Tooltip content
      placement: 'top', // Tooltip position (can be 'top', 'bottom', 'left', or 'right')
      delay: 1,
    });
  
    return (
    <button onClick={onClick}
    type="button" className="text-[#fff] hover:bg-white hover:text-[#333] rounded-full p-1" >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"> <title>Run code</title> <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg>
        
    </button>
    )
}

