import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  titleId: string;
  title: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidthClass?: string;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  titleId,
  title,
  icon,
  children,
  maxWidthClass = "max-w-lg",
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    triggerRef.current = document.activeElement as HTMLElement;

    const dialog = dialogRef.current;
    const focusables = dialog?.querySelectorAll<HTMLElement>(FOCUSABLE);
    focusables?.[0]?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialog) return;

      const nodes = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative w-full ${maxWidthClass} border rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto transition-all ${
          isDark
            ? "bg-slate-900/95 border-slate-800 text-slate-100 shadow-slate-950/80 apple-specular"
            : "bg-white border-slate-200 text-slate-900 shadow-slate-300/50"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className={`absolute top-5 right-5 p-2 rounded-full transition-colors ${
            isDark
              ? "text-slate-400 hover:text-white hover:bg-slate-800"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          {icon}
          <h2
            id={titleId}
            className={`text-xl font-bold font-heading ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            {title}
          </h2>
        </div>

        {children}
      </div>
    </div>
  );
};
