import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine';

// 1. Interface for the "System Status"
interface PhaseState {
  omega: number;      // Rotation Speed (Angular Frequency)
  phase: number;      // Starting position shift
  amplitude: number;  // Size of the wiggle
  friction: number;   // To create those cool spirals in phase space
}

// 2. Achievements: The "Mission Log"
const achievements: Achievement<PhaseState>[] = [
  {
    id: 'speed-demon',
    title: 'Warp Speed',
    description: 'Crank the Angular Frequency to the max. The universe is dizzy.',
    condition: (s) => s.omega >= 9.5
  },
  {
    id: 'head-start',
    title: 'The Head-start',
    description: 'Set a Phase shift of at least 180 degrees. Starting from the opposite side!',
    condition: (s) => s.phase >= 180
  },
  {
    id: 'black-hole',
    title: 'The Whirlpool',
    description: 'Turn on Friction while moving. Watch the Phase Space spiral into the abyss.',
    condition: (s) => s.friction > 0.05 && s.amplitude > 20
  },
  {
    id: 'big-energy',
    title: 'Maximum Vibe',
    description: 'Max out the Amplitude. Huge wiggles only.',
    condition: (s) => s.amplitude >= 140
  },
  {
    id: 'the-freeze',
    title: 'Absolute Zero',
    description: 'Set the wiggle size (Amplitude) to 0. Total silence.',
    condition: (s) => s.amplitude === 0
  }
];

// 3. The Visualizer Component
const PhaseCanvas = ({ values }: { values: PhaseState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const timeRef = useRef<number>(0);
  const historyRef = useRef<{x: number, y: number}[]>([]); // For the Phase Space trail
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

      const { omega, phase, amplitude, friction } = valuesRef.current;
      const W = canvas.width;
      const H = canvas.height;
      
      // Update Time
      timeRef.current += 0.02;

      // 1. Basic SHM Math
      // x = A * cos(wt + phi)
      // v = -A * w * sin(wt + phi)
      const currentAngle = (omega * timeRef.current) + (phase * Math.PI / 180);
      const decay = Math.exp(-friction * timeRef.current * 0.5);
      
      const x = (amplitude * decay) * Math.cos(currentAngle);
      const v = -(amplitude * decay) * omega * Math.sin(currentAngle);

      // Record History for Radar (Phase Space)
      historyRef.current.push({ x, y: v });
      if (historyRef.current.length > 500) historyRef.current.shift();

      // --- Rendering ---
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, W, H);

      // UI Layout: Left side = Real World, Right side = Secret Radar
      const midX = W / 2;
      
      // Divider
      ctx.strokeStyle = '#27272a';
      ctx.setLineDash([10, 10]);
      ctx.beginPath(); ctx.moveTo(midX, 50); ctx.lineTo(midX, H - 50); ctx.stroke();
      ctx.setLineDash([]);

      // --- LEFT SIDE: THE WIGGLER ---
      const leftCenterX = midX / 2;
      const centerY = H / 2;

      // The Rotating "Clock Hand" (Hidden Phase)
      ctx.strokeStyle = '#3f3f46';
      ctx.beginPath();
      ctx.arc(leftCenterX, centerY, amplitude * decay, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(leftCenterX, centerY);
      ctx.lineTo(leftCenterX + x, centerY); // We only show the projection
      ctx.stroke();

      // The Bouncing Ball
      ctx.fillStyle = '#18181b';
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#60a5fa';
      ctx.beginPath();
      ctx.arc(leftCenterX + x, centerY, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Labels
      ctx.fillStyle = '#60a5fa';
      ctx.font = '12px monospace';
      ctx.fillText("REAL WORLD (POSITION)", leftCenterX - 60, centerY + 100);

      // --- RIGHT SIDE: THE PHASE SPACE RADAR ---
      const rightCenterX = midX + (midX / 2);
      
      // Radar Grid
      ctx.strokeStyle = '#166534';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(rightCenterX - 100, centerY); ctx.lineTo(rightCenterX + 100, centerY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rightCenterX, centerY - 100); ctx.lineTo(rightCenterX, centerY + 100); ctx.stroke();

      // The Trail (Phase Space)
      if (historyRef.current.length > 2) {
        ctx.beginPath();
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 2;
        historyRef.current.forEach((p, i) => {
          // Scale velocity down for display
          const displayV = p.y / (omega + 1); 
          if (i === 0) ctx.moveTo(rightCenterX + p.x, centerY + displayV);
          else ctx.lineTo(rightCenterX + p.x, centerY + displayV);
        });
        ctx.stroke();
      }

      // Current Point
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(rightCenterX + x, centerY + (v / (omega + 1)), 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#4ade80';
      ctx.fillText("PHASE SPACE (RADAR)", rightCenterX - 60, centerY + 120);
      ctx.font = '10px monospace';
      ctx.fillStyle = '#888';
      ctx.fillText("X-Axis: Where you are", rightCenterX - 60, centerY + 140);
      ctx.fillText("Y-Axis: How fast you are", rightCenterX - 60, centerY + 155);

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// 4. Control Panel Logic
const renderControls = ({ values, setValue }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
    
    {/* Omega Control */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-blue-400">DJ Spin Speed (ω)</label>
        <span className="text-sm font-mono text-blue-400 font-bold">{values.omega.toFixed(1)}</span>
      </div>
      <input 
        type="range" min="0.5" max="10" step="0.1"
        value={values.omega}
        onChange={(e) => setValue('omega', parseFloat(e.target.value))}
        className="glow-range-blue"
      />
    </div>

    {/* Phase Control */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-yellow-400">Start Position (φ)</label>
        <span className="text-sm font-mono text-yellow-400 font-bold">{values.phase.toFixed(0)}°</span>
      </div>
      <input 
        type="range" min="0" max="360" step="10"
        value={values.phase}
        onChange={(e) => setValue('phase', parseFloat(e.target.value))}
        className="glow-range-yellow"
      />
    </div>

    {/* Amplitude Control */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400">Wiggle Size (A)</label>
        <span className="text-sm font-mono text-green-400 font-bold">{values.amplitude.toFixed(0)}</span>
      </div>
      <input 
        type="range" min="0" max="150" step="5"
        value={values.amplitude}
        onChange={(e) => setValue('amplitude', parseFloat(e.target.value))}
        className="glow-range"
      />
    </div>

    {/* Friction Control */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-red-400">Friction (b)</label>
        <span className="text-sm font-mono text-red-400 font-bold">{(values.friction * 100).toFixed(0)}%</span>
      </div>
      <input 
        type="range" min="0" max="0.2" step="0.01"
        value={values.friction}
        onChange={(e) => setValue('friction', parseFloat(e.target.value))}
        className="glow-range-red"
      />
    </div>

  </div>
);

// 5. Final Export Object
export const SIMULATION_2 = {
  title: 'Phase Space Radar: Tracking the Wiggle',
  initialValues: { 
    omega: 3.0, 
    phase: 0, 
    amplitude: 80, 
    friction: 0 
  },
  achievements: achievements,
  renderSimulation: ({ values }: { values: PhaseState }) => (
    <PhaseCanvas values={values} />
  ),
  renderControls: renderControls
};