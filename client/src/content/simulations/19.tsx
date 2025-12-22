import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine';

// 1. Interface
// h is Planck's constant (simulated), frequency is how "expensive" each packet is, 
// and energy budget is the total heat available.
interface SimState {
  h: number; 
  frequency: number;
  tempBudget: number;
}

// 2. Achievements
const achievements: Achievement<SimState>[] = [
  {
    id: 'packet-discovery',
    title: 'The "Chunky" Realization',
    description: 'Increase the packet size (h) until the energy stops being a smooth line.',
    condition: (s) => s.h > 4.0
  },
  {
    id: 'budget-cuts',
    title: 'Low Budget Physics',
    description: 'Set a high frequency with a tiny budget. Notice how no "packets" can be born!',
    condition: (s) => s.frequency > 8.0 && s.tempBudget < 3.0
  },
  {
    id: 'quantum-leap',
    title: 'Quantum Leap',
    description: 'Match h and Frequency to 6.6 for a perfectly balanced "Chunk."',
    condition: (s) => s.h === 6.6 && s.frequency === 6.6
  },
  {
    id: 'classical-limit',
    title: 'The Old School',
    description: 'Set h to the minimum. Energy looks smooth again. This is why our ancestors were confused.',
    condition: (s) => s.h <= 1.1
  },
  {
    id: 'high-roller',
    title: 'Energy High Roller',
    description: 'Max out the budget and frequency. Watch the packets flood the screen.',
    condition: (s) => s.tempBudget > 9.0 && s.frequency > 9.0
  }
];

// 3. Canvas
const QuantumCanvas = ({ values }: { values: SimState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const particles = useRef<{x: number, y: number, life: number}[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      const width = canvas.width = canvas.parentElement?.clientWidth || 600;
      const height = canvas.height = canvas.parentElement?.clientHeight || 400;

      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      const packetSize = values.h * values.frequency;
      const canAfford = values.tempBudget * 15 > packetSize;
      
      // Draw the "Energy Source"
      ctx.beginPath();
      ctx.arc(100, height / 2, 40 + values.tempBudget * 2, 0, Math.PI * 2);
      ctx.fillStyle = canAfford ? '#4ade80' : '#ef4444';
      ctx.shadowBlur = 20;
      ctx.shadowColor = canAfford ? '#4ade80' : '#ef4444';
      ctx.fill();
      
      // Generate "Quanta" Particles
      if (canAfford && Math.random() < (values.tempBudget / 10)) {
        particles.current.push({
          x: 140,
          y: height / 2 + (Math.random() - 0.5) * 50,
          life: 1
        });
      }

      // Render Particles as "Chunks"
      particles.current.forEach((p, i) => {
        p.x += 3;
        p.life -= 0.01;
        
        const size = values.h * 2;
        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(74, 222, 128, ${p.life})`;
        
        // If h is large, draw squares (chunky energy). If h is small, draw faint lines.
        if (values.h > 2) {
            ctx.fillRect(p.x, p.y - size/2, size, size);
        } else {
            ctx.fillRect(p.x, p.y, 10, 1);
        }
      });

      particles.current = particles.current.filter(p => p.life > 0 && p.x < width);

      // Labels
      ctx.fillStyle = '#71717a';
      ctx.font = '12px monospace';
      ctx.fillText(canAfford ? "STATUS: PRODUCING QUANTA" : "STATUS: INSUFFICIENT ENERGY FOR THIS FREQUENCY", 160, 40);
      ctx.fillText(`Packet Cost (h*f): ${packetSize.toFixed(1)}`, 160, 60);

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [values]);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

const renderControls = ({ values, setValue }: { values: SimState, setValue: any }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
    
    {/* Planck's Constant (The "Chunkiness" factor) */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Planck's Constant (h)</label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
          <span className="text-sm font-mono text-green-400 font-bold">{values.h.toFixed(1)}</span>
        </div>
      </div>
      <input 
        type="range" min="0.1" max="10" step="0.1"
        value={values.h}
        onChange={(e) => setValue('h', parseFloat(e.target.value))}
        className="glow-range"
      />
    </div>

    {/* Frequency (How fast it wiggles / How expensive it is) */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Frequency (f)</label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
          <span className="text-sm font-mono text-green-400 font-bold">{values.frequency.toFixed(1)}</span>
        </div>
      </div>
      <input 
        type="range" min="1" max="10" step="0.1"
        value={values.frequency}
        onChange={(e) => setValue('frequency', parseFloat(e.target.value))}
        className="glow-range"
      />
    </div>

    {/* Energy Budget (Temperature) */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Heat Budget (T)</label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
          <span className="text-sm font-mono text-green-400 font-bold">{values.tempBudget.toFixed(1)}</span>
        </div>
      </div>
      <input 
        type="range" min="1" max="10" step="0.5"
        value={values.tempBudget}
        onChange={(e) => setValue('tempBudget', parseFloat(e.target.value))}
        className="glow-range"
      />
    </div>

  </div>
);

export const SIMULATION_19 = {
  title: "Planck’s Quantum Packets",
  initialValues: { h: 1, frequency: 2, tempBudget: 5 },
  achievements: achievements,
  renderSimulation: ({ values }: { values: SimState }) => (
    <div className="w-full h-full relative">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center z-10 bg-black/40 p-4 rounded-lg backdrop-blur-sm border border-white/5">
        <p className="text-zinc-300 text-xs">
          Energy isn't a slide; it's a staircase. If you can't reach the next step (the Quantum), <br/>
          you don't move at all. Increase <b>h</b> to see the "steps" get bigger.
        </p>
      </div>
      <QuantumCanvas values={values} />
    </div>
  ),
  renderControls: renderControls
};