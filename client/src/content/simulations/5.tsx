import React, { useEffect, useRef, useState } from 'react';
import { type Achievement } from '../../components/SimulationEngine';
import { FaBolt, FaWater, FaStopwatch, FaInfinity, FaPlay } from 'react-icons/fa';

// --- 1. Interface ---
interface WaveState {
  tension: number;   // 0.1 (loose) to 1.0 (tight) - Affects wave speed (c)
  damping: number;   // 0.90 (mud) to 1.0 (vacuum) - Affects energy loss
  pulseTrigger: number; // Increment to trigger a pulse
}

// --- 2. Achievements ---
const achievements: Achievement<WaveState>[] = [
  {
    id: 'light-speed',
    title: 'Warp Speed',
    description: 'Max out the tension. The neighbors pull so hard the wave travels instantly.',
    condition: (s) => s.tension >= 0.95
  },
  {
    id: 'lazy-sunday',
    title: 'The Lazy Rope',
    description: 'Set tension extremely low (< 0.2). The wave barely has the energy to get out of bed.',
    condition: (s) => s.tension < 0.2
  },
  {
    id: 'perpetual-motion',
    title: 'Perpetual Motion',
    description: 'Set damping to 100% (No friction). This wave will bounce until the end of time.',
    condition: (s) => s.damping >= 0.999
  },
  {
    id: 'honey-trap',
    title: 'Stuck in Honey',
    description: 'High damping (< 0.92). The wave dies before it even hits the wall.',
    condition: (s) => s.damping < 0.92
  }
];

// --- 3. Physics Simulation (The Wave Equation Solver) ---
const WaveCanvas = ({ values }: { values: WaveState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Physics Simulation Data
  // We use the Finite Difference Method to solve d2u/dt2 = c^2 * d2u/dx2
  const NUM_POINTS = 100;
  const positions = useRef(new Float32Array(NUM_POINTS)); // u(x, t)
  const velocities = useRef(new Float32Array(NUM_POINTS)); // du/dt
  const prevTriggerRef = useRef(values.pulseTrigger);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0, height = 0;

    const animate = () => {
      // Resize Logic
      const parent = canvas.parentElement;
      if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
        width = parent.clientWidth;
        height = parent.clientHeight;
        canvas.width = width;
        canvas.height = height;
      }

      // --- PHYSICS ENGINE ---
      
      // 1. Detect Pulse Trigger
      if (values.pulseTrigger !== prevTriggerRef.current) {
        // Create a Gaussian pulse at the left side
        for (let i = 1; i < 20; i++) {
          positions.current[i] += 150 * Math.exp(-Math.pow(i - 10, 2) / 10);
        }
        prevTriggerRef.current = values.pulseTrigger;
      }

      // 2. Solve Wave Equation (The "Neighbor" Logic)
      // Every point looks at its left and right neighbor. 
      // If neighbors are higher, they pull you up. If lower, they pull you down.
      // Tension determines how HARD they pull.
      
      const u = positions.current;
      const v = velocities.current;
      const c2 = values.tension * 0.5; // Wave speed squared coefficient
      
      for (let i = 1; i < NUM_POINTS - 1; i++) {
        // Curvature = Left + Right - 2*Center
        const curvature = u[i - 1] + u[i + 1] - 2 * u[i];
        const acceleration = curvature * c2;
        
        v[i] += acceleration;
        v[i] *= values.damping; // Apply friction
      }

      // Update positions based on velocity
      for (let i = 1; i < NUM_POINTS - 1; i++) {
        u[i] += v[i];
      }

      // --- RENDERING ---
      
      ctx.fillStyle = '#09090b'; // Background
      ctx.fillRect(0, 0, width, height);

      const centerY = height / 2;
      const segmentWidth = width / NUM_POINTS;

      // Draw Guide Line
      ctx.strokeStyle = '#27272a';
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      // Draw The String
      ctx.beginPath();
      ctx.moveTo(0, centerY + u[0]);
      
      // Gradient stroke based on tension
      const tensionHue = 120 + (1 - values.tension) * 200; // Green to Pink
      ctx.strokeStyle = `hsl(${tensionHue}, 70%, 50%)`;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 0; i < NUM_POINTS; i++) {
        const x = i * segmentWidth;
        const y = centerY + u[i]; // Flip Y because canvas is upside down
        ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw "Beads" / Particles
      ctx.fillStyle = '#fff';
      for (let i = 0; i < NUM_POINTS; i += 5) { // Draw every 5th particle
         const x = i * segmentWidth;
         const y = centerY + u[i];
         ctx.beginPath();
         ctx.arc(x, y, 2, 0, Math.PI * 2);
         ctx.fill();
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [values]); // Re-run if values change, though physics array persists via refs

  return <canvas ref={canvasRef} className="block w-full h-full cursor-crosshair" />;
};

// --- 4. Controls ---
const WaveControls = ({ values, setValue }: { values: WaveState, setValue: (k: keyof WaveState, v: any) => void }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
      
      {/* Tension Slider */}
      <div className="space-y-3 group">
        <div className="flex justify-between items-end">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400 transition-colors flex items-center gap-2">
            <FaBolt /> Tension (Speed)
          </label>
          <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
            <span className="text-sm font-mono text-green-400 font-bold">{(values.tension * 100).toFixed(0)}%</span>
          </div>
        </div>
        <input 
          type="range" min="0.05" max="1.0" step="0.01"
          value={values.tension}
          onChange={(e) => setValue('tension', parseFloat(e.target.value))}
          className="glow-range"
        />
        <p className="text-[10px] text-zinc-600">How tightly neighbors hold hands.</p>
      </div>

      {/* Damping Slider */}
      <div className="space-y-3 group">
        <div className="flex justify-between items-end">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-blue-400 transition-colors flex items-center gap-2">
            <FaWater /> Medium (Friction)
          </label>
          <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
            <span className="text-sm font-mono text-blue-400 font-bold">
                {values.damping >= 0.999 ? 'VACUUM' : `${((1 - values.damping) * 1000).toFixed(0)} air`}
            </span>
          </div>
        </div>
        <input 
          type="range" min="0.90" max="0.999" step="0.001"
          value={values.damping}
          onChange={(e) => setValue('damping', parseFloat(e.target.value))}
          className="glow-range !accent-blue-500"
        />
        <p className="text-[10px] text-zinc-600">Energy loss per frame.</p>
      </div>

      {/* Action Button */}
      <div className="flex items-center justify-center">
        <button
            onClick={() => setValue('pulseTrigger', values.pulseTrigger + 1)}
            className="group relative px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl border border-zinc-600 hover:border-green-500 transition-all active:scale-95 shadow-lg overflow-hidden"
        >
            <div className="absolute inset-0 w-full h-full bg-green-500/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            <div className="flex items-center gap-3 relative z-10">
                <FaPlay className="text-green-400 group-hover:animate-ping" size={12} />
                <span className="font-bold uppercase tracking-widest text-sm">Pluck String</span>
            </div>
        </button>
      </div>

    </div>
  );
};

// --- 5. Export ---

export const SIMULATION_5 = {
  title: 'The Wiggle Chain (1D Wave Eq)',
  initialValues: { tension: 0.5, damping: 0.99, pulseTrigger: 0 },
  achievements: achievements,
  renderSimulation: ({ values }: { values: WaveState }) => <WaveCanvas values={values} />,
  renderControls: ({ values, setValue }: { values: WaveState, setValue: (k: keyof WaveState, v: any) => void }) => <WaveControls values={values} setValue={setValue} />
};