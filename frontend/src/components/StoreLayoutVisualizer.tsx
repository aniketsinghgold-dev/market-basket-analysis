import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Html, Text } from '@react-three/drei';
import { useMarketBasketStore } from '../store/useMarketBasketStore';
import { Store, Sparkles, RefreshCw, Zap, CheckCircle2 } from 'lucide-react';

function AisleShelf({ position, args, label, color, items }: { position: [number, number, number], args: [number, number, number], label: string, color: string, items: string[] }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      <Box
        args={args}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={hovered ? '#06B6D4' : color}
          roughness={0.4}
          metalness={0.3}
        />
      </Box>

      <Html position={[0, args[1] / 2 + 0.6, 0]} center style={{ pointerEvents: 'none' }}>
        <div className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap backdrop-blur-md transition-all ${
          hovered ? 'bg-cyan-500 text-slate-950 shadow-lg' : 'bg-slate-900/90 text-white border border-slate-700'
        }`}>
          {label}
        </div>
      </Html>
    </group>
  );
}

export const StoreLayoutVisualizer: React.FC = () => {
  const [isOptimized, setIsOptimized] = useState(true);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Store className="w-6 h-6 text-blue-400" />
            <span>Interactive 3D Retail Store Layout Visualizer</span>
          </h1>
          <p className="text-sm text-slate-400 pt-1">
            Simulate physical supermarket aisle positioning. Heatmap co-occurrence paths between high-affinity SKUs.
          </p>
        </div>

        {/* Layout Toggle Button */}
        <div className="flex items-center gap-3 bg-surface p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setIsOptimized(false)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !isOptimized ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'text-slate-400'
            }`}
          >
            Baseline Layout (Unoptimized)
          </button>
          <button
            onClick={() => setIsOptimized(true)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              isOptimized ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Optimized Placement</span>
          </button>
        </div>
      </div>

      {/* 3D Supermarket Layout Stage */}
      <div className="relative w-full h-[500px] glass-panel rounded-3xl overflow-hidden border border-slate-800">
        
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface/90 border border-slate-800 text-xs backdrop-blur-md">
          <span className={`w-2.5 h-2.5 rounded-full ${isOptimized ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`}></span>
          <span className="text-slate-300">
            {isOptimized ? 'AI Optimized Adjacent Positioning Active' : 'Unoptimized: High-Affinity SKUs 3 Aisles Apart'}
          </span>
        </div>

        <Canvas camera={{ position: [0, 15, 20], fov: 50 }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 20, 10]} intensity={1.2} />

          {/* Supermarket Floor */}
          <gridHelper args={[40, 20, '#334155', '#1E293B']} />

          {/* Supermarket Aisles */}
          <AisleShelf
            position={[-8, 1.5, 0]}
            args={[2, 3, 12]}
            label="Aisle 1: Bakery & Spreads"
            color="#3B82F6"
            items={['White Bread', 'Croissant', 'Strawberry Jam']}
          />

          <AisleShelf
            position={isOptimized ? [-4, 1.5, 0] : [8, 1.5, 0]}
            args={[2, 3, 12]}
            label="Aisle 2: Dairy & Butter (Optimized)"
            color={isOptimized ? '#10B981' : '#F43F5E'}
            items={['Whole Milk', 'Unsalted Butter', 'Organic Eggs']}
          />

          <AisleShelf
            position={[0, 1.5, 0]}
            args={[2, 3, 12]}
            label="Aisle 3: Beverages & Coffee"
            color="#06B6D4"
            items={['Dark Roast Coffee', 'Green Tea']}
          />

          <AisleShelf
            position={[6, 1.5, 0]}
            args={[2, 3, 12]}
            label="Aisle 4: Snacks & Confectionery"
            color="#8B5CF6"
            items={['Chocolate Muffin', 'Cookies']}
          />

          <OrbitControls enableZoom enableRotate />
        </Canvas>
      </div>

      {/* Impact KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="glass-panel p-4 rounded-xl space-y-1">
          <span className="text-xs text-slate-400">Customer Traversal Reduction</span>
          <p className="text-xl font-mono font-bold text-emerald-400">-42.5 meters</p>
          <span className="text-[11px] text-slate-400">Saves customer shopping friction</span>
        </div>

        <div className="glass-panel p-4 rounded-xl space-y-1">
          <span className="text-xs text-slate-400">Projected Impulse Attachment</span>
          <p className="text-xl font-mono font-bold text-blue-400">+18.4%</p>
          <span className="text-[11px] text-slate-400">Higher co-purchase completion</span>
        </div>

        <div className="glass-panel p-4 rounded-xl space-y-1">
          <span className="text-xs text-slate-400">Estimated AOV Growth</span>
          <p className="text-xl font-mono font-bold text-cyan-400">+$4.20 per cart</p>
          <span className="text-[11px] text-slate-400">Basket value expansion</span>
        </div>

      </div>

    </div>
  );
};
