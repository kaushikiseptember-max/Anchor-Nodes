import { StorageNode, RepairJob, ActivityEvent, ClusterHealth } from '../types';

export type EventCallback<T> = (data: T) => void;

class EventStreamService {
  private isConnected: boolean = false;
  private repairListeners: Set<EventCallback<RepairJob[]>> = new Set();
  private nodeHealthListeners: Set<EventCallback<StorageNode[]>> = new Set();
  private activityListeners: Set<EventCallback<ActivityEvent>> = new Set();
  private clusterStatusListeners: Set<EventCallback<ClusterHealth>> = new Set();

  connectToClusterEvents(wsUrl?: string): () => void {
    const url = wsUrl || (import.meta.env.VITE_WS_URL || 'ws://localhost:8080/events');
    console.log(`[AnchorNode EventStream] Ready for real-time WebSocket connection to ${url}`);
    
    // In Demo Mode, eventStream dispatches state updates from the simulated central engine.
    this.isConnected = true;

    return () => {
      this.disconnect();
    };
  }

  disconnect() {
    this.isConnected = false;
    this.repairListeners.clear();
    this.nodeHealthListeners.clear();
    this.activityListeners.clear();
    this.clusterStatusListeners.clear();
  }

  subscribeToRepairUpdates(callback: EventCallback<RepairJob[]>): () => void {
    this.repairListeners.add(callback);
    return () => this.repairListeners.delete(callback);
  }

  subscribeToNodeHealth(callback: EventCallback<StorageNode[]>): () => void {
    this.nodeHealthListeners.add(callback);
    return () => this.nodeHealthListeners.delete(callback);
  }

  subscribeToActivityEvents(callback: EventCallback<ActivityEvent>): () => void {
    this.activityListeners.add(callback);
    return () => this.activityListeners.delete(callback);
  }

  subscribeToClusterStatus(callback: EventCallback<ClusterHealth>): () => void {
    this.clusterStatusListeners.add(callback);
    return () => this.clusterStatusListeners.delete(callback);
  }

  // Internal dispatch methods used by simulation or live socket
  broadcastRepairUpdates(repairs: RepairJob[]) {
    this.repairListeners.forEach((fn) => fn(repairs));
  }

  broadcastNodeHealth(nodes: StorageNode[]) {
    this.nodeHealthListeners.forEach((fn) => fn(nodes));
  }

  broadcastActivity(event: ActivityEvent) {
    this.activityListeners.forEach((fn) => fn(event));
  }

  broadcastClusterStatus(status: ClusterHealth) {
    this.clusterStatusListeners.forEach((fn) => fn(status));
  }
}

export const eventStream = new EventStreamService();
