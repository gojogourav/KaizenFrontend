import React from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "../../context/ThemeContext";

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center p-2 rounded-full transition-all duration-300 ${
        isDark
          ? "bg-slate-800/80 text-blue-400 hover:text-blue-300 border border-slate-700/60 shadow-lg shadow-blue-900/20"
          : "bg-slate-100 text-blue-600 hover:text-blue-700 border border-slate-200 shadow-md shadow-blue-500/10"
      } ${className}`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
        transition={{ type: "spring", stiffness: 350, damping: 22 }}
        className="flex items-center justify-center"
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
        ) : (
          <Moon className="w-4 h-4 text-blue-600 fill-blue-600/20" />
        )}
      </motion.div>
    </motion.button>
  );
};
