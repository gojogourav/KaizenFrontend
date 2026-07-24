/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Lock, Mail } from 'lucide-react';
import { useAuth, User } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user?: User | null) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const cleanInput = email.trim().toLowerCase();
    
    // Check hardcoded admin credentials intercept
    if ((cleanInput === 'admin' || cleanInput === 'admin@kaizen.com') && (password === 'admin123' || password === 'admin' || password === 'kaizen2026')) {
      try {
        const userObj = await login('admin@kaizen.com', password);
        setLoading(false);
        onClose();
        if (onSuccess) onSuccess(userObj);
        return;
      } catch (err: any) {
        setError(err.message || 'Admin login failed');
        setLoading(false);
        return;
      }
    }

    try {
      const userObj = await login(email, password);
      setLoading(false);
      onClose();
      if (onSuccess) onSuccess(userObj);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-md bg-[#130723] border border-purple-800/80 rounded-3xl p-8 shadow-2xl shadow-purple-950/80 text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-purple-900/40 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-purple-900/40 border border-purple-500/30 text-fuchsia-400 mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white font-sans tracking-tight">
            Sign In to <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-500">Kaizen</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Sign in to access your dashboard, saved properties, and live locks.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs text-rose-200 font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1.5 font-mono">
              Username or Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Username or email"
                className="w-full pl-10 pr-4 py-3 bg-[#1e0a35] border border-purple-900/80 rounded-xl text-sm font-medium text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-fuchsia-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1.5 font-mono">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-[#1e0a35] border border-purple-900/80 rounded-xl text-sm font-medium text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-fuchsia-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-600 hover:from-fuchsia-500 hover:to-rose-500 text-white font-bold rounded-xl shadow-lg shadow-pink-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

      </div>
    </div>
  );
};
