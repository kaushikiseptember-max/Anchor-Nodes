import React from 'react';
import { cn } from '../../utils';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'healthy' | 'degraded' | 'repairing' | 'offline' | 'corrupted' | 'info' | 'cyan' | 'purple' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  pulse?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  pulse = false,
  className,
}) => {
  const variantStyles = {
    healthy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    degraded: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    repairing: 'bg-amber-500/15 text-amber-300 border-amber-400/40 animate-pulse-subtle',
    offline: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    corrupted: 'bg-red-500/15 text-red-400 border-red-500/40',
    info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    cyan: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30',
    purple: 'bg-purple-500/15 text-purple-300 border-purple-400/30',
    neutral: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
  };

  const dotColors = {
    healthy: 'bg-emerald-400',
    degraded: 'bg-amber-400',
    repairing: 'bg-amber-300',
    offline: 'bg-rose-400',
    corrupted: 'bg-red-400',
    info: 'bg-cyan-400',
    cyan: 'bg-cyan-400',
    purple: 'bg-purple-400',
    neutral: 'bg-slate-400',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border tracking-wide transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'inline-block rounded-full',
            size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2',
            dotColors[variant],
            pulse && 'animate-ping-slow'
          )}
        />
      )}
      {children}
    </span>
  );
};
