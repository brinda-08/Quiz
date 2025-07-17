import { io } from 'socket.io-client';

// Connect to local backend WebSocket server
const socket = io('http://localhost:5000');

// Listen for connection
socket.on('connect', () => {
  console.log('🟢 Connected to WebSocket server:', socket.id);
});

// Listen for custom events
socket.on('new-score', (data) => {
  console.log('🔥 New score received:', data);
});

socket.on('new-quiz', (data) => {
  console.log('📝 New quiz received:', data);
});

export default socket;
