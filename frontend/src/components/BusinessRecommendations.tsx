import React from 'react';
import { useMarketBasketStore } from '../store/useMarketBasketStore';
import { 
  Sparkles, 
  Store, 
  ShoppingCart, 
  Tag, 
  PackageCheck, 
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export const BusinessRecommendations: React.FC = () => {
  const { miningResults, setActiveTab } = useMarketBasketStore();

  const recommendations = miningResults?.business_recommendations || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <span>AI Business Recommendation Engine</span>
          </h1>
          <p className="text-sm text-slate-400 pt-1">
            Automated plain-English retail strategy cards for store shelf layout, checkout cross-selling, combo bundling, and inventory buffers.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('copilot')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 transition-all"
        >
          <span>Ask Copilot for Custom Strategy</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map((rec) => (
          <div key={rec.rule_id} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5 glass-panel-hover">
            
            {/* Header: Priority & Metrics */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                rec.priority === 'CRITICAL' 
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                  : rec.priority === 'HIGH' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-blue-500/10 text-blue-400'
              }`}>
                {rec.priority} PRIORITY
              </span>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-slate-400">Affinity: <b className="text-white">{rec.confidence_pct}%</b></span>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {rec.lift}x Lift
                </span>
              </div>
            </div>

            {/* Plain English Narrative */}
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white leading-snug">
                [{rec.antecedents.join(', ')}] → [{rec.consequents.join(', ')}]
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {rec.narrative}
              </p>
            </div>

            {/* Strategy Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              
              {/* Shelf Layout */}
              <div className="p-3 rounded-xl bg-surface/80 border border-slate-800 space-y-1">
                <span className="font-semibold text-cyan-400 flex items-center gap-1">
                  <Store className="w-3.5 h-3.5" />
                  <span>Physical Store Layout</span>
                </span>
                <p className="text-slate-400 text-[11px] leading-tight">
                  {rec.shelf_placement}
                </p>
              </div>

              {/* Cross-Sell */}
              <div className="p-3 rounded-xl bg-surface/80 border border-slate-800 space-y-1">
                <span className="font-semibold text-blue-400 flex items-center gap-1">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Checkout Cross-Sell</span>
                </span>
                <p className="text-slate-400 text-[11px] leading-tight">
                  {rec.cross_sell_strategy}
                </p>
              </div>

              {/* Bundle Pack */}
              <div className="p-3 rounded-xl bg-surface/80 border border-slate-800 space-y-1">
                <span className="font-semibold text-amber-400 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Promo Bundle Package</span>
                </span>
                <p className="text-slate-400 text-[11px] leading-tight">
                  {rec.bundle_suggestion}
                </p>
              </div>

              {/* Demand Buffer */}
              <div className="p-3 rounded-xl bg-surface/80 border border-slate-800 space-y-1">
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <PackageCheck className="w-3.5 h-3.5" />
                  <span>Inventory Buffer</span>
                </span>
                <p className="text-slate-400 text-[11px] leading-tight">
                  {rec.inventory_strategy}
                </p>
              </div>

            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
