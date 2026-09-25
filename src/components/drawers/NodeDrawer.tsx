import React from 'react';
import { useCluster } from '../../store/ClusterContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  X,
  Server,
  Cpu,
  HardDrive,
  Activity,
  ShieldCheck,
  RotateCcw,
  Skull,
  FileWarning,
  CheckCircle2,
  Clock,
  Radio,
} from 'lucide-react';
import { formatTimeOnly } from '../../utils';

export const NodeDrawer: React.FC = () => {
  const {
    selectedNode,
    selectNode,
    objects,
    killNode,
    corruptObject,
    restartNode,
    markNodeHealthy,
    selectObject,
  } = useCluster();

  if (!selectedNode) return null;

  // Stored replicas on this node
  const storedObjects = objects.filter((o) => o.replicaNodes.includes(selectedNode.id));

  return (
    <div className="fixed inset-0 z-40 flex justify-end pointer-events-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs pointer-events-auto transition-opacity"
        onClick={() => selectNode(null)}
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-md h-full bg-[#080D1A] border-l border-slate-800 shadow-2xl p-6 overflow-y-auto pointer-events-auto flex flex-col justify-between z-10 transition-transform transform animate-in slide-in-from-right duration-250">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-mono font-bold text-slate-100">{selectedNode.name}</h3>
                  <Badge
                    variant={
                      selectedNode.status === 'healthy'
                        ? 'healthy'
                        : selectedNode.status === 'repairing'
                        ? 'repairing'
                        : selectedNode.status === 'corrupted'
                        ? 'corrupted'
                        : 'offline'
                    }
                    size="sm"
                  >
                    {selectedNode.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{selectedNode.region}</p>
              </div>
            </div>
            <button
              onClick={() => selectNode(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Node Meta Specs */}
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase">IP Address</span>
              <p className="text-slate-200 font-semibold mt-0.5">{selectedNode.ip}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase">Binary Daemon</span>
              <p className="text-slate-200 font-semibold mt-0.5">{selectedNode.version}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase">Last Heartbeat</span>
              <p className="text-slate-200 font-semibold mt-0.5 flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                {formatTimeOnly(selectedNode.lastHeartbeat)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase">Current Operation</span>
              <p className="text-cyan-400 font-semibold mt-0.5 truncate">{selectedNode.currentOperation}</p>
            </div>
          </div>

          {/* Hardware & Storage Telemetry */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Resource Utilization
            </h4>

            {/* CPU Bar */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-violet-400" /> CPU Core Load
                </span>
                <span className="text-slate-200 font-bold">{selectedNode.cpuUsagePercent}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-violet-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${selectedNode.cpuUsagePercent}%` }}
                />
              </div>
            </div>

            {/* Memory Bar */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" /> RAM Buffers (Page Cache)
                </span>
                <span className="text-slate-200 font-bold">{selectedNode.memoryUsagePercent}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${selectedNode.memoryUsagePercent}%` }}
                />
              </div>
            </div>

            {/* Disk Space Bar */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-400" /> NVMe Hot Storage
                </span>
                <span className="text-slate-200 font-bold">
                  {selectedNode.storageUsedTB} / {selectedNode.storageCapacityTB} TB ({selectedNode.diskUsagePercent}%)
                </span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${selectedNode.diskUsagePercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Stored Replicas on this Node */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Stored Replicas ({storedObjects.length})
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">SHA-256 Scrubbed</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {storedObjects.map((obj) => (
                <div
                  key={obj.id}
                  onClick={() => {
                    selectNode(null);
                    selectObject(obj.id);
                  }}
                  className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-mono font-medium text-slate-200 truncate">{obj.name}</p>
                    <p className="text-[10px] text-slate-400 font-sans">
                      {obj.sizeFormatted} • {obj.type}
                    </p>
                  </div>
                  <Badge
                    variant={
                      obj.corruptedNodeId === selectedNode.id
                        ? 'corrupted'
                        : obj.replicationStatus === 'Synchronized'
                        ? 'healthy'
                        : 'repairing'
                    }
                    size="sm"
                  >
                    {obj.corruptedNodeId === selectedNode.id ? 'Corrupted' : obj.replicationStatus}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Action Simulation Menu */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Node Simulation Actions
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={() => killNode(selectedNode.id)}
                leftIcon={<Skull className="w-3.5 h-3.5" />}
              >
                Kill Node
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (storedObjects.length > 0) {
                    corruptObject(storedObjects[0].id, selectedNode.id);
                  }
                }}
                leftIcon={<FileWarning className="w-3.5 h-3.5 text-amber-400" />}
              >
                Corrupt Replica
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => restartNode(selectedNode.id)}
                leftIcon={<RotateCcw className="w-3.5 h-3.5 text-cyan-400" />}
              >
                Restart Daemon
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => markNodeHealthy(selectedNode.id)}
                leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
              >
                Mark Synchronized
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
