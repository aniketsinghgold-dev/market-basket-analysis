import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useMarketBasketStore, GraphNode, GraphEdge } from '../store/useMarketBasketStore';
import { 
  Boxes, 
  Search, 
  X, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  Sliders,
  Maximize2
} from 'lucide-react';

function NodeMesh({ node, isSelected, onClick }: { node: GraphNode, isSelected: boolean, onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
    }
  });

  const nodeColor = isSelected ? '#F59E0B' : hovered ? '#06B6D4' : '#3B82F6';

  return (
    <group position={[node.x, node.y, node.z]}>
      <Sphere
        ref={meshRef}
        args={[node.size, 32, 32]}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={nodeColor}
          roughness={0.2}
          metalness={0.6}
          emissive={isSelected ? '#F59E0B' : hovered ? '#06B6D4' : '#1D4ED8'}
          emissiveIntensity={isSelected ? 0.8 : hovered ? 0.6 : 0.2}
        />
      </Sphere>

      {/* HTML Label overlay */}
      <Html distanceFactor={25} style={{ pointerEvents: 'none' }}>
        <div className={`px-2 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap backdrop-blur-md transition-all ${
          isSelected 
            ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/50 scale-110' 
            : hovered 
            ? 'bg-cyan-500 text-slate-950 shadow-md' 
            : 'bg-surface/80 text-slate-200 border border-slate-700'
        }`}>
          {node.label}
        </div>
      </Html>
    </group>
  );
}

function ConnectionEdge({ edge, nodesMap }: { edge: GraphEdge, nodesMap: Map<string, GraphNode> }) {
  const sourceNode = nodesMap.get(edge.source);
  const targetNode = nodesMap.get(edge.target);

  if (!sourceNode || !targetNode) return null;

  const points: [number, number, number][] = [
    [sourceNode.x, sourceNode.y, sourceNode.z],
    [targetNode.x, targetNode.y, targetNode.z]
  ];

  const color = edge.lift >= 3.0 ? '#F59E0B' : edge.lift >= 2.0 ? '#10B981' : '#3B82F6';

  return (
    <Line
      points={points}
      color={color}
      lineWidth={Math.max(1, edge.weight * 0.8)}
      transparent
      opacity={Math.min(0.85, 0.3 + edge.confidence * 0.5)}
    />
  );
}

export const ThreeAnalyticsGraph: React.FC = () => {
  const { miningResults, selectedNode, setSelectedNode } = useMarketBasketStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [minLiftFilter, setMinLiftFilter] = useState(1.0);

  const graphData = miningResults?.graph_3d || { nodes: [], edges: [] };
  const rules = miningResults?.mining_result.rules || [];

  const nodesMap = useMemo(() => {
    const map = new Map<string, GraphNode>();
    graphData.nodes.forEach(n => map.set(n.id, n));
    return map;
  }, [graphData.nodes]);

  const filteredNodes = useMemo(() => {
    if (!searchTerm) return graphData.nodes;
    return graphData.nodes.filter(n => n.label.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [graphData.nodes, searchTerm]);

  const filteredEdges = useMemo(() => {
    return graphData.edges.filter(e => e.lift >= minLiftFilter);
  }, [graphData.edges, minLiftFilter]);

  // Details for selected node
  const nodeRules = useMemo(() => {
    if (!selectedNode) return [];
    return rules.filter(r => r.antecedents.includes(selectedNode.id) || r.consequents.includes(selectedNode.id));
  }, [selectedNode, rules]);

  return (
    <div className="relative w-full h-[calc(100vh-80px)] bg-background rounded-3xl overflow-hidden glass-panel border border-slate-800">
      
      {/* Top Floating HUD Search & Filters */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-3 bg-surface/80 p-2.5 rounded-2xl border border-slate-800 backdrop-blur-xl">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs w-56">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search SKU node..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-white focus:outline-none w-full placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300 px-2">
          <Sliders className="w-3.5 h-3.5 text-blue-400" />
          <span>Min Lift: <b className="text-blue-400">{minLiftFilter.toFixed(1)}x</b></span>
          <input
            type="range"
            min="1.0"
            max="4.0"
            step="0.2"
            value={minLiftFilter}
            onChange={(e) => setMinLiftFilter(parseFloat(e.target.value))}
            className="w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>

      {/* R3F 3D WebGL Canvas */}
      <Canvas camera={{ position: [0, 0, 35], fov: 60 }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[20, 20, 20]} intensity={1.5} color="#60A5FA" />
        <pointLight position={[-20, -20, -20]} intensity={0.8} color="#06B6D4" />

        {/* Nodes */}
        {filteredNodes.map(node => (
          <NodeMesh
            key={node.id}
            node={node}
            isSelected={selectedNode?.id === node.id}
            onClick={() => setSelectedNode(node)}
          />
        ))}

        {/* Edges */}
        {filteredEdges.map(edge => (
          <ConnectionEdge key={edge.id} edge={edge} nodesMap={nodesMap} />
        ))}

        <OrbitControls enablePan enableZoom enableRotate autoRotate={false} />
      </Canvas>

      {/* Sliding Node Detail Sidebar Drawer */}
      {selectedNode && (
        <div className="absolute top-4 right-4 bottom-4 w-96 z-30 glass-panel p-6 rounded-3xl border border-slate-700/80 shadow-2xl flex flex-col justify-between overflow-y-auto space-y-4 animate-in slide-in-from-right duration-300">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse"></span>
                <h3 className="font-bold text-white text-base">{selectedNode.label}</h3>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-surface border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Purchase Frequency</span>
                <span className="font-mono text-base font-bold text-blue-400">{selectedNode.frequency}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Rule Associations</span>
                <span className="font-mono text-base font-bold text-cyan-400">{selectedNode.degree}</span>
              </div>
            </div>

            {/* Rules involving this node */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Associated Rules ({nodeRules.length})</span>
              </h4>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {nodeRules.map(r => (
                  <div key={r.id} className="p-3 rounded-xl bg-surface/90 border border-slate-800 text-xs space-y-1.5">
                    <div className="flex justify-between font-semibold">
                      <span className="text-blue-300">{r.antecedent_str}</span>
                      <span className="text-slate-500 font-mono">→</span>
                      <span className="text-cyan-300">{r.consequent_str}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                      <span>Conf: {(r.confidence * 100).toFixed(0)}%</span>
                      <span className="text-emerald-400 font-bold">Lift: {r.lift.toFixed(2)}x</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <p className="text-[11px] text-slate-400">
              💡 <b>AI Layout Recommendation:</b> Position {selectedNode.label} alongside top affinity consequents in physical aisle bay.
            </p>
          </div>

        </div>
      )}

    </div>
  );
};
