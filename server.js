import express from 'express';
const app = express();
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';
import { config } from './config/config.js';

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB with fallback
let Room;
const dbConnected = await connectDB();

if (dbConnected !== false) {
    // MongoDB connected successfully
    Room = (await import('./models/Room.js')).default;
} else {
    // Use in-memory storage fallback
    console.log('📦 Using in-memory storage fallback');
    const { Room: InMemoryRoom } = await import('./config/inMemoryStorage.js');
    Room = InMemoryRoom;
}

// Middleware
app.use(express.json());

// API routes should come before static files
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(express.static('dist'));

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});


io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join', async ({ roomId, username }) => {
        socket.data.username = username;
        socket.data.roomId = roomId;
        socket.join(roomId);

        if (!username || username.trim() === '') {
          socket.emit('join-error', 'Username is required');
          return;
        }

        try {
            // Find or create room in database
            const room = await Room.findOrCreate(roomId);
            
            // Add member to room
            await room.addMember(username, socket.id);
            
            // Get updated room data
            const updatedRoom = await Room.findOne({ roomId });
            
            // Remove duplicates and ensure unique usernames
            const uniqueMembers = [];
            const seenUsernames = new Set();
            
            updatedRoom.members.forEach(member => {
                if (!seenUsernames.has(member.username)) {
                    seenUsernames.add(member.username);
                    uniqueMembers.push({
                        username: member.username,
                        socketId: member.socketId
                    });
                }
            });

            // Emit room state to the joining user
            socket.emit('room-state', {
                files: updatedRoom.files,
                folders: updatedRoom.folders,
                explorerFiles: updatedRoom.explorerFiles,
                expandedFolders: updatedRoom.expandedFolders,
                activeFile: updatedRoom.activeFile,
                currentLanguage: updatedRoom.currentLanguage,
                currentCode: updatedRoom.currentCode
            });

            // Emit join event to all users in room
            io.to(roomId).emit('join', {
                clients: uniqueMembers,
                username,
                socketId: socket.id,
            });

            console.log(`${username} joined room ${roomId}`);
            console.log('Existing clients in room:', uniqueMembers);
        } catch (error) {
            console.error('Error joining room:', error);
            socket.emit('join-error', 'Failed to join room');
        }
    });

    socket.on('code-change', async ({ roomId, code, fileId }) => {
        try {
            // Update room state in database using atomic operation
            await Room.findOneAndUpdate(
                { roomId },
                { $set: { currentCode: code } },
                { new: true }
            );
            
            // Broadcast to other users in the room
            socket.in(roomId).emit('code-change', { code, fileId });
        } catch (error) {
            console.error('Error updating code:', error);
        }
    });

    socket.on('sync-code', ({ socketId, code }) => {
        io.to(socketId).emit('code-change', { code });
    });

    socket.on('language:change', async ({ roomId, language, fileId }) => {
        try {
            // Update room state in database using atomic operation
            await Room.findOneAndUpdate(
                { roomId },
                { $set: { currentLanguage: language } },
                { new: true }
            );
            
            // Broadcast to other users in the room
            socket.in(roomId).emit('language:change', { language, fileId });
        } catch (error) {
            console.error('Error updating language:', error);
        }
    });

    socket.on('output-details', async ({ roomId, outputDetails }) => {
        try {
            // Update room state in database
            const room = await Room.findOne({ roomId });
            if (room) {
                room.outputDetails = outputDetails;
                await room.save();
            }
            
            // Broadcast to other users in the room
            socket.in(roomId).emit('output-details', { outputDetails });
        } catch (error) {
            console.error('Error updating output details:', error);
        }
    });

    // New event for updating room state (files, folders, etc.)
    socket.on('room-state-update', async ({ roomId, stateData }) => {
        try {
            const room = await Room.findOne({ roomId });
            if (room) {
                await room.updateState(stateData);
                
                // Broadcast state update to other users in the room
                socket.in(roomId).emit('room-state-update', stateData);
            }
        } catch (error) {
            console.error('Error updating room state:', error);
        }
    });

    socket.on('disconnecting', async () => {
        const roomId = socket.data.roomId;
        const username = socket.data.username;
        
        if (roomId && username) {
            try {
                const room = await Room.findOne({ roomId });
                if (room) {
                    await room.removeMember(username);
                    
                    const updatedRoom = await Room.findOne({ roomId });
                    
                    // Remove duplicates and ensure unique usernames
                    const uniqueMembers = [];
                    const seenUsernames = new Set();
                    
                    updatedRoom.members.forEach(member => {
                        if (!seenUsernames.has(member.username)) {
                            seenUsernames.add(member.username);
                            uniqueMembers.push({
                                username: member.username,
                                socketId: member.socketId
                            });
                        }
                    });

                    io.to(roomId).emit('user-disconnected', {
                        clients: uniqueMembers,
                        username,
                        socketId: socket.id,
                    });
                }
            } catch (error) {
                console.error('Error handling user disconnection:', error);
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

server.listen(config.server.port, () => {
    console.log(`🚀 Server listening on port ${config.server.port}`);
    console.log(`🌍 Environment: ${config.environment}`);
    
    // Clean up empty rooms every 5 minutes
    setInterval(async () => {
        if (dbConnected !== false) {
            await Room.cleanupEmptyRooms();
        }
    }, 5 * 60 * 1000); // 5 minutes
    
    // Clean up on startup
    setTimeout(async () => {
        if (dbConnected !== false) {
            await Room.cleanupEmptyRooms();
        }
    }, 10000); // 10 seconds after startup
});

