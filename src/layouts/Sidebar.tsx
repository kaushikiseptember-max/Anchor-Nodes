import React from "react";
import { useCluster } from "../store/ClusterContext";
import { useAuth } from "../store/AuthContext";
import {
  LayoutDashboard,
  Database,
  Server,
  RefreshCw,
  GitFork,
  Cloud,
  ListOrdered,
  LogOut,
  Sliders,
} from "lucide-react";

export type NavPage =
  | "overview"
  | "storage"
  | "nodes"
  | "repairs"
  | "consistency"
  | "hybrid-cloud"
  | "activity";

interface SidebarProps {
  currentPage: NavPage;
  onPageChange: (page: NavPage) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const { clusterHealth, isLiveMode, toggleLiveMode, activeRepairs } = useCluster();
  const { user, logout } = useAuth();

  const navItems: { id: NavPage; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "storage", label: "Storage", icon: <Database className="w-4 h-4" /> },
    { id: "nodes", label: "Nodes", icon: <Server className="w-4 h-4" />, badge: "6" },
    {
      id: "repairs",
      label: "Repairs",
      icon: <RefreshCw className={`w-4 h-4 ${activeRepairs.length > 0 ? "animate-spin text-amber-400" : ""}`} />,
      badge: activeRepairs.length > 0 ? `${activeRepairs.length}` : undefined,
    },
    { id: "consistency", label: "Consistency", icon: <GitFork className="w-4 h-4" /> },
    { id: "hybrid-cloud", label: "Hybrid Cloud", icon: <Cloud className="w-4 h-4" /> },
    { id: "activity", label: "Activity Log", icon: <ListOrdered className="w-4 h-4" /> },
  ];

  const getInitials = (name?: string) => {
    if (!name) return "OP";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <aside className="w-64 h-screen bg-[#070B14] border-r border-slate-800/80 flex flex-col justify-between select-none fixed left-0 top-0 z-40">
      {/* Brand Header */}
      <div>
        <div className="p-5 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center shrink-0 overflow-hidden">
            <img
              src="/anchornode-logo.png"
              alt="AnchorNode Logo"
              className="w-full h-full object-cover rounded-[10px]"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-slate-100 tracking-tight flex items-center gap-1.5">
              AnchorNode
              <span className="text-[10px] font-mono font-normal uppercase px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                v2.4
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-sans tracking-wide">
              Self-healing AI storage
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-violet-600/20 to-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/30 shadow-md shadow-cyan-950/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? "text-cyan-400" : "text-slate-400"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      item.id === "repairs" && activeRepairs.length > 0
                        ? "bg-amber-500 text-slate-950 font-bold animate-pulse"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status & Footer Area */}
      <div className="p-4 space-y-3 border-t border-slate-800/80 bg-slate-950/40">
        {/* Cluster Operational Status Indicator */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              Cluster State
            </span>
            <span className="flex items-center gap-1.5 text-xs font-mono font-semibold">
              <span
                className={`w-2 h-2 rounded-full ${
                  clusterHealth.status === "Healthy"
                    ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                    : clusterHealth.status === "Repairing"
                    ? "bg-amber-400 animate-pulse"
                    : "bg-rose-500 animate-ping-slow"
                }`}
              />
              <span
                className={
                  clusterHealth.status === "Healthy"
                    ? "text-emerald-400"
                    : clusterHealth.status === "Repairing"
                    ? "text-amber-400"
                    : "text-rose-400"
                }
              >
                {clusterHealth.status}
              </span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            {clusterHealth.status === "Healthy"
              ? "All systems operational"
              : clusterHealth.message}
          </p>
        </div>

        {/* Demo Mode / Live Mode Switch */}
        <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs">
          <span className="text-slate-400 text-[11px] font-mono">Demo Mode</span>
          <button
            onClick={toggleLiveMode}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              !isLiveMode ? "bg-cyan-600" : "bg-slate-700"
            }`}
            title="Toggle between Simulated Demo Mode and Live API Connection"
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                !isLiveMode ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* User Profile Bar */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm shadow-cyan-500/20">
              {getInitials(user?.name)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">{user?.name || "Cluster Operator"}</p>
              <p className="text-[10px] text-slate-400 font-mono truncate">{user?.email || "operator@anchornode.internal"}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            title="Log out"
            className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
