const express = require('express');
const { Socket } = require('node:dgram');
const app = express();
const PORT = 3000;
const { createServer } = require('node:http');
const { Server } = require('socket.io');

//setup socket
const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"]
    }
});


io.on('connection', (socket) => {

    socket.on("message:new", (message) => {
        io.emit("message:update", {
            from: socket.handshake.auth.username,
            message
        })
    })
    
})


server.listen(PORT, () => {
    console.log(`Aku cinta kamu ${PORT}`);
})