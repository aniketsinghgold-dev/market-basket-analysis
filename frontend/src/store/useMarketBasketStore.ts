import { create } from 'zustand';

const API_BASE = import.meta.env.VITE_API_URL || '';

export interface Rule {
  id: string;
  antecedents: string[];
  consequents: string[];
  antecedent_str: string;
  consequent_str: string;
  support: number;
  confidence: number;
  lift: number;
  leverage: number;
  conviction: number;
  rule_length: number;
}

export interface FrequentItemset {
  itemset: string[];
  itemset_str: string;
  length: number;
  support: number;
}

export interface BusinessRecommendation {
  rule_id: string;
  antecedents: string[];
  consequents: string[];
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  badge_color: string;
  lift: number;
  confidence_pct: number;
  support_pct: number;
  narrative: string;
  cross_sell_strategy: string;
  shelf_placement: string;
  bundle_suggestion: string;
  inventory_strategy: string;
}

export interface GraphNode {
  id: string;
  label: string;
  frequency: number;
  degree: number;
  x: number;
  y: number;
  z: number;
  size: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  lift: number;
  confidence: number;
  support: number;
  weight: number;
}

export interface MiningResponse {
  dataset_id: string;
  parameters: {
    min_support: number;
    min_confidence: number;
    min_lift: number;
    algorithm: string;
  };
  diagnostics: {
    total_rows: number;
    clean_rows: number;
    unique_transactions: number;
    unique_items: number;
  };
  mining_result: {
    algorithm: string;
    exec_time_ms: number;
    memory_usage_mb: number;
    total_frequent_itemsets: number;
    total_rules: number;
    frequent_itemsets: FrequentItemset[];
    rules: Rule[];
  };
  performance_benchmark: {
    apriori: {
      exec_time_ms: number;
      memory_usage_mb: number;
      itemsets_count: number;
      rules_count: number;
    };
    fpgrowth: {
      exec_time_ms: number;
      memory_usage_mb: number;
      itemsets_count: number;
      rules_count: number;
    };
    speedup_factor: number;
    winner: string;
  };
  business_recommendations: BusinessRecommendation[];
  graph_3d: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
}

export interface CopilotMessage {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface MarketBasketState {
  activeTab: 'landing' | 'dashboard' | 'upload' | 'mining' | '3d-analytics' | 'store-layout' | 'copilot';
  datasetId: string;
  datasetName: string;
  diagnostics: any | null;
  previewRows: any[];
  
  // Mining Hyperparameters
  minSupport: number;
  minConfidence: number;
  minLift: number;
  algorithm: 'fpgrowth' | 'apriori';
  isMining: boolean;
  
  // Results
  miningResults: MiningResponse | null;
  selectedRule: Rule | null;
  selectedNode: GraphNode | null;
  
  // Copilot
  copilotMessages: CopilotMessage[];
  isCopilotLoading: boolean;

  // Actions
  setActiveTab: (tab: MarketBasketState['activeTab']) => void;
  setDataset: (id: string, name: string, diagnostics: any, preview: any[]) => void;
  setHyperparameters: (support: number, confidence: number, lift: number, algo: 'fpgrowth' | 'apriori') => void;
  setSelectedRule: (rule: Rule | null) => void;
  setSelectedNode: (node: GraphNode | null) => void;
  
  // Async API actions
  loadBenchmarkDataset: (datasetId: string) => Promise<void>;
  uploadCSVFile: (file: File) => Promise<void>;
  runMiningAnalysis: () => Promise<void>;
  sendCopilotMessage: (msg: string) => Promise<void>;
}

export const useMarketBasketStore = create<MarketBasketState>((set, get) => ({
  activeTab: 'landing',
  datasetId: 'groceries',
  datasetName: 'Groceries Supermarket Retail 10k',
  diagnostics: null,
  previewRows: [],

  minSupport: 0.02,
  minConfidence: 0.20,
  minLift: 1.0,
  algorithm: 'fpgrowth',
  isMining: false,

  miningResults: null,
  selectedRule: null,
  selectedNode: null,

  copilotMessages: [
    {
      sender: 'assistant',
      text: 'Hello! I am your AI Market Basket Retail Consultant. Load a dataset or ask me any question about product placement, cross-sell opportunities, or rules.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ],
  isCopilotLoading: false,

  setActiveTab: (tab) => set({ activeTab: tab }),
  
  setDataset: (id, name, diagnostics, preview) => set({
    datasetId: id,
    datasetName: name,
    diagnostics,
    previewRows: preview
  }),

  setHyperparameters: (support, confidence, lift, algo) => set({
    minSupport: support,
    minConfidence: confidence,
    minLift: lift,
    algorithm: algo
  }),

  setSelectedRule: (rule) => set({ selectedRule: rule }),
  setSelectedNode: (node) => set({ selectedNode: node }),

  loadBenchmarkDataset: async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/datasets/benchmark/${id}`);
      const data = await res.json();
      const name = id === 'tech' ? 'Tech Electronics Retail' : 'Groceries Supermarket Retail 10k';
      
      set({
        datasetId: data.dataset_id,
        datasetName: name,
        diagnostics: data,
        previewRows: data.preview
      });

      // Auto run mining after loading benchmark
      await get().runMiningAnalysis();
    } catch (err) {
      console.error("Failed to load benchmark dataset", err);
    }
  },

  uploadCSVFile: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch(`${API_BASE}/api/datasets/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      set({
        datasetId: data.dataset_id,
        datasetName: file.name,
        diagnostics: data,
        previewRows: data.preview
      });

      // Auto run mining after file upload
      await get().runMiningAnalysis();
    } catch (err) {
      console.error("Upload error", err);
    }
  },

  runMiningAnalysis: async () => {
    const { datasetId, minSupport, minConfidence, minLift, algorithm } = get();
    set({ isMining: true });

    try {
      const res = await fetch(`${API_BASE}/api/analyze/mine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataset_id: datasetId,
          min_support: minSupport,
          min_confidence: minConfidence,
          min_lift: minLift,
          algorithm
        })
      });
      const data: MiningResponse = await res.json();
      set({ miningResults: data, isMining: false });
    } catch (err) {
      console.error("Mining analysis error", err);
      set({ isMining: false });
    }
  },

  sendCopilotMessage: async (msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: CopilotMessage = { sender: 'user', text: msg, timestamp: time };
    
    set((state) => ({
      copilotMessages: [...state.copilotMessages, userMsg],
      isCopilotLoading: true
    }));

    try {
      const { miningResults } = get();
      const rules = miningResults?.mining_result.rules || [];

      const res = await fetch(`${API_BASE}/api/copilot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          rules,
          top_items: []
        })
      });
      const data = await res.json();
      
      const replyMsg: CopilotMessage = {
        sender: 'assistant',
        text: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      set((state) => ({
        copilotMessages: [...state.copilotMessages, replyMsg],
        isCopilotLoading: false
      }));
    } catch (err) {
      set({ isCopilotLoading: false });
    }
  }
}));
