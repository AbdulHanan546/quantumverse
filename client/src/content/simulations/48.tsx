import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine'; // Adjust path as needed

// 1. Interface
// We are simulating a "Particle in a Box".
// 'n' is the energy level (how hyper the particle is).
interface QuantumState {
  n: number;             // The Quantum Number (1 - 100)
  showClassical: boolean; // Toggle the "Boring Newtonian Line"
  showParticle: boolean;  // Toggle the little jittery dot
}

// 2. Achievements
// Encouraging the user to see the transition from "Weird Wavy" to "Flat Classical"
const achievements: Achievement<QuantumState>[] = [
  {
    id: 'couch-potato',
    title: 'The Couch Potato',
    description: 'Set energy to the absolute minimum (n=1). The particle is mostly just chilling in the middle.',
    condition: (s) => s.n === 1
  },
  {
    id: 'getting-wavy',
    title: 'Making Waves',
    description: 'Crank the energy up a bit (n > 10). Now it looks like a proper wave.',
    condition: (s) => s.n > 10 && s.n < 30
  },
  {
    id: 'newton-fan-club',
    title: 'Newton\'s Dream',
    description: 'Turn on the "Classical Expectation" view. This is what physics was before 1900.',
    condition: (s) => s.showClassical
  },
  {
    id: 'imposter-syndrome',
    title: 'The Classical Limit',
    description: 'Go high energy (n > 80) with Classical View on. The quantum wave gets so frantic it basically becomes the flat classical line.',
    condition: (s) => s.n > 80 && s.showClassical
  },
  {
    id: 'ghost-hunter',
    title: 'Ghost Hunter',
    description: 'Enable the Particle Tracker to see where the electron actually "is".',
    condition: (s) => s.showParticle
  }
];

