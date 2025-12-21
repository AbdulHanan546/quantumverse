import React, { useEffect, useRef, useState } from 'react';
import { FaEye, FaEyeSlash, FaRegTrashAlt } from 'react-icons/fa';
import { type Achievement } from '../../components/SimulationEngine';

// --- 1. Interface ---
interface SimState {
  isObserving: boolean; // The "Measurement" - are we looking at the electrons?
  firingRate: number;   // How many particles per frame
  slitDistance: number; // Distance between the two slits
}

// --- 2. Achievements ---
const achievements: Achievement<SimState>[] = [
  {
    id: 'stage-fright',
    title: 'Stage Fright',
    description: 'Turn on the Observer. Watch particles act "normal" because you are watching.',
    condition: (s) => s.isObserving
  },
  {
    id: 'party-mode',
    title: 'Secret Party',
    description: 'Turn off the Observer. Let particles behave like waves (interference pattern) when you look away.',
    condition: (s) => !s.isObserving
  },
  {
    id: 'machine-gun',
    title: 'Quantum Machine Gun',
    description: 'Crank the firing rate to max (20). We need more data!',
    condition: (s) => s.firingRate >= 20
  },
  {
    id: 'wide-stance',
    title: 'Social Distancing',
    description: 'Set the slit distance to maximum to separate the particle streams.',
    condition: (s) => s.slitDistance >= 80
  },
  {
    id: 'tight-squeeze',
    title: 'Tight Squeeze',
    description: 'Bring the slits close together (distance < 30) to overlap the waves.',
    condition: (s) => s.slitDistance < 30
  }
];

