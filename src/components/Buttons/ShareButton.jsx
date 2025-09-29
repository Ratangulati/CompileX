import React, { useRef } from 'react';
import tippy from 'tippy.js';
import { saveAs } from "file-saver"; 
import { GoShareAndroid } from "react-icons/go";



const ShareButton = ({ code }) => {
  const handleShare = () => {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" }); 
    saveAs(blob, "Source code"); 
  };

  const buttonRef = useRef(null);

    tippy(buttonRef.current, {
      content: 'Download code', 
      placement: 'top', 
      delay: 1,
  });
  

  return (
    <button onClick={handleShare} 
    type="button" className="flex items-center gap-1.5 text-sm text-[#000] hover:bg-[#f5f5f5] rounded-md p-2">
    <GoShareAndroid className="w-4 h-4" />
    Share
    </button>
  );
};

export default ShareButton;