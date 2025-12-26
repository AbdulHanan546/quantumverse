import React, { useEffect, useRef, useState } from 'react';
import { type Achievement } from "../../components/SimulationEngine";
import { FaExclamationTriangle, FaChartLine, FaMagnet } from 'react-icons/fa';

// --- 1. Interface ---
interface ResonanceState {
  naturalFreq: number;  // The system's "favorite" speed
  drivingFreq: number;  // How fast we push it
  damping: number;      // Friction (Safety mechanism)
  amplitude: number;    // Current Max Amplitude (Tracked for achievements)
}

// --- 2. Achievements ---
const achievements: Achievement<ResonanceState>[] = [
  {
    id: 'tacoma-narrows',
    title: 'Bridge Destroyer',
    description: 'Hit Resonance! Make the Amplitude exceed 180px.',
    condition: (s) => s.amplitude > 180
  },
  {
    id: 'out-of-sync',
    title: 'Bad Vibes',
    description: 'Set Driving Freq far from Natural Freq (> 1.0 diff). The system barely moves.',
    condition: (s) => Math.abs(s.naturalFreq - s.drivingFreq) > 1.0 && s.amplitude < 20
  },
  {
    id: 'frictionless',
    title: 'Danger Zone',
    description: 'Set Damping to minimum (0.01). If you hit resonance now, it goes to infinity!',
    condition: (s) => s.damping <= 0.005
  },
  {
    id: 'beat-phenomenon',
    title: 'The Beat',
    description: 'Set driving frequency VERY close to natural (diff < 0.2 but not 0). Watch the amplitude grow and shrink cyclically.',
    condition: (s) => {
      const diff = Math.abs(s.naturalFreq - s.drivingFreq);
      return diff > 0 && diff < 0.2;
    }
  }
];

