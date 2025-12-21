import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine'; // Adjust import path as needed

// --- 1. Interface ---
interface QuantumState {
  n: number;      // Quantum number (The energy level/floor)
  width: number;  // Width of the potential well (The box size)
  mass: number;   // Mass of the particle
}

// --- 2. Achievements ---
const achievements: Achievement<QuantumState>[] = [
  {
    id: 'ground-state',
    title: 'The Basement',
    description: 'Set the Quantum Number (n) to 1. Even particles need a nap.',
    condition: (s) => s.n === 1
  },
  {
    id: 'penthouse',
    title: 'Sugar Rush',
    description: 'Crank the Quantum Number (n) to 5. Maximum hype!',
    condition: (s) => s.n === 5
  },
  {
    id: 'nyc-apartment',
    title: 'NYC Apartment',
    description: 'Shrink the box Width to under 30%. Real estate is expensive.',
    condition: (s) => s.width < 30
  },
  {
    id: 'chonky-particle',
    title: 'Heavy Matter',
    description: 'Set Mass to max (> 9.0). It barely wants to move.',
    condition: (s) => s.mass > 9.0
  },
  {
    id: 'hyper-active',
    title: 'Quantum Panic',
    description: 'Create a High Energy state (n=5) with a light mass (< 2) in a small box (< 40).',
    condition: (s) => s.n === 5 && s.mass < 2 && s.width < 40
  },
  {
    id: 'chill-zone',
    title: 'Zen Mode',
    description: 'Low energy (n=1), big box (> 80), heavy mass (> 8). So slow...',
    condition: (s) => s.n === 1 && s.width > 80 && s.mass > 8
  }
];

