import React, { useEffect, useRef } from 'react';
import { type Achievement } from "../../components/SimulationEngine";
import { FaRunning, FaLayerGroup, FaHistory, FaCompressArrowsAlt } from 'react-icons/fa';

// --- 1. Interface ---
interface DispersionState {
  dispersionFactor: number; // How much speed depends on frequency
  initialWidth: number;     // Starting size (Sigma)
  centerFreq: number;       // k0
  isRacing: boolean;        // Play/Pause
}

// --- 2. Achievements ---
const achievements: Achievement<DispersionState>[] = [
  {
    id: 'fiber-optic',
    title: 'Fiber Optic Grade',
    description: 'Set Dispersion to 0. The packet travels forever without changing shape (Soliton-like behavior).',
    condition: (s) => s.dispersionFactor === 0 && s.isRacing
  },
  {
    id: 'prism-break',
    title: 'The Prism',
    description: 'Max out dispersion. The packet falls apart almost immediately.',
    condition: (s) => s.dispersionFactor >= 0.9
  },
  {
    id: 'quantum-limit',
    title: 'Short Pulse Problem',
    description: 'Set the Initial Width to minimum. Notice how much FASTER it spreads? (Uncertainty Principle).',
    condition: (s) => s.initialWidth <= 20 && s.dispersionFactor > 0.5
  },
  {
    id: 'chirped-pulse',
    title: 'The Chirp',
    description: 'Wait until the pulse is very wide (>300px). Look closely: ripples at the front are different from the back.',
    condition: (s) => s.dispersionFactor > 0.5 && s.isRacing
  }
];

