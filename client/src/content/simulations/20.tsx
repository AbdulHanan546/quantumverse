import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine';

// 1. Interface
interface SimState {
  frequency: number;   // Color/Energy of photons
  intensity: number;   // Number of photons
  metalType: number;   // The "Work Function" (Bouncer difficulty)
}

// 2. Achievements
const achievements: Achievement<SimState>[] = [
  {
    id: 'first-ejection',
    title: 'We Have Liftoff!',
    description: 'Eject your first electron from the metal surface.',
    condition: (s) => (s.frequency * 0.5) > s.metalType
  },
  {
    id: 'red-light-fail',
    title: 'The Red Light District',
    description: 'Max out intensity at the lowest frequency. Notice how nothing happens? Light is a particle, baby.',
    condition: (s) => s.intensity > 9 && s.frequency < 3
  },
  {
    id: 'speed-demon',
    title: 'Speed Demon',
    description: 'Give electrons the maximum possible velocity using high-frequency light.',
    condition: (s) => s.frequency > 9.5 && (s.frequency * 0.5) > s.metalType
  },
  {
    id: 'tough-bouncer',
    title: 'The Diamond Door',
    description: 'Set metal "Work Function" to max and try to find a color that can break through.',
    condition: (s) => s.metalType > 4.5 && (s.frequency * 0.5) > s.metalType
  },
  {
    id: 'electron-flood',
    title: 'The Great Migration',
    description: 'Create a massive current by using high intensity AND high frequency.',
    condition: (s) => s.intensity > 8 && (s.frequency * 0.5) > s.metalType
  }
];

// 3. Canvas Component
const PhotoelectricCanvas = ({ values }: { values: SimState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<{ x: number, y: number, vx: number, vy: number, type: 'photon' | 'electron' }[]>([]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      const width = canvas.width = canvas.parentElement?.clientWidth || 600;
      const height = canvas.height = canvas.parentElement?.clientHeight || 400;

      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      // Draw Metal Plate
      const plateX = width * 0.7;
      ctx.fillStyle = '#27272a';
      ctx.fillRect(plateX, 50, 20, height - 100);
      ctx.strokeStyle = '#52525b';
      ctx.strokeRect(plateX, 50, 20, height - 100);

      // Label Work Function
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '10px monospace';
      ctx.fillText(`BOUNCER STRENGTH: ${values.metalType.toFixed(1)}`, plateX - 30, 40);

      // Physics Logic
      const photonEnergy = values.frequency * 0.5;
      const canEject = photonEnergy > values.metalType;
      const electronSpeed = canEject ? (photonEnergy - values.metalType) * 2 : 0;

      // Spawn Photons
      if (Math.random() < values.intensity * 0.1) {
        particles.current.push({
          x: 0,
          y: 50 + Math.random() * (height - 100),
          vx: 5,
          vy: (Math.random() - 0.5) * 2,
          type: 'photon'
        });
      }

      // Update and Draw
      particles.current.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.type === 'photon') {
          // Photon Color based on frequency
          const hue = 280 - (values.frequency * 28); // Violet to Red
          ctx.shadowBlur = 5;
          ctx.shadowColor = `hsla(${hue}, 80%, 50%, 0.8)`;
          ctx.fillStyle = `hsla(${hue}, 80%, 50%, 0.8)`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fill();

          // Collision with Metal
          if (p.x >= plateX) {
            if (canEject) {
              // Spawn Electron
              particles.current.push({
                x: plateX,
                y: p.y,
                vx: -electronSpeed - 1,
                vy: (Math.random() - 0.5) * 2,
                type: 'electron'
              });
            }
            particles.current.splice(i, 1);
          }
        } else {
          // Electron logic
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#4ade80';
          ctx.fillStyle = '#4ade80';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Cleanup
      particles.current = particles.current.filter(p => p.x > -50 && p.x < width + 50);

      requestAnimationFrame(animate);
    };

    const animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [values]);

  return <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" />;
};

// 4. Final Simulation Object
export const SIMULATION_20 = {
  title: "The Photoelectric Club",
  initialValues: { frequency: 4, intensity: 5, metalType: 2.5 },
  achievements: achievements,
  renderSimulation: ({ values }: { values: SimState }) => (
    <div className="w-full h-full relative">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center z-10 bg-black/60 p-3 rounded-lg border border-white/10 backdrop-blur-md">
        <p className="text-zinc-300 text-xs">
          Photons (colored dots) hit the metal. Electrons (green dots) only pop out if <br/>
          the <b>color</b> is "high energy" enough. Intensity just adds more photons.
        </p>
      </div>
      <PhotoelectricCanvas values={values} />
    </div>
  ),
  renderControls: ({ values, setValue }: { values: SimState, setValue: any }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      
      {/* Frequency / Color */}
      <div className="space-y-3 group">
        <div className="flex justify-between items-end">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-blue-400 transition-colors">Photon Energy (Color)</label>
          <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
            <span className="text-sm font-mono text-blue-400 font-bold">
              {values.frequency > 7 ? 'Ultra-Violet' : values.frequency < 3 ? 'Infra-Red' : 'Visible'}
            </span>
          </div>
        </div>
        <input 
          type="range" min="1" max="10" step="0.1"
          value={values.frequency}
          onChange={(e) => setValue('frequency', parseFloat(e.target.value))}
          className="glow-range"
        />
      </div>

      {/* Intensity */}
      <div className="space-y-3 group">
        <div className="flex justify-between items-end">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-yellow-400 transition-colors">Light Brightness</label>
          <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
            <span className="text-sm font-mono text-yellow-400 font-bold">{Math.round(values.intensity * 10)}%</span>
          </div>
        </div>
        <input 
          type="range" min="0" max="10" step="0.5"
          value={values.intensity}
          onChange={(e) => setValue('intensity', parseFloat(e.target.value))}
          className="glow-range"
        />
      </div>

      {/* Work Function / Metal Type */}
      <div className="space-y-3 group">
        <div className="flex justify-between items-end">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-red-400 transition-colors">Bouncer Strength</label>
          <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
            <span className="text-sm font-mono text-red-400 font-bold">{values.metalType.toFixed(1)} <span className="text-xs text-zinc-500">eV</span></span>
          </div>
        </div>
        <input 
          type="range" min="1" max="5" step="0.5"
          value={values.metalType}
          onChange={(e) => setValue('metalType', parseFloat(e.target.value))}
          className="glow-range"
        />
      </div>

    </div>
  )
};