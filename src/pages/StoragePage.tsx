import React, { useState } from 'react';
import { useCluster } from '../store/ClusterContext';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  Database,
  Search,
  Filter,
  Server,
  ShieldCheck,
  FileWarning,
  Cloud,
  Layers,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { WorkloadType } from '../types';

export const StoragePage: React.FC = () => {
  const { objects, selectObject, selectNode, corruptObject, archiveObjectToS3 } = useCluster();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredObjects = objects.filter((obj) => {
    const matchesSearch =
      obj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obj.checksum.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || obj.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || obj.replicationStatus === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const workloadTypes: WorkloadType[] = [
    'Model Checkpoints',
    'Training Datasets',
    'Embeddings',
    'Evaluation Artifacts',
    'Experiment Outputs',
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2.5">
            <Database className="w-6 h-6 text-cyan-400" />
            AI Artifact & Checkpoint Explorer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Immutable AI storage objects distributed across 3x availability zones with continuous SHA-256 integrity verification.
          </p>
        </div>

        {/* Global Stats Pill */}
        <div className="flex items-center gap-3 text-xs font-mono bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-800">
          <span className="text-slate-400">Total Indexed:</span>
          <span className="text-cyan-400 font-bold">{objects.length} artifacts</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 font-bold">18.4 TB</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-slate-800">
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by object path or SHA-256 hash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Workload Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Workload Types</option>
            {workloadTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Replication States</option>
            <option value="Synchronized">Synchronized</option>
            <option value="Under-replicated">Under-replicated</option>
            <option value="Corrupted replica">Corrupted replica</option>
            <option value="Repairing">Repairing</option>
            <option value="Archived to S3">Archived to S3</option>
          </select>
        </div>
      </div>

      {/* Artifacts Table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
                <th className="p-4 font-semibold">Object Path / Artifact</th>
                <th className="p-4 font-semibold">Workload Type</th>
                <th className="p-4 font-semibold">Size</th>
                <th className="p-4 font-semibold">Replication</th>
                <th className="p-4 font-semibold">Replica Locations (3x)</th>
                <th className="p-4 font-semibold">Checksum</th>
                <th className="p-4 font-semibold">Storage Tier</th>
                <th className="p-4 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredObjects.map((obj) => (
                <tr
                  key={obj.id}
                  onClick={() => selectObject(obj.id)}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  {/* Object Name */}
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 group-hover:border-cyan-500/40 transition-colors">
                        <Database className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                          {obj.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                          Created {new Date(obj.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Workload Type */}
                  <td className="p-4">
                    <span className="font-sans text-slate-300 font-medium">{obj.type}</span>
                  </td>

                  {/* Size */}
                  <td className="p-4 text-slate-200 font-bold">{obj.sizeFormatted}</td>

                  {/* Replication Status */}
                  <td className="p-4">
                    <Badge
                      variant={
                        obj.replicationStatus === 'Synchronized'
                          ? 'healthy'
                          : obj.replicationStatus === 'Corrupted replica'
                          ? 'corrupted'
                          : obj.replicationStatus === 'Under-replicated'
                          ? 'degraded'
                          : 'repairing'
                      }
                      size="sm"
                    >
                      {obj.replicationStatus}
                    </Badge>
                  </td>

                  {/* Replica Locations */}
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {obj.replicaNodes.map((nid) => {
                        const isNodeCorrupted = obj.corruptedNodeId === nid;
                        return (
                          <button
                            key={nid}
                            onClick={() => selectNode(nid)}
                            className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                              isNodeCorrupted
                                ? 'bg-red-500/20 text-red-300 border-red-500/40 font-bold'
                                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-cyan-500/40'
                            }`}
                          >
                            {nid.replace('vault-', '')}
                          </button>
                        );
                      })}
                    </div>
                  </td>

                  {/* Checksum Status */}
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      {obj.checksumStatus === 'Valid' ? (
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <FileWarning className="w-4 h-4 text-red-400" />
                      )}
                      <span
                        className={
                          obj.checksumStatus === 'Valid'
                            ? 'text-emerald-400'
                            : 'text-red-400 font-bold'
                        }
                      >
                        {obj.checksum.slice(0, 8)}...
                      </span>
                    </div>
                  </td>

                  {/* Storage Tier */}
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans ${
                        obj.storageTier === 'Vault Hot'
                          ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                          : 'bg-violet-500/10 text-violet-300 border border-violet-500/30'
                      }`}
                    >
                      <Cloud className="w-3 h-3" />
                      {obj.storageTier}
                    </span>
                  </td>

                  {/* Action Link */}
                  <td className="p-4 text-right">
                    <span className="text-cyan-400 text-xs font-mono group-hover:translate-x-1 inline-flex items-center transition-transform">
                      Inspect →
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
