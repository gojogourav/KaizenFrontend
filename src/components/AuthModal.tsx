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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-md bg-[#0F1014]/90 border border-white/15 rounded-3xl p-8 shadow-2xl shadow-black/80 text-slate-100 backdrop-blur-3xl apple-specular">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-white/10 border border-white/15 text-[#FF8A73] mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white font-heading tracking-tight">
            Sign In to <span className="text-[#E04F33]">Kaizen</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Sign in to access your dashboard, saved properties, and live locks.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-200 font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Username or Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#E04F33] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Username or email"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#E04F33] focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#E04F33] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#E04F33] focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#E04F33] hover:bg-[#ED5B3F] text-white font-bold rounded-xl shadow-lg shadow-[#E04F33]/25 border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

      </div>
    </div>
  );
};
