import React, { useEffect, useRef, useState, useCallback } from 'react';
import { type Achievement } from '../../components/SimulationEngine';
import { FaHandPointer, FaTrash, FaWaveSquare } from 'react-icons/fa';

// --- 1. Interface ---
interface StringState {
  tension: number;    // Represents c^2 (Wave Speed squared)
  damping: number;    // How fast energy is lost (friction)
  pulseForce: number; // How hard we pluck
  wallType: 'fixed' | 'free'; // Boundary condition
}

// --- 2. Achievements ---
const achievements: Achievement<StringState>[] = [
  {
    id: 'high-tension',
    title: 'Guitar Solo',
    description: 'Max out the Tension. The waves travel instantly!',
    condition: (s) => s.tension >= 0.9
  },
  {
    id: 'swamp-mode',
    title: 'In The Mud',
    description: 'Set Damping to maximum. The wave dies before it hits the wall.',
    condition: (s) => s.damping >= 0.15
  },
  {
    id: 'perpetual-motion',
    title: 'Echo Chamber',
    description: 'Set Damping to 0. The wave will bounce forever.',
    condition: (s) => s.damping === 0
  },
  {
    id: 'wall-hacker',
    title: 'Loose Ends',
    description: 'Switch the wall type to "Free". Watch the reflection not invert!',
    condition: (s) => s.wallType === 'free'
  }
];

// --- 3. Canvas Component ---
const StringCanvas = ({ values }: { values: StringState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Physics Arrays (Double Buffering)
  // We divide the string into 100 "beads" or segments
  const RESOLUTION = 100;
  const currentRef = useRef<Float32Array>(new Float32Array(RESOLUTION).fill(0));
  const prevRef = useRef<Float32Array>(new Float32Array(RESOLUTION).fill(0));
  
  // To handle interaction
  const mousePosRef = useRef<{x: number, y: number} | null>(null);

  // Helper to spawn a pulse programmatically or via click
  const spawnPulse = useCallback((index: number, force: number) => {
    const width = 6; // Width of the pluck
    for (let i = -width; i <= width; i++) {
      const idx = index + i;
      if (idx > 1 && idx < RESOLUTION - 2) {
        // Gaussian-ish shape for smooth wave
        const val = force * Math.cos((i / width) * (Math.PI / 2));
        currentRef.current[idx] += val;
        // We must update prev as well to give it initial velocity of 0, 
        // or set prev != current to give it velocity.
        // Letting prev = current implies velocity 0 at start of pluck.
        prevRef.current[idx] += val; 
      }
    }
  }, []);

  // Expose spawn pulse to window/parent if needed, but for now we handle clicks here
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      // Map x to array index
      const index = Math.floor((x / canvas.width) * RESOLUTION);
      spawnPulse(index, values.pulseForce * 20); // Scale force up for visibility
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    return () => canvas.removeEventListener('mousedown', handleMouseDown);
  }, [values.pulseForce, spawnPulse]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0, height = 0;

    const animate = () => {
      // Resize
      const parent = canvas.parentElement;
      if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
        width = parent.clientWidth;
        height = parent.clientHeight;
        canvas.width = width;
        canvas.height = height;
      }

      // --- PHYSICS SOLVER (The Wave Equation) ---
      // u(x, t+1) = 2u(x,t) - u(x,t-1) + C^2 * (u(x+1,t) - 2u(x,t) + u(x-1,t))
      
      const u = currentRef.current;
      const uPrev = prevRef.current;
      const nextU = new Float32Array(RESOLUTION);

      const c2 = values.tension; // Speed squared
      const damp = 1 - values.damping; // Simple velocity damping factor

      for (let i = 1; i < RESOLUTION - 1; i++) {
        // The Laplacian (Difference between point and average of neighbors)
        const laplacian = u[i+1] - 2*u[i] + u[i-1];
        
        // Verlet Integration step
        // New = 2*Current - Old + Acceleration
        let val = (2 * u[i]) - uPrev[i] + (c2 * laplacian);
        
        // Apply damping
        val = val * damp;
        
        nextU[i] = val;
      }

      // Boundary Conditions
      if (values.wallType === 'fixed') {
        nextU[0] = 0;
        nextU[RESOLUTION-1] = 0;
      } else {
        // Free end: The end equals its neighbor (Slope is 0)
        nextU[0] = nextU[1];
        nextU[RESOLUTION-1] = nextU[RESOLUTION-2];
      }

      // Swap buffers
      prevRef.current.set(u);
      currentRef.current.set(nextU);


      // --- RENDER ---
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);
      
      const centerY = height / 2;
      const segmentWidth = width / RESOLUTION;

      // Draw Grid/Reference
      ctx.strokeStyle = '#27272a';
      ctx.beginPath();
      ctx.moveTo(0, centerY); ctx.lineTo(width, centerY);
      ctx.stroke();

      // Draw The String
      ctx.beginPath();
      ctx.lineWidth = 4;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      
      // Dynamic Color based on Tension
      const hue = 180 + (values.tension * 100); // Cyan to Purple
      ctx.strokeStyle = `hsl(${hue}, 70%, 60%)`;
      ctx.shadowColor = `hsl(${hue}, 70%, 60%)`;
      ctx.shadowBlur = 15;

      for (let i = 0; i < RESOLUTION; i++) {
        const x = i * segmentWidth;
        const y = centerY - nextU[i]; // Negative because Canvas Y is down
        if (i===0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Visual hints for Boundaries
      ctx.fillStyle = values.wallType === 'fixed' ? '#71717a' : '#ef4444';
      // Left Wall
      ctx.fillRect(0, centerY - 10, 5, 20); 
      // Right Wall
      ctx.fillRect(width - 5, centerY - 10, 5, 20);

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [values.tension, values.damping, values.wallType]);

  return <canvas ref={canvasRef} className="block w-full h-full cursor-pointer" title="Click to Pluck!" />;
};

