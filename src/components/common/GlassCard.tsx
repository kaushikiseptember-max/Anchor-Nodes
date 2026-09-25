import React from 'react';
import { cn } from '../../utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'violet' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'none';
  hoverEffect?: boolean;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  headerClassName?: string;
  bodyClassName?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  glow = 'none',
  hoverEffect = false,
  title,
  subtitle,
  action,
  headerClassName,
  bodyClassName,
}) => {
  const glowStyles = {
    none: '',
    violet: 'glass-card-glow-violet border-violet-500/30',
    cyan: 'glass-card-glow-cyan border-cyan-500/30',
    emerald: 'glass-card-glow-emerald border-emerald-500/30',
    amber: 'glass-card-glow-amber border-amber-500/30',
    rose: 'glass-card-glow-rose border-rose-500/30',
  };

  return (
    <div
      className={cn(
        'glass-panel rounded-2xl relative overflow-hidden transition-all duration-200',
        glowStyles[glow],
        hoverEffect && 'glass-panel-hover',
        className
      )}
    >
      {(title || action) && (
        <div
          className={cn(
            'flex items-center justify-between px-5 py-4 border-b border-slate-800/80',
            headerClassName
          )}
        >
          <div>
            {title && typeof title === 'string' ? (
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                {title}
              </h3>
            ) : (
              title
            )}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={cn(title ? 'p-5' : 'p-5', bodyClassName)}>{children}</div>
    </div>
  );
};