// --- 3. Canvas Component ---
const DispersionCanvas = ({ values }: { values: DispersionState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- NEW: requestRef to store animationFrame ---
  const requestRef = useRef<number>();

  // Ref Pattern
  const valuesRef = useRef(values);
  useEffect(() => { valuesRef.current = values; }, [values]);

  // Simulation Time
  const timeRef = useRef(0);

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

      const { dispersionFactor, initialWidth, centerFreq, isRacing } = valuesRef.current;
      
      if (isRacing) {
        timeRef.current += 0.03;
      }

      const t = timeRef.current;
      
      const v_group_base = 2.0;
      const centerPos = (100 + v_group_base * t * 20) % (width + 400) - 200;

      if (centerPos < -150 && t > 5) {
         timeRef.current = 0; 
      }

      const spreadRate = (dispersionFactor * 5) / (initialWidth * 0.1); 
      const currentWidth = initialWidth * Math.sqrt(1 + (spreadRate * t)**2);
      const currentAmp = 120 * (initialWidth / currentWidth);

      // --- RENDER ---
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);
      
      const splitY = height * 0.6;

      const midY1 = splitY / 2;
      ctx.strokeStyle = '#27272a';
      ctx.beginPath(); ctx.moveTo(0, midY1); ctx.lineTo(width, midY1); ctx.stroke();
      
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();

      const startDraw = Math.max(0, centerPos - currentWidth * 3);
      const endDraw = Math.min(width, centerPos + currentWidth * 3);

      for(let x=startDraw; x<endDraw; x+=4) {
         const dx = x - centerPos;
         const env = currentAmp * Math.exp(-(dx*dx)/(2*currentWidth*currentWidth));
         if(x===startDraw) ctx.moveTo(x, midY1 - env); else ctx.lineTo(x, midY1 - env);
      }
      for(let x=endDraw; x>=startDraw; x-=4) {
         const dx = x - centerPos;
         const env = currentAmp * Math.exp(-(dx*dx)/(2*currentWidth*currentWidth));
         ctx.lineTo(x, midY1 + env);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = (currentAmp < 10) ? 0 : 10;
      ctx.beginPath();

      for(let x=startDraw; x<endDraw; x+=2) {
         const dx = x - centerPos;
         const env = currentAmp * Math.exp(-(dx*dx)/(2*currentWidth*currentWidth));
         const chirpStrength = dispersionFactor * 0.005; 
         const phase = (centerFreq * dx) + (0.5 * chirpStrength * dx * dx);
         const val = env * Math.cos(phase);
         if(x===startDraw) ctx.moveTo(x, midY1 - val); else ctx.lineTo(x, midY1 - val);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#facc15';
      ctx.font = '12px monospace';
      ctx.fillText("PHYSICAL SPACE (x)", 20, 20);
      if (currentWidth > initialWidth * 3) {
        ctx.fillStyle = '#ef4444';
        ctx.fillText("SIGNAL LOST (TOO WIDE)", width - 180, 20);
      }

      const midY2 = splitY + (height - splitY)/2;
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, splitY, width, height - splitY);
      ctx.strokeStyle = '#3f3f46';
      ctx.beginPath(); ctx.moveTo(0, splitY); ctx.lineTo(width, splitY); ctx.stroke();

      const v0 = 2.0; 
      const drawRunner = (color: string, k_offset: number, label: string, yOff: number) => {
         const v_comp = v0 + (k_offset * dispersionFactor * 2.0);
         const pos = (100 + v_comp * t * 20) % (width + 400) - 200;
         if (pos > -20 && pos < width + 20) {
           ctx.fillStyle = color;
           ctx.beginPath();
           ctx.arc(pos, midY2 + yOff, 8, 0, Math.PI*2);
           ctx.fill();
           ctx.strokeStyle = color;
           ctx.lineWidth = 2;
           ctx.beginPath();
           ctx.moveTo(pos, midY2 + yOff);
           ctx.lineTo(pos - 40, midY2 + yOff);
           ctx.stroke();
           ctx.fillStyle = '#fff';
           ctx.font = '10px sans-serif';
           ctx.fillText(label, pos + 12, midY2 + yOff + 4);
         }
      };

      drawRunner('#3b82f6', 1, "High Freq (Blue)", -30);
      drawRunner('#22c55e', 0, "Center (Green)", 0);
      drawRunner('#ef4444', -1, "Low Freq (Red)", 30);

      ctx.fillStyle = '#71717a';
      ctx.fillText("COMPONENT RACE (High Freqs run faster)", 20, splitY + 20);

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// --- 4. Controls Component ---
const renderControls = ({ values, setValue }: { 
  values: DispersionState; 
  setValue: (k: keyof DispersionState, v: any) => void;
}) => (
  <div className="flex flex-col gap-6 max-w-6xl mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-pink-400 uppercase tracking-widest flex items-center gap-2">
             <FaLayerGroup /> Material Dispersion
          </label>
          <span className="text-xs font-mono bg-pink-900/20 text-pink-300 px-2 py-1 rounded">
            {(values.dispersionFactor * 100).toFixed(0)}%
          </span>
        </div>
        <input 
          type="range" min="0" max="1.0" step="0.05"
          value={values.dispersionFactor}
          onChange={(e) => setValue('dispersionFactor', parseFloat(e.target.value))}
          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-pink-500 hover:accent-pink-400"
        />
        <p className="text-[10px] text-zinc-500">
          0% = Vacuum (No Spread). 100% = Prism/Glass (Fast Spread).
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
             <FaCompressArrowsAlt /> Initial Pulse Width
          </label>
          <span className="text-xs font-mono bg-cyan-900/20 text-cyan-300 px-2 py-1 rounded">
            {values.initialWidth.toFixed(0)} px
          </span>
        </div>
        <input 
          type="range" min="15" max="100" step="5"
          value={values.initialWidth}
          onChange={(e) => setValue('initialWidth', parseFloat(e.target.value))}
          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
        />
        <p className="text-[10px] text-zinc-500">
          Warning: Making the pulse too narrow initially will make it disperse FASTER!
        </p>
      </div>
    </div>

    <div className="flex justify-center gap-4">
       <button
         onClick={() => { setValue('isRacing', !values.isRacing); }}
         className={`
           px-8 py-3 rounded-lg font-bold uppercase tracking-widest transition-all flex items-center gap-2
           ${values.isRacing 
             ? 'bg-red-500/10 text-red-400 border border-red-500/50' 
             : 'bg-green-500/10 text-green-400 border border-green-500/50'}
         `}
       >
         {values.isRacing ? 'Pause Time' : 'Start Race'}
       </button>
       
       <button
          onClick={() => { setValue('isRacing', false); }}
          className="px-6 py-3 rounded-lg bg-zinc-800 text-zinc-400 font-bold hover:bg-zinc-700 transition-all flex items-center gap-2"
       >
         <FaHistory /> Stop & Reset
       </button>
    </div>
  </div>
);

// --- 5. Export ---
export const SIMULATION_12 = {
  title: 'Wave Dispersion (The Prism Effect)',
  initialValues: { 
    dispersionFactor: 0.5, 
    initialWidth: 40, 
    centerFreq: 0.3,
    isRacing: true
  },
  achievements: achievements,
  renderSimulation: ({ values }: { values: DispersionState }) => (
    <DispersionCanvas values={values} />
  ),
  renderControls: renderControls
};
