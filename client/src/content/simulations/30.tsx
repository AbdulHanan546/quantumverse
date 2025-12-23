import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine';

// 1. Interface
interface SimState {
  mode: 'deterministic' | 'probabilistic'; // Newton vs Quantum
  uncertainty: number; // How "fuzzy" the quantum state is
  shotCount: number;
  hits: {x: number, y: number, timestamp: number}[];
  isAutoFiring: boolean;
}

// 2. Achievements
const achievements: Achievement<SimState>[] = [
  {
    id: 'boring-predictability',
    title: 'Newton’s Snooze Fest',
    description: 'Fire 10 shots in Deterministic mode. They all hit the exact same pixel. Yawn.',
    condition: (s) => s.mode === 'deterministic' && s.shotCount >= 10
  },
  {
    id: 'enter-chaos',
    title: 'Embrace the Chaos',
    description: 'Switch to Probabilistic mode. Welcome to the real world (at atomic scale).',
    condition: (s) => s.mode === 'probabilistic'
  },
  {
    id: 'bell-curve',
    title: 'The Bell Curve',
    description: 'Accumulate 200 shots in Probabilistic mode to see the "Probability Cloud" emerge.',
    condition: (s) => s.mode === 'probabilistic' && s.shotCount >= 200
  },
  {
    id: 'max-uncertainty',
    title: 'Heisenberg’s Nightmare',
    description: 'Max out the uncertainty. Good luck finding that electron.',
    condition: (s) => s.mode === 'probabilistic' && s.uncertainty >= 9.0
  },
  {
    id: 'lucky-shot',
    title: 'Quantum Luck',
    description: 'Hit the bullseye (center) while in high uncertainty mode. Pure chance!',
    condition: (s) => {
        if (s.mode !== 'probabilistic' || s.hits.length === 0) return false;
        const lastHit = s.hits[s.hits.length - 1];
        // Center is roughly 300, 200. Distance check < 5px
        const dist = Math.sqrt(Math.pow(lastHit.x - 300, 2) + Math.pow(lastHit.y - 200, 2));
        return s.uncertainty > 5 && dist < 10;
    }
  }
];

