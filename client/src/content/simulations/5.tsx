import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine';

// --- 1. Interface ---
interface WaveState {
  amplitude: number; // How tall the wave is
  frequency: number; // How fast it moves in time
  harmonics: number; // How many "loops" or bumps (n)
  tension: number;   // Affects the "tightness" color visualization
}

// --- 2. Achievements ---
const achievements: Achievement<WaveState>[] = [
  {
    id: 'flatliner',
    title: 'The Flatliner',
    description: 'Kill the vibe completely. Set Amplitude to 0.',
    condition: (s) => s.amplitude === 0
  },
  {
    id: 'snake-charmer',
    title: 'Snake Charmer',
    description: 'Make it wiggle like a nervous snake (Harmonics > 8).',
    condition: (s) => s.harmonics > 8
  },
  {
    id: 'hyperspace',
    title: 'Hyperspace',
    description: 'Max out Frequency and Amplitude. Chaos mode activated.',
    condition: (s) => s.frequency >= 10 && s.amplitude >= 100
  },
  {
    id: 'pure-tone',
    title: 'The Fundamental',
    description: 'Return to basics. 1 Harmonic. Just a simple jump rope.',
    condition: (s) => s.harmonics === 1 && s.amplitude > 20
  },
  {
    id: 'frozen-time',
    title: 'Matrix Mode',
    description: 'Stop time while the wave is visible (Frequency 0, Amp > 0).',
    condition: (s) => s.frequency === 0 && s.amplitude > 0
  },
  {
    id: 'perfect-balance',
    title: 'Perfectly Balanced',
    description: 'Set everything to the number 5. Thanos would be proud.',
    condition: (s) => s.amplitude === 50 && Math.round(s.frequency) === 5 && s.harmonics === 5
  }
];

// --- 3. Canvas Component ---
const WaveCanvas = ({ values }: { values: WaveState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const timeRef = useRef<number>(0);
  
  // We use a ref for values to access the latest state inside the animation loop
  // without re-triggering the effect on every render cycle constantly.
  const valuesRef = useRef(values);

  useEffect(() => { valuesRef.current = values; }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0, height = 0;

    const animate = () => {
      // Auto-resize logic
      const parent = canvas.parentElement;
      if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
        width = parent.clientWidth;
        height = parent.clientHeight;
        canvas.width = width;
        canvas.height = height;
      }

      const { amplitude, frequency, harmonics, tension } = valuesRef.current;
      
      // Increment time based on frequency speed
      timeRef.current += frequency * 0.05;

      // Clear Screen
      ctx.fillStyle = '#09090b'; // Zinc-950 roughly
      ctx.fillRect(0, 0, width, height);

      const centerY = height / 2;
      
      // --- Draw The "Ghost" Envelope (The limits of the wave) ---
      ctx.beginPath();
      ctx.strokeStyle = '#27272a'; // Zinc-800
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      
      for (let x = 0; x <= width; x += 5) {
        // Spatial component only: sin(n * pi * x / L)
        const spatial = Math.sin((harmonics * Math.PI * x) / width);
        const y = centerY + (spatial * amplitude); // Top limit
        const y2 = centerY - (spatial * amplitude); // Bottom limit
        
        if (x===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      
      // Mirror ghost line
      ctx.beginPath();
      for (let x = 0; x <= width; x += 5) {
        const spatial = Math.sin((harmonics * Math.PI * x) / width);
        const y2 = centerY - (spatial * amplitude);
        if (x===0) ctx.moveTo(x, y2); else ctx.lineTo(x, y2);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // --- Draw The Actual Wave ---
      // Equation: y(x,t) = A * sin(kx) * cos(wt)
      
      ctx.beginPath();
      // Dynamic color based on tension/speed
      const r = 100 + (tension * 15);
      const g = 255 - (tension * 10);
      const b = 255;
      ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Glow effect
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.6)`;
      ctx.shadowBlur = 15;

      const timeComponent = Math.cos(timeRef.current);

      for (let x = 0; x <= width; x++) {
        // The Math: Standing Wave Equation
        // k = (n * pi) / L
        const spatialComponent = Math.sin((harmonics * Math.PI * x) / width);
        
        // Final Displacement
        const y = centerY + (amplitude * spatialComponent * timeComponent);
        
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // --- Draw Nodes (Points that never move) ---
      ctx.fillStyle = '#ef4444'; // Red dots
      ctx.shadowBlur = 0;
      for (let i = 0; i <= harmonics; i++) {
        const nodeX = (width / harmonics) * i;
        ctx.beginPath();
        ctx.arc(nodeX, centerY, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// --- 4. Controls Component ---
const renderControls = ({ values, setValue }: { 
    values: WaveState, 
    setValue: (k: keyof WaveState, v: any) => void 
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
    
    {/* Amplitude Control */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-blue-400 transition-colors">
            Loudness (Amplitude)
        </label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
          <span className="text-sm font-mono text-blue-400 font-bold">
            {values.amplitude.toFixed(0)} <span className="text-zinc-500 text-xs">px</span>
          </span>
        </div>
      </div>
      <input 
        type="range" min="0" max="150" step="1"
        value={values.amplitude}
        onChange={(e) => setValue('amplitude', parseFloat(e.target.value))}
        className="glow-range accent-blue-500"
      />
    </div>

    {/* Frequency Control */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-purple-400 transition-colors">
            Speed (Freq)
        </label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
          <span className="text-sm font-mono text-purple-400 font-bold">
            {values.frequency.toFixed(1)} <span className="text-zinc-500 text-xs">Hz</span>
          </span>
        </div>
      </div>
      <input 
        type="range" min="0" max="10" step="0.5"
        value={values.frequency}
        onChange={(e) => setValue('frequency', parseFloat(e.target.value))}
        className="glow-range accent-purple-500"
      />
    </div>

    {/* Harmonics Control */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400 transition-colors">
            Loops (Harmonics)
        </label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
          <span className="text-sm font-mono text-green-400 font-bold">
            n = {values.harmonics}
          </span>
        </div>
      </div>
      <input 
        type="range" min="1" max="12" step="1"
        value={values.harmonics}
        onChange={(e) => setValue('harmonics', parseFloat(e.target.value))}
        className="glow-range accent-green-500"
      />
      <p className="text-[10px] text-zinc-600">The number of bumps on the string.</p>
    </div>

     {/* Tension Control (Cosmetic + Color) */}
     <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-orange-400 transition-colors">
            String Tension
        </label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
          <span className="text-sm font-mono text-orange-400 font-bold">
            {values.tension.toFixed(0)}%
          </span>
        </div>
      </div>
      <input 
        type="range" min="1" max="10" step="1"
        value={values.tension}
        onChange={(e) => setValue('tension', parseFloat(e.target.value))}
        className="glow-range accent-orange-500"
      />
      <p className="text-[10px] text-zinc-600">Changes the color (simulates heat/stress).</p>
    </div>

  </div>
);

// --- 5. Export ---
export const SIMULATION_5 = {
    title: 'The Wiggle Wire',
    initialValues: { amplitude: 60, frequency: 2, harmonics: 3, tension: 5 },
    achievements: achievements,
    renderSimulation: ({ values }: { values: WaveState }) => (
        <WaveCanvas values={values} />
    ),
    renderControls: renderControls
};