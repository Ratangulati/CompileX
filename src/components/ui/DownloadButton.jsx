import React, { useRef } from 'react';
import tippy from 'tippy.js';
import { saveAs } from "file-saver"; 

const DownloadButton = ({ code }) => {
  const handleDownload = () => {
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
    <button className="text-[#fff] hover:bg-white hover:text-[#333] rounded-full p-1" onClick={handleDownload}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><title>Download Source code</title><path stroke-linecap="round" stroke-linejoin="round" d="m9 12.75 3 3m0 0 3-3m-3 3v-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
    </button>
  );
};

export default DownloadButton;