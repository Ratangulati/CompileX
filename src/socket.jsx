import {io} from 'socket.io-client'

export const initSocket = async () => {
    const options = {
        'force new connection': true,
        reconnectionAttempts: Infinity,
        timeout: 10000,
        transports: ['websocket'],
    }

    // Get backend URL from environment variable or use current origin
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || window.location.origin;
    console.log('Connecting to backend:', BACKEND_URL);
    
    return io(BACKEND_URL, options);
}