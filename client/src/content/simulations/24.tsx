import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine';

// 1. Interface
interface SimState {
  mass: number;        // From Electron-sized to "Heavy"
  velocity: number;    // How fast it moves
  observerEffect: boolean; // Toggling wave vs particle view
  waveAmplitude: number; // Calculated internally for achievements
}

// 2. Achievements
const achievements: Achievement<SimState>[] = [
  {
    id: 'ghost-mode',
    title: 'Ghost Mode',
    description: 'Reduce mass to the absolute minimum. You are now more wave than man.',
    condition: (s) => s.mass <= 1.0
  },
  {
    id: 'supersonic-ripple',
    title: 'Supersonic Ripple',
    description: 'At high speeds, the wave gets super compressed. Nature likes tight coils.',
    condition: (s) => s.velocity >= 9.0
  },
  {
    id: 'chunky-boy',
    title: 'The Chunky Boy',
    description: 'Max out the mass. The wave is so flat it basically looks like a normal ball.',
    condition: (s) => s.mass >= 9.5
  },
  {
    id: 'reality-check',
    title: 'Reality Check',
    description: 'Turn off the "Observer Effect" to see the underlying wave nature.',
    condition: (s) => !s.observerEffect
  },
  {
    id: 'the-sweet-spot',
    title: 'Quantum Equilibrium',
    description: 'Balance Mass and Velocity at exactly 7.0.',
    condition: (s) => s.mass === 7 && s.velocity === 7
  }
];

// 3. Canvas Component
const MatterWaveCanvas = ({ values }: { values: SimState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      const width = canvas.width = canvas.parentElement?.clientWidth || 600;
      const height = canvas.height = canvas.parentElement?.clientHeight || 400;
      const centerY = height / 2;

      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      // Physics: Wavelength = Constant / (Mass * Velocity)
      const h_visual = 3000;
      const lambda = h_visual / (values.mass * values.velocity);
      const amp = 50 / values.mass; // Lighter objects have bigger wave "swings"

      timeRef.current += 0.02 * values.velocity;

      // Draw the Matter Wave
      if (!values.observerEffect) {
        ctx.beginPath();
        ctx.strokeStyle = '#a78bfa'; // Purple for quantum weirdness
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        for (let x = 0; x < width; x++) {
          const y = centerY + Math.sin((x / lambda) - timeRef.current) * amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw the "Particle"
      const pX = (timeRef.current * 100) % width;
      const pY = values.observerEffect 
        ? centerY 
        : centerY + Math.sin((pX / lambda) - timeRef.current) * amp;

      // Glow effect
      ctx.shadowBlur = values.observerEffect ? 10 : 25;
      ctx.shadowColor = '#a78bfa';
      ctx.fillStyle = '#c084fc';
      
      const pSize = values.mass * 2 + 2;
      ctx.beginPath();
      ctx.arc(pX, pY, pSize, 0, Math.PI * 2);
      ctx.fill();

      // Info Labels
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#52525b';
      ctx.font = '10px monospace';
      ctx.fillText(`Wavelength (λ): ${lambda.toFixed(1)} units`, 20, 30);
      ctx.fillText(`Momentum (p): ${(values.mass * values.velocity).toFixed(1)}`, 20, 45);

      requestAnimationFrame(animate);
    };

    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [values]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

// 4. Main Export
export const SIMULATION_24 = {
  title: "Matter Waves & Wavelength",
  initialValues: { mass: 2, velocity: 4, observerEffect: true, waveAmplitude: 0 },
  achievements: achievements,
  renderSimulation: ({ values }: { values: SimState }) => (
    <div className="w-full h-full relative">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center z-10 bg-black/60 p-3 rounded-lg border border-white/10 backdrop-blur-md">
        <p className="text-zinc-300 text-xs">
          <b>Observation Check:</b> When the purple ball is "heavy," it moves straight. <br/>
          When it's "light," it starts to wobble. That wobble is its <b>Matter Wave</b>.
        </p>
      </div>
      <MatterWaveCanvas values={values} />
    </div>
  ),
  renderControls: ({ values, setValue }: { values: SimState, setValue: any }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      
      {/* Mass Control */}
      <div className="space-y-3 group">
        <div className="flex justify-between items-end">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Particle Mass</label>
          <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
            <span className="text-sm font-mono text-purple-400 font-bold">{values.mass.toFixed(1)}</span>
          </div>
        </div>
        <input 
          type="range" min="0.5" max="10" step="0.5"
          value={values.mass}
          onChange={(e) => setValue('mass', parseFloat(e.target.value))}
          className="glow-range"
        />
      </div>

      {/* Velocity Control */}
      <div className="space-y-3 group">
        <div className="flex justify-between items-end">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Velocity (Speed)</label>
          <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
            <span className="text-sm font-mono text-purple-400 font-bold">{values.velocity.toFixed(1)}</span>
          </div>
        </div>
        <input 
          type="range" min="1" max="10" step="0.5"
          value={values.velocity}
          onChange={(e) => setValue('velocity', parseFloat(e.target.value))}
          className="glow-range"
        />
      </div>

      {/* Observer Effect Toggle */}
      <div className="flex flex-col justify-center">
        <button 
          onClick={() => setValue('observerEffect', !values.observerEffect)}
          className={`px-4 py-3 rounded-lg font-bold text-xs uppercase transition-all duration-300 border-2 ${
            values.observerEffect 
            ? 'bg-zinc-800 border-zinc-700 text-zinc-500' 
            : 'bg-purple-500/20 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(167,139,250,0.3)]'
          }`}
        >
          {values.observerEffect ? 'Enable Wave View' : 'Wave Nature Visible'}
        </button>
        <p className="text-[9px] text-zinc-600 mt-2 text-center italic">
          Turn off "Observer Effect" to see the hidden wave path!
        </p>
      </div>

    </div>
  )
};