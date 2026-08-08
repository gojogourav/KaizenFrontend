/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Lock, Mail, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { useAuth, User } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user?: User | null) => void;
}

// 1. Define Zod Schema for Login
const loginSchema = z.object({
  identifier: z.string().min(1, 'Username or email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const extractErrorMessage = (err: any, fallback: string): string => {
    if (!err) return fallback;
    if (typeof err === 'string') return err;
    if (err.message && typeof err.message === 'string') return err.message;
    if (err.detail && typeof err.detail === 'string') return err.detail;
    if (err.non_field_errors && Array.isArray(err.non_field_errors)) return err.non_field_errors[0];
    return fallback;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    setFieldErrors({});

    // 2. Validate with Zod before doing anything
    const validation = loginSchema.safeParse({ identifier, password });

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0].toString()] = issue.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const userObj = await login(validation.data.identifier.trim(), validation.data.password);

      setLoading(false);
      onClose();
      if (onSuccess) onSuccess(userObj);

    } catch (err: any) {
      setApiError(extractErrorMessage(err, 'Invalid credentials. Please try again.'));
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

        {/* API Error Banner */}
        {apiError && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-200 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{apiError}</span>
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
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Username or email"
                className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-xl text-sm font-medium text-slate-100 placeholder:text-slate-500 focus:outline-none focus:bg-white/10 transition-all ${
                  fieldErrors.identifier ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[#E04F33]'
                }`}
              />
            </div>
            {fieldErrors.identifier && (
              <p className="text-[10px] text-red-400 mt-1.5 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {fieldErrors.identifier}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#E04F33] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-xl text-sm font-medium text-slate-100 placeholder:text-slate-500 focus:outline-none focus:bg-white/10 transition-all ${
                  fieldErrors.password ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[#E04F33]'
                }`}
              />
            </div>
            {fieldErrors.password && (
              <p className="text-[10px] text-red-400 mt-1.5 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {fieldErrors.password}
              </p>
            )}
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
