import React, { useEffect, useRef, useCallback } from 'react';
import { type Achievement } from '../../components/SimulationEngine';
import { FaWeightHanging, FaBolt, FaExchangeAlt, FaRedo } from 'react-icons/fa';

// --- 1. Interface ---
interface MediumState {
  density1: number;   // Linear density of Left String (mu)
  density2: number;   // Linear density of Right String (mu)
  tension: number;    // Global Tension (T)
  pulseWidth: number; // Sharpness of the pulse
}

// --- 2. Achievements ---
const achievements: Achievement<MediumState>[] = [
  {
    id: 'invisible-seam',
    title: 'Phantom Knot',
    description: 'Make both strings exactly the same density. The wave passes through without reflecting.',
    condition: (s) => Math.abs(s.density1 - s.density2) < 0.1
  },
  {
    id: 'brick-wall',
    title: 'The Brick Wall',
    description: 'Set Medium 2 to Max Density (Concrete) and Medium 1 to Min (Thread). Huge inverted reflection!',
    condition: (s) => s.density2 >= 9.0 && s.density1 <= 1.5
  },
  {
    id: 'free-end',
    title: 'The Whip Crack',
    description: 'Heavy string into Light string. The wave speeds up and does NOT invert!',
    condition: (s) => s.density1 >= 8.0 && s.density2 <= 2.0
  },
  {
    id: 'high-tension',
    title: 'Fiber Optic',
    description: 'Max out the Tension. Speed is life.',
    condition: (s) => s.tension >= 4.5
  }
];

