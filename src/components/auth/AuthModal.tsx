import React, { useState } from "react";
import { Lock, Mail, User as UserIcon, UserPlus, LogIn } from "lucide-react";
import { Modal } from "../common/Modal";
import { useAuth, type User } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
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
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
          <span className="text-blue-600 dark:text-blue-400">Kaizen</span>
        </>
      }
      icon={
        <div className="inline-flex p-3 rounded-2xl bg-blue-600/15 border border-blue-500/30 text-blue-600 dark:text-blue-400">
          {mode === "login" ? (
            <Lock className="w-6 h-6" aria-hidden="true" />
          ) : (
            <UserPlus className="w-6 h-6" aria-hidden="true" />
          )}
        </div>
      }
      maxWidthClass="max-w-md"
    >
      <div
        className={`flex p-1 rounded-xl mb-6 border ${
          isDark ? "bg-slate-800/80 border-slate-700" : "bg-slate-100 border-slate-200"
        }`}
      >
        <button
          type="button"
          onClick={() => handleModeSwitch("login")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mode === "login"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : isDark
              ? "text-slate-400 hover:text-slate-200"
              : "text-slate-600 hover:text-slate-900"
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
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : isDark
              ? "text-slate-400 hover:text-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          Create Account
        </button>
      </div>

      <p className={`text-xs -mt-2 mb-6 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
        {mode === "login"
          ? "Sign in to access your dashboard, saved properties, and live locks."
          : "Create an account to explore properties, save favorites, and lock deals."}
      </p>

      {error && (
        <div
          role="alert"
          className="mb-4 p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-xs text-rose-500 font-medium text-center"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {mode === "register" && (
          <div>
            <label
              htmlFor="auth-username"
              className={`block text-xs font-bold uppercase tracking-wider mb-1.5 font-mono ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Username *
            </label>
            <div className="relative">
              <UserIcon
                className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2"
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
                className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? "bg-slate-800/80 border-slate-700 text-white placeholder-slate-500"
                    : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                }`}
              />
            </div>
          </div>
        )}

        <div>
          <label
            htmlFor="auth-email"
            className={`block text-xs font-bold uppercase tracking-wider mb-1.5 font-mono ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            {mode === "login" ? "Username or Email" : "Email Address"}
          </label>
          <div className="relative">
            <Mail
              className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2"
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
              className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? "bg-slate-800/80 border-slate-700 text-white placeholder-slate-500"
                  : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />
          </div>
        </div>

        {mode === "register" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="auth-first-name"
                className={`block text-xs font-bold uppercase tracking-wider mb-1.5 font-mono ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                First Name
              </label>
              <input
                id="auth-first-name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className={`w-full px-3.5 py-3 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? "bg-slate-800/80 border-slate-700 text-white placeholder-slate-500"
                    : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                }`}
              />
            </div>
            <div>
              <label
                htmlFor="auth-last-name"
                className={`block text-xs font-bold uppercase tracking-wider mb-1.5 font-mono ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Last Name
              </label>
              <input
                id="auth-last-name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className={`w-full px-3.5 py-3 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? "bg-slate-800/80 border-slate-700 text-white placeholder-slate-500"
                    : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                }`}
              />
            </div>
          </div>
        )}

        <div>
          <label
            htmlFor="auth-password"
            className={`block text-xs font-bold uppercase tracking-wider mb-1.5 font-mono ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            Password
          </label>
          <div className="relative">
            <Lock
              className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2"
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
              className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? "bg-slate-800/80 border-slate-700 text-white placeholder-slate-500"
                  : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />
          </div>
        </div>

        {mode === "register" && (
          <div>
            <label
              htmlFor="auth-confirm-password"
              className={`block text-xs font-bold uppercase tracking-wider mb-1.5 font-mono ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Confirm Password
            </label>
            <div className="relative">
              <Lock
                className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2"
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
                className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? "bg-slate-800/80 border-slate-700 text-white placeholder-slate-500"
                    : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                }`}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
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
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors cursor-pointer"
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
