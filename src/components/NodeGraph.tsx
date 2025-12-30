import React, { useEffect, useRef, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { motion } from 'framer-motion';
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  isHot?: boolean;
}
export function NodeGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reports = useLiveQuery(() => db.reports.toArray()) ?? [];
  // Simulated regional nodes
  const particles = useMemo(() => {
    const p: Particle[] = [];
    for (let i = 0; i < 150; i++) {
      p.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1,
      });
    }
    return p;
  }, []);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrame: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Update particles
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = i < 10 ? '#10b981' : '#1e293b'; // Some active nodes
        ctx.fill();
        // Draw connections
        particles.forEach((p2, j) => {
          if (i === j) return;
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.1 * (1 - dist/80)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      // Draw Incident Clusters (from reports)
      reports.forEach((r, idx) => {
        // Simple hashing of geohash to coordinates
        const x = (r.geohash.charCodeAt(0) * 13) % canvas.width;
        const y = (r.geohash.charCodeAt(1) * 17) % canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 6 + Math.sin(Date.now() / 200) * 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
        ctx.fill();
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.font = '8px monospace';
        ctx.fillStyle = '#f43f5e';
        ctx.fillText(r.geohash, x + 10, y + 4);
      });
      animationFrame = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [particles, reports]);
  return (
    <div className="space-y-6">
      <header className="border-l-2 border-emerald-500 pl-6 mb-8">
        <h1 className="text-2xl font-mono font-bold italic text-white uppercase tracking-tight">Node_Topology</h1>
        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-1">LV_Mesh_Visualizer // Active_Nodes_1,244</p>
      </header>
      <div className="relative aspect-video rounded-3xl border border-slate-900 bg-[#040408] overflow-hidden flex items-center justify-center">
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={600} 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/80 rounded-full border border-slate-800 backdrop-blur-sm">
             <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[9px] font-mono text-slate-300 font-bold uppercase">Node_Active</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/80 rounded-full border border-slate-800 backdrop-blur-sm">
             <div className="size-2 rounded-full bg-rose-500" />
             <span className="text-[9px] font-mono text-slate-300 font-bold uppercase">Incident_Cluster</span>
          </div>
        </div>
      </div>
    </div>
  );
}