import React, { useState } from 'react';
import { useCluster } from '../../store/ClusterContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { FileWarning, Database, Server, Zap } from 'lucide-react';
import { Badge } from '../common/Badge';

interface CorruptDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultObjectId?: string;
  defaultNodeId?: string;
}

export const CorruptDataModal: React.FC<CorruptDataModalProps> = ({
  isOpen,
  onClose,
  defaultObjectId,
  defaultNodeId,
}) => {
  const { objects, corruptObject } = useCluster();
  const [selectedObjectId, setSelectedObjectId] = useState<string>(
    defaultObjectId || objects[0]?.id || 'obj-001'
  );
  const selectedObject = objects.find((o) => o.id === selectedObjectId) || objects[0];
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    defaultNodeId || selectedObject?.replicaNodes[0] || 'vault-node-01'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await corruptObject(selectedObjectId, selectedNodeId);
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
        <div className="flex items-center gap-2 text-amber-400">
          <FileWarning className="w-5 h-5" />
          <span>Simulate Data Corruption (Bit-Rot)</span>
        </div>
      }
      description="Inject silent disk corruption into an AI artifact replica to verify SHA-256 scrub detection and self-healing."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            isLoading={isSubmitting}
            leftIcon={<FileWarning className="w-4 h-4" />}
          >
            Corrupt Replica on {selectedNodeId}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Object Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            1. Select Target AI Artifact
          </label>
          <select
            value={selectedObjectId}
            onChange={(e) => {
              const newId = e.target.value;
              setSelectedObjectId(newId);
              const obj = objects.find((o) => o.id === newId);
              if (obj && obj.replicaNodes.length > 0) {
                setSelectedNodeId(obj.replicaNodes[0]);
              }
            }}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
          >
            {objects.map((obj) => (
              <option key={obj.id} value={obj.id}>
                {obj.name} ({obj.sizeFormatted} • {obj.type})
              </option>
            ))}
          </select>
        </div>

        {/* Replica Node Selector */}
        {selectedObject && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              2. Select Replica Location to Corrupt
            </label>
            <div className="grid grid-cols-3 gap-2">
              {selectedObject.replicaNodes.map((nid) => (
                <button
                  key={nid}
                  type="button"
                  onClick={() => setSelectedNodeId(nid)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedNodeId === nid
                      ? 'border-amber-500 bg-amber-500/10 text-amber-200'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Server className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-mono font-bold">{nid}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400">Authorized Replica</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Checksum & Healing Preview */}
        {selectedObject && (
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold">Integrity Verification Flow:</span>
              <Badge variant="repairing" size="sm">
                Bit-Rot Recovery
              </Badge>
            </div>
            <div className="font-mono text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center justify-between">
                <span>Valid Checksum:</span>
                <span className="text-emerald-400 font-mono">{selectedObject.checksum.slice(0, 16)}...</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Injected Bit-Flip:</span>
                <span className="text-rose-400 font-mono">b8f93e4b107c... (Mismatch)</span>
              </div>
              <p className="text-cyan-400 pt-1">
                → Scrubber detects SHA-256 mismatch and automatically streams clean chunk from other healthy replica nodes.
              </p>
            </div>
          </div>
        )}

        {/* Demo Notice */}
        <div className="p-2.5 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center gap-2 text-violet-300 text-xs">
          <Zap className="w-4 h-4 shrink-0" />
          <span>Demo Mode: Simulating cryptographic bit-rot repair pipeline.</span>
        </div>
      </div>
    </Modal>
  );
};
