// client/src/components/layout/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white dark:bg-gray-900 border-t-2 border-gray-200 dark:border-gray-800 py-8 mt-auto">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Left Section - Brand */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚔️</span>
            <span className="font-display font-bold text-xl text-primary-600 dark:text-primary-400">
              Typing Arena
            </span>
            <span className="text-sm text-gray-400">© {currentYear}</span>
          </div>

          {/* Center Section - Links */}
          <div className="flex items-center gap-8 text-base">
            <Link 
              to="/" 
              className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
            >
              Home
            </Link>
            <Link 
              to="/leaderboard" 
              className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
            >
              Leaderboard
            </Link>
            <Link 
              to="/about" 
              className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
            >
              About
            </Link>
          </div>

          {/* Right Section - Status & Social */}
          <div className="flex items-center gap-6 text-sm">
            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
              </span>
              <span className="font-medium">Live</span>
            </span>

            <span className="w-px h-6 bg-gray-300 dark:bg-gray-700" />

            <span className="text-gray-600 dark:text-gray-400 font-medium">
              🏆 1v1 Battles
            </span>

            <span className="w-px h-6 bg-gray-300 dark:bg-gray-700" />

            <span className="text-gray-600 dark:text-gray-400 font-medium flex items-center gap-1">
              Made with <span className="text-red-500 text-lg">❤️</span>
            </span>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;