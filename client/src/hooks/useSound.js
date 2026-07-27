import { useRef, useEffect, useCallback } from 'react';

/**
 * Sound Manager - Handles all game sounds
 * Uses Web Audio API for low-latency audio
 */
class SoundManager {
  constructor() {
    this.audioContext = null;
    this.sounds = {};
    this.isEnabled = true;
    this.masterVolume = 0.7;
    this.initialized = false;
  }

  /**
   * Initialize Web Audio API
   */
  init() {
    if (this.initialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
      console.log('🔊 Sound system initialized');
    } catch (error) {
      console.warn('⚠️ Web Audio API not supported');
    }
  }

  /**
   * Generate sound using Web Audio API (no external files needed!)
   */
  generateSound(type, params = {}) {
    if (!this.initialized || !this.isEnabled) return;
    
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    try {
      // Resume context if suspended (needed for Chrome)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      let oscillator, gainNode, buffer;

      switch (type) {
        case 'punch':
        case 'punch-heavy':
          // Punch sound - low frequency impact
          oscillator = ctx.createOscillator();
          gainNode = ctx.createGain();
          
          oscillator.type = 'square';
          oscillator.frequency.setValueAtTime(150, now);
          oscillator.frequency.exponentialRampToValueAtTime(80, now + 0.1);
          
          gainNode.gain.setValueAtTime(0.3 * this.masterVolume, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          
          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);
          oscillator.start(now);
          oscillator.stop(now + 0.15);
          
          // Add noise layer for impact
          const bufferSize = ctx.sampleRate * 0.05;
          const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = noiseBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / bufferSize * 5);
          }
          
          const noise = ctx.createBufferSource();
          noise.buffer = noiseBuffer;
          const noiseGain = ctx.createGain();
          noiseGain.gain.setValueAtTime(0.2 * this.masterVolume, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
          noise.connect(noiseGain);
          noiseGain.connect(ctx.destination);
          noise.start(now);
          noise.stop(now + 0.05);
          
          // Extra impact for heavy punch
          if (type === 'punch-heavy') {
            const extraOsc = ctx.createOscillator();
            const extraGain = ctx.createGain();
            extraOsc.type = 'sawtooth';
            extraOsc.frequency.setValueAtTime(200, now);
            extraGain.gain.setValueAtTime(0.15 * this.masterVolume, now);
            extraGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            extraOsc.connect(extraGain);
            extraGain.connect(ctx.destination);
            extraOsc.start(now + 0.05);
            extraOsc.stop(now + 0.15);
          }
          break;

        case 'hit':
          // Hit sound - higher pitch impact
          oscillator = ctx.createOscillator();
          gainNode = ctx.createGain();
          
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(800, now);
          oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.1);
          
          gainNode.gain.setValueAtTime(0.2 * this.masterVolume, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
          
          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);
          oscillator.start(now);
          oscillator.stop(now + 0.12);
          break;

        case 'typo':
          // Typo sound - error buzz
          oscillator = ctx.createOscillator();
          gainNode = ctx.createGain();
          
          oscillator.type = 'sawtooth';
          oscillator.frequency.setValueAtTime(200, now);
          oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.15);
          
          gainNode.gain.setValueAtTime(0.15 * this.masterVolume, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          
          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);
          oscillator.start(now);
          oscillator.stop(now + 0.15);
          break;

        case 'combo':
          // Combo sound - ascending pitch
          const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
          const noteIndex = Math.min(params.combo || 0, notes.length - 1);
          
          oscillator = ctx.createOscillator();
          gainNode = ctx.createGain();
          
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(notes[noteIndex], now);
          
          gainNode.gain.setValueAtTime(0.12 * this.masterVolume, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          
          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);
          oscillator.start(now);
          oscillator.stop(now + 0.2);
          break;

        case 'victory':
          // Victory fanfare
          const victoryNotes = [523, 659, 784, 1047, 784, 1047, 1175];
          victoryNotes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const time = now + i * 0.08;
            
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, time);
            
            gain.gain.setValueAtTime(0.08 * this.masterVolume, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(time);
            osc.stop(time + 0.1);
          });
          break;

        case 'defeat':
          // Defeat sound - descending
          oscillator = ctx.createOscillator();
          gainNode = ctx.createGain();
          
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(400, now);
          oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.4);
          
          gainNode.gain.setValueAtTime(0.15 * this.masterVolume, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
          
          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);
          oscillator.start(now);
          oscillator.stop(now + 0.4);
          break;

        case 'damage-self':
          // Self damage sound
          oscillator = ctx.createOscillator();
          gainNode = ctx.createGain();
          
          oscillator.type = 'sawtooth';
          oscillator.frequency.setValueAtTime(300, now);
          oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.2);
          
          gainNode.gain.setValueAtTime(0.1 * this.masterVolume, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          
          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);
          oscillator.start(now);
          oscillator.stop(now + 0.2);
          break;

        case 'countdown':
          // Countdown beep
          const freq = params.count === 1 ? 800 : 600;
          oscillator = ctx.createOscillator();
          gainNode = ctx.createGain();
          
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(freq, now);
          
          gainNode.gain.setValueAtTime(0.1 * this.masterVolume, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          
          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);
          oscillator.start(now);
          oscillator.stop(now + 0.1);
          break;

        case 'fight':
          // Fight start sound
          oscillator = ctx.createOscillator();
          gainNode = ctx.createGain();
          
          oscillator.type = 'square';
          oscillator.frequency.setValueAtTime(440, now);
          oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.2);
          
          gainNode.gain.setValueAtTime(0.2 * this.masterVolume, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
          
          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);
          oscillator.start(now);
          oscillator.stop(now + 0.25);
          break;

        case 'game-end':
          // Game end - simple tone
          oscillator = ctx.createOscillator();
          gainNode = ctx.createGain();
          
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(440, now);
          
          gainNode.gain.setValueAtTime(0.1 * this.masterVolume, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          
          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);
          oscillator.start(now);
          oscillator.stop(now + 0.3);
          break;
          
        default:
          // Default click for unrecognized sounds
          oscillator = ctx.createOscillator();
          gainNode = ctx.createGain();
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(500, now);
          gainNode.gain.setValueAtTime(0.05 * this.masterVolume, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);
          oscillator.start(now);
          oscillator.stop(now + 0.05);
      }
    } catch (error) {
      // Silent fail for sound errors
      console.debug('Sound error:', error);
    }
  }

  /**
   * Play a sound by name
   */
  play(soundType, params = {}) {
    if (!this.isEnabled) return;
    this.generateSound(soundType, params);
  }

  /**
   * Toggle sound on/off
   */
  toggle() {
    this.isEnabled = !this.isEnabled;
    return this.isEnabled;
  }

  /**
   * Set master volume
   */
  setVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }
}

// Create singleton instance
const soundManager = new SoundManager();

/**
 * React Hook for using sounds
 */
export const useSound = () => {
  const managerRef = useRef(null);
  
  useEffect(() => {
    if (!managerRef.current) {
      managerRef.current = soundManager;
      soundManager.init();
    }
  }, []);

  const playSound = useCallback((type, params = {}) => {
    if (managerRef.current) {
      managerRef.current.play(type, params);
    }
  }, []);

  const toggleSound = useCallback(() => {
    if (managerRef.current) {
      return managerRef.current.toggle();
    }
    return true;
  }, []);

  const setVolume = useCallback((volume) => {
    if (managerRef.current) {
      managerRef.current.setVolume(volume);
    }
  }, []);

  return { playSound, toggleSound, setVolume };
};

export default soundManager;