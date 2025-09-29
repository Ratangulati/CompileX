import React, { useState, useEffect } from 'react';
import { 
    LuChevronRight, 
    LuChevronDown, 
    LuFile, 
    LuFolder, 
    LuPlus, 
    LuX, 
    LuPencil,
    LuTrash2,
    LuFileText,
    LuCode,
    LuFileCode
} from 'react-icons/lu';

const FileExplorer = ({ 
    isOpen, 
    onClose, 
    files, 
    folders, 
    expandedFolders,
    activeFile,
    onFileSelect, 
    onFileCreate, 
    onFileDelete, 
    onFileRename,
    onFolderCreate,
    onFolderDelete,
    onFolderRename,
    onFolderToggle,
    onFileMove
}) => {
    const [showNewFileInput, setShowNewFileInput] = useState(false);
    const [showNewFolderInput, setShowNewFolderInput] = useState(false);
    const [newFileName, setNewFileName] = useState('');
    const [newFolderName, setNewFolderName] = useState('');
    const [targetFolder, setTargetFolder] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [renamingItem, setRenamingItem] = useState(null);
    const [renamingName, setRenamingName] = useState('');

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
            case 'h':
                return <LuFileCode className="w-4 h-4 text-blue-600" />;
            case 'go':
                return <LuFileCode className="w-4 h-4 text-cyan-500" />;
            case 'rs':
                return <LuFileCode className="w-4 h-4 text-orange-500" />;
            case 'json':
                return <LuFileText className="w-4 h-4 text-yellow-600" />;
            case 'md':
                return <LuFileText className="w-4 h-4 text-gray-500" />;
            case 'html':
            case 'htm':
                return <LuFileText className="w-4 h-4 text-orange-600" />;
            case 'css':
                return <LuFileText className="w-4 h-4 text-blue-500" />;
            case 'xml':
                return <LuFileText className="w-4 h-4 text-green-600" />;
            default:
                return <LuFile className="w-4 h-4 text-gray-500" />;
        }
    };

    const getLanguageFromExtension = (fileName) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        const languageMap = {
            'js': { value: 'javascript', label: 'JavaScript', name: 'JavaScript' },
            'jsx': { value: 'javascript', label: 'JavaScript', name: 'JavaScript' },
            'ts': { value: 'typescript', label: 'TypeScript', name: 'TypeScript' },
            'tsx': { value: 'typescript', label: 'TypeScript', name: 'TypeScript' },
            'py': { value: 'python', label: 'Python', name: 'Python' },
            'java': { value: 'java', label: 'Java', name: 'Java' },
            'cpp': { value: 'cpp', label: 'C++', name: 'C++' },
            'c': { value: 'c', label: 'C', name: 'C' },
            'go': { value: 'go', label: 'Go', name: 'Go' },
            'rs': { value: 'rust', label: 'Rust', name: 'Rust' },
            'html': { value: 'html', label: 'HTML', name: 'HTML' },
            'css': { value: 'css', label: 'CSS', name: 'CSS' },
            'json': { value: 'json', label: 'JSON', name: 'JSON' },
            'md': { value: 'markdown', label: 'Markdown', name: 'Markdown' }
        };
        return languageMap[extension] || { value: 'javascript', label: 'JavaScript', name: 'JavaScript' };
    };

    const handleCreateFile = () => {
        if (newFileName.trim()) {
            const language = getLanguageFromExtension(newFileName);
            onFileCreate(newFileName.trim(), targetFolder, language);
            setNewFileName('');
            setShowNewFileInput(false);
            setTargetFolder(null);
        }
    };

    const handleCreateFolder = () => {
        if (newFolderName.trim()) {
            onFolderCreate(newFolderName.trim(), targetFolder);
            setNewFolderName('');
            setShowNewFolderInput(false);
            setTargetFolder(null);
        }
    };

    const handleKeyPress = (e, type) => {
        if (e.key === 'Enter') {
            if (type === 'file') {
                handleCreateFile();
            } else if (type === 'folder') {
                handleCreateFolder();
            } else if (type === 'rename') {
                handleRename();
            }
        } else if (e.key === 'Escape') {
            setShowNewFileInput(false);
            setShowNewFolderInput(false);
            setNewFileName('');
            setNewFolderName('');
            setRenamingItem(null);
            setRenamingName('');
        }
    };

    const handleRename = () => {
        if (renamingItem && renamingName.trim()) {
            if (renamingItem.type === 'file') {
                onFileRename(renamingItem.id, renamingName.trim());
            } else {
                onFolderRename(renamingItem.id, renamingName.trim());
            }
            setRenamingItem(null);
            setRenamingName('');
        }
    };

    const handleContextMenu = (e, item, type) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            item,
            type
        });
    };

    const closeContextMenu = () => {
        setContextMenu(null);
    };

    const startRename = (item, type) => {
        setRenamingItem({ ...item, type });
        setRenamingName(item.name);
        setContextMenu(null);
    };

    const deleteItem = (item, type) => {
        if (type === 'file') {
            onFileDelete(item.id);
        } else {
            onFolderDelete(item.id);
        }
        setContextMenu(null);
    };

    const renderFolder = (folder, level = 0) => {
        const isExpanded = expandedFolders.includes(folder.id);
        const folderFiles = files.filter(file => file.folderId === folder.id);
        const subFolders = folders.filter(f => f.parentFolderId === folder.id);

        return (
            <div key={folder.id} className="select-none">
                <div
                    className={`flex items-center gap-1 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer group`}
                    style={{ paddingLeft: `${level * 16 + 8}px` }}
                    onClick={() => onFolderToggle(folder.id)}
                    onContextMenu={(e) => handleContextMenu(e, folder, 'folder')}
                >
                    {isExpanded ? (
                        <LuChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                        <LuChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                    <LuFolder className="w-4 h-4 text-blue-500" />
                    {renamingItem?.id === folder.id ? (
                        <input
                            type="text"
                            value={renamingName}
                            onChange={(e) => setRenamingName(e.target.value)}
                            onKeyPress={(e) => handleKeyPress(e, 'rename')}
                            onBlur={handleRename}
                            className="flex-1 text-sm bg-transparent border-none outline-none text-gray-700 dark:text-gray-300"
                            autoFocus
                        />
                    ) : (
                        <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                            {folder.name}
                        </span>
                    )}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setTargetFolder(folder.id);
                                setShowNewFileInput(true);
                            }}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                            title="New File"
                        >
                            <LuPlus className="w-3 h-3 text-gray-500" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setTargetFolder(folder.id);
                                setShowNewFolderInput(true);
                            }}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                            title="New Folder"
                        >
                            <LuFolder className="w-3 h-3 text-gray-500" />
                        </button>
                    </div>
                </div>
                
                {isExpanded && (
                    <div>
                        {/* Render subfolders */}
                        {subFolders.map(subFolder => renderFolder(subFolder, level + 1))}
                        
                        {/* Render files in this folder */}
                        {folderFiles.map(file => renderFile(file, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    const renderFile = (file, level = 0) => {
        const isActive = activeFile === file.id;
        
        return (
            <div
                key={file.id}
                className={`flex items-center gap-1 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer group ${
                    isActive ? 'bg-blue-100 dark:bg-blue-900' : ''
                }`}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
                onClick={() => onFileSelect(file.id)}
                onContextMenu={(e) => handleContextMenu(e, file, 'file')}
            >
                <div className="w-4 h-4" /> {/* Spacer for alignment */}
                {getFileIcon(file.name)}
                {renamingItem?.id === file.id ? (
                    <input
                        type="text"
                        value={renamingName}
                        onChange={(e) => setRenamingName(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, 'rename')}
                        onBlur={handleRename}
                        className="flex-1 text-sm bg-transparent border-none outline-none text-gray-700 dark:text-gray-300"
                        autoFocus
                    />
                ) : (
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">
                        {file.name}
                    </span>
                )}
                <div className="opacity-0 group-hover:opacity-100">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            deleteItem(file, 'file');
                        }}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                        title="Delete File"
                    >
                        <LuX className="w-3 h-3 text-red-500" />
                    </button>
                </div>
            </div>
        );
    };

    const rootFiles = files.filter(file => !file.folderId);
    const rootFolders = folders.filter(folder => !folder.parentFolderId);

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}
            
            {/* File Explorer Panel */}
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
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setShowNewFileInput(true)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                            title="New File"
                        >
                            <LuPlus className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                            onClick={() => setShowNewFolderInput(true)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                            title="New Folder"
                        >
                            <LuFolder className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                            onClick={onClose}
                            className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                        >
                            <LuX className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* File Tree */}
                <div className="flex-1 overflow-y-auto p-2">
                    {/* Root folders */}
                    {rootFolders.map(folder => renderFolder(folder))}
                    
                    {/* Root files */}
                    {rootFiles.map(file => renderFile(file))}

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
                                        setTargetFolder(null);
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
                                        setTargetFolder(null);
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

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50 py-1"
                    style={{
                        left: contextMenu.x,
                        top: contextMenu.y,
                    }}
                    onClick={closeContextMenu}
                >
                    <button
                        onClick={() => startRename(contextMenu.item, contextMenu.type)}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                        <LuPencil className="w-4 h-4" />
                        Rename
                    </button>
                    <button
                        onClick={() => deleteItem(contextMenu.item, contextMenu.type)}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                        <LuTrash2 className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            )}

            {/* Context Menu Overlay */}
            {contextMenu && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={closeContextMenu}
                />
            )}
        </>
    );
};

export default FileExplorer;
