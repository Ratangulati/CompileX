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
import { LuFileText, LuMenu, LuX, LuPlus, LuSettings, LuSave, LuFolder, LuFolderOpen, LuFile, LuChevronRight, LuCopy } from "react-icons/lu";
import { SettingsButton } from '../components/Buttons/SettingsButton';
import ThemeToggle from '../components/Buttons/ThemeToggle';
import VSTabs from '../components/VSTabs';
import VSOutputPanel from '../components/VSOutputPanel';
import { useTheme } from '../contexts/ThemeContext';
import { FiPlay, FiUsers, FiSun, FiMoon, FiFileText } from "react-icons/fi";
import { IoPlayOutline } from 'react-icons/io5';
import { GoShareAndroid } from 'react-icons/go';
import FileExplorer from '../components/FileExplorer';






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
    const [code, setCode] = useState(() => {
        const filesSaved = localStorage.getItem('files');
        if (filesSaved) {
            const parsedFiles = JSON.parse(filesSaved);
            if (parsedFiles.length > 0 && !parsedFiles[0].isWelcome) {
                return parsedFiles[0].content || '';
            }
        }
        return javascriptDefault;
    });
    const [outputDetails, setOutputDetails] = useState(null);
    const [language, setLanguage] = useState(() => {
        const filesSaved = localStorage.getItem('files');
        if (filesSaved) {
            const parsedFiles = JSON.parse(filesSaved);
            if (parsedFiles.length > 0 && !parsedFiles[0].isWelcome) {
                return parsedFiles[0].language || languageOptions[0];
            }
        }
        const languageSaved = localStorage.getItem('selectedLanguage');
        return languageSaved ? JSON.parse(languageSaved) : languageOptions[0];
    });
    const [compileLanguage, setCompileLanguage] = useState(() => {
        const filesSaved = localStorage.getItem('files');
        if (filesSaved) {
            const parsedFiles = JSON.parse(filesSaved);
            if (parsedFiles.length > 0 && !parsedFiles[0].isWelcome) {
                return parsedFiles[0].language || languageOptions[0];
            }
        }
        const languageSaved = localStorage.getItem('selectedLanguage');
        return languageSaved ? JSON.parse(languageSaved) : languageOptions[0];
    });
    // Explorer files - persistent file system (room-specific)
    const [explorerFiles, setExplorerFiles] = useState([]);
    
    // Open tabs - files currently open in editor (room-specific)
    const [files, setFiles] = useState([]);
    const [activeFile, setActiveFile] = useState(0);
    const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
    const [showMembersDropdown, setShowMembersDropdown] = useState(false);
    const [showNewFileInput, setShowNewFileInput] = useState(false);
    const [showNewFolderInput, setShowNewFolderInput] = useState(false);
    const [newFileName, setNewFileName] = useState('');
    const [newFolderName, setNewFolderName] = useState('');
    const [folders, setFolders] = useState([]);
    const [expandedFolders, setExpandedFolders] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [renamingItem, setRenamingItem] = useState(null);
    const [renameValue, setRenameValue] = useState('');
    const { isDark, toggleTheme } = useTheme();
    const [isRunning, setIsRunning] = useState(false);

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

    // Note: Files are now room-specific and stored in database, not localStorage

    // Note: Auto-expand logic removed since folders are now room-specific

    // Note: Editor content is now initialized from room state, not localStorage

    
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

            // Handle room state from database
            socketRef.current.on('room-state', ({ files: dbFiles, folders: dbFolders, explorerFiles: dbExplorerFiles, expandedFolders: dbExpandedFolders, activeFile: dbActiveFile, currentLanguage: dbCurrentLanguage, currentCode: dbCurrentCode }) => {
                console.log('Received room state from database:', { dbFiles, dbFolders, dbExplorerFiles, dbExpandedFolders, dbActiveFile, dbCurrentLanguage, dbCurrentCode });
                
                // Clear localStorage for this room to ensure room isolation
                localStorage.removeItem('files');
                localStorage.removeItem('explorerFiles');
                localStorage.removeItem('folders');
                localStorage.removeItem('expandedFolders');
                
                // Load room state from database instead of localStorage
                if (dbFiles && dbFiles.length > 0) {
                    setFiles(dbFiles);
                    setActiveFile(dbActiveFile || 0);
                    setCode(dbCurrentCode || '');
                    setLanguage(dbCurrentLanguage || languageOptions[0]);
                    setCompileLanguage(dbCurrentLanguage || languageOptions[0]);
                    codeRef.current = dbCurrentCode || '';
                } else {
                    // If no files in database, start with empty state
                    setFiles([]);
                    setActiveFile(0);
                    setCode('');
                    setLanguage(languageOptions[0]);
                    setCompileLanguage(languageOptions[0]);
                    codeRef.current = '';
                }
                
                if (dbFolders && dbFolders.length > 0) {
                    setFolders(dbFolders);
                } else {
                    setFolders([]);
                }
                
                if (dbExplorerFiles && dbExplorerFiles.length > 0) {
                    setExplorerFiles(dbExplorerFiles);
                } else {
                    setExplorerFiles([]);
                }
                
                if (dbExpandedFolders && dbExpandedFolders.length > 0) {
                    setExpandedFolders(dbExpandedFolders);
                } else {
                    setExpandedFolders([]);
                }
            });

            // Handle room state updates from other users
            socketRef.current.on('room-state-update', ({ files: updatedFiles, folders: updatedFolders, explorerFiles: updatedExplorerFiles, expandedFolders: updatedExpandedFolders, activeFile: updatedActiveFile }) => {
                console.log('Received room state update:', { updatedFiles, updatedFolders, updatedExplorerFiles, updatedExpandedFolders, updatedActiveFile });
                
                if (updatedFiles) setFiles(updatedFiles);
                if (updatedFolders) setFolders(updatedFolders);
                if (updatedExplorerFiles) setExplorerFiles(updatedExplorerFiles);
                if (updatedExpandedFolders) setExpandedFolders(updatedExpandedFolders);
                if (updatedActiveFile !== undefined) setActiveFile(updatedActiveFile);
            });

            if (!hasJoinedRoom) {
              setHasJoinedRoom(true);
              socketRef.current.emit('join', { roomId, username: location.state?.username });
            } else {
              console.log('User already  joined the room');
            }

            socketRef.current.on('language:change', ({ language, fileId }) => {
                // Only update language if it's for the currently active file
                if (files[activeFile] && files[activeFile].id === fileId) {
                setLanguage(language);
                setCompileLanguage(language);
                    
                    // Only update the active file's language, don't change its content
                    if (!files[activeFile].isWelcome) {
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
                }
                
                // toast.success(`Language changed to ${language.label}`);
            });

            socketRef.current.on('output-details', ({ outputDetails }) => {
                setOutputDetails(outputDetails);
            });

            // Handle real-time code changes from other users
            socketRef.current.on('code-change', ({ code, fileId }) => {
                if (fileId && files[activeFile] && files[activeFile].id === fileId) {
                    setCode(code);
                    codeRef.current = code;
                }
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

    const handleLeaveRoom = () => {
        // Disconnect from socket
        if (socketRef.current) {
            socketRef.current.disconnect();
        }
        
        // Clear local state
        setFiles([]);
        setExplorerFiles([]);
        setFolders([]);
        setClients([]);
        setCode('');
        setOutputDetails('');
        
        // Navigate to home
        reactNavigator('/');
    };

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
        
        socketRef.current.emit('language:change', { 
            language: selectedLanguage, 
            roomId,
            fileId: files[activeFile]?.id
        });
    };

    // Function to detect language from file extension
    const getLanguageFromExtension = (fileName) => {
        // Handle files without extensions
        if (!fileName.includes('.')) {
            return languageOptions.find(lang => lang.value === 'javascript'); // Default to JavaScript for files without extensions
        }
        
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
            'rs': languageOptions.find(lang => lang.value === 'rust'),
            'txt': languageOptions.find(lang => lang.value === 'javascript') // Treat .txt as JavaScript
        };
        return extensionMap[extension] || languageOptions.find(lang => lang.value === 'javascript') || languageOptions[0]; // Default to JavaScript
    };

    // Folder management functions
    const handleFolderCreate = (folderName, parentFolderId = null) => {
        const newFolder = {
            id: Date.now(),
            name: folderName,
            files: [],
            parentFolderId: parentFolderId
        };
        console.log('Creating folder:', newFolder);
        
        if (parentFolderId) {
            // Create folder inside another folder
            setFolders(prevFolders => 
                prevFolders.map(folder => 
                    folder.id === parentFolderId 
                        ? { ...folder, folders: [...(folder.folders || []), newFolder] }
                        : folder
                )
            );
        } else {
            // Create root level folder
            setFolders(prevFolders => {
                const updated = [...prevFolders, newFolder];
                console.log('Updated folders:', updated);
                return updated;
            });
        }
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
            content: '', // Empty content instead of default code
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
            if (prevFiles.length === 0 || (prevFiles.length === 1 && prevFiles[0].isWelcome)) {
                return [newFile];
            }
            return [...prevFiles, newFile];
        });
        setActiveFile(files.length);
        setCode(newFile.content);
        setLanguage(detectedLanguage);
        setCompileLanguage(detectedLanguage);
        codeRef.current = newFile.content;
        
        // Force CodeMirror to update its content
        setTimeout(() => {
            const codeMirrorElement = document.querySelector('.CodeMirror');
            if (codeMirrorElement && codeMirrorElement.CodeMirror) {
                codeMirrorElement.CodeMirror.setValue(newFile.content);
            }
        }, 100);
        
        // Emit room state update to persist file creation
        setTimeout(() => {
            // Use the updated state values instead of stale ones
            const updatedFiles = files.length === 0 || (files.length === 1 && files[0].isWelcome) 
                ? [newFile] 
                : [...files, newFile];
            const updatedExplorerFiles = [...explorerFiles, newFile];
            const updatedFolders = folders.map(folder => 
                folder.id === folderId 
                    ? { ...folder, files: [...folder.files, newFile] }
                    : folder
            );
            
            emitRoomStateUpdate({
                files: updatedFiles,
                explorerFiles: updatedExplorerFiles,
                folders: updatedFolders,
                activeFile: files.length,
                currentLanguage: detectedLanguage,
                currentCode: newFile.content
            });
        }, 200);
    };

    // File management functions
    const handleFileCreate = (fileName) => {
        const detectedLanguage = getLanguageFromExtension(fileName);
        
        // Only add to folder if a folder is explicitly selected
        const targetFolderId = selectedFolder;
        
        const newFile = {
            id: Date.now(),
            name: fileName,
            content: '', // Empty content instead of default code
            language: detectedLanguage,
            isWelcome: false,
            folderId: targetFolderId
        };
        
        // Add to explorer files (persistent file system)
        setExplorerFiles(prev => [...prev, newFile]);
        
        // If file is being added to a folder, update the folder's files
        if (targetFolderId) {
            setFolders(prevFolders => 
                prevFolders.map(folder => 
                    folder.id === targetFolderId 
                        ? { ...folder, files: [...folder.files, newFile] }
                        : folder
                )
            );
        }
        
        // If no files are open or only welcome page exists, replace it
        if (files.length === 0 || (files.length === 1 && files[0].isWelcome)) {
            setFiles([newFile]);
            setActiveFile(0);
        } else {
            setFiles(prevFiles => [...prevFiles, newFile]);
            setActiveFile(files.length);
        }
        
        // Update current language and code
        setLanguage(detectedLanguage);
        setCompileLanguage(detectedLanguage);
        setCode(newFile.content);
        codeRef.current = newFile.content;
        
        // Force CodeMirror to update its content
        setTimeout(() => {
            const codeMirrorElement = document.querySelector('.CodeMirror');
            if (codeMirrorElement && codeMirrorElement.CodeMirror) {
                codeMirrorElement.CodeMirror.setValue(newFile.content);
            }
        }, 100);
        
        // Emit room state update to persist file creation
        setTimeout(() => {
            // Use the updated state values instead of stale ones
            const updatedFiles = files.length === 0 || (files.length === 1 && files[0].isWelcome) 
                ? [newFile] 
                : [...files, newFile];
            const updatedExplorerFiles = [...explorerFiles, newFile];
            const updatedFolders = targetFolderId ? folders.map(folder => 
                folder.id === targetFolderId 
                    ? { ...folder, files: [...folder.files, newFile] }
                    : folder
            ) : folders;
            const newActiveFile = files.length === 0 || (files.length === 1 && files[0].isWelcome) ? 0 : files.length;
            
            emitRoomStateUpdate({
                files: updatedFiles,
                explorerFiles: updatedExplorerFiles,
                folders: updatedFolders,
                activeFile: newActiveFile,
                currentLanguage: detectedLanguage,
                currentCode: newFile.content
            });
        }, 200);
        
        // Update localStorage
        localStorage.setItem('selectedLanguage', JSON.stringify(detectedLanguage));
        
        // Emit language change to other clients
        if (socketRef.current) {
            socketRef.current.emit('language:change', { 
                language: detectedLanguage,
                fileId: newFile.id
            });
        }

        // Emit room state update to database
        setTimeout(() => {
            emitRoomStateUpdate({
                files: files.length === 0 || (files.length === 1 && files[0].isWelcome) ? [newFile] : [...files, newFile],
                folders: targetFolderId ? folders.map(folder => 
                    folder.id === targetFolderId 
                        ? { ...folder, files: [...folder.files, newFile] }
                        : folder
                ) : folders,
                explorerFiles: [...explorerFiles, newFile]
            });
        }, 100);
    };

    const handleFileSelect = (index) => {
        setActiveFile(index);
        const selectedFile = files[index];
        setCode(selectedFile.content);
        setLanguage(selectedFile.language);
        setCompileLanguage(selectedFile.language);
        codeRef.current = selectedFile.content;
        
        // Force CodeMirror to update its content
        setTimeout(() => {
            const codeMirrorElement = document.querySelector('.CodeMirror');
            if (codeMirrorElement && codeMirrorElement.CodeMirror) {
                codeMirrorElement.CodeMirror.setValue(selectedFile.content);
            }
        }, 50);
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
            
            // Force CodeMirror to update its content
            setTimeout(() => {
                const codeMirrorElement = document.querySelector('.CodeMirror');
                if (codeMirrorElement && codeMirrorElement.CodeMirror) {
                    codeMirrorElement.CodeMirror.setValue(file.content);
                }
            }, 50);
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
        const newExplorerFiles = explorerFiles.filter(file => file.id !== fileId);
        setExplorerFiles(newExplorerFiles);
        
        // Remove from open tabs if it's currently open
        const newFiles = files.filter(file => file.id !== fileId);
        setFiles(newFiles);
        
        // Remove from folder if it exists in a folder
        const newFolders = folders.map(folder => ({
                ...folder,
                files: folder.files.filter(file => file.id !== fileId)
        }));
        setFolders(newFolders);
        
        // Update active file if needed
        if (files.some(file => file.id === fileId)) {
            const deletedFileIndex = files.findIndex(file => file.id === fileId);
            if (deletedFileIndex !== -1) {
                if (newFiles.length > 0) {
                    const newActiveFile = Math.min(activeFile, newFiles.length - 1);
                    setActiveFile(newActiveFile);
                    setCode(newFiles[newActiveFile].content);
                    setLanguage(newFiles[newActiveFile].language);
                    setCompileLanguage(newFiles[newActiveFile].language);
                } else {
                    setActiveFile(0);
                    setCode('');
                }
            }
        }
        
        // Emit room state update to persist file deletion
        setTimeout(() => {
            emitRoomStateUpdate({
                files: newFiles,
                explorerFiles: newExplorerFiles,
                folders: newFolders,
                activeFile: newFiles.length > 0 ? Math.min(activeFile, newFiles.length - 1) : 0,
                currentCode: newFiles.length > 0 ? newFiles[Math.min(activeFile, newFiles.length - 1)].content : ''
            });
        }, 200);
    };

    const handleFolderDelete = (folderId) => {
        const folderToDelete = folders.find(f => f.id === folderId);
        if (!folderToDelete) return;
        
        // Remove folder and all its files
        setFolders(prevFolders => prevFolders.filter(folder => folder.id !== folderId));
        
        // Remove all files from this folder from the main files array
        setFiles(prevFiles => prevFiles.filter(file => file.folderId !== folderId));
        
        // Remove all files from this folder from explorer files
        setExplorerFiles(prevFiles => prevFiles.filter(file => file.folderId !== folderId));
        
        // Update room state
        if (socketRef.current) {
            const stateData = {
                files: files.filter(file => file.folderId !== folderId),
                folders: folders.filter(folder => folder.id !== folderId),
                explorerFiles: explorerFiles.filter(file => file.folderId !== folderId),
                expandedFolders: expandedFolders.filter(id => id !== folderId),
                activeFile,
                currentLanguage: language,
                currentCode: code
            };
            socketRef.current.emit('room-state-update', { roomId, stateData });
        }
        
        toast.success(`Deleted folder: ${folderToDelete.name}`);
    };
    
    // New file management functions for the improved system
    const handleFileRename = (fileId, newName) => {
        const detectedLanguage = getLanguageFromExtension(newName);
        
        // Update in explorer files
        setExplorerFiles(prevExplorerFiles => 
            prevExplorerFiles.map(file => 
                file.id === fileId 
                    ? { ...file, name: newName, language: detectedLanguage }
                    : file
            )
        );
        
        // Update in open tabs
        setFiles(prevFiles => 
            prevFiles.map(file => 
                file.id === fileId 
                    ? { ...file, name: newName, language: detectedLanguage }
                    : file
            )
        );
        
        // Update in folder files
        setFolders(prevFolders => 
            prevFolders.map(folder => ({
                ...folder,
                files: folder.files.map(file => 
                    file.id === fileId 
                        ? { ...file, name: newName, language: detectedLanguage }
                        : file
                )
            }))
        );
        
        // Update room state
        if (socketRef.current) {
            const stateData = {
                files: files.map(file => 
                    file.id === fileId 
                        ? { ...file, name: newName, language: detectedLanguage }
                        : file
                ),
                folders,
                explorerFiles: explorerFiles.map(file => 
                    file.id === fileId 
                        ? { ...file, name: newName, language: detectedLanguage }
                        : file
                ),
                expandedFolders,
                activeFile,
                currentLanguage: language,
                currentCode: code
            };
            socketRef.current.emit('room-state-update', { roomId, stateData });
        }
        
        toast.success(`Renamed file to: ${newName}`);
    };
    
    const handleFolderRename = (folderId, newName) => {
        setFolders(prevFolders => 
            prevFolders.map(folder => 
                folder.id === folderId 
                    ? { ...folder, name: newName }
                    : folder
            )
        );
        
        // Update room state
        if (socketRef.current) {
            const stateData = {
                files,
                folders: folders.map(folder => 
                    folder.id === folderId 
                        ? { ...folder, name: newName }
                        : folder
                ),
                explorerFiles,
                expandedFolders,
                activeFile,
                currentLanguage: language,
                currentCode: code
            };
            socketRef.current.emit('room-state-update', { roomId, stateData });
        }
        
        toast.success(`Renamed folder to: ${newName}`);
    };
    
    const handleFileSelectById = (fileId) => {
        const fileIndex = files.findIndex(f => f.id === fileId);
        if (fileIndex !== -1) {
            handleFileSelect(fileIndex);
        } else {
            // File is not open, open it from explorer
            const file = explorerFiles.find(f => f.id === fileId);
            if (file) {
                handleFileOpenFromExplorer(file);
            }
        }
    };

    // Rename functions
    const handleRenameStart = (item, currentName) => {
        setRenamingItem(item);
        setRenameValue(currentName);
    };

    const handleRenameConfirm = () => {
        if (!renamingItem || !renameValue.trim()) return;

        if (renamingItem.type === 'folder') {
            setFolders(prevFolders => 
                prevFolders.map(folder => 
                    folder.id === renamingItem.id 
                        ? { ...folder, name: renameValue.trim() }
                        : folder
                )
            );
        } else if (renamingItem.type === 'file') {
            const detectedLanguage = getLanguageFromExtension(renameValue.trim());
            
            // Update in explorer files
            setExplorerFiles(prevExplorerFiles => 
                prevExplorerFiles.map(file => 
                    file.id === renamingItem.id 
                        ? { ...file, name: renameValue.trim(), language: detectedLanguage }
                        : file
                )
            );
            
            // Update in open tabs
            setFiles(prevFiles => 
                prevFiles.map(file => 
                    file.id === renamingItem.id 
                        ? { ...file, name: renameValue.trim(), language: detectedLanguage }
                        : file
                )
            );
            
            // Update in folder files
            setFolders(prevFolders => 
                prevFolders.map(folder => ({
                    ...folder,
                    files: folder.files.map(file => 
                        file.id === renamingItem.id 
                            ? { ...file, name: renameValue.trim(), language: detectedLanguage }
                            : file
                    )
                }))
            );
        }

        setRenamingItem(null);
        setRenameValue('');
    };

    const handleRenameCancel = () => {
        setRenamingItem(null);
        setRenameValue('');
    };

    // Function to emit room state updates to database
    const emitRoomStateUpdate = (stateData) => {
        if (socketRef.current) {
            socketRef.current.emit('room-state-update', {
                roomId,
                stateData
            });
        }
    };

    const onSelectChange = (selectedLanguage) => {
        console.log("selected Option..", selectedLanguage);
        handleLanguageChange(selectedLanguage);
    };
    
    const onChange = (newCode) => {
        // Update the current editor display
        setCode(newCode);
        codeRef.current = newCode; 
        
        // Update the active file content in open tabs
        if (files[activeFile] && !files[activeFile].isWelcome) {
            const updatedFiles = [...files];
            updatedFiles[activeFile] = {
                ...updatedFiles[activeFile],
                content: newCode
            };
            setFiles(updatedFiles);
            
            // Also update the file content in explorer files (persistent storage)
            const updatedExplorerFiles = explorerFiles.map(file => 
                    file.id === files[activeFile].id 
                        ? { ...file, content: newCode }
                        : file
            );
            setExplorerFiles(updatedExplorerFiles);
            
            // Update folder files if the file is in a folder
            const updatedFolders = folders.map(folder => ({
                    ...folder,
                    files: folder.files.map(file => 
                        file.id === files[activeFile].id 
                            ? { ...file, content: newCode }
                            : file
                    )
            }));
            setFolders(updatedFolders);

            // Debounce room state updates to avoid excessive database calls
            if (window.roomStateUpdateTimeout) {
                clearTimeout(window.roomStateUpdateTimeout);
            }
            window.roomStateUpdateTimeout = setTimeout(() => {
            emitRoomStateUpdate({
                files: updatedFiles,
                explorerFiles: updatedExplorerFiles,
                folders: updatedFolders
            });
            }, 500); // Wait 500ms before updating database
        }
    };

    const onRunClick = () => {
        setIsRunning(true); // set running state
        handleCompile(); // start compilation
        // Note: setIsRunning(false) will be called in handleCompile when processing is done
      };

      
    
    const handleCompile = () => {
        // Check if we have code to compile
        if (!codeRef.current || codeRef.current.trim() === '') {
            alert('Please write some code before running!');
            return;
        }

        // Check if we have a valid language selected
        if (!compileLanguage || !compileLanguage.id) {
            alert('Please select a programming language!');
            return;
        }

        setProcessing(true);
        console.log('Compiling code:', codeRef.current);
        console.log('Language ID:', compileLanguage.id);
        
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
            console.log("Submission response:", response.data);
            const token = response.data.token;
            if (token) {
            checkStatus(token);
            } else {
                console.error("No token received from API");
                setProcessing(false);
                setIsRunning(false);
                alert('Failed to submit code for compilation. Please try again.');
            }
        })
        .catch((err) => {
            let error = err.response ? err.response.data : err;
            let status = err.response ? err.response.status : null;
            
            console.error("Compilation error:", error);
            console.error("Status:", status);
            
            setProcessing(false);
            setIsRunning(false);
            
            if (status === 429) {
                alert('Too many requests. Please wait a moment and try again.');
            } else if (status === 401) {
                alert('API key issue. Please contact support.');
            } else if (status === 403) {
                alert('Access forbidden. Please check your API key.');
            } else {
                alert('Failed to compile code. Please check your code and try again.');
            }
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
            
            console.log("Status check response:", response.data);
            console.log("Status ID:", statusId);
    
        if (statusId === 1 || statusId === 2) {
            // still processing
                console.log("Code is still processing, checking again in 2 seconds...");
            setTimeout(() => {
            checkStatus(token);
            }, 2000);
            return;
        } else {
            setProcessing(false);
                setIsRunning(false);
            const outputDetails = response.data;
            setOutputDetails(outputDetails);
                
                // Emit to other clients if socket is available
                if (socketRef.current) {
            socketRef.current.emit('output-details', { roomId, outputDetails });
                }
                
                console.log("Final compilation result:", response.data);
            return;
        }
        } catch (err) {
            console.error("Error checking status:", err);
        setProcessing(false);
            setIsRunning(false);
            alert('Failed to get compilation result. Please try again.');
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

                <div className="flex items-center gap-2">
                    {/* Members Section */}
                    <div className="flex items-center gap-3 relative members-dropdown">
                        {/* Members Icon with Count */}
                        <button 
                            onClick={() => setShowMembersDropdown(!showMembersDropdown)}
                            className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-2 py-1 transition-colors"
                        >
                            <FiUsers className="w-4 h-4 text-black dark:text-white" />
                            <span className="text-sm text-black dark:text-white font-medium">{clients.length}</span>
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
                        </button>

                        {/* Members Dropdown */}
                        {showMembersDropdown && (
                            <div className="absolute left-0 top-full mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                                <div className="py-2">
                                    <div className="px-4 py-2">
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Collaborators </h3>
                                    </div>
                                    <div className="max-h-36 overflow-y-auto">
                                        {clients.map((client) => (
                                            <div key={client.socketId} className="flex items-center gap-3 px-4 py-2">
                                                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                                    <span className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
                                                        {client.username.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-gray-900 dark:text-white">{client.username}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t border-gray-200 dark:border-gray-700 mx-3 py-2 space-y-2">
                                        <button
                                            onClick={() => {
                                                copyRoomId();
                                                setShowMembersDropdown(false);
                                            }}
                                            className="flex justify-center items-center gap-3 w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 rounded-lg p-1 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            Invite Others
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleLeaveRoom();
                                                setShowMembersDropdown(false);
                                            }}
                                            className="flex justify-center items-center gap-3 w-full text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 rounded-lg p-1 border border-red-200 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            Leave Room
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                <div className="flex items-center gap-2">
                        {/* Save Button */}
                        <button className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                        <LuSave className="w-4 h-4 text-black dark:text-white" />

                            <span className="text-sm text-black dark:text-white font-medium">Save</span>
                        </button>

                        {/* Run Button */}
                        <button
                            onClick={onRunClick}
                            disabled={isRunning} // optional: prevent double clicks
                            className={`flex items-center gap-2 px-3 py-1 rounded transition-colors 
                                ${isRunning ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                            >
                            <FiPlay className={`w-4 h-4 ${isRunning ? "text-gray-500" : "text-black dark:text-white"}`} />
                            <span className={`text-sm font-medium ${isRunning ? "text-gray-500" : "text-black dark:text-white"}`}>
                                {isRunning ? "Running..." : "Run"}
                            </span>
                        </button>
                        {/* Share Button */}
                        <button className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                            <GoShareAndroid className="w-4 h-4 text-black dark:text-white" />
                            <span className="text-sm text-black dark:text-white font-medium">Share</span>
                        </button>

                        {/* Settings Button */}
                        <div className="relative settings-dropdown">
                            <button 
                                onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors" 
                                title="Settings"
                            >
                                <LuSettings className={`w-4 h-4 text-black dark:text-white transition-transform duration-200 ${
                                    showSettingsDropdown ? 'rotate-180' : 'rotate-0'
                                }`} />
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
                                            {isDark ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
                                            {isDark ? 'Light Mode' : 'Dark Mode'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                copyRoomId();
                                                setShowSettingsDropdown(false);
                                            }}
                                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            <LuCopy className="w-4 h-4" />
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
                    {/* File Explorer */}
                    <FileExplorer
                        isOpen={true}
                        onClose={() => {}}
                        files={explorerFiles}
                        folders={folders}
                        expandedFolders={expandedFolders}
                        activeFile={files[activeFile]?.id}
                        onFileSelect={handleFileSelectById}
                        onFileCreate={handleFileCreate}
                        onFileDelete={handleFileDeleteFromExplorer}
                        onFileRename={handleFileRename}
                        onFolderCreate={handleFolderCreate}
                        onFolderDelete={handleFolderDelete}
                        onFolderRename={handleFolderRename}
                        onFolderToggle={toggleFolder}
                        onFileMove={() => {}} // TODO: Implement file move functionality
                    />
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
                                        language={language} 
                                        files={files}
                                        activeFile={activeFile}
                                    />
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                                    <div className="text-center">
                                        <LuFileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No files open</h3>
                                        <p className="text-gray-500 dark:text-gray-400">Create a new file or open an existing one to start coding</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel - Output */}
                <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <VSOutputPanel outputDetails={outputDetails} />
                </div>
            </div>  
        </div>
    );
};

export default EditorPage;
