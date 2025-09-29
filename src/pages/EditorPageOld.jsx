import React, { useEffect, useRef, useState } from 'react'
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios'
import OutputWindow from '../components/OutputWindow';
import { languageOptions } from '../constants/languageOptions';
import { CopyButton } from '../components/Buttons/CopyButton';
import { RunButton } from '../components/Buttons/RunButton';
import { LeaveButton } from '../components/Buttons/LeaveButton';
import ShareButton from '../components/Buttons/ShareButton';
import LanguagesDropdown from '../components/Buttons/LangDropdown';
import { LuFileText, LuMenu, LuX, LuPlus, LuSettings } from "react-icons/lu";
import { SettingsButton } from '../components/Buttons/SettingsButton';
import ThemeToggle from '../components/Buttons/ThemeToggle';
import VSTabs from '../components/VSTabs';
import VSOutputPanel from '../components/VSOutputPanel';
import { useTheme } from '../contexts/ThemeContext';





const EditorPage = () => {

const getDefaultCode = (languageValue) => {
    const defaultCodes = {
        'javascript': `let a = 3;
console.log(a);`,
        'typescript': `let a: number = 3;
console.log(a);`,
        'cpp': `#include <iostream>
using namespace std;

int main() {
    int a = 3;
    cout << a << endl;
    return 0;
}`,
        'java': `public class Main {
    public static void main(String[] args) {
        int a = 3;
        System.out.println(a);
    }
}`,
        'csharp': `using System;

class Program {
    static void Main() {
        int a = 3;
        Console.WriteLine(a);
    }
}`,
        'go': `package main

import "fmt"

func main() {
    a := 3
    fmt.Println(a)
}`,
        'kotlin': `fun main() {
    val a = 3
    println(a)
}`,
        'python': `a = 3
print(a)`,
        'rust': `fn main() {
    let a = 3;
    println!("{}", a);
}`
    };
    return defaultCodes[languageValue] || defaultCodes['javascript'];
};

const javascriptDefault = getDefaultCode('javascript');

    const socketRef = useRef(null);
    const codeRef = useRef(javascriptDefault);
    const location = useLocation();
    const {roomId} = useParams();
    const reactNavigator = useNavigate();
    const [clients, setClients] = useState([]);
    const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
    const [processing, setProcessing] = useState(null);
    const [code, setCode] = useState(javascriptDefault);
    const [outputDetails, setOutputDetails] = useState(null);
    const [language, setLanguage] = useState(() => {
        const saved = localStorage.getItem('selectedLanguage');
        return saved ? JSON.parse(saved) : languageOptions[0];
    });
    const [compileLanguage, setCompileLanguage] = useState(() => {
        const saved = localStorage.getItem('selectedLanguage');
        return saved ? JSON.parse(saved) : languageOptions[0];
    });
    // Explorer files - persistent file system
    const [explorerFiles, setExplorerFiles] = useState(() => {
        const saved = localStorage.getItem('explorerFiles');
        return saved ? JSON.parse(saved) : [];
    });
    
    // Open tabs - files currently open in editor
    const [files, setFiles] = useState(() => {
        const saved = localStorage.getItem('files');
        if (saved) {
            const parsedFiles = JSON.parse(saved);
            // If no files exist, show welcome page
            if (parsedFiles.length === 0) {
                return [{ name: 'Welcome', content: 'Welcome to CodeEditor Pro!\n\nTo get started:\n1. Create a new file using the + button in the explorer\n2. Select your programming language\n3. Start coding!\n\nThis welcome page will be automatically removed when you create your first file.', language: 'javascript', isWelcome: true }];
            }
            return parsedFiles;
        }
        return [{ name: 'Welcome', content: 'Welcome to CodeEditor Pro!\n\nTo get started:\n1. Create a new file using the + button in the explorer\n2. Select your programming language\n3. Start coding!\n\nThis welcome page will be automatically removed when you create your first file.', language: 'javascript', isWelcome: true }];
    });
    const [activeFile, setActiveFile] = useState(0);
    const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
    const [showMembersDropdown, setShowMembersDropdown] = useState(false);
    const [showNewFileInput, setShowNewFileInput] = useState(false);
    const [showNewFolderInput, setShowNewFolderInput] = useState(false);
    const [newFileName, setNewFileName] = useState('');
    const [newFolderName, setNewFolderName] = useState('');
    const [folders, setFolders] = useState(() => {
        const saved = localStorage.getItem('folders');
        return saved ? JSON.parse(saved) : [];
    });
    const [expandedFolders, setExpandedFolders] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const { isDark, toggleTheme } = useTheme();

    // Close settings dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showSettingsDropdown && !event.target.closest('.settings-dropdown')) {
                setShowSettingsDropdown(false);
            }
            if (showMembersDropdown && !event.target.closest('.members-dropdown')) {
                setShowMembersDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSettingsDropdown, showMembersDropdown]);

    // Save files to localStorage whenever files change
    useEffect(() => {
        localStorage.setItem('files', JSON.stringify(files));
    }, [files]);

    // Save explorer files to localStorage whenever explorerFiles change
    useEffect(() => {
        localStorage.setItem('explorerFiles', JSON.stringify(explorerFiles));
    }, [explorerFiles]);

    // Save folders to localStorage whenever folders change
    useEffect(() => {
        localStorage.setItem('folders', JSON.stringify(folders));
    }, [folders]);

    
    useEffect(() => {
        const init = async () => {
      
          try {
            socketRef.current = await initSocket();
      
            socketRef.current.on('connection_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));
      
            const handleErrors = (e) => {
              console.log('socket error', e);
              toast.error('Socket connection failed, try again later.');
              reactNavigator('/');
            };

            
      
            socketRef.current.on('join', ({ clients, username, socketId }) => {
              const newClients = clients.map((client) => ({
                username: client.username,
                socketId: client.socketId,
              }));
      
              const updatedClients = Array.from(
                new Set(newClients.map(JSON.stringify))
              ).map(JSON.parse);
      
              setClients(updatedClients);
      
              if (!updatedClients.some((client) => client.socketId === socketId)) {
                if (username !== location.state?.username) {
                  toast.success(`${username} joined the room`);
                  console.log(`${username} joined`);
                }
              }
      
              socketRef.current.emit('sync-code', { code: codeRef.current, socketId });
            });

            socketRef.current.on('user-disconnected', ({ clients, username }) => {
              setClients(clients);
              if (username !== location.state?.username) {
                toast.success(`${username} left the room`);
                console.log(`${username} left`);
              }
            });
      
            socketRef.current.on('join-error', (error) => {
                console.error('Join error:', error);
                toast.error(error);
                reactNavigator('/');
            });

            if (!hasJoinedRoom) {
              setHasJoinedRoom(true);
              socketRef.current.emit('join', { roomId, username: location.state?.username });
            } else {
              console.log('User already  joined the room');
            }

            socketRef.current.on('language:change', ({ language }) => {
                setLanguage(language);
                setCompileLanguage(language);
                
                // Only update the active file's language, don't change its content
                if (files[activeFile] && !files[activeFile].isWelcome) {
                    const updatedFiles = [...files];
                    updatedFiles[activeFile] = {
                        ...updatedFiles[activeFile],
                        language: language
                    };
                    setFiles(updatedFiles);
                    
                    // Also update in explorer files
                    setExplorerFiles(prevExplorerFiles => 
                        prevExplorerFiles.map(file => 
                            file.id === files[activeFile].id 
                                ? { ...file, language: language }
                                : file
                        )
                    );
                    
                    // Update folder files if the file is in a folder
                    setFolders(prevFolders => 
                        prevFolders.map(folder => ({
                            ...folder,
                            files: folder.files.map(file => 
                                file.id === files[activeFile].id 
                                    ? { ...file, language: language }
                                    : file
                            )
                        }))
                    );
                }
                
                // toast.success(`Language changed to ${language.label}`);
            });

            socketRef.current.on('output-details', ({ outputDetails }) => {
                setOutputDetails(outputDetails);
            });
      
        } catch (error) {
            console.error('Failed to initialize socket:', error);
            toast.error('Failed to initialize socket. Retrying...');
            setTimeout(init, 3000);
        }
        };
      
        init();
      
        const cleanup = () => {
          if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current.off('joined');
            socketRef.current.off('disconnected');
            socketRef.current.off('output-details');
            socketRef.current.off('user-disconnected');
          }
        };
      
        return cleanup;
      }, []);

    async function copyRoomId() {
        try {
            await navigator.clipboard.writeText(roomId)
            toast.success('RoomId has been copied to your clipboard')
        } catch(err) {
            toast.error('Could not copy the RoomId')
        }
    }

    function leaveRoom() { 
        reactNavigator('/');
    }

    if(!location.state) {
        return <Navigate to='/' />
    }


    //Compilation

    const handleLanguageChange = (selectedLanguage) => {
        setLanguage(selectedLanguage);
        setCompileLanguage(selectedLanguage);
        localStorage.setItem('selectedLanguage', JSON.stringify(selectedLanguage));
        
        // Only update the active file's language, don't change its content
        if (files[activeFile] && !files[activeFile].isWelcome) {
            const updatedFiles = [...files];
            updatedFiles[activeFile] = {
                ...updatedFiles[activeFile],
                language: selectedLanguage
            };
            setFiles(updatedFiles);
            
            // Also update in explorer files
            setExplorerFiles(prevExplorerFiles => 
                prevExplorerFiles.map(file => 
                    file.id === files[activeFile].id 
                        ? { ...file, language: selectedLanguage }
                        : file
                )
            );
            
            // Update folder files if the file is in a folder
            setFolders(prevFolders => 
                prevFolders.map(folder => ({
                    ...folder,
                    files: folder.files.map(file => 
                        file.id === files[activeFile].id 
                            ? { ...file, language: selectedLanguage }
                            : file
                    )
                }))
            );
        }
        
        socketRef.current.emit('language:change', { language: selectedLanguage, roomId });
    };

    // Function to detect language from file extension
    const getLanguageFromExtension = (fileName) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        const extensionMap = {
            'js': languageOptions.find(lang => lang.value === 'javascript'),
            'jsx': languageOptions.find(lang => lang.value === 'javascript'),
            'ts': languageOptions.find(lang => lang.value === 'typescript'),
            'tsx': languageOptions.find(lang => lang.value === 'typescript'),
            'py': languageOptions.find(lang => lang.value === 'python'),
            'java': languageOptions.find(lang => lang.value === 'java'),
            'cpp': languageOptions.find(lang => lang.value === 'cpp'),
            'c': languageOptions.find(lang => lang.value === 'cpp'),
            'cs': languageOptions.find(lang => lang.value === 'csharp'),
            'go': languageOptions.find(lang => lang.value === 'go'),
            'kt': languageOptions.find(lang => lang.value === 'kotlin'),
            'rs': languageOptions.find(lang => lang.value === 'rust')
        };
        return extensionMap[extension] || languageOptions[0]; // Default to JavaScript
    };

    // Folder management functions
    const handleFolderCreate = (folderName) => {
        const newFolder = {
            id: Date.now(),
            name: folderName,
            files: []
        };
        setFolders(prevFolders => [...prevFolders, newFolder]);
    };

    const toggleFolder = (folderId) => {
        setExpandedFolders(prev => 
            prev.includes(folderId) 
                ? prev.filter(id => id !== folderId)
                : [...prev, folderId]
        );
    };

    const handleFileCreateInFolder = (fileName, folderId) => {
        const detectedLanguage = getLanguageFromExtension(fileName);
        const newFile = {
            id: Date.now(),
            name: fileName,
            content: getDefaultCode(detectedLanguage.value),
            language: detectedLanguage,
            isWelcome: false,
            folderId: folderId
        };
        
        setFolders(prevFolders => 
            prevFolders.map(folder => 
                folder.id === folderId 
                    ? { ...folder, files: [...folder.files, newFile] }
                    : folder
            )
        );
        
        // Add to explorer files (persistent file system)
        setExplorerFiles(prev => [...prev, newFile]);
        
        // Add to main files array for editor
        setFiles(prevFiles => {
            if (prevFiles.length === 0) {
                return [newFile];
            }
            return [...prevFiles, newFile];
        });
        setActiveFile(files.length);
        setCode(newFile.content);
        setLanguage(detectedLanguage);
        setCompileLanguage(detectedLanguage);
    };

    // File management functions
    const handleFileCreate = (fileName) => {
        const detectedLanguage = getLanguageFromExtension(fileName);
        const newFile = {
            id: Date.now(),
            name: fileName,
            content: getDefaultCode(detectedLanguage.value),
            language: detectedLanguage,
            isWelcome: false
        };
        
        // Add to explorer files (persistent file system)
        setExplorerFiles(prev => [...prev, newFile]);
        
        // If no files are open or only welcome page exists, replace it
        if (files.length === 0 || (files.length === 1 && files[0].isWelcome)) {
            setFiles([newFile]);
            setActiveFile(0);
        } else {
            setFiles([...files, newFile]);
            setActiveFile(files.length);
        }
        
        // Update current language and code
        setLanguage(detectedLanguage);
        setCompileLanguage(detectedLanguage);
        setCode(newFile.content);
        codeRef.current = newFile.content;
        
        // Update localStorage
        localStorage.setItem('selectedLanguage', JSON.stringify(detectedLanguage));
        
        // Emit language change to other clients
        if (socketRef.current) {
            socketRef.current.emit('language:change', { language: detectedLanguage });
        }
    };

    const handleFileSelect = (index) => {
        setActiveFile(index);
        setCode(files[index].content);
        setLanguage(files[index].language);
        setCompileLanguage(files[index].language);
        codeRef.current = files[index].content;
    };

    const handleFileOpenFromExplorer = (file) => {
        // Check if file is already open in tabs
        const existingIndex = files.findIndex(f => f.id === file.id);
        
        if (existingIndex !== -1) {
            // File is already open, just switch to it
            handleFileSelect(existingIndex);
        } else {
            // File is not open, add it to tabs with latest content from explorer
            const newFiles = [...files, file];
            setFiles(newFiles);
            setActiveFile(newFiles.length - 1);
            setCode(file.content);
            setLanguage(file.language);
            setCompileLanguage(file.language);
            codeRef.current = file.content;
        }
    };

    const handleFileDelete = (index) => {
        // Just close the tab, don't delete the file from explorer
        const fileToClose = files[index];
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
        
        if (newFiles.length > 0) {
            // If there are still files, adjust active file
            if (activeFile >= index && activeFile > 0) {
                setActiveFile(activeFile - 1);
                setCode(newFiles[activeFile - 1].content);
                setLanguage(newFiles[activeFile - 1].language);
                setCompileLanguage(newFiles[activeFile - 1].language);
            } else if (activeFile === index && activeFile === 0) {
                setActiveFile(0);
                setCode(newFiles[0].content);
                setLanguage(newFiles[0].language);
                setCompileLanguage(newFiles[0].language);
            }
        } else {
            // No files left, show empty state
            setCode('');
            setLanguage({ name: 'JavaScript', value: 'javascript' });
            setCompileLanguage({ name: 'JavaScript', value: 'javascript' });
        }
        
        // File remains in explorer - we don't remove it from folders or root files
        // The file is only removed from the editor tabs, not from the file system
    };

    const handleFileDeleteFromExplorer = (fileId) => {
        // Remove from explorer files (persistent file system)
        setExplorerFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
        
        // Remove from open tabs if it's currently open
        setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
        
        // Remove from folder if it exists in a folder
        setFolders(prevFolders => 
            prevFolders.map(folder => ({
                ...folder,
                files: folder.files.filter(file => file.id !== fileId)
            }))
        );
    };

    const handleFolderDelete = (folderId) => {
        // Remove folder and all its files
        setFolders(prevFolders => prevFolders.filter(folder => folder.id !== folderId));
        
        // Remove all files from this folder from the main files array
        setFiles(prevFiles => prevFiles.filter(file => file.folderId !== folderId));
        
        // Remove all files from this folder from explorer files
        setExplorerFiles(prevFiles => prevFiles.filter(file => file.folderId !== folderId));
    };

    const onSelectChange = (selectedLanguage) => {
        console.log("selected Option..", selectedLanguage);
        handleLanguageChange(selectedLanguage);
    };
    
    const onChange = (newCode) => {
        setCode(newCode);
        codeRef.current = newCode; 
        localStorage.setItem('code', newCode);
        
        // Update the active file content in open tabs
        const updatedFiles = [...files];
        updatedFiles[activeFile] = {
            ...updatedFiles[activeFile],
            content: newCode
        };
        setFiles(updatedFiles);
        
        // Also update the file content in explorer files (persistent storage)
        if (files[activeFile] && !files[activeFile].isWelcome) {
            setExplorerFiles(prevExplorerFiles => 
                prevExplorerFiles.map(file => 
                    file.id === files[activeFile].id 
                        ? { ...file, content: newCode }
                        : file
                )
            );
            
            // Update folder files if the file is in a folder
            setFolders(prevFolders => 
                prevFolders.map(folder => ({
                    ...folder,
                    files: folder.files.map(file => 
                        file.id === files[activeFile].id 
                            ? { ...file, content: newCode }
                            : file
                    )
                }))
            );
        }
    };
    
    const handleCompile = () => {
        setProcessing(true);
        const formData = {
        language_id: compileLanguage.id,
        source_code: btoa(codeRef.current),
        stdin: btoa(""),
        };
        const options = {
        method: "POST",
        url: "https://judge0-ce.p.rapidapi.com/submissions",
        params: { base64_encoded: "true", fields: "*" },
        headers: {
            "content-type": "application/json",
            "Content-Type": "application/json",
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            "X-RapidAPI-Key": "64328505efmsh8da827dbfcfe3aep1168d0jsn82cfb00ffc59",
        },
        data: formData,
        };
    
        axios
        .request(options)
        .then(function (response) {
            console.log("res.data", response.data);
            const token = response.data.token;
            checkStatus(token);
        })
        .catch((err) => {
            let error = err.response ? err.response.data : err;
            // get error status
            let status = err.response.status;
            console.log("status", status);
            if (status === 429) {
            console.log("too many requests", status);
            }
            setProcessing(false);
            console.log("catch block...", error);
        });
    };
    
    const checkStatus = async (token) => {
        const options = {
        method: "GET",
        url: "https://judge0-ce.p.rapidapi.com/submissions" + "/" + token,
        params: { base64_encoded: "true", fields: "*" },
        headers: {
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            "X-RapidAPI-Key": "64328505efmsh8da827dbfcfe3aep1168d0jsn82cfb00ffc59",
        },
        };
        try {
        let response = await axios.request(options);
        let statusId = response.data.status?.id;
    
        if (statusId === 1 || statusId === 2) {
            // still processing
            setTimeout(() => {
            checkStatus(token);
            }, 2000);
            return;
        } else {
            setProcessing(false);
            const outputDetails = response.data;
            setOutputDetails(outputDetails);
            socketRef.current.emit('output-details', { roomId, outputDetails });
            console.log("response.data", response.data);
            return;
        }
        } catch (err) {
        console.log("err", err);
        setProcessing(false);
        }
    };

    const handleShowAllClients = () => {
        setShowAllClients(!showAllClients);
    };

    return (
        <div className={`flex flex-col h-screen w-full ${isDark ? 'dark' : ''}`}>
            {/* Header */}
            <header className="flex h-12 items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4">
                <div className="flex items-center gap-6">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <LuFileText className="w-5 h-5 text-blue-600" />
                        <span className="text-lg font-semibold text-gray-800 dark:text-white">CodeEditor Pro</span>
                    </div>

                    {/* Language Dropdown */}
                    <LanguagesDropdown onSelectChange={onSelectChange} language={language} />
                </div>

                <div className="flex items-center gap-6">
                    {/* Members Section */}
                    <div className="flex items-center gap-3 relative members-dropdown">
                        {/* Members Icon with Count */}
                        <button 
                            onClick={() => setShowMembersDropdown(!showMembersDropdown)}
                            className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-2 py-1 transition-colors"
                        >
                            <svg className="w-5 h-5 text-black dark:text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                            </svg>
                            <span className="text-sm text-black dark:text-white font-medium">{clients.length}</span>
                        </button>
                        
                        {/* Member Avatars */}
                        <div className="flex -space-x-1">
                            {clients.slice(0, 3).map((client, index) => (
                                <div key={client.socketId} className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                                    <span className="text-xs text-gray-600 dark:text-gray-300 font-semibold">
                                        {client.username.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Members Dropdown */}
                        {showMembersDropdown && (
                            <div className="absolute left-0 top-full mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
                                <div className="py-2">
                                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Members ({clients.length})</h3>
                                    </div>
                                    <div className="max-h-48 overflow-y-auto">
                                        {clients.map((client) => (
                                            <div key={client.socketId} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                                    <span className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
                                                        {client.username.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-gray-900 dark:text-white">{client.username}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2">
                                        <button
                                            onClick={() => {
                                                copyRoomId();
                                                setShowMembersDropdown(false);
                                            }}
                                            className="flex items-center gap-3 w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                                            </svg>
                                            Invite Others
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4">
                        {/* Save Button */}
                        <button className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                            <svg className="w-4 h-4 text-black dark:text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
                            </svg>
                            <span className="text-sm text-black dark:text-white font-medium">Save</span>
                        </button>

                        {/* Run Button */}
                        <button 
                            onClick={handleCompile}
                            className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                        >
                            <svg className="w-4 h-4 text-black dark:text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                            </svg>
                            <span className="text-sm text-black dark:text-white font-medium">Run</span>
                        </button>

                        {/* Share Button */}
                        <button className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                            <svg className="w-4 h-4 text-black dark:text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
                            </svg>
                            <span className="text-sm text-black dark:text-white font-medium">Share</span>
                        </button>

                        {/* Settings Button */}
                        <div className="relative settings-dropdown">
                            <button 
                                onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors" 
                                title="Settings"
                            >
                                <svg className="w-4 h-4 text-black dark:text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                                </svg>
                            </button>
                            {/* Settings Dropdown */}
                            {showSettingsDropdown && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                toggleTheme();
                                                setShowSettingsDropdown(false);
                                            }}
                                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/>
                                            </svg>
                                            {isDark ? 'Light Mode' : 'Dark Mode'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                copyRoomId();
                                                setShowSettingsDropdown(false);
                                            }}
                                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                                            </svg>
                                            Copy Room ID
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area - Left/Right Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Panel - Explorer + Editor */}
            <div className="flex flex-1">
                    {/* Explorer Sidebar */}
                    <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col">
                        {/* Explorer Header */}
                        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
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
                                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        {/* File Tree - Show folders and files */}
                        <div className="flex-1 overflow-y-auto p-2">
                            {/* Show folders */}
                            {folders.length > 0 && (
                                <div className="space-y-1 mb-2">
                                    {folders.map((folder) => (
                                        <div key={folder.id}>
                                            <div 
                                                className="flex items-center gap-1 px-2 py-1 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 group"
                                                onClick={() => toggleFolder(folder.id)}
                                            >
                                                <div className="p-0.5">
                                                    <svg className={`w-3 h-3 text-gray-500 transition-transform ${expandedFolders.includes(folder.id) ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                                                    </svg>
                                                </div>
                                                <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                                                </svg>
                                                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{folder.name}</span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedFolder(folder.id);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                                >
                                                    <LuPlus className="w-3 h-3 text-gray-500" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (window.confirm(`Are you sure you want to delete the folder "${folder.name}" and all its contents?`)) {
                                                            handleFolderDelete(folder.id);
                                                        }
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-200 dark:hover:bg-red-600 rounded"
                                                >
                                                    <LuX className="w-3 h-3 text-red-500" />
                                                </button>
                                            </div>
                                            
                                            {/* Folder files */}
                                            {expandedFolders.includes(folder.id) && (
                                                <div className="ml-6 space-y-1">
                                                    {folder.files.map((file) => {
                                                        const actualIndex = files.findIndex(f => f.id === file.id);
                                                        return (
                                                            <div
                                                                key={file.id}
                                                                className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer group ${
                                                                    activeFile === actualIndex 
                                                                        ? 'bg-blue-200 dark:bg-blue-700' 
                                                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                                                }`}
                                                                onClick={() => handleFileOpenFromExplorer(file)}
                                                            >
                                                                <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
                                                                </svg>
                                                                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{file.name}</span>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (window.confirm(`Are you sure you want to delete "${file.name}"?`)) {
                                                                            handleFileDeleteFromExplorer(file.id);
                                                                        }
                                                                    }}
                                                                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-200 dark:hover:bg-red-600 rounded"
                                                                >
                                                                    <LuX className="w-3 h-3 text-red-500" />
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Show root level files */}
                            {explorerFiles.filter(file => !file.folderId).length > 0 && (
                                <div className="space-y-1">
                                    {explorerFiles.filter(file => !file.folderId).map((file, index) => {
                                        const actualIndex = files.findIndex(f => f.id === file.id);
                                        return (
                                            <div
                                                key={file.id}
                                                className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer group ${
                                                    activeFile === actualIndex 
                                                        ? 'bg-blue-200 dark:bg-blue-700' 
                                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                                onClick={() => handleFileOpenFromExplorer(file)}
                                            >
                                                <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
                                                </svg>
                                                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{file.name}</span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (window.confirm(`Are you sure you want to delete "${file.name}"?`)) {
                                                            handleFileDeleteFromExplorer(file.id);
                                                        }
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-200 dark:hover:bg-red-600 rounded"
                                                >
                                                    <LuX className="w-3 h-3 text-red-500" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* New File Input */}
                            {showNewFileInput && (
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        value={newFileName}
                                        onChange={(e) => setNewFileName(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                if (newFileName.trim()) {
                                                    handleFileCreate(newFileName.trim());
                                                    setNewFileName('');
                                                    setShowNewFileInput(false);
                                                }
                                            } else if (e.key === 'Escape') {
                                                setShowNewFileInput(false);
                                                setNewFileName('');
                                            }
                                        }}
                                        onBlur={() => {
                                            setTimeout(() => {
                                                setShowNewFileInput(false);
                                                setNewFileName('');
                                            }, 200);
                                        }}
                                        placeholder="File name (e.g., main.py, app.js)..."
                                        className="w-full text-sm px-2 py-1 border border-blue-500 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                                        autoFocus
                                    />
                                </div>
                            )}

                            {/* New File Input for Folder */}
                            {selectedFolder && (
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        value={newFileName}
                                        onChange={(e) => setNewFileName(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                if (newFileName.trim()) {
                                                    handleFileCreateInFolder(newFileName.trim(), selectedFolder);
                                                    setNewFileName('');
                                                    setSelectedFolder(null);
                                                }
                                            } else if (e.key === 'Escape') {
                                                setSelectedFolder(null);
                                                setNewFileName('');
                                            }
                                        }}
                                        onBlur={() => {
                                            setTimeout(() => {
                                                setSelectedFolder(null);
                                                setNewFileName('');
                                            }, 200);
                                        }}
                                        placeholder="File name (e.g., main.py, app.js)..."
                                        className="w-full text-sm px-2 py-1 border border-blue-500 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                                        autoFocus
                                    />
                                </div>
                            )}

                            {/* New Folder Input */}
                            {showNewFolderInput && (
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                if (newFolderName.trim()) {
                                                    handleFolderCreate(newFolderName.trim());
                                                    setNewFolderName('');
                                                    setShowNewFolderInput(false);
                                                }
                                            } else if (e.key === 'Escape') {
                                                setShowNewFolderInput(false);
                                                setNewFolderName('');
                                            }
                                        }}
                                        onBlur={() => {
                                            setTimeout(() => {
                                                setShowNewFolderInput(false);
                                                setNewFolderName('');
                                            }, 200);
                                        }}
                                        placeholder="Folder name..."
                                        className="w-full text-sm px-2 py-1 border border-blue-500 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                                        autoFocus
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Editor Area */}
                    <div className="flex-1 flex flex-col">
                        {/* VS Code Tabs - Always show tab bar */}
                        <VSTabs 
                            files={files}
                            activeFile={activeFile}
                            onFileSelect={handleFileSelect}
                            onFileClose={handleFileDelete}
                        />
                        
                        {/* Editor */}
                        <div className="flex-1 flex flex-col">
                            {files.length > 0 ? (
                                <>
                                    <Editor 
                                        socketRef={socketRef} 
                                        roomId={roomId} 
                                        onCodeChange={onChange} 
                                        initialCode={code} 
                                        onSelectChange={onSelectChange} 
                                        language={compileLanguage} 
                                        files={files}
                                        activeFile={activeFile}
                                    />
                                    
                                    {/* Status Bar */}
                                    <div className="h-6 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center px-3 text-xs text-gray-600 dark:text-gray-400">
                                        {files[activeFile] && !files[activeFile].isWelcome ? (
                                            <div className="flex items-center gap-4">
                                                <span>{files[activeFile].name}</span>
                                                <span>{files[activeFile].language.name}</span>
                                                <span>Line {1}, Column {1}</span>
                                            </div>
                                        ) : (
                                            <span>No file selected</span>
                                        )}
                                    </div>
                                </>
                            ) : (
                                /* Empty State - Clean white editor like in the image */
                                <div className="flex-1 flex flex-col items-center justify-center bg-white">
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No files open</h3>
                                        <p className="text-gray-500 mb-4">Create a new file or open an existing one to get started</p>
                                        <button
                                            onClick={() => setShowNewFileInput(true)}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            <LuPlus className="w-4 h-4 mr-2" />
                                            New File
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel - Output */}
                <div className="w-80 border-l border-gray-200 dark:border-gray-700">
                    <VSOutputPanel outputDetails={outputDetails} />
                </div>
            </div>  
        </div>
    )
}

export default EditorPage    

