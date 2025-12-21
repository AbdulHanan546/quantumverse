import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine'; // Adjust path as needed

// 1. Interface
interface SimState {
  wellWidth: number;   // How fat the trap is
  wallHeight: number;  // How hard it is to escape (Potential V0)
  energy: number;      // How hyper the particle is (E)
}

// 2. Achievements
const achievements: Achievement<SimState>[] = [
  {
    id: 'houdini',
    title: 'Houdini Mode',
    description: 'Give the particle enough energy to ignore the walls completely (Energy > Wall Height).',
    condition: (s) => s.energy > s.wallHeight
  },
  {
    id: 'deep-dungeon',
    title: 'The Dungeon',
    description: 'Create a hopeless situation: Maximum wall height (10) with tiny energy (< 2).',
    condition: (s) => s.wallHeight >= 10 && s.energy < 2
  },
  {
    id: 'quantum-tunneling',
    title: 'Ghost Fingers',
    description: 'Almost escaped! Set energy just slightly below the wall height (within 0.5 units). Look at the tails leaking out!',
    condition: (s) => s.energy < s.wallHeight && s.energy > (s.wallHeight - 0.5)
  },
  {
    id: 'claustrophobia',
    title: 'Claustrophobia',
    description: 'Shrink the well width to its minimum (0.5). It hates this.',
    condition: (s) => s.wellWidth <= 0.5
  },
  {
    id: 'balanced-state',
    title: 'Zen Mode',
    description: 'Find a balance where Width is 5.0 and Energy is exactly 5.0.',
    condition: (s) => s.wellWidth === 5.0 && s.energy === 5.0
  }
];

