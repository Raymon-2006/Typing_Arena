// client/src/components/game/GameScreen.jsx (Partial update)

import React, { useState, useRef } from 'react';
import FighterCanvas from '../fighters/FighterCanvas';
import {TypingArea} from './TypingArea';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';

export const GameScreen = () => {
  const { gameState, sendTyping } = useGame();
  const { user } = useAuth();
  const actionHandlerRef = useRef(null);

  // Get player data from game state
  const playerIds = Object.keys(gameState?.players || {});
  const currentPlayer = playerIds.find(id => id === user?.id);
  const opponent = playerIds.find(id => id !== currentPlayer);

  const player1Data = {
    username: gameState?.players[currentPlayer]?.username || 'You',
    department: gameState?.players[currentPlayer]?.department || 'computer',
    health: gameState?.players[currentPlayer]?.health || 100
  };

  const player2Data = {
    username: gameState?.players[opponent]?.username || 'Opponent',
    department: gameState?.players[opponent]?.department || 'common',
    health: gameState?.players[opponent]?.health || 100
  };

  // Handle typing with fighter actions
  const handleTyping = (typedText) => {
    // Send typing to server
    sendTyping(gameState.roomId, typedText);
    
    // Trigger fighter action based on typed word
    if (actionHandlerRef.current) {
      const word = typedText.trim().toLowerCase();
      
      // Map words to actions
      const actionMap = {
        'punch': 'punch',
        'kick': 'kick',
        'attack': 'punch',
        'hit': 'punch',
        'jump': 'kick',
        'special': 'punch'
      };
      
      const action = actionMap[word] || 'punch';
      actionHandlerRef.current('player1', action);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Fighter Canvas with Stickman Battle */}
      <FighterCanvas
        player1={player1Data}
        player2={player2Data}
        width={800}
        height={400}
        onAction={(handler) => {
          actionHandlerRef.current = handler;
        }}
      />
      
      {/* Typing Area */}
      <div className="mt-6">
        <TypingArea
          words={gameState?.textPool || []}
          currentIndex={gameState?.wordIndex || 0}
          onType={handleTyping}
          gameStatus={gameState?.status || 'waiting'}
          wpm={gameState?.players[currentPlayer]?.wpm || 0}
          accuracy={gameState?.players[currentPlayer]?.accuracy || 100}
          combo={gameState?.players[currentPlayer]?.combo || 0}
          timeRemaining={gameState?.timeRemaining || 60}
          department={gameState?.players[currentPlayer]?.department || 'common'}
          playerName={gameState?.players[currentPlayer]?.username || 'You'}
        />
      </div>
    </div>
  );
};