import React from 'react';
import { useCluster } from '../../store/ClusterContext';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';
import { cn } from '../../utils';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useCluster();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
          error: <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />,
          info: <Info className="w-5 h-5 text-cyan-400 shrink-0" />,
        };

        const borderStyles = {
          success: 'border-emerald-500/40 bg-[#0B151E]/95 shadow-emerald-950/40',
          warning: 'border-amber-500/40 bg-[#1A150B]/95 shadow-amber-950/40',
          error: 'border-rose-500/40 bg-[#1D0C11]/95 shadow-rose-950/40',
          info: 'border-cyan-500/40 bg-[#0B1322]/95 shadow-cyan-950/40',
        };

        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-md shadow-xl transition-all transform animate-in slide-in-from-bottom-3 duration-200',
              borderStyles[toast.type]
            )}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-xs font-semibold text-slate-100">{toast.title}</h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-white/5 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