// --- 3. Canvas Component ---
const ResonanceCanvas = ({ values }: { values: ResonanceState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const valuesRef = useRef(values);
  const requestRef = useRef<number>();

  // Physics State (Internal)
  const physicsRef = useRef({
    y: 0,    // Position of mass (relative to rest)
    v: 0,    // Velocity
    t: 0,    // Time
    maxAmp: 0 // Peak tracker
  });

  // Graph History
  const historyRef = useRef<number[]>([]);

  useEffect(() => { valuesRef.current = values; }, [values]);

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

      const { naturalFreq, drivingFreq, damping } = valuesRef.current;
      const state = physicsRef.current;

      // --- PHYSICS ENGINE (Euler-Cromer) ---
      const dt = 0.05;
      
      // 1. Calculate Forces
      // F_spring = -k * y  (where k = w_n^2 for unit mass)
      // F_damping = -c * v
      // F_drive = F0 * cos(w_d * t)
      
      const k = naturalFreq * naturalFreq; 
      const F_spring = -k * state.y;
      const F_damp = -damping * state.v;
      const F_drive = 10 * Math.cos(drivingFreq * state.t); // Driving Force Amplitude = 10
      
      const accel = F_spring + F_damp + F_drive;
      
      state.v += accel * dt;
      state.y += state.v * dt;
      state.t += dt;

      // Track Max Amplitude for Achievement checking
      if (Math.abs(state.y) > state.maxAmp) {
        state.maxAmp = Math.abs(state.y);
        // Sync back to React state occasionally? 
        // For this engine pattern, we usually update specific tracking props or rely on the achievement checker reading 'values'
        // But 'values' is input. We need to output 'amplitude'.
        // HACK: We inject into valuesRef for the checker to see, 
        // normally we'd use a callback, but this keeps the loop tight.
        // @ts-ignore
        valuesRef.current.amplitude = state.maxAmp; 
      }
      
      // Decay maxAmp slowly so user can retry
      state.maxAmp *= 0.995;

      // Graph History
      if (state.t % 0.5 < 0.05) { // Sample every few frames
        historyRef.current.push(Math.abs(state.y));
        if (historyRef.current.length > 200) historyRef.current.shift();
      }


      // --- RENDER ---
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);
      
      const centerX = width * 0.3; // System on left
      const centerY = height / 2;

      // 1. The Driving Piston (Top)
      // The "ceiling" moves to show the driving force physically
      const pistonY = centerY - 150 + (20 * Math.cos(drivingFreq * state.t));
      
      ctx.fillStyle = '#ef4444'; // Red Driver
      ctx.fillRect(centerX - 40, pistonY - 10, 80, 20);
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText("DRIVER", centerX - 20, pistonY - 15);

      // 2. The Spring
      const massY = centerY + state.y;
      
      ctx.beginPath();
      ctx.strokeStyle = '#71717a';
      ctx.lineWidth = 4;
      const coils = 12;
      const springLength = massY - (pistonY + 10);
      const coilH = springLength / coils;
      
      ctx.moveTo(centerX, pistonY + 10);
      for(let i=1; i<=coils; i++) {
        const xOffset = i%2===0 ? -15 : 15;
        ctx.lineTo(centerX + xOffset, (pistonY+10) + i*coilH);
      }
      ctx.lineTo(centerX, massY);
      ctx.stroke();

      // 3. The Mass (Blue)
      // Color changes to RED if amplitude is dangerous
      const isDangerous = Math.abs(state.y) > 150;
      ctx.fillStyle = isDangerous ? '#ef4444' : '#3b82f6';
      
      const size = 50;
      ctx.fillRect(centerX - size/2, massY, size, size);
      
      // Face on the block (fun detail)
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      if (isDangerous) {
        // Scared face 0_0
        ctx.beginPath(); ctx.arc(centerX-10, massY+20, 5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(centerX+10, massY+20, 5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(centerX, massY+40, 5, 8, 0, 0, Math.PI*2); ctx.fill();
      } else {
        // Chill face -_-
        ctx.fillRect(centerX-15, massY+20, 10, 3);
        ctx.fillRect(centerX+5, massY+20, 10, 3);
        ctx.fillRect(centerX-5, massY+35, 10, 2);
      }

      // 4. The Graph (Right Side)
      const graphX = width * 0.6;
      const graphW = width * 0.35;
      const graphH = 200;
      const graphTop = centerY - 100;
      const graphBottom = centerY + 100;

      // Draw Axes
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(graphX, graphTop); ctx.lineTo(graphX, graphBottom);
      ctx.lineTo(graphX + graphW, graphBottom);
      ctx.stroke();
      
      // Draw Data
      ctx.beginPath();
      ctx.strokeStyle = isDangerous ? '#ef4444' : '#22c55e';
      ctx.lineWidth = 2;
      
      for(let i=0; i<historyRef.current.length; i++) {
        const val = historyRef.current[i];
        const x = graphX + (i / 200) * graphW;
        // Scale y: 200px amp = top of graph
        const y = graphBottom - (val / 200) * graphH; 
        
        if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.stroke();
      
      // Graph Label
      ctx.fillStyle = '#fff';
      ctx.fillText("AMPLITUDE HISTORY", graphX + 10, graphTop + 20);
      
      if (isDangerous) {
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText("CRITICAL RESONANCE!", graphX + 10, graphTop + 50);
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
  values: ResonanceState; 
  setValue: (k: keyof ResonanceState, v: any) => void;
}) => (
  <div className="flex flex-col gap-6 max-w-6xl mx-auto">
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
      
      {/* Driving Freq */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-red-400 uppercase tracking-widest">
            Driving Force Freq ($f_d$)
          </label>
          <span className="text-xs font-mono bg-red-900/20 text-red-300 px-2 py-1 rounded">
             {values.drivingFreq.toFixed(2)} rad/s
          </span>
        </div>
        <input 
          type="range" min="0.5" max="3.0" step="0.05"
          value={values.drivingFreq}
          onChange={(e) => setValue('drivingFreq', parseFloat(e.target.value))}
          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-500 hover:accent-red-400"
        />
        <p className="text-[10px] text-zinc-500">
          How fast the external motor pushes.
        </p>
      </div>

      {/* Natural Freq */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-blue-400 uppercase tracking-widest">
            Natural System Freq ($f_n$)
          </label>
          <span className="text-xs font-mono bg-blue-900/20 text-blue-300 px-2 py-1 rounded">
             {values.naturalFreq.toFixed(2)} rad/s
          </span>
        </div>
        <input 
          type="range" min="0.5" max="3.0" step="0.05"
          value={values.naturalFreq}
          onChange={(e) => setValue('naturalFreq', parseFloat(e.target.value))}
          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
        />
        <p className="text-[10px] text-zinc-500">
          The speed the spring "wants" to bounce at.
        </p>
      </div>

      {/* Damping */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-yellow-400 uppercase tracking-widest">
            Damping (Safety)
          </label>
          <span className="text-xs font-mono bg-yellow-900/20 text-yellow-300 px-2 py-1 rounded">
             {values.damping.toFixed(3)}
          </span>
        </div>
        <input 
          type="range" min="0.005" max="0.2" step="0.005"
          value={values.damping}
          onChange={(e) => setValue('damping', parseFloat(e.target.value))}
          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-500 hover:accent-yellow-400"
        />
        <p className="text-[10px] text-zinc-500">
          Low Damping = Huge Resonance. High Damping = Safe Bridge.
        </p>
      </div>

    </div>

    {/* Visual Feedback Bar */}
    <div className="text-center">
       <div className={`
         inline-flex items-center gap-2 px-6 py-2 rounded-full border transition-all duration-500
         ${Math.abs(values.naturalFreq - values.drivingFreq) < 0.1 
           ? 'bg-red-500/10 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)] scale-110' 
           : 'bg-zinc-800 border-zinc-700 text-zinc-500'}
       `}>
         <FaExclamationTriangle />
         <span className="text-xs font-bold uppercase tracking-widest">
           {Math.abs(values.naturalFreq - values.drivingFreq) < 0.1 ? 'RESONANCE DETECTED' : 'SYSTEM STABLE'}
         </span>
       </div>
    </div>

  </div>
);

// --- 5. Export ---
export const SIMULATION_14 = {
  title: 'Resonance Phenomenon',
  initialValues: { 
    naturalFreq: 2.0, 
    drivingFreq: 1.0, 
    damping: 0.05,
    amplitude: 0 
  },
  achievements: achievements,
  renderSimulation: ({ values }: { values: ResonanceState }) => (
    <ResonanceCanvas values={values} />
  ),
  renderControls: renderControls
};