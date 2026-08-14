import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import {
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
  X,
  Loader2,
} from "lucide-react";

/**
 * AdminUIProvider
 * ────────────────────────────────────────────────────────────────
 * Centralised toast notifications + a promise-based confirm dialog
 * so every admin screen can drop window.alert()/confirm() in favor
 * of something that actually matches the product's visual language.
 *
 *   const toast = useToast();
 *   toast.success("Post published");
 *
 *   const confirm = useConfirm();
 *   if (await confirm({ title: "Delete post?", tone: "danger" })) { ... }
 */

// ── Toasts ──────────────────────────────────────────────────────────────
type ToastTone = "success" | "error" | "info";
interface ToastItem {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
}

const TOAST_STYLES: Record<ToastTone, { icon: React.ElementType; cls: string; iconCls: string }> = {
  success: {
    icon: CheckCircle2,
    cls: "border-emerald-500/30 bg-emerald-950/80",
    iconCls: "text-emerald-400",
  },
  error: {
    icon: XCircle,
    cls: "border-rose-500/30 bg-rose-950/80",
    iconCls: "text-rose-400",
  },
  info: {
    icon: Info,
    cls: "border-sky-500/30 bg-sky-950/80",
    iconCls: "text-sky-400",
  },
};

interface ToastContextValue {
  push: (tone: ToastTone, title: string, description?: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within AdminUIProvider");
  return ctx;
};

// ── Confirm dialog ──────────────────────────────────────────────────────
interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
}

type ConfirmContextValue = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export const useConfirm = (): ConfirmContextValue => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within AdminUIProvider");
  return ctx;
};

interface PendingConfirm extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

export const AdminUIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const [busy, setBusy] = useState(false);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (tone: ToastTone, title: string, description?: string) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, tone, title, description }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss],
  );

  const toastApi: ToastContextValue = {
    push,
    success: (t, d) => push("success", t, d),
    error: (t, d) => push("error", t, d),
    info: (t, d) => push("info", t, d),
  };

  const confirm = useCallback<ConfirmContextValue>((options) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve });
    });
  }, []);

  const closeConfirm = (result: boolean) => {
    if (!pending) return;
    pending.resolve(result);
    setPending(null);
    setBusy(false);
  };

  return (
    <ToastContext.Provider value={toastApi}>
      <ConfirmContext.Provider value={confirm}>
        {children}

        {/* Toast stack */}
        <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2.5 w-[min(360px,calc(100vw-2rem))] pointer-events-none">
          {toasts.map((t) => {
            const s = TOAST_STYLES[t.tone];
            const Icon = s.icon;
            return (
              <div
                key={t.id}
                role="status"
                className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border backdrop-blur-2xl shadow-2xl shadow-black/40 animate-[toast-in_0.25s_ease-out] ${s.cls}`}
              >
                <Icon className={`w-4.5 h-4.5 shrink-0 mt-0.5 ${s.iconCls}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white leading-tight">{t.title}</p>
                  {t.description && (
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{t.description}</p>
                  )}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Dismiss notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Confirm dialog */}
        {pending && (
          <div
            className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-[fade-in_0.15s_ease-out]"
            onClick={() => closeConfirm(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-[#121319] border border-white/15 rounded-3xl p-6 shadow-2xl animate-[modal-in_0.2s_cubic-bezier(0.16,1,0.3,1)]"
            >
              <div className="flex items-start gap-3.5 mb-5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                    pending.tone === "danger"
                      ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
                      : "bg-[#E04F33]/15 border-[#E04F33]/30 text-[#E04F33]"
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white leading-snug">{pending.title}</h4>
                  {pending.description && (
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{pending.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2.5">
                <button
                  onClick={() => closeConfirm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                >
                  {pending.cancelLabel || "Cancel"}
                </button>
                <button
                  onClick={() => {
                    setBusy(true);
                    closeConfirm(true);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-lg flex items-center gap-2 ${
                    pending.tone === "danger"
                      ? "bg-rose-600 hover:bg-rose-500 shadow-rose-900/40"
                      : "bg-[#E04F33] hover:bg-[#ED5B3F] shadow-[#E04F33]/25"
                  }`}
                >
                  {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {pending.confirmLabel || "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}
      </ConfirmContext.Provider>
    </ToastContext.Provider>
  );
};
