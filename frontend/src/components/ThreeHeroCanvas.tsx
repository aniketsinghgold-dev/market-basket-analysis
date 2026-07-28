import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sphere, MeshDistortMaterial, Line } from '@react-three/drei';
import * as THREE from 'three';

function FloatingProductNode({ position, color, speed, distort }: { position: [number, number, number], color: string, speed: number, distort: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.3 * speed;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.4 * speed;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={1.5} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 32, 32]} position={position}>
        <MeshDistortMaterial
          color={color}
          envMapIntensity={0.8}
          clearcoat={0.9}
          clearcoatRoughness={0.1}
          metalness={0.4}
          roughness={0.2}
          distort={distort}
          speed={2}
        />
      </Sphere>
    </Float>
  );
}

function ConnectionBeams() {
  const points: [number, number, number][] = [
    [-3, 1.5, 0],
    [0, -1.8, 1],
    [3.2, 1, -1],
    [-2.5, -2, -1],
    [2.5, -2, 0.5],
  ];

  return (
    <Line
      points={points}
      color="#3B82F6"
      lineWidth={2}
      transparent
      opacity={0.6}
    />
  );
}

export const ThreeHeroCanvas: React.FC = () => {
  return (
    <div className="w-full h-[550px] relative rounded-3xl overflow-hidden glass-panel border border-slate-800/80 shadow-2xl">
      
      {/* Overlay Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
        <span className="text-xs font-medium text-cyan-300">Live 3D Retail Graph Engine</span>
      </div>

      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} color="#60A5FA" />
        <pointLight position={[-10, -10, -5]} intensity={0.8} color="#06B6D4" />

        {/* 3D Floating Product Nodes */}
        <FloatingProductNode position={[-3, 1.5, 0]} color="#3B82F6" speed={1.5} distort={0.3} />
        <FloatingProductNode position={[3.2, 1, -1]} color="#06B6D4" speed={1.2} distort={0.4} />
        <FloatingProductNode position={[0, -1.8, 1]} color="#8B5CF6" speed={1.8} distort={0.25} />
        <FloatingProductNode position={[-2.5, -2, -1]} color="#10B981" speed={1.4} distort={0.35} />
        <FloatingProductNode position={[2.5, -2, 0.5]} color="#F59E0B" speed={1.6} distort={0.3} />

        <ConnectionBeams />

        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.5} />
      </Canvas>
    </div>
  );
};
