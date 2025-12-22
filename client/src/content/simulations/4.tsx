import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine';

// 1. The "Wave Tank" State
interface WaveState {
  amplitude: number;
  frequency: number;
  speed: number;
  isStanding: boolean; // Toggle between Traveling and Standing
}

// 2. The "Wave Hunter" Missions
const achievements: Achievement<WaveState>[] = [
  {
    id: 'marathon-runner',
    title: 'Marathon Runner',
    description: 'Launch a traveling wave. It’s got places to be and energy to deliver.',
    condition: (s) => !s.isStanding && s.amplitude > 20
  },
  {
    id: 'guitar-hero',
    title: 'The Guitar String',
    description: 'Toggle on Standing Wave mode. Look at it wiggle without moving an inch!',
    condition: (s) => s.isStanding && s.amplitude > 20
  },
  {
    id: 'high-c',
    title: 'The High C',
    description: 'Max out the frequency in standing mode. Your virtual ears might be ringing.',
    condition: (s) => s.isStanding && s.frequency >= 9.5
  },
  {
    id: 'lazy-ripple',
    title: 'Lazy River',
    description: 'Traveling wave at minimum speed. It’ll get there... eventually.',
    condition: (s) => !s.isStanding && s.speed <= 1.5 && s.amplitude > 0
  },
  {
    id: 'flatline',
    title: 'Absolute Silence',
    description: 'Set amplitude to 0. The universe is at peace.',
    condition: (s) => s.amplitude === 0
  },
  {
    id: 'tsunami',
    title: 'Virtual Tsunami',
    description: 'Maximum amplitude traveling wave. Watch out for the splash!',
    condition: (s) => !s.isStanding && s.amplitude >= 95
  }
];

// 3. The Wave Visualizer
const WaveCanvas = ({ values }: { values: WaveState }) => {
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

      const { amplitude, frequency, speed, isStanding } = valuesRef.current;
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      const cy = height / 2;
      timeRef.current += 0.05;

      // Draw Guide Lines
      ctx.strokeStyle = '#18181b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, cy); ctx.lineTo(width, cy);
      ctx.stroke();

      // Draw the Wave
      ctx.beginPath();
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = isStanding ? '#8b5cf6' : '#06b6d4'; // Purple for standing, Cyan for traveling
      
      // We draw the string as a series of connected points
      for (let x = 0; x < width; x += 2) {
        let y = 0;
        const k = (frequency * Math.PI * 2) / width; // Wave number
        const omega = speed * 0.1;

        if (isStanding) {
          /**
           * Standing Wave Math: y = 2A * sin(kx) * cos(wt)
           * It looks like two waves traveling in opposite directions.
           */
          y = amplitude * Math.sin(k * x) * Math.cos(timeRef.current * frequency * 0.5);
        } else {
          /**
           * Traveling Wave Math: y = A * sin(kx - wt)
           * Energy moves from left to right.
           */
          y = amplitude * Math.sin(k * x - timeRef.current * speed);
        }

        if (x === 0) ctx.moveTo(x, cy + y);
        else ctx.lineTo(x, cy + y);
      }
      ctx.stroke();

      // Draw "Particles" (Nodes/Antinodes or Energy indicators)
      if (isStanding && amplitude > 0) {
        ctx.fillStyle = '#ef4444';
        // Mark the Nodes (spots that never move)
        const nodeSpacing = width / (frequency * 2);
        for (let i = 0; i <= frequency * 2; i++) {
          ctx.beginPath();
          ctx.arc(i * nodeSpacing, cy, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Metadata UI
      ctx.fillStyle = isStanding ? '#8b5cf6' : '#06b6d4';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(isStanding ? "MODE: STANDING (STUCK)" : "MODE: TRAVELING (GO!)", 20, height - 20);

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// 4. The Control Center
const renderControls = ({ values, setValue }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
    
    {/* Mode Toggle */}
    <div className="flex flex-col justify-center items-center p-4 bg-zinc-800/30 rounded-xl border border-zinc-700 space-y-3">
      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Wave Type</label>
      <button 
        onClick={() => setValue('isStanding', !values.isStanding)}
        className={`px-6 py-2 rounded-full font-bold transition-all ${
          values.isStanding 
          ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]' 
          : 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]'
        }`}
      >
        {values.isStanding ? 'Standing' : 'Traveling'}
      </button>
    </div>

    {/* Amplitude Slider */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400">Wave Height (A)</label>
        <span className="text-sm font-mono text-green-400 font-bold">{values.amplitude.toFixed(0)}</span>
      </div>
      <input 
        type="range" min="0" max="100" step="5"
        value={values.amplitude}
        onChange={(e) => setValue('amplitude', parseFloat(e.target.value))}
        className="glow-range"
      />
    </div>

    {/* Frequency Slider */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400">Wiggle Speed (f)</label>
        <span className="text-sm font-mono text-green-400 font-bold">{values.frequency.toFixed(1)}</span>
      </div>
      <input 
        type="range" min="1" max="10" step="0.5"
        value={values.frequency}
        onChange={(e) => setValue('frequency', parseFloat(e.target.value))}
        className="glow-range"
      />
    </div>

    {/* Speed Slider */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400">Travel Speed (v)</label>
        <span className="text-sm font-mono text-green-400 font-bold">{values.speed.toFixed(1)}</span>
      </div>
      <input 
        type="range" min="1" max="10" step="0.5"
        disabled={values.isStanding}
        value={values.speed}
        onChange={(e) => setValue('speed', parseFloat(e.target.value))}
        className={`glow-range ${values.isStanding ? 'opacity-20 cursor-not-allowed' : ''}`}
      />
    </div>

  </div>
);

// 5. Simulation Package
export const SIMULATION_4 = {
  title: 'Wave Laboratory: Traveling vs Standing',
  initialValues: { 
    amplitude: 40, 
    frequency: 3, 
    speed: 5, 
    isStanding: false 
  },
  achievements: achievements,
  renderSimulation: ({ values }: { values: WaveState }) => (
    <WaveCanvas values={values} />
  ),
  renderControls: renderControls
};