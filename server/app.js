const express = require('express');
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

let players = []

io.on('connection', (socket) => {
    
    // console.log(socket.id, 'iniorang')
    
    socket.on('player', (player) => {
        console.log(player,'kesini ga?');

        players.push({name: player.username})
        socket.broadcast.emit('newPlayer', {opponent: player.username})
        // console.log(players, 'ada?')
        
        if (players.length === 2){
            console.log(players, 'ini');
            
            io.emit('play', players)
        }
    })
    
    socket.on("opponent:data", (data) => {
        socket.broadcast.emit("opponents:update", {
            from: socket.handshake.auth.username,
            data
        })

        
    })

    socket.on("message:new", (message) => {
        io.emit("message:update", {
            from: socket.handshake.auth.username,
            message
        })
        // console.log(message)
    })

})


server.listen(PORT, () => {
    console.log(`Aku cinta kamu ${PORT}`);
})