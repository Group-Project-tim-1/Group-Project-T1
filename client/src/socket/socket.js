import { io } from "socket.io-client";

const SOCKET_URL = 'http://localhost:3000'; // Sesuaikan dengan URL server Anda

export const socket = io(SOCKET_URL, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

