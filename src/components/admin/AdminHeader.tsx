import React from "react";
import { ShieldCheck, LogOut } from "lucide-react";
import type { User } from "../../types/database";

interface AdminHeaderProps {
  admin: User | null;
  onExitAdmin: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  admin,
  onExitAdmin,
}) => {
  const adminName =
    admin?.name ||
    `${admin?.first_name || ""} ${admin?.last_name || ""}`.trim() ||
    admin?.username ||
    "Admin";
  const adminEmail = admin?.email || "";
  const adminAvatar = admin?.avatarUrl;

  return (
    <header className="sticky top-0 z-40 bg-[#0F1014]/90 backdrop-blur-2xl border-b border-white/10 p-4 sm:p-6 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
      <div className="flex items-center gap-3 min-w-0 max-w-full">
        <div className="w-10 h-10 rounded-2xl bg-[#E04F33] p-0.5 shadow-lg shadow-[#E04F33]/25 flex items-center justify-center border border-white/20 shrink-0">
          <div className="w-full h-full bg-[#0F1014] rounded-[14px] flex items-center justify-center">
            <ShieldCheck
              className="w-5 h-5 text-[#E04F33]"
              aria-hidden="true"
            />
          </div>
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-white shrink-0">
              KAIZEN
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[#FF8A73] font-mono text-[9px] font-bold uppercase tracking-widest border border-white/15 shrink-0 whitespace-nowrap">
              Admin Control Portal
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono truncate">
            Enterprise Management Suite
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {adminEmail && (
          <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 bg-white/5 border border-white/15 rounded-full backdrop-blur-xl">
            {adminAvatar ? (
              <img
                src={adminAvatar}
                alt=""
                className="w-7 h-7 rounded-full object-cover border border-[#E04F33] shrink-0"
              />
            ) : (
              <div
                className="w-7 h-7 rounded-full bg-[#E04F33]/20 border border-[#E04F33] flex items-center justify-center text-[10px] font-bold text-[#FF8A73]"
                aria-hidden="true"
              >
                {adminName[0]}
              </div>
            )}
            <div className="text-left min-w-0">
              <p className="text-xs font-bold text-white leading-tight truncate">
                {adminName}
              </p>
              <p className="text-[9px] text-slate-300 font-mono truncate max-w-[140px]">
                {adminEmail}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={onExitAdmin}
          className="px-3.5 sm:px-4 py-2 bg-rose-950/50 hover:bg-rose-900/70 text-rose-200 border border-rose-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md backdrop-blur-xl shrink-0"
        >
          <LogOut
            className="w-3.5 h-3.5 text-rose-400 shrink-0"
            aria-hidden="true"
          />
          <span className="whitespace-nowrap">Exit Portal</span>
        </button>
      </div>
    </header>
  );
};
