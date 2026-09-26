export type NodeHealthStatus = 'healthy' | 'degraded' | 'repairing' | 'corrupted' | 'offline';

export interface StorageNode {
  id: string;
  name: string;
  status: NodeHealthStatus;
  region: string;
  version: string;
  ip: string;
  storageUsedTB: number;
  storageCapacityTB: number;
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  diskUsagePercent: number;
  replicaCount: number;
  lastHeartbeat: string;
  currentOperation: string;
  pos: { x: number; y: number }; // Relative coordinates for topology map (0-100)
  storedReplicaIds: string[];
}

export type WorkloadType =
  | 'Training Datasets'
  | 'Model Checkpoints'
  | 'Embeddings'
  | 'Evaluation Artifacts'
  | 'Experiment Outputs';

export type ReplicationStatus =
  | 'Synchronized'
  | 'Repairing'
  | 'Corrupted replica'
  | 'Under-replicated'
  | 'Archived to S3';

export type ChecksumStatus = 'Valid' | 'Mismatch' | 'Verifying';
export type StorageTier = 'Vault Hot' | 'AWS S3 Cold' | 'Hybrid Syncing';

export interface StorageObject {
  id: string;
  name: string;
  type: WorkloadType;
  sizeBytes: number;
  sizeFormatted: string;
  createdAt: string;
  lastModified: string;
  replicationStatus: ReplicationStatus;
  replicaNodes: string[]; // List of node IDs where replicas reside (e.g. ['vault-node-01', 'vault-node-02', 'vault-node-03'])
  corruptedNodeId?: string;
  checksumStatus: ChecksumStatus;
  checksum: string;
  storageTier: StorageTier;
  readCount24h: number;
  writeCount24h: number;
  s3ArchiveKey?: string;
  description?: string;
  versionHistory?: { version: string; date: string; author: string; hash: string }[];
}

export type RepairPhase =
  | 'Detecting failure'
  | 'Selecting healthy replica'
  | 'Streaming data'
  | 'Verifying checksum'
  | 'Finalizing replica'
  | 'Marking node synchronized';

export type RepairJobStatus = 'active' | 'paused' | 'completed' | 'failed';

export interface RepairJob {
  id: string;
  objectId: string;
  objectName: string;
  sourceNode: string;
  targetNode: string;
  dataSizeBytes: number;
  dataSizeFormatted: string;
  progressPercent: number;
  currentThroughputMBps: number;
  estimatedSecondsRemaining: number;
  checksumStatus: 'Pending' | 'Verifying' | 'Verified' | 'Mismatch';
  startTime: string;
  phase: RepairPhase;
  status: RepairJobStatus;
  triggerReason: string;
  completedAt?: string;
}

export type ConsistencyPreset = 'Fast' | 'Balanced' | 'Safe' | 'Custom';

export interface ConsistencyConfig {
  N: number; // Total replicas (e.g. 3)
  W: number; // Write quorum
  R: number; // Read quorum
  preset: ConsistencyPreset;
}

export type ActivitySeverity = 'info' | 'success' | 'warning' | 'critical';

export type ActivityCategory =
  | 'Node'
  | 'Replication'
  | 'Repairs'
  | 'Checksum'
  | 'User Action'
  | 'S3 Sync';

export interface ActivityEvent {
  id: string;
  timestamp: string;
  severity: ActivitySeverity;
  event: string;
  category: ActivityCategory;
  component: string;
  objectId?: string;
  objectName?: string;
  nodeId?: string;
  status: string;
  progress?: number;
}

export type ClusterStatusType = 'Healthy' | 'Degraded' | 'Repairing' | 'Critical';

export interface ClusterHealth {
  status: ClusterStatusType;
  message: string;
  uptime: string;
  uptimePercent: number;
  lastHealthCheck: string;
  healthyNodeCount: number;
  totalNodeCount: number;
  degradedNodeCount: number;
  offlineNodeCount: number;
  activeRepairCount: number;
  totalStoredDataTB: number;
  activeObjectsCount: number;
  replicationFactor: number;
  avgReadLatencyMs: number;
  avgWriteLatencyMs: number;
  replicationThroughputGBps: number;
  repairThroughputGBps: number;
}

export interface MetricDataPoint {
  timestamp: string;
  readLatencyMs: number;
  writeLatencyMs: number;
  replicationThroughputMBps: number;
  repairThroughputMBps: number;
  iops: number;
}

export interface WorkloadBreakdown {
  name: WorkloadType;
  sizeTB: number;
  objectCount: number;
  percentage: number;
  color: string;
}

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
}


export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  error?: {
    code: string;
    message: string;
  };
}

export interface AuthError {
  code: string;
  message: string;
}
