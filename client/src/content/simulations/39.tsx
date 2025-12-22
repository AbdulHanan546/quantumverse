import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine'; // Adjust import path as needed

// 1. Interface
interface QuantumState {
  n: number;         // Energy Level (Quantum Number)
  width: number;     // Width of the box
  viewMode: 'wave' | 'probability'; // 'wave' = Psi, 'probability' = |Psi|^2
}

// 2. Achievements
const achievements: Achievement<QuantumState>[] = [
  {
    id: 'ground-floor',
    title: 'Ground Floor',
    description: 'Chill out at Energy Level 1. It’s the lowest you can go. No zero energy allowed here!',
    condition: (s) => s.n === 1
  },
  {
    id: 'high-voltage',
    title: 'Hyped Up',
    description: 'Crank the energy to Level 5. Look at all those humps!',
    condition: (s) => s.n >= 5
  },
  {
    id: 'claustrophobia',
    title: 'Claustrophobia',
    description: 'Shrink the box width to less than 200px. Poor particle.',
    condition: (s) => s.width < 200
  },
  {
    id: 'seeing-ghosts',
    title: 'Ghost Hunter',
    description: 'Switch to "Probability Mode". Notice how the shape stops moving? That is why we call it a Stationary State.',
    condition: (s) => s.viewMode === 'probability'
  },
  {
    id: 'quantum-master',
    title: 'The Squeeze',
    description: 'Maximum energy (n=5) in a tiny box (width < 250). That is one angry particle.',
    condition: (s) => s.n === 5 && s.width < 250
  }
];