// --- 3. Canvas Component ---
// --- 3. Canvas Component (UPDATED) ---
const QuantumCanvas = ({ values }: { values: SimState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const valuesRef = useRef(values);
  
  // Histogram data
  const hitsRef = useRef<number[]>(new Array(100).fill(0)); 
  const particlesRef = useRef<{x: number, y: number, vy: number, vx: number, phaseOffset: number}[]>([]);

  useEffect(() => { 
    valuesRef.current = values; 
  }, [values]);

  const clearScreen = () => {
    hitsRef.current = new Array(100).fill(0);
  };

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
        hitsRef.current = new Array(Math.floor(height / 4)).fill(0);
      }

      const { isObserving, firingRate, slitDistance } = valuesRef.current;
      const centerY = height / 2;
      const wallX = width * 0.2;
      const screenX = width * 0.85;
      
      // Clear background with a slight fade effect for trails if desired, 
      // but standard clear is cleaner for this specific sim
      ctx.fillStyle = '#09090b'; 
      ctx.fillRect(0, 0, width, height);

      // --- 1. Draw The Setup ---
      
      // Emitter
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#10b981';
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(30, centerY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // Reset shadow
      
      // Wall
      ctx.strokeStyle = '#52525b';
      ctx.lineWidth = 5;
      const gap = 20;
      const halfDist = slitDistance / 2;
      
      const drawWallSegment = (y1: number, y2: number) => {
          ctx.beginPath();
          ctx.moveTo(wallX, y1);
          ctx.lineTo(wallX, y2);
          ctx.stroke();
      };
      drawWallSegment(0, centerY - halfDist - gap);
      drawWallSegment(centerY - halfDist + gap, centerY + halfDist - gap);
      drawWallSegment(centerY + halfDist + gap, height);

      // Observer Eye
      if (isObserving) {
        ctx.fillStyle = '#f59e0b';
        ctx.font = '24px Arial';
        ctx.fillText('👁️', wallX - 10, centerY - halfDist - 45);
        ctx.fillStyle = '#f59e0b'; 
        ctx.font = 'bold 12px monospace';
        ctx.fillText('MEASURING', wallX - 25, centerY - halfDist - 65);
        
        // Draw "Laser" lines looking at the slits
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(wallX - 5, centerY - halfDist - 35);
        ctx.lineTo(wallX, centerY - halfDist); // Top slit
        ctx.lineTo(wallX, centerY + halfDist); // Bottom slit
        ctx.stroke();
      }

      // --- 2. Update & Draw Particles ---

      // Spawn
      for(let i=0; i<firingRate; i++) {
        particlesRef.current.push({
          x: 40,
          y: centerY + (Math.random() - 0.5) * 10,
          vx: 5 + Math.random(),
          vy: (Math.random() - 0.5) * 0.5,
          phaseOffset: Math.random() * 10 // For visual wobble
        });
      }

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;

        // Visual "Wave Wobble" (Only visual, doesn't affect physics)
        // This makes them look like they are oscillating if not observed
        const visualY = !isObserving && p.x > wallX 
            ? p.y + Math.sin(p.x * 0.1 + p.phaseOffset) * 3 
            : p.y;

        // Interaction with Slit Wall
        if (p.x > wallX && p.x < wallX + 20 && Math.abs(p.x - wallX) < 10) {
            const hitTopSlit = Math.abs(p.y - (centerY - halfDist)) < gap;
            const hitBotSlit = Math.abs(p.y - (centerY + halfDist)) < gap;

            if (!hitTopSlit && !hitBotSlit) {
                particlesRef.current.splice(i, 1);
                continue;
            } else {
                // PHYSICS LOGIC
                if (isObserving) {
                   // Particle Mode: Slight scatter
                   p.vy += (Math.random() - 0.5) * 0.5;
                } else {
                   // Wave Mode: Interference Nudge
                   // We steer them slightly based on the interference equation
                   const phase = (p.y - centerY) * (slitDistance / 500); 
                   p.vy += Math.sin(phase) * 0.25; 
                }
            }
        }

        // Hit Screen
        if (p.x >= screenX) {
            const binSize = 4;
            const binIndex = Math.floor(p.y / binSize);
            if (binIndex >= 0 && binIndex < hitsRef.current.length) {
                hitsRef.current[binIndex] = (hitsRef.current[binIndex] || 0) + 1;
            }
            particlesRef.current.splice(i, 1);
            continue;
        }

        // --- DRAWING LOGIC CHANGE ---
        if (isObserving) {
            // PARTICLE MODE: Solid Orange Circle
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(p.x, visualY, 2.5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // WAVE MODE: Fuzzy Green Glow / Ripple
            // We use a radial gradient to make it look like a puff of energy
            const grad = ctx.createRadialGradient(p.x, visualY, 0, p.x, visualY, 6);
            grad.addColorStop(0, 'rgba(52, 211, 153, 0.8)'); // Core
            grad.addColorStop(1, 'rgba(52, 211, 153, 0)');   // Edge

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, visualY, 6, 0, Math.PI * 2);
            ctx.fill();
        }
      }

      // --- 3. Draw The Pattern ---
      ctx.fillStyle = '#18181b';
      ctx.fillRect(screenX, 0, width - screenX, height);
      
      const maxHits = Math.max(...hitsRef.current, 1);
      
      hitsRef.current.forEach((count, idx) => {
          if (count === 0) return;
          const y = idx * 4;
          const barLen = (count / maxHits) * (width - screenX - 10);
          
          const alpha = Math.min(count / 15, 1); // Hit density opacity
          
          if (isObserving) {
             // Clumps (Particle style)
             ctx.fillStyle = `rgba(245, 158, 11, ${alpha})`;
          } else {
             // Interference Bands (Wave style)
             ctx.fillStyle = `rgba(52, 211, 153, ${alpha})`;
          }
          
          // Draw with a bit of glow for the wave pattern
          if (!isObserving) {
             ctx.shadowBlur = 5;
             ctx.shadowColor = 'rgba(52, 211, 153, 0.5)';
          } else {
             ctx.shadowBlur = 0;
          }

          ctx.fillRect(screenX, y, barLen, 4);
          ctx.shadowBlur = 0;
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    (canvas as any).clearScreen = clearScreen;
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  useEffect(() => {
     if(canvasRef.current && (canvasRef.current as any).clearScreen) {
         (canvasRef.current as any).clearScreen();
     }
  }, [values.isObserving, values.slitDistance]);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// --- 4. Controls Component ---
const renderControls = ({ values, setValue }: { values: SimState, setValue: any, setValues: any }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto items-center">
    
    {/* Observation Toggle (The Main Event) */}
    <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700 col-span-1 md:col-span-2 flex items-center justify-between group hover:border-green-500/50 transition-all">
      <div className="flex flex-col">
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Measurement</span>
        <span className={`text-lg font-bold ${values.isObserving ? 'text-amber-400' : 'text-green-400'}`}>
          {values.isObserving ? "Observer: ON" : "Observer: OFF"}
        </span>
        <p className="text-xs text-zinc-400 mt-2 max-w-[200px]">
          {values.isObserving 
            ? "You are looking. Particles are shy and acting like solid balls." 
            : "You aren't looking. Particles are partying as waves."}
        </p>
      </div>
      
      <button
        onClick={() => setValue('isObserving', !values.isObserving)}
        className={`
          w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-xl transition-all transform hover:scale-105 active:scale-95
          ${values.isObserving 
            ? 'bg-amber-500/20 text-amber-400 border-2 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]' 
            : 'bg-zinc-800 text-zinc-600 border-2 border-zinc-600 hover:text-zinc-300'}
        `}
      >
        {values.isObserving ? <FaEye /> : <FaEyeSlash />}
      </button>
    </div>

    {/* Firing Rate */}
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Intensity</label>
        <span className="text-sm font-mono text-green-400 font-bold">{values.firingRate}</span>
      </div>
      <input 
        type="range" min="1" max="25" step="1"
        value={values.firingRate}
        onChange={(e) => setValue('firingRate', parseFloat(e.target.value))}
        className="glow-range w-full"
      />
      <p className="text-[10px] text-zinc-500">More particles = Pattern builds faster.</p>
    </div>

    {/* Slit Distance */}
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Slit Width</label>
        <span className="text-sm font-mono text-green-400 font-bold">{values.slitDistance}px</span>
      </div>
      <input 
        type="range" min="20" max="100" step="5"
        value={values.slitDistance}
        onChange={(e) => setValue('slitDistance', parseFloat(e.target.value))}
        className="glow-range w-full"
      />
      <p className="text-[10px] text-zinc-500">Changes the interference spacing.</p>
    </div>

  </div>
);

// --- 5. Export ---
export const SIMULATION_45 = {
  title: 'Complementarity Principle',
  initialValues: { 
    isObserving: false, // Start in wave mode (it's cooler)
    firingRate: 5,
    slitDistance: 50
  },
  achievements: achievements,
  renderSimulation: ({ values }: { values: SimState }) => <QuantumCanvas values={values} />,
  renderControls: renderControls
};