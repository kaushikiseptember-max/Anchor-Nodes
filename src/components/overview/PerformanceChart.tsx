import React, { useState } from 'react';
import { GlassCard } from '../common/GlassCard';
import { useCluster } from '../../store/ClusterContext';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Zap, Activity, ArrowDownUp, RefreshCw } from 'lucide-react';

type TabType = 'readLatency' | 'writeLatency' | 'replicationThroughput' | 'repairThroughput';

export const PerformanceChart: React.FC = () => {
  const { metricTimeSeries, activeRepairs } = useCluster();
  const [activeTab, setActiveTab] = useState<TabType>('readLatency');

  const tabConfig = {
    readLatency: {
      label: 'Read Latency',
      dataKey: 'readLatencyMs',
      unit: 'ms',
      color: '#06B6D4',
      gradientId: 'readGrad',
      icon: <Zap className="w-3.5 h-3.5" />,
      currentValue: '42 ms',
    },
    writeLatency: {
      label: 'Write Latency',
      dataKey: 'writeLatencyMs',
      unit: 'ms',
      color: '#8B5CF6',
      gradientId: 'writeGrad',
      icon: <ArrowDownUp className="w-3.5 h-3.5" />,
      currentValue: '68 ms',
    },
    replicationThroughput: {
      label: 'Replication Throughput',
      dataKey: 'replicationThroughputMBps',
      unit: 'MB/s',
      color: '#10B981',
      gradientId: 'repGrad',
      icon: <Activity className="w-3.5 h-3.5" />,
      currentValue: '880 MB/s',
    },
    repairThroughput: {
      label: 'Repair Throughput',
      dataKey: 'repairThroughputMBps',
      unit: 'MB/s',
      color: '#F59E0B',
      gradientId: 'repairGrad',
      icon: <RefreshCw className="w-3.5 h-3.5" />,
      currentValue: activeRepairs.length > 0 ? '1,840 MB/s' : '0 MB/s',
    },
  };

  const currentTabConfig = tabConfig[activeTab];

  // Adjust live repair data point if repair active
  const dynamicTimeSeries = metricTimeSeries.map((point, idx) => ({
    ...point,
    repairThroughputMBps:
      activeRepairs.length > 0
        ? idx >= metricTimeSeries.length - 2
          ? activeRepairs[0].currentThroughputMBps
          : 0
        : 0,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-slate-700 p-2.5 rounded-xl shadow-xl backdrop-blur-md text-xs font-mono">
          <p className="text-slate-400 mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: currentTabConfig.color }}
            />
            <span className="font-semibold text-slate-100">{currentTabConfig.label}:</span>
            <span className="font-bold" style={{ color: currentTabConfig.color }}>
              {payload[0].value} {currentTabConfig.unit}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <GlassCard
      title="Storage Engine Telemetry"
      subtitle="Real-time IOPS, P99 latency, and multi-node stream bandwidth"
      action={
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          {(Object.keys(tabConfig) as TabType[]).map((tab) => {
            const config = tabConfig[tab];
            const isSelected = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                  isSelected
                    ? 'bg-slate-800 text-cyan-400 font-semibold shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {config.icon}
                <span className="hidden sm:inline">{config.label}</span>
              </button>
            );
          })}
        </div>
      }
      className="h-full flex flex-col justify-between"
    >
      <div className="h-56 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dynamicTimeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={currentTabConfig.gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentTabConfig.color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={currentTabConfig.color} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis
              dataKey="timestamp"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#1E293B' }}
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#1E293B' }}
              unit={` ${currentTabConfig.unit}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={currentTabConfig.dataKey}
              stroke={currentTabConfig.color}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#${currentTabConfig.gradientId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};
