import React from 'react';
import { useCluster } from '../../store/ClusterContext';
import { Tooltip } from '../common/Tooltip';
import {
  HardDrive,
  Layers,
  Copy,
  Server,
  RefreshCw,
  Zap,
  TrendingUp,
  Info,
} from 'lucide-react';
import { formatNumber } from '../../utils';

export const MetricCardsGrid: React.FC = () => {
  const { clusterHealth, activeRepairs } = useCluster();

  const metrics = [
    {
      label: 'Total Stored Data',
      value: `${clusterHealth.totalStoredDataTB} TB`,
      trend: '+2.4 TB this week',
      trendPositive: true,
      icon: <HardDrive className="w-5 h-5 text-cyan-400" />,
      glowColor: 'cyan' as const,
      tooltip: 'Total active model checkpoints, datasets, and embeddings stored across 6 NVMe nodes.',
    },
    {
      label: 'Active Objects',
      value: formatNumber(clusterHealth.activeObjectsCount),
      trend: '+14,800 today',
      trendPositive: true,
      icon: <Layers className="w-5 h-5 text-violet-400" />,
      glowColor: 'violet' as const,
      tooltip: 'Distinct AI training artifacts, weight files, and vector embeddings tracked in metadata index.',
    },
    {
      label: 'Replication Factor',
      value: `${clusterHealth.replicationFactor}x`,
      trend: 'Fault Tolerance: N-1',
      trendPositive: true,
      icon: <Copy className="w-5 h-5 text-emerald-400" />,
      glowColor: 'emerald' as const,
      tooltip: 'Every storage object is replicated across at least 3 distinct availability zones.',
    },
    {
      label: 'Healthy Nodes',
      value: `${clusterHealth.healthyNodeCount} / ${clusterHealth.totalNodeCount}`,
      trend:
        clusterHealth.healthyNodeCount === 6
          ? 'All nodes online'
          : `${clusterHealth.offlineNodeCount} offline`,
      trendPositive: clusterHealth.healthyNodeCount === 6,
      icon: <Server className="w-5 h-5 text-indigo-400" />,
      glowColor: clusterHealth.healthyNodeCount === 6 ? ('emerald' as const) : ('amber' as const),
      tooltip: 'Storage daemons connected to gossip cluster and responding to heartbeat sweeps.',
    },
    {
      label: 'Active Repairs',
      value: `${activeRepairs.length}`,
      trend: activeRepairs.length > 0 ? 'Self-healing in progress' : '0 pending jobs',
      trendPositive: activeRepairs.length === 0,
      icon: (
        <RefreshCw
          className={`w-5 h-5 ${activeRepairs.length > 0 ? 'text-amber-400 animate-spin' : 'text-slate-400'}`}
        />
      ),
      glowColor: activeRepairs.length > 0 ? ('amber' as const) : ('none' as const),
      tooltip: 'Autonomous background data reconstruction tasks transferring clean replicas.',
    },
    {
      label: 'Avg Read Latency',
      value: `${clusterHealth.avgReadLatencyMs} ms`,
      trend: 'P99 Quorum Read',
      trendPositive: true,
      icon: <Zap className="w-5 h-5 text-teal-400" />,
      glowColor: 'cyan' as const,
      tooltip: 'Average latency for AI training nodes reading model weights via R=2 quorum.',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
      {metrics.map((metric, idx) => (
        <div
          key={idx}
          className="glass-panel p-4 rounded-xl border border-slate-800/80 hover:border-slate-700/80 transition-all duration-200 group relative flex flex-col justify-between"
        >
          {/* Top Row: Icon & Tooltip */}
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 group-hover:border-slate-700 transition-colors">
              {metric.icon}
            </div>
            <Tooltip content={metric.tooltip} position="top">
              <button className="text-slate-500 hover:text-slate-300 p-1 rounded transition-colors">
                <Info className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          </div>

          {/* Metric Value & Label */}
          <div>
            <div className="text-xl font-display font-bold text-slate-100 group-hover:text-white transition-colors">
              {metric.value}
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{metric.label}</p>
          </div>

          {/* Trend Indicator */}
          <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono">
            <span
              className={
                metric.trendPositive
                  ? 'text-emerald-400 flex items-center gap-1'
                  : 'text-amber-400 flex items-center gap-1'
              }
            >
              {metric.trend}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