// 3. Canvas
// This renders the "Infinite Square Well" probability density
const QuantumCanvas = ({ values }: { values: QuantumState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const timeRef = useRef<number>(0);
  
  // We need a ref for values to access them inside the animation frame without stale closures
  const valuesRef = useRef(values);
  useEffect(() => { valuesRef.current = values; }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0, height = 0;

    const animate = () => {
      // 1. Resize Logic
      const parent = canvas.parentElement;
      if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
        width = parent.clientWidth;
        height = parent.clientHeight;
        canvas.width = width;
        canvas.height = height;
      }

      const { n, showClassical, showParticle } = valuesRef.current;
      timeRef.current += 0.05;

      // 2. Clear Screen
      ctx.fillStyle = '#09090b'; // Zinc-950
      ctx.fillRect(0, 0, width, height);

      const bottomY = height - 50;
      const topY = 50;
      const graphHeight = bottomY - topY;

      // 3. Draw The Box (The Walls)
      ctx.strokeStyle = '#52525b'; // Zinc-600
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(0, height); // Left Wall
      ctx.moveTo(width, 0); ctx.lineTo(width, height); // Right Wall
      ctx.stroke();

      // 4. Draw Classical Probability (The flat line)
      // Classically, a bouncing ball is equally likely to be anywhere in the box.
      if (showClassical) {
        ctx.strokeStyle = '#f59e0b'; // Amber-500
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        const classicalY = bottomY - (graphHeight * 0.5); // Just putting it at 50% height for visual scale
        
        ctx.beginPath();
        ctx.moveTo(0, classicalY);
        ctx.lineTo(width, classicalY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = '#f59e0b';
        ctx.font = '12px monospace';
        ctx.fillText("CLASSICAL PREDICTION (Boring)", 10, classicalY - 10);
      }

      // 5. Draw Quantum Probability Density (|psi|^2)
      // Math: sin^2(n * pi * x / L)
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#4ade80'; // Green-400
      ctx.moveTo(0, bottomY);

      // We scan across the screen pixel by pixel
      for (let x = 0; x <= width; x+=2) {
        const normalizedX = x / width;
        // The Wave Function
        const psiSq = Math.pow(Math.sin(n * Math.PI * normalizedX), 2);
        
        // Map to screen coordinates
        const y = bottomY - (psiSq * graphHeight * 0.85); // 0.85 to keep it inside nicely
        ctx.lineTo(x, y);
      }
      
      // Close the shape to fill it
      ctx.lineTo(width, bottomY);
      ctx.lineTo(0, bottomY);
      ctx.fillStyle = 'rgba(74, 222, 128, 0.1)'; // Low opacity green fill
      ctx.fill();
      ctx.stroke();

      // 6. Draw the "Particle" (The Measurement)
      // To visualize this for kids: We simulate a particle appearing where probability is high.
      if (showParticle) {
        // Rejection sampling to find a valid X based on probability
        let found = false;
        let particleX = 0;
        let attempts = 0;
        
        // We only move the particle every few frames to stop it flickering too hard
        const slowTime = Math.floor(Date.now() / 50); 
        
        // Use a pseudo-random seed based on time to make it jump around
        // (This is a hacky way to simulate the probabilistic collapse)
        // In a real generic loop we just generate randoms.
        while (!found && attempts < 10) {
           const randX = Math.random();
           const prob = Math.pow(Math.sin(n * Math.PI * randX), 2);
           if (Math.random() < prob) {
             particleX = randX * width;
             found = true;
           }
           attempts++;
        }

        if (found) {
            ctx.beginPath();
            ctx.arc(particleX, bottomY - 10, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.shadowColor = '#4ade80';
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
      }

      // Labels
      ctx.fillStyle = '#71717a';
      ctx.textAlign = 'center';
      ctx.font = '14px monospace';
      ctx.fillText(`QUANTUM STATE n=${n}`, width/2, 30);
      
      if (n > 50) {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.5)'; // Orange glowish
        ctx.fillText("High Energy: Quantum Randomness ≈ Classical Uniformity", width/2, height - 20);
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// 4. Controls
const renderControls = ({ values, setValue }: { 
    values: QuantumState; 
    setValue: (k: keyof QuantumState, v: any) => void 
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto items-center">
    
    {/* N Slider */}
    <div className="space-y-3 group col-span-2">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400 transition-colors">
          Energy Level (n)
        </label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
            <span className="text-sm font-mono text-green-400 font-bold">{values.n}</span>
        </div>
      </div>
      <input 
        type="range" min="1" max="100" step="1"
        value={values.n}
        onChange={(e) => setValue('n', parseInt(e.target.value))}
        className="glow-range"
      />
      <p className="text-xs text-zinc-600 h-4">
        {values.n === 1 ? "Minimum Energy. One big bump." : 
         values.n > 80 ? "Look! It's basically a solid block of probability." : 
         "More energy = More wiggles."}
      </p>
    </div>

    {/* Toggle Classical */}
    <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50 hover:border-green-500/30 transition-all">
      <div className="pr-4">
        <label className="block text-xs font-bold text-green-400 uppercase tracking-wide mb-1">Classical View</label>
        <p className="text-[10px] text-zinc-500 leading-tight">Compare with what Newton expected (a flat line).</p>
      </div>
      <button 
        onClick={() => setValue('showClassical', !values.showClassical)}
        className={`w-12 h-6 rounded-full transition-colors relative ${values.showClassical ? 'bg-green-500' : 'bg-zinc-700'}`}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${values.showClassical ? 'left-7' : 'left-1'}`} />
      </button>
    </div>

    {/* Toggle Particle */}
    <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50 hover:border-green-500/30 transition-all">
      <div className="pr-4">
        <label className="block text-xs font-bold text-green-400 uppercase tracking-wide mb-1">Particle Cam</label>
        <p className="text-[10px] text-zinc-500 leading-tight">Show where the particle is detected.</p>
      </div>
      <button 
        onClick={() => setValue('showParticle', !values.showParticle)}
        className={`w-12 h-6 rounded-full transition-colors relative ${values.showParticle ? 'bg-green-500' : 'bg-zinc-700'}`}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${values.showParticle ? 'left-7' : 'left-1'}`} />
      </button>
    </div>

  </div>
);

// 5. Export
export const SIMULATION_48 = {
    title: 'Classical Limit (Particle in a Box)',
    initialValues: { n: 2, showClassical: false, showParticle: false },
    achievements: achievements,
    renderSimulation: ({ values }: { values: QuantumState }) => (
        <QuantumCanvas values={values} />
    ),
    renderControls: renderControls
};