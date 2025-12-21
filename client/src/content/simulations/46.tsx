import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine'; // Adjust import path as needed

// --- 1. Interface & State ---

interface QuantumState {
  /** The probability (0-100) that the particle will be RED. (100-p is BLUE) */
  probabilityOfRed: number;
  /** How much the particle vibrates before measurement */
  instability: number;
  /** Has the user clicked "Measure"? */
  isCollapsed: boolean;
  /** The final result after measurement */
  collapsedColor: 'red' | 'blue' | null;
  /** Just a counter to track how many times we've peeked at the universe */
  observationCount: number;
}

// --- 2. Achievements ---

const achievements: Achievement<QuantumState>[] = [
  {
    id: 'first-peek',
    title: "Schrödinger's Peep",
    description: "Collapse the wavefunction for the first time. You killed the mystery!",
    condition: (s) => s.isCollapsed && s.observationCount >= 1
  },
  {
    id: 'rigged-game',
    title: "Rigged Game",
    description: "Measure the particle when Probability is set to 0% or 100%. You like certainty, don't you?",
    condition: (s) => s.isCollapsed && (s.probabilityOfRed === 0 || s.probabilityOfRed === 100)
  },
  {
    id: 'perfect-balance',
    title: "The Coin Flip",
    description: "Collapse the state with exactly 50% probability. Perfectly balanced, as all things should be.",
    condition: (s) => s.isCollapsed && s.probabilityOfRed === 50
  },
  {
    id: 'chaos-mode',
    title: "Quantum Foam",
    description: "Crank the Instability (Noise) to the max (10) while the particle is undefined.",
    condition: (s) => !s.isCollapsed && s.instability >= 10
  },
  {
    id: 'indecisive',
    title: "Total Uncertainty",
    description: "Reset the simulation back to a superposition state after measuring.",
    condition: (s) => !s.isCollapsed && s.observationCount > 0
  }
];

// --- 3. The Visualization (Canvas) ---

const QuantumCanvas = ({ values }: { values: QuantumState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      // 1. Responsive Canvas Logic
      const parent = canvas.parentElement;
      if (parent) {
        // Only reset dimensions if they actually changed to avoid clearing too often
        if (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight) {
            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight;
        }
      }

      // FIX: Always read current width/height from the canvas element
      const width = canvas.width;
      const height = canvas.height;

      const { probabilityOfRed, instability, isCollapsed, collapsedColor } = values;
      timeRef.current += 0.05;

      // 2. Clear Background
      ctx.fillStyle = '#09090b'; // zinc-950
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // 3. Draw The Particle
      if (isCollapsed && collapsedColor) {
        // --- COLLAPSED STATE (Solid Reality) ---
        const color = collapsedColor === 'red' ? '#ef4444' : '#3b82f6';
        
        ctx.shadowBlur = 20;
        ctx.shadowColor = color;
        ctx.fillStyle = color;
        
        // A solid, pulsing circle
        const pulse = Math.sin(timeRef.current * 2) * 5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 60 + pulse, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 0;
        ctx.fillText(collapsedColor.toUpperCase(), centerX, centerY);

      } else {
        // --- SUPERPOSITION STATE (The Ghost) ---
        const redAmount = probabilityOfRed; 
        const blueAmount = 100 - probabilityOfRed;
        
        // Shake logic
        const shakeX = (Math.random() - 0.5) * (instability * 10);
        const shakeY = (Math.random() - 0.5) * (instability * 10);

        // Gradient representing the probability cloud
        const gradient = ctx.createRadialGradient(
            centerX + shakeX, centerY + shakeY, 10,
            centerX + shakeX, centerY + shakeY, 120
        );

        // Color mixing
        const r = Math.round((redAmount / 100) * 239 + (blueAmount / 100) * 59);
        const g = Math.round((redAmount / 100) * 68 + (blueAmount / 100) * 130);
        const b = Math.round((redAmount / 100) * 68 + (blueAmount / 100) * 246);
        
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.3)`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 150, 0, Math.PI * 2);
        ctx.fill();

        // Draw "Orbitals"
        ctx.strokeStyle = `rgba(255, 255, 255, 0.1)`;
        ctx.lineWidth = 2;
        
        for(let i=0; i<3; i++) {
            ctx.beginPath();
            const rotation = timeRef.current + (i * Math.PI / 3);
            ctx.ellipse(
                centerX, centerY, 
                80 + (Math.sin(timeRef.current)*10), 
                30, 
                rotation, 0, Math.PI*2
            );
            ctx.stroke();
        }

        // Question Mark
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(timeRef.current * 5) * 0.2})`;
        ctx.font = 'bold 40px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText("?", centerX + shakeX, centerY + shakeY);
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [values]);

  return <canvas ref={canvasRef} className="block w-full h-full cursor-crosshair" />;
};

