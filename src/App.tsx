import React, { useState } from "react";
import { AuthProvider, useAuth } from "./store/AuthContext";
import { ClusterProvider } from "./store/ClusterContext";
import { AppLayout } from "./layouts/AppLayout";
import { NavPage } from "./layouts/Sidebar";
import { OverviewPage } from "./pages/OverviewPage";
import { NodesPage } from "./pages/NodesPage";
import { StoragePage } from "./pages/StoragePage";
import { RepairsPage } from "./pages/RepairsPage";
import { ConsistencyPage } from "./pages/ConsistencyPage";
import { HybridCloudPage } from "./pages/HybridCloudPage";
import { ActivityLogPage } from "./pages/ActivityLogPage";
import { SignupPage } from "./pages/SignupPage";
import { LoginPage } from "./pages/LoginPage";
import { Loader2, Shield } from "lucide-react";

function AuthenticatedApp() {
  const [currentPage, setCurrentPage] = useState<NavPage>("overview");

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "overview":
        return <OverviewPage onNavigate={setCurrentPage} />;
      case "nodes":
        return <NodesPage />;
      case "storage":
        return <StoragePage />;
      case "repairs":
        return <RepairsPage />;
      case "consistency":
        return <ConsistencyPage />;
      case "hybrid-cloud":
        return <HybridCloudPage />;
      case "activity":
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

function MainRoot() {
  const { isAuthenticated, isLoading, authPage } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050811] flex flex-col items-center justify-center text-slate-100 bg-grid-pattern">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 p-0.5 shadow-2xl shadow-cyan-500/20 mb-6 animate-pulse">
          <div className="w-full h-full bg-[#070B14] rounded-[14px] flex items-center justify-center">
            <Shield className="w-8 h-8 text-cyan-400" />
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm font-mono text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
          <span>Verifying AnchorNode Vault authorization...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return authPage === "login" ? <LoginPage /> : <SignupPage />;
  }

  return <AuthenticatedApp />;
}

export function App() {
  return (
    <AuthProvider>
      <MainRoot />
    </AuthProvider>
  );
}

export default App;