// 3. Canvas Visualizer
const QuantumCanvas = ({ values }: { values: SimState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const timeRef = useRef<number>(0);
  
  // Keep values fresh in ref for the animation loop
  const valuesRef = useRef(values);
  useEffect(() => { valuesRef.current = values; }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0, height = 0;

    const animate = () => {
      // Resize logic
      const parent = canvas.parentElement;
      if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
        width = parent.clientWidth;
        height = parent.clientHeight;
        canvas.width = width;
        canvas.height = height;
      }

      const { wellWidth, wallHeight, energy } = valuesRef.current;
      timeRef.current += 0.05;

      // Clear Screen
      ctx.fillStyle = '#18181b'; // zinc-950
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const scaleX = 40; // Pixels per unit width
      const scaleY = 15; // Pixels per unit energy
      
      // --- DRAW THE WELL (The Trap) ---
      ctx.strokeStyle = '#3f3f46'; // zinc-700
      ctx.lineWidth = 4;
      ctx.beginPath();
      
      const wPx = (wellWidth * scaleX) / 2;
      const hPx = wallHeight * scaleY;
      const groundY = cy + 150; // The bottom of the well visually

      // Left Wall Top
      ctx.moveTo(0, groundY - hPx);
      ctx.lineTo(cx - wPx, groundY - hPx);
      // Left Wall Down
      ctx.lineTo(cx - wPx, groundY);
      // Well Floor
      ctx.lineTo(cx + wPx, groundY);
      // Right Wall Up
      ctx.lineTo(cx + wPx, groundY - hPx);
      // Right Wall Top
      ctx.lineTo(width, groundY - hPx);
      
      ctx.stroke();

      // Fill the walls to make them look solid
      ctx.fillStyle = 'rgba(63, 63, 70, 0.3)';
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // --- DRAW THE PARTICLE ENERGY LINE ---
      const energyY = groundY - (energy * scaleY);
      ctx.strokeStyle = energy > wallHeight ? '#facc15' : '#ef4444'; // Yellow if free, Red if trapped
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, energyY);
      ctx.lineTo(width, energyY);
      ctx.stroke();
      ctx.setLineDash([]);

      // --- DRAW THE WAVE FUNCTION (The Ghost) ---
      ctx.beginPath();
      ctx.strokeStyle = '#4ade80'; // Green
      ctx.lineWidth = 3;
      ctx.shadowColor = '#4ade80';
      ctx.shadowBlur = 10;

      // Draw loop
      for (let x = 0; x < width; x++) {
        const relativeX = (x - cx) / scaleX; // x position in simulation units
        const isInside = Math.abs(relativeX) < (wellWidth / 2);
        
        let waveVal = 0;
        const phase = timeRef.current * (energy * 0.5); // Wiggle speed

        if (isInside) {
          // Inside the well, it's a party. High energy = fast wiggles.
          const k = Math.sqrt(energy) * 1.5; 
          waveVal = Math.cos(k * relativeX - phase);
        } else {
          // Outside logic
          if (energy > wallHeight) {
             // FREE!
             const kPrime = Math.sqrt(energy - wallHeight) * 1.5;
             waveVal = Math.cos(kPrime * relativeX - phase);
          } else {
            // TRAPPED! Tunneling decay
            const alpha = Math.sqrt(wallHeight - energy);
            const distFromWall = Math.abs(relativeX) - (wellWidth / 2);
            
            // Match amplitude at boundary roughly
            const boundaryVal = Math.cos(Math.sqrt(energy) * 1.5 * (wellWidth/2) - phase);
            
            // Exponential decay
            waveVal = boundaryVal * Math.exp(-alpha * distFromWall);
          }
        }

        // Map wave value to Y pixels
        const ampPixels = 40; 
        const y = energyY - (waveVal * ampPixels);
        
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // --- Labels ---
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px monospace';
      ctx.fillText(`Wall Height (V): ${wallHeight}`, 10, groundY - hPx - 10);
      
      ctx.fillStyle = energy > wallHeight ? '#facc15' : '#ef4444';
      ctx.fillText(`Particle Energy (E): ${energy.toFixed(1)}`, 10, energyY - 10);

      // --- Status Text (FIXED POSITION) ---
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      
      // Moved Y coordinate to 100 to avoid overlapping the header
      const statusY = 100; 
      
      if (energy > wallHeight) {
        ctx.fillText("STATUS: FREE PARTICLE", cx, statusY);
      } else {
        const diff = wallHeight - energy;
        if (diff < 1.0) ctx.fillText("STATUS: TUNNELING (LEAKING OUT)", cx, statusY);
        else ctx.fillText("STATUS: TRAPPED", cx, statusY);
      }
      ctx.textAlign = 'left';

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// 4. Controls Component
const renderControls = ({ values, setValue }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
    
    {/* Wall Height Control */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400 transition-colors">
          Wall Height (V₀)
        </label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
          <span className="text-sm font-mono text-green-400 font-bold">{values.wallHeight.toFixed(1)}</span>
        </div>
      </div>
      <input 
        type="range" min="0" max="10" step="0.5"
        value={values.wallHeight}
        onChange={(e) => setValue('wallHeight', parseFloat(e.target.value))}
        className="glow-range"
      />
      <p className="text-[10px] text-zinc-600">How deep is the hole?</p>
    </div>

    {/* Well Width Control */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400 transition-colors">
          Well Width (L)
        </label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
          <span className="text-sm font-mono text-green-400 font-bold">{values.wellWidth.toFixed(1)}</span>
        </div>
      </div>
      <input 
        type="range" min="0.5" max="10" step="0.5"
        value={values.wellWidth}
        onChange={(e) => setValue('wellWidth', parseFloat(e.target.value))}
        className="glow-range"
      />
      <p className="text-[10px] text-zinc-600">How much room to wiggle?</p>
    </div>

    {/* Particle Energy Control */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400 transition-colors">
          Particle Energy (E)
        </label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
          <span className="text-sm font-mono text-green-400 font-bold">{values.energy.toFixed(1)}</span>
        </div>
      </div>
      <input 
        type="range" min="0.1" max="12" step="0.1"
        value={values.energy}
        onChange={(e) => setValue('energy', parseFloat(e.target.value))}
        className="glow-range"
      />
      <p className="text-[10px] text-zinc-600">Caffeine level of the ghost.</p>
    </div>

  </div>
);

// 5. Final Export
export const SIMULATION_43 = {
  title: 'The Quantum Trap',
  initialValues: { wellWidth: 4, wallHeight: 6, energy: 3 },
  achievements: achievements,
  renderSimulation: ({ values }: { values: SimState }) => (
    <QuantumCanvas values={values} />
  ),
  renderControls: renderControls
};