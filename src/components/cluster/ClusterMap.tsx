import React from 'react';
import { useCluster } from '../../store/ClusterContext';
import { StorageNode } from '../../types';
import { Badge } from '../common/Badge';
import { Server, HardDrive, Cpu, Activity, Zap, CheckCircle2, AlertOctagon, RefreshCw } from 'lucide-react';
import { cn } from '../../utils';

export const ClusterMap: React.FC = () => {
  const { nodes, selectNode, activeDataTransferLink, activeRepairs } = useCluster();

  // Mesh connections between nodes to visualize distributed replication links
  const connectionLinks = [
    { from: 'vault-node-01', to: 'vault-node-02' },
    { from: 'vault-node-02', to: 'vault-node-03' },
    { from: 'vault-node-03', to: 'vault-node-04' },
    { from: 'vault-node-04', to: 'vault-node-05' },
    { from: 'vault-node-05', to: 'vault-node-06' },
    { from: 'vault-node-06', to: 'vault-node-01' },
    { from: 'vault-node-01', to: 'vault-node-04' },
    { from: 'vault-node-02', to: 'vault-node-05' },
    { from: 'vault-node-03', to: 'vault-node-06' },
  ];

  const getNodeCoordinates = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return { x: 50, y: 50 };
    return node.pos;
  };

  const getStatusColor = (status: StorageNode['status']) => {
    switch (status) {
      case 'healthy':
        return {
          border: 'border-emerald-500/40 hover:border-emerald-400',
          bg: 'bg-slate-900/90',
          glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
          dot: 'bg-emerald-400',
          badge: 'healthy' as const,
        };
      case 'repairing':
        return {
          border: 'border-amber-400/80 ring-2 ring-amber-400/40',
          bg: 'bg-amber-950/40',
          glow: 'shadow-[0_0_30px_rgba(245,158,11,0.35)]',
          dot: 'bg-amber-400 animate-ping-slow',
          badge: 'repairing' as const,
        };
      case 'corrupted':
        return {
          border: 'border-red-500 ring-2 ring-red-500/40',
          bg: 'bg-red-950/40',
          glow: 'shadow-[0_0_30px_rgba(239,68,68,0.4)]',
          dot: 'bg-red-500 animate-ping-slow',
          badge: 'corrupted' as const,
        };
      case 'offline':
        return {
          border: 'border-slate-700 opacity-60 hover:opacity-100',
          bg: 'bg-slate-950/80',
          glow: 'shadow-none',
          dot: 'bg-slate-500',
          badge: 'offline' as const,
        };
      default:
        return {
          border: 'border-amber-500/40',
          bg: 'bg-slate-900/90',
          glow: 'shadow-none',
          dot: 'bg-amber-400',
          badge: 'degraded' as const,
        };
    }
  };

  return (
    <div className="relative w-full rounded-2xl glass-panel p-6 overflow-hidden min-h-[580px] flex flex-col justify-between select-none">
      {/* Background Matrix Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      {/* Radial Gradient Ambient Glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info Banner inside Topology */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              Distributed Topology & Replication Mesh
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                6 Nodes • Multi-AZ
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Peer-to-peer gossip protocol with SHA-256 integrity scrubbing and auto-healing failover.
            </p>
          </div>
        </div>

        {/* Live Legend */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span>Healthy</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
            <span>Repairing / Sync</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
            <span>Degraded / Corrupt</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <span>Offline</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Cluster Topology Canvas */}
      <div className="relative w-full h-[450px] my-2">
        {/* SVG Mesh & Dynamic Data Stream Links */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <linearGradient id="healthyLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#334155" stop-opacity="0.4" />
              <stop offset="50%" stop-color="#06B6D4" stop-opacity="0.6" />
              <stop offset="100%" stop-color="#334155" stop-opacity="0.4" />
            </linearGradient>
            <linearGradient id="activeStreamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#10B981" />
              <stop offset="50%" stop-color="#F59E0B" />
              <stop offset="100%" stop-color="#EF4444" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Standard Mesh Lines */}
          {connectionLinks.map((link, idx) => {
            const fromPos = getNodeCoordinates(link.from);
            const toPos = getNodeCoordinates(link.to);
            const isStreamActive =
              activeDataTransferLink &&
              ((activeDataTransferLink.source === link.from && activeDataTransferLink.target === link.to) ||
                (activeDataTransferLink.source === link.to && activeDataTransferLink.target === link.from));

            return (
              <g key={`link-${idx}`}>
                <line
                  x1={`${fromPos.x}%`}
                  y1={`${fromPos.y}%`}
                  x2={`${toPos.x}%`}
                  y2={`${toPos.y}%`}
                  stroke={isStreamActive ? 'url(#activeStreamGrad)' : '#1E293B'}
                  strokeWidth={isStreamActive ? 3.5 : 1.5}
                  strokeDasharray={isStreamActive ? '6 4' : 'none'}
                  className={isStreamActive ? 'animate-flow-line' : ''}
                  filter={isStreamActive ? 'url(#glow)' : undefined}
                />
              </g>
            );
          })}

          {/* Dedicated Active Self-Healing Data Stream Vector (if between non-adjacent nodes) */}
          {activeDataTransferLink && (
            <g>
              {(() => {
                const src = getNodeCoordinates(activeDataTransferLink.source);
                const tgt = getNodeCoordinates(activeDataTransferLink.target);
                return (
                  <>
                    <line
                      x1={`${src.x}%`}
                      y1={`${src.y}%`}
                      x2={`${tgt.x}%`}
                      y2={`${tgt.y}%`}
                      stroke="#F59E0B"
                      strokeWidth={4}
                      strokeDasharray="8 6"
                      className="animate-flow-line"
                      filter="url(#glow)"
                    />
                    {/* Animated Pulsing Data Packet Circle */}
                    <circle r="6" fill="#F59E0B" filter="url(#glow)">
                      <animate
                        attributeName="cx"
                        from={`${src.x}%`}
                        to={`${tgt.x}%`}
                        dur="1.2s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="cy"
                        from={`${src.y}%`}
                        to={`${tgt.y}%`}
                        dur="1.2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </>
                );
              })()}
            </g>
          )}
        </svg>

        {/* Center Cluster Core Status Indicator */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center pointer-events-none">
          <div className="p-4 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center w-36 h-36 mx-auto">
            {activeRepairs.length > 0 ? (
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mb-1" />
            ) : (
              <Zap className="w-8 h-8 text-cyan-400 animate-pulse-subtle mb-1" />
            )}
            <span className="text-[11px] font-semibold text-slate-200">
              {activeRepairs.length > 0 ? 'Self-Healing' : 'Quorum Sync'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {activeRepairs.length > 0 ? `${activeRepairs[0].progressPercent}% Synced` : 'N=3 W=2 R=2'}
            </span>
          </div>
        </div>

        {/* 6 Storage Node Glass Cards positioned in 2D layout */}
        {nodes.map((node) => {
          const style = getStatusColor(node.status);
          const isTargetRepair = activeDataTransferLink?.target === node.id;
          const isSourceRepair = activeDataTransferLink?.source === node.id;

          return (
            <div
              key={node.id}
              onClick={() => selectNode(node.id)}
              style={{
                left: `${node.pos.x}%`,
                top: `${node.pos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className={cn(
                'absolute z-20 w-64 p-3.5 rounded-xl border backdrop-blur-md cursor-pointer transition-all duration-200 hover:scale-105 group',
                style.border,
                style.bg,
                style.glow,
                (isTargetRepair || isSourceRepair) && 'ring-2 ring-amber-400 shadow-xl'
              )}
            >
              {/* Card Top: Node Name & Region & Status */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={cn('w-2 h-2 rounded-full', style.dot)} />
                    <span className="text-xs font-mono font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
                      {node.name}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5">{node.region}</p>
                </div>
                <Badge variant={style.badge} size="sm">
                  {node.status.toUpperCase()}
                </Badge>
              </div>

              {/* Resource Metrics & Replica Stats */}
              <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-800/80 text-[11px]">
                <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800/60">
                  <span className="text-[9px] text-slate-500 uppercase flex items-center gap-1 font-mono">
                    <Cpu className="w-2.5 h-2.5 text-violet-400" /> CPU
                  </span>
                  <p className="font-mono font-semibold text-slate-200 mt-0.5">{node.cpuUsagePercent}%</p>
                </div>
                <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800/60">
                  <span className="text-[9px] text-slate-500 uppercase flex items-center gap-1 font-mono">
                    <HardDrive className="w-2.5 h-2.5 text-cyan-400" /> Disk
                  </span>
                  <p className="font-mono font-semibold text-slate-200 mt-0.5">{node.storageUsedTB} TB</p>
                </div>
                <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800/60">
                  <span className="text-[9px] text-slate-500 uppercase flex items-center gap-1 font-mono">
                    <Activity className="w-2.5 h-2.5 text-emerald-400" /> Reps
                  </span>
                  <p className="font-mono font-semibold text-slate-200 mt-0.5">{node.replicaCount}x</p>
                </div>
              </div>

              {/* Current Node Operation Status */}
              <div className="mt-2 pt-1.5 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/50">
                <span className="truncate pr-1 font-mono">{node.currentOperation}</span>
                <span className="text-cyan-400 text-[10px] font-medium group-hover:underline shrink-0">
                  Inspect →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Self-Healing Banner (shown when a repair is actively streaming) */}
      {activeRepairs.length > 0 && (
        <div className="relative z-10 mt-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 animate-spin">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-amber-200">
                  Self-Healing Engine Active: {activeRepairs[0].phase}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  {activeRepairs[0].currentThroughputMBps} MB/s
                </span>
              </div>
              <p className="text-[11px] text-amber-300/80 font-mono mt-0.5">
                Streaming {activeRepairs[0].objectName} ({activeRepairs[0].dataSizeFormatted}) from{' '}
                <span className="font-bold text-amber-100">{activeRepairs[0].sourceNode}</span> →{' '}
                <span className="font-bold text-amber-100">{activeRepairs[0].targetNode}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-36 bg-slate-900 rounded-full h-2.5 overflow-hidden border border-amber-500/30">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-300"
                style={{ width: `${activeRepairs[0].progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-amber-300">
              {activeRepairs[0].progressPercent}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
