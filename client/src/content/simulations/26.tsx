import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine';

// 1. Interface
interface SimState {
  particleSpeed: number; // Energy of the Alpha particles
  beamWidth: number;    // How "scattered" the incoming particles are
  isFiring: boolean;
  deflectionCount: number; // Total particles that bounced back
}

// 2. Achievements
const achievements: Achievement<SimState>[] = [
  {
    id: 'first-contact',
    title: 'Ghostly Gold',
    description: 'Start the beam. Most particles should pass right through the "solid" foil!',
    condition: (s) => s.isFiring
  },
  {
    id: 'the-u-turn',
    title: 'Wait, It Bounced?',
    description: 'Witness a particle deflect at an angle greater than 90 degrees.',
    condition: (s) => s.deflectionCount > 0
  },
  {
    id: 'high-energy-probe',
    title: 'High Speed Probe',
    description: 'Crank the particle speed to 9.0+. Fast particles get closer to the nucleus.',
    condition: (s) => s.particleSpeed >= 9.0
  },
  {
    id: 'nuclear-discovery',
    title: 'Nucleus Hunter',
    description: 'Accumulate 10 major deflections. You’ve officially discovered the nucleus!',
    condition: (s) => s.deflectionCount >= 10
  },
  {
    id: 'narrow-focus',
    title: 'Sniper Mode',
    description: 'Set beam width to minimum to aim directly at the center of the atoms.',
    condition: (s) => s.beamWidth <= 1.5 && s.isFiring
  }
];

// 3. Canvas Component
const RutherfordCanvas = ({ values, setValue }: { values: SimState, setValue: any }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const alphaParticles = useRef<{ x: number, y: number, vx: number, vy: number, path: {x: number, y: number}[] }[]>([]);

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

      // Draw Gold Nuclei (The obstacles)
      const nuclei = [
        { x: centerX, y: centerY },
        { x: centerX, y: centerY - 100 },
        { x: centerX, y: centerY + 100 }
      ];

      nuclei.forEach(n => {
        // Draw the "Atomic Space"
        ctx.beginPath();
        ctx.arc(n.x, n.y, 45, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.1)';
        ctx.stroke();

        // Draw the Nucleus
        ctx.beginPath();
        ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#eab308';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#eab308';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      if (values.isFiring) {
        // Spawn particles
        if (Math.random() < 0.3) {
          alphaParticles.current.push({
            x: 0,
            y: centerY + (Math.random() - 0.5) * (values.beamWidth * 40),
            vx: values.particleSpeed * 0.8 + 2,
            vy: 0,
            path: []
          });
        }

        alphaParticles.current.forEach((p, idx) => {
          p.x += p.vx;
          p.y += p.vy;
          p.path.push({ x: p.x, y: p.y });

          // Coulomb Force Logic (simplified)
          nuclei.forEach(n => {
            const dx = n.x - p.x;
            const dy = n.y - p.y;
            const distSq = dx * dx + dy * dy;
            const dist = Math.sqrt(distSq);

            if (dist < 80) {
              const force = (100 / distSq) * (10 / values.particleSpeed);
              p.vx -= (dx / dist) * force;
              p.vy -= (dy / dist) * force;

              // Check for major deflection
              if (p.vx < 0 && p.x < n.x && dist < 15) {
                setValue('deflectionCount', (prev: number) => prev + 1);
                // Move particle out of trigger zone to prevent multi-counts
                p.x -= 5;
              }
            }
          });

          // Draw path
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          if (p.path.length > 1) {
            ctx.moveTo(p.path[0].x, p.path[0].y);
            p.path.forEach(pos => ctx.lineTo(pos.x, pos.y));
          }
          ctx.stroke();

          // Draw Particle
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#fff';
          ctx.fill();
        });

        // Cleanup
        alphaParticles.current = alphaParticles.current.filter(p => p.x > -50 && p.x < width + 50 && p.y > -50 && p.y < height + 50 && p.path.length < 200);
      }

      requestAnimationFrame(animate);
    };

    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [values, setValue]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

// 4. Main Export
export const SIMULATION_26 = {
  title: "Rutherford's Gold Foil Experiment",
  initialValues: { particleSpeed: 5, beamWidth: 5, isFiring: false, deflectionCount: 0 },
  achievements: achievements,
  renderSimulation: ({ values, setValue }: { values: SimState, setValue: any }) => (
    <div className="w-full h-full relative">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center z-10 bg-black/60 p-3 rounded-lg border border-white/10 backdrop-blur-md w-2/3">
        <p className="text-zinc-300 text-xs">
          Firing positive Alpha particles at Gold atoms. <br/>
          Watch how they <b>curve</b> when they get near the tiny, positive nucleus!
        </p>
      </div>
      <RutherfordCanvas values={values} setValue={setValue} />
    </div>
  ),
  renderControls: ({ values, setValue }: { values: SimState, setValue: any }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      
      {/* Particle Speed Slider */}
      <div className="space-y-3 group">
        <div className="flex justify-between items-end">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Alpha Particle Velocity</label>
          <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
            <span className="text-sm font-mono text-yellow-500 font-bold">{values.particleSpeed.toFixed(1)}</span>
          </div>
        </div>
        <input 
          type="range" min="2" max="10" step="0.5"
          value={values.particleSpeed}
          onChange={(e) => setValue('particleSpeed', parseFloat(e.target.value))}
          className="glow-range"
        />
      </div>

      {/* Beam Width Slider */}
      <div className="space-y-3 group">
        <div className="flex justify-between items-end">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Beam Spread (Width)</label>
          <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
            <span className="text-sm font-mono text-yellow-500 font-bold">{values.beamWidth.toFixed(1)}</span>
          </div>
        </div>
        <input 
          type="range" min="1" max="10" step="0.5"
          value={values.beamWidth}
          onChange={(e) => setValue('beamWidth', parseFloat(e.target.value))}
          className="glow-range"
        />
      </div>

      {/* Fire Toggle */}
      <div className="flex flex-col justify-center">
        <button 
          onClick={() => setValue('isFiring', !values.isFiring)}
          className={`px-4 py-3 rounded-lg font-bold text-xs uppercase transition-all duration-300 border-2 ${
            values.isFiring 
            ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]' 
            : 'bg-zinc-800 border-zinc-700 text-zinc-500'
          }`}
        >
          {values.isFiring ? 'Stop Firing' : 'Fire Alpha Beam'}
        </button>
      </div>

    </div>
  )
};