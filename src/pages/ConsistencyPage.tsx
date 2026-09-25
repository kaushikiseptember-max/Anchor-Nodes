import React from 'react';
import { useCluster } from '../store/ClusterContext';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  GitFork,
  ShieldCheck,
  Zap,
  Sliders,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Server,
  Info,
  Clock,
} from 'lucide-react';
import { analyzeConsistency } from '../utils';
import { ConsistencyConfig, ConsistencyPreset } from '../types';

export const ConsistencyPage: React.FC = () => {
  const { consistencyConfig, updateConsistency } = useCluster();
  const analysis = analyzeConsistency(consistencyConfig);

  const handlePresetSelect = (preset: ConsistencyPreset) => {
    switch (preset) {
      case 'Fast':
        updateConsistency({ N: 3, W: 1, R: 1, preset: 'Fast' });
        break;
      case 'Balanced':
        updateConsistency({ N: 3, W: 2, R: 2, preset: 'Balanced' });
        break;
      case 'Safe':
        updateConsistency({ N: 3, W: 3, R: 2, preset: 'Safe' });
        break;
    }
  };

  const handleCustomChange = (key: 'N' | 'W' | 'R', value: number) => {
    const updated: ConsistencyConfig = {
      ...consistencyConfig,
      [key]: value,
      preset: 'Custom',
    };
    updateConsistency(updated);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2.5">
            <GitFork className="w-6 h-6 text-violet-400" />
            N/W/R Distributed Quorum Configurator
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure Dynamo-style quorum parameters for tunable consistency across AI training clusters.
          </p>
        </div>

        {/* Demo Mode Notice */}
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/30">
          <Zap className="w-3.5 h-3.5" />
          <span>Simulated in Demo Mode — Enforced by backend in Live Mode</span>
        </div>
      </div>

      {/* Preset Selector Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Fast Preset */}
        <div
          onClick={() => handlePresetSelect('Fast')}
          className={`glass-panel p-5 rounded-2xl border cursor-pointer transition-all ${
            consistencyConfig.preset === 'Fast'
              ? 'border-cyan-500 bg-cyan-950/20 ring-1 ring-cyan-500/50'
              : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-100">Fast (Eventual)</h3>
            </div>
            <Badge variant="cyan" size="sm">
              N=3, W=1, R=1
            </Badge>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Ultra-low latency. Ideal for high-throughput streaming embeddings and non-critical logging.
          </p>
        </div>

        {/* Balanced Preset */}
        <div
          onClick={() => handlePresetSelect('Balanced')}
          className={`glass-panel p-5 rounded-2xl border cursor-pointer transition-all ${
            consistencyConfig.preset === 'Balanced'
              ? 'border-violet-500 bg-violet-950/20 ring-1 ring-violet-500/50'
              : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-bold text-slate-100">Balanced (Recommended)</h3>
            </div>
            <Badge variant="purple" size="sm">
              N=3, W=2, R=2
            </Badge>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Strict quorum guarantee (R + W &gt; N). Linearizable consistency for training checkpoints.
          </p>
        </div>

        {/* Safe Preset */}
        <div
          onClick={() => handlePresetSelect('Safe')}
          className={`glass-panel p-5 rounded-2xl border cursor-pointer transition-all ${
            consistencyConfig.preset === 'Safe'
              ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500/50'
              : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100">Safe (Strict Sync)</h3>
            </div>
            <Badge variant="healthy" size="sm">
              N=3, W=3, R=2
            </Badge>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            All replicas acknowledge writes synchronously. Zero tolerance for uncommitted partitions.
          </p>
        </div>
      </div>

      {/* Interactive Parameter Sliders & Formula Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sliders Box */}
        <GlassCard
          title="Quorum Dimension Controls"
          subtitle="Adjust individual replication and quorum values"
        >
          <div className="space-y-5">
            {/* N Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-slate-300 font-bold flex items-center gap-2">
                  <Server className="w-3.5 h-3.5 text-cyan-400" />
                  N: Total Physical Replicas
                </span>
                <span className="text-cyan-400 font-bold text-sm">{consistencyConfig.N} Replicas</span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                value={consistencyConfig.N}
                onChange={(e) => handleCustomChange('N', parseInt(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Number of storage nodes that store a copy of the object.
              </p>
            </div>

            {/* W Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-slate-300 font-bold flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-violet-400" />
                  W: Write Quorum Acknowledgements
                </span>
                <span className="text-violet-400 font-bold text-sm">{consistencyConfig.W} Nodes</span>
              </div>
              <input
                type="range"
                min="1"
                max={consistencyConfig.N}
                value={consistencyConfig.W}
                onChange={(e) => handleCustomChange('W', parseInt(e.target.value))}
                className="w-full accent-violet-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Number of replicas that must confirm write before returning 200 OK.
              </p>
            </div>

            {/* R Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-slate-300 font-bold flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  R: Read Quorum Sample Size
                </span>
                <span className="text-emerald-400 font-bold text-sm">{consistencyConfig.R} Nodes</span>
              </div>
              <input
                type="range"
                min="1"
                max={consistencyConfig.N}
                value={consistencyConfig.R}
                onChange={(e) => handleCustomChange('R', parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Number of replicas queried during a read request to resolve latest version.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Quorum Math & Safety Analysis Card */}
        <GlassCard
          title="Quorum Intersection & Trade-off Analysis"
          subtitle="Mathematical evaluation of partition safety"
          glow={analysis.isStrongConsistency ? 'emerald' : 'amber'}
        >
          <div className="space-y-4">
            {/* Mathematical Formula Banner */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">
                QUORUM INEQUALITY FORMULA
              </span>
              <div className="text-lg font-mono font-bold text-slate-100">
                {analysis.quorumFormula}
              </div>
              <div className="mt-2 flex items-center justify-center gap-2">
                <Badge
                  variant={analysis.isStrongConsistency ? 'healthy' : 'degraded'}
                  size="sm"
                >
                  {analysis.behavior}
                </Badge>
                <span className="text-xs text-slate-400 font-mono">
                  Speed: {analysis.speedRating}
                </span>
              </div>
            </div>

            {/* Explanation List */}
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <span className="text-slate-400 uppercase text-[10px] block">Read Safety</span>
                <p className="text-slate-200 mt-0.5">{analysis.readExplanation}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <span className="text-slate-400 uppercase text-[10px] block">Write Safety</span>
                <p className="text-slate-200 mt-0.5">{analysis.writeExplanation}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <span className="text-slate-400 uppercase text-[10px] block">Failure Availability</span>
                <p className="text-cyan-300 mt-0.5">{analysis.availabilityExplanation}</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Visual Replica Consensus Simulator */}
      <GlassCard
        title="Visual Quorum Intersection Simulator"
        subtitle="Simulated write replica subset and read query intersection"
      >
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="grid grid-cols-6 gap-3 text-center font-mono">
            {Array.from({ length: 6 }).map((_, idx) => {
              const nodeNum = idx + 1;
              const isReplica = nodeNum <= consistencyConfig.N;
              const isWriteTarget = nodeNum <= consistencyConfig.W;
              const isReadTarget = nodeNum <= consistencyConfig.R;

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border transition-all ${
                    isReplica
                      ? isWriteTarget && isReadTarget
                        ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300 ring-1 ring-emerald-500/40'
                        : isWriteTarget
                        ? 'border-violet-500 bg-violet-950/30 text-violet-300'
                        : isReadTarget
                        ? 'border-cyan-500 bg-cyan-950/30 text-cyan-300'
                        : 'border-slate-700 bg-slate-900 text-slate-300'
                      : 'border-slate-800/40 bg-slate-950/40 text-slate-600 opacity-40'
                  }`}
                >
                  <Server className="w-4 h-4 mx-auto mb-1.5" />
                  <p className="text-xs font-bold">Node 0{nodeNum}</p>
                  <div className="mt-2 space-y-1 text-[9px]">
                    {isReplica ? (
                      <>
                        <span className="block text-slate-400">Replica Slot</span>
                        {isWriteTarget && (
                          <span className="inline-block px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300">
                            W Ack
                          </span>
                        )}
                        {isReadTarget && (
                          <span className="inline-block px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                            R Read
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="block text-slate-600">Excluded</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-mono text-slate-400 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Guaranteed Overlap (Linearizable)
              </span>
              <span className="flex items-center gap-1.5 text-violet-400">
                <span className="w-2 h-2 rounded-full bg-violet-400" />
                Write Ack Set
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Read Query Set
              </span>
            </div>
            <span className="text-slate-500">Active Node Count: 6</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