// 3. Canvas Logic
const QuantumCanvas = ({ values }: { values: QuantumState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const timeRef = useRef<number>(0);
  const valuesRef = useRef(values);

  // Keep ref in sync for the animation loop
  useEffect(() => { valuesRef.current = values; }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let canvasWidth = 0, canvasHeight = 0;

    const animate = () => {
      // 1. Resize Handling
      const parent = canvas.parentElement;
      if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
        canvasWidth = parent.clientWidth;
        canvasHeight = parent.clientHeight;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
      }

      const { n, width: boxWidth, viewMode } = valuesRef.current;
      
      // Speed of oscillation depends on Energy (n^2 roughly in physics, but let's just make it n for visual clarity)
      timeRef.current += 0.05 * n; 

      // Clear Screen
      ctx.fillStyle = '#18181b'; // zinc-950
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      const leftWall = centerX - boxWidth / 2;
      const rightWall = centerX + boxWidth / 2;

      // 2. Draw The Box (Walls)
      ctx.strokeStyle = '#71717a'; // zinc-500
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(leftWall, centerY - 150);
      ctx.lineTo(leftWall, centerY + 150);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(rightWall, centerY - 150);
      ctx.lineTo(rightWall, centerY + 150);
      ctx.stroke();

      // Floor line
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(leftWall, centerY);
      ctx.lineTo(rightWall, centerY);
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Draw the Quantum Wave
      ctx.beginPath();
      ctx.lineWidth = 3;
      
      // Visual styling based on mode
      if (viewMode === 'probability') {
        ctx.strokeStyle = '#f472b6'; // Pink for probability
        ctx.shadowColor = 'rgba(244, 114, 182, 0.5)';
      } else {
        ctx.strokeStyle = '#4ade80'; // Green for wavefunction
        ctx.shadowColor = 'rgba(74, 222, 128, 0.5)';
      }
      ctx.shadowBlur = 15;
      ctx.lineJoin = 'round';

      const amplitude = 100;

      // Iterate across the box width to draw the sine wave
      for (let x = 0; x <= boxWidth; x += 2) {
        // Normalized position (0 to 1)
        const xNorm = x / boxWidth;
        
        // The spatial part: sin(n * pi * x / L)
        const spatial = Math.sin(n * Math.PI * xNorm);

        let yOffset = 0;

        if (viewMode === 'wave') {
            // WAVEFUNCTION: Psi(x,t) includes time oscillation
            // It goes up and down.
            const temporal = Math.cos(timeRef.current); 
            yOffset = -amplitude * spatial * temporal;
        } else {
            // PROBABILITY: |Psi|^2
            // It is squared, so it's always positive and DOES NOT wiggle with time.
            // This is why it's a "Stationary State".
            yOffset = -amplitude * (spatial * spatial);
        }

        const drawX = leftWall + x;
        const drawY = centerY + yOffset;

        if (x === 0) ctx.moveTo(drawX, drawY);
        else ctx.lineTo(drawX, drawY);
      }
      ctx.stroke();

      // 4. Labels
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      
      ctx.fillText('x = 0', leftWall, centerY + 170);
      ctx.fillText(`x = L`, rightWall, centerY + 170);

      // Title in canvas
      ctx.fillStyle = viewMode === 'wave' ? '#4ade80' : '#f472b6';
      ctx.font = 'bold 16px sans-serif';
      const label = viewMode === 'wave' ? `Wavefunction Ψ (Oscillates)` : `Probability |Ψ|² (STATIONARY)`;
      ctx.fillText(label, centerX, centerY - 120);

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// 4. Controls Component
const RenderControls = ({ values, setValue }: { 
    values: QuantumState; 
    setValue: (key: keyof QuantumState, val: any) => void; 
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
    
    {/* Energy Level Slider */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400 transition-colors">
          Energy Level (n)
        </label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
          <span className="text-sm font-mono text-green-400 font-bold">n = {values.n}</span>
        </div>
      </div>
      <input
        type="range" min="1" max="5" step="1"
        value={values.n}
        onChange={(e) => setValue('n', parseInt(e.target.value))}
        className="glow-range"
      />
      <p className="text-[10px] text-zinc-600">More 'n' means more humps. Science!</p>
    </div>

    {/* Box Width Slider */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400 transition-colors">
          Box Width (L)
        </label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
          <span className="text-sm font-mono text-green-400 font-bold">{values.width}px</span>
        </div>
      </div>
      <input
        type="range" min="100" max="600" step="10"
        value={values.width}
        onChange={(e) => setValue('width', parseInt(e.target.value))}
        className="glow-range"
      />
    </div>

    {/* View Mode Toggle */}
    <div className="space-y-3 group">
       <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400 transition-colors block mb-4">
          Observation Mode
       </label>
       <div className="flex gap-2">
            <button 
                onClick={() => setValue('viewMode', 'wave')}
                className={`flex-1 py-2 px-4 rounded text-sm font-bold border transition-all
                    ${values.viewMode === 'wave' 
                        ? 'bg-green-500/10 border-green-500 text-green-400 shadow-[0_0_10px_rgba(74,222,128,0.2)]' 
                        : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:bg-zinc-700'}`}
            >
                Wavefunction (Ψ)
            </button>
            <button 
                 onClick={() => setValue('viewMode', 'probability')}
                 className={`flex-1 py-2 px-4 rounded text-sm font-bold border transition-all
                    ${values.viewMode === 'probability' 
                        ? 'bg-pink-500/10 border-pink-500 text-pink-400 shadow-[0_0_10px_rgba(244,114,182,0.2)]' 
                        : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:bg-zinc-700'}`}
            >
                Probability (|Ψ|²)
            </button>
       </div>
       <p className="text-[10px] text-zinc-600 mt-2">
           {values.viewMode === 'wave' 
             ? "The wave wiggles, but this isn't what we measure." 
             : "This is the 'Stationary' part. The shape doesn't move!"}
       </p>
    </div>

  </div>
);

// 5. Final Export
export const SIMULATION_39 = {
  title: 'Stationary States (Particle in a Box)',
  initialValues: { n: 1, width: 400, viewMode: 'wave' } as QuantumState,
  achievements: achievements,
  renderSimulation: ({ values }: { values: QuantumState }) => <QuantumCanvas values={values} />,
  renderControls: RenderControls
};