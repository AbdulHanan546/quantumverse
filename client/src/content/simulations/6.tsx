import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine';

// 1. The "Rope Status" State
interface WaveSpeedState {
  tension: number;    // How hard we pull the rope (T)
  thickness: number;  // How heavy/fat the rope is (μ)
  wiggleSpeed: number; // The frequency of the hand shaking (f)
  amplitude: number;  // How big the wiggles are
}

// 2. Missions for the "Rope Master"
const achievements: Achievement<WaveSpeedState>[] = [
  {
    id: 'violin-string',
    title: 'The Violin String',
    description: 'Pull it tight (Tension > 18) and make it thin (Thickness < 2). Super fast vibes!',
    condition: (s) => s.tension > 18 && s.thickness < 2
  },
  {
    id: 'anchor-chain',
    title: 'The Anchor Chain',
    description: 'Low tension (T < 3) and max thickness. It moves like it just woke up.',
    condition: (s) => s.tension < 3 && s.thickness > 9
  },
  {
    id: 'speed-demon',
    title: 'Speed Demon',
    description: 'Reach a calculated wave speed of more than 4.0 units.',
    condition: (s) => Math.sqrt(s.tension / s.thickness) > 4.0
  },
  {
    id: 'the-slug',
    title: 'The Slug',
    description: 'Reach a wave speed slower than 0.5 units.',
    condition: (s) => Math.sqrt(s.tension / s.thickness) < 0.5
  },
  {
    id: 'rhythmic-gymnast',
    title: 'Rhythmic Gymnast',
    description: 'Set the Wiggle Speed to max. Look at those ripples go!',
    condition: (s) => s.wiggleSpeed >= 9.5
  },
  {
    id: 'ghost-rope',
    title: 'The Ghost Rope',
    description: 'Make the rope as thin as possible.',
    condition: (s) => s.thickness <= 1.0
  }
];

// 3. The Visualizer: A traveling wave on a rope
const RopeCanvas = ({ values }: { values: WaveSpeedState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const offsetRef = useRef<number>(0);
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

      const { tension, thickness, wiggleSpeed, amplitude } = valuesRef.current;
      
      // The Physics: v = sqrt(T / mu)
      const velocity = Math.sqrt(tension / thickness);
      
      // Move the wave forward based on velocity
      offsetRef.current += velocity * 0.1;

      // --- Drawing ---
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      const cy = height / 2;

      // Draw horizontal reference line
      ctx.strokeStyle = '#18181b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, cy); ctx.lineTo(width, cy);
      ctx.stroke();

      // Draw the Rope
      ctx.beginPath();
      // Tension affects color (Blue to Gold)
      ctx.strokeStyle = `hsl(${200 - tension * 10}, 80%, 60%)`;
      // Thickness affects line width
      ctx.lineWidth = 1 + thickness;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const points = 100;
      for (let i = 0; i <= points; i++) {
        const x = (i / points) * width;
        
        /**
         * Traveling Wave Formula: y = A * sin(k*x - omega*t)
         * We simplify this to: y = A * sin( (frequency * x) - offset )
         */
        const wavelength = 0.02; // Fixed spatial frequency
        const y = amplitude * Math.sin((x * wavelength * wiggleSpeed) - offsetRef.current);
        
        if (i === 0) ctx.moveTo(x, cy + y);
        else ctx.lineTo(x, cy + y);
      }
      ctx.stroke();

      // Draw the "Shaker" hand
      ctx.fillStyle = '#4ade80';
      const handY = cy + amplitude * Math.sin(-offsetRef.current);
      ctx.beginPath();
      ctx.arc(10, handY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Speedometer UI
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`WAVE SPEED: ${velocity.toFixed(2)} km/h-ish`, 20, 30);
      
      const tensionPercent = (tension / 20) * 100;
      ctx.fillStyle = '#71717a';
      ctx.fillText(`TENSION: ${tensionPercent.toFixed(0)}%`, 20, 50);

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full cursor-crosshair" />;
};

// 4. The Control Panel
const renderControls = ({ values, setValue }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
    
    {/* Tension Slider */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-blue-400 transition-colors italic">Pull Tightness</label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
            <span className="text-sm font-mono text-blue-400 font-bold">{values.tension.toFixed(1)}</span>
        </div>
      </div>
      <input 
        type="range" min="1" max="20" step="0.5"
        value={values.tension}
        onChange={(e) => setValue('tension', parseFloat(e.target.value))}
        className="glow-range-blue"
      />
    </div>

    {/* Thickness Slider */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-zinc-300 transition-colors italic">Rope Heaviness</label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
            <span className="text-sm font-mono text-zinc-300 font-bold">{values.thickness.toFixed(1)}</span>
        </div>
      </div>
      <input 
        type="range" min="0.5" max="10" step="0.5"
        value={values.thickness}
        onChange={(e) => setValue('thickness', parseFloat(e.target.value))}
        className="glow-range"
      />
    </div>

    {/* Wiggle Speed Slider */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400 transition-colors italic">Wiggle Speed (f)</label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
            <span className="text-sm font-mono text-green-400 font-bold">{values.wiggleSpeed.toFixed(1)}</span>
        </div>
      </div>
      <input 
        type="range" min="1" max="10" step="0.5"
        value={values.wiggleSpeed}
        onChange={(e) => setValue('wiggleSpeed', parseFloat(e.target.value))}
        className="glow-range-green"
      />
    </div>

    {/* Amplitude Slider */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-yellow-400 transition-colors italic">Wave Height</label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
            <span className="text-sm font-mono text-yellow-400 font-bold">{values.amplitude.toFixed(0)}</span>
        </div>
      </div>
      <input 
        type="range" min="0" max="80" step="5"
        value={values.amplitude}
        onChange={(e) => setValue('amplitude', parseFloat(e.target.value))}
        className="glow-range-yellow"
      />
    </div>

  </div>
);

// 5. Final Export Object
export const SIMULATION_6 = {
  title: 'The Shrug Line: Wave Speed Lab',
  initialValues: { 
    tension: 10, 
    thickness: 4, 
    wiggleSpeed: 5, 
    amplitude: 40 
  },
  achievements: achievements,
  renderSimulation: ({ values }: { values: WaveSpeedState }) => (
    <RopeCanvas values={values} />
  ),
  renderControls: renderControls
};