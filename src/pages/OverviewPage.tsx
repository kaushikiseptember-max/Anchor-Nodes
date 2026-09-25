import React from 'react';
import { DemoControls } from '../components/demo/DemoControls';
import { ClusterHealthHero } from '../components/overview/ClusterHealthHero';
import { MetricCardsGrid } from '../components/overview/MetricCardsGrid';
import { ClusterMap } from '../components/cluster/ClusterMap';
import { WorkloadChart } from '../components/overview/WorkloadChart';
import { PerformanceChart } from '../components/overview/PerformanceChart';
import { RecentActivityFeed } from '../components/overview/RecentActivityFeed';
import { NavPage } from '../layouts/Sidebar';

interface OverviewPageProps {
  onNavigate: (page: NavPage) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6">
      {/* 1. Prominent Live Demo Controls */}
      <DemoControls />

      {/* 2. Cluster Health Hero Summary */}
      <ClusterHealthHero />

      {/* 3. Metric Cards Row */}
      <MetricCardsGrid />

      {/* 4. Interactive 6-Node Topology Visualization with animated data stream */}
      <ClusterMap />

      {/* 5. Workload Breakdown & Performance Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WorkloadChart />
        <PerformanceChart />
      </div>

      {/* 6. Real-time Cluster Activity & Healing Stream */}
      <RecentActivityFeed onViewAll={() => onNavigate('activity')} />
    </div>
  );
};
