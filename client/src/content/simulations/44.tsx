import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine'; // Adjust import path as needed

// 1. Interface
interface SimState {
  /** 
   * 0 = Pure Wave (We know Speed/Momentum perfectly, Position is a mystery)
   * 100 = Pure Particle (We know Position perfectly, Speed is chaos)
   */
  focus: number; 
  /** A toggle to freeze time to help users contemplate their life choices */
  paused: boolean;
}

// 2. Achievements
const achievements: Achievement<SimState>[] = [
  {
    id: 'paparazzi',
    title: ' The Paparazzi',
    description: 'Focus 100% on Position. You know exactly where it is, but it has now ascended to a higher plane of chaotic speed.',
    condition: (s) => s.focus >= 95
  },
  {
    id: 'zen-monk',
    title: 'The Zen Monk',
    description: 'Focus 100% on Momentum. The particle is now "one with the universe" (everywhere at once).',
    condition: (s) => s.focus <= 5
  },
  {
    id: 'compromise',
    title: 'The Diplomat',
    description: 'Find the boring middle ground (45-55%). A little fuzzy here, a little fuzzy there.',
    condition: (s) => s.focus > 45 && s.focus < 55
  },

  {
    id: 'time-lord',
    title: 'Time Lord',
    description: 'Pause the simulation while the particle is having an identity crisis.',
    condition: (s) => s.paused && s.focus > 80
  }
];

