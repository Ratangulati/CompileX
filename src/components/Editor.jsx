import React, { useEffect, useRef, useState } from 'react'
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/mode/clike/clike.js';
import 'codemirror/mode/python/python.js';
import 'codemirror/mode/go/go.js';
import 'codemirror/mode/rust/rust.js';
import 'codemirror/addon/edit/closebrackets'
import '../App.css'
import LanguagesDropdown from './Buttons/LangDropdown';
import Client from './Client';
import { useTheme } from '../contexts/ThemeContext';

const Editor = ({socketRef, roomId, onCodeChange, initialCode, onSelectChange, language, files, activeFile}) => {
    const [fontSize, setFontSize] = useState(() => {
        return localStorage.getItem('fontSize') || '13px';
    });
    const [fileName, setFileName] = useState('main.js');
    const [isEditingFileName, setIsEditingFileName] = useState(false);
    const editorRef = useRef(null);
    const { isDark } = useTheme();

    // Function to get CodeMirror mode based on language
    const getMode = (languageValue) => {
        const modeMap = {
            'javascript': 'javascript',
            'typescript': 'javascript', // Fallback to JavaScript mode
            'cpp': 'text/x-c++src',
            'java': 'text/x-java',
            'csharp': 'text/x-csharp',
            'go': 'text/x-go',
            'kotlin': 'text/x-kotlin',
            'python': 'python',
            'rust': 'rust'
        };
        return modeMap[languageValue] || 'javascript';
    };
    

    useEffect(() => {
        async function init() {
            if (!editorRef.current) {
                editorRef.current = Codemirror.fromTextArea(document.getElementById('realtime'), {
                    mode: getMode(language?.value || 'javascript'),
                    theme: isDark ? 'material' : 'default',
                    fontSize: fontSize,
                    autoCloseTags: true,
                    autoCloseBrackets: true,
                    lineNumbers: true,
                    indentUnit: 2,
                    tabSize: 2,
                    indentWithTabs: false,
                    electricChars: true,
                    matchBrackets: true,
                    foldGutter: true,
                    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
                    lineWrapping: false
                    
                });
                editorRef.current.setValue(initialCode || '');
                
                // Apply overflow styling after initialization
                setTimeout(() => {
                    const codeMirrorElement = document.querySelector('.CodeMirror');
                    if (codeMirrorElement) {
                        codeMirrorElement.style.overflowX = 'auto';
                        codeMirrorElement.style.width = '100%';
                        codeMirrorElement.style.height = '100%';
                    }
                }, 100);
    
                editorRef.current.on('change', (instance, changes) => {
                    const { origin } = changes;
                    const code = instance.getValue();
                    onCodeChange(code);
                    if (origin !== 'setValue' && socketRef.current && files && activeFile !== null && files[activeFile]) {
                        socketRef.current.emit('code-change', {
                            roomId,
                            code,
                            fileId: files[activeFile].id
                        });
                    }
                });
            } 
        }
        init();
    }, []);

    // Effect to update editor content when initialCode changes
    useEffect(() => {
        if (editorRef.current && initialCode !== undefined) {
            const currentValue = editorRef.current.getValue();
            if (currentValue !== initialCode) {
                // Only update if the change is significant (not just cursor movement)
                const cursor = editorRef.current.getCursor();
                
                // Use setValue with cursor preservation
                editorRef.current.setValue(initialCode);
                
                // Restore cursor position if it's still valid
                if (cursor.line < editorRef.current.lineCount()) {
                    editorRef.current.setCursor(cursor);
                }
            }
        }
    }, [initialCode]);

    // Effect to change language mode when language changes
    useEffect(() => {
        if (editorRef.current && language) {
            const newMode = getMode(language.value);
            editorRef.current.setOption('mode', newMode);
        }
    }, [language]);

    // Effect to change theme when dark mode changes
    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.setOption('theme', isDark ? 'material' : 'default');
        }
    }, [isDark]); 

    useEffect(() => {
        const codeMirrorElement = document.querySelector('.CodeMirror');
        if (codeMirrorElement) {
            codeMirrorElement.style.fontSize = fontSize;
            codeMirrorElement.style.overflowX = 'auto';
            codeMirrorElement.style.width = '100%';
            codeMirrorElement.style.height = '100%';
        }
    }, [fontSize]);

    useEffect(() => {
        if(socketRef.current) {
            const handleCodeChange = ({code, fileId}) => {
                // Only update if the change is for the currently active file
                if (files && activeFile !== null && files[activeFile]) {
                    const currentFile = files[activeFile];
                    if (fileId === currentFile.id && code !== null && editorRef.current && editorRef.current.getValue() !== code) {
                        // Preserve cursor position when updating from other users
                        const cursor = editorRef.current.getCursor();
                        
                        // Use setValue with cursor preservation
                        editorRef.current.setValue(code);
                        
                        // Restore cursor position if it's still valid
                        if (cursor.line < editorRef.current.lineCount()) {
                            editorRef.current.setCursor(cursor);
                        }
                    }
                }
            };
            
            socketRef.current.on('code-change', handleCodeChange);
            
            return () => {
                if (socketRef.current) {
                    socketRef.current.off('code-change', handleCodeChange);
                }
            };
        }
    }, [socketRef.current, files, activeFile])

    const handleFontSizeChange = (e) => {
        const newFontSize = e.target.value;
        setFontSize(newFontSize);
        localStorage.setItem('fontSize', newFontSize);
    };
 
    
    const handleFileNameChange = (e) => {
        setFileName(e.target.value);
    };

    const handleFileNameKeyPress = (e) => {
        if (e.key === 'Enter') {
            setIsEditingFileName(false);
        }
    };

    const handleFileNameBlur = () => {
        setIsEditingFileName(false);
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900">
            {/* Code Editor Area */}
            <div className="flex-1 relative">
                <textarea id="realtime" className="w-full h-full bg-white dark:bg-gray-900"></textarea>
            </div>
        </div>
    )
    
}

export default Editor  
