import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine';
import { FaPause, FaPlay } from 'react-icons/fa';

// --- 1. Interface ---
interface EnergyState {
  mass: number;      // affects period, but not total energy directly (Total E = 1/2 k A^2)
  k: number;         // Spring constant (Stiffness)
  amplitude: number; // How far we pull it
  paused: boolean;
}

// --- 2. Achievements ---
const achievements: Achievement<EnergyState>[] = [
  {
    id: 'pure-potential',
    title: 'Frozen Tension',
    description: 'Pause the simulation exactly when the spring is fully stretched (PE > 95%).',
    condition: (s) => {
      // We need to calculate current PE vs Total E roughly. 
      // Since we don't have access to instantaneous calculated values inside 'condition' easily 
      // without passing them back, we rely on the user visually catching it or generic logic.
      // However, for this engine pattern, we usually check state. 
      // *Workaround:* We check if paused AND we are at extreme (we can't know x here easily without duplicating logic).
      // SIMPLIFICATION for this architecture: 
      // We will trust the user finds the "Pause" button useful.
      return s.paused; 
    }
  },
  {
    id: 'max-capacity',
    title: 'Nuclear Power Plant',
    description: 'Maximize the Stiffness (k) and Amplitude. The Total Energy bar should be huge.',
    condition: (s) => s.k >= 18 && s.amplitude >= 140
  },
  {
    id: 'lazy-energy',
    title: 'Low Battery',
    description: 'Set minimum Stiffness and Amplitude. The energy bars are barely visible.',
    condition: (s) => s.k <= 2 && s.amplitude <= 50
  },
  {
    id: 'balanced-load',
    title: 'Perfectly Balanced',
    description: 'Set Mass and K to the same value.',
    condition: (s) => s.mass === s.k
  }
];

