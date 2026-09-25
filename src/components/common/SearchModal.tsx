import React, { useState, useEffect } from 'react';
import { useCluster } from '../../store/ClusterContext';
import { Modal } from './Modal';
import { Search, Database, Server, RefreshCw, ArrowRight } from 'lucide-react';
import { Badge } from './Badge';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: any) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const { objects, nodes, repairs, selectObject, selectNode } = useCluster();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  const filteredObjects = objects.filter((o) =>
    o.name.toLowerCase().includes(query.toLowerCase()) ||
    o.type.toLowerCase().includes(query.toLowerCase())
  );

  const filteredNodes = nodes.filter((n) =>
    n.name.toLowerCase().includes(query.toLowerCase()) ||
    n.region.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-cyan-400">
          <Search className="w-4 h-4" />
          <span>Quick Find Artifacts, Nodes & Telemetry</span>
        </div>
      }
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by checkpoint name, embeddings, node ID, or region..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Results */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {/* AI Storage Objects */}
          <div>
            <h4 className="text-[10px] font-mono uppercase text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Database className="w-3 h-3 text-cyan-400" />
              AI Storage Artifacts ({filteredObjects.length})
            </h4>
            <div className="space-y-1.5">
              {filteredObjects.slice(0, 5).map((obj) => (
                <div
                  key={obj.id}
                  onClick={() => {
                    selectObject(obj.id);
                    onClose();
                  }}
                  className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-mono text-slate-200 truncate font-medium">{obj.name}</p>
                    <span className="text-[10px] text-slate-400">{obj.type} • {obj.sizeFormatted}</span>
                  </div>
                  <Badge variant={obj.replicationStatus === 'Synchronized' ? 'healthy' : 'repairing'} size="sm">
                    {obj.replicationStatus}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Storage Nodes */}
          <div>
            <h4 className="text-[10px] font-mono uppercase text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Server className="w-3 h-3 text-violet-400" />
              Distributed Storage Nodes ({filteredNodes.length})
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              {filteredNodes.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    selectNode(n.id);
                    onClose();
                  }}
                  className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-violet-500/50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <p className="font-mono text-slate-200 font-bold">{n.name}</p>
                    <span className="text-[10px] text-slate-400">{n.region.split(' ')[0]}</span>
                  </div>
                  <Badge variant={n.status === 'healthy' ? 'healthy' : 'offline'} size="sm">
                    {n.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
