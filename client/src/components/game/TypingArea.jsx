import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const TypingArea = ({
  words = [],
  currentIndex = 0,
  onType,
  gameStatus = 'waiting',
  wpm = 0,
  accuracy = 100,
  combo = 0,
  timeRemaining = 60,
  department = 'common',
  playerName = 'Player',
  totalWords = 0
}) => {
  const [typed, setTyped] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [correctWords, setCorrectWords] = useState([]);
  const [wrongWords, setWrongWords] = useState([]);
  const inputRef = useRef(null);
  const [showWordCount, setShowWordCount] = useState(0);

  const DepartmentIcons = {
    computer: '💻',
    civil: '🏗️',
    architecture: '🏛️',
    common: '📚'
  };

  useEffect(() => {
    if (gameStatus === 'active') {
      inputRef.current?.focus();
    }
  }, [gameStatus]);

  const handleChange = (e) => {
    const value = e.target.value;
    setTyped(value);
    onType(value);

    // Auto-submit on space or enter
    if (value.endsWith(' ') || value.endsWith('\n')) {
      const word = value.trim();
      if (word) {
        const currentWord = words[currentIndex] || '';
        if (word.toLowerCase() === currentWord.toLowerCase()) {
          setCorrectWords([...correctWords, word]);
        } else {
          setWrongWords([...wrongWords, word]);
        }
        setTyped('');
        onType(word);
        setShowWordCount(prev => prev + 1);
      }
    }
  };

  const getWordClass = (word, index) => {
    if (index < currentIndex) {
      // Check if word was correct or wrong
      const isCorrect = correctWords.includes(word);
      return isCorrect 
        ? 'text-green-500 line-through' 
        : 'text-red-500 line-through';
    }
    if (index === currentIndex) {
      return 'text-primary-600 dark:text-primary-300 border-b-2 border-primary-500 animate-glow font-bold';
    }
    return 'text-gray-300 dark:text-gray-600';
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="font-mono">{playerName}</span>
          <span className="w-px h-4 bg-gray-300 dark:bg-gray-700" />
          <span>{DepartmentIcons[department] || '📚'}</span>
          <span className="font-mono">{department}</span>
          <span className="w-px h-4 bg-gray-300 dark:bg-gray-700" />
          <span className="font-mono">
            {showWordCount}/{totalWords} words
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="text-gray-400">⏱️</span>
            <span className="font-mono">{Math.ceil(timeRemaining)}s</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-gray-400">⚡</span>
            <span className="font-mono">{wpm}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-gray-400">🎯</span>
            <span className="font-mono">{accuracy}%</span>
          </span>
        </div>
      </div>

      {/* Word Display */}
      <div className="p-6 min-h-[120px] font-mono text-2xl leading-relaxed tracking-wide bg-gray-50/50 dark:bg-gray-800/30 relative">
        <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto">
          {words.slice(0, 30).map((word, index) => (
            <span
              key={index}
              className={`transition-all duration-200 ${getWordClass(word, index)}`}
            >
              {word}
            </span>
          ))}
          {words.length > 30 && (
            <span className="text-gray-400 text-sm">... +{words.length - 30} more</span>
          )}
        </div>

        {/* Combo display */}
        <AnimatePresence>
          {combo > 0 && (
            <motion.div
              className="absolute top-4 right-4 text-center"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="text-3xl font-bold text-yellow-500 animate-pulse-slow">
                {combo}x
              </div>
              <div className="text-xs text-gray-400">COMBO</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
          <motion.div
            className="h-full bg-primary-500"
            initial={{ width: 0 }}
            animate={{ width: `${(currentIndex / (words.length || 1)) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={typed}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={gameStatus !== 'active'}
            placeholder={gameStatus === 'active' ? 'Type here...' : 'Waiting for game...'}
            className={`
              w-full bg-white dark:bg-gray-900 text-xl font-mono px-4 py-3 rounded-lg
              border-2 transition-all duration-200 outline-none
              ${isFocused ? 'border-primary-400 shadow-lg' : 'border-gray-300 dark:border-gray-700'}
              ${gameStatus !== 'active' ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          
          {/* Cursor animation when active */}
          {gameStatus === 'active' && isFocused && (
            <motion.div
              className="absolute right-3 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-primary-500"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
        </div>

        {/* Status message */}
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>
            {gameStatus === 'waiting' && '⏳ Waiting for opponent...'}
            {gameStatus === 'countdown' && '⏰ Get ready...'}
            {gameStatus === 'active' && '⌨️ Start typing!'}
            {gameStatus === 'finished' && '🏁 Match finished!'}
          </span>
          <span className="font-mono">
            {typed.length > 0 && `${typed.length} characters`}
            {correctWords.length > 0 && ` | ✅ ${correctWords.length}`}
            {wrongWords.length > 0 && ` | ❌ ${wrongWords.length}`}
          </span>
        </div>
      </div>
    </div>
  );
};