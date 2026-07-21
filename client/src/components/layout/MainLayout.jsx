import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DepartmentBadge } from '../common/DepartmentBadge';
import { motion } from 'framer-motion';

export const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 text-xl font-display">
              <span>⚔️</span>
              <span className="text-primary-600 dark:text-primary-400">TypeFight</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm hover:text-primary-600 transition-colors">
                Home
              </Link>
              <Link to="/leaderboard" className="text-sm hover:text-primary-600 transition-colors">
                Leaderboard
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="text-sm text-primary-600 hover:text-primary-700 transition-colors">
                  Admin
                </Link>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="text-sm font-medium">{user.username}</span>
                    <DepartmentBadge department={user.department} size="sm" />
                  </div>
                  <button
                    onClick={logout}
                    className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="btn-secondary text-sm py-2">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary text-sm py-2">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container-custom py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-12">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <span>⚔️ TypeFight Arena © 2026</span>
            <div className="flex items-center gap-4">
              <span>Made with ❤️ from Research Team</span>
              <span className="w-px h-4 bg-gray-300 dark:bg-gray-700" />
              <span>🏆 1v1 Typing Battles</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};