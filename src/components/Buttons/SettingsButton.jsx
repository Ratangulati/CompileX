import React, { useState, useRef, useEffect } from 'react';
import { IoSettingsOutline } from 'react-icons/io5';
import { BsMoon, BsSun } from 'react-icons/bs';
import { HiOutlineClipboard } from 'react-icons/hi';
import { HiCheck } from 'react-icons/hi';

export function SettingsButton({ 
  onClick, 
  roomId, 
  darkMode = false, 
  onToggleDarkMode,
  onCopyRoomId 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (onClick) onClick();
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (onCopyRoomId) onCopyRoomId(roomId);
    } catch {
      console.error('Copy failed');
    }
  };

  const toggleDarkMode = () => {
    if (onToggleDarkMode) onToggleDarkMode(!darkMode);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        type="button"
        className="flex items-center p-2 rounded-md text-black hover:bg-gray-100 transition"
        title="Settings"
      >
        <IoSettingsOutline 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} 
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-3">
                {darkMode ? <BsMoon className="w-4 h-4 text-gray-600" /> : <BsSun className="w-4 h-4 text-gray-600" />}
                <span className="text-gray-700">{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
              </div>
              <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 ${darkMode ? 'bg-blue-500' : 'bg-gray-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 ${darkMode ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </button>

            <div className="border-t border-gray-100 my-1" />

            {/* Copy Room ID */}
            <button
              onClick={copyRoomId}
              className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-3">
                {copied ? <HiCheck className="w-4 h-4 text-green-600" /> : <HiOutlineClipboard className="w-4 h-4 text-gray-600" />}
                <div className="flex flex-col">
                  <span className="text-gray-700">Copy Room ID</span>
                  <span className="text-xs text-gray-500 font-mono">{roomId}</span>
                </div>
              </div>
              {copied && <span className="text-xs text-green-600 font-medium">Copied!</span>}
            </button>

          </div>
        </>
      )}
    </div>
  );
}
