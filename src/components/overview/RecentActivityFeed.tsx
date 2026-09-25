import React from 'react';
import { GlassCard } from '../common/GlassCard';
import { useCluster } from '../../store/ClusterContext';
import { Badge } from '../common/Badge';
import {
  Activity,
  Server,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  FileWarning,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { formatRelativeTime } from '../../utils';

export const RecentActivityFeed: React.FC<{ limit?: number; onViewAll?: () => void }> = ({
  limit = 6,
  onViewAll,
}) => {
  const { activityLogs, selectNode, selectObject } = useCluster();

  const displayedEvents = activityLogs.slice(0, limit);

  const getSeverityIcon = (category: string, severity: string) => {
    if (severity === 'critical') {
      return <AlertTriangle className="w-4 h-4 text-rose-400" />;
    }
    if (category === 'Checksum') {
      return <ShieldCheck className="w-4 h-4 text-cyan-400" />;
    }
    if (category === 'Repairs') {
      return <RefreshCw className="w-4 h-4 text-amber-400" />;
    }
    if (category === 'Node') {
      return <Server className="w-4 h-4 text-violet-400" />;
    }
    return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'offline' as const;
      case 'warning':
        return 'degraded' as const;
      case 'success':
        return 'healthy' as const;
      default:
        return 'info' as const;
    }
  };

  return (
    <GlassCard
      title="Cluster Activity & Self-Healing Stream"
      subtitle="Real-time gossip events, checksum scrubbing logs, and repair transfers"
      action={
        onViewAll ? (
          <button
            onClick={onViewAll}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono transition-colors"
          >
            Full Audit Log <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : undefined
      }
    >
      <div className="space-y-2.5">
        {displayedEvents.map((evt) => (
          <div
            key={evt.id}
            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                {getSeverityIcon(evt.category, evt.severity)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-slate-200">
                    {evt.event}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-1 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {formatRelativeTime(evt.timestamp)}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300 font-semibold">{evt.component}</span>

                  {evt.nodeId && (
                    <>
                      <span className="text-slate-500">•</span>
                      <button
                        onClick={() => selectNode(evt.nodeId!)}
                        className="text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <Server className="w-3 h-3" />
                        {evt.nodeId}
                      </button>
                    </>
                  )}

                  {evt.objectName && (
                    <>
                      <span className="text-slate-500">•</span>
                      <span className="text-violet-300 truncate max-w-xs">{evt.objectName}</span>
                    </>
                  )}
                </div>

                {evt.progress !== undefined && (
                  <div className="mt-2 w-48 bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-amber-400 h-full transition-all"
                      style={{ width: `${evt.progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 sm:text-right">
              <Badge variant={getSeverityBadgeVariant(evt.severity)} size="sm">
                {evt.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};
