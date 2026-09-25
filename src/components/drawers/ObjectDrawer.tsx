import React from 'react';
import { useCluster } from '../../store/ClusterContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  X,
  Database,
  FileCode2,
  Server,
  ShieldCheck,
  FileWarning,
  CloudUpload,
  Layers,
  Clock,
  History,
  Activity,
  ArrowRightLeft,
} from 'lucide-react';
import { formatNumber } from '../../utils';

export const ObjectDrawer: React.FC = () => {
  const {
    selectedObject,
    selectObject,
    corruptObject,
    archiveObjectToS3,
    restoreObjectFromS3,
    selectNode,
  } = useCluster();

  if (!selectedObject) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end pointer-events-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs pointer-events-auto transition-opacity"
        onClick={() => selectObject(null)}
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-lg h-full bg-[#080D1A] border-l border-slate-800 shadow-2xl p-6 overflow-y-auto pointer-events-auto flex flex-col justify-between z-10 transition-transform transform animate-in slide-in-from-right duration-250">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Database className="w-5 h-5" />
              </div>
              <div className="min-w-0 pr-2">
                <h3 className="text-sm font-mono font-bold text-slate-100 truncate">
                  {selectedObject.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="cyan" size="sm">
                    {selectedObject.type}
                  </Badge>
                  <span className="text-xs text-slate-400 font-mono">
                    {selectedObject.sizeFormatted}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => selectObject(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Description */}
          {selectedObject.description && (
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              {selectedObject.description}
            </p>
          )}

          {/* Replicas Distribution Map */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-violet-400" />
                3x Quorum Replicas Location
              </h4>
              <Badge
                variant={
                  selectedObject.replicationStatus === 'Synchronized'
                    ? 'healthy'
                    : selectedObject.replicationStatus === 'Corrupted replica'
                    ? 'corrupted'
                    : 'repairing'
                }
                size="sm"
              >
                {selectedObject.replicationStatus}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {selectedObject.replicaNodes.map((nodeId, idx) => {
                const isCorrupted = selectedObject.corruptedNodeId === nodeId;
                return (
                  <div
                    key={nodeId}
                    onClick={() => {
                      selectObject(null);
                      selectNode(nodeId);
                    }}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isCorrupted
                        ? 'border-red-500 bg-red-950/40 text-red-200'
                        : 'border-slate-800 bg-slate-900/80 text-slate-200 hover:border-cyan-500/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-500 font-mono">Replica #{idx + 1}</span>
                      <Server className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <p className="text-xs font-mono font-bold truncate">{nodeId}</p>
                    <p
                      className={`text-[10px] mt-1 ${
                        isCorrupted ? 'text-red-400 font-bold' : 'text-emerald-400'
                      }`}
                    >
                      {isCorrupted ? 'Checksum Mismatch' : 'Synchronized'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cryptographic SHA-256 Checksum */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Cryptographic SHA-256 Integrity
              </span>
              <Badge
                variant={selectedObject.checksumStatus === 'Valid' ? 'healthy' : 'corrupted'}
                size="sm"
              >
                {selectedObject.checksumStatus}
              </Badge>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-cyan-300 break-all select-all">
              {selectedObject.checksum}
            </div>
            <p className="text-[10px] text-slate-400">
              Verified continuously by background scrubbing worker across all replica shards.
            </p>
          </div>

          {/* 24h Read / Write IOPS telemetry */}
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase">24h Quorum Reads</span>
              <p className="text-emerald-400 font-semibold text-sm mt-0.5">
                {formatNumber(selectedObject.readCount24h)} ops
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase">24h Quorum Writes</span>
              <p className="text-violet-400 font-semibold text-sm mt-0.5">
                {formatNumber(selectedObject.writeCount24h)} ops
              </p>
            </div>
          </div>

          {/* Version History Table */}
          {selectedObject.versionHistory && selectedObject.versionHistory.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <History className="w-3.5 h-3.5 text-slate-400" />
                Artifact Version History
              </h4>
              <div className="space-y-1.5">
                {selectedObject.versionHistory.map((ver, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <span className="text-violet-400 font-bold mr-2">{ver.version}</span>
                      <span className="text-slate-400 text-[11px]">{ver.date}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{ver.hash}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Storage Tier & Simulation Actions */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Simulation Actions
            </h4>
            <div className="flex flex-col gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => corruptObject(selectedObject.id, selectedObject.replicaNodes[0])}
                leftIcon={<FileWarning className="w-3.5 h-3.5 text-amber-400" />}
              >
                Simulate Bit-Rot on {selectedObject.replicaNodes[0]}
              </Button>

              {selectedObject.storageTier === 'Vault Hot' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => archiveObjectToS3(selectedObject.id)}
                  leftIcon={<CloudUpload className="w-3.5 h-3.5 text-cyan-400" />}
                >
                  Move to AWS S3 Cold Tier
                </Button>
              ) : (
                <Button
                  variant="cyan"
                  size="sm"
                  onClick={() => restoreObjectFromS3(selectedObject.id)}
                  leftIcon={<ArrowRightLeft className="w-3.5 h-3.5" />}
                >
                  Restore to AnchorNode Hot NVMe Tier
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
