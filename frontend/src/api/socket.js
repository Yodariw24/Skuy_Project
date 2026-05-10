import { io } from 'socket.io-client';

// Pastikan arahkan ke URL Backend lo di Railway
const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:8080', {
    withCredentials: true,
    transports: ['websocket', 'polling']
});

export default socket;