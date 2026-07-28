import React from 'react';
import { useMarketBasketStore } from '../store/useMarketBasketStore';
import { 
  Sliders, 
  Cpu, 
  Zap, 
  RefreshCw, 
  Layers, 
  Clock, 
  HardDrive, 
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

export const MiningControls: React.FC = () => {
  const { 
    minSupport, 
    minConfidence, 
    minLift, 
    algorithm, 
    setHyperparameters, 
    runMiningAnalysis, 
    isMining,
    miningResults
  } = useMarketBasketStore();

  const handleSupportChange = (val: number) => {
    setHyperparameters(val, minConfidence, minLift, algorithm);
  };

  const handleConfidenceChange = (val: number) => {
    setHyperparameters(minSupport, val, minLift, algorithm);
  };

  const handleLiftChange = (val: number) => {
    setHyperparameters(minSupport, minConfidence, val, algorithm);
  };

  const handleAlgoChange = (algo: 'fpgrowth' | 'apriori') => {
    setHyperparameters(minSupport, minConfidence, minLift, algo);
  };

  const perf = miningResults?.performance_benchmark;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Cpu className="w-6 h-6 text-blue-400" />
          <span>Association Mining & Algorithm Tuning</span>
        </h1>
        <p className="text-sm text-slate-400 pt-1">
          Adjust mining parameters in real time. Compare Apriori vs FP-Growth execution speeds and itemset tree sizes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Hyperparameter Tuning Sliders */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>Hyperparameter Configuration Sliders</span>
            </h3>
            <button
              onClick={() => runMiningAnalysis()}
              disabled={isMining}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all"
            >
              {isMining ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              <span>{isMining ? 'Mining Itemsets...' : 'Re-Run Mining Engine'}</span>
            </button>
          </div>

          {/* Algorithm Toggle */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Mining Engine Algorithm</label>
            <div className="grid grid-cols-2 gap-3 p-1 rounded-xl bg-surface border border-slate-800">
              <button
                type="button"
                onClick={() => handleAlgoChange('fpgrowth')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  algorithm === 'fpgrowth'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>FP-Growth (FP-Tree)</span>
              </button>

              <button
                type="button"
                onClick={() => handleAlgoChange('apriori')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  algorithm === 'apriori'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Apriori (Candidates)</span>
              </button>
            </div>
          </div>

          {/* Slider 1: Minimum Support */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <span>Minimum Support Threshold (min_support)</span>
                <span className="text-slate-500" title="Frequency of itemset across all transactions">
                  <HelpCircle className="w-3.5 h-3.5" />
                </span>
              </span>
              <span className="font-mono text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                {(minSupport * 100).toFixed(1)}% ({minSupport})
              </span>
            </div>
            <input
              type="range"
              min="0.005"
              max="0.20"
              step="0.005"
              value={minSupport}
              onChange={(e) => handleSupportChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>0.5% (High sensitivity)</span>
              <span>20% (Strict)</span>
            </div>
          </div>

          {/* Slider 2: Minimum Confidence */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <span>Minimum Confidence Threshold (min_confidence)</span>
                <span className="text-slate-500" title="Probability of consequent given antecedent">
                  <HelpCircle className="w-3.5 h-3.5" />
                </span>
              </span>
              <span className="font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                {(minConfidence * 100).toFixed(0)}% ({minConfidence})
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.90"
              step="0.05"
              value={minConfidence}
              onChange={(e) => handleConfidenceChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>5% (Broad)</span>
              <span>90% (High certainty)</span>
            </div>
          </div>

          {/* Slider 3: Minimum Lift */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <span>Minimum Lift Ratio (min_lift)</span>
                <span className="text-slate-500" title="Strength of rule over random co-occurrence">
                  <HelpCircle className="w-3.5 h-3.5" />
                </span>
              </span>
              <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {minLift.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.1"
              value={minLift}
              onChange={(e) => handleLiftChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>0.5x (Independent)</span>
              <span>5.0x (Strong affinity)</span>
            </div>
          </div>

        </div>

        {/* Right Column: Side by Side Performance Comparison Card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Side-by-Side Performance Audit</span>
          </h3>

          {perf ? (
            <div className="space-y-4">
              
              <div className="p-4 rounded-xl bg-surface border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300">Apriori Engine</span>
                  <span className="text-[11px] text-slate-500">Candidates</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Execution Duration</span>
                    <span className="text-slate-200 font-bold">{perf.apriori.exec_time_ms} ms</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Peak Memory</span>
                    <span className="text-slate-200 font-bold">{perf.apriori.memory_usage_mb} MB</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface border border-blue-500/30 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-blue-400">FP-Growth Engine</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-bold">
                    Winner: {perf.winner}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Execution Duration</span>
                    <span className="text-emerald-400 font-bold">{perf.fpgrowth.exec_time_ms} ms</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Peak Memory</span>
                    <span className="text-slate-200 font-bold">{perf.fpgrowth.memory_usage_mb} MB</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
                <span className="text-xs font-bold text-emerald-300 block">
                  FP-Growth Speedup Factor: {perf.speedup_factor}x Faster
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Discovered {perf.fpgrowth.itemsets_count} frequent itemsets & {perf.fpgrowth.rules_count} rules.
                </span>
              </div>

            </div>
          ) : (
            <div className="text-center text-xs text-slate-500 py-10">
              Run mining engine to inspect performance metrics.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
