import React from 'react';
import { useMarketBasketStore } from '../store/useMarketBasketStore';
import { ThreeHeroCanvas } from './ThreeHeroCanvas';
import { 
  ArrowRight, 
  Sparkles, 
  Cpu, 
  Boxes, 
  BarChart3, 
  ShoppingBag, 
  Zap, 
  CheckCircle2, 
  TrendingUp, 
  Database
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActiveTab, loadBenchmarkDataset, isMining } = useMarketBasketStore();

  return (
    <div className="space-y-16 py-8">
      
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Driven Retail Association & Basket Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Transform Retail Data into <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400">
              Smart Product Placement & Cross-Selling
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Uncover hidden purchasing patterns across thousands of transactions. Mine frequent itemsets with Apriori & FP-Growth, visualize 3D product affinity networks, and generate executive shelf-layout strategies.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <span>Explore Analytics Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm glass-panel hover:bg-slate-800/80 text-slate-200 border border-slate-700 transition-all"
            >
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Upload Custom Dataset</span>
            </button>

          </div>

          {/* Quick Trial Benchmark Chips */}
          <div className="pt-4 flex items-center justify-center gap-3 text-xs text-slate-400">
            <span>Try Pre-Loaded Datasets:</span>
            <button
              disabled={isMining}
              onClick={async () => {
                await loadBenchmarkDataset('groceries');
                setActiveTab('dashboard');
              }}
              className="px-3 py-1 rounded-lg bg-surface border border-slate-800 hover:border-blue-500 text-slate-300 font-medium transition-all"
            >
              🛒 Groceries (10k Orders)
            </button>
            <button
              disabled={isMining}
              onClick={async () => {
                await loadBenchmarkDataset('tech');
                setActiveTab('dashboard');
              }}
              className="px-3 py-1 rounded-lg bg-surface border border-slate-800 hover:border-cyan-500 text-slate-300 font-medium transition-all"
            >
              💻 Tech Electronics
            </button>
          </div>

        </div>

        {/* 3D WebGL Canvas */}
        <ThreeHeroCanvas />

      </section>

      {/* Core Platform Capabilities Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Production-Grade Market Basket Intelligence
          </h2>
          <p className="text-sm text-slate-400">
            Built for retail analytics teams, store managers, and e-commerce growth directors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="glass-panel p-6 rounded-2xl space-y-3 glass-panel-hover">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">Dual Engine Mining</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Compare <b>Apriori</b> and <b>FP-Growth</b> side-by-side. Benchmark execution speed (ms), memory footprint (MB), and frequent itemset tree efficiency dynamically.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-3 glass-panel-hover">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Boxes className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">3D Network Graph</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full-screen WebGL 3D environment mapping products as nodes and rules as luminous beams. Node scale represents support; edge width represents lift.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-3 glass-panel-hover">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">Plain-English AI Advice</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Translates mathematical rule tuples into actionable retail business decisions: shelf layout placements, checkout upsell popups, and bundle promo packages.
            </p>
          </div>

        </div>

      </section>

      {/* Algorithm Benchmark Preview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase">Algorithm Performance Audit</span>
              <h3 className="text-xl font-bold text-white">Apriori vs FP-Growth Benchmarking</h3>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
              <Zap className="w-4 h-4" />
              <span>FP-Growth up to 4.2x Faster</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            <div className="p-5 rounded-xl bg-surface/80 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">Apriori Algorithm</span>
                <span className="text-slate-400">Candidate Generation</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Execution Time:</span>
                  <span className="font-mono text-slate-200">14.8 ms</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Memory Usage:</span>
                  <span className="font-mono text-slate-200">0.42 MB</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-surface/80 border border-blue-500/30 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-blue-400">FP-Growth Algorithm (Recommended)</span>
                <span className="text-blue-300">FP-Tree Compressed</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Execution Time:</span>
                  <span className="font-mono text-emerald-400 font-bold">3.5 ms</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Memory Usage:</span>
                  <span className="font-mono text-slate-200">0.18 MB</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};
