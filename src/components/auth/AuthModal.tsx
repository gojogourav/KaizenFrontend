import React, { useState } from "react";
import { Lock, Mail } from "lucide-react";
import { Modal } from "../common/Modal";
import { useAuth, type User } from "../../context/AuthContext";
import { extractErrorMessage } from "../../hooks/useErrorMessage";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user?: User | null) => void;
}

const ADMIN_ALIASES = new Set(["admin", "admin@kaizen.com"]);

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const identifier = ADMIN_ALIASES.has(email.trim().toLowerCase())
      ? "admin@kaizen.com"
      : email;

    try {
      const user = await login(identifier, password);
      onClose();
      onSuccess?.(user);
    } catch (err: any) {
      setError(extractErrorMessage(err, "Login failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      titleId="auth-modal-title"
      title={
        <>
          Sign In to <span className="text-[#E04F33]">Kaizen</span>
        </>
      }
      icon={
        <div className="inline-flex p-3 rounded-2xl bg-white/10 border border-white/15 text-[#FF8A73]">
          <Lock className="w-6 h-6" aria-hidden="true" />
        </div>
      }
      maxWidthClass="max-w-md"
    >
      <p className="text-xs text-slate-300 -mt-4 mb-6">
        Sign in to access your dashboard, saved properties, and live locks.
      </p>

      {error && (
        <div
          role="alert"
          className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-200 font-medium text-center"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="auth-email"
            className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 font-mono"
          >
            Username or Email
          </label>
          <div className="relative">
            <Mail
              className="w-4 h-4 text-[#E04F33] absolute left-3.5 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              id="auth-email"
              type="text"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Username or email"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#E04F33]"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="auth-password"
            className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 font-mono"
          >
            Password
          </label>
          <div className="relative">
            <Lock
              className="w-4 h-4 text-[#E04F33] absolute left-3.5 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              id="auth-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#E04F33]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[#E04F33] hover:bg-[#ED5B3F] text-white font-bold rounded-xl shadow-lg shadow-[#E04F33]/25 border border-white/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
        >
          {loading ? "Authenticating…" : "Sign In"}
        </button>
      </form>
    </Modal>
  );
};
