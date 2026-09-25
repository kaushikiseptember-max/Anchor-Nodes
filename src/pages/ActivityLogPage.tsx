import React, { useState } from 'react';
import { useCluster } from '../store/ClusterContext';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  ListOrdered,
  Search,
  Filter,
  Download,
  Server,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Clock,
  Trash2,
} from 'lucide-react';
import { formatTimeOnly, formatRelativeTime } from '../utils';
import { ActivityCategory } from '../types';

export const ActivityLogPage: React.FC = () => {
  const { activityLogs, selectNode, selectObject } = useCluster();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const categories: { label: string; value: string }[] = [
    { label: 'All Events', value: 'all' },
    { label: 'Node Events', value: 'Node' },
    { label: 'Replication', value: 'Replication' },
    { label: 'Repairs', value: 'Repairs' },
    { label: 'Checksum / Bit-rot', value: 'Checksum' },
    { label: 'User Actions', value: 'User Action' },
    { label: 'S3 Sync', value: 'S3 Sync' },
  ];

  const filteredLogs = activityLogs.filter((evt) => {
    const matchesSearch =
      evt.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.component.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.nodeId && evt.nodeId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (evt.objectName && evt.objectName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || evt.category === selectedCategory;
    const matchesSeverity = selectedSeverity === 'all' || evt.severity === selectedSeverity;

    return matchesSearch && matchesCategory && matchesSeverity;
  });

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'offline' as const;
      case 'warning':
        return 'degraded' as const;
      case 'success':
        return 'healthy' as const;
      default:
        return 'info' as const;
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activityLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `anchornode-audit-log-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2.5">
            <ListOrdered className="w-6 h-6 text-violet-400" />
            Cluster Audit & Telemetry Activity Log
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Chronological ledger of gossip health states, quorum replication passes, and self-healing events.
          </p>
        </div>

        {/* Export Log Action */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportJSON}
          leftIcon={<Download className="w-3.5 h-3.5 text-cyan-400" />}
        >
          Export Audit Log (JSON)
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-slate-800">
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search event logs, nodes, or components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Severity Filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Severities</option>
            <option value="success">Success</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Activity Log Table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
                <th className="p-4 font-semibold">Timestamp</th>
                <th className="p-4 font-semibold">Severity</th>
                <th className="p-4 font-semibold">Event Message</th>
                <th className="p-4 font-semibold">Component</th>
                <th className="p-4 font-semibold">Node</th>
                <th className="p-4 font-semibold">Related Artifact</th>
                <th className="p-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLogs.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-800/40 transition-colors">
                  {/* Timestamp */}
                  <td className="p-4 text-slate-400 whitespace-nowrap">
                    <span className="text-slate-200 font-semibold">{formatTimeOnly(evt.timestamp)}</span>
                    <span className="text-[10px] text-slate-500 block">{formatRelativeTime(evt.timestamp)}</span>
                  </td>

                  {/* Severity */}
                  <td className="p-4">
                    <Badge variant={getSeverityBadgeVariant(evt.severity)} size="sm">
                      {evt.severity.toUpperCase()}
                    </Badge>
                  </td>

                  {/* Event Text */}
                  <td className="p-4 font-sans text-slate-200 font-medium max-w-md">
                    {evt.event}
                  </td>

                  {/* Component */}
                  <td className="p-4 text-cyan-300 font-semibold">{evt.component}</td>

                  {/* Node */}
                  <td className="p-4">
                    {evt.nodeId ? (
                      <button
                        onClick={() => selectNode(evt.nodeId!)}
                        className="text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <Server className="w-3 h-3" />
                        {evt.nodeId}
                      </button>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>

                  {/* Object */}
                  <td className="p-4">
                    {evt.objectName ? (
                      <span className="text-violet-300 truncate max-w-xs block">
                        {evt.objectName}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="p-4 text-right">
                    <span className="text-slate-300">{evt.status}</span>
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
