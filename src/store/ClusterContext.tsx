import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  StorageNode,
  StorageObject,
  RepairJob,
  RepairJobStatus,
  ActivityEvent,
  ClusterHealth,
  ConsistencyConfig,
  MetricDataPoint,
  ToastNotification,
  RepairPhase,
} from '../types';
import {
  initialNodes,
  initialObjects,
  initialClusterHealth,
  initialConsistencyConfig,
  initialActivityEvents,
  initialMetricTimeSeries,
} from '../mock';
import { api } from '../services/api';
import { eventStream } from '../services/eventStream';
import { generateSha256 } from '../utils';

interface ClusterContextType {
  // State
  nodes: StorageNode[];
  objects: StorageObject[];
  repairs: RepairJob[];
  activeRepairs: RepairJob[];
  completedRepairs: RepairJob[];
  activityLogs: ActivityEvent[];
  clusterHealth: ClusterHealth;
  consistencyConfig: ConsistencyConfig;
  metricTimeSeries: MetricDataPoint[];
  isLiveMode: boolean;
  selectedNode: StorageNode | null;
  selectedObject: StorageObject | null;
  toasts: ToastNotification[];
  isHealthChecking: boolean;
  activeDataTransferLink: { source: string; target: string; objectName: string } | null;

  // Actions
  toggleLiveMode: () => void;
  selectNode: (nodeId: string | null) => void;
  selectObject: (objectId: string | null) => void;
  killNode: (nodeId: string) => Promise<void>;
  corruptObject: (objectId: string, nodeId: string) => Promise<void>;
  restartNode: (nodeId: string) => void;
  markNodeHealthy: (nodeId: string) => void;
  pauseRepair: (repairId: string) => Promise<void>;
  resumeRepair: (repairId: string) => Promise<void>;
  resetDemo: () => Promise<void>;
  updateConsistency: (config: ConsistencyConfig) => Promise<void>;
  runHealthCheck: () => Promise<void>;
  archiveObjectToS3: (objectId: string) => Promise<void>;
  restoreObjectFromS3: (objectId: string) => Promise<void>;
  addToast: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
}

const ClusterContext = createContext<ClusterContextType | undefined>(undefined);

