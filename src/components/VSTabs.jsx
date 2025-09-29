import React from 'react';
import { LuX } from 'react-icons/lu';

const VSTabs = ({ files, activeFile, onFileSelect, onFileClose }) => {
    // Filter out welcome page files
    const regularFiles = files.filter(file => !file.isWelcome);
    
    return (
        <div className="flex items-center border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-x-auto min-h-[40px]">
            {regularFiles.length > 0 ? (
                regularFiles.map((file, index) => {
                    // Find the original index in the files array
                    const originalIndex = files.findIndex(f => f.id === file.id);
                    return (
                        <div
                            key={file.id}
                            className={`flex items-center gap-2 px-3 py-2 border-r border-gray-200 dark:border-gray-700 cursor-pointer group min-w-0 ${
                                activeFile === originalIndex 
                                    ? 'bg-white dark:bg-gray-900 text-gray-800 dark:text-white' 
                                    : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                            onClick={() => onFileSelect(originalIndex)}
                        >
                            <span className="text-sm font-medium truncate max-w-32">
                                {file.name}
                            </span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onFileClose(originalIndex);
                                }}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded ml-2"
                            >
                                <LuX className="w-3 h-3" />
                            </button>
                        </div>
                    );
                })
            ) : (
                // Empty tab bar when no files are open - just show empty space
                <div></div>
            )}
        </div>
    );
};

export default VSTabs;
