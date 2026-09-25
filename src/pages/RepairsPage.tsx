import React from 'react';
import { useCluster } from '../store/ClusterContext';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { DemoControls } from '../components/demo/DemoControls';
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  ShieldCheck,
  Server,
  Zap,
  ArrowRight,
  Database,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';
import { RepairPhase } from '../types';

export const RepairsPage: React.FC = () => {
  const {
    activeRepairs,
    completedRepairs,
    pauseRepair,
    resumeRepair,
    killNode,
  } = useCluster();

  const phases: RepairPhase[] = [
    'Detecting failure',
    'Selecting healthy replica',
    'Streaming data',
    'Verifying checksum',
    'Finalizing replica',
    'Marking node synchronized',
  ];

  const getPhaseIndex = (phase: RepairPhase) => {
    return phases.indexOf(phase);
  };

  return (
    <div className="space-y-6">
      {/* Top Demo Quick Bar */}
      <DemoControls compact />

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2.5">
            <RefreshCw
              className={`w-6 h-6 text-amber-400 ${activeRepairs.length > 0 ? 'animate-spin' : ''}`}
            />
            Self-Healing Engine & Automated Reconstruction
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous peer-to-peer data replication, bit-rot self-repair, and cryptographic SHA-256 validation pipeline.
          </p>
        </div>

        {/* Global Stats Pill */}
        <div className="flex items-center gap-3 text-xs font-mono bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-800">
          <span className="text-slate-400">Success Rate:</span>
          <span className="text-emerald-400 font-bold">100% (42/42 jobs)</span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400 font-bold">Avg 12.4s</span>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="glass-panel p-4 rounded-xl border border-slate-800/80">
          <span className="text-xs text-slate-400">Active Repairs</span>
          <p className="text-xl font-display font-bold text-amber-400 mt-1">
            {activeRepairs.length}
          </p>
          <span className="text-[10px] text-slate-500 font-mono">In-flight streams</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800/80">
          <span className="text-xs text-slate-400">Completed Repairs</span>
          <p className="text-xl font-display font-bold text-emerald-400 mt-1">
            {completedRepairs.length + 14}
          </p>
          <span className="text-[10px] text-emerald-500 font-mono">100% verified</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800/80">
          <span className="text-xs text-slate-400">Failed Repairs</span>
          <p className="text-xl font-display font-bold text-slate-400 mt-1">0</p>
          <span className="text-[10px] text-slate-500 font-mono">Zero data loss</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800/80">
          <span className="text-xs text-slate-400">Avg Repair Time</span>
          <p className="text-xl font-display font-bold text-cyan-400 mt-1">12.4 s</p>
          <span className="text-[10px] text-cyan-500 font-mono">P90 recovery</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800/80">
          <span className="text-xs text-slate-400">Total Repaired Data</span>
          <p className="text-xl font-display font-bold text-violet-400 mt-1">4.8 TB</p>
          <span className="text-[10px] text-violet-400 font-mono">Over past 30 days</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800/80">
          <span className="text-xs text-slate-400">Repair Throughput</span>
          <p className="text-xl font-display font-bold text-teal-400 mt-1">
            {activeRepairs.length > 0 ? `${activeRepairs[0].currentThroughputMBps} MB/s` : 'Idle'}
          </p>
          <span className="text-[10px] text-teal-400 font-mono">Direct NVMe stream</span>
        </div>
      </div>

      {/* Active Self-Healing Jobs */}
      {activeRepairs.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
            Active Self-Healing Jobs ({activeRepairs.length})
          </h3>

          {activeRepairs.map((job) => {
            const currentPhaseIdx = getPhaseIndex(job.phase);

            return (
              <GlassCard
                key={job.id}
                glow="amber"
                className="p-6 border-amber-500/40"
              >
                {/* Job Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 animate-pulse">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-mono font-bold text-slate-100">
                          {job.objectName}
                        </h4>
                        <Badge variant="repairing" size="sm">
                          {job.phase}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{job.triggerReason}</p>
                    </div>
                  </div>

                  {/* Pause / Resume button */}
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        job.status === 'paused' ? resumeRepair(job.id) : pauseRepair(job.id)
                      }
                      leftIcon={
                        job.status === 'paused' ? (
                          <Play className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Pause className="w-3.5 h-3.5 text-amber-400" />
                        )
                      }
                    >
                      {job.status === 'paused' ? 'Resume Streaming' : 'Pause Job'}
                    </Button>
                  </div>
                </div>

                {/* Node Source -> Target Route */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-5 items-center">
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                      <Server className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">
                        Authoritative Source
                      </span>
                      <p className="text-xs font-mono font-bold text-emerald-300">{job.sourceNode}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-mono font-bold text-amber-300">
                      {job.currentThroughputMBps} MB/s
                    </span>
                    <div className="w-full flex items-center justify-center gap-1 my-1 text-amber-400">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping-slow" />
                      <ArrowRight className="w-6 h-6 animate-pulse" />
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping-slow" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      Estimated {job.estimatedSecondsRemaining}s left
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/30 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                      <Server className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">
                        Target Node (Rebuilding)
                      </span>
                      <p className="text-xs font-mono font-bold text-amber-300">{job.targetNode}</p>
                    </div>
                  </div>
                </div>

                {/* 6-Phase Pipeline Stepper */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>RECONSTRUCTION PIPELINE</span>
                    <span className="text-amber-400 font-bold">{job.progressPercent}% Complete</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-amber-500 via-cyan-400 to-emerald-400 h-full transition-all duration-300"
                      style={{ width: `${job.progressPercent}%` }}
                    />
                  </div>

                  {/* Phase Steps */}
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-2 pt-3">
                    {phases.map((phaseName, idx) => {
                      const isDone = idx < currentPhaseIdx;
                      const isCurrent = idx === currentPhaseIdx;

                      return (
                        <div
                          key={phaseName}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            isDone
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                              : isCurrent
                              ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-1 ring-amber-400/50 animate-pulse-subtle'
                              : 'bg-slate-900/40 border-slate-800 text-slate-500'
                          }`}
                        >
                          <div className="flex items-center justify-center mb-1">
                            {isDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : isCurrent ? (
                              <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full border border-slate-600 text-[9px] font-mono flex items-center justify-center">
                                {idx + 1}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-mono leading-tight">{phaseName}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        /* Empty State: All Repaired & Synchronized */
        <GlassCard className="p-8 text-center border-emerald-500/30 glass-card-glow-emerald">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-display font-bold text-slate-100">
            All Storage Replicas Synchronized
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1.5 leading-relaxed">
            Zero active repair jobs in queue. Every storage object has 3 synchronized physical replicas with valid SHA-256 hashes.
          </p>
          <div className="mt-5">
            <Button
              variant="primary"
              size="sm"
              onClick={() => killNode('vault-node-03')}
              leftIcon={<Sparkles className="w-4 h-4 text-amber-300" />}
            >
              Simulate Node Failure to Watch Live Self-Healing
            </Button>
          </div>
        </GlassCard>
      )}

      {/* Completed Repairs History */}
      <GlassCard
        title="Completed Self-Healing History"
        subtitle="Cryptographically verified reconstruction logs"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
                <th className="p-3 font-semibold">Artifact</th>
                <th className="p-3 font-semibold">Source</th>
                <th className="p-3 font-semibold">Target</th>
                <th className="p-3 font-semibold">Data Size</th>
                <th className="p-3 font-semibold">Duration</th>
                <th className="p-3 font-semibold">Checksum</th>
                <th className="p-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3 font-bold text-slate-200">
                  llama-finetune/checkpoint-epoch-42
                </td>
                <td className="p-3 text-emerald-400">vault-node-01</td>
                <td className="p-3 text-cyan-400">vault-node-03</td>
                <td className="p-3 text-slate-300">1.8 TB</td>
                <td className="p-3 text-slate-400">14.8s</td>
                <td className="p-3 text-emerald-400">SHA-256 OK</td>
                <td className="p-3 text-right">
                  <Badge variant="healthy" size="sm">
                    SYNCHRONIZED
                  </Badge>
                </td>
              </tr>
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3 font-bold text-slate-200">
                  embeddings/customer-support-2026-09
                </td>
                <td className="p-3 text-emerald-400">vault-node-02</td>
                <td className="p-3 text-cyan-400">vault-node-06</td>
                <td className="p-3 text-slate-300">840 GB</td>
                <td className="p-3 text-slate-400">6.2s</td>
                <td className="p-3 text-emerald-400">SHA-256 OK</td>
                <td className="p-3 text-right">
                  <Badge variant="healthy" size="sm">
                    SYNCHRONIZED
                  </Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
