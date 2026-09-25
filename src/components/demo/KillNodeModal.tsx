import React, { useState } from 'react';
import { useCluster } from '../../store/ClusterContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { AlertTriangle, Server, ShieldAlert, Zap } from 'lucide-react';
import { Badge } from '../common/Badge';

interface KillNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultNodeId?: string;
}

export const KillNodeModal: React.FC<KillNodeModalProps> = ({
  isOpen,
  onClose,
  defaultNodeId = 'vault-node-03',
}) => {
  const { nodes, objects, killNode } = useCluster();
  const [selectedNodeId, setSelectedNodeId] = useState<string>(defaultNodeId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const affectedObjects = objects.filter((o) => o.replicaNodes.includes(selectedNodeId));

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await killNode(selectedNodeId);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-rose-400">
          <AlertTriangle className="w-5 h-5" />
          <span>Simulate Node Failure (Kill Node)</span>
        </div>
      }
      description="Inject a sudden node heartbeat failure to test AnchorNode's self-healing replication engine."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            isLoading={isSubmitting}
            leftIcon={<ShieldAlert className="w-4 h-4" />}
          >
            Kill {selectedNodeId}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Node Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Select Target Node to Terminate
          </label>
          <div className="grid grid-cols-2 gap-2">
            {nodes.map((node) => (
              <button
                key={node.id}
                type="button"
                onClick={() => setSelectedNodeId(node.id)}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  selectedNodeId === node.id
                    ? 'border-rose-500 bg-rose-500/10 text-rose-200'
                    : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs font-mono font-bold">{node.name}</p>
                    <p className="text-[10px] text-slate-400">{node.region.split(' ')[0]}</p>
                  </div>
                </div>
                <Badge
                  variant={node.status === 'healthy' ? 'healthy' : 'offline'}
                  size="sm"
                >
                  {node.status}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        {/* Failure Impact Simulation Preview */}
        {selectedNode && (
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-semibold">Simulated Impact on Cluster:</span>
              <Badge variant="degraded" size="sm">
                Cluster Degraded
              </Badge>
            </div>
            <ul className="space-y-1 text-slate-400 font-mono text-[11px]">
              <li className="flex items-center gap-1.5 text-rose-400">
                • {selectedNode.name} will drop off gossip ring immediately.
              </li>
              <li className="flex items-center gap-1.5 text-amber-400">
                • {affectedObjects.length} storage objects will become Under-replicated (2/3 replicas).
              </li>
              <li className="flex items-center gap-1.5 text-emerald-400">
                • Automated Self-Healing engine will elect a healthy replica and rebuild data.
              </li>
            </ul>
          </div>
        )}

        {/* Demo Mode Badge */}
        <div className="p-2.5 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center gap-2 text-violet-300 text-xs">
          <Zap className="w-4 h-4 shrink-0" />
          <span>Demo Mode: You can safely simulate failure and watch live auto-healing.</span>
        </div>
      </div>
    </Modal>
  );
};
