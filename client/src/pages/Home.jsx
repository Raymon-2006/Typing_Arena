// client/src/pages/Home.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';

import {
  FiUsers,
  FiZap,
  FiTrendingUp,
  FiUserPlus,
  FiLogIn,
  FiVolume2,
  FiVolumeX
} from 'react-icons/fi';

import { GiCrossedSwords, GiTrophyCup } from 'react-icons/gi';

const Home = () => {
  const { user } = useAuth();
  const { isConnected, joinQueue, isSearching, queueSize } = useGame();

  const [hoveredDept, setHoveredDept] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  const departments = [
    { id: 'computer', icon: '💻', label: 'Computer Science', desc: 'Code your way to victory' },
    { id: 'civil', icon: '🏗️', label: 'Civil Engineering', desc: 'Build your legacy' },
    { id: 'architecture', icon: '🏛️', label: 'Architecture', desc: 'Design your future' },
    { id: 'common', icon: '📚', label: 'Common', desc: 'For everyone' }
  ];

  const features = [
    { icon: GiCrossedSwords, label: '1v1 Battles', desc: 'Fight opponents in real-time' },
    { icon: FiZap, label: 'Fast Typing', desc: 'Speed and accuracy matter' },
    { icon: GiTrophyCup, label: 'Leaderboard', desc: 'Compete for the top spot' },
    { icon: FiTrendingUp, label: 'ELO Rating', desc: 'Track your progress' }
  ];

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Setup video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = 0.3;
    video.muted = true;

    const playVideo = async () => {
      try {
        await video.play();
      } catch (error) {
        console.log('Video play error:', error);
      }
    };

    playVideo();
  }, []);

  return (
    <div className="min-h-screen">

      {/* Hero Section - Clean Design with Video Background */}
      <section className="relative min-h-[90vh] w-full overflow-hidden flex items-center">

        {/* Background Video - Subtle & Blurred */}
        <div className="absolute inset-0 w-full h-full">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover scale-105"
            poster="/videos/poster.jpg"
          >
            <source src="/videos/bck-video.mp4" type="video/mp4" />
          </video>

          {/* Dark Overlay - Strong enough for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
          
          {/* Subtle blur overlay for better text contrast */}
          <div className="absolute inset-0 backdrop-blur-[2px]" />
          
          {/* Bottom gradient for smooth transition */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />
        </div>

        {/* Content - Centered with better visibility */}
        <div className="relative z-10 w-full">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto lg:mx-0 text-center lg:text-left">

              {/* Status Badge */}
              <motion.div
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-sm font-medium mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                </span>
                {isConnected ? 'Server Online' : 'Connecting...'}
                <span className="w-px h-5 bg-white/20" />
                <span>{queueSize || 0} players online</span>
              </motion.div>

              {/* Main Title - Clean & Bold */}
              <motion.h1
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold text-white leading-[1.1]"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 via-white to-purple-300">
                  Typing Arena
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="text-xl sm:text-2xl md:text-3xl text-white/80 font-light mt-3 tracking-wide"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Where Words Become Weapons
              </motion.p>

              {/* Description - Clean & Readable */}
              <motion.p
                className="mt-4 max-w-2xl mx-auto lg:mx-0 text-base sm:text-lg text-white/80 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Challenge opponents in real-time typing combat.
                Type fast, type accurate, and climb the leaderboard!
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {user ? (
                  <>
                    <button
                      onClick={() => joinQueue(user)}
                      disabled={isSearching || !isConnected}
                      className="btn-primary px-8 py-4 text-lg flex items-center gap-3 min-w-[200px] justify-center bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 border-0 shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSearching ? (
                        <>
                          <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <GiCrossedSwords className="text-xl" />
                          Find Match
                        </>
                      )}
                    </button>

                    {isSearching && (
                      <span className="text-sm text-white/60 animate-pulse">
                        {queueSize} players in queue
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="btn-primary px-8 py-4 text-lg flex items-center gap-3 min-w-[160px] justify-center bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 border-0 shadow-lg shadow-primary-500/30"
                    >
                      <FiUserPlus className="text-xl" />
                      Get Started
                    </Link>

                    <Link
                      to="/login"
                      className="btn-secondary px-8 py-4 text-lg flex items-center gap-3 min-w-[160px] justify-center bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:border-white/30"
                    >
                      <FiLogIn className="text-xl" />
                      Login
                    </Link>
                  </>
                )}
              </motion.div>

              {/* Stats - Clean Cards */}
              <motion.div
                className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto lg:mx-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                {[
                  { label: 'Active Players', value: '50+', icon: FiUsers },
                  { label: 'Daily Matches', value: '100+', icon: GiCrossedSwords },
                  { label: 'Avg WPM', value: '45', icon: FiZap },
                  { label: 'Departments', value: '4', icon: FiTrendingUp }
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all duration-300"
                  >
                    <stat.icon className="w-5 h-5 mx-auto text-primary-300 mb-1.5" />
                    <div className="text-2xl font-bold text-white">
                      {stat.value}
                    </div>
                    <div className="text-xs text-white/50 font-medium tracking-wide uppercase">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Sound Control - Bottom Right */}
              <button
                onClick={toggleMute}
                className="absolute bottom-6 right-6 z-20 p-3 rounded-full bg-black/40 hover:bg-black/60 text-white/70 hover:text-white transition-all backdrop-blur-sm border border-white/10"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/20"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </section>

      {/* Features Section - Clean & Minimal */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <motion.h2
            className="text-3xl sm:text-4xl font-display font-bold text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Why <span className="text-gradient">Typing Arena</span>?
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                className="card text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="font-semibold text-lg">{feature.label}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container-custom">
          <motion.h2
            className="text-3xl sm:text-4xl font-display font-bold text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Choose Your <span className="text-gradient">Department</span>
          </motion.h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {departments.map((dept) => (
              <motion.div
                key={dept.id}
                className={`card text-center cursor-pointer transition-all duration-300 ${
                  hoveredDept === dept.id
                    ? 'scale-105 shadow-xl border-primary-300 dark:border-primary-700'
                    : ''
                }`}
                onMouseEnter={() => setHoveredDept(dept.id)}
                onMouseLeave={() => setHoveredDept(null)}
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="text-5xl mb-3">{dept.icon}</div>
                <h3 className="font-semibold text-sm">{dept.label}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{dept.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-800 dark:to-primary-900">
        <div className="container-custom text-center">
          <motion.h2
            className="text-3xl sm:text-4xl font-display font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Ready to Battle?
          </motion.h2>

          <motion.p
            className="text-primary-100 mb-8 max-w-lg mx-auto text-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Join the arena now and prove your typing skills against players from all departments!
          </motion.p>

          {user ? (
            <button
              onClick={() => joinQueue(user)}
              disabled={isSearching || !isConnected}
              className="btn-primary bg-white text-primary-700 hover:bg-gray-100 px-10 py-4 text-lg shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? 'Searching...' : '⚔️ Join Battle'}
            </button>
          ) : (
            <Link
              to="/register"
              className="btn-primary bg-white text-primary-700 hover:bg-gray-100 px-10 py-4 text-lg shadow-lg shadow-primary-500/30"
            >
              Create Account
            </Link>
          )}
        </div>
      </section>

    </div>
  );
};

export default Home;