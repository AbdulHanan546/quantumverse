import React, { useEffect, useRef, useState } from 'react';
import { type Achievement } from "../../components/SimulationEngine";
import { FaWaveSquare, FaVolumeUp, FaVolumeMute, FaEye } from 'react-icons/fa';

// --- 1. Interface ---
interface SuperpositionState {
  ampA: number;    // Amplitude of Wave 1 (Red)
  freqA: number;   // Frequency of Wave 1
  ampB: number;    // Amplitude of Wave 2 (Blue)
  freqB: number;   // Frequency of Wave 2
  showComponents: boolean; // Show the Red/Blue ghost waves?
  speed: number;   // Simulation speed
}

// --- 2. Achievements ---
const achievements: Achievement<SuperpositionState>[] = [
  {
    id: 'constructive-chaos',
    title: 'Mega Wave',
    description: 'Max out both amplitudes. The result is bigger than the screen!',
    condition: (s) => s.ampA + s.ampB >= 190
  },
  {
    id: 'total-silence',
    title: 'Noise Cancelling',
    description: 'Set identical amps and freqs, but... wait, if they move opposite they will cancel periodically. Just try to set Amps equal.',
    condition: (s) => s.ampA === s.ampB && s.ampA > 50
  },
  {
    id: 'dj-beats',
    title: 'The Beat Drop',
    description: 'Set frequencies very close (e.g., 2.0 and 2.2). Watch the "Wah-Wah" amplitude modulation.',
    condition: (s) => Math.abs(s.freqA - s.freqB) < 0.3 && Math.abs(s.freqA - s.freqB) > 0.01
  },
  {
    id: 'solo-artist',
    title: 'Solo Performance',
    description: 'Turn one wave completely off (Amplitude 0).',
    condition: (s) => s.ampA === 0 || s.ampB === 0
  }
];

