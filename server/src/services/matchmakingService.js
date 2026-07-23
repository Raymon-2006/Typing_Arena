const Match = require('../models/Match');
const WordPool = require('../models/WordPool');
const gameEngine = require('./gameEngine');
const { getIO } = require('../config/socket');

class MatchmakingService {
  constructor() {
    this.queue = [];
    this.searchTimeouts = new Map();
    this.io = getIO();
  }

  addToQueue(user) {
    if (this.queue.find(p => p.userId === user.userId)) {
      return { success: false, message: 'Already in queue' };
    }

    this.queue.push({
      userId: user.userId,
      username: user.username,
      department: user.department,
      elo: user.elo || 1200,
      joinTime: Date.now()
    });

    const timeout = setTimeout(() => {
      this.removeFromQueue(user.userId);
      this.io.to(user.userId).emit('matchmaking-timeout');
    }, 30000);
    
    this.searchTimeouts.set(user.userId, timeout);

    const match = this.findMatch();
    if (match) {
      this.createMatch(match);
    }

    return { success: true, message: 'Added to queue' };
  }

  removeFromQueue(userId) {
    this.queue = this.queue.filter(p => p.userId !== userId);
    if (this.searchTimeouts.has(userId)) {
      clearTimeout(this.searchTimeouts.get(userId));
      this.searchTimeouts.delete(userId);
    }
  }

  findMatch() {
    if (this.queue.length < 2) return null;

    this.queue.sort((a, b) => a.elo - b.elo);
    let bestMatch = null;
    let bestDiff = Infinity;

    for (let i = 0; i < this.queue.length - 1; i++) {
      for (let j = i + 1; j < this.queue.length; j++) {
        const diff = Math.abs(this.queue[i].elo - this.queue[j].elo);
        const sameDepartment = this.queue[i].department === this.queue[j].department;
        const penalty = sameDepartment ? 50 : 0;
        const totalDiff = diff + penalty;
        
        if (totalDiff < bestDiff) {
          bestDiff = totalDiff;
          bestMatch = [i, j];
        }
      }
    }

    if (bestDiff > 200) return null;
    return bestMatch;
  }

  async createMatch(matchIndices) {
    const [idx1, idx2] = matchIndices;
    const player1 = this.queue.splice(idx1, 1)[0];
    const player2 = this.queue.splice(idx2 - 1, 1)[0];

    this.removeFromQueue(player1.userId);
    this.removeFromQueue(player2.userId);

    const roomId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // Generate word pool
    const wordPool = await this.generateWordPool(player1.department, player2.department);

    const match = new Match({
      roomId,
      players: [
        { userId: player1.userId, username: player1.username, department: player1.department },
        { userId: player2.userId, username: player2.username, department: player2.department }
      ],
      status: 'waiting',
      duration: 60,
      textPool: wordPool
    });

    await match.save();

    const gameRoom = gameEngine.createRoom(roomId, player1, player2);
    gameRoom.textPool = wordPool;

    this.io.to(player1.userId).emit('match-found', {
      roomId,
      opponent: player2.username,
      opponentDepartment: player2.department
    });

    this.io.to(player2.userId).emit('match-found', {
      roomId,
      opponent: player1.username,
      opponentDepartment: player1.department
    });

    setTimeout(() => {
      gameEngine.startGame(roomId);
    }, 5000);

    return { roomId, player1, player2 };
  }

  async generateWordPool(department1, department2, difficulty = 'medium', count = 30) {
    try {
      const words = await WordPool.getMixedWords([department1, department2], difficulty, count);
      return words.length > 0 ? words : ['typing', 'battle', 'speed', 'accuracy', 'college'];
    } catch (error) {
      console.error('Error generating word pool:', error);
      return ['typing', 'battle', 'speed', 'accuracy', 'college', 'computer', 'civil', 'architecture'];
    }
  }

  getQueueStatus() {
    return {
      queueSize: this.queue.length,
      players: this.queue.map(p => ({
        username: p.username,
        department: p.department,
        elo: p.elo,
        waitTime: Math.floor((Date.now() - p.joinTime) / 1000)
      }))
    };
  }

  clearQueue() {
    for (const [userId, timeout] of this.searchTimeouts) {
      clearTimeout(timeout);
    }
    this.searchTimeouts.clear();
    this.queue = [];
  }
}

module.exports = new MatchmakingService();