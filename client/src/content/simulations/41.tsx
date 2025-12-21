import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine'; // Adjust path if needed

// --- 1. Interface & State ---

interface QuantumState {
  n: number;          // Quantum number (Energy Level)
  width: number;      // Width of the box (L)
  showProbability: boolean; // Toggle between Wave Function (ψ) and Probability Density (|ψ|²)
}

// --- 2. Achievements ---

const achievements: Achievement<QuantumState>[] = [
  {
    id: 'ground-state',
    title: 'The Lazy Electron',
    description: 'Set the energy level (n) to 1. Even at absolute zero, this thing refuses to stop moving.',
    condition: (s) => s.n === 1
  },
  {
    id: 'sugar-rush',
    title: 'Quantum Sugar Rush',
    description: 'Crank the energy level (n) up to 10 or higher. Look at all those wiggles!',
    condition: (s) => s.n >= 10
  },
  {
    id: 'claustrophobia',
    title: 'Quantum Claustrophobia',
    description: 'Shrink the box width to less than 2nm. It gets cramped in the subatomic realm.',
    condition: (s) => s.width < 2
  },
  {
    id: 'ghost-hunter',
    title: 'Ghost Hunter',
    description: 'Switch to "Probability Mode". We can\'t know exactly where the particle is, only where it MIGHT be.',
    condition: (s) => s.showProbability === true
  },
  {
    id: 'impossible-spot',
    title: 'The Impossible Spot',
    description: 'Find a state (n=2, 4, etc.) where there is a "Node" exactly in the middle. The particle can be on the left, or right, but NEVER in the center. Magic.',
    condition: (s) => s.n > 1 && s.n % 2 === 0
  }
];

// --- 3. The Visualization (Canvas) ---

