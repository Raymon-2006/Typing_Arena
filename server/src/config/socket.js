
const socketIo = require('socket.io');

let io = null; 

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });
  console.log('✅ Socket.io initialized');
  return io;
};

const getIO = () => {
  if (!io) {
    console.warn('⚠️ Socket.io not initialized yet, returning null');
    return null; 
  }
  return io;
};

module.exports = { initSocket, getIO };