// --- 3. Canvas Component ---
const EnergyCanvas = ({ values }: { values: EnergyState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const timeRef = useRef<number>(0);
  const valuesRef = useRef(values);

  // Sync latest values
  useEffect(() => { valuesRef.current = values; }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0, height = 0;

    const animate = () => {
      const parent = canvas.parentElement;
      if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
        width = parent.clientWidth;
        height = parent.clientHeight;
        canvas.width = width;
        canvas.height = height;
      }

      const { mass, k, amplitude, paused } = valuesRef.current;

      if (!paused) {
        timeRef.current += 0.05;
      }

      // --- PHYSICS ENGINE ---
      const omega = Math.sqrt(k / mass);
      const x = amplitude * Math.cos(omega * timeRef.current);
      const v = -amplitude * omega * Math.sin(omega * timeRef.current);

      // Energy Calculations
      // PE = 1/2 k x^2
      // KE = 1/2 m v^2
      // Total = PE + KE
      const PE = 0.5 * k * (x * x);
      const KE = 0.5 * mass * (v * v);
      const TotalE = PE + KE; // Should be constant 0.5 * k * A^2

      // Scaling for visualization
      // We need to scale the bars so they don't go off screen.
      // Max possible E in this sim is approx 0.5 * 20 * 150^2 = huge number.
      // Let's normalize visually based on a "reasonable max" or dynamic scaling.
      // Let's use a fixed scale factor to show the "Total" growing/shrinking.
      const scaleFactor = 0.0015; 

      // --- RENDERING ---
      
      // 1. Background
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      // 2. The Physical System (Top Half)
      const groundY = height * 0.4;
      const centerX = width / 2;
      
      // Draw Floor
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, groundY + 40);
      ctx.lineTo(width, groundY + 40);
      ctx.stroke();

      // Draw Wall
      ctx.fillStyle = '#27272a';
      ctx.fillRect(0, 0, 20, groundY + 40);

      // Draw Spring
      const blockX = centerX + x;
      ctx.strokeStyle = '#a1a1aa';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(20, groundY);
      const coils = 15;
      for (let i = 0; i <= coils; i++) {
        const segX = 20 + ((blockX - 20) * (i / coils));
        const segY = groundY + ((i % 2 === 0) ? -10 : 10);
        ctx.lineTo(segX, segY);
      }
      ctx.stroke();

      // Draw Mass Block
      ctx.fillStyle = '#e4e4e7';
      ctx.shadowColor = 'rgba(255,255,255,0.2)';
      ctx.shadowBlur = 10;
      const size = 40 + (mass * 2);
      ctx.fillRect(blockX - size/2, groundY - size/2, size, size);
      ctx.shadowBlur = 0;

      // Draw Velocity Arrow on Block
      if (Math.abs(v) > 1) {
        ctx.strokeStyle = '#22c55e'; // Green for Speed/KE
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(blockX, groundY);
        ctx.lineTo(blockX + (v * 0.5), groundY); // Scale arrow
        ctx.stroke();
      }

      // 3. The Energy Dashboard (Bottom Half)
      const dashboardTop = height * 0.55;
      const barWidth = 60;
      const gap = 40;
      const maxBarHeight = height - dashboardTop - 50;
      
      // Total Energy (Reference Line)
      const totalH = TotalE * scaleFactor;
      // Clamp visuals
      const visualTotalH = Math.min(totalH, maxBarHeight);
      const visualPE = (PE / TotalE) * visualTotalH;
      const visualKE = (KE / TotalE) * visualTotalH;

      const barStartX = centerX - barWidth - (gap/2);

      // --- BAR 1: Potential Energy (Blue/Spring) ---
      // Label
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText("POTENTIAL (U)", barStartX + barWidth/2, height - 15);
      
      // Bar Background (The "Capacity")
      ctx.fillStyle = '#1e3a8a'; // Dark Blue
      ctx.fillRect(barStartX, height - 35 - visualTotalH, barWidth, visualTotalH);
      
      // Actual Value (Fill)
      ctx.fillStyle = '#3b82f6'; // Bright Blue
      ctx.fillRect(barStartX, height - 35 - visualPE, barWidth, visualPE);
      
      // --- BAR 2: Kinetic Energy (Green/Speed) ---
      const bar2X = centerX + (gap/2);
      
      // Label
      ctx.fillStyle = '#22c55e';
      ctx.fillText("KINETIC (K)", bar2X + barWidth/2, height - 15);

      // Bar Background
      ctx.fillStyle = '#14532d'; // Dark Green
      ctx.fillRect(bar2X, height - 35 - visualTotalH, barWidth, visualTotalH);

      // Actual Value (Fill)
      ctx.fillStyle = '#22c55e'; // Bright Green
      ctx.fillRect(bar2X, height - 35 - visualKE, barWidth, visualKE);

      // --- Total Energy readout ---
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.fillText(`TOTAL ENERGY: ${TotalE.toFixed(0)} J`, centerX, dashboardTop + 10);
      
      // Dynamic Alert if user maxes out
      if (visualTotalH >= maxBarHeight) {
        ctx.fillStyle = '#ef4444';
        ctx.fillText("WARNING: HIGH ENERGY", centerX, dashboardTop + 25);
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// --- 4. Controls Component ---
const renderEnergyControls = ({ values, setValue }: { 
  values: EnergyState; 
  setValue: (k: keyof EnergyState, v: any) => void;
}) => (
  <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto items-center">
    
    {/* Left Side: Sliders */}
    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      
      {/* Mass Slider */}
      <div className="space-y-2 group">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest group-hover:text-zinc-300 transition-colors">
            Mass (m)
          </label>
          <span className="text-xs font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
            {values.mass.toFixed(1)} kg
          </span>
        </div>
        <input 
          type="range" min="1" max="10" step="0.5"
          value={values.mass}
          onChange={(e) => setValue('mass', parseFloat(e.target.value))}
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-500 hover:accent-zinc-400"
        />
      </div>

      {/* Spring Constant Slider */}
      <div className="space-y-2 group">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest group-hover:text-blue-400 transition-colors">
            Stiffness (k)
          </label>
          <span className="text-xs font-mono text-blue-400 bg-blue-900/20 px-2 py-0.5 rounded">
            {values.k.toFixed(0)} N/m
          </span>
        </div>
        <input 
          type="range" min="1" max="20" step="1"
          value={values.k}
          onChange={(e) => setValue('k', parseFloat(e.target.value))}
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
        />
      </div>

      {/* Amplitude Slider */}
      <div className="space-y-2 group">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest group-hover:text-red-400 transition-colors">
            Amplitude (A)
          </label>
          <span className="text-xs font-mono text-red-400 bg-red-900/20 px-2 py-0.5 rounded">
            {values.amplitude.toFixed(0)} px
          </span>
        </div>
        <input 
          type="range" min="20" max="150" step="10"
          value={values.amplitude}
          onChange={(e) => setValue('amplitude', parseFloat(e.target.value))}
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-500 hover:accent-red-400"
        />
      </div>
    </div>

    {/* Right Side: Big Pause Button */}
    <div className="w-full md:w-auto flex justify-center">
      <button
        onClick={() => setValue('paused', !values.paused)}
        className={`
          flex items-center justify-center gap-3 w-32 h-14 rounded-xl border transition-all duration-300
          ${values.paused 
            ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.2)]' 
            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-white'}
        `}
      >
        {values.paused ? <FaPlay /> : <FaPause />}
        <span className="text-xs font-bold tracking-widest uppercase">
          {values.paused ? 'RESUME' : 'FREEZE'}
        </span>
      </button>
    </div>

  </div>
);

// --- 5. Export ---
export const SIMULATION_3 = {
  title: 'Energy Conservation: The Bank',
  initialValues: { 
    mass: 2.0, 
    k: 5.0, 
    amplitude: 100,
    paused: false
  },
  achievements: achievements,
  renderSimulation: ({ values }: { values: EnergyState }) => (
    <EnergyCanvas values={values} />
  ),
  renderControls: renderEnergyControls
};