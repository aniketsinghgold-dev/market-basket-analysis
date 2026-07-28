import React from 'react';
import { useMarketBasketStore, Rule } from '../store/useMarketBasketStore';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  ZAxis, 
  Cell 
} from 'recharts';
import { 
  TrendingUp, 
  ShoppingBag, 
  Zap, 
  Boxes, 
  Cpu, 
  ArrowUpRight,
  Sparkles,
  FileText
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const { miningResults, diagnostics, datasetName, setSelectedRule, setActiveTab } = useMarketBasketStore();

  const rules = miningResults?.mining_result.rules || [];
  const totalItemsets = miningResults?.mining_result.total_frequent_itemsets || 0;
  const execTime = miningResults?.mining_result.exec_time_ms || 0;

  // Prepare Scatter Chart Data
  const scatterData = rules.map((r, i) => ({
    id: r.id,
    x: r.support * 100,
    y: r.confidence * 100,
    z: r.lift,
    name: `${r.antecedent_str} -> ${r.consequent_str}`
  }));

  // Prepare Lift Histogram Data
  const liftBins = [
    { name: '1.0 - 1.5x', count: rules.filter(r => r.lift >= 1.0 && r.lift < 1.5).length },
    { name: '1.5 - 2.0x', count: rules.filter(r => r.lift >= 1.5 && r.lift < 2.0).length },
    { name: '2.0 - 3.0x', count: rules.filter(r => r.lift >= 2.0 && r.lift < 3.0).length },
    { name: '3.0x+', count: rules.filter(r => r.lift >= 3.0).length },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <span>Executive Analytics & Association Intelligence</span>
          </h1>
          <p className="text-sm text-slate-400 pt-1">
            Real-time association rule mining metrics and SKU affinity distributions for <span className="text-slate-200 font-medium">{datasetName}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('3d-analytics')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all"
          >
            <Boxes className="w-4 h-4" />
            <span>Launch 3D WebGL Graph</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="glass-panel p-5 rounded-2xl space-y-2 border border-slate-800">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Total Mined Transactions</span>
            <ShoppingBag className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-mono font-bold text-white">
            {diagnostics?.unique_transactions?.toLocaleString() || '1,020'}
          </p>
          <span className="text-[11px] text-slate-400">Validated order IDs</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-2 border border-slate-800">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Unique Product SKUs</span>
            <Boxes className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-mono font-bold text-cyan-400">
            {diagnostics?.unique_items?.toLocaleString() || '45'}
          </p>
          <span className="text-[11px] text-slate-400">Active catalog SKUs</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-2 border border-slate-800">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Discovered Rules</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-mono font-bold text-emerald-400">
            {rules.length}
          </p>
          <span className="text-[11px] text-emerald-400/80">{totalItemsets} frequent itemsets</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-2 border border-slate-800">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Engine Latency</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-mono font-bold text-purple-400">
            {execTime} ms
          </p>
          <span className="text-[11px] text-purple-300">FP-Growth Execution</span>
        </div>

      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Scatter Chart: Support vs Confidence */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Rule Support vs Confidence Distribution</h3>
            <p className="text-xs text-slate-400">X-axis: Support (%) | Y-axis: Confidence (%)</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                <XAxis type="number" dataKey="x" name="Support" unit="%" stroke="#64748B" fontSize={11} />
                <YAxis type="number" dataKey="y" name="Confidence" unit="%" stroke="#64748B" fontSize={11} />
                <ZAxis type="number" dataKey="z" range={[50, 400]} name="Lift" />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 bg-surface border border-slate-700 rounded-xl shadow-xl text-xs space-y-1">
                          <p className="font-semibold text-blue-400">{data.name}</p>
                          <p className="text-slate-300">Support: {data.x.toFixed(1)}%</p>
                          <p className="text-slate-300">Confidence: {data.y.toFixed(1)}%</p>
                          <p className="text-emerald-400 font-bold">Lift: {data.z.toFixed(2)}x</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Rules" data={scatterData} fill="#3B82F6">
                  {scatterData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.z >= 3.0 ? '#F59E0B' : entry.z >= 2.0 ? '#10B981' : '#3B82F6'} 
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Lift Distribution */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Rule Lift Affinity Distribution</h3>
            <p className="text-xs text-slate-400">Count of association rules grouped by Lift magnitude</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={liftBins} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', fontSize: '12px' }} 
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]}>
                  {liftBins.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={index === 3 ? '#F59E0B' : index === 2 ? '#10B981' : '#3B82F6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Top Association Rules Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Top Discovered Association Rules</h3>
            <p className="text-xs text-slate-400">Ranked by Lift strength & Confidence score</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface/80 text-slate-400 font-mono border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Antecedent (If Bought)</th>
                <th className="px-4 py-3 font-semibold">Consequent (Then Also)</th>
                <th className="px-4 py-3 font-semibold">Support</th>
                <th className="px-4 py-3 font-semibold">Confidence</th>
                <th className="px-4 py-3 font-semibold">Lift</th>
                <th className="px-4 py-3 font-semibold">Leverage</th>
                <th className="px-4 py-3 font-semibold">Conviction</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {rules.slice(0, 10).map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 text-blue-400 font-sans font-medium">{rule.antecedent_str}</td>
                  <td className="px-4 py-3 text-cyan-400 font-sans font-medium">{rule.consequent_str}</td>
                  <td className="px-4 py-3">{(rule.support * 100).toFixed(1)}%</td>
                  <td className="px-4 py-3 text-slate-200">{(rule.confidence * 100).toFixed(1)}%</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      rule.lift >= 3.0 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      rule.lift >= 2.0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {rule.lift.toFixed(2)}x
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{rule.leverage.toFixed(4)}</td>
                  <td className="px-4 py-3 text-slate-400">{rule.conviction.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedRule(rule);
                        setActiveTab('3d-analytics');
                      }}
                      className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-sans font-semibold text-[11px]"
                    >
                      <span>View 3D</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
