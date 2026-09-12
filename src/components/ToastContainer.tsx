import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
          warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
          error: <XCircle className="w-4 h-4 text-rose-400 shrink-0" />,
          info: <Info className="w-4 h-4 text-sky-400 shrink-0" />
        };

        const borders = {
          success: 'border-emerald-500/30 bg-slate-900/95 text-slate-100 shadow-xl shadow-emerald-950/20 backdrop-blur-md',
          warning: 'border-amber-500/30 bg-slate-900/95 text-slate-100 shadow-xl shadow-amber-950/20 backdrop-blur-md',
          error: 'border-rose-500/30 bg-slate-900/95 text-slate-100 shadow-xl shadow-rose-950/20 backdrop-blur-md',
          info: 'border-sky-500/30 bg-slate-900/95 text-slate-100 shadow-xl shadow-sky-950/20 backdrop-blur-md'
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-2.5 p-3.5 rounded-xl border shadow-lg transition-all ${borders[toast.type]}`}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="font-bold text-xs text-white font-mono">{toast.title}</span>
                <span className="text-[10px] font-mono text-slate-400">{toast.timestamp}</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
