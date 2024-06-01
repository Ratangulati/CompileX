import React, { useEffect, useRef, useState } from 'react'
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/addon/edit/closebrackets'
import '../App.css'
import LanguagesDropdown from './LangDropdown';
import Client from './Client';

const Editor = ({socketRef, roomId, onCodeChange, initialCode, onSelectChange, language, clients, showAllClients, handleShowAllClients}) => {
    const [fontSize, setFontSize] = useState(() => {
        return localStorage.getItem('fontSize') || '13px';
    });
    const editorRef = useRef(null)
    

    useEffect(() => {
        async function init() {
            if (!editorRef.current) {
                editorRef.current = Codemirror.fromTextArea(document.getElementById('realtime'), {
                    mode: { name: 'javascript', json: true},
                    theme: 'dracula',
                    fontSize: fontSize,
                    autoCloseTags: true,
                    autoCloseBrackets: true,
                    lineNumbers: true,
                    
                });
                editorRef.current.setValue(initialCode);
    
                editorRef.current.on('change', (instance, changes) => {
                    const { origin } = changes;
                    const code = instance.getValue();
                    onCodeChange(code);
                    if (origin !== 'setValue') {
                        socketRef.current.emit('code-change', {
                            roomId,
                            code,
                        });
                    }
                });
            } 
        }
        init();
    }, [language]); 

    useEffect(() => {
        document.querySelector('.CodeMirror').style.fontSize = fontSize;
    }, [fontSize]);

    useEffect(() => {
        if(socketRef.current) {
            socketRef.current.on('code-change', ({code}) => {
                if (code !== null && editorRef.current.getValue() !== code) {
                    editorRef.current.setValue(code);
                }
            })
            return () => {
                socketRef.current.off('code-change');
            };
        }
    }, [socketRef.current])

    const handleFontSizeChange = (e) => {
        const newFontSize = e.target.value;
        setFontSize(newFontSize);
        localStorage.setItem('fontSize', newFontSize);
    };
 
    
    
    return (
        <div>
            <div className='flex justify-between'>
                <div className='flex justify-start mt-2 ml-1 gap-2'>
                    <select  className='' value={fontSize} onChange={handleFontSizeChange}>
                        <option value={'12px'}>12px</option>
                        <option value={'13px'}>13px</option>
                        <option value={'14px'}>14px</option>
                        <option value={'15px'}>15px</option>
                        <option value={'16px'}>16px</option>
                        <option value={'17px'}>17px</option>
                        <option value={'18px'}>18px</option>
                        <option value={'19px'}>19px</option>
                        <option value={'20px'}>20px</option>
                    </select>
                    <LanguagesDropdown onSelectChange={onSelectChange} language={language} />
                </div>
                <div>
                    <div className="flex items-center justify-end">
                        {showAllClients && (
                        <div className="grid grid-flow-col auto-cols-fr gap-3">
                            {clients.slice(1).map((client) => (  
                            <Client key={client.socketId} username={client.username} />
                            ))}
                        </div>
                        )}
                        <div className="flex items-center gap-3 ml-3">
                        {clients.length > 0 && (
                            <Client key={clients[0].socketId} username={clients[0].username} />
                        )}
                        {clients.length > 1 && (
                        <div className='flex pb-4 pt-1 '>
                            <button
                                className="flex items-center justify-center bg-[#1e293b] text-xs text-gray-600 dark:text-gray-300 rounded-full cursor-pointer h-8 w-8 hover:bg-gray-300 dark:hover:bg-gray-500"
                                onClick={handleShowAllClients}
                            >
                                +{clients.length - 1}
                            </button>
                        </div>
                        )}
                    </div>
                    </div> 
                </div>
            </div>
        <textarea id="realtime"></textarea>
    </div>
)
    
}

export default Editor  
