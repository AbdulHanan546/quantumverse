import React, { useEffect, useRef } from 'react';
import { type Achievement } from "../../components/SimulationEngine";
import { FaBroadcastTower, FaMusic, FaWaveSquare, FaEquals, FaTimes } from 'react-icons/fa';

// --- 1. Interface ---
interface BeatsState {
  carrierFreq: number; // The main fast wave
  modFreq: number;     // The slow "wobble" (Difference in Beats, Signal in AM)
  mode: 'beats' | 'am'; // The Math Logic
  showEnvelope: boolean; // Visual guide
  speed: number;
}

// --- 2. Achievements ---
const achievements: Achievement<BeatsState>[] = [
  {
    id: 'tuning-fork',
    title: 'Perfectly Tuned',
    description: 'Set the Wobble (Difference) to 0 in Beats mode. The pulsing stops.',
    condition: (s) => s.mode === 'beats' && s.modFreq === 0
  },
  {
    id: 'dubstep-wobble',
    title: 'Wub Wub Wub',
    description: 'Create a slow, heavy beat (Wobble ~ 1-2 Hz).',
    condition: (s) => s.modFreq >= 1.0 && s.modFreq <= 2.0
  },
  {
    id: 'radio-operator',
    title: 'On The Air',
    description: 'Switch to AM Radio mode to transmit a signal.',
    condition: (s) => s.mode === 'am'
  },
  {
    id: 'shape-rotator',
    title: 'Envelope Hunter',
    description: 'Turn on the visual envelope guide.',
    condition: (s) => s.showEnvelope
  }
];

