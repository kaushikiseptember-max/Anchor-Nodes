import React, { useState, useEffect, useRef } from "react";
import { useCluster } from "../store/ClusterContext";
import { useAuth } from "../store/AuthContext";
import { Button } from "../components/common/Button";
import {
  Search,
  Bell,
  Clock,
  ShieldCheck,
  Wifi,
  WifiOff,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";

export const Header: React.FC<{ onSearchClick: () => void }> = ({ onSearchClick }) => {
  const { isLiveMode, runHealthCheck, isHealthChecking, activeRepairs } = useCluster();
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await logout();
  };

  const getInitials = (name?: string) => {
    if (!name) return "OP";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-[#050811]/90 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between gap-4">
      {/* Left: Cluster Identification & Environment Badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-sm font-mono font-bold text-slate-100">anchornode-prod-cluster</span>
        </div>

        <span
          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-bold ${
            isLiveMode
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              : "bg-violet-500/20 text-violet-300 border-violet-500/40"
          }`}
        >
          {isLiveMode ? "LIVE API" : "DEMO"}
        </span>

        {/* Backend Connection Status Notice */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
          {isLiveMode ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300">Backend Connected (JWT Active)</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-300">Cluster Running in Simulated Demo Mode</span>
            </>
          )}
        </div>
      </div>

      {/* Right: Actions, Search, Clock, Health Sweep & User Menu */}
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
          <button
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100 transition-colors"
            title="Cluster Alerts"
          >
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
          <span>{currentTime || "Synchronizing UTC..."}</span>
        </div>

        {/* User Menu & Logout */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2.5 pl-2.5 pr-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-slate-200 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-[11px] font-bold text-white shadow-sm shadow-cyan-500/20">
              {getInitials(user?.name)}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-slate-100 leading-tight max-w-[120px] truncate">
                {user?.name || "Cluster Operator"}
              </p>
              <p className="text-[10px] font-mono text-slate-400 leading-tight">Operator</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#080D1A] border border-slate-800 shadow-2xl shadow-black/80 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-800/80">
                <p className="text-xs font-semibold text-slate-100 truncate">{user?.name || "Operator"}</p>
                <p className="text-[11px] font-mono text-slate-400 truncate">{user?.email || "operator@anchornode.internal"}</p>
              </div>

              <div className="p-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