export const ClusterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [nodes, setNodes] = useState<StorageNode[]>(initialNodes);
  const [objects, setObjects] = useState<StorageObject[]>(initialObjects);
  const [repairs, setRepairs] = useState<RepairJob[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityEvent[]>(initialActivityEvents);
  const [clusterHealth, setClusterHealth] = useState<ClusterHealth>(initialClusterHealth);
  const [consistencyConfig, setConsistencyConfig] = useState<ConsistencyConfig>(initialConsistencyConfig);
  const [metricTimeSeries, setMetricTimeSeries] = useState<MetricDataPoint[]>(initialMetricTimeSeries);
  const [isLiveMode, setIsLiveMode] = useState<boolean>(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isHealthChecking, setIsHealthChecking] = useState<boolean>(false);
  const [activeDataTransferLink, setActiveDataTransferLink] = useState<{
    source: string;
    target: string;
    objectName: string;
  } | null>(null);

  const repairTimerRef = useRef<number | null>(null);

  // Helper: Toast Notifications
  const addToast = useCallback((title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, message, type, timestamp: Date.now() }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Helper: Add Activity Event
  const logActivity = useCallback((
    eventText: string,
    category: ActivityEvent['category'],
    severity: ActivityEvent['severity'],
    component: string,
    extra?: { nodeId?: string; objectId?: string; objectName?: string; status?: string; progress?: number }
  ) => {
    const newEvent: ActivityEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      event: eventText,
      category,
      severity,
      component,
      status: extra?.status || (severity === 'critical' ? 'Failed' : severity === 'warning' ? 'Degraded' : 'Active'),
      nodeId: extra?.nodeId,
      objectId: extra?.objectId,
      objectName: extra?.objectName,
      progress: extra?.progress,
    };
    setActivityLogs((prev) => [newEvent, ...prev.slice(0, 99)]);
    eventStream.broadcastActivity(newEvent);
  }, []);

  // Recompute Cluster Health summary whenever nodes or repairs change
  const recalculateHealth = useCallback((
    currentNodes: StorageNode[],
    currentRepairs: RepairJob[],
    currentObjects: StorageObject[]
  ) => {
    const totalNodes = currentNodes.length;
    const offlineNodes = currentNodes.filter((n) => n.status === 'offline');
    const degradedNodes = currentNodes.filter((n) => n.status === 'degraded' || n.status === 'corrupted');
    const repairingNodes = currentNodes.filter((n) => n.status === 'repairing');
    const healthyNodes = currentNodes.filter((n) => n.status === 'healthy');

    const activeRep = currentRepairs.filter((r) => r.status === 'active' || r.status === 'paused');
    const corruptedObjs = currentObjects.filter((o) => o.replicationStatus === 'Corrupted replica');
    const underReplicatedObjs = currentObjects.filter((o) => o.replicationStatus === 'Under-replicated');

    let status: ClusterHealth['status'] = 'Healthy';
    let message = 'All replicas are synchronized and quorum verified across 6 nodes.';

    if (offlineNodes.length > 0 || degradedNodes.length > 0 || corruptedObjs.length > 0) {
      if (offlineNodes.length >= 2 || corruptedObjs.length >= 3) {
        status = 'Critical';
        message = `Critical: ${offlineNodes.length} nodes offline. Quorum tolerance limits approaching!`;
      } else if (activeRep.length > 0) {
        status = 'Repairing';
        message = `Self-healing active: Rebuilding replica on healthy nodes (${activeRep.length} active jobs).`;
      } else {
        status = 'Degraded';
        message = `Degraded: ${offlineNodes.length || degradedNodes.length} node(s) compromised. ${underReplicatedObjs.length + corruptedObjs.length} objects affected.`;
      }
    } else if (repairingNodes.length > 0 || activeRep.length > 0) {
      status = 'Repairing';
      message = `Repair in progress: Synchronizing block streams and verifying hashes.`;
    }

    setClusterHealth((prev) => ({
      ...prev,
      status,
      message,
      healthyNodeCount: healthyNodes.length,
      degradedNodeCount: degradedNodes.length + repairingNodes.length,
      offlineNodeCount: offlineNodes.length,
      activeRepairCount: activeRep.length,
      repairThroughputGBps: activeRep.length > 0 ? 1.8 : 0.0,
      lastHealthCheck: new Date().toISOString(),
    }));
  }, []);

  // Self-Healing Automation Tick (Progresses active repairs through the 6 phases)
  useEffect(() => {
    const interval = window.setInterval(() => {
      setRepairs((prevRepairs) => {
        let hasChanges = false;
        const updated = prevRepairs.map((job) => {
          if (job.status !== 'active') return job;

          hasChanges = true;
          const nextProgress = Math.min(100, job.progressPercent + 12);
          let nextPhase: RepairPhase = job.phase;
          let checksumStatus = job.checksumStatus;
          let jobStatus: RepairJobStatus = job.status;

          if (nextProgress < 20) {
            nextPhase = 'Detecting failure';
          } else if (nextProgress < 40) {
            nextPhase = 'Selecting healthy replica';
          } else if (nextProgress < 75) {
            nextPhase = 'Streaming data';
          } else if (nextProgress < 90) {
            nextPhase = 'Verifying checksum';
            checksumStatus = 'Verifying';
          } else if (nextProgress < 100) {
            nextPhase = 'Finalizing replica';
            checksumStatus = 'Verified';
          } else {
            nextPhase = 'Marking node synchronized';
            checksumStatus = 'Verified';
            jobStatus = 'completed';
          }

          const secondsLeft = Math.max(0, Math.ceil((100 - nextProgress) / 5));

          return {
            ...job,
            progressPercent: nextProgress,
            phase: nextPhase,
            checksumStatus,
            status: jobStatus,
            estimatedSecondsRemaining: secondsLeft,
            completedAt: nextProgress >= 100 ? new Date().toISOString() : undefined,
          };
        });

        // When a job completes, heal the target node and affected object
        if (hasChanges) {
          updated.forEach((job) => {
            if (job.status === 'completed' && job.progressPercent === 100) {
              // Check if it was just completed
              const wasActive = prevRepairs.find((r) => r.id === job.id && r.status === 'active');
              if (wasActive) {
                // Restore Node
                setNodes((currentNodes) => {
                  const healed = currentNodes.map((n) =>
                    n.id === job.targetNode
                      ? {
                          ...n,
                          status: 'healthy' as const,
                          currentOperation: 'Synchronized / Quorum Ready',
                          cpuUsagePercent: 24,
                          memoryUsagePercent: 44,
                          lastHeartbeat: new Date().toISOString(),
                        }
                      : n
                  );
                  return healed;
                });

                // Restore Object
                setObjects((currentObjs) =>
                  currentObjs.map((o) =>
                    o.id === job.objectId
                      ? {
                          ...o,
                          replicationStatus: 'Synchronized',
                          checksumStatus: 'Valid',
                          corruptedNodeId: undefined,
                          lastModified: new Date().toISOString(),
                        }
                      : o
                  )
                );

                // Stop active data link
                setActiveDataTransferLink(null);

                // Log final recovery events
                logActivity(
                  `SHA-256 verified successfully for ${job.objectName}`,
                  'Checksum',
                  'success',
                  'IntegrityVerifier',
                  { objectName: job.objectName, status: 'Verified' }
                );
                logActivity(
                  `${job.targetNode} is fully synchronized. All 3x replicas healthy.`,
                  'Repairs',
                  'success',
                  'SelfHealingEngine',
                  { nodeId: job.targetNode, objectName: job.objectName, status: 'Synchronized' }
                );

                addToast(
                  'Self-Healing Complete',
                  `${job.objectName} is synchronized on ${job.targetNode}. Cluster health restored to 100%.`,
                  'success'
                );
              }
            }
          });
        }

        return updated;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [logActivity, addToast]);

  // Keep cluster health state in sync whenever nodes, repairs, or objects change
  useEffect(() => {
    recalculateHealth(nodes, repairs, objects);
  }, [nodes, repairs, objects, recalculateHealth]);

  // Handle Mode Toggle (Demo vs Live)
  const toggleLiveMode = useCallback(() => {
    if (!isLiveMode) {
      // User wants to switch to Live Mode
      setIsLiveMode(true);
      api.setLiveModeAvailable(false); // No backend running currently
      addToast(
        'Backend Disconnected',
        'Live backend service not detected at /api. Continuing in Demo Mode with simulated storage telemetry.',
        'warning'
      );
    } else {
      setIsLiveMode(false);
      addToast('Demo Mode Active', 'Now operating with simulated self-healing state machine.', 'info');
    }
  }, [isLiveMode, addToast]);

  // Kill Node Flow
  const killNode = useCallback(
    async (nodeId: string) => {
      const targetNode = nodes.find((n) => n.id === nodeId);
      if (!targetNode) return;

      // 1. Mark Node Offline
      const updatedNodes = nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              status: 'offline' as const,
              currentOperation: 'Connection Terminated / Heartbeat Lost',
              cpuUsagePercent: 0,
              memoryUsagePercent: 0,
              diskUsagePercent: 0,
            }
          : n
      );
      setNodes(updatedNodes);

      // 2. Mark affected objects Under-replicated
      const affectedObjects = objects.filter((o) => o.replicaNodes.includes(nodeId));
      const targetObj = affectedObjects[0] || objects[0];

      setObjects((prev) =>
        prev.map((o) =>
          o.replicaNodes.includes(nodeId)
            ? { ...o, replicationStatus: 'Under-replicated' }
            : o
        )
      );

      // 3. Find a healthy source node
      const healthySource =
        targetObj.replicaNodes.find((nid) => nid !== nodeId && nodes.find((n) => n.id === nid)?.status === 'healthy') ||
        'vault-node-01';

      // 4. Log degradation events
      logActivity(`${nodeId} heartbeat lost (gossip timeout > 1500ms)`, 'Node', 'critical', 'ClusterGossip', {
        nodeId,
        status: 'Offline',
      });
      logActivity(
        `Cluster status transitioned to Degraded (5/6 nodes online)`,
        'Replication',
        'warning',
        'QuorumCoordinator',
        { status: 'Degraded' }
      );
      logActivity(
        `Healthy replica selected from ${healthySource} for ${targetObj.name}`,
        'Repairs',
        'info',
        'SelfHealingEngine',
        { nodeId: healthySource, objectName: targetObj.name }
      );

      // 5. Create Repair Job
      const newRepairId = `rep-${Date.now()}`;
      const newRepairJob: RepairJob = {
        id: newRepairId,
        objectId: targetObj.id,
        objectName: targetObj.name,
        sourceNode: healthySource,
        targetNode: nodeId,
        dataSizeBytes: targetObj.sizeBytes,
        dataSizeFormatted: targetObj.sizeFormatted,
        progressPercent: 0,
        currentThroughputMBps: 1840,
        estimatedSecondsRemaining: 15,
        checksumStatus: 'Pending',
        startTime: new Date().toISOString(),
        phase: 'Detecting failure',
        status: 'active',
        triggerReason: `Node ${nodeId} heartbeat loss triggered automated self-healing replica rebuild.`,
      };

      setRepairs((prev) => [newRepairJob, ...prev]);

      // 6. Set animated data transfer link for visual cluster map
      setActiveDataTransferLink({
        source: healthySource,
        target: nodeId,
        objectName: targetObj.name,
      });

      // 7. Update node to 'repairing'
      setTimeout(() => {
        setNodes((prev) =>
          prev.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  status: 'repairing' as const,
                  currentOperation: `Self-Healing: Rebuilding replica from ${healthySource}`,
                  cpuUsagePercent: 68,
                  memoryUsagePercent: 72,
                }
              : n
          )
        );
      }, 1200);

      addToast(
        'Node Failure Injected',
        `${nodeId} is offline. Self-healing triggered from ${healthySource}.`,
        'warning'
      );
    },
    [nodes, objects, logActivity, addToast]
  );

  // Corrupt Data Flow
  const corruptObject = useCallback(
    async (objectId: string, nodeId: string) => {
      const targetObj = objects.find((o) => o.id === objectId);
      if (!targetObj) return;

      // 1. Mark object replica corrupted and checksum mismatch
      const corruptedChecksum = generateSha256('corrupted-data-bit-flip');
      setObjects((prev) =>
        prev.map((o) =>
          o.id === objectId
            ? {
                ...o,
                replicationStatus: 'Corrupted replica',
                corruptedNodeId: nodeId,
                checksumStatus: 'Mismatch',
              }
            : o
        )
      );

      // 2. Mark node as degraded
      setNodes((prev) =>
        prev.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                status: 'corrupted' as const,
                currentOperation: `Checksum mismatch detected on ${targetObj.name}`,
              }
            : n
        )
      );

      // 3. Select healthy source
      const healthySource =
        targetObj.replicaNodes.find((nid) => nid !== nodeId) || 'vault-node-01';

      // 4. Log events
      logActivity(
        `Checksum mismatch detected on ${nodeId} for ${targetObj.name}. Expected: ${targetObj.checksum.slice(0, 12)}..., Found: ${corruptedChecksum.slice(0, 12)}...`,
        'Checksum',
        'critical',
        'IntegrityScrubber',
        { nodeId, objectId, objectName: targetObj.name, status: 'Corrupted' }
      );
      logActivity(
        `Self-healing initiated: repairing bit-rot on ${nodeId} from authoritative replica ${healthySource}`,
        'Repairs',
        'info',
        'SelfHealingEngine',
        { nodeId, objectName: targetObj.name }
      );

      // 5. Create active repair job
      const newRepairId = `rep-corrupt-${Date.now()}`;
      const newRepairJob: RepairJob = {
        id: newRepairId,
        objectId: targetObj.id,
        objectName: targetObj.name,
        sourceNode: healthySource,
        targetNode: nodeId,
        dataSizeBytes: targetObj.sizeBytes,
        dataSizeFormatted: targetObj.sizeFormatted,
        progressPercent: 0,
        currentThroughputMBps: 2150,
        estimatedSecondsRemaining: 12,
        checksumStatus: 'Verifying',
        startTime: new Date().toISOString(),
        phase: 'Selecting healthy replica',
        status: 'active',
        triggerReason: `Bit-rot corruption detected by periodic SHA-256 scrubber on ${nodeId}.`,
      };

      setRepairs((prev) => [newRepairJob, ...prev]);

      // 6. Set animated visual link
      setActiveDataTransferLink({
        source: healthySource,
        target: nodeId,
        objectName: targetObj.name,
      });

      // 7. Transition node to repairing
      setTimeout(() => {
        setNodes((prev) =>
          prev.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  status: 'repairing' as const,
                  currentOperation: `Bit-rot recovery: Streaming clean blocks from ${healthySource}`,
                }
              : n
          )
        );
      }, 1000);

      addToast(
        'Data Corruption Simulated',
        `Checksum mismatch on ${nodeId}. Self-healing engine streaming authoritative replica from ${healthySource}.`,
        'warning'
      );
    },
    [objects, logActivity, addToast]
  );

  // Restart Node
  const restartNode = useCallback(
    (nodeId: string) => {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                status: 'repairing',
                currentOperation: 'Rebooting daemon & verifying disk journals...',
              }
            : n
        )
      );
      logActivity(`Node ${nodeId} reboot sequence triggered by operator`, 'Node', 'info', 'NodeManager', {
        nodeId,
        status: 'Rebooting',
      });
      setTimeout(() => {
        setNodes((prev) =>
          prev.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  status: 'healthy',
                  currentOperation: 'Serving Quorum Reads & Writes',
                  lastHeartbeat: new Date().toISOString(),
                  cpuUsagePercent: 25,
                  memoryUsagePercent: 46,
                }
              : n
          )
        );
        logActivity(`Node ${nodeId} reboot completed and rejoined quorum pool`, 'Node', 'success', 'NodeManager', {
          nodeId,
          status: 'Healthy',
        });
        addToast('Node Restarted', `${nodeId} is back online and rejoined cluster quorum.`, 'success');
      }, 2500);
    },
    [logActivity, addToast]
  );

  // Mark Node Healthy
  const markNodeHealthy = useCallback(
    (nodeId: string) => {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                status: 'healthy',
                currentOperation: 'Operator forced synchronized state',
                lastHeartbeat: new Date().toISOString(),
              }
            : n
        )
      );
      setObjects((prev) =>
        prev.map((o) =>
          o.corruptedNodeId === nodeId
            ? { ...o, replicationStatus: 'Synchronized', checksumStatus: 'Valid', corruptedNodeId: undefined }
            : o
        )
      );
      setActiveDataTransferLink(null);
      logActivity(`Operator forced healthy status on ${nodeId}`, 'User Action', 'info', 'ConsoleUI', {
        nodeId,
        status: 'Healthy',
      });
      addToast('Node State Overridden', `${nodeId} manually marked healthy.`, 'info');
    },
    [logActivity, addToast]
  );

  // Pause / Resume Repair
  const pauseRepair = useCallback(
    async (repairId: string) => {
      setRepairs((prev) =>
        prev.map((r) => (r.id === repairId ? { ...r, status: 'paused' } : r))
      );
      logActivity(`Repair job ${repairId} paused by operator`, 'Repairs', 'warning', 'SelfHealingEngine', {
        status: 'Paused',
      });
      addToast('Repair Paused', `Job ${repairId} data transfer suspended.`, 'warning');
    },
    [logActivity, addToast]
  );

  const resumeRepair = useCallback(
    async (repairId: string) => {
      setRepairs((prev) =>
        prev.map((r) => (r.id === repairId ? { ...r, status: 'active' } : r))
      );
      logActivity(`Repair job ${repairId} resumed`, 'Repairs', 'info', 'SelfHealingEngine', {
        status: 'Active',
      });
      addToast('Repair Resumed', `Streaming data blocks resumed.`, 'info');
    },
    [logActivity, addToast]
  );

  // Reset Demo
  const resetDemo = useCallback(async () => {
    setNodes(initialNodes);
    setObjects(initialObjects);
    setRepairs([]);
    setClusterHealth(initialClusterHealth);
    setConsistencyConfig(initialConsistencyConfig);
    setActiveDataTransferLink(null);
    setSelectedNodeId(null);
    setSelectedObjectId(null);

    const resetEvent: ActivityEvent = {
      id: `evt-reset-${Date.now()}`,
      timestamp: new Date().toISOString(),
      event: 'Cluster demo environment reset: All 6 nodes healthy, 3x replicas synchronized.',
      category: 'User Action',
      severity: 'success',
      component: 'DemoEngine',
      status: 'Reset Complete',
    };
    setActivityLogs([resetEvent, ...initialActivityEvents]);

    addToast('Demo Reset', 'Cluster restored to 100% healthy baseline state with all 6 nodes active.', 'success');
  }, [addToast]);

  // Update Consistency Config
  const updateConsistency = useCallback(
    async (config: ConsistencyConfig) => {
      setConsistencyConfig(config);
      logActivity(
        `Quorum parameters adjusted to N=${config.N}, W=${config.W}, R=${config.R} (${config.preset} Preset)`,
        'Replication',
        'info',
        'QuorumCoordinator',
        { status: 'Configured' }
      );
      addToast(
        'Consistency Updated',
        `Quorum set to N=${config.N}, W=${config.W}, R=${config.R} (${config.preset})`,
        'success'
      );
    },
    [logActivity, addToast]
  );

  // Run Health Check Sweep
  const runHealthCheck = useCallback(async () => {
    setIsHealthChecking(true);
    addToast('Health Check Started', 'Running cryptographic SHA-256 scrub and gossip heartbeat check...', 'info');

    setTimeout(() => {
      setIsHealthChecking(false);
      const isClean = nodes.every((n) => n.status === 'healthy');
      logActivity(
        isClean
          ? 'Full cluster scrub complete: 2,481,093 objects verified across 6 nodes. 0 bit-rot errors.'
          : 'Cluster scrub finished: Inconsistencies detected. Active repairs running.',
        'Checksum',
        isClean ? 'success' : 'warning',
        'IntegrityScrubber',
        { status: isClean ? 'Scrub Clean' : 'Degraded' }
      );
      addToast(
        'Health Check Finished',
        isClean
          ? 'All 6 nodes healthy, 3x replicas synchronized and verified.'
          : 'Health check completed with degraded nodes detected.',
        isClean ? 'success' : 'warning'
      );
    }, 2000);
  }, [nodes, logActivity, addToast]);

  // S3 Archival & Restore
  const archiveObjectToS3 = useCallback(
    async (objectId: string) => {
      setObjects((prev) =>
        prev.map((o) =>
          o.id === objectId
            ? {
                ...o,
                storageTier: 'Hybrid Syncing',
              }
            : o
        )
      );
      addToast('Archiving to S3', `Transferring object to AWS S3 Cold storage tier...`, 'info');

      setTimeout(() => {
        setObjects((prev) =>
          prev.map((o) =>
            o.id === objectId
              ? {
                  ...o,
                  storageTier: 'AWS S3 Cold',
                  replicationStatus: 'Archived to S3',
                  s3ArchiveKey: `s3://vault-cold-storage-prod/datasets/${o.name.split('/').pop()}`,
                }
              : o
          )
        );
        const obj = objects.find((o) => o.id === objectId);
        logActivity(
          `Object ${obj?.name || objectId} successfully transitioned to AWS S3 Cold Tier`,
          'S3 Sync',
          'success',
          'S3ArchivalEngine',
          { objectId, objectName: obj?.name, status: 'Archived' }
        );
        addToast('Archived to S3', `Object moved to cold tier. Hot SSD space reclaimed.`, 'success');
      }, 1800);
    },
    [objects, logActivity, addToast]
  );

  const restoreObjectFromS3 = useCallback(
    async (objectId: string) => {
      setObjects((prev) =>
        prev.map((o) =>
          o.id === objectId
            ? {
                ...o,
                storageTier: 'Hybrid Syncing',
              }
            : o
        )
      );
      addToast('Restoring from S3', `Streaming cold archive into Vault Hot NVMe cluster...`, 'info');

      setTimeout(() => {
        setObjects((prev) =>
          prev.map((o) =>
            o.id === objectId
              ? {
                  ...o,
                  storageTier: 'Vault Hot',
                  replicationStatus: 'Synchronized',
                }
              : o
          )
        );
        const obj = objects.find((o) => o.id === objectId);
        logActivity(
          `Object ${obj?.name || objectId} restored to Vault Hot 3x NVMe replicas`,
          'S3 Sync',
          'success',
          'S3ArchivalEngine',
          { objectId, objectName: obj?.name, status: 'Hot Ready' }
        );
        addToast('Restoration Complete', `Object is now in hot tier with ultra-low read latency.`, 'success');
      }, 2000);
    },
    [objects, logActivity, addToast]
  );

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;
  const selectedObject = objects.find((o) => o.id === selectedObjectId) || null;

  const activeRepairs = repairs.filter((r) => r.status === 'active' || r.status === 'paused');
  const completedRepairs = repairs.filter((r) => r.status === 'completed' || r.status === 'failed');

  return (
    <ClusterContext.Provider
      value={{
        nodes,
        objects,
        repairs,
        activeRepairs,
        completedRepairs,
        activityLogs,
        clusterHealth,
        consistencyConfig,
        metricTimeSeries,
        isLiveMode,
        selectedNode,
        selectedObject,
        toasts,
        isHealthChecking,
        activeDataTransferLink,
        toggleLiveMode,
        selectNode: setSelectedNodeId,
        selectObject: setSelectedObjectId,
        killNode,
        corruptObject,
        restartNode,
        markNodeHealthy,
        pauseRepair,
        resumeRepair,
        resetDemo,
        updateConsistency,
        runHealthCheck,
        archiveObjectToS3,
        restoreObjectFromS3,
        addToast,
        removeToast,
      }}
    >
      {children}
    </ClusterContext.Provider>
  );
};

export const useCluster = () => {
  const context = useContext(ClusterContext);
  if (!context) {
    throw new Error('useCluster must be used within a ClusterProvider');
  }
  return context;
};
