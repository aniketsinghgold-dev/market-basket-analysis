import React, { useEffect } from 'react';
import { useMarketBasketStore } from './store/useMarketBasketStore';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { DashboardOverview } from './components/DashboardOverview';
import { DatasetUpload } from './components/DatasetUpload';
import { MiningControls } from './components/MiningControls';
import { ThreeAnalyticsGraph } from './components/ThreeAnalyticsGraph';
import { StoreLayoutVisualizer } from './components/StoreLayoutVisualizer';
import { AICopilotChat } from './components/AICopilotChat';

export const App: React.FC = () => {
  const { activeTab, loadBenchmarkDataset } = useMarketBasketStore();

  useEffect(() => {
    // Auto load benchmark groceries dataset on mount
    loadBenchmarkDataset('groceries');
  }, []);

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content View Switcher */}
      <main className="flex-1 pb-16">
        {activeTab === 'landing' && <LandingPage />}
        {activeTab === 'dashboard' && <DashboardOverview />}
        {activeTab === 'upload' && <DatasetUpload />}
        {activeTab === 'mining' && <MiningControls />}
        {activeTab === '3d-analytics' && <ThreeAnalyticsGraph />}
        {activeTab === 'store-layout' && <StoreLayoutVisualizer />}
        {activeTab === 'copilot' && <AICopilotChat />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 glass-panel">
        <p>Market Basket Intelligence Platform • Enterprise AI Retail Analytics SaaS</p>
      </footer>

    </div>
  );
};
export default App;
