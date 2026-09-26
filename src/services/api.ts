import {
  StorageNode,
  StorageObject,
  RepairJob,
  ActivityEvent,
  ClusterHealth,
  ConsistencyConfig,
  MetricDataPoint,
  User,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  source: "live" | "demo";
  error?: string;
}

type UnauthorizedCallback = () => void;

class ApiService {
  private isLiveModeAvailable: boolean = false;
  private token: string | null = null;
  private unauthorizedListeners: UnauthorizedCallback[] = [];

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("anchornode_token");
    }
  }

  public setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("anchornode_token", token);
      } else {
        localStorage.removeItem("anchornode_token");
      }
    }
  }

  public getToken(): string | null {
    if (!this.token && typeof window !== "undefined") {
      this.token = localStorage.getItem("anchornode_token");
    }
    return this.token;
  }

  public clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("anchornode_token");
    }
  }

  public onUnauthorized(callback: UnauthorizedCallback): () => void {
    this.unauthorizedListeners.push(callback);
    return () => {
      this.unauthorizedListeners = this.unauthorizedListeners.filter((cb) => cb !== callback);
    };
  }

  private notifyUnauthorized() {
    this.clearToken();
    for (const listener of this.unauthorizedListeners) {
      try {
        listener();
      } catch (err) {
        console.error("Error in unauthorized listener:", err);
      }
    }
  }

  public setLiveModeAvailable(available: boolean) {
    this.isLiveModeAvailable = available;
  }

  public getIsLiveModeAvailable(): boolean {
    return this.isLiveModeAvailable;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...((options.headers as Record<string, string>) || {}),
      };

      const currentToken = this.getToken();
      if (currentToken) {
        headers["Authorization"] = `Bearer ${currentToken}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        if (!endpoint.startsWith("/auth/login") && !endpoint.startsWith("/auth/signup")) {
          this.notifyUnauthorized();
        }
        const errBody = await response.json().catch(() => null);
        const error: any = new Error(errBody?.error?.message || "Unauthorized - Please log in again.");
        error.status = 401;
        error.code = errBody?.error?.code || "UNAUTHORIZED";
        throw error;
      }

      if (!response.ok) {
        const errBody = await response.json().catch(() => null);
        const errorMessage = errBody?.error?.message || `API error ${response.status}: ${response.statusText}`;
        const error: any = new Error(errorMessage);
        error.status = response.status;
        error.code = errBody?.error?.code;
        throw error;
      }

      return await response.json();
    } catch (err: any) {
      if (endpoint.startsWith("/auth/")) {
        throw err;
      }
      console.warn(`[AnchorNode API] Request failed at ${endpoint}. Falling back if needed.`, err);
      return null;
    }
  }

  // Auth Endpoints
  async signup(data: { name: string; email: string; password: string }): Promise<{ success: boolean; token: string; user: User }> {
    const res = await this.request<{ success: boolean; token: string; user: User }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!res || !res.token) {
      throw new Error("Failed to sign up.");
    }
    this.setToken(res.token);
    this.setLiveModeAvailable(true);
    return res;
  }

  async login(data: { email: string; password: string }): Promise<{ success: boolean; token: string; user: User }> {
    const res = await this.request<{ success: boolean; token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!res || !res.token) {
      throw new Error("Failed to log in.");
    }
    this.setToken(res.token);
    this.setLiveModeAvailable(true);
    return res;
  }

  async logout(): Promise<void> {
    try {
      await this.request("/auth/logout", { method: "POST" });
    } catch {
      // Fire-and-forget
    } finally {
      this.clearToken();
    }
  }

  async getMe(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;
    try {
      const user = await this.request<User>("/auth/me");
      if (user && user.id) {
        this.setLiveModeAvailable(true);
        return user;
      }
      return null;
    } catch {
      this.clearToken();
      return null;
    }
  }

  // GET /api/cluster/status
  async getClusterStatus(): Promise<ClusterHealth | null> {
    return this.request<ClusterHealth>("/cluster/status");
  }

  // GET /api/nodes
  async getNodes(): Promise<StorageNode[] | null> {
    return this.request<StorageNode[]>("/nodes");
  }

  // GET /api/objects
  async getObjects(): Promise<StorageObject[] | null> {
    return this.request<StorageObject[]>("/objects");
  }

  // GET /api/repairs
  async getRepairJobs(): Promise<RepairJob[] | null> {
    return this.request<RepairJob[]>("/repairs");
  }

  // GET /api/activity
  async getActivityLogs(): Promise<ActivityEvent[] | null> {
    return this.request<ActivityEvent[]>("/activity");
  }

  // GET /api/metrics
  async getMetrics(): Promise<MetricDataPoint[] | null> {
    return this.request<MetricDataPoint[]>("/metrics");
  }

  // POST /api/demo/kill-node
  async killNode(nodeId: string): Promise<{ success: boolean; message: string } | null> {
    return this.request<{ success: boolean; message: string }>("/demo/kill-node", {
      method: "POST",
      body: JSON.stringify({ nodeId }),
    });
  }

  // POST /api/demo/corrupt-data
  async corruptObject(objectId: string, nodeId: string): Promise<{ success: boolean; message: string } | null> {
    return this.request<{ success: boolean; message: string }>("/demo/corrupt-data", {
      method: "POST",
      body: JSON.stringify({ objectId, nodeId }),
    });
  }

  // POST /api/repairs/:repairId/pause
  async pauseRepair(repairId: string): Promise<{ success: boolean; status: string } | null> {
    return this.request<{ success: boolean; status: string }>(`/repairs/${repairId}/pause`, {
      method: "POST",
    });
  }

  // POST /api/repairs/:repairId/resume
  async resumeRepair(repairId: string): Promise<{ success: boolean; status: string } | null> {
    return this.request<{ success: boolean; status: string }>(`/repairs/${repairId}/resume`, {
      method: "POST",
    });
  }

  // POST /api/demo/reset
  async resetDemo(): Promise<{ success: boolean; message: string } | null> {
    return this.request<{ success: boolean; message: string }>("/demo/reset", {
      method: "POST",
    });
  }

  // PUT /api/config/consistency
  async updateConsistencyConfig(config: ConsistencyConfig): Promise<ConsistencyConfig | null> {
    return this.request<ConsistencyConfig>("/config/consistency", {
      method: "PUT",
      body: JSON.stringify(config),
    });
  }
}

export const api = new ApiService();
