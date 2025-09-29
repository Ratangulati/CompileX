import React, { useState } from 'react';
import { LuFile, LuFolder, LuPlus, LuX, LuFileText, LuCode, LuFileCode } from 'react-icons/lu';

const FileManager = ({ isOpen, onClose, files, onFileSelect, onFileCreate, onFileDelete, activeFile }) => {
    const [newFileName, setNewFileName] = useState('');
    const [showNewFileInput, setShowNewFileInput] = useState(false);

    const getFileIcon = (fileName) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'js':
            case 'jsx':
                return <LuCode className="w-4 h-4 text-yellow-500" />;
            case 'ts':
            case 'tsx':
                return <LuCode className="w-4 h-4 text-blue-500" />;
            case 'py':
                return <LuFileCode className="w-4 h-4 text-green-500" />;
            case 'java':
                return <LuFileCode className="w-4 h-4 text-red-500" />;
            case 'cpp':
            case 'c':
                return <LuFileCode className="w-4 h-4 text-blue-600" />;
            case 'go':
                return <LuFileCode className="w-4 h-4 text-cyan-500" />;
            case 'rs':
                return <LuFileCode className="w-4 h-4 text-orange-500" />;
            default:
                return <LuFileText className="w-4 h-4 text-gray-500" />;
        }
    };

    const handleCreateFile = () => {
        if (newFileName.trim()) {
            onFileCreate(newFileName.trim());
            setNewFileName('');
            setShowNewFileInput(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleCreateFile();
        } else if (e.key === 'Escape') {
            setShowNewFileInput(false);
            setNewFileName('');
        }
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}
            
            {/* File Manager Panel */}
            <div className={`
                fixed lg:relative top-0 left-0 h-full w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <LuFolder className="w-5 h-5 text-blue-500" />
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Explorer</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                    >
                        <LuX className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* File List */}
                <div className="flex-1 overflow-y-auto p-2">
                    <div className="space-y-1">
                        {files.map((file, index) => (
                            <div
                                key={index}
                                className={`
                                    flex items-center gap-2 p-2 rounded cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-800
                                    ${activeFile === index ? 'bg-blue-100 dark:bg-blue-900' : ''}
                                `}
                                onClick={() => onFileSelect(index)}
                            >
                                {getFileIcon(file.name)}
                                <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
                                    {file.name}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onFileDelete(index);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                                >
                                    <LuX className="w-3 h-3 text-red-500" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Add New File */}
                    <div className="mt-4">
                        {showNewFileInput ? (
                            <div className="flex items-center gap-2 p-2">
                                <input
                                    type="text"
                                    value={newFileName}
                                    onChange={(e) => setNewFileName(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    onBlur={() => {
                                        setTimeout(() => {
                                            setShowNewFileInput(false);
                                            setNewFileName('');
                                        }, 200);
                                    }}
                                    placeholder="File name..."
                                    className="flex-1 text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                                    autoFocus
                                />
                                <button
                                    onClick={handleCreateFile}
                                    className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                    <LuPlus className="w-3 h-3" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowNewFileInput(true)}
                                className="flex items-center gap-2 w-full p-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                            >
                                <LuPlus className="w-4 h-4" />
                                New File
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default FileManager;

