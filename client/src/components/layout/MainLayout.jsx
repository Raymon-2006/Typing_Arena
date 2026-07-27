// client/src/components/layout/MainLayout.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DepartmentBadge } from '../common/DepartmentBadge';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from './Footer';

import {
  FiMenu,
  FiX,
  FiHome,
  FiUser,
  FiLogOut,
  FiSettings
} from 'react-icons/fi';

import { GiTrophyCup } from 'react-icons/gi';

export const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home', icon: FiHome },
    { to: '/leaderboard', label: 'Leaderboard', icon: GiTrophyCup },
    ...(user?.role === 'admin'
      ? [{ to: '/admin', label: 'Admin', icon: FiSettings }]
      : []),
    ...(user
      ? [{ to: '/profile', label: 'Profile', icon: FiUser }]
      : [])
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white dark:from-gray-900 dark:to-gray-950 flex flex-col">

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 text-xl font-display group"
            >
              <motion.span
                className="text-2xl"
                whileHover={{ rotate: 20 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                ⚔️
              </motion.span>

              <span className="text-primary-600 dark:text-primary-400 font-bold tracking-tight">
                Typing
                <span className="text-gray-700 dark:text-gray-300">
                  Arena
                </span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200"
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <div className="hidden sm:flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user.username}
                    </span>

                    <DepartmentBadge
                      department={user.department}
                      size="sm"
                    />
                  </div>

                  <button
                    onClick={logout}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <FiLogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      Logout
                    </span>
                  </button>

                  {/* Mobile Menu Toggle */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    {mobileMenuOpen ? (
                      <FiX size={22} />
                    ) : (
                      <FiMenu size={22} />
                    )}
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="btn-secondary text-sm py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className="btn-primary text-sm py-2 px-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden fixed inset-x-0 top-16 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container-custom py-4 space-y-1">

              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon className="w-5 h-5 text-primary-500" />
                  <span>{link.label}</span>
                </Link>
              ))}

              {user && (
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              )}

              {user && (
                <div className="px-4 py-3 mt-2 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                      {user.username}
                    </span>

                    <DepartmentBadge
                      department={user.department}
                      size="sm"
                    />
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
};

export default MainLayout;