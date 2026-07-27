// server/src/services/gameEngine.js
const { getIO } = require('../config/socket');
const Match = require('../models/Match');
const User = require('../models/User');
const WordPool = require('../models/WordPool');

class GameEngine {
  constructor() {
    this.activeRooms = new Map();
    this.io = null;
  }

  // ============================================================
  // SOCKET SETUP
  // ============================================================
  setSocket(io) {
    this.io = io;
    console.log('✅ GameEngine socket set');
  }

  getSocket() {
    if (!this.io) {
      this.io = getIO();
    }
    return this.io;
  }

  // ============================================================
  // ROOM MANAGEMENT
  // ============================================================
  createRoom(matchId, player1, player2) {
    const room = {
      matchId,
      players: {
        [player1.userId]: {
          ...player1,
          health: 100,
          combo: 0,
          typed: '',
          wordIndex: 0,
          wpm: 0,
          accuracy: 100,
          correctWords: 0,
          wrongWords: 0,
          startTime: null,
          totalTyped: 0,
          totalCorrect: 0,
          action: 'idle',
          isAttacking: false,
          lastActionTime: 0
        },
        [player2.userId]: {
          ...player2,
          health: 100,
          combo: 0,
          typed: '',
          wordIndex: 0,
          wpm: 0,
          accuracy: 100,
          correctWords: 0,
          wrongWords: 0,
          startTime: null,
          totalTyped: 0,
          totalCorrect: 0,
          action: 'idle',
          isAttacking: false,
          lastActionTime: 0
        }
      },
      textPool: [],
      fullText: '',
      status: 'waiting',
      startTime: null,
      duration: 60,
      timer: null,
      gameLoop: null,
      winner: null,
      lastBroadcast: Date.now(),
      soundQueue: []
    };

    this.activeRooms.set(matchId, room);
    return room;
  }

  getRoom(matchId) {
    return this.activeRooms.get(matchId);
  }

  isRoomActive(matchId) {
    const room = this.activeRooms.get(matchId);
    return room && room.status === 'active';
  }

  abandonRoom(matchId) {
    const room = this.activeRooms.get(matchId);
    if (room) {
      if (room.gameLoop) clearInterval(room.gameLoop);
      if (room.timer) clearTimeout(room.timer);
      this.activeRooms.delete(matchId);
    }
  }

  // ============================================================
  // TEXT GENERATION
  // ============================================================
  async generateTextPool(departments, totalSentences = 15) {
    try {
      const battleText = await WordPool.getBattleText(departments, 'medium', totalSentences);
      const words = battleText.split(/\s+/).filter(w => w.length > 0);
      
      if (words.length < 20) {
        return this.getFallbackWords();
      }
      
      return words;
    } catch (error) {
      console.error('Error generating text pool:', error);
      return this.getFallbackWords();
    }
  }

  getFallbackWords() {
    return [
      'typing', 'speed', 'accuracy', 'practice', 'learn',
      'college', 'battle', 'challenge', 'victory', 'focus',
      'determination', 'skill', 'mastery', 'progress', 'excellence'
    ];
  }

  // ============================================================
  // DAMAGE CALCULATION
  // ============================================================
  calculateDamage(player, word) {
    const baseDamage = word.length * 1.5;
    const comboBonus = Math.min(Math.floor(player.combo / 5) * 2, 10);
    const accuracyBonus = player.accuracy > 90 ? 3 : 0;
    
    return Math.floor(Math.min(baseDamage + comboBonus + accuracyBonus, 25));
  }

  // ============================================================
  // GAME FLOW
  // ============================================================
  startGame(matchId) {
    const room = this.activeRooms.get(matchId);
    if (!room) throw new Error('Room not found');

    room.status = 'countdown';
    room.startTime = Date.now();

    this.startCountdown(matchId);
    room.gameLoop = setInterval(() => this.updateGame(matchId), 1000 / 60);
    room.timer = setTimeout(() => this.endGame(matchId), room.duration * 1000);
  }

  startCountdown(matchId) {
    const room = this.activeRooms.get(matchId);
    let count = 3;

    const interval = setInterval(() => {
      if (count > 0) {
        this.io.to(matchId).emit('countdown', { count });
        this.emitSound(matchId, 'countdown', { count });
        count--;
      } else {
        clearInterval(interval);
        room.status = 'active';
        
        const playerIds = Object.keys(room.players);
        playerIds.forEach(id => {
          room.players[id].startTime = Date.now();
        });
        
        this.io.to(matchId).emit('game-start', {
          startTime: room.startTime,
          duration: room.duration,
          totalWords: room.textPool.length
        });
        
        this.emitSound(matchId, 'fight');
      }
    }, 1000);
  }

  updateGame(matchId) {
    const room = this.activeRooms.get(matchId);
    if (!room || room.status !== 'active') return;

    const players = room.players;
    const playerIds = Object.keys(players);
    const now = Date.now();

    playerIds.forEach(id => {
      const player = players[id];
      if (player.startTime) {
        const elapsed = (now - player.startTime) / 1000;
        const minutes = elapsed / 60;
        
        player.wpm = minutes > 0 ? Math.round(player.correctWords / minutes) : 0;
        player.accuracy = player.totalTyped > 0 
          ? Math.round((player.totalCorrect / player.totalTyped) * 100) 
          : 100;
      }

      if (player.isAttacking && (now - player.lastActionTime) > 300) {
        player.isAttacking = false;
        if (player.action !== 'hit' && player.action !== 'victory' && player.action !== 'defeat') {
          player.action = 'idle';
        }
      }
    });

    if (now - room.lastBroadcast > 100) {
      this.broadcastGameState(matchId);
      room.lastBroadcast = now;
    }
  }

  // ============================================================
  // TYPING PROCESSING
  // ============================================================
  async processTyping(matchId, playerId, typedText) {
    const room = this.activeRooms.get(matchId);
    if (!room || room.status !== 'active') return;

    const player = room.players[playerId];
    if (!player) return;

    const opponentId = Object.keys(room.players).find(id => id !== playerId);
    const opponent = room.players[opponentId];
    if (!opponent) return;

    const currentWord = room.textPool[player.wordIndex];
    if (!currentWord) {
      const newWords = await this.generateTextPool(
        [player.department, opponent.department],
        10
      );
      room.textPool.push(...newWords);
      this.io.to(matchId).emit('new-words', { count: newWords.length });
      return;
    }

    const typed = typedText.trim().toLowerCase();
    const target = currentWord.toLowerCase();

    // --- CORRECT WORD ---
    if (typed === target) {
      const damage = this.calculateDamage(player, currentWord);
      opponent.health = Math.max(0, opponent.health - damage);
      
      player.correctWords++;
      player.totalCorrect += currentWord.length;
      player.totalTyped += currentWord.length;
      player.combo++;
      player.wordIndex++;
      player.typed = '';
      player.accuracy = player.totalTyped > 0 
        ? Math.round((player.totalCorrect / player.totalTyped) * 100) 
        : 100;

      // Fighter actions
      player.action = 'punch';
      player.isAttacking = true;
      player.lastActionTime = Date.now();

      opponent.action = 'hit';
      opponent.isAttacking = true;
      opponent.lastActionTime = Date.now();

      // Emit events
      this.io.to(matchId).emit('fighter-action', {
        playerId: playerId,
        action: 'punch',
        opponentId: opponentId,
        damage: damage,
        combo: player.combo
      });

      this.io.to(matchId).emit('fighter-hit', {
        playerId: opponentId,
        damage: damage,
        health: opponent.health
      });

      this.io.to(matchId).emit('damage-dealt', {
        from: playerId,
        to: opponentId,
        damage,
        word: currentWord,
        combo: player.combo,
        health: opponent.health
      });

      this.io.to(matchId).emit('hit-effect', {
        x: opponent.x || 600,
        y: opponent.y || 280,
        damage: damage,
        type: player.combo > 5 ? 'heavy' : 'normal'
      });

      this.io.to(matchId).emit('screen-shake', {
        intensity: Math.min(4 + Math.floor(player.combo / 3), 10),
        duration: 200 + (player.combo > 5 ? 100 : 0)
      });

      // Sounds
      const punchSound = player.combo > 5 ? 'punch-heavy' : 'punch';
      this.emitSound(matchId, punchSound, { damage, combo: player.combo });
      this.emitSound(matchId, 'hit', { damage, health: opponent.health });
      
      if (player.combo > 1) {
        this.emitSound(matchId, 'combo', { combo: player.combo });
      }

      if (opponent.health <= 0) {
        this.emitSound(matchId, 'victory');
        this.endGame(matchId, playerId);
        return;
      }

      if (player.wordIndex >= room.textPool.length) {
        const newWords = await this.generateTextPool(
          [player.department, opponent.department],
          10
        );
        room.textPool.push(...newWords);
        this.io.to(matchId).emit('new-words', { count: newWords.length });
      }

    // --- WRONG CHARACTER ---
    } else if (typed.length > 0 && !target.startsWith(typed)) {
      player.health = Math.max(0, player.health - 2);
      player.wrongWords++;
      player.combo = 0;
      player.totalTyped += 1;

      player.action = 'hit';
      player.isAttacking = true;
      player.lastActionTime = Date.now();

      this.io.to(matchId).emit('fighter-action', {
        playerId: playerId,
        action: 'hit',
        isTypo: true
      });

      this.emitSound(matchId, 'typo');
      this.emitSound(matchId, 'damage-self', { health: player.health });

      this.io.to(matchId).emit('typo', {
        playerId,
        wrongChar: typed[typed.length - 1],
        health: player.health
      });

      this.io.to(matchId).emit('screen-shake', {
        intensity: 2,
        duration: 150
      });

      if (player.health <= 0) {
        this.emitSound(matchId, 'defeat');
        this.endGame(matchId, opponentId);
        return;
      }
    }

    player.typed = typed;
    player.totalTyped += 1;

    this.io.to(matchId).emit('typing-progress', {
      playerId,
      typed,
      wordIndex: player.wordIndex,
      progress: player.wordIndex / room.textPool.length
    });
  }

  // ============================================================
  // BROADCAST
  // ============================================================
  broadcastGameState(matchId) {
    const room = this.activeRooms.get(matchId);
    if (!room) return;

    const players = room.players;
    const playerIds = Object.keys(players);
    const now = Date.now();
    const elapsed = room.startTime ? (now - room.startTime) / 1000 : 0;
    
    const state = {
      roomId: matchId,
      status: room.status,
      timeRemaining: Math.max(0, room.duration - elapsed),
      players: playerIds.reduce((acc, id) => {
        acc[id] = {
          username: players[id].username,
          department: players[id].department,
          health: players[id].health,
          wpm: players[id].wpm || 0,
          accuracy: players[id].accuracy || 100,
          combo: players[id].combo || 0,
          correctWords: players[id].correctWords || 0,
          progress: players[id].wordIndex / room.textPool.length,
          action: players[id].action || 'idle',
          isAttacking: players[id].isAttacking || false
        };
        return acc;
      }, {}),
      currentWord: room.textPool[players[playerIds[0]]?.wordIndex || 0] || '',
      totalWords: room.textPool.length,
      wordIndex: players[playerIds[0]]?.wordIndex || 0
    };

    this.io.to(matchId).emit('game-state', state);
  }

  // ============================================================
  // SOUND
  // ============================================================
  emitSound(matchId, soundType, data = {}) {
    this.io.to(matchId).emit('play-sound', {
      type: soundType,
      timestamp: Date.now(),
      ...data
    });
  }

  // ============================================================
  // GAME END
  // ============================================================
  async endGame(matchId, winnerId = null) {
    const room = this.activeRooms.get(matchId);
    if (!room || room.status === 'finished') return;

    if (room.gameLoop) clearInterval(room.gameLoop);
    if (room.timer) clearTimeout(room.timer);

    room.status = 'finished';

    if (!winnerId) {
      const players = room.players;
      const playerIds = Object.keys(players);
      
      if (players[playerIds[0]].health > players[playerIds[1]].health) {
        winnerId = playerIds[0];
      } else if (players[playerIds[1]].health > players[playerIds[0]].health) {
        winnerId = playerIds[1];
      } else {
        winnerId = players[playerIds[0]].wpm > players[playerIds[1]].wpm ? 
          playerIds[0] : playerIds[1];
      }
    }

    room.winner = winnerId;

    const playerIds = Object.keys(room.players);
    playerIds.forEach(id => {
      if (id === winnerId) {
        room.players[id].action = 'victory';
        this.emitSound(matchId, 'victory');
      } else {
        room.players[id].action = 'defeat';
        this.emitSound(matchId, 'defeat');
      }
    });

    // Fighter action for victory/defeat
    this.io.to(matchId).emit('fighter-action', {
      playerId: winnerId,
      action: 'victory'
    });

    const loserId = playerIds.find(id => id !== winnerId);
    if (loserId) {
      this.io.to(matchId).emit('fighter-action', {
        playerId: loserId,
        action: 'defeat'
      });
    }

    // Broadcast final state
    this.io.to(matchId).emit('game-end', {
      winner: {
        userId: winnerId,
        username: room.players[winnerId].username,
        health: room.players[winnerId].health,
        wpm: room.players[winnerId].wpm,
        accuracy: room.players[winnerId].accuracy,
        action: 'victory'
      },
      players: playerIds.map(id => ({
        userId: id,
        username: room.players[id].username,
        health: room.players[id].health,
        wpm: room.players[id].wpm,
        accuracy: room.players[id].accuracy,
        combo: room.players[id].combo,
        correctWords: room.players[id].correctWords,
        wrongWords: room.players[id].wrongWords,
        action: room.players[id].action || 'idle'
      }))
    });

    setTimeout(() => {
      this.emitSound(matchId, 'game-end', { winner: winnerId });
    }, 500);

    await this.saveMatchResults(matchId);

    setTimeout(() => {
      this.activeRooms.delete(matchId);
    }, 30000);
  }

  // ============================================================
  // SAVE RESULTS
  // ============================================================
  async saveMatchResults(matchId) {
    const room = this.activeRooms.get(matchId);
    if (!room) return;

    try {
      const match = await Match.findOne({ roomId: matchId });
      if (!match) return;

      const players = room.players;
      const playerIds = Object.keys(players);

      for (const id of playerIds) {
        const player = players[id];
        const user = await User.findById(id);
        if (user) {
          const won = id === room.winner;
          user.updateStats({
            won,
            wpm: player.wpm || 0,
            accuracy: player.accuracy || 100,
            combo: player.combo || 0
          });
          await user.save();

          const matchPlayer = match.players.find(p => p.userId.toString() === id);
          if (matchPlayer) {
            matchPlayer.wpm = player.wpm || 0;
            matchPlayer.accuracy = player.accuracy || 100;
            matchPlayer.combo = player.combo || 0;
            matchPlayer.correctWords = player.correctWords || 0;
            matchPlayer.wrongWords = player.wrongWords || 0;
            matchPlayer.health = player.health || 100;
          }
        }
      }

      if (room.winner) {
        match.winner = room.winner;
      }

      match.status = 'finished';
      match.endTime = new Date();
      await match.save();

      this.io.to(`spectator-${matchId}`).emit('match-completed', {
        matchId,
        winner: {
          userId: room.winner,
          username: players[room.winner].username
        },
        players: playerIds.map(id => ({
          userId: id,
          username: players[id].username,
          wpm: players[id].wpm,
          accuracy: players[id].accuracy
        }))
      });

    } catch (error) {
      console.error('Error saving match results:', error);
    }
  }
}

module.exports = new GameEngine();