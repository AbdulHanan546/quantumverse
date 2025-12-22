import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine';

// 1. The "Wiggler" State
interface PendulumState {
  length: number;    // How long the string is
  gravity: number;   // Moon vs Earth vs Jupiter
  startAngle: number; // How far you pull it back
  damping: number;    // Air thickness/friction
}

// 2. Secret "Missions" (Achievements)
const achievements: Achievement<PendulumState>[] = [
  {
    id: 'lanky-swing',
    title: 'The Grandfather Clock',
    description: 'Set the length to the absolute maximum. Big strings make slow vibes.',
    condition: (s) => s.length >= 290
  },
  {
    id: 'moon-vibes',
    title: 'Moon Walker',
    description: 'Turn gravity down to its lowest point. Space is slow, man.',
    condition: (s) => s.gravity <= 2.0
  },
  {
    id: 'jupiter-energy',
    title: 'Heavyweight Champion',
    description: 'Set gravity to maximum. Jupiter is not a fan of long swings.',
    condition: (s) => s.gravity >= 18.0
  },
  {
    id: 'vacuum-sealed',
    title: 'Perpetual Motion?',
    description: 'Remove all air resistance (damping = 0). It’ll wiggle forever!',
    condition: (s) => s.damping === 0
  },
  {
    id: 'tiny-tock',
    title: 'The Hummingbird',
    description: 'Short string + Max Gravity. It’s wiggling so fast it’s basically humming.',
    condition: (s) => s.length < 60 && s.gravity > 15
  },
  {
    id: 'zen-mode',
    title: 'Perfect Zen',
    description: 'Stop the motion entirely by setting the start angle to 0.',
    condition: (s) => s.startAngle === 0
  }
];

// 3. The Visualizer
const PendulumCanvas = ({ values }: { values: PendulumState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const timeRef = useRef<number>(0);
  const angleRef = useRef<number>(0);
  const valuesRef = useRef(values);

  useEffect(() => { 
    valuesRef.current = values;
    // Reset position if angle is set to 0
    if (values.startAngle === 0) angleRef.current = 0;
  }, [values]);

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

      const { length, gravity, startAngle, damping } = valuesRef.current;
      
      // SHM Math: T = 2π√(L/g)
      // We use a simplified angular frequency ω
      const omega = Math.sqrt(gravity * 10 / length);
      timeRef.current += 0.016; // Approx 60fps

      // Calculate Angle with Damping
      // θ(t) = θ0 * e^(-bt) * cos(ωt)
      const decay = Math.exp(-damping * timeRef.current * 0.1);
      const currentAngle = (startAngle * (Math.PI / 180)) * decay * Math.cos(omega * timeRef.current * 10);

      // --- Drawing ---
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      const pivotX = width / 2;
      const pivotY = 50;
      const bobX = pivotX + Math.sin(currentAngle) * length;
      const bobY = pivotY + Math.cos(currentAngle) * length;

      // Pivot Base
      ctx.fillStyle = '#27272a';
      ctx.fillRect(pivotX - 30, pivotY - 10, 60, 10);

      // String
      ctx.beginPath();
      ctx.strokeStyle = '#52525b';
      ctx.lineWidth = 2;
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(bobX, bobY);
      ctx.stroke();

      // Motion Trail (Slightly fancy)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.1)';
      ctx.arc(pivotX, pivotY, length, (Math.PI/2) - (startAngle * Math.PI/180), (Math.PI/2) + (startAngle * Math.PI/180));
      ctx.stroke();

      // The Bob (The actual weight)
      ctx.fillStyle = '#18181b';
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(74, 222, 128, 0.5)';
      ctx.shadowBlur = 20;
      
      ctx.beginPath();
      ctx.arc(bobX, bobY, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Speed Indicator
      const speed = Math.abs(Math.sin(omega * timeRef.current * 10)) * 100;
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#4ade80';
      ctx.font = '10px monospace';
      ctx.fillText(`VIBE SPEED: ${speed.toFixed(0)}%`, bobX + 25, bobY);

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// 4. The Dashboard
const renderControls = ({ values, setValue }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
    
    {/* Length Control */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400">String Length</label>
        <span className="text-sm font-mono text-green-400 font-bold">{values.length} <span className="text-zinc-600 text-xs">cm</span></span>
      </div>
      <input 
        type="range" min="50" max="300" step="10"
        value={values.length}
        onChange={(e) => setValue('length', parseFloat(e.target.value))}
        className="glow-range"
      />
    </div>

    {/* Gravity Control */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400">Planet Gravity</label>
        <span className="text-sm font-mono text-green-400 font-bold">{values.gravity.toFixed(1)} <span className="text-zinc-600 text-xs">m/s²</span></span>
      </div>
      <input 
        type="range" min="1.6" max="20" step="0.2"
        value={values.gravity}
        onChange={(e) => setValue('gravity', parseFloat(e.target.value))}
        className="glow-range"
      />
    </div>

    {/* Angle Control */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400">Starting Pull</label>
        <span className="text-sm font-mono text-green-400 font-bold">{values.startAngle}°</span>
      </div>
      <input 
        type="range" min="0" max="75" step="5"
        value={values.startAngle}
        onChange={(e) => setValue('startAngle', parseFloat(e.target.value))}
        className="glow-range"
      />
    </div>

    {/* Damping Control */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400">Air Thickness</label>
        <span className="text-sm font-mono text-green-400 font-bold">{values.damping === 0 ? 'VACUUM' : values.damping.toFixed(1)}</span>
      </div>
      <input 
        type="range" min="0" max="2" step="0.1"
        value={values.damping}
        onChange={(e) => setValue('damping', parseFloat(e.target.value))}
        className="glow-range"
      />
    </div>

  </div>
);

// 5. Final Export
export const SIMULATION_1 = {
  title: 'Wiggle Lab: Simple Harmonic Motion',
  initialValues: { 
    length: 150, 
    gravity: 9.8, 
    startAngle: 45, 
    damping: 0.1 
  },
  achievements: achievements,
  renderSimulation: ({ values }: { values: PendulumState }) => (
    <PendulumCanvas values={values} />
  ),
  renderControls: renderControls
};