// 3. Canvas Component
const ProbabilityCanvas = ({ values, setValue }: { values: SimState, setValue: any }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Auto-fire logic
  useEffect(() => {
    let interval: number;
    if (values.isAutoFiring) {
        interval = window.setInterval(() => {
            fireShot();
        }, 50); // Fire every 50ms
    }
    return () => clearInterval(interval);
  }, [values.isAutoFiring, values.mode, values.uncertainty]);

  const fireShot = () => {
      const width = 600; 
      const height = 400;
      const centerX = width / 2;
      const centerY = height / 2;

      let hitX, hitY;

      if (values.mode === 'deterministic') {
          // Perfect aim every time
          hitX = centerX;
          hitY = centerY;
      } else {
          // Quantum randomness (Gaussian distribution approximation)
          // Adding multiple randoms creates a "Bell Curve" bias towards the center
          const randNormal = () => (Math.random() + Math.random() + Math.random() + Math.random() - 2) / 2; 
          const spread = values.uncertainty * 25;
          
          hitX = centerX + randNormal() * spread;
          hitY = centerY + randNormal() * spread;
      }

      setValue('hits', (prev: any[]) => [...prev.slice(-500), { x: hitX, y: hitY, timestamp: Date.now() }]);
      setValue('shotCount', (prev: number) => prev + 1);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      const width = canvas.width = canvas.parentElement?.clientWidth || 600;
      const height = canvas.height = canvas.parentElement?.clientHeight || 400;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      // Draw Target
      [150, 100, 50].forEach((r, i) => {
          ctx.beginPath();
          ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
          ctx.strokeStyle = i === 2 ? '#ef4444' : '#3f3f46'; // Inner ring red
          ctx.lineWidth = 2;
          ctx.stroke();
          if (i === 2) {
              ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
              ctx.fill();
          }
      });

      // Draw Hits
      values.hits.forEach(hit => {
          ctx.beginPath();
          ctx.arc(hit.x, hit.y, 3, 0, Math.PI * 2);
          
          // Color based on mode
          if (values.mode === 'deterministic') {
              ctx.fillStyle = '#4ade80'; // Green for precision
              ctx.shadowBlur = 5;
              ctx.shadowColor = '#4ade80';
          } else {
              ctx.fillStyle = 'rgba(167, 139, 250, 0.6)'; // Purple for quantum fuzz
              ctx.shadowBlur = 0;
          }
          ctx.fill();
      });

      // Draw Text Overlay
      ctx.fillStyle = '#71717a';
      ctx.font = '12px monospace';
      ctx.fillText(`Shots Fired: ${values.shotCount}`, 20, 30);
      if (values.mode === 'deterministic') {
          ctx.fillText("PREDICTION: 100% ACCURACY", 20, 50);
      } else {
          ctx.fillText("PREDICTION: IMPOSSIBLE", 20, 50);
          ctx.fillText("PROBABILITY: HIGH AT CENTER", 20, 65);
      }

      requestAnimationFrame(animate);
    };

    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [values]);

  return (
    <div className="w-full h-full relative group cursor-crosshair" onClick={() => !values.isAutoFiring && fireShot()}>
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-50 transition-opacity">
           <span className="text-white text-xs tracking-widest uppercase border border-white/20 px-2 py-1 bg-black/50">Click to Fire</span>
       </div>
       <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

// 4. Main Export
export const SIMULATION_30 = {
  title: "Newton vs. The Quantum Cloud",
  initialValues: { mode: 'deterministic', uncertainty: 2, shotCount: 0, hits: [], isAutoFiring: false },
  achievements: achievements,
  renderSimulation: ({ values, setValue }: { values: SimState, setValue: any }) => (
    <div className="w-full h-full relative">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center z-10 bg-black/60 p-3 rounded-lg border border-white/10 backdrop-blur-md w-3/4">
        <p className="text-zinc-300 text-xs">
          <b>Deterministic:</b> Same input = Same output. Boring.<br/>
          <b>Probabilistic:</b> Same input = "Maybe here, maybe there." Exciting!
        </p>
      </div>
      <ProbabilityCanvas values={values} setValue={setValue} />
    </div>
  ),
  renderControls: ({ values, setValue }: { values: SimState, setValue: any }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      
      {/* Mode Toggle */}
      <div className="flex flex-col justify-center">
        <div className="flex bg-zinc-800 p-1 rounded-lg">
            <button 
                onClick={() => { setValue('mode', 'deterministic'); setValue('hits', []); setValue('shotCount', 0); }}
                className={`flex-1 py-2 text-xs font-bold rounded transition-all ${values.mode === 'deterministic' ? 'bg-green-600 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
                CLASSICAL
            </button>
            <button 
                onClick={() => { setValue('mode', 'probabilistic'); setValue('hits', []); setValue('shotCount', 0); }}
                className={`flex-1 py-2 text-xs font-bold rounded transition-all ${values.mode === 'probabilistic' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
                QUANTUM
            </button>
        </div>
      </div>

      {/* Uncertainty Slider */}
      <div className={`space-y-3 group transition-opacity ${values.mode === 'deterministic' ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex justify-between items-end">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-purple-400 transition-colors">Quantum Fuzziness</label>
          <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
            <span className="text-sm font-mono text-purple-400 font-bold">{values.uncertainty.toFixed(1)}</span>
          </div>
        </div>
        <input 
          type="range" min="1" max="10" step="0.5"
          value={values.uncertainty}
          onChange={(e) => setValue('uncertainty', parseFloat(e.target.value))}
          className="glow-range"
        />
      </div>

      {/* Fire Controls */}
      <div className="flex gap-4 items-center">
        <button 
          onClick={() => setValue('isAutoFiring', !values.isAutoFiring)}
          className={`flex-1 py-4 rounded-xl font-bold text-xs uppercase transition-all duration-300 border-2 ${
            values.isAutoFiring 
            ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse' 
            : 'bg-zinc-800 border-zinc-700 text-zinc-500'
          }`}
        >
          {values.isAutoFiring ? 'STOP RAPID FIRE' : 'START RAPID FIRE'}
        </button>
        
        <button 
            onClick={() => { setValue('hits', []); setValue('shotCount', 0); }}
            className="px-4 py-4 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-zinc-400"
            title="Clear Target"
        >
        </button>
      </div>

    </div>
  )
};