import React, { useState } from 'react';
import { useMarketBasketStore } from '../store/useMarketBasketStore';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Sliders, 
  TrendingUp, 
  DollarSign, 
  RefreshCw, 
  User 
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

export const AICopilotChat: React.FC = () => {
  const { copilotMessages, sendCopilotMessage, isCopilotLoading, miningResults } = useMarketBasketStore();
  const [inputText, setInputText] = useState('');

  // What-If Simulator state
  const rules = miningResults?.mining_result.rules || [];
  const defaultRule = rules[0] || { antecedent_str: 'Dark Roast Coffee', consequent_str: 'Croissant', lift: 2.4 };

  const [antInput, setAntInput] = useState(defaultRule.antecedent_str);
  const [consInput, setConsInput] = useState(defaultRule.consequent_str);
  const [discountPct, setDiscountPct] = useState(10);
  const [baselineAov, setBaselineAov] = useState(45);
  const [whatIfResult, setWhatIfResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isCopilotLoading) return;
    const txt = inputText;
    setInputText('');
    await sendCopilotMessage(txt);
  };

  const runWhatIfSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch(`${API_BASE}/api/copilot/whatif`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          antecedent: antInput,
          consequent: consInput,
          discount_pct: discountPct,
          current_aov: baselineAov,
          lift: defaultRule.lift || 2.4
        })
      });
      const data = await res.json();
      setWhatIfResult(data);
    } catch (err) {
      console.error("WhatIf error", err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Bot className="w-6 h-6 text-blue-400" />
          <span>AI Copilot & What-If Scenario Simulator</span>
        </h1>
        <p className="text-sm text-slate-400 pt-1">
          Chat with your retail strategy AI assistant and simulate pricing bundle discounts to forecast AOV uplift.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Chat Assistant */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between h-[520px]">
          
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h3 className="text-sm font-bold text-white">Market Basket AI Copilot</h3>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-2">
            {copilotMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-xs ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 text-white">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-surface border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className="text-[10px] text-slate-400 block pt-1 text-right">{msg.timestamp}</span>
                </div>
              </div>
            ))}
            {isCopilotLoading && (
              <div className="flex gap-2 text-xs text-slate-400 items-center">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                <span>Copilot thinking...</span>
              </div>
            )}
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-slate-800">
            <input
              type="text"
              placeholder="Ask about cross-selling, shelf layout, or pricing..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-surface border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={isCopilotLoading}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shrink-0 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

        {/* Right Column: What-If Scenario Simulator */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>What-If Revenue & AOV Simulator</span>
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Anchor Product (Antecedent)</label>
                <input
                  type="text"
                  value={antInput}
                  onChange={(e) => setAntInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-slate-800 text-white font-medium"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target Bundle Product (Consequent)</label>
                <input
                  type="text"
                  value={consInput}
                  onChange={(e) => setConsInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-slate-800 text-white font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Proposed Combo Discount:</span>
                <span className="font-mono text-emerald-400 font-bold">{discountPct}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="5"
                value={discountPct}
                onChange={(e) => setDiscountPct(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Baseline Average Order Value (AOV):</span>
                <span className="font-mono text-blue-400 font-bold">${baselineAov}</span>
              </div>
              <input
                type="range"
                min="20"
                max="150"
                step="5"
                value={baselineAov}
                onChange={(e) => setBaselineAov(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <button
              onClick={runWhatIfSimulation}
              disabled={isSimulating}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Run Scenario Simulation</span>
            </button>

            {/* Simulation Results Output */}
            {whatIfResult && (
              <div className="p-4 rounded-2xl bg-surface border border-emerald-500/30 space-y-2 pt-3 animate-in fade-in duration-200">
                <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase">Simulation Impact Forecast</span>
                <p className="text-xs text-slate-200 font-medium leading-relaxed">
                  {whatIfResult.executive_summary}
                </p>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs pt-1">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Projected AOV</span>
                    <span className="text-emerald-400 font-bold">${whatIfResult.projected_aov}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">AOV Uplift</span>
                    <span className="text-cyan-400 font-bold">+${whatIfResult.aov_uplift} (+{whatIfResult.revenue_growth_pct}%)</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
