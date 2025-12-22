import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine';

// 1. Interface
// Frequency = Color/Energy. Intensity = Number of photons. 
// ObjectMass = How hard it is to move the block.
interface SimState {
  frequency: number; 
  intensity: number;
  objectMass: number;
  currentVelocity: number;
}

// 2. Achievements
const achievements: Achievement<SimState>[] = [
  {
    id: 'baby-steps',
    title: 'Light Push',
    description: 'Get the block moving using only light! Physics is weird, right?',
    condition: (s) => s.currentVelocity > 0.1
  },
  {
    id: 'blue-power',
    title: 'Violet Violence',
    description: 'Use high-frequency (Blue/UV) light to maximize momentum transfer.',
    condition: (s) => s.frequency > 9 && s.currentVelocity > 0.5
  },
  {
    id: 'massive-struggle',
    title: 'The Heavyweight',
    description: 'Try to move a 10kg block. You’re going to need a lot of photons.',
    condition: (s) => s.objectMass === 10 && s.currentVelocity > 0.05
  },
  {
    id: 'solar-sailor',
    title: 'Solar Sailor',
    description: 'Reach a velocity of 2.0 or higher. You are officially drifting through space.',
    condition: (s) => s.currentVelocity >= 2.0
  },
  {
    id: 'low-energy-chill',
    title: 'Red Light Nap',
    description: 'Use Red light on a heavy block. It’s like trying to move a car by throwing marshmallows at it.',
    condition: (s) => s.frequency < 2 && s.objectMass > 8
  }
];

// 3. Canvas Component
const MomentumCanvas = ({ values, setValue }: { values: SimState, setValue: any }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const photons = useRef<{ x: number, y: number, color: string, energy: number }[]>([]);
  const blockX = useRef<number>(200);
  const velocity = useRef<number>(0);

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

      // Physics Math
      // Momentum p = E/c. In our sim, p is proportional to frequency.
      const photonMomentum = values.frequency * 0.02;
      
      // Update Block position
      velocity.current *= 0.99; // Simple friction/drag
      blockX.current += velocity.current;
      if (blockX.current > width - 50) blockX.current = 100; // Reset if it goes off screen
      
      // Update Simulation Engine State for achievements
      if (Math.abs(values.currentVelocity - velocity.current) > 0.01) {
        setValue('currentVelocity', velocity.current);
      }

      // Draw Block (The "Solar Sail")
      const size = 60;
      ctx.fillStyle = '#27272a';
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2;
      ctx.strokeRect(blockX.current, height/2 - size/2, 10, size);
      ctx.fillRect(blockX.current, height/2 - size/2, 10, size);
      
      // Label the mass
      ctx.fillStyle = '#60a5fa';
      ctx.font = '12px monospace';
      ctx.fillText(`${values.objectMass}kg`, blockX.current - 10, height/2 + size);

      // Spawn Photons
      if (Math.random() < values.intensity * 0.2) {
        const hue = 280 - (values.frequency * 28);
        photons.current.push({
          x: 0,
          y: height/2 + (Math.random() - 0.5) * size,
          color: `hsla(${hue}, 80%, 60%, 0.8)`,
          energy: photonMomentum
        });
      }

      // Draw and Move Photons
      photons.current.forEach((p, i) => {
        p.x += 7;
        
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();

        // Collision detection
        if (p.x >= blockX.current && p.x <= blockX.current + 10 && Math.abs(p.y - height/2) < size/2) {
          // Change in velocity = momentum / mass
          velocity.current += p.energy / values.objectMass;
          photons.current.splice(i, 1);
        }
      });

      photons.current = photons.current.filter(p => p.x < width);
      requestAnimationFrame(animate);
    };

    const animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [values, setValue]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

// 4. Main Export
export const SIMULATION_21 = {
  title: "Photon Punch-Out",
  initialValues: { frequency: 5, intensity: 5, objectMass: 2, currentVelocity: 0 },
  achievements: achievements,
  renderSimulation: ({ values, setValue }: { values: SimState, setValue: any }) => (
    <div className="w-full h-full relative">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center z-10 bg-black/60 p-3 rounded-lg border border-white/10 backdrop-blur-md">
        <p className="text-zinc-300 text-xs">
          Photons have no mass, but they have <b>momentum</b>. <br/>
          Blue photons (High Frequency) carry a bigger "punch" than Red ones.
        </p>
      </div>
      <MomentumCanvas values={values} setValue={setValue} />
    </div>
  ),
  renderControls: ({ values, setValue }: { values: SimState, setValue: any }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      
      {/* Frequency (Energy per photon) */}
      <div className="space-y-3 group">
        <div className="flex justify-between items-end">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Photon Energy (Color)</label>
          <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
            <span className="text-sm font-mono text-blue-400 font-bold">
              {values.frequency < 3 ? 'Low (Red)' : values.frequency > 8 ? 'High (Violet)' : 'Medium'}
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

      {/* Intensity (Number of photons) */}
      <div className="space-y-3 group">
        <div className="flex justify-between items-end">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Beam Intensity</label>
          <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
            <span className="text-sm font-mono text-yellow-400 font-bold">{Math.round(values.intensity * 10)}%</span>
          </div>
        </div>
        <input 
          type="range" min="1" max="10" step="1"
          value={values.intensity}
          onChange={(e) => setValue('intensity', parseFloat(e.target.value))}
          className="glow-range"
        />
      </div>

      {/* Object Mass */}
      <div className="space-y-3 group">
        <div className="flex justify-between items-end">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Target Mass</label>
          <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
            <span className="text-sm font-mono text-red-400 font-bold">{values.objectMass} <span className="text-zinc-500 text-xs">kg</span></span>
          </div>
        </div>
        <input 
          type="range" min="1" max="10" step="1"
          value={values.objectMass}
          onChange={(e) => setValue('objectMass', parseFloat(e.target.value))}
          className="glow-range"
        />
      </div>

    </div>
  )
};