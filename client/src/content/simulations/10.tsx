import React, { useEffect, useRef, useState } from 'react';
import { type Achievement } from '../../components/SimulationEngine';
import { FaShapes, FaLayerGroup, FaPlay, FaPause } from 'react-icons/fa';

// --- 1. Interface ---
interface FourierState {
  numTerms: number;   // How many circles/harmonics
  waveType: 'square' | 'sawtooth' | 'triangle';
  speed: number;
  radiusScale: number; // To zoom in/out
}

// --- 2. Achievements ---
const achievements: Achievement<FourierState>[] = [
  {
    id: '8-bit-sound',
    title: 'Retro Gamer',
    description: 'Select Square Wave with very few terms (N < 3). It sounds/looks like an old NES game.',
    condition: (s) => s.waveType === 'square' && s.numTerms <= 3
  },
  {
    id: 'high-definition',
    title: 'HD Remaster',
    description: 'Crank the terms to Max (50+). The lines become razor sharp.',
    condition: (s) => s.numTerms >= 50
  },
  {
    id: 'buzz-saw',
    title: 'The Buzz Saw',
    description: 'Switch to Sawtooth mode. Visually distinct and mathematically aggressive.',
    condition: (s) => s.waveType === 'sawtooth'
  },
  {
    id: 'triangle-force',
    title: 'Pyramid Power',
    description: 'Select Triangle wave. Notice how fast the little circles shrink compared to Square wave.',
    condition: (s) => s.waveType === 'triangle'
  }
];

