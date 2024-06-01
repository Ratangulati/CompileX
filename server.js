import express from 'express';
const app = express();
import http from 'http';
import { Server } from 'socket.io';

const server = http.createServer(app);
const io = new Server(server);

const rooms = {}; // Object to store rooms and their clients

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join', ({ roomId, username }) => {
        socket.data.username = username;
        socket.join(roomId);

        if (!username || username.trim() === '') {
          // Handle the case where the username is undefined or an empty string
          socket.emit('join-error', 'Username is required');
          return;
        }

        // Initialize the room if it doesn't exist
        if (!rooms[roomId]) {
            rooms[roomId] = { clients: {} };
        }

        // Remove existing client with the same username
        delete rooms[roomId].clients[username];

        // Add the client to the room
        rooms[roomId].clients[username] = { socketId: socket.id, username };

        // Get the client list as an array
        const clientList = Object.values(rooms[roomId].clients);

        // Broadcast the updated client list to the room
        io.to(roomId).emit('join', {
            clients: clientList,
            username,
            socketId: socket.id,
        });

        console.log(`${username} joined room ${roomId}`);
        console.log('Existing clients in room:', clientList);
    });

    socket.on('code-change', ({ roomId, code }) => {
        socket.in(roomId).emit('code-change', { code });
    });

    socket.on('sync-code', ({ socketId, code }) => {
        io.to(socketId).emit('code-change', { code });
    });

    socket.on('language:change', ({ roomId, language }) => {
        socket.in(roomId).emit('language:change', { language });
    });

    socket.on('output-details', ({ roomId, outputDetails }) => {
        socket.in(roomId).emit('output-details', { outputDetails });
    });

    socket.on('disconnecting', () => {
        const rooms = Object.keys(socket.rooms);
        rooms.forEach((roomId) => {
            if (roomId !== socket.id) {
                // Remove the client from the room
                const room = rooms[roomId];
                const clientUsername = socket.data.username;
                delete room.clients[clientUsername];

                // Get the updated client list as an array
                const clientList = Object.values(room.clients);

                // Broadcast the updated client list to the room
                io.to(roomId).emit('join', {
                    clients: clientList,
                    username: clientUsername,
                    socketId: socket.id,
                });
            }
        });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));


