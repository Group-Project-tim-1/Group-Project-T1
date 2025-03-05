const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('events').EventEmitter.defaultMaxListeners = 15;
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Sesuaikan dengan URL frontend Anda
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Set max listeners
io.setMaxListeners(15);

// Menyimpan data pemain
const players = new Map();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI('AIzaSyCr0_cURfF6vIsuHzKBROepn6B5cAoO8UQ');

// Simpan status logout request untuk setiap room
const logoutRequests = new Map();

io.on('connection', (socket) => {
    console.log('New connection:', socket.id);
    
    // Buat default room untuk semua player
    const defaultRoom = 'tetris-game-room';
    socket.join(defaultRoom);
    console.log(`Socket ${socket.id} joined room: ${defaultRoom}`);
    
    // Log semua socket dalam room
    const socketsInRoom = io.sockets.adapter.rooms.get(defaultRoom);
    console.log(`Sockets in room ${defaultRoom}:`, 
        socketsInRoom ? Array.from(socketsInRoom) : []);

    // Set max listeners untuk socket individual
    socket.setMaxListeners(15);
    
    const username = socket.handshake.auth.username;
    
    // Bersihkan semua listener yang ada sebelum menambahkan yang baru
    socket.removeAllListeners('game:update');
    socket.removeAllListeners('disconnect');
    
    players.set(socket.id, {
        username: username,
        socketId: socket.id,
        opponent: null,
        data: {
            points: 0,
            lines: 0
        }
    });

    const findOpponent = () => {
        for (const [id, player] of players.entries()) {
            if (id !== socket.id && player.opponent === null) {
                player.opponent = socket.id;
                players.get(socket.id).opponent = id;

                socket.emit('newPlayer', {
                    opponent: player.username
                });
                io.to(id).emit('newPlayer', {
                    opponent: username
                });
                break;
            }
        }
    };

    findOpponent();

    socket.on('game:update', (data) => {
        const player = players.get(socket.id);
        if (player && player.opponent) {
            player.data = data;
            io.to(player.opponent).emit('opponents:update', {
                from: player.username,
                data: data
            });
        }
    });

    socket.on('disconnect', () => {
        const player = players.get(socket.id);
        if (player && player.opponent) {
            const opponent = players.get(player.opponent);
            if (opponent) {
                opponent.opponent = null;
                io.to(player.opponent).emit('opponents:update', {
                    from: player.username,
                    data: {
                        points: 0,
                        lines: 0
                    }
                });
            }
        }
        players.delete(socket.id);

        // Bersihkan logout requests jika ada
        for (const [roomId, requests] of logoutRequests.entries()) {
            requests.delete(socket.id);
            if (requests.size === 0) {
                logoutRequests.delete(roomId);
            }
        }
    });

    socket.on('message:new', (message) => {
        const username = socket.handshake.auth.username;
        
        // Broadcast message ke semua client kecuali pengirim
        socket.broadcast.emit('message:update', {
            from: username,
            message: message
        });
    });

    socket.on('analyze:gamestate', async (gameState) => {
        console.log('Received game state for analysis:', gameState);
        
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

            const prompt = `
                As a Tetris AI assistant, analyze this game state and provide specific move recommendations:

                Current Piece: ${JSON.stringify(gameState.currentPiece)}
                Next Pieces: ${JSON.stringify(gameState.nextPieces)}
                Board State: ${JSON.stringify(gameState.board)}
                
                Based on this state:
                1. What is the optimal placement for the current piece?
                2. What rotation should be used?
                3. What is the best strategy considering the next pieces?

                Please provide a concise, specific recommendation in this format:
                - Move: [left/right] x [number] spaces
                - Rotation: [number] times
                - Drop position: [description]
                - Strategy: [brief explanation]

                Keep the response under 3 lines.
            `;

            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }]}],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 100,
                },
            });

            console.log('AI generated result:', result);
            const prediction = result.response.text();
            console.log('Sending prediction to client:', prediction);

            socket.emit('prediction:update', {
                prediction: prediction
            });

        } catch (error) {
            console.error('AI Prediction error:', error);
            socket.emit('prediction:update', {
                prediction: 'Unable to analyze current position. Error: ' + error.message
            });
        }
    });

    socket.on('generate:commentary', async (gameState) => {
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

            const prompt = `
                Sebagai komentator game Tetris yang bersemangat, berikan komentar pendek dan menarik tentang kondisi permainan saat ini:
                
                Points Pemain: ${gameState.currentPoints}
                Total Baris yang Dihapus: ${gameState.totalLines}
                Points Lawan: ${gameState.enemyPoints}
                
                Aturan untuk komentar:
                1. Sangat singkat (1-2 kalimat)
                2. Bersemangat dan menarik
                3. Seperti komentator olahraga langsung
                4. Variasikan komentar berdasarkan points dan performa
                5. Kadang bandingkan dengan points lawan
                6. Gunakan ekspresi dan frasa yang gaul dan kekinian    
                
                Contoh situasi dan nada:
                - Points rendah: tertawakan pemain
                - Points tinggi: Kagum dan terkesan
                - Kompetisi ketat: Menciptakan ketegangan
                - Memimpin jauh: Merayakan
                
                Berikan komentar dalam Bahasa Indonesia, maksimal 15 kata!
                
                Contoh komentar:
                - "bjier! Pertahankan momentum ini, well played!"
                - "cemen amat cuman dapet 100 poin"
                - "Hebat! Sudah 10 baris dihapus, terus maju!"

                berikan respon dengan format kalimat: '....'
                jangan tambah kan respon apapun selain kalimat komentar
            `;

            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }]}],
                generationConfig: {
                    temperature: 0.9,
                    maxOutputTokens: 50,
                },
            });

            const commentary = result.response.text();
            console.log('Komentar yang dihasilkan:', commentary);
            

            socket.emit('commentary:update', {
                comment: commentary
            });

        } catch (error) {
            console.error('Error generasi komentar:', error);
            
            // Berikan komentar default yang bervariasi saat error
            const defaultComments = [
                "tolol",
                "bodoh",
                "njir",
                "apa yak",
                "bajingann",
                "cape ngoding",
                "pen turu kek reja",
                "ntah la"
            ];

            const randomComment = defaultComments[Math.floor(Math.random() * defaultComments.length)];
            
            socket.emit('commentary:update', {
                comment: randomComment
            });
        }
    });

    socket.on('user:login', (data) => {
        const { username } = data;
        console.log(`User logged in: ${username}, socket ID: ${socket.id}`);
        
        // Tambahkan user ke game room
        const gameRoom = 'tetris-game-room';
        socket.join(gameRoom);
        console.log(`${username} joined room: ${gameRoom}`);
        
        // Simpan username
        players.set(socket.id, {
            username: username,
            socketId: socket.id,
            opponent: null,
            data: {
                points: 0,
                lines: 0
            }
        });
        
        // Broadcast ke semua user
        io.to(gameRoom).emit('user:connected', {
            username,
            users: Array.from(players.values()).map(player => player.username)
        });
    });

    socket.on('player:request-logout', (data) => {
        console.log('Logout requested by:', data.username);
        
        // Gunakan room tetap
        const roomId = 'tetris-game-room';
        
        console.log(`Processing logout request for room: ${roomId}`);

        // Inisialisasi logout request untuk room ini
        if (!logoutRequests.has(roomId)) {
            logoutRequests.set(roomId, new Set());
        }

        // Tambahkan player ini ke daftar yang request logout
        logoutRequests.get(roomId).add(socket.id);
        
        // Broadcast ke SEMUA player di room kecuali sender
        console.log(`Broadcasting logout request to all sockets in room ${roomId} except sender`);
        
        // Dapatkan semua socket IDs dalam room
        const socketsInRoom = io.sockets.adapter.rooms.get(roomId);
        if (socketsInRoom) {
            for (const socketId of socketsInRoom) {
                // Skip sender
                if (socketId === socket.id) continue;
                
                console.log(`Sending logout request to socket: ${socketId}`);
                io.to(socketId).emit('player:logout-request', {
                    username: data.username
                });
            }
        }
    });

    socket.on('player:confirm-logout', (data) => {
        console.log('Logout confirmed by:', data.username);
        
        // Gunakan room tetap
        const roomId = 'tetris-game-room';

        const requests = logoutRequests.get(roomId);
        if (requests) {
            requests.add(socket.id);
            console.log(`Current logout requests for room ${roomId}:`, requests.size);

            // Jika semua player di room sudah konfirmasi
            const connectedClients = io.sockets.adapter.rooms.get(roomId)?.size || 0;
            console.log(`Connected clients in room: ${connectedClients}`);
            
            // Jika semua player sudah konfirmasi atau hanya 1 player tersisa
            if (requests.size >= connectedClients || connectedClients <= 1) {
                console.log('All players confirmed logout, sending final logout signal');
                io.to(roomId).emit('all-players:logout');
                logoutRequests.delete(roomId);
            }
        }
    });

    socket.on('player:cancel-logout', (data) => {
        // Gunakan room tetap
        const roomId = 'tetris-game-room';
        
        console.log(`Logout cancelled by ${data?.username || 'unknown'} for room: ${roomId}`);
        logoutRequests.delete(roomId);
        socket.to(roomId).emit('logout:cancelled');
    });

    // Cleanup saat server restart atau shutdown
    process.on('SIGTERM', () => {
        socket.disconnect();
        process.exit(0);
    });
});

// Error handling
io.on('error', (error) => {
    console.error('Socket.IO Error:', error);
});

const PORT = 3000; // Pastikan port ini sesuai dengan yang digunakan di client

// Start server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;