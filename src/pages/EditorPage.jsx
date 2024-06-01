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
import DownloadButton from '../components/Buttons/DownloadButton';




const EditorPage = () => {

const javascriptDefault = 
`let a = 3;
console.log(a)
`;

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
    const [language, setLanguage] = useState(languageOptions[0]);
    const [compileLanguage, setCompileLanguage] = useState(languageOptions[0]);
    const [showAllClients, setShowAllClients] = useState(false);


    
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
        socketRef.current.emit('language:change', { language: selectedLanguage, roomId });
    };

    const onSelectChange = (selectedLanguage) => {
        console.log("selected Option..", selectedLanguage);
        handleLanguageChange(selectedLanguage);
    };
    
    const onChange = (newCode) => {
        setCode(newCode);
        codeRef.current = newCode; 
        localStorage.setItem('code', newCode);
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
        <div className="flex h-screen w-full flex-col"> 
            <header className="flex h-16 items-center justify-between border-b bg-gray-100 px-6 dark:bg-gray-800">
                <div className="flex items-center gap-2 font-semibold">
                    <span className="h-6 w-6 text-red-600"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path fill-rule="evenodd" d="M14.447 3.026a.75.75 0 0 1 .527.921l-4.5 16.5a.75.75 0 0 1-1.448-.394l4.5-16.5a.75.75 0 0 1 .921-.527ZM16.72 6.22a.75.75 0 0 1 1.06 0l5.25 5.25a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 1 1-1.06-1.06L21.44 12l-4.72-4.72a.75.75 0 0 1 0-1.06Zm-9.44 0a.75.75 0 0 1 0 1.06L2.56 12l4.72 4.72a.75.75 0 0 1-1.06 1.06L.97 12.53a.75.75 0 0 1 0-1.06l5.25-5.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" /></svg></span>
                    <span className='text-[#fff] text-xl '>CompileX</span>
                </div>
                <div className="flex items-center gap-4">
                    <RunButton onClick={handleCompile} />
                    <DownloadButton code={code} />
                    <CopyButton  onClick={copyRoomId} />
                    <LeaveButton onClick={leaveRoom} />
                </div>
            </header>
            <div className="flex flex-1">
                <div className="flex flex-1 flex-col">
                    <div className="flex-1 overflow-auto p-3 pt-0">
                        <Editor socketRef={socketRef} roomId={roomId} onCodeChange={onChange} initialCode={code} onSelectChange={onSelectChange} language={compileLanguage} clients={clients} showAllClients={showAllClients} handleShowAllClients={handleShowAllClients} />
                    </div>
                    <div className="border-t-1 border-black bg-gray-100/40 p-3 dark:bg-gray-800/40">
                        <OutputWindow outputDetails={outputDetails} />
                    </div>
                </div>
            </div>  
        </div>
    )
}

export default EditorPage    

