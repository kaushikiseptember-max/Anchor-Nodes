import React, { useState } from 'react';
import { useCluster } from '../../store/ClusterContext';
import { Button } from '../common/Button';
import { KillNodeModal } from './KillNodeModal';
import { CorruptDataModal } from './CorruptDataModal';
import {
  Skull,
  FileWarning,
  RotateCcw,
  Play,
  Pause,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

export const DemoControls: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const {
    activeRepairs,
    pauseRepair,
    resumeRepair,
    resetDemo,
    runHealthCheck,
    isHealthChecking,
    killNode,
  } = useCluster();

  const [isKillModalOpen, setIsKillModalOpen] = useState(false);
  const [isCorruptModalOpen, setIsCorruptModalOpen] = useState(false);
  const [isQuickDemoRunning, setIsQuickDemoRunning] = useState(false);

  const activeJob = activeRepairs[0];

  const handleQuickDemo = async () => {
    setIsQuickDemoRunning(true);
    try {
      await killNode('vault-node-03');
    } finally {
      setIsQuickDemoRunning(false);
    }
  };

  return (
    <>
      <div
        className={`glass-panel rounded-2xl border-violet-500/30 p-4 transition-all ${
          compact ? 'py-3 px-4' : 'p-4'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left Title & Status Indicator */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-600 text-white shadow-md shadow-violet-500/20">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  Live Self-Healing Demo Controls
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/40">
                  Interactive Simulator
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Trigger distributed node outages, checksum bit-flips, or run full cluster recovery.
              </p>
            </div>
          </div>

          {/* Action Buttons Group */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Demo 1-Click Trigger */}
            <Button
              variant="primary"
              size="sm"
              onClick={handleQuickDemo}
              isLoading={isQuickDemoRunning}
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-300" />}
              className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600"
            >
              1-Click Demo: Kill Node-03
            </Button>

            {/* Kill Node Modal Trigger */}
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsKillModalOpen(true)}
              leftIcon={<Skull className="w-3.5 h-3.5" />}
            >
              Kill Node
            </Button>

            {/* Corrupt Data Modal Trigger */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsCorruptModalOpen(true)}
              leftIcon={<FileWarning className="w-3.5 h-3.5 text-amber-400" />}
              className="hover:border-amber-500/50"
            >
              Corrupt Data
            </Button>

            {/* Active Repair Pause/Resume */}
            {activeJob && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  activeJob.status === 'paused'
                    ? resumeRepair(activeJob.id)
                    : pauseRepair(activeJob.id)
                }
                leftIcon={
                  activeJob.status === 'paused' ? (
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Pause className="w-3.5 h-3.5 text-amber-400" />
                  )
                }
              >
                {activeJob.status === 'paused' ? 'Resume Repair' : 'Pause Repair'}
              </Button>
            )}

            {/* Run Health Check */}
            <Button
              variant="outline"
              size="sm"
              onClick={runHealthCheck}
              isLoading={isHealthChecking}
              leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />}
            >
              Health Check
            </Button>

            {/* Reset Demo State */}
            <Button
              variant="secondary"
              size="sm"
              onClick={resetDemo}
              leftIcon={<RotateCcw className="w-3.5 h-3.5 text-slate-400" />}
              title="Reset all nodes and objects to synchronized baseline"
            >
              Reset Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <KillNodeModal isOpen={isKillModalOpen} onClose={() => setIsKillModalOpen(false)} />
      <CorruptDataModal isOpen={isCorruptModalOpen} onClose={() => setIsCorruptModalOpen(false)} />
    </>
  );
};
