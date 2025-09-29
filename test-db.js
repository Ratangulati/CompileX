// Test script to verify database functionality
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('✅ Connected to server');
    
    // Test joining a room
    socket.emit('join', { 
        roomId: 'test-room-123', 
        username: 'test-user' 
    });
});

socket.on('join', ({ clients }) => {
    console.log('✅ Joined room successfully');
    console.log('Clients in room:', clients);
});

socket.on('room-state', (roomData) => {
    console.log('✅ Received room state from database:');
    console.log('- Files:', roomData.files?.length || 0);
    console.log('- Folders:', roomData.folders?.length || 0);
    console.log('- Explorer Files:', roomData.explorerFiles?.length || 0);
    console.log('- Active File:', roomData.activeFile);
    console.log('- Current Language:', roomData.currentLanguage);
});

socket.on('join-error', (error) => {
    console.error('❌ Join error:', error);
});

socket.on('disconnect', () => {
    console.log('🔌 Disconnected from server');
});

// Test timeout
setTimeout(() => {
    console.log('🔄 Test completed, disconnecting...');
    socket.disconnect();
    process.exit(0);
}, 5000);

