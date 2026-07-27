import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import { MainLayout } from './components/layout/MainLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Game from './pages/Game';
import Profile from './pages/Profile';
import Spectate from './pages/Spectate';
import Admin from './pages/Admin';
import Login from './components/auth/Login';
import Register from './components/auth/Register';

const App = () => {
  return (
    <AuthProvider>
      <GameProvider>
        <MainLayout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/spectate/:roomId" element={<Spectate />} />
            
            {/* Protected Routes */}
            <Route path="/game/:roomId" element={
              <ProtectedRoute>
                <Game />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <Admin />
              </ProtectedRoute>
            } />
            
            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e1e2e',
              color: '#d4d4d4',
              border: '1px solid #2d2d3d'
            }
          }}
        />
      </GameProvider>
    </AuthProvider>
  );
};

export default App;