// --- 3. Canvas Component ---
const FourierCanvas = ({ values }: { values: FourierState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Ref Pattern
  const valuesRef = useRef(values);
  useEffect(() => { valuesRef.current = values; }, [values]);

  // Data history for the wave trace
  const wavePathRef = useRef<number[]>([]);
  const timeRef = useRef(0);

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

      const { numTerms, waveType, speed, radiusScale } = valuesRef.current;
      
      timeRef.current += 0.02 * speed;
      const t = timeRef.current;

      // --- RENDER ---
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      // Setup positions
      const circleCenterX = width * 0.25;
      const circleCenterY = height / 2;
      const graphStartX = width * 0.5;

      // Draw Axes
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1;
      // Circle Axis
      ctx.beginPath(); ctx.moveTo(circleCenterX, 0); ctx.lineTo(circleCenterX, height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, circleCenterY); ctx.lineTo(width, circleCenterY); ctx.stroke();

      // --- CALCULATE FOURIER SERIES ---
      let x = circleCenterX;
      let y = circleCenterY;

      ctx.lineWidth = 1;

      for (let i = 0; i < numTerms; i++) {
        let prevX = x;
        let prevY = y;

        let n = 0;
        let radius = 0;
        let freq = 0; // relative to fundamental

        // MATH LOGIC
        if (waveType === 'square') {
           // Square: 4/PI * (sin(x) + sin(3x)/3 + sin(5x)/5...)
           // Only odd harmonics
           n = i * 2 + 1;
           radius = (radiusScale * 80) * (4 / (n * Math.PI));
           freq = n;
        } else if (waveType === 'sawtooth') {
           // Sawtooth: 2/PI * (sin(x) - sin(2x)/2 + sin(3x)/3...)
           // All harmonics, alternating signs
           n = i + 1;
           radius = (radiusScale * 80) * (2 / (n * Math.PI));
           // Alternate sign for even terms handled by phase or multiply
           if (i % 2 !== 0) radius = -radius; 
           freq = n;
        } else if (waveType === 'triangle') {
           // Triangle: 8/PI^2 * (sin(x) - sin(3x)/9 + sin(5x)/25...)
           // Odd harmonics, 1/n^2 falloff (shrinks fast!)
           n = i * 2 + 1;
           radius = (radiusScale * 80) * (8 / (Math.PI * Math.PI * n * n));
           // Alternating signs every other odd term (0->+, 1->-, 2->+, 3->-)
           if (i % 2 !== 0) radius = -radius; 
           freq = n;
        }

        // Calculate tip of this circle
        x += radius * Math.cos(freq * t);
        y += radius * Math.sin(freq * t);

        // Draw Circle
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'; // faint
        ctx.beginPath();
        ctx.arc(prevX, prevY, Math.abs(radius), 0, Math.PI * 2);
        ctx.stroke();

        // Draw Radius Arm (The clock hand)
        ctx.strokeStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      // --- DRAW CONNECTION TO GRAPH ---
      const waveVal = y; // The final y position is our sample
      
      // Store in history (unshift adds to front)
      wavePathRef.current.unshift(waveVal);
      // Limit history to screen width
      if (wavePathRef.current.length > 500) wavePathRef.current.pop();

      // Draw the connecting line (The "Laser")
      ctx.strokeStyle = '#facc15'; // Yellow
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(graphStartX, waveVal);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw The Wave Trace
      ctx.strokeStyle = waveType === 'square' ? '#22d3ee' : (waveType === 'sawtooth' ? '#ef4444' : '#a855f7');
      ctx.lineWidth = 3;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 10;
      ctx.beginPath();

      for (let i = 0; i < wavePathRef.current.length; i++) {
        // Map i to x position on graph
        const plotX = graphStartX + i; 
        const plotY = wavePathRef.current[i];
        if (i===0) ctx.moveTo(plotX, plotY);
        else ctx.lineTo(plotX, plotY);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // --- Draw "Tip" Glow ---
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// --- 4. Controls Component ---
const renderControls = ({ values, setValue }: { 
  values: FourierState; 
  setValue: (k: keyof FourierState, v: any) => void;
}) => (
  <div className="flex flex-col gap-6 max-w-5xl mx-auto">
    
    {/* Type Selection Tabs */}
    <div className="flex justify-center bg-zinc-900 p-1 rounded-xl w-fit mx-auto border border-zinc-800">
      {['square', 'sawtooth', 'triangle'].map((type) => (
        <button
          key={type}
          onClick={() => setValue('waveType', type)}
          className={`
            px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all
            ${values.waveType === type 
              ? 'bg-zinc-700 text-white shadow-lg' 
              : 'text-zinc-500 hover:text-zinc-300'}
          `}
        >
          {type}
        </button>
      ))}
    </div>

    {/* Main Sliders */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
      
      {/* Number of Terms */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
             <FaLayerGroup /> Term Count (N)
          </label>
          <span className="text-lg font-mono font-bold text-white">
            {values.numTerms}
          </span>
        </div>
        <input 
          type="range" min="1" max="100" step="1"
          value={values.numTerms}
          onChange={(e) => setValue('numTerms', parseFloat(e.target.value))}
          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
        />
        <p className="text-[10px] text-zinc-500">
          More terms = Sharper corners. Fewer terms = Wobbly "Gibbs" ears.
        </p>
      </div>

      {/* Speed Control */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-yellow-400 uppercase tracking-widest flex items-center gap-2">
             <FaPlay /> Rotation Speed
          </label>
          <span className="text-xs font-mono bg-yellow-900/20 px-2 py-1 rounded text-yellow-400">
            {values.speed.toFixed(1)}x
          </span>
        </div>
        <input 
          type="range" min="0" max="3.0" step="0.1"
          value={values.speed}
          onChange={(e) => setValue('speed', parseFloat(e.target.value))}
          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-500 hover:accent-yellow-400"
        />
      </div>

    </div>
  </div>
);

// --- 5. Export ---
export const SIMULATION_10 = {
  title: 'Fourier Series Machine',
  initialValues: { 
    numTerms: 3, 
    waveType: 'square' as const, 
    speed: 1.0,
    radiusScale: 1.0
  },
  achievements: achievements,
  renderSimulation: ({ values }: { values: FourierState }) => (
    <FourierCanvas values={values} />
  ),
  renderControls: renderControls
};