// --- 4. Controls ---

const QuantumControls = ({ values, setValue }: { values: QuantumState, setValue: (k: keyof QuantumState, v: any) => void }) => {
  
  const measure = () => {
    // The Core Quantum Logic: RNG vs Probability
    const randomVal = Math.random() * 100;
    const outcome = randomVal <= values.probabilityOfRed ? 'red' : 'blue';
    
    setValue('collapsedColor', outcome);
    setValue('isCollapsed', true);
    setValue('observationCount', values.observationCount + 1);
  };

  const reset = () => {
    setValue('isCollapsed', false);
    setValue('collapsedColor', null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
      
      {/* Probability Slider */}
      <div className="space-y-3 group">
        <div className="flex justify-between items-end">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-blue-400 transition-colors">
            Probability Split
          </label>
          <div className="flex gap-2 text-xs font-mono font-bold">
            <span className="text-blue-400">{100 - values.probabilityOfRed}% Blue</span>
            <span className="text-zinc-600">|</span>
            <span className="text-red-400">{values.probabilityOfRed}% Red</span>
          </div>
        </div>
        <input
          type="range" min="0" max="100" step="1"
          disabled={values.isCollapsed}
          value={values.probabilityOfRed}
          onChange={(e) => setValue('probabilityOfRed', parseInt(e.target.value))}
          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:opacity-50"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${100-values.probabilityOfRed}%, #ef4444 ${100-values.probabilityOfRed}%, #ef4444 100%)`
          }}
        />
        <p className="text-[10px] text-zinc-500">
          This sets the "Wavefunction Amplitude". Basically, how likely you are to see Red vs Blue.
        </p>
      </div>

      {/* Instability Slider */}
      <div className="space-y-3 group">
        <div className="flex justify-between items-end">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-yellow-400 transition-colors">
            Quantum Noise (Instability)
          </label>
          <span className="text-sm font-mono text-yellow-400 font-bold">{values.instability}</span>
        </div>
        <input
          type="range" min="0" max="10" step="1"
          value={values.instability}
          onChange={(e) => setValue('instability', parseInt(e.target.value))}
          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
        />
         <p className="text-[10px] text-zinc-500">
          Adds jitter to the system. Harder to predict? No. More annoying to look at? Yes.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end items-center">
        {!values.isCollapsed ? (
            <button
            onClick={measure}
            className="flex-1 px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all active:scale-95 uppercase tracking-wider"
            >
            👁️ Observe
            </button>
        ) : (
            <button
            onClick={reset}
            className="flex-1 px-8 py-4 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 font-bold rounded-xl border border-zinc-600 transition-all active:scale-95 uppercase tracking-wider"
            >
            Stop Looking (Reset)
            </button>
        )}
      </div>

    </div>
  );
};

// --- 5. Export ---

export const SIMULATION_46 = {
  title: 'Quantum Superposition',
  initialValues: { 
    probabilityOfRed: 50, 
    instability: 2, 
    isCollapsed: false, 
    collapsedColor: null,
    observationCount: 0
  },
  achievements: achievements,
  renderSimulation: ({ values }: { values: QuantumState }) => <QuantumCanvas values={values} />,
  renderControls: ({ values, setValue }: any) => <QuantumControls values={values} setValue={setValue} />
};