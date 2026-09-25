import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ConsistencyConfig } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 5) return 'just now';
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

export function formatTimeOnly(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function generateSha256(seed?: string): string {
  if (seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `${hex}a8f93e4b107c2d9e7a8f93e4b107c2d9e7a8f93e4b107c2d9e7a8f93e4b107c2`.slice(0, 64);
  }
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export interface ConsistencyAnalysis {
  isStrongConsistency: boolean;
  quorumFormula: string;
  readSafety: 'Guaranteed Fresh' | 'Possible Stale Read' | 'High Risk';
  writeSafety: 'Strict Quorum' | 'Weak Quorum' | 'Extreme Risk';
  speedRating: 'Ultra-Fast' | 'Fast' | 'Moderate' | 'Slow';
  behavior: 'Safety Prioritized' | 'Balanced Behavior' | 'Speed Prioritized' | 'Dangerous Quorum';
  description: string;
  readExplanation: string;
  writeExplanation: string;
  availabilityExplanation: string;
}

export function analyzeConsistency(config: ConsistencyConfig): ConsistencyAnalysis {
  const { N, W, R } = config;
  const isStrong = R + W > N;
  const quorumFormula = `R (${R}) + W (${W}) = ${R + W} ${isStrong ? '>' : '≤'} N (${N})`;

  if (isStrong && W >= 2 && R >= 2) {
    return {
      isStrongConsistency: true,
      quorumFormula,
      readSafety: 'Guaranteed Fresh',
      writeSafety: 'Strict Quorum',
      speedRating: 'Fast',
      behavior: 'Balanced Behavior',
      description: 'Strict quorum overlap guarantees linearizable reads and reliable failure tolerance.',
      readExplanation: `Every read contacts ${R} nodes, guaranteeing intersection with the latest write replica subset of ${W} nodes.`,
      writeExplanation: `Writes require acknowledgement from ${W} of ${N} nodes before returning 200 OK.`,
      availabilityExplanation: `Cluster tolerates up to ${N - W} node failures for writes, and ${N - R} node failures for reads without blocking.`,
    };
  }

  if (isStrong && W === N) {
    return {
      isStrongConsistency: true,
      quorumFormula,
      readSafety: 'Guaranteed Fresh',
      writeSafety: 'Strict Quorum',
      speedRating: 'Moderate',
      behavior: 'Safety Prioritized',
      description: 'Maximal safety configuration. Every node receives every write before success response.',
      readExplanation: `Reads only need ${R} replica because writes are synchronous across all ${N} nodes.`,
      writeExplanation: `Every write must be confirmed by all ${N} nodes. Zero tolerance for write partitions.`,
      availabilityExplanation: `Cluster cannot tolerate any offline node for write operations. Highly resilient for reads.`,
    };
  }

  if (W === 1 && R === 1) {
    return {
      isStrongConsistency: false,
      quorumFormula,
      readSafety: 'Possible Stale Read',
      writeSafety: 'Weak Quorum',
      speedRating: 'Ultra-Fast',
      behavior: 'Speed Prioritized',
      description: 'Eventual consistency mode optimized for high-throughput embedding streams and fast ingestion.',
      readExplanation: `Reads return immediately from the first available node without waiting for replica consensus.`,
      writeExplanation: `Writes return as soon as 1 replica commits, background replication asynchronously updates other nodes.`,
      availabilityExplanation: `Maximum availability: stays writable and readable as long as at least 1 node is alive.`,
    };
  }

  return {
    isStrongConsistency: isStrong,
    quorumFormula,
    readSafety: isStrong ? 'Guaranteed Fresh' : 'Possible Stale Read',
    writeSafety: W >= 2 ? 'Strict Quorum' : 'Weak Quorum',
    speedRating: 'Moderate',
    behavior: isStrong ? 'Safety Prioritized' : 'Dangerous Quorum',
    description: isStrong
      ? 'Custom quorum satisfies strong consistency constraints.'
      : 'Warning: R + W ≤ N creates read/write split-brain vulnerability.',
    readExplanation: `Reads query ${R} replicas.`,
    writeExplanation: `Writes require ${W} acknowledgements.`,
    availabilityExplanation: `Tolerates ${Math.max(0, N - Math.max(W, R))} node failures.`,
  };
}
