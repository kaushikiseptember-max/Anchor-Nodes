import {
  StorageNode,
  StorageObject,
  RepairJob,
  ActivityEvent,
  ClusterHealth,
  ConsistencyConfig,
  MetricDataPoint,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  source: 'live' | 'demo';
  error?: string;
}

class ApiService {
  private isLiveModeAvailable: boolean = false;

  public setLiveModeAvailable(available: boolean) {
    this.isLiveModeAvailable = available;
  }

  public getIsLiveModeAvailable(): boolean {
    return this.isLiveModeAvailable;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
    if (!this.isLiveModeAvailable) {
      return null;
    }
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        ...options,
      });
      if (!response.ok) {
        throw new Error(`API error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      console.warn(`[AnchorNode API] Backend unavailable at ${endpoint}. Falling back to Demo Mode.`, err);
      this.isLiveModeAvailable = false;
      return null;
    }
  }

  // GET /api/cluster/status
  async getClusterStatus(): Promise<ClusterHealth | null> {
    return this.request<ClusterHealth>('/cluster/status');
  }

  // GET /api/nodes
  async getNodes(): Promise<StorageNode[] | null> {
    return this.request<StorageNode[]>('/nodes');
  }

  // GET /api/objects
  async getObjects(): Promise<StorageObject[] | null> {
    return this.request<StorageObject[]>('/objects');
  }

  // GET /api/repairs
  async getRepairJobs(): Promise<RepairJob[] | null> {
    return this.request<RepairJob[]>('/repairs');
  }

  // GET /api/activity
  async getActivityLogs(): Promise<ActivityEvent[] | null> {
    return this.request<ActivityEvent[]>('/activity');
  }

  // GET /api/metrics
  async getMetrics(): Promise<MetricDataPoint[] | null> {
    return this.request<MetricDataPoint[]>('/metrics');
  }

  // POST /api/demo/kill-node
  async killNode(nodeId: string): Promise<{ success: boolean; message: string } | null> {
    return this.request<{ success: boolean; message: string }>('/demo/kill-node', {
      method: 'POST',
      body: JSON.stringify({ nodeId }),
    });
  }

  // POST /api/demo/corrupt-data
  async corruptObject(objectId: string, nodeId: string): Promise<{ success: boolean; message: string } | null> {
    return this.request<{ success: boolean; message: string }>('/demo/corrupt-data', {
      method: 'POST',
      body: JSON.stringify({ objectId, nodeId }),
    });
  }

  // POST /api/repairs/:repairId/pause
  async pauseRepair(repairId: string): Promise<{ success: boolean; status: string } | null> {
    return this.request<{ success: boolean; status: string }>(`/repairs/${repairId}/pause`, {
      method: 'POST',
    });
  }

  // POST /api/repairs/:repairId/resume
  async resumeRepair(repairId: string): Promise<{ success: boolean; status: string } | null> {
    return this.request<{ success: boolean; status: string }>(`/repairs/${repairId}/resume`, {
      method: 'POST',
    });
  }

  // POST /api/demo/reset
  async resetDemo(): Promise<{ success: boolean; message: string } | null> {
    return this.request<{ success: boolean; message: string }>('/demo/reset', {
      method: 'POST',
    });
  }

  // PUT /api/config/consistency
  async updateConsistencyConfig(config: ConsistencyConfig): Promise<ConsistencyConfig | null> {
    return this.request<ConsistencyConfig>('/config/consistency', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }
}

export const api = new ApiService();