// --- 4. Controls Component ---
const renderWaveControls = ({ values, setValue }: { 
  values: StringState; 
  setValue: (k: keyof StringState, v: any) => void;
}) => (
  <div className="flex flex-col gap-6 max-w-6xl mx-auto">
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      
      {/* Tension (Speed) Slider */}
      <div className="space-y-2 group">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest group-hover:text-cyan-400 transition-colors">
            String Tension (Speed²)
          </label>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-900/20 px-2 py-0.5 rounded">
            {(values.tension * 100).toFixed(0)}%
          </span>
        </div>
        <input 
          type="range" min="0.1" max="0.9" step="0.05"
          value={values.tension}
          onChange={(e) => setValue('tension', parseFloat(e.target.value))}
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
        />
        <p className="text-[10px] text-zinc-600">
          Controls the $c^2$ in the equation. Tighter string = Faster waves.
        </p>
      </div>

      {/* Damping Slider */}
      <div className="space-y-2 group">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest group-hover:text-orange-400 transition-colors">
            Damping (Friction)
          </label>
          <span className="text-xs font-mono text-orange-400 bg-orange-900/20 px-2 py-0.5 rounded">
            {(values.damping * 1000).toFixed(0)}
          </span>
        </div>
        <input 
          type="range" min="0" max="0.15" step="0.001"
          value={values.damping}
          onChange={(e) => setValue('damping', parseFloat(e.target.value))}
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400"
        />
        <p className="text-[10px] text-zinc-600">
          Energy loss per frame. Set to 0 for infinite bouncing.
        </p>
      </div>

      {/* Click Strength */}
      <div className="space-y-2 group">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest group-hover:text-pink-400 transition-colors">
            Pluck Strength
          </label>
          <span className="text-xs font-mono text-pink-400 bg-pink-900/20 px-2 py-0.5 rounded">
             {values.pulseForce.toFixed(0)} px
          </span>
        </div>
        <input 
          type="range" min="10" max="200" step="10"
          value={values.pulseForce}
          onChange={(e) => setValue('pulseForce', parseFloat(e.target.value))}
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-pink-500 hover:accent-pink-400"
        />
      </div>

    </div>

    {/* Bottom Bar: Interactions */}
    <div className="border-t border-zinc-800 pt-4 flex flex-col md:flex-row justify-between items-center gap-4">
      
      <div className="flex items-center gap-2 text-zinc-400 text-xs">
         <FaHandPointer className="animate-bounce text-cyan-400"/>
         <span><strong>Pro Tip:</strong> Click anywhere on the black screen to pluck the string!</span>
      </div>

      <div className="flex gap-4">
        {/* Wall Toggle */}
        <button
          onClick={() => setValue('wallType', values.wallType === 'fixed' ? 'free' : 'fixed')}
          className={`
            px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all
            ${values.wallType === 'free' 
              ? 'bg-red-500/10 text-red-400 border-red-500/50' 
              : 'bg-zinc-800 text-zinc-400 border-zinc-700'}
          `}
        >
           Wall: {values.wallType.toUpperCase()}
        </button>

        {/* Clear Button (Reset) */}
        <button
          onClick={() => {
             // We can't easily reset internal canvas ref state from here without complex hooks, 
             // but we can toggle a 'reset' value or just rely on user waiting for damping.
             // For this simple engine, we will just encourage High Damping to clear it.
             setValue('damping', 0.2);
             setTimeout(() => setValue('damping', 0.01), 200);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-bold text-zinc-300 transition-colors"
        >
          <FaTrash /> Calm String
        </button>
      </div>

    </div>

  </div>
);

// --- 5. Export ---
export const SIMULATION_5 = {
  title: '1D Wave Equation Solver',
  initialValues: { 
    tension: 0.5, 
    damping: 0.005, 
    pulseForce: 50,
    wallType: 'fixed' as const
  },
  achievements: achievements,
  renderSimulation: ({ values }: { values: StringState }) => (
    <StringCanvas values={values} />
  ),
  renderControls: renderWaveControls
};