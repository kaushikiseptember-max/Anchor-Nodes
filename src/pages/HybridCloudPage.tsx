import React from 'react';
import { useCluster } from '../store/ClusterContext';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  Cloud,
  HardDrive,
  ArrowRight,
  Database,
  Layers,
  DollarSign,
  Clock,
  ShieldCheck,
  CloudUpload,
  ArrowRightLeft,
  Zap,
  TrendingDown,
} from 'lucide-react';

export const HybridCloudPage: React.FC = () => {
  const { objects, archiveObjectToS3, restoreObjectFromS3, selectObject } = useCluster();

  const hotObjects = objects.filter((o) => o.storageTier === 'Vault Hot');
  const coldObjects = objects.filter((o) => o.storageTier === 'AWS S3 Cold');
  const syncingObjects = objects.filter((o) => o.storageTier === 'Hybrid Syncing');

  const hotSizeTB = 18.4;
  const coldSizeTB = 5.8;

  // Monthly cost estimation: NVMe Hot Tier ~$0.12/GB vs S3 Glacier/Standard ~$0.023/GB
  const hotCostMo = (hotSizeTB * 1024 * 0.12).toFixed(0);
  const coldCostMo = (coldSizeTB * 1024 * 0.023).toFixed(0);
  const monthlySavings = (coldSizeTB * 1024 * (0.12 - 0.023)).toFixed(0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2.5">
            <Cloud className="w-6 h-6 text-cyan-400" />
            Hybrid Cloud Storage Tiering (AnchorNode Hot + AWS S3 Cold)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Automated lifecycle offloading: High-performance NVMe for active GPU training runs, AWS S3 for cost-effective long-term cold archives.
          </p>
        </div>

        {/* Demo Badge */}
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/30">
          <Zap className="w-3.5 h-3.5" />
          <span>Simulated AWS S3 Gateway Integration</span>
        </div>
      </div>

      {/* Animated Storage Lifecycle Diagram */}
      <GlassCard
        title="AI Training Lifecycle & Tier Migration Pipeline"
        subtitle="Continuous policy-driven tiering between NVMe cluster and object storage"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-200">1. Data Ingestion</h4>
            <p className="text-[10px] text-slate-400">
              Raw training datasets & token shards ingest to cluster.
            </p>
          </div>

          {/* Arrow */}
          <div className="hidden md:flex justify-center text-cyan-400 animate-pulse">
            <ArrowRight className="w-6 h-6" />
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-gradient-to-b from-violet-950/30 to-slate-900 border border-violet-500/40 text-center space-y-2 ring-1 ring-violet-500/30">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/40 text-violet-300 flex items-center justify-center mx-auto">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-violet-300">2. AnchorNode Hot NVMe</h4>
            <p className="text-[10px] text-slate-400">
              Sub-50ms reads for GPU checkpoints & active backprop.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
              <Cloud className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-200">3. AWS S3 Cold Archive</h4>
            <p className="text-[10px] text-slate-400">
              Completed runs synced to S3 for 80% cost savings.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Two Storage Tiers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier 1: AnchorNode Hot Storage */}
        <GlassCard
          glow="cyan"
          title={
            <div className="flex items-center gap-2 text-cyan-300">
              <HardDrive className="w-5 h-5 text-cyan-400" />
              <span>AnchorNode Hot Storage Tier (NVMe Fleet)</span>
            </div>
          }
          subtitle="Distributed NVMe SSD storage with 3x active quorum replication"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase">Hot Objects</span>
                <p className="text-cyan-400 font-bold text-base mt-0.5">{hotObjects.length}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase">Capacity</span>
                <p className="text-slate-200 font-bold text-base mt-0.5">18.4 TB</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase">Read Latency</span>
                <p className="text-emerald-400 font-bold text-base mt-0.5">&lt; 42 ms</p>
              </div>
            </div>

            <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
              <li className="flex items-center gap-2 text-cyan-300">
                • Ultra-fast read/write throughput for PyTorch & JAX trainer nodes.
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                • 3-way multi-AZ replication with instant failover.
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                • Continuous SHA-256 background integrity scrubbing.
              </li>
            </ul>

            {/* List of Hot Objects */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h5 className="text-[10px] font-mono uppercase text-slate-400">Active Hot Artifacts</h5>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {hotObjects.map((obj) => (
                  <div
                    key={obj.id}
                    className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-2 text-xs font-mono"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-slate-200 font-medium truncate">{obj.name}</p>
                      <span className="text-[10px] text-slate-400">{obj.sizeFormatted} • {obj.type}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => archiveObjectToS3(obj.id)}
                      leftIcon={<CloudUpload className="w-3 h-3 text-cyan-400" />}
                      className="text-[10px] px-2 py-1"
                    >
                      Archive to S3
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Tier 2: AWS S3 Cold Storage */}
        <GlassCard
          glow="violet"
          title={
            <div className="flex items-center gap-2 text-violet-300">
              <Cloud className="w-5 h-5 text-violet-400" />
              <span>AWS S3 Cold Tier (Long-Term Archival)</span>
            </div>
          }
          subtitle="Cost-effective cloud bucket storage for finalized checkpoints"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase">Cold Objects</span>
                <p className="text-violet-400 font-bold text-base mt-0.5">{coldObjects.length}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase">Cold Capacity</span>
                <p className="text-slate-200 font-bold text-base mt-0.5">5.8 TB</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase">Cost Savings</span>
                <p className="text-emerald-400 font-bold text-base mt-0.5">-${monthlySavings}/mo</p>
              </div>
            </div>

            <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
              <li className="flex items-center gap-2 text-violet-300">
                • Infrequently accessed historical evaluation runs and datasets.
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                • AWS S3 standard / Glacier storage class retention.
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                • 1-click restore back into AnchorNode Hot NVMe cluster.
              </li>
            </ul>

            {/* List of Cold Objects */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h5 className="text-[10px] font-mono uppercase text-slate-400">Archived S3 Artifacts</h5>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {coldObjects.length > 0 ? (
                  coldObjects.map((obj) => (
                    <div
                      key={obj.id}
                      className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-2 text-xs font-mono"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-slate-200 font-medium truncate">{obj.name}</p>
                        <span className="text-[10px] text-slate-400">{obj.sizeFormatted} • {obj.s3ArchiveKey}</span>
                      </div>
                      <Button
                        variant="cyan"
                        size="sm"
                        onClick={() => restoreObjectFromS3(obj.id)}
                        leftIcon={<ArrowRightLeft className="w-3 h-3" />}
                        className="text-[10px] px-2 py-1"
                      >
                        Restore to Hot
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 font-mono p-4 text-center">
                    No objects currently in S3 cold tier.
                  </p>
                )}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
