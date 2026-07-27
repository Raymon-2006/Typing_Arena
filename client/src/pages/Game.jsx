// Game page
import React from 'react';
import { useParams } from 'react-router-dom';
import { GameScreen } from '../components/game/GameScreen';

const Game = () => {
  const { roomId } = useParams();
  
  return (
    <div className="min-h-[80vh]">
      <GameScreen roomId={roomId} />
    </div>
  );
};

export default Game;