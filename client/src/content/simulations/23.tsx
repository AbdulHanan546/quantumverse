import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine';

// 1. Interface
interface SimState {
  velocity: number;
  mass: number;
  showWave: boolean;
  wavelength: number;
}

// 2. Achievements
const achievements: Achievement<SimState>[] = [
  {
    id: 'going-subatomic',
    title: 'Subatomic Reality',
    description: 'Reduce mass to the minimum to see the electron become noticeably wavy.',
    condition: (s) => s.mass <= 1.5
  },
  {
    id: 'high-speed-blur',
    title: 'High Speed Blur',
    description: 'Max out velocity. Notice how the waves get tighter (shorter wavelength).',
    condition: (s) => s.velocity >= 9.0
  },
  {
    id: 'the-heavy-particle',
    title: 'The Bowling Ball Effect',
    description: 'Set mass to maximum. The "wave" becomes almost a straight line.',
    condition: (s) => s.mass >= 9.0
  },
  {
    id: 'quantum-detective',
    title: 'Quantum Detective',
    description: 'Toggle the wave visualization to reveal the hidden math.',
    condition: (s) => s.showWave === true
  },
  {
    id: 'perfect-balance',
    title: 'Harmonic Duality',
    description: 'Find a balance where mass and velocity both equal 5.',
    condition: (s) => s.mass === 5 && s.velocity === 5
  }
];

// 3. Canvas Component
const DeBroglieCanvas = ({ values, setValue }: { values: SimState, setValue: any }) => {
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

      // Physics: lambda = h / (m * v)
      // h is a constant (we'll use a visual scaler)
      const visualH = 2000;
      const currentWavelength = visualH / (values.mass * values.velocity);
      
      // Update state for achievements
      setValue('wavelength', currentWavelength);

      timeRef.current += 0.05;

      // Draw the "Wave" (The Probability Cloud)
      if (values.showWave) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(96, 165, 250, 0.4)';
        ctx.lineWidth = 2;
        for (let x = 0; x < width; x++) {
          const y = centerY + Math.sin((x / currentWavelength) + timeRef.current) * (30 / values.mass);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Draw the "Particle" (The actual object)
      const particleX = (timeRef.current * 50) % width;
      const particleY = centerY + (values.showWave ? Math.sin((particleX / currentWavelength) + timeRef.current) * (30 / values.mass) : 0);
      
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#60a5fa';
      ctx.fillStyle = '#60a5fa';
      
      const size = Math.max(2, values.mass * 3);
      ctx.beginPath();
      ctx.arc(particleX, particleY, size, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#71717a';
      ctx.font = '10px monospace';
      ctx.fillText(`λ ≈ ${currentWavelength.toFixed(0)} units`, particleX - 20, particleY - size - 10);

      requestAnimationFrame(animate);
    };

    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [values, setValue]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

// 4. Main Export
export const SIMULATION_23 = {
  title: "de Broglie’s Wavy World",
  initialValues: { velocity: 3, mass: 5, showWave: false, wavelength: 0 },
  achievements: achievements,
  renderSimulation: ({ values, setValue }: { values: SimState, setValue: any }) => (
    <div className="w-full h-full relative">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center z-10 bg-black/60 p-3 rounded-lg border border-white/10 backdrop-blur-md w-3/4">
        <p className="text-zinc-300 text-xs">
          According to de Broglie, everything is a wave. <br/>
          The <b>faster</b> and <b>heavier</b> you are, the less "wavy" you look to the naked eye.
        </p>
      </div>
      <DeBroglieCanvas values={values} setValue={setValue} />
    </div>
  ),
  renderControls: ({ values, setValue }: { values: SimState, setValue: any }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      
      {/* Velocity Slider */}
      <div className="space-y-3 group">
        <div className="flex justify-between items-end">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Velocity (v)</label>
          <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
            <span className="text-sm font-mono text-blue-400 font-bold">{values.velocity.toFixed(1)}</span>
          </div>
        </div>
        <input 
          type="range" min="1" max="10" step="0.5"
          value={values.velocity}
          onChange={(e) => setValue('velocity', parseFloat(e.target.value))}
          className="glow-range"
        />
      </div>

      {/* Mass Slider */}
      <div className="space-y-3 group">
        <div className="flex justify-between items-end">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Mass (m)</label>
          <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
            <span className="text-sm font-mono text-green-400 font-bold">{values.mass.toFixed(1)}</span>
          </div>
        </div>
        <input 
          type="range" min="0.5" max="10" step="0.5"
          value={values.mass}
          onChange={(e) => setValue('mass', parseFloat(e.target.value))}
          className="glow-range"
        />
      </div>

      {/* Toggle Visualization */}
      <div className="flex flex-col justify-center">
        <button 
          onClick={() => setValue('showWave', !values.showWave)}
          className={`px-4 py-2 rounded border-2 transition-all font-bold text-xs uppercase tracking-tighter ${
            values.showWave 
            ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
            : 'bg-zinc-800 border-zinc-700 text-zinc-500'
          }`}
        >
          {values.showWave ? 'Hide Probability Wave' : 'Show Probability Wave'}
        </button>
      </div>

    </div>
  )
};