import React, { useState } from 'react';
import { LuChevronRight, LuChevronDown, LuFile, LuFolder, LuPlus, LuSettings } from 'react-icons/lu';

const VSExplorer = ({ isOpen, onClose, files, onFileSelect, onFileCreate, onFileDelete, activeFile, onFolderCreate }) => {
    const [expandedFolders, setExpandedFolders] = useState(['src', 'components']);
    const [showNewFileInput, setShowNewFileInput] = useState(false);
    const [showNewFolderInput, setShowNewFolderInput] = useState(false);
    const [newFileName, setNewFileName] = useState('');
    const [newFolderName, setNewFolderName] = useState('');
    const [targetFolder, setTargetFolder] = useState('');

    // VS Code-like file structure
    const [fileStructure, setFileStructure] = useState({
        'src': {
            type: 'folder',
            children: {
                'main.js': { type: 'file', language: 'javascript' },
                'utils.ts': { type: 'file', language: 'typescript' }
            }
        },
        'components': {
            type: 'folder',
            children: {
                'Button.tsx': { type: 'file', language: 'typescript' }
            }
        },
        'package.json': { type: 'file', language: 'json' },
        'README.md': { type: 'file', language: 'markdown' }
    });

    const getFileIcon = (fileName, language) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'js':
                return <LuFile className="w-4 h-4 text-yellow-500" />;
            case 'ts':
            case 'tsx':
                return <LuFile className="w-4 h-4 text-blue-500" />;
            case 'py':
                return <LuFile className="w-4 h-4 text-green-500" />;
            case 'java':
                return <LuFile className="w-4 h-4 text-red-500" />;
            case 'cpp':
            case 'c':
                return <LuFile className="w-4 h-4 text-blue-600" />;
            case 'go':
                return <LuFile className="w-4 h-4 text-cyan-500" />;
            case 'rs':
                return <LuFile className="w-4 h-4 text-orange-500" />;
            case 'json':
                return <LuFile className="w-4 h-4 text-yellow-600" />;
            case 'md':
                return <LuFile className="w-4 h-4 text-gray-500" />;
            default:
                return <LuFile className="w-4 h-4 text-gray-500" />;
        }
    };

    const toggleFolder = (folderName) => {
        setExpandedFolders(prev => 
            prev.includes(folderName) 
                ? prev.filter(f => f !== folderName)
                : [...prev, folderName]
        );
    };

    const handleCreateFile = () => {
        if (newFileName.trim()) {
            onFileCreate(newFileName.trim());
            setNewFileName('');
            setShowNewFileInput(false);
        }
    };

    const handleCreateFolder = () => {
        if (newFolderName.trim()) {
            // Add folder creation logic here
            setNewFolderName('');
            setShowNewFolderInput(false);
        }
    };

    const handleKeyPress = (e, type) => {
        if (e.key === 'Enter') {
            if (type === 'file') {
                handleCreateFile();
            } else {
                handleCreateFolder();
            }
        } else if (e.key === 'Escape') {
            setShowNewFileInput(false);
            setShowNewFolderInput(false);
            setNewFileName('');
            setNewFolderName('');
        }
    };

    const renderFileItem = (name, item, path = '') => {
        const fullPath = path ? `${path}/${name}` : name;
        const isExpanded = expandedFolders.includes(name);
        
        if (item.type === 'folder') {
            return (
                <div key={name}>
                    <div 
                        className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => toggleFolder(name)}
                    >
                        {isExpanded ? (
                            <LuChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                            <LuChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                        <LuFolder className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{name}</span>
                    </div>
                    {isExpanded && (
                        <div className="ml-4">
                            {Object.entries(item.children).map(([childName, childItem]) => 
                                renderFileItem(childName, childItem, fullPath)
                            )}
                        </div>
                    )}
                </div>
            );
        } else {
            return (
                <div
                    key={name}
                    className={`flex items-center gap-1 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${
                        activeFile === name ? 'bg-blue-100 dark:bg-blue-900' : ''
                    }`}
                    onClick={() => onFileSelect(name)}
                >
                    <div className="w-4 h-4" /> {/* Spacer for alignment */}
                    {getFileIcon(name, item.language)}
                    <span className="text-sm text-gray-700 dark:text-gray-300">{name}</span>
                </div>
            );
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
            
            {/* Explorer Panel */}
            <div className={`
                fixed lg:relative top-0 left-0 h-full w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <h2 className="text-sm font-semibold text-gray-800 dark:text-white">EXPLORER</h2>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setShowNewFileInput(true)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            title="New File"
                        >
                            <LuPlus className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                            onClick={() => setShowNewFolderInput(true)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            title="New Folder"
                        >
                            <LuFolder className="w-4 h-4 text-gray-500" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                            <LuSettings className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* File Tree */}
                <div className="flex-1 overflow-y-auto p-2">
                    {Object.entries(fileStructure).map(([name, item]) => 
                        renderFileItem(name, item)
                    )}

                    {/* New File Input */}
                    {showNewFileInput && (
                        <div className="px-2 py-1">
                            <input
                                type="text"
                                value={newFileName}
                                onChange={(e) => setNewFileName(e.target.value)}
                                onKeyPress={(e) => handleKeyPress(e, 'file')}
                                onBlur={() => {
                                    setTimeout(() => {
                                        setShowNewFileInput(false);
                                        setNewFileName('');
                                    }, 200);
                                }}
                                placeholder="File name..."
                                className="w-full text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                                autoFocus
                            />
                        </div>
                    )}

                    {/* New Folder Input */}
                    {showNewFolderInput && (
                        <div className="px-2 py-1">
                            <input
                                type="text"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                onKeyPress={(e) => handleKeyPress(e, 'folder')}
                                onBlur={() => {
                                    setTimeout(() => {
                                        setShowNewFolderInput(false);
                                        setNewFolderName('');
                                    }, 200);
                                }}
                                placeholder="Folder name..."
                                className="w-full text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                                autoFocus
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default VSExplorer;