const QuantumCanvas = ({ values }: { values: QuantumState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const timeRef = useRef<number>(0);
  
  const valuesRef = useRef(values);
  useEffect(() => { valuesRef.current = values; }, [values]);

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
      }

      const { n, width: boxWidthVal, showProbability } = valuesRef.current;
      
      // Clear screen
      ctx.fillStyle = '#18181b'; 
      ctx.fillRect(0, 0, width, height);

      // --- Setup Coordinate System ---
      // Box width relative to screen (responsive)
      const pixelBoxWidth = (boxWidthVal / 10) * (width * 0.8); 
      const startX = (width - pixelBoxWidth) / 2;
      const endX = startX + pixelBoxWidth;
      const centerY = height / 2;
      const boxHeight = 150; // Distance from center to top/bottom wall

      // --- Draw The "Box" (The Prison Walls) ---
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 20;
      
      // Left Wall
      ctx.beginPath();
      ctx.moveTo(startX, centerY - boxHeight);
      ctx.lineTo(startX, centerY + boxHeight);
      ctx.stroke();

      // Right Wall
      ctx.beginPath();
      ctx.moveTo(endX, centerY - boxHeight);
      ctx.lineTo(endX, centerY + boxHeight);
      ctx.stroke();
      
      ctx.shadowBlur = 0;

      // --- Physics Math ---
      timeRef.current += 0.05;
      
      ctx.beginPath();
      ctx.lineWidth = 3;
      
      if (showProbability) {
        ctx.strokeStyle = '#fbbf24'; 
        ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 10;
      } else {
        ctx.strokeStyle = '#4ade80';
        ctx.shadowColor = '#4ade80';
        ctx.shadowBlur = 15;
      }

      const step = 2;
      let first = true;

      for (let x = 0; x <= pixelBoxWidth; x += step) {
        const xNorm = x / pixelBoxWidth;
        const spatialPart = Math.sin(n * Math.PI * xNorm);
        
        let yOffset = 0;
        const amplitude = 100;

        if (showProbability) {
          yOffset = -1 * (spatialPart * spatialPart) * amplitude;
        } else {
          const timePart = Math.cos(timeRef.current * n * 0.5);
          yOffset = spatialPart * timePart * amplitude;
        }

        const canvasX = startX + x;
        const canvasY = centerY + yOffset;

        if (first) {
          ctx.moveTo(canvasX, canvasY);
          first = false;
        } else {
          ctx.lineTo(canvasX, canvasY);
        }
      }

      ctx.stroke();

      if (showProbability) {
        ctx.lineTo(endX, centerY);
        ctx.lineTo(startX, centerY);
        ctx.fill();
      }

      // --- Nodes Visualization ---
      if (!showProbability) {
        ctx.fillStyle = '#ffffff';
        for (let i = 1; i < n; i++) {
            const nodeX = startX + (i / n) * pixelBoxWidth;
            ctx.beginPath();
            ctx.arc(nodeX, centerY, 3, 0, Math.PI * 2);
            ctx.fill();
        }
      }

      // --- Text Labels ---
      ctx.font = '12px monospace';
      ctx.fillStyle = '#71717a';
      ctx.textAlign = 'center';
      
      // X Axis Labels (Below box)
      ctx.fillText('x = 0', startX, centerY + boxHeight + 20);
      ctx.fillText(`x = L`, endX, centerY + boxHeight + 20);
      
      // Main Title (Moved to BOTTOM so it doesn't overlap the Header)
      ctx.fillStyle = showProbability ? '#fbbf24' : '#4ade80';
      ctx.font = 'bold 16px monospace';
      // Drawing it well below the box and axis labels
      ctx.fillText(showProbability ? `PROBABILITY DENSITY |ψ|²` : `WAVE FUNCTION ψ`, width/2, centerY + boxHeight + 50);

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// --- 4. Controls ---

const RenderControls = ({ values, setValue }: { 
  values: QuantumState, 
  setValue: (k: keyof QuantumState, v: any) => void 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      
      {/* Energy Level */}
      <div className="space-y-3 group">
        <div className="flex justify-between items-end">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400 transition-colors">
            Energy Level (n)
          </label>
          <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
            <span className="text-sm font-mono text-green-400 font-bold">
              n = {values.n}
            </span>
          </div>
        </div>
        <input
          type="range" min="1" max="12" step="1"
          value={values.n}
          onChange={(e) => setValue('n', parseInt(e.target.value))}
          className="glow-range"
        />
        <p className="text-[10px] text-zinc-600">
          Higher 'n' means more energy and more "humps" in the wave.
        </p>
      </div>

      {/* Box Width */}
      <div className="space-y-3 group">
        <div className="flex justify-between items-end">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400 transition-colors">
            Box Width (L)
          </label>
          <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
            <span className="text-sm font-mono text-green-400 font-bold">
              {values.width.toFixed(1)} <span className="text-zinc-500 text-xs">nm</span>
            </span>
          </div>
        </div>
        <input
          type="range" min="1" max="10" step="0.5"
          value={values.width}
          onChange={(e) => setValue('width', parseFloat(e.target.value))}
          className="glow-range"
        />
        <p className="text-[10px] text-zinc-600">
          Making the prison smaller actually increases the particle's energy!
        </p>
      </div>

      {/* View Mode */}
      <div className="space-y-3 group flex flex-col justify-end pb-1">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 group-hover:text-green-400 transition-colors">
            Visualization Mode
        </label>
        <button
          onClick={() => setValue('showProbability', !values.showProbability)}
          className={`
            w-full py-3 rounded-lg border font-bold text-sm transition-all duration-300 uppercase tracking-wider
            ${values.showProbability 
              ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
              : 'bg-green-500/10 border-green-500/50 text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.2)]'}
          `}
        >
          {values.showProbability ? 'Showing: Probability' : 'Showing: Wave Function'}
        </button>
        <p className="text-[10px] text-zinc-600">
           Wave = Movement. Probability = Where it likely is.
        </p>
      </div>

    </div>
  );
};

// --- 5. Export ---

export const SIMULATION_41 = {
  title: 'The Quantum Prison',
  initialValues: { n: 1, width: 5, showProbability: false },
  achievements: achievements,
  renderSimulation: ({ values }: { values: QuantumState }) => <QuantumCanvas values={values} />,
  renderControls: RenderControls
};