// --- 3. Canvas Component ---
const MediumCanvas = ({ values }: { values: MediumState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Simulation Constants
  const RESOLUTION = 150; // More points for smoother transition
  const BOUNDARY = Math.floor(RESOLUTION / 2); // The knot is in the middle
  
  // Physics Arrays
  const currentRef = useRef<Float32Array>(new Float32Array(RESOLUTION).fill(0));
  const prevRef = useRef<Float32Array>(new Float32Array(RESOLUTION).fill(0));
  const speedMapRef = useRef<Float32Array>(new Float32Array(RESOLUTION).fill(0));

  // Pulse Helper
  const spawnPulse = useCallback(() => {
    // Spawn at index 10 (Left side)
    const startIdx = 15;
    const width = values.pulseWidth;
    for (let i = -width; i <= width; i++) {
      const idx = startIdx + i;
      if (idx > 0 && idx < RESOLUTION) {
        // Gaussian pulse
        const val = 80 * Math.exp(-(i*i)/(2*(width/2)*(width/2))); // Amplitude 80
        currentRef.current[idx] += val;
        prevRef.current[idx] += val; // Initial velocity 0
      }
    }
  }, [values.pulseWidth]);

  // Reset
  const resetString = useCallback(() => {
    currentRef.current.fill(0);
    prevRef.current.fill(0);
  }, []);

  // Expose triggers to window for buttons (Hack for this architecture)
  useEffect(() => {
    // @ts-ignore
    window.spawnMediumPulse = spawnPulse;
    // @ts-ignore
    window.resetMedium = resetString;
  }, [spawnPulse, resetString]);

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

      // --- PHYSICS UPDATE ---
      
      // 1. Build the Speed Map (c^2)
      // v = sqrt(T / mu) -> c^2 = T / mu
      // We precompute this because it changes abruptly at the boundary
      const c2_1 = values.tension / values.density1;
      const c2_2 = values.tension / values.density2;

      // Smooth the transition slightly to avoid numerical explosion at the sharp step
      for(let i=0; i<RESOLUTION; i++) {
        if (i < BOUNDARY) speedMapRef.current[i] = c2_1;
        else speedMapRef.current[i] = c2_2;
      }
      
      // 2. Wave Equation Solver
      const u = currentRef.current;
      const uPrev = prevRef.current;
      const nextU = new Float32Array(RESOLUTION);
      const cMap = speedMapRef.current;

      // Damping factor to prevent infinite energy buildup
      const damp = 0.995; 

      for (let i = 1; i < RESOLUTION - 1; i++) {
        // Standard Finite Difference
        const laplacian = u[i+1] - 2*u[i] + u[i-1];
        
        // Courant stability check roughly (c^2 must be < 1.0)
        // Our sliders limit T and mu to keep this safe-ish.
        
        let val = (2 * u[i]) - uPrev[i] + (cMap[i] * laplacian);
        val *= damp; 
        nextU[i] = val;
      }
      
      // Fixed ends
      nextU[0] = 0;
      nextU[RESOLUTION-1] = 0;

      // Swap
      prevRef.current.set(u);
      currentRef.current.set(nextU);

      // --- RENDER ---
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      const centerY = height / 2;
      const segWidth = width / RESOLUTION;

      // Draw The "Knot" (Boundary Line)
      const boundaryX = BOUNDARY * segWidth;
      ctx.strokeStyle = '#3f3f46';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(boundaryX, 0); ctx.lineTo(boundaryX, height);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Label the mediums
      ctx.font = 'bold 40px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#18181b'; // subtle background text
      ctx.fillText("MEDIUM 1", boundaryX / 2, centerY);
      ctx.fillText("MEDIUM 2", boundaryX + (boundaryX/2), centerY);


      // Draw String
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      // We draw in two passes to show thickness difference
      
      // PASS 1: Left String
      ctx.beginPath();
      // Thickness visual based on density
      ctx.lineWidth = 2 + (values.density1 * 1.5); 
      ctx.strokeStyle = '#22d3ee'; // Cyan
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 10;
      
      for (let i = 0; i <= BOUNDARY; i++) {
        const x = i * segWidth;
        const y = centerY - nextU[i];
        if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.stroke();

      // PASS 2: Right String
      ctx.beginPath();
      ctx.lineWidth = 2 + (values.density2 * 1.5);
      ctx.strokeStyle = '#f472b6'; // Pink
      ctx.shadowColor = '#f472b6';
      
      for (let i = BOUNDARY; i < RESOLUTION; i++) {
        const x = i * segWidth;
        const y = centerY - nextU[i];
        if (i===BOUNDARY) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw Knot Point
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(boundaryX, centerY - nextU[BOUNDARY], 4, 0, Math.PI*2);
      ctx.fill();

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [values.tension, values.density1, values.density2]);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// --- 4. Controls Component ---
const renderMediumControls = ({ values, setValue }: { 
  values: MediumState; 
  setValue: (k: keyof MediumState, v: any) => void;
}) => (
  <div className="flex flex-col gap-6 max-w-6xl mx-auto">
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
      
      {/* Left Medium Density */}
      <div className="space-y-2 group p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
        <div className="flex justify-between items-center mb-2">
          <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
            Medium 1 Density
          </label>
          <FaWeightHanging className="text-cyan-500"/>
        </div>
        <input 
          type="range" min="1" max="10" step="0.5"
          value={values.density1}
          onChange={(e) => setValue('density1', parseFloat(e.target.value))}
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
        />
        <div className="text-right text-xs font-mono text-zinc-500">{values.density1.toFixed(1)} kg/m</div>
      </div>

      {/* Global Tension */}
      <div className="space-y-2 group p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
        <div className="flex justify-between items-center mb-2">
          <label className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest">
            Rope Tension
          </label>
          <FaBolt className="text-yellow-500"/>
        </div>
        <input 
          type="range" min="1.0" max="5.0" step="0.1"
          value={values.tension}
          onChange={(e) => setValue('tension', parseFloat(e.target.value))}
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-500 hover:accent-yellow-400"
        />
        <div className="text-right text-xs font-mono text-zinc-500">{values.tension.toFixed(1)} N</div>
      </div>

      {/* Right Medium Density */}
      <div className="space-y-2 group p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
        <div className="flex justify-between items-center mb-2">
          <label className="text-[10px] font-bold text-pink-400 uppercase tracking-widest">
            Medium 2 Density
          </label>
          <FaWeightHanging className="text-pink-500"/>
        </div>
        <input 
          type="range" min="1" max="10" step="0.5"
          value={values.density2}
          onChange={(e) => setValue('density2', parseFloat(e.target.value))}
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-pink-500 hover:accent-pink-400"
        />
        <div className="text-right text-xs font-mono text-zinc-500">{values.density2.toFixed(1)} kg/m</div>
      </div>

    </div>

    {/* Action Bar */}
    <div className="flex justify-center gap-4 border-t border-zinc-800 pt-6">
      <button
        // @ts-ignore
        onClick={() => window.spawnMediumPulse && window.spawnMediumPulse()}
        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg text-white font-bold shadow-lg hover:shadow-cyan-500/20 hover:scale-105 transition-all"
      >
        <FaExchangeAlt /> FIRE PULSE
      </button>

      <button
        // @ts-ignore
        onClick={() => window.resetMedium && window.resetMedium()}
        className="flex items-center gap-2 px-6 py-3 bg-zinc-800 text-zinc-400 rounded-lg font-bold hover:bg-zinc-700 hover:text-white transition-all"
      >
        <FaRedo /> Reset
      </button>
    </div>
    
    <div className="text-center text-[10px] text-zinc-600 font-mono mt-2">
      v = √(Tension / Density) • Higher Density = Slower Wave
    </div>

  </div>
);

// --- 5. Export ---
export const SIMULATION_6 = {
  title: 'Wave Speed & The Medium',
  initialValues: { 
    density1: 1.0, 
    density2: 4.0, 
    tension: 3.0,
    pulseWidth: 6
  },
  achievements: achievements,
  renderSimulation: ({ values }: { values: MediumState }) => (
    <MediumCanvas values={values} />
  ),
  renderControls: renderMediumControls
};