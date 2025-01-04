//creating a socket.io server on top of the express and node server.

import { Server } from 'socket.io'; 
import http from 'http';
import express from 'express';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173'],
    },
});

export function getReceiveSocketId(userId) {
    return userSocketMap[userId];
}

//used to keep track of online users
const userSocketMap = {};  // object as {userid: socketid}

io.on('connection', (socket) => {
    console.log('A user connected', socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) {
        userSocketMap[userId] = socket.id;
    }
    //socket.emit() to send message to the client
    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    //socket.on method for listening to the event
    socket.on('disconnect', () => {
        console.log('A user disconnected', socket.id);
        delete userSocketMap[userId];
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });
});

export { io, server, app};