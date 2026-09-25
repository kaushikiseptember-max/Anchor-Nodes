import React, { useState } from 'react';
import { ClusterProvider } from './store/ClusterContext';
import { AppLayout } from './layouts/AppLayout';
import { NavPage } from './layouts/Sidebar';
import { OverviewPage } from './pages/OverviewPage';
import { NodesPage } from './pages/NodesPage';
import { StoragePage } from './pages/StoragePage';
import { RepairsPage } from './pages/RepairsPage';
import { ConsistencyPage } from './pages/ConsistencyPage';
import { HybridCloudPage } from './pages/HybridCloudPage';
import { ActivityLogPage } from './pages/ActivityLogPage';

export function App() {
  const [currentPage, setCurrentPage] = useState<NavPage>('overview');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'overview':
        return <OverviewPage onNavigate={setCurrentPage} />;
      case 'nodes':
        return <NodesPage />;
      case 'storage':
        return <StoragePage />;
      case 'repairs':
        return <RepairsPage />;
      case 'consistency':
        return <ConsistencyPage />;
      case 'hybrid-cloud':
        return <HybridCloudPage />;
      case 'activity':
        return <ActivityLogPage />;
      default:
        return <OverviewPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <ClusterProvider>
      <AppLayout currentPage={currentPage} onPageChange={setCurrentPage}>
        {renderCurrentPage()}
      </AppLayout>
    </ClusterProvider>
  );
}

export default App;
