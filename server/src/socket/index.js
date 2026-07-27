// server/src/socket/index.js
const matchmakingService = require('../services/matchmakingService');
const gameEngine = require('../services/gameEngine');
const Match = require('../models/Match');

module.exports = (io) => {
  // Set socket in gameEngine
  gameEngine.setSocket(io);
  
  console.log('🔌 Socket handlers initialized');

  io.on('connection', (socket) => {
    console.log(`👤 User connected: ${socket.id}`);
    let userId = null;

    // Authenticate
    socket.on('authenticate', (data) => {
      userId = data.userId;
      socket.join(`user-${userId}`);
      console.log(`✅ User ${userId} authenticated`);
      socket.emit('queue-status', matchmakingService.getQueueStatus());
    });

    // Join queue
    socket.on('join-queue', async (data) => {
      if (!userId) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      const result = await matchmakingService.addToQueue({
        userId,
        username: data.username,
        department: data.department,
        elo: data.elo
      });

      if (result.success) {
        socket.emit('queue-update', { 
          status: 'searching', 
          queueSize: matchmakingService.queue.length 
        });
        io.emit('queue-status', matchmakingService.getQueueStatus());
      } else {
        socket.emit('error', { message: result.message });
      }
    });

    // Leave queue
    socket.on('leave-queue', () => {
      if (userId) {
        matchmakingService.removeFromQueue(userId);
        socket.emit('queue-update', { status: 'idle' });
        io.emit('queue-status', matchmakingService.getQueueStatus());
      }
    });

    // Typing
    socket.on('typing', (data) => {
      const { roomId, typed } = data;
      if (!userId || !roomId) return;

      const room = gameEngine.getRoom(roomId);
      if (!room || room.status !== 'active') return;

      if (!room.players[userId]) {
        socket.emit('error', { message: 'Not in this game' });
        return;
      }

      gameEngine.processTyping(roomId, userId, typed);
    });

    // Join spectator
    socket.on('join-spectator', async (data) => {
      const { roomId } = data;
      socket.join(`spectator-${roomId}`);
      
      const room = gameEngine.getRoom(roomId);
      if (room) {
        socket.emit('spectator-state', {
          roomId,
          status: room.status,
          players: Object.keys(room.players).map(id => ({
            userId: id,
            username: room.players[id].username,
            department: room.players[id].department,
            health: room.players[id].health,
            wpm: room.players[id].wpm || 0,
            accuracy: room.players[id].accuracy || 100
          }))
        });
      } else {
        const match = await Match.findOne({ roomId });
        if (match && match.status === 'finished') {
          socket.emit('match-completed', { matchId: roomId, winner: match.winner });
        }
      }
    });

    // Leave spectator
    socket.on('leave-spectator', (data) => {
      const { roomId } = data;
      socket.leave(`spectator-${roomId}`);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`👋 User disconnected: ${socket.id}`);
      
      if (userId) {
        matchmakingService.removeFromQueue(userId);
        io.emit('queue-status', matchmakingService.getQueueStatus());

        // Check for abandoned games
        for (const [roomId, room] of gameEngine.activeRooms) {
          if (room.players[userId] && room.status === 'active') {
            gameEngine.abandonRoom(roomId);
            io.to(roomId).emit('game-abandoned', { 
              message: `${room.players[userId].username} disconnected` 
            });
          }
        }
      }
    });
  });

  return io;
};