// client/src/context/GameContext.jsx
import React, { createContext, useState, useContext, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useSound } from '../hooks/useSound';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [queueSize, setQueueSize] = useState(0);
  const socketRef = useRef(null);
  const { playSound } = useSound();

  // ============================================================
  // SOCKET EVENT HANDLERS
  // ============================================================
  const setupSocketListeners = (socketInstance) => {
    // --- Game State Events ---
    socketInstance.on('game-state', (state) => {
      setGameState(state);
    });

    socketInstance.on('game-start', (data) => {
      setGameState(prev => ({
        ...prev,
        status: 'active',
        startTime: data.startTime,
        totalWords: data.totalWords
      }));
      playSound('fight');
      toast.success('⚔️ Fight!');
    });

    socketInstance.on('countdown', (data) => {
      playSound('countdown', { count: data.count });
      setGameState(prev => ({
        ...prev,
        countdown: data.count
      }));
    });

    // --- Fighter Action Events ---
    socketInstance.on('fighter-action', (data) => {
      const { playerId, action, opponentId, damage, combo } = data;
      
      // Update player action in game state
      setGameState(prev => {
        if (!prev || !prev.players) return prev;
        const updatedPlayers = { ...prev.players };
        if (updatedPlayers[playerId]) {
          updatedPlayers[playerId].action = action;
          updatedPlayers[playerId].isAttacking = true;
        }
        return { ...prev, players: updatedPlayers };
      });

      // Play sound based on action
      if (action === 'punch') {
        const soundType = combo > 5 ? 'punch-heavy' : 'punch';
        playSound(soundType, { damage, combo });
      } else if (action === 'hit') {
        playSound('hit', { damage });
      } else if (action === 'victory') {
        playSound('victory');
      } else if (action === 'defeat') {
        playSound('defeat');
      }
    });

    socketInstance.on('fighter-hit', (data) => {
      const { playerId, damage, health } = data;
      
      setGameState(prev => {
        if (!prev || !prev.players) return prev;
        const updatedPlayers = { ...prev.players };
        if (updatedPlayers[playerId]) {
          updatedPlayers[playerId].health = health;
          updatedPlayers[playerId].action = 'hit';
          updatedPlayers[playerId].isAttacking = true;
        }
        return { ...prev, players: updatedPlayers };
      });

      // Screen shake effect (handled in component)
      document.dispatchEvent(new CustomEvent('screen-shake', { 
        detail: { intensity: 4, duration: 200 } 
      }));
    });

    socketInstance.on('hit-effect', (data) => {
      const { x, y, damage, type } = data;
      playSound('hit', { damage });
      
      // Dispatch hit effect event for canvas rendering
      document.dispatchEvent(new CustomEvent('hit-effect', {
        detail: { x, y, damage, type }
      }));
    });

    socketInstance.on('screen-shake', (data) => {
      document.dispatchEvent(new CustomEvent('screen-shake', {
        detail: { intensity: data.intensity, duration: data.duration }
      }));
    });

    // --- Typing Events ---
    socketInstance.on('typing-progress', (data) => {
      const { playerId, typed, wordIndex, progress } = data;
      
      setGameState(prev => {
        if (!prev || !prev.players) return prev;
        const updatedPlayers = { ...prev.players };
        if (updatedPlayers[playerId]) {
          updatedPlayers[playerId].typed = typed;
          updatedPlayers[playerId].wordIndex = wordIndex;
          updatedPlayers[playerId].progress = progress;
        }
        return { ...prev, players: updatedPlayers };
      });
    });

    socketInstance.on('typo', (data) => {
      const { playerId, wrongChar, health } = data;
      
      setGameState(prev => {
        if (!prev || !prev.players) return prev;
        const updatedPlayers = { ...prev.players };
        if (updatedPlayers[playerId]) {
          updatedPlayers[playerId].health = health;
          updatedPlayers[playerId].action = 'hit';
          updatedPlayers[playerId].isAttacking = true;
        }
        return { ...prev, players: updatedPlayers };
      });

      playSound('typo');
      playSound('damage-self', { health });
      
      toast.error('❌ Typo! You lost 2 HP');
    });

    socketInstance.on('damage-dealt', (data) => {
      const { from, to, damage, word, combo, health } = data;
      
      setGameState(prev => {
        if (!prev || !prev.players) return prev;
        const updatedPlayers = { ...prev.players };
        if (updatedPlayers[to]) {
          updatedPlayers[to].health = health;
        }
        if (updatedPlayers[from]) {
          updatedPlayers[from].combo = combo || 0;
        }
        return { ...prev, players: updatedPlayers };
      });

      if (combo > 1) {
        playSound('combo', { combo });
        toast.success(`🔥 ${combo}x Combo!`);
      }
    });

    socketInstance.on('new-words', (data) => {
      toast.info(`📝 ${data.count} new words added!`);
    });

    // --- Match Events ---
    socketInstance.on('match-found', (data) => {
      const { roomId, opponent, opponentDepartment } = data;
      setIsSearching(false);
      setQueueSize(0);
      toast.success(`⚔️ Match found! Opponent: ${opponent} (${opponentDepartment})`);
      
      setGameState(prev => ({
        ...prev,
        roomId,
        status: 'waiting',
        opponent: { username: opponent, department: opponentDepartment }
      }));
    });

    socketInstance.on('matchmaking-timeout', () => {
      setIsSearching(false);
      setQueueSize(0);
      toast.error('No opponent found. Try again!');
    });

    socketInstance.on('queue-status', (data) => {
      setQueueSize(data.queueSize || 0);
    });

    socketInstance.on('queue-update', (data) => {
      if (data.status === 'searching') {
        setIsSearching(true);
      } else {
        setIsSearching(false);
      }
    });

    // --- Game End Events ---
    socketInstance.on('game-end', (data) => {
      const { winner, players } = data;
      
      setGameState(prev => ({
        ...prev,
        status: 'finished',
        winner: winner,
        finalPlayers: players
      }));

      // Play appropriate sound
      const currentUserId = localStorage.getItem('userId');
      if (winner.userId === currentUserId) {
        playSound('victory');
        toast.success('🏆 You Won!');
      } else {
        playSound('defeat');
        toast.error('💪 You Lost! Better luck next time');
      }
    });

    socketInstance.on('game-abandoned', (data) => {
      setGameState(prev => ({
        ...prev,
        status: 'abandoned'
      }));
      toast.error(`⚠️ ${data.message}`);
    });

    // --- Sound Events ---
    socketInstance.on('play-sound', (data) => {
      const { type, ...params } = data;
      playSound(type, params);
    });

    // --- Error Events ---
    socketInstance.on('error', (data) => {
      toast.error(data.message || 'An error occurred');
    });
  };

  // ============================================================
  // SOCKET CONNECTION
  // ============================================================
  const connectSocket = (token, userId) => {
    if (socketRef.current) {
      return socketRef.current;
    }

    const newSocket = io('/socket.io', {
      auth: { token },
      query: { userId },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('🔗 Socket connected');
      
      if (userId) {
        newSocket.emit('authenticate', { userId });
      }
      
      // Setup all event listeners
      setupSocketListeners(newSocket);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('🔗 Socket disconnected');
      toast.error('Disconnected from server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      toast.error('Connection error. Trying to reconnect...');
    });

    newSocket.on('reconnect', () => {
      setIsConnected(true);
      console.log('🔗 Socket reconnected');
      toast.success('Reconnected to server');
      
      if (userId) {
        newSocket.emit('authenticate', { userId });
      }
    });

    return newSocket;
  };

  // ============================================================
  // SOCKET DISCONNECT
  // ============================================================
  const disconnectSocket = () => {
    if (socketRef.current) {
      // Remove all listeners before disconnecting
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      setIsSearching(false);
      setQueueSize(0);
      setGameState(null);
    }
  };

  // ============================================================
  // GAME ACTIONS
  // ============================================================
  const joinQueue = (userData) => {
    if (!socketRef.current || !isConnected) {
      toast.error('Not connected to server');
      return;
    }

    setIsSearching(true);
    socketRef.current.emit('join-queue', {
      userId: userData.id,
      username: userData.username,
      department: userData.department,
      elo: userData.elo || 1200
    });
  };

  const leaveQueue = () => {
    if (!socketRef.current) return;
    
    setIsSearching(false);
    socketRef.current.emit('leave-queue');
  };

  const joinGame = (roomId, userId) => {
    if (!socketRef.current) {
      toast.error('Not connected to server');
      return;
    }

    socketRef.current.emit('join-game', { roomId, userId });
  };

  const sendTyping = (roomId, typed) => {
    if (!socketRef.current || !isConnected) {
      return;
    }

    socketRef.current.emit('typing', { roomId, typed });
  };

  const leaveGame = (roomId) => {
    if (!socketRef.current) return;
    socketRef.current.emit('leave-game', { roomId });
    setGameState(null);
  };

  const joinSpectator = (roomId) => {
    if (!socketRef.current) return;
    socketRef.current.emit('join-spectator', { roomId });
  };

  const leaveSpectator = (roomId) => {
    if (!socketRef.current) return;
    socketRef.current.emit('leave-spectator', { roomId });
  };

  // ============================================================
  // CLEANUP ON UNMOUNT
  // ============================================================
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
      }
    };
  }, []);

  // ============================================================
  // CONTEXT VALUE
  // ============================================================
  const value = {
    socket,
    socketRef,
    isConnected,
    isSearching,
    queueSize,
    gameState,
    setGameState,
    connectSocket,
    disconnectSocket,
    joinQueue,
    leaveQueue,
    joinGame,
    sendTyping,
    leaveGame,
    joinSpectator,
    leaveSpectator
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};