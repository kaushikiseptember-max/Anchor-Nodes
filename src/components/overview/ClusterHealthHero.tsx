import React from 'react';
import { useCluster } from '../../store/ClusterContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Server,
  Zap,
  Activity,
} from 'lucide-react';
import { formatTimeOnly } from '../../utils';

export const ClusterHealthHero: React.FC = () => {
  const { clusterHealth, runHealthCheck, isHealthChecking, activeRepairs } = useCluster();

  const getStatusVisuals = () => {
    switch (clusterHealth.status) {
      case 'Healthy':
        return {
          icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />,
          badgeVariant: 'healthy' as const,
          borderColor: 'border-emerald-500/30',
          glowClass: 'glass-card-glow-emerald',
          gaugeColor: '#10B981',
          percent: 100,
        };
      case 'Repairing':
        return {
          icon: <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />,
          badgeVariant: 'repairing' as const,
          borderColor: 'border-amber-500/40',
          glowClass: 'glass-card-glow-amber',
          gaugeColor: '#F59E0B',
          percent: activeRepairs[0] ? activeRepairs[0].progressPercent : 80,
        };
      case 'Degraded':
        return {
          icon: <AlertTriangle className="w-8 h-8 text-amber-400 animate-bounce" />,
          badgeVariant: 'degraded' as const,
          borderColor: 'border-amber-500/50',
          glowClass: 'glass-card-glow-amber',
          gaugeColor: '#F59E0B',
          percent: 83.3,
        };
      case 'Critical':
        return {
          icon: <AlertOctagon className="w-8 h-8 text-rose-400 animate-pulse" />,
          badgeVariant: 'offline' as const,
          borderColor: 'border-rose-500/50',
          glowClass: 'glass-card-glow-rose',
          gaugeColor: '#EF4444',
          percent: 50,
        };
    }
  };

  const visuals = getStatusVisuals();
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (visuals.percent / 100) * circumference;

  return (
    <div
      className={`relative glass-panel rounded-2xl p-6 transition-all duration-300 ${visuals.borderColor} ${visuals.glowClass} overflow-hidden`}
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Left Side: Status Info & Message */}
        <div className="flex items-start gap-5 flex-1 min-w-0">
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl shrink-0">
            {visuals.icon}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-display font-bold text-slate-100">
                Cluster Health: {clusterHealth.status}
              </h2>
              <Badge variant={visuals.badgeVariant} size="md" dot pulse>
                {clusterHealth.status.toUpperCase()}
              </Badge>
              <span className="text-xs font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-800">
                Uptime: {clusterHealth.uptime} ({clusterHealth.uptimePercent}%)
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">
              {clusterHealth.message}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Last check: {formatTimeOnly(clusterHealth.lastHealthCheck)}
              </span>
              <span className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                Healthy nodes: {clusterHealth.healthyNodeCount} / {clusterHealth.totalNodeCount}
              </span>
              {clusterHealth.degradedNodeCount > 0 && (
                <span className="flex items-center gap-1.5 text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Degraded: {clusterHealth.degradedNodeCount}
                </span>
              )}
              {clusterHealth.activeRepairCount > 0 && (
                <span className="flex items-center gap-1.5 text-amber-300">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Active repairs: {clusterHealth.activeRepairCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Animated Circular Health Gauge Meter */}
        <div className="flex items-center gap-6 shrink-0 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              {/* Background Track */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="#1E293B"
                strokeWidth="10"
              />
              {/* Animated Foreground Progress */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={visuals.gaugeColor}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-xl font-display font-bold text-slate-100">
                {Math.round(visuals.percent)}%
              </span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">
                Integrity
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={runHealthCheck}
              isLoading={isHealthChecking}
              leftIcon={<Activity className="w-3.5 h-3.5 text-cyan-400" />}
            >
              Run Scrub Sweep
            </Button>
            <span className="text-[10px] text-slate-400 text-center font-mono">
              SHA-256 Quorum Scrub
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
