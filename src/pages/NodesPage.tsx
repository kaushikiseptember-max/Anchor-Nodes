import React, { useState } from 'react';
import { useCluster } from '../store/ClusterContext';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { DemoControls } from '../components/demo/DemoControls';
import {
  Server,
  HardDrive,
  Cpu,
  Activity,
  ShieldCheck,
  Skull,
  FileWarning,
  RotateCcw,
  LayoutGrid,
  List,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { formatTimeOnly } from '../utils';

export const NodesPage: React.FC = () => {
  const {
    nodes,
    selectNode,
    killNode,
    corruptObject,
    restartNode,
    markNodeHealthy,
    objects,
  } = useCluster();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  return (
    <div className="space-y-6">
      {/* Top Demo Controls Toolbar */}
      <DemoControls compact />

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2.5">
            <Server className="w-6 h-6 text-violet-400" />
            Storage Node Fleet Monitor
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Physical NVMe nodes executing consensus gossip, SHA-256 integrity scrubbing, and peer-to-peer data sync.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              viewMode === 'grid'
                ? 'bg-slate-800 text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              viewMode === 'table'
                ? 'bg-slate-800 text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {nodes.map((node) => {
            const storedObjs = objects.filter((o) => o.replicaNodes.includes(node.id));

            return (
              <div
                key={node.id}
                className={`glass-panel rounded-2xl p-5 border transition-all duration-200 hover:border-cyan-500/50 flex flex-col justify-between ${
                  node.status === 'healthy'
                    ? 'border-slate-800/80'
                    : node.status === 'repairing'
                    ? 'border-amber-500/50 bg-amber-950/20'
                    : node.status === 'corrupted'
                    ? 'border-red-500/50 bg-red-950/20'
                    : 'border-slate-700/60 opacity-70'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-violet-400">
                        <Server className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-mono font-bold text-slate-100 flex items-center gap-1.5">
                          {node.name}
                        </h3>
                        <p className="text-xs text-slate-400">{node.region}</p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        node.status === 'healthy'
                          ? 'healthy'
                          : node.status === 'repairing'
                          ? 'repairing'
                          : node.status === 'corrupted'
                          ? 'corrupted'
                          : 'offline'
                      }
                      size="sm"
                    >
                      {node.status.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Operation Status */}
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs font-mono mb-4">
                    <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                      <span>DAEMON STATE</span>
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Radio className="w-2.5 h-2.5 animate-pulse" />
                        {formatTimeOnly(node.lastHeartbeat)}
                      </span>
                    </div>
                    <p className="text-cyan-300 font-medium truncate">{node.currentOperation}</p>
                  </div>

                  {/* Resource Sliders */}
                  <div className="space-y-2 text-xs font-mono">
                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span className="flex items-center gap-1">
                          <Cpu className="w-3 h-3 text-violet-400" /> CPU Load
                        </span>
                        <span className="text-slate-200">{node.cpuUsagePercent}%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5">
                        <div
                          className="bg-violet-500 h-full rounded-full"
                          style={{ width: `${node.cpuUsagePercent}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span className="flex items-center gap-1">
                          <Activity className="w-3 h-3 text-cyan-400" /> Memory Buffer
                        </span>
                        <span className="text-slate-200">{node.memoryUsagePercent}%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5">
                        <div
                          className="bg-cyan-500 h-full rounded-full"
                          style={{ width: `${node.memoryUsagePercent}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span className="flex items-center gap-1">
                          <HardDrive className="w-3 h-3 text-emerald-400" /> NVMe Hot Disk
                        </span>
                        <span className="text-slate-200">
                          {node.storageUsedTB} / {node.storageCapacityTB} TB ({node.diskUsagePercent}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${node.diskUsagePercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Node Actions Footer */}
                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => selectNode(node.id)}
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    View Details <ExternalLink className="w-3 h-3" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    {node.status === 'healthy' ? (
                      <>
                        <button
                          onClick={() => killNode(node.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 text-xs"
                          title="Simulate Node Kill"
                        >
                          <Skull className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (storedObjs.length > 0) {
                              corruptObject(storedObjs[0].id, node.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 text-xs"
                          title="Simulate Bit-Rot Corruption"
                        >
                          <FileWarning className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => restartNode(node.id)}
                          className="px-2 py-1 rounded-lg bg-slate-800 text-cyan-400 hover:bg-slate-700 border border-slate-700 text-xs font-mono"
                        >
                          Restart
                        </button>
                        <button
                          onClick={() => markNodeHealthy(node.id)}
                          className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-mono"
                        >
                          Sync
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed Table View */
        <GlassCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
                  <th className="p-4 font-semibold">Node ID</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Region</th>
                  <th className="p-4 font-semibold">Version</th>
                  <th className="p-4 font-semibold">CPU</th>
                  <th className="p-4 font-semibold">RAM</th>
                  <th className="p-4 font-semibold">Disk (NVMe)</th>
                  <th className="p-4 font-semibold">Replicas</th>
                  <th className="p-4 font-semibold">Last Heartbeat</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {nodes.map((node) => (
                  <tr
                    key={node.id}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => selectNode(node.id)}
                  >
                    <td className="p-4 font-bold text-slate-100 flex items-center gap-2">
                      <Server className="w-3.5 h-3.5 text-slate-400" />
                      {node.name}
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          node.status === 'healthy'
                            ? 'healthy'
                            : node.status === 'repairing'
                            ? 'repairing'
                            : node.status === 'corrupted'
                            ? 'corrupted'
                            : 'offline'
                        }
                        size="sm"
                      >
                        {node.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-slate-400 font-sans">{node.region}</td>
                    <td className="p-4 text-slate-300">{node.version}</td>
                    <td className="p-4 text-slate-200">{node.cpuUsagePercent}%</td>
                    <td className="p-4 text-slate-200">{node.memoryUsagePercent}%</td>
                    <td className="p-4 text-slate-200">
                      {node.storageUsedTB} / {node.storageCapacityTB} TB
                    </td>
                    <td className="p-4 text-cyan-400 font-bold">{node.replicaCount}x</td>
                    <td className="p-4 text-slate-400">{formatTimeOnly(node.lastHeartbeat)}</td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => killNode(node.id)}
                          className="p-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30"
                          title="Kill Node"
                        >
                          <Skull className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => restartNode(node.id)}
                          className="p-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                          title="Restart Node"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
};