// --- 3. Canvas Component ---
const BeatsCanvas = ({ values }: { values: BeatsState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Ref Pattern
  const valuesRef = useRef(values);
  useEffect(() => { valuesRef.current = values; }, [values]);

  // Global time accumulator
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

      // Physics State
      const { carrierFreq, modFreq, mode, showEnvelope, speed } = valuesRef.current;
      timeRef.current += 0.05 * speed;
      const t = timeRef.current;

      // --- RENDER ---
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      const centerY = height / 2;
      
      // Draw Grid
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY); ctx.lineTo(width, centerY);
      ctx.stroke();

      // --- CALCULATE & DRAW WAVE ---
      
      const amplitude = 50; 
      // Frequencies scaled for visual clarity
      const fC = carrierFreq * 0.2; 
      const fM = modFreq * 0.2;

      ctx.beginPath();
      ctx.lineWidth = 3;
      
      // Color depends on mode
      const mainColor = mode === 'beats' ? '#22d3ee' : '#facc15'; // Cyan (Beats) vs Yellow (AM)
      ctx.strokeStyle = mainColor;
      ctx.shadowColor = mainColor;
      ctx.shadowBlur = 10;

      // Arrays to store peak points for envelope drawing
      const upperEnvelope: {x:number, y:number}[] = [];
      const lowerEnvelope: {x:number, y:number}[] = [];

      for (let x = 0; x < width; x+=2) {
        // x acts as a spatial offset, but also we animate t
        // To show the "Pattern" clearly, we usually map x to time or phase
        const phase = x * 0.05; // Spatial frequency
        
        let y = 0;

        if (mode === 'beats') {
          // BEATS: Addition of two waves
          const w1 = Math.sin(fC * (phase - t));
          const w2 = Math.sin((fC + fM) * (phase - t));
          y = amplitude * (w1 + w2); // Max amplitude becomes 2*A
        } else {
          // AM: Multiplication
          // (1 + m*sin(modFreq)) * sin(carrier)
          const signal = 1 + Math.sin(fM * (phase - t)); 
          const carrier = Math.sin(fC * (phase - t));
          y = amplitude * signal * carrier;
        }

        const drawY = centerY + y;
        if(x===0) ctx.moveTo(x, drawY); else ctx.lineTo(x, drawY);

        // Capture points for envelope (approximate sampling)
        if (showEnvelope && x % 5 === 0) {
          let envH = 0;
          if (mode === 'beats') {
             // Envelope of sin(A)+sin(B) is 2*cos((A-B)/2)
             envH = 2 * amplitude * Math.cos((fM/2) * (phase - t));
          } else {
             // Envelope of (1+sin)*sin is (1+sin)
             envH = amplitude * (1 + Math.sin(fM * (phase - t)));
          }
          upperEnvelope.push({x, y: centerY - Math.abs(envH)});
          lowerEnvelope.push({x, y: centerY + Math.abs(envH)});
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // --- DRAW ENVELOPE (The Shape) ---
      if (showEnvelope) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.globalAlpha = 0.5;
        
        // Upper
        ctx.beginPath();
        upperEnvelope.forEach((p, i) => {
          if(i===0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();

        // Lower
        ctx.beginPath();
        lowerEnvelope.forEach((p, i) => {
          if(i===0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
        
        ctx.setLineDash([]);
        ctx.globalAlpha = 1.0;
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// --- 4. Controls Component ---
const renderControls = ({ values, setValue }: { 
  values: BeatsState; 
  setValue: (k: keyof BeatsState, v: any) => void;
}) => (
  <div className="flex flex-col gap-6 max-w-5xl mx-auto">

    {/* Top Row: Mode Switcher */}
    <div className="flex justify-center gap-4">
       <button
         onClick={() => setValue('mode', 'beats')}
         className={`
           flex items-center gap-3 px-6 py-4 rounded-xl border transition-all duration-300 w-48 justify-center
           ${values.mode === 'beats' 
             ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]' 
             : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:bg-zinc-750'}
         `}
       >
         <div className="text-xl"><FaMusic /></div>
         <div className="text-left">
           <div className="text-[10px] font-bold uppercase tracking-wider">Physics</div>
           <div className="font-bold">Beats</div>
         </div>
       </button>

       <button
         onClick={() => setValue('mode', 'am')}
         className={`
           flex items-center gap-3 px-6 py-4 rounded-xl border transition-all duration-300 w-48 justify-center
           ${values.mode === 'am' 
             ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.2)]' 
             : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:bg-zinc-750'}
         `}
       >
         <div className="text-xl"><FaBroadcastTower /></div>
         <div className="text-left">
           <div className="text-[10px] font-bold uppercase tracking-wider">Radio</div>
           <div className="font-bold">AM Wave</div>
         </div>
       </button>
    </div>

    {/* Sliders Area */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
      
      {/* Carrier Frequency */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
             Main Frequency (Carrier)
          </label>
          <span className="text-xs font-mono bg-zinc-800 px-2 py-1 rounded text-zinc-300">
            {values.carrierFreq.toFixed(1)} Hz
          </span>
        </div>
        <input 
          type="range" min="1.0" max="8.0" step="0.1"
          value={values.carrierFreq}
          onChange={(e) => setValue('carrierFreq', parseFloat(e.target.value))}
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-500 hover:accent-white"
        />
        <p className="text-[10px] text-zinc-600">The fast inner squiggle.</p>
      </div>

      {/* Modulator Frequency */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className={`text-xs font-bold uppercase tracking-widest ${values.mode === 'beats' ? 'text-cyan-400' : 'text-yellow-400'}`}>
             {values.mode === 'beats' ? 'Difference (Beat Freq)' : 'Signal (Message Freq)'}
          </label>
          <span className={`text-xs font-mono px-2 py-1 rounded ${values.mode === 'beats' ? 'bg-cyan-900/20 text-cyan-400' : 'bg-yellow-900/20 text-yellow-400'}`}>
            {values.modFreq.toFixed(1)} Hz
          </span>
        </div>
        <input 
          type="range" min="0" max="3.0" step="0.1"
          value={values.modFreq}
          onChange={(e) => setValue('modFreq', parseFloat(e.target.value))}
          className={`w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer ${values.mode === 'beats' ? 'accent-cyan-500' : 'accent-yellow-500'}`}
        />
        <p className="text-[10px] text-zinc-600">
          {values.mode === 'beats' 
            ? 'How much the two sounds differ. 0 = Unison.' 
            : 'The frequency of the music being sent over the radio.'}
        </p>
      </div>

    </div>

    {/* Bottom Toggles */}
    <div className="flex justify-center">
       <button
        onClick={() => setValue('showEnvelope', !values.showEnvelope)}
        className={`
          px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all
          ${values.showEnvelope 
            ? 'bg-white/10 text-white border-white/30' 
            : 'bg-zinc-800 text-zinc-500 border-zinc-800'}
        `}
       >
         {values.showEnvelope ? 'Hide Envelope' : 'Show Envelope'}
       </button>
    </div>

  </div>
);

// --- 5. Export ---
export const SIMULATION_9 = {
  title: 'Beats & Amplitude Modulation',
  initialValues: { 
    carrierFreq: 4.0, 
    modFreq: 0.5, 
    mode: 'beats' as const,
    showEnvelope: true,
    speed: 1.0
  },
  achievements: achievements,
  renderSimulation: ({ values }: { values: BeatsState }) => (
    <BeatsCanvas values={values} />
  ),
  renderControls: renderControls
};