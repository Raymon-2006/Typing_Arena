import React, { useRef, useEffect, useState } from 'react';
import FighterEngine from './FighterEngine';
import { useGame } from '../../context/GameContext';

const FighterCanvas = ({ 
  player1, 
  player2, 
  width = 800, 
  height = 400,
  onAction 
}) => {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const { gameState } = useGame();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize fighter engine
    const engine = new FighterEngine(canvas);
    engineRef.current = engine;

    // Create fighters
    const fighter1 = engine.createFighter({
      id: 'player1',
      x: 200,
      y: 280,
      color: '#58a6ff',
      name: player1?.username || 'Player 1',
      department: player1?.department || 'computer'
    });

    const fighter2 = engine.createFighter({
      id: 'player2',
      x: 600,
      y: 280,
      direction: -1,
      color: '#f85149',
      name: player2?.username || 'Player 2',
      department: player2?.department || 'common'
    });

    // Start the engine
    engine.start();
    setIsReady(true);

    // Cleanup
    return () => {
      engine.destroy();
    };
  }, []);

  // Listen for game state changes
  useEffect(() => {
    if (!engineRef.current || !isReady) return;

    const engine = engineRef.current;

    // Update fighter health
    if (gameState?.players) {
      const playerIds = Object.keys(gameState.players);
      const p1 = playerIds[0];
      const p2 = playerIds[1];
      
      if (p1 && p2) {
        const health1 = gameState.players[p1]?.health || 100;
        const health2 = gameState.players[p2]?.health || 100;
        
        // Update fighter health
        const fighter1 = engine.fighters.find(f => f.id === 'player1');
        const fighter2 = engine.fighters.find(f => f.id === 'player2');
        
        if (fighter1) fighter1.health = health1;
        if (fighter2) fighter2.health = health2;
      }
    }
  }, [gameState]);

  // Handle typing actions
  const handleTypingAction = (playerId, action) => {
    if (!engineRef.current || !isReady) return;
    const engine = engineRef.current;
    const fighter = engine.fighters.find(f => f.id === playerId);
    
    if (fighter) {
      engine.setAction(playerId, action);
      
      // Trigger effects for combat actions
      if (action === 'punch' || action === 'kick') {
        const opponent = engine.fighters.find(f => f.id !== playerId);
        if (opponent) {
          // Create hit effect at opponent position
          engine.createHitEffect(opponent.x, opponent.y - 20);
          // Trigger screen shake
          engine.screenShake.intensity = 6;
        }
      }
    }
  };

  // Expose action handler to parent
  useEffect(() => {
    if (onAction) {
      onAction(handleTypingAction);
    }
  }, [onAction, isReady]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-800">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full bg-[#1a1a2e]"
      />
      
      {/* Health Bars Overlay */}
      <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
        {/* Player 1 Health */}
        <div className="w-48">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{player1?.username || 'Player 1'}</span>
            <span>{Math.round(player1?.health || 100)}%</span>
          </div>
          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300"
              style={{ width: `${player1?.health || 100}%` }}
            />
          </div>
        </div>
        
        {/* Player 2 Health */}
        <div className="w-48 text-right">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{Math.round(player2?.health || 100)}%</span>
            <span>{player2?.username || 'Player 2'}</span>
          </div>
          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-400 to-red-600 transition-all duration-300"
              style={{ width: `${player2?.health || 100}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* VS Badge */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-white/10 pointer-events-none">
        VS
      </div>
      
      {/* Combo Counter */}
      {gameState?.combo && gameState.combo > 1 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-yellow-400 text-2xl font-bold animate-pulse pointer-events-none">
          🔥 {gameState.combo}x Combo!
        </div>
      )}
    </div>
  );
};

export default FighterCanvas;