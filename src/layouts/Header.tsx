import React, { useState, useEffect } from 'react';
import { useCluster } from '../store/ClusterContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  Server,
  Activity,
  Search,
  Bell,
  Clock,
  ShieldCheck,
  AlertCircle,
  Wifi,
  WifiOff,
} from 'lucide-react';

export const Header: React.FC<{ onSearchClick: () => void }> = ({ onSearchClick }) => {
  const { clusterHealth, isLiveMode, runHealthCheck, isHealthChecking, activeRepairs } = useCluster();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-[#050811]/90 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between gap-4">
      {/* Left: Cluster Identification & Environment Badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-sm font-mono font-bold text-slate-100">anchornode-prod-demo</span>
        </div>

        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/40 font-bold">
          DEMO
        </span>

        {/* Backend Connection Status Notice */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
          <WifiOff className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-300">Backend disconnected — running in Demo Mode</span>
        </div>
      </div>

      {/* Right: Actions, Search, Clock & Health Sweep */}
      <div className="flex items-center gap-3">
        {/* Quick Search Button */}
        <button
          onClick={onSearchClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Search artifacts & nodes...</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">
            ⌘K
          </kbd>
        </button>

        {/* Run Health Check Sweep */}
        <Button
          variant="outline"
          size="sm"
          onClick={runHealthCheck}
          isLoading={isHealthChecking}
          leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
          className="hidden sm:inline-flex"
        >
          Health Scrub
        </Button>

        {/* Notifications Icon */}
        <div className="relative">
          <button className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100 transition-colors">
            <Bell className="w-4 h-4" />
          </button>
          {activeRepairs.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-[9px] font-mono font-bold text-slate-950 flex items-center justify-center animate-pulse">
              {activeRepairs.length}
            </span>
          )}
        </div>

        {/* Current Date & Time Display */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800/80">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{currentTime || 'Synchronizing UTC...'}</span>
        </div>
      </div>
    </header>
  );
};
