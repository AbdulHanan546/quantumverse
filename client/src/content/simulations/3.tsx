import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine';

// 1. Interface: The "Cosmic Bank" State
interface EnergyState {
  gravity: number;    // How hard the floor pulls
  amplitude: number;  // Initial "Savings" (Height)
  damping: number;    // The Tax Man (Friction)
  mass: number;       // How much "Stuff" we are moving
}

// 2. Achievements: The "Financial Goals"
const achievements: Achievement<EnergyState>[] = [
  {
    id: 'perpetual-motion',
    title: 'Tax Evasion',
    description: 'Remove the Tax Man (Friction = 0). Watch the energy trade places forever.',
    condition: (s) => s.damping === 0
  },
  {
    id: 'high-roller',
    title: 'The Billionaire',
    description: 'Max out your initial savings (Amplitude > 240). That is a lot of potential!',
    condition: (s) => s.amplitude > 240
  },
  {
    id: 'moon-budget',
    title: 'Low Gravity Budget',
    description: 'Set gravity to a minimum. Everything happens in slow motion.',
    condition: (s) => s.gravity < 2.0
  },
  {
    id: 'heavy-inflation',
    title: 'Heavy Inflation',
    description: 'Max out the mass. Moving heavy stuff costs a lot of energy.',
    condition: (s) => s.mass > 9.0
  },
  {
    id: 'economic-crash',
    title: 'Hyper-Inflation',
    description: 'Max out the Tax Man (Friction) and Amplitude. Watch your savings disappear instantly.',
    condition: (s) => s.damping > 0.18 && s.amplitude > 200
  }
];

// 3. The Visualizer: Pendulum + Energy Bars
const EnergyCanvas = ({ values }: { values: EnergyState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const timeRef = useRef<number>(0);
  const valuesRef = useRef(values);

  useEffect(() => { valuesRef.current = values; }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      const parent = canvas.parentElement;
      if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }

      const { gravity, amplitude, damping, mass } = valuesRef.current;
      const W = canvas.width;
      const H = canvas.height;
      const pivotX = W / 2;
      const pivotY = 100;
      const length = 250;

      timeRef.current += 0.016;

      // SHM Math with Damping
      const omega = Math.sqrt(gravity / (length / 100));
      const decay = Math.exp(-damping * timeRef.current * 2);
      const angle = (amplitude / 300) * decay * Math.cos(omega * timeRef.current * 5);

      // Coordinates
      const bobX = pivotX + Math.sin(angle) * length;
      const bobY = pivotY + Math.cos(angle) * length;

      // Calculate Energies (Normalized for display)
      const maxEnergy = (amplitude / 300) * (amplitude / 300) * gravity * mass;
      const currentPotential = (1 - Math.cos(angle)) * gravity * mass * 10;
      const totalAvailable = maxEnergy * decay * decay * 10; 
      const currentKinetic = Math.max(0, totalAvailable - currentPotential);

      // --- Drawing ---
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, W, H);

      // 1. Draw Pendulum
      ctx.strokeStyle = '#3f3f46';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(bobX, bobY);
      ctx.stroke();

      ctx.fillStyle = '#18181b';
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#4ade80';
      ctx.beginPath();
      ctx.arc(bobX, bobY, 15 + mass * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 2. Draw Energy Bars (The "Bank Accounts")
      const barWidth = 50;
      const barMaxH = 200;
      const barX = 60;
      const barY = H - 60;

      // Kinetic Bar (Speed)
      ctx.fillStyle = '#ef4444';
      const kH = Math.min(barMaxH, currentKinetic * 5);
      ctx.fillRect(barX, barY, barWidth, -kH);
      ctx.strokeStyle = '#7f1d1d';
      ctx.strokeRect(barX, barY, barWidth, -barMaxH);

      // Potential Bar (Height)
      ctx.fillStyle = '#3b82f6';
      const pH = Math.min(barMaxH, currentPotential * 5);
      ctx.fillRect(barX + 70, barY, barWidth, -pH);
      ctx.strokeStyle = '#1e3a8a';
      ctx.strokeRect(barX + 70, barY, barWidth, -barMaxH);

      // Labels
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 10px monospace';
      ctx.fillText("SPENDING", barX, barY + 20);
      ctx.fillText("(SPEED)", barX, barY + 32);

      ctx.fillStyle = '#3b82f6';
      ctx.fillText("SAVINGS", barX + 70, barY + 20);
      ctx.fillText("(HEIGHT)", barX + 70, barY + 32);

      // 3. The "Tax Man" Indicator
      if (damping > 0) {
        ctx.fillStyle = '#71717a';
        ctx.fillText(`TAX RATE: ${(damping * 500).toFixed(0)}%`, W - 120, 50);
      } else {
        ctx.fillStyle = '#4ade80';
        ctx.fillText("TAX FREE ZONE!", W - 120, 50);
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// 4. The Controls
const renderControls = ({ values, setValue }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
    
    {/* Starting Height (Amplitude) */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-blue-400 transition-colors">Initial Savings (Height)</label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
            <span className="text-sm font-mono text-blue-400 font-bold">{values.amplitude.toFixed(0)}</span>
        </div>
      </div>
      <input 
        type="range" min="10" max="250" step="10"
        value={values.amplitude}
        onChange={(e) => setValue('amplitude', parseFloat(e.target.value))}
        className="glow-range-blue"
      />
    </div>

    {/* Friction (Damping) */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-zinc-400 transition-colors">The Tax Man (Friction)</label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
            <span className="text-sm font-mono text-zinc-400 font-bold">{(values.damping * 100).toFixed(1)}</span>
        </div>
      </div>
      <input 
        type="range" min="0" max="0.2" step="0.01"
        value={values.damping}
        onChange={(e) => setValue('damping', parseFloat(e.target.value))}
        className="glow-range"
      />
    </div>

    {/* Gravity */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-yellow-400 transition-colors">Planet Gravity</label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
            <span className="text-sm font-mono text-yellow-400 font-bold">{values.gravity.toFixed(1)}</span>
        </div>
      </div>
      <input 
        type="range" min="1" max="20" step="0.5"
        value={values.gravity}
        onChange={(e) => setValue('gravity', parseFloat(e.target.value))}
        className="glow-range-yellow"
      />
    </div>

    {/* Mass */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-red-400 transition-colors">Amount of "Stuff" (Mass)</label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
            <span className="text-sm font-mono text-red-400 font-bold">{values.mass.toFixed(1)}kg</span>
        </div>
      </div>
      <input 
        type="range" min="1" max="10" step="0.5"
        value={values.mass}
        onChange={(e) => setValue('mass', parseFloat(e.target.value))}
        className="glow-range-red"
      />
    </div>

  </div>
);

// 5. Export Simulation Data
export const SIMULATION_3 = {
  title: 'The Energy Hot-Potato',
  initialValues: { 
    gravity: 9.8, 
    amplitude: 150, 
    damping: 0.05, 
    mass: 5 
  },
  achievements: achievements,
  renderSimulation: ({ values }: { values: EnergyState }) => (
    <EnergyCanvas values={values} />
  ),
  renderControls: renderControls
};