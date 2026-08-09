import React, { useState } from "react";
import { Lock, Mail, User as UserIcon, UserPlus, LogIn } from "lucide-react";
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
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleModeSwitch = (newMode: "login" | "register") => {
    setMode(newMode);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        const identifier = ADMIN_ALIASES.has(email.trim().toLowerCase())
          ? "admin@kaizen.com"
          : email;
        const user = await login(identifier, password);
        onClose();
        onSuccess?.(user);
      } else {
        if (!username.trim()) {
          setError("Username is required.");
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          setLoading(false);
          return;
        }
        if (password.length < 8) {
          setError("Password must be at least 8 characters long.");
          setLoading(false);
          return;
        }

        const user = await register({
          username: username.trim(),
          email: email.trim(),
          password,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        });
        onClose();
        onSuccess?.(user);
      }
    } catch (err: any) {
      setError(
        extractErrorMessage(
          err,
          mode === "login"
            ? "Login failed. Please check your credentials."
            : "Registration failed. Please check your inputs.",
        ),
      );
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
          {mode === "login" ? "Sign In to" : "Create Account on"}{" "}
          <span className="text-[#E04F33]">Kaizen</span>
        </>
      }
      icon={
        <div className="inline-flex p-3 rounded-2xl bg-white/10 border border-white/15 text-[#FF8A73]">
          {mode === "login" ? (
            <Lock className="w-6 h-6" aria-hidden="true" />
          ) : (
            <UserPlus className="w-6 h-6" aria-hidden="true" />
          )}
        </div>
      }
      maxWidthClass="max-w-md"
    >
      <div className="flex bg-white/5 p-1 rounded-xl mb-6 border border-white/10">
        <button
          type="button"
          onClick={() => handleModeSwitch("login")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mode === "login"
              ? "bg-[#E04F33] text-white shadow-md shadow-[#E04F33]/20"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <LogIn className="w-3.5 h-3.5" />
          Sign In
        </button>
        <button
          type="button"
          onClick={() => handleModeSwitch("register")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mode === "register"
              ? "bg-[#E04F33] text-white shadow-md shadow-[#E04F33]/20"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          Create Account
        </button>
      </div>

      <p className="text-xs text-slate-300 -mt-2 mb-6">
        {mode === "login"
          ? "Sign in to access your dashboard, saved properties, and live locks."
          : "Create an account to explore properties, save favorites, and lock deals."}
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
        {mode === "register" && (
          <div>
            <label
              htmlFor="auth-username"
              className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 font-mono"
            >
              Username *
            </label>
            <div className="relative">
              <UserIcon
                className="w-4 h-4 text-[#E04F33] absolute left-3.5 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                id="auth-username"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#E04F33]"
              />
            </div>
          </div>
        )}

        <div>
          <label
            htmlFor="auth-email"
            className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 font-mono"
          >
            {mode === "login" ? "Username or Email" : "Email Address"}
          </label>
          <div className="relative">
            <Mail
              className="w-4 h-4 text-[#E04F33] absolute left-3.5 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              id="auth-email"
              type={mode === "register" ? "email" : "text"}
              required={mode === "login"}
              autoComplete={mode === "login" ? "username" : "email"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={
                mode === "login"
                  ? "Username or email"
                  : "john@example.com (optional)"
              }
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#E04F33]"
            />
          </div>
        </div>

        {mode === "register" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="auth-first-name"
                className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 font-mono"
              >
                First Name
              </label>
              <input
                id="auth-first-name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="w-full px-3.5 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#E04F33]"
              />
            </div>
            <div>
              <label
                htmlFor="auth-last-name"
                className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 font-mono"
              >
                Last Name
              </label>
              <input
                id="auth-last-name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="w-full px-3.5 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#E04F33]"
              />
            </div>
          </div>
        )}

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
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#E04F33]"
            />
          </div>
        </div>

        {mode === "register" && (
          <div>
            <label
              htmlFor="auth-confirm-password"
              className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 font-mono"
            >
              Confirm Password
            </label>
            <div className="relative">
              <Lock
                className="w-4 h-4 text-[#E04F33] absolute left-3.5 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                id="auth-confirm-password"
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#E04F33]"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[#E04F33] hover:bg-[#ED5B3F] text-white font-bold rounded-xl shadow-lg shadow-[#E04F33]/25 border border-white/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
        >
          {loading
            ? mode === "login"
              ? "Authenticating…"
              : "Creating Account…"
            : mode === "login"
              ? "Sign In"
              : "Create Account"}
        </button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => handleModeSwitch(mode === "login" ? "register" : "login")}
            className="text-xs text-slate-400 hover:text-[#FF8A73] font-medium transition-colors"
          >
            {mode === "login"
              ? "Don't have an account? Create one"
              : "Already have an account? Sign In"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