// --- 3. Canvas Component ---
const SuperpositionCanvas = ({ values }: { values: SuperpositionState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // 1. REF PATTERN: Store state in ref to decouple from render cycle
  const valuesRef = useRef(values);

  // Sync ref when props change
  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Time tracker
    let t = 0;
    let width = 0, height = 0;

    const animate = () => {
      // Handle Resize
      const parent = canvas.parentElement;
      if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
        width = parent.clientWidth;
        height = parent.clientHeight;
        canvas.width = width;
        canvas.height = height;
      }

      // Read latest values from Ref
      const { ampA, freqA, ampB, freqB, speed, showComponents } = valuesRef.current;
      
      t += 0.05 * speed;

      // --- RENDER ---
      ctx.fillStyle = '#09090b'; // Zinc 950
      ctx.fillRect(0, 0, width, height);

      const centerY = height / 2;
      
      // Draw Center Line
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY); ctx.lineTo(width, centerY);
      ctx.stroke();

      // Calculation constants
      // Wave 1 moves Right: (kx - wt)
      // Wave 2 moves Left:  (kx + wt)
      // k is proportional to freq for visual consistency here
      const kA = freqA * 0.1;
      const kB = freqB * 0.1;
      const wA = freqA * 0.2;
      const wB = freqB * 0.2;

      // --- DRAW COMPONENT WAVES (Ghost Mode) ---
      if (showComponents) {
        ctx.lineWidth = 2;
        
        // Wave A (Red)
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)'; // Red-500 low opacity
        ctx.beginPath();
        for(let x=0; x<width; x+=4) {
          const y = centerY + ampA * Math.sin(kA * x - wA * t);
          if(x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.stroke();

        // Wave B (Blue)
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)'; // Blue-500 low opacity
        ctx.beginPath();
        for(let x=0; x<width; x+=4) {
          const y = centerY + ampB * Math.sin(kB * x + wB * t);
          if(x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.stroke();
      }

      // --- DRAW RESULTANT WAVE (The Sum) ---
      // y_total = y1 + y2
      ctx.lineWidth = 4;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      
      // Gradient stroke for cool factor
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#a855f7'); // Purple start
      gradient.addColorStop(0.5, '#f472b6'); // Pink mid
      gradient.addColorStop(1, '#a855f7'); // Purple end
      
      ctx.strokeStyle = gradient;
      ctx.shadowColor = '#d946ef';
      ctx.shadowBlur = 15;

      ctx.beginPath();
      for (let x = 0; x < width; x+=2) {
        const y1 = ampA * Math.sin(kA * x - wA * t);
        const y2 = ampB * Math.sin(kB * x + wB * t);
        const yTotal = centerY + (y1 + y2);
        
        if (x === 0) ctx.moveTo(x, yTotal);
        else ctx.lineTo(x, yTotal);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // --- DRAW INTERFERENCE ZONES ---
      // Highlight areas of massive Constructive Interference
      // We check a few points to draw "sparks"
      // (Visual candy only, not strict physics calculation for every pixel)
      if (Math.random() > 0.90) {
        const randomX = Math.random() * width;
        const y1 = ampA * Math.sin(kA * randomX - wA * t);
        const y2 = ampB * Math.sin(kB * randomX + wB * t);
        // If both are large and same sign (constructive)
        if (Math.abs(y1 + y2) > (ampA + ampB) * 0.9 && (ampA+ampB) > 50) {
           ctx.fillStyle = '#fff';
           ctx.beginPath();
           ctx.arc(randomX, centerY + y1 + y2, 3, 0, Math.PI*2);
           ctx.fill();
        }
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []); // Empty dependency array = Loop runs forever, reading from Ref

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// --- 4. Controls Component ---
const renderControls = ({ values, setValue }: { 
  values: SuperpositionState; 
  setValue: (k: keyof SuperpositionState, v: any) => void;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">

    {/* LEFT DECK: Wave A (Red) */}
    <div className="bg-red-950/20 p-4 rounded-xl border border-red-900/50 space-y-4">
      <div className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-widest text-xs border-b border-red-900/50 pb-2">
         <FaWaveSquare /> WAVE A (Right)
      </div>
      
      {/* Amp A */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-red-300">
           <span>Amplitude</span>
           <span>{values.ampA.toFixed(0)}</span>
        </div>
        <input 
          type="range" min="0" max="100" step="1"
          value={values.ampA}
          onChange={(e) => setValue('ampA', parseFloat(e.target.value))}
          className="w-full h-1 bg-red-900/30 rounded-lg appearance-none cursor-pointer accent-red-500 hover:accent-red-400"
        />
      </div>

      {/* Freq A */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-red-300">
           <span>Frequency</span>
           <span>{values.freqA.toFixed(1)} Hz</span>
        </div>
        <input 
          type="range" min="0.5" max="5.0" step="0.1"
          value={values.freqA}
          onChange={(e) => setValue('freqA', parseFloat(e.target.value))}
          className="w-full h-1 bg-red-900/30 rounded-lg appearance-none cursor-pointer accent-red-500 hover:accent-red-400"
        />
      </div>
    </div>

    {/* CENTER DECK: Master Controls */}
    <div className="flex flex-col justify-between space-y-4">
       {/* Visualizer Toggle */}
       <button
        onClick={() => setValue('showComponents', !values.showComponents)}
        className={`
          flex-1 flex items-center justify-center gap-2 rounded-xl border transition-all
          ${values.showComponents 
            ? 'bg-zinc-800 text-white border-zinc-600 shadow-lg' 
            : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:bg-zinc-800'}
        `}
       >
         <FaEye /> {values.showComponents ? 'HIDE SOURCES' : 'REVEAL SOURCES'}
       </button>
       
       <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 text-center">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
            Time Speed
          </label>
          <input 
            type="range" min="0" max="3.0" step="0.1"
            value={values.speed}
            onChange={(e) => setValue('speed', parseFloat(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
          />
       </div>
    </div>

    {/* RIGHT DECK: Wave B (Blue) */}
    <div className="bg-blue-950/20 p-4 rounded-xl border border-blue-900/50 space-y-4">
      <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-widest text-xs border-b border-blue-900/50 pb-2">
         <FaWaveSquare /> WAVE B (Left)
      </div>
      
      {/* Amp B */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-blue-300">
           <span>Amplitude</span>
           <span>{values.ampB.toFixed(0)}</span>
        </div>
        <input 
          type="range" min="0" max="100" step="1"
          value={values.ampB}
          onChange={(e) => setValue('ampB', parseFloat(e.target.value))}
          className="w-full h-1 bg-blue-900/30 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
        />
      </div>

      {/* Freq B */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-blue-300">
           <span>Frequency</span>
           <span>{values.freqB.toFixed(1)} Hz</span>
        </div>
        <input 
          type="range" min="0.5" max="5.0" step="0.1"
          value={values.freqB}
          onChange={(e) => setValue('freqB', parseFloat(e.target.value))}
          className="w-full h-1 bg-blue-900/30 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
        />
      </div>
    </div>

  </div>
);

// --- 5. Export ---
export const SIMULATION_7 = {
  title: 'Principle of Superposition',
  initialValues: { 
    ampA: 50, 
    freqA: 1.0, 
    ampB: 50, 
    freqB: 1.0, 
    speed: 1.0,
    showComponents: true
  },
  achievements: achievements,
  renderSimulation: ({ values }: { values: SuperpositionState }) => (
    <SuperpositionCanvas values={values} />
  ),
  renderControls: renderControls
};