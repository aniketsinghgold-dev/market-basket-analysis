import React from 'react';
import { useMarketBasketStore } from '../store/useMarketBasketStore';
import { 
  Sparkles, 
  LayoutDashboard, 
  UploadCloud, 
  Cpu, 
  Boxes, 
  Store, 
  Bot, 
  FileDown, 
  Layers
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, datasetName, isMining, miningResults } = useMarketBasketStore();

  const handlePdfExport = async () => {
    if (!miningResults) return;
    try {
      const res = await fetch(`${API_BASE}/api/export/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataset_name: datasetName,
          diagnostics: miningResults.diagnostics,
          performance: miningResults.performance_benchmark,
          rules: miningResults.mining_result.rules,
          recommendations: miningResults.business_recommendations
        })
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Market_Basket_Report_${datasetName.replace(/\s+/g, '_')}.pdf`;
      a.click();
    } catch (e) {
      console.error("PDF download error", e);
    }
  };

  const navItems = [
    { id: 'landing', label: 'Overview', icon: Sparkles },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload & Clean', icon: UploadCloud },
    { id: 'mining', label: 'Algorithms', icon: Cpu },
    { id: '3d-analytics', label: '3D Graph', icon: Boxes },
    { id: 'store-layout', label: '3D Store Layout', icon: Store },
    { id: 'copilot', label: 'AI Copilot', icon: Bot },
  ] as const;

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('landing')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-background rounded-[11px] flex items-center justify-center">
                <Layers className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
                  Market Basket
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  SaaS Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">AI Retail Placement & Intelligence</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-surface/60 p-1.5 rounded-xl border border-slate-800/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions & Dataset Badge */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-slate-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-400">Active:</span>
              <span className="font-medium text-slate-200 truncate max-w-[140px]">{datasetName}</span>
            </div>

            <button
              onClick={handlePdfExport}
              disabled={!miningResults || isMining}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