// 3. Canvas Visualization
const QuantumCanvas = ({ values }: { values: SimState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const timeRef = useRef<number>(0);
  
  // Use a ref for values to avoid re-creating the animate function constantly
  const valuesRef = useRef(values);
  useEffect(() => { valuesRef.current = values; }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0, height = 0;

    const animate = () => {
      // Auto-resize
      const parent = canvas.parentElement;
      if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
        width = parent.clientWidth;
        height = parent.clientHeight;
        canvas.width = width;
        canvas.height = height;
      }

      const { focus, paused } = valuesRef.current;
      if (!paused) {
        timeRef.current += 0.05;
      }

      // --- Physics / Visual Logic ---
      // Focus 0 (Wave/Momentum) -> Width is Large, Jitter is Low
      // Focus 100 (Particle/Position) -> Width is Tiny, Jitter is High
      
      const normalizedFocus = focus / 100; // 0 to 1
      
      // The "Spread" (Standard Deviation)
      // If focus is high (1), spread is tiny (10px). If focus is low (0), spread is huge (width/3).
      const spreadBase = width / 2.5; 
      const spread = spreadBase - (normalizedFocus * (spreadBase - 15)); 
      
      // The "Jitter" (Momentum Uncertainty)
      // If we know position (focus 1), momentum is uncertain (high frequency chaos).
      const baseFreq = 0.1;
      const uncertaintyMultiplier = normalizedFocus * 20; // High focus = high chaos
      
      ctx.fillStyle = '#09090b'; // Zinc-950
      ctx.fillRect(0, 0, width, height);

      // Draw Grid (The "Fabric of Reality")
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for(let x=0; x<width; x+=50) { ctx.moveTo(x,0); ctx.lineTo(x,height); }
      for(let y=0; y<height; y+=50) { ctx.moveTo(0,y); ctx.lineTo(width,y); }
      ctx.stroke();

      const centerY = height / 2;
      const centerX = width / 2;

      // Draw the Probability Wave Function
      ctx.beginPath();
      ctx.lineWidth = 3;
      
      // Color shifts from Blue (Wave) to Red (Particle/High Energy State)
      const hue = 200 - (normalizedFocus * 150); // 200 (blue) to 50 (gold/red)
      ctx.strokeStyle = `hsl(${hue}, 80%, 60%)`;
      ctx.shadowBlur = 15;
      ctx.shadowColor = `hsl(${hue}, 80%, 40%)`;

      // Draw the wave packet
      for (let x = 0; x < width; x+=2) {
        const distFromCenter = x - centerX;
        
        // Gaussian Envelope (The "Bell Curve" of probability)
        // e^(-x^2 / 2sigma^2)
        const envelope = Math.exp( - (distFromCenter * distFromCenter) / (2 * spread * spread) );
        
        // The Sine Wave inside (The "Pilot Wave")
        // If momentum is uncertain (high focus), the phase shifts erratically
        const phaseShift = paused ? timeRef.current : (timeRef.current * (1 + (Math.random() * uncertaintyMultiplier * 0.2)));
        const sine = Math.sin((distFromCenter * 0.1) - phaseShift * 5);

        // Combine
        const y = centerY - (envelope * sine * (height / 3));
        
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw the "Observed" Particle (if Focus is high enough)
      // This represents the user trying to "pin" it down
      if (normalizedFocus > 0.8) {
        ctx.fillStyle = `rgba(255, 255, 255, ${normalizedFocus})`;
        const particleSize = 4 + (Math.random() * uncertaintyMultiplier); // Vibrating
        // Randomly offset the dot slightly to show uncertainty
        const jitterX = (Math.random() - 0.5) * uncertaintyMultiplier * 2;
        
        ctx.beginPath();
        ctx.arc(centerX + jitterX, centerY, particleSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Add "CONFUSED" label if strictly pinned
        if (normalizedFocus > 0.95 && !paused) {
           ctx.fillStyle = '#ef4444';
           ctx.font = '12px monospace';
           ctx.fillText("??? km/h", centerX + 20, centerY - 20);
        }
      }

      // Information HUD on Canvas
      ctx.fillStyle = '#71717a';
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Δx (Pos Uncertainty): ${spread.toFixed(1)}px`, 20, 30);
      
      // Faking the constant relationship: Δx * Δp ≈ constant
      // If spread is small, momentum uncertainty is HUGE
      const momentumUncertainty = 5000 / spread;
      ctx.fillText(`Δp (Mom Uncertainty): ${momentumUncertainty.toFixed(1)} kg·m/s`, 20, 50);

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// 4. Controls
const renderControls = ({ values, setValue }: { 
  values: SimState; 
  setValue: (key: keyof SimState, val: any) => void 
}) => (
  <div className="flex flex-col gap-6 max-w-4xl mx-auto">
    
    <div className="flex justify-between items-center bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
      <div className="text-zinc-400 text-sm italic">
        "The more precisely the position is determined, the less precisely the momentum is known in this instant, and vice versa." 
        <br/> <span className="text-xs text-zinc-600">— Werner Heisenberg (probably while looking for his car keys)</span>
      </div>
      
      <button 
        onClick={() => setValue('paused', !values.paused)}
        className={`px-4 py-2 rounded font-bold text-xs uppercase tracking-widest transition-all
          ${values.paused 
            ? 'bg-yellow-500 text-black hover:bg-yellow-400' 
            : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}
      >
        {values.paused ? 'Resume Reality' : 'Freeze Time'}
      </button>
    </div>

    {/* The Main Trade-off Slider */}
    <div className="space-y-4 group">
      <div className="flex justify-between items-end">
        <div className="text-left">
           <label className="text-xs font-bold text-blue-400 uppercase tracking-widest">
             Knowing Velocity (Wave)
           </label>
           <div className="text-xs text-zinc-500">I know how fast, but not where.</div>
        </div>

        <div className="text-center bg-black px-4 py-2 rounded-full border border-zinc-700 shadow-inner">
           <span className="text-lg font-mono font-bold text-white">
             {values.focus < 50 ? 'WAVE MODE' : values.focus > 90 ? 'PARTICLE MODE' : 'CONFUSED HYBRID'}
           </span>
        </div>

        <div className="text-right">
           <label className="text-xs font-bold text-red-400 uppercase tracking-widest">
             Knowing Position (Particle)
           </label>
           <div className="text-xs text-zinc-500">I know where, but not how fast.</div>
        </div>
      </div>
      
      <input 
        type="range" min="0" max="100" step="1"
        value={values.focus}
        onChange={(e) => setValue('focus', parseFloat(e.target.value))}
        className="w-full h-3 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-400 transition-all"
        style={{
          background: `linear-gradient(to right, #3b82f6 0%, #22c55e 50%, #ef4444 100%)`
        }}
      />
      
      <div className="flex justify-between text-xs font-mono text-zinc-600 pt-1">
        <span>Δp = 0 (Perfect Speed)</span>
        <span>Heisenberg Limit</span>
        <span>Δx = 0 (Perfect Spot)</span>
      </div>
    </div>

  </div>
);

// 5. Export
export const SIMULATION_44 = {
  title: "Heisenberg's Uncertainty",
  initialValues: { focus: 10, paused: false },
  achievements: achievements,
  renderSimulation: ({ values }: { values: SimState }) => (
    <QuantumCanvas values={values} />
  ),
  renderControls: renderControls
};