// --- 3. Canvas Component ---
const QuantumCanvas = ({ values }: { values: QuantumState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const timeRef = useRef<number>(0);
  
  // Keep a ref to values to access inside the animation loop without stale closures
  const valuesRef = useRef(values);
  useEffect(() => { valuesRef.current = values; }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let canvasWidth = 0, canvasHeight = 0;

    const animate = () => {
      // Auto-resize logic
      const parent = canvas.parentElement;
      if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
        canvasWidth = parent.clientWidth;
        canvasHeight = parent.clientHeight;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
      }

      // Physics / Math Logic
      const { n, width, mass } = valuesRef.current;
      
      // Calculate "Energy" for visualization speed
      // In physics E ~ n^2 / (m * L^2). We scale this for visual pleasure.
      // We clamp the width to avoid division by zero or infinite speed.
      const safeWidth = Math.max(width, 10); 
      const energyProxy = (n * n) / (mass * (safeWidth / 100)); 
      
      // Update time based on energy (higher energy = faster oscillation)
      timeRef.current += 0.05 + (energyProxy * 0.005);

      // --- Drawing ---
      
      // Background
      ctx.fillStyle = '#09090b'; // Zinc-950
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      
      // The "Box" width in pixels (scaled up from the slider 0-100 value)
      const boxPixelWidth = (safeWidth / 100) * (canvasWidth * 0.8);
      const leftWall = centerX - boxPixelWidth / 2;
      const rightWall = centerX + boxPixelWidth / 2;

      // Draw Walls
      ctx.fillStyle = '#27272a';
      ctx.fillRect(0, 0, leftWall, canvasHeight); // Left solidity
      ctx.fillRect(rightWall, 0, canvasWidth - rightWall, canvasHeight); // Right solidity
      
      ctx.strokeStyle = '#52525b'; // Zinc-600
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(leftWall, 0); ctx.lineTo(leftWall, canvasHeight);
      ctx.moveTo(rightWall, 0); ctx.lineTo(rightWall, canvasHeight);
      ctx.stroke();

      // Draw Baseline (Zero Energy)
      ctx.strokeStyle = '#3f3f46';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(leftWall, centerY);
      ctx.lineTo(rightWall, centerY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw the Wavefunction (Psi)
      // Psi(x) = A * sin(n * pi * x / L)
      // We animate the amplitude: A * cos(omega * t)
      
      const oscillation = Math.cos(timeRef.current);
      const maxAmplitude = canvasHeight * 0.35; // Max height of wave

      // Color based on N level (Spectral shift)
      const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'];
      const waveColor = colors[(n - 1) % colors.length];

      ctx.beginPath();
      ctx.strokeStyle = waveColor;
      ctx.lineWidth = 4;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      
      // Shadow for glow effect
      ctx.shadowColor = waveColor;
      ctx.shadowBlur = 15;

      // Iterate through pixels inside the box
      for (let x = 0; x <= boxPixelWidth; x+=2) {
        // Normalized x from 0 to 1
        const xNorm = x / boxPixelWidth;
        
        // The Quantum Sine Wave Math
        const yVal = Math.sin(n * Math.PI * xNorm);
        
        const currentY = centerY - (yVal * maxAmplitude * oscillation);
        
        if (x === 0) ctx.moveTo(leftWall + x, currentY);
        else ctx.lineTo(leftWall + x, currentY);
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset shadow

      // Draw Nodes (Points that never move)
      // Nodes occur where sin(...) = 0
      ctx.fillStyle = '#fff';
      for (let i = 0; i <= n; i++) {
        const nodeX = leftWall + (boxPixelWidth * (i / n));
        ctx.beginPath();
        ctx.arc(nodeX, centerY, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Info Text overlay
      ctx.fillStyle = waveColor;
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`n = ${n}`, centerX, centerY - maxAmplitude - 20);
      
      ctx.fillStyle = '#71717a';
      ctx.font = '12px monospace';
      ctx.fillText(`Energy Level: ${(energyProxy * 10).toFixed(0)} units`, centerX, centerY + maxAmplitude + 30);

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full cursor-crosshair" />;
};

// --- 4. Controls Component ---
const renderControls = ({ values, setValue }: { 
  values: QuantumState; 
  setValue: (key: keyof QuantumState, val: any) => void;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
    
    {/* Quantum Number Slider */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-blue-400 transition-colors">
          Quantum Number (n)
        </label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
          <span className="text-sm font-mono text-blue-400 font-bold">
             Level {values.n}
          </span>
        </div>
      </div>
      <input
        type="range" min="1" max="5" step="1"
        value={values.n}
        onChange={(e) => setValue('n', parseInt(e.target.value))}
        className="glow-range accent-blue-500"
      />
      <p className="text-[10px] text-zinc-600">The number of humps in the wave. Higher number = Higher Energy.</p>
    </div>

    {/* Width Slider */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400 transition-colors">
          Box Width (L)
        </label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
          <span className="text-sm font-mono text-green-400 font-bold">
            {values.width.toFixed(0)} <span className="text-zinc-500 text-xs">%</span>
          </span>
        </div>
      </div>
      <input
        type="range" min="10" max="100" step="1"
        value={values.width}
        onChange={(e) => setValue('width', parseFloat(e.target.value))}
        className="glow-range accent-green-500"
      />
      <p className="text-[10px] text-zinc-600">How much room the particle has. Smaller room = Higher Energy (Claustrophobia effect).</p>
    </div>

    {/* Mass Slider */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-red-400 transition-colors">
          Particle Mass (m)
        </label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
          <span className="text-sm font-mono text-red-400 font-bold">
            {values.mass.toFixed(1)} <span className="text-zinc-500 text-xs">amu</span>
          </span>
        </div>
      </div>
      <input
        type="range" min="0.5" max="10" step="0.5"
        value={values.mass}
        onChange={(e) => setValue('mass', parseFloat(e.target.value))}
        className="glow-range accent-red-500"
      />
       <p className="text-[10px] text-zinc-600">Heavier particles are lazier. They have lower energy.</p>
    </div>

  </div>
);

// --- 5. Export ---
export const SIMULATION_40 = {
  title: 'Quantum Energy Ladder',
  initialValues: { n: 2, width: 80, mass: 2.0 },
  achievements: achievements,
  renderSimulation: ({ values }: { values: QuantumState }) => (
    <QuantumCanvas values={values} />
  ),
  renderControls: renderControls
};