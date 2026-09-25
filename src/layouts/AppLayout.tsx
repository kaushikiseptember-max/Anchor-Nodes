import React, { useState } from 'react';
import { Sidebar, NavPage } from './Sidebar';
import { Header } from './Header';
import { NodeDrawer } from '../components/drawers/NodeDrawer';
import { ObjectDrawer } from '../components/drawers/ObjectDrawer';
import { ToastContainer } from '../components/common/ToastContainer';
import { SearchModal } from '../components/common/SearchModal';

interface AppLayoutProps {
  currentPage: NavPage;
  onPageChange: (page: NavPage) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentPage,
  onPageChange,
  children,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#050811] text-slate-100 font-sans">
      {/* Fixed Left Sidebar */}
      <Sidebar currentPage={currentPage} onPageChange={onPageChange} />

      {/* Main App Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        {/* Sticky Top Header */}
        <Header onSearchClick={() => setIsSearchOpen(true)} />

        {/* Dynamic Page Body */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* Global Drawers & Floating Overlays */}
      <NodeDrawer />
      <ObjectDrawer />
      <ToastContainer />
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={onPageChange}
      />
    </div>
  );
};
