import React, { useRef } from 'react';
import tippy from 'tippy.js';
import { MdOutlineExitToApp } from "react-icons/md";


export function LeaveButton({onClick}) {
    const buttonRef = useRef(null);

    tippy(buttonRef.current, {
      content: 'Leave room', 
      placement: 'top', 
      delay: 1,
    });
  
    return (
    <button onClick={onClick}
    type="button" className="flex items-center gap-1.5 text-sm text-[#000] hover:bg-[#f5f5f5] rounded-md p-2" >
      <MdOutlineExitToApp className="w-4 h-4" />
      Leave
    </button>
    )
}

