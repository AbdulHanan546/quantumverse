import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine'; // Adjust import path if needed
import { FaGhost, FaCrosshairs, FaRandom, FaBalanceScale } from 'react-icons/fa';

// --- 1. Interface ---
interface SimState {
  bias: number;        // Where the "ghost" prefers to hang out (-50 to 50)
  uncertainty: number; // How "confused" or spread out the ghost is (10 to 100)
  sampleRate: number;  // How fast we are taking measurements (1 to 50)
}

// --- 2. Achievements ---
const achievements: Achievement<SimState>[] = [
  {
    id: 'boring-average',
    title: 'Dead Center',
    description: 'Make the ghost boring by keeping the expectation value exactly at 0.',
    condition: (s) => s.bias === 0
  },
  {
    id: 'quantum-smear',
    title: 'Quantum Smear',
    description: 'Max out the uncertainty. The ghost is everywhere and nowhere. Good luck finding it.',
    condition: (s) => s.uncertainty >= 100
  },
  {
    id: 'sniper-mode',
    title: 'Sniper Mode',
    description: 'Reduce uncertainty to the minimum. You basically turned a quantum wave into a marble.',
    condition: (s) => s.uncertainty <= 10
  },
  {
    id: 'edge-lord',
    title: 'Living on the Edge',
    description: 'Push the expectation value all the way to the side (+50 or -50).',
    condition: (s) => Math.abs(s.bias) === 50
  },
  {
    id: 'confused-ghost',
    title: 'The Paradox',
    description: 'Center the ghost (0) but maximize the spread (100). The average is 0, but the ghost is never actually there.',
    condition: (s) => s.bias === 0 && s.uncertainty === 100
  }
];

// --- 3. Canvas Simulation ---
const ExpectationCanvas = ({ values }: { values: SimState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const valuesRef = useRef(values);
  
  // History of "measurements" to calculate the running average
  const pointsRef = useRef<number[]>([]); 

  useEffect(() => { valuesRef.current = values; }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0, height = 0;

    const animate = () => {
      // --- Resize Logic ---
      const parent = canvas.parentElement;
      if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
        width = parent.clientWidth;
        height = parent.clientHeight;
        canvas.width = width;
        canvas.height = height;
      }

      const { bias, uncertainty, sampleRate } = valuesRef.current;

      // --- Physics/Math (Simplified) ---
      // We simulate a Gaussian distribution.
      // Expected Value <x> = bias. 
      // Uncertainty = standard deviation (spread).

      // 1. Generate new measurements based on current settings
      // Using Box-Muller transform for simple normal distribution
      for(let i=0; i<sampleRate; i++) {
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        const point = bias + z * uncertainty; // Scale by uncertainty, shift by bias
        
        pointsRef.current.push(point);
      }

      // Keep array size manageable (last 500 dots)
      if (pointsRef.current.length > 500) {
        pointsRef.current = pointsRef.current.slice(pointsRef.current.length - 500);
      }

      // Calculate the "Experimental" Average (The Expectation Value calculated from data)
      const sum = pointsRef.current.reduce((a, b) => a + b, 0);
      const avg = pointsRef.current.length ? sum / pointsRef.current.length : 0;

      // --- Rendering ---
      ctx.fillStyle = '#09090b'; // Deep black bg
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const scaleX = width / 200; // Map -100..100 to canvas width

      // Draw Grid/Axis
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height/2); ctx.lineTo(width, height/2); // X-axis
      ctx.moveTo(centerX, 0); ctx.lineTo(centerX, height); // Center line
      ctx.stroke();

      // 1. Draw the "Theoretical" Cloud (Where the math says it should be)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.2)'; // Faint Green
      ctx.lineWidth = 2;
      for (let x = -100; x <= 100; x+=1) {
        const screenX = centerX + x * scaleX;
        // Gaussian formula for height
        const dist = x - bias;
        const prob = Math.exp(-(dist*dist)/(2*uncertainty*uncertainty)); 
        const screenY = (height/2) - (prob * (height/3));
        
        if (x === -100) ctx.moveTo(screenX, screenY);
        else ctx.lineTo(screenX, screenY);
      }
      ctx.stroke();

      // 2. Draw the "Measurements" (The actual dots appearing)
      pointsRef.current.forEach(p => {
        const px = centerX + p * scaleX;
        // Random Y scatter for visual effect, but centered on axis
        const py = (height/2) + (Math.random() * 40 - 20); 
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillRect(px, py, 2, 2);
      });

      // 3. Draw the EXPECTATION VALUE Marker (The Average)
      const avgX = centerX + avg * scaleX;
      
      // The line
      ctx.strokeStyle = '#fbbf24'; // Amber/Gold
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(avgX, height/2 - 50);
      ctx.lineTo(avgX, height/2 + 50);
      ctx.stroke();
      ctx.setLineDash([]);

      // The Label
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`⟨x⟩ ≈ ${avg.toFixed(1)}`, avgX, height/2 - 60);
      
      // User Target Label (Bias)
      const targetX = centerX + bias * scaleX;
      ctx.fillStyle = 'rgba(74, 222, 128, 0.5)';
      ctx.font = '12px monospace';
      ctx.fillText(`Target: ${bias}`, targetX, height/2 + 70);

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// --- 4. Controls Component ---
const renderControls = ({ values, setValue }: { 
  values: SimState, 
  setValue: (key: keyof SimState, val: number) => void 
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
    
    {/* Bias Control */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400 transition-colors flex items-center gap-2">
          <FaCrosshairs /> Position Bias
        </label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
          <span className="text-sm font-mono text-green-400 font-bold">{values.bias}</span>
        </div>
      </div>
      <input 
        type="range" min="-50" max="50" step="1"
        value={values.bias}
        onChange={(e) => setValue('bias', parseFloat(e.target.value))}
        className="glow-range"
      />
      <p className="text-[10px] text-zinc-500">
        Where you *expect* the particle to be mostly.
      </p>
    </div>

    {/* Uncertainty Control */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400 transition-colors flex items-center gap-2">
          <FaGhost /> Uncertainty (Spread)
        </label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
          <span className="text-sm font-mono text-green-400 font-bold">{values.uncertainty}</span>
        </div>
      </div>
      <input 
        type="range" min="5" max="100" step="1"
        value={values.uncertainty}
        onChange={(e) => setValue('uncertainty', parseFloat(e.target.value))}
        className="glow-range"
      />
      <p className="text-[10px] text-zinc-500">
        Low = Precise marble. High = Foggy ghost.
      </p>
    </div>

    {/* Sampling Rate */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400 transition-colors flex items-center gap-2">
          <FaRandom /> Measurement Speed
        </label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
          <span className="text-sm font-mono text-green-400 font-bold">{values.sampleRate}x</span>
        </div>
      </div>
      <input 
        type="range" min="1" max="50" step="1"
        value={values.sampleRate}
        onChange={(e) => setValue('sampleRate', parseFloat(e.target.value))}
        className="glow-range"
      />
      <p className="text-[10px] text-zinc-500">
        More measurements = smoother average calculation.
      </p>
    </div>

  </div>
);

// --- 5. Export ---
export const SIMULATION_36 = {
  title: 'Expectation Values (The Average Ghost)',
  initialValues: { bias: 0, uncertainty: 30, sampleRate: 5 },
  achievements: achievements,
  renderSimulation: ({ values }: { values: SimState }) => <ExpectationCanvas values={values} />,
  renderControls: renderControls
};