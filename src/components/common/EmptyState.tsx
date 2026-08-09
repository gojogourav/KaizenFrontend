import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => (
  <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-12 text-center space-y-3">
    <Icon className="w-12 h-12 text-slate-500 mx-auto" aria-hidden="true" />
    <h3 className="text-base font-bold text-white">{title}</h3>
    {description && <p className="text-xs text-slate-400 max-w-sm mx-auto">{description}</p>}
    {action}
  </div>
);
