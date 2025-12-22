import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine'; // Adjust import path as needed

// --- 1. Interface ---
interface QuantumState {
  particleEnergy: number; // How "excited" the particle is (0-100)
  barrierHeight: number;  // How tall the wall is (0-100)
  barrierThickness: number; // How fat the wall is (0-50)
}

// --- 2. Achievements ---
const achievements: Achievement<QuantumState>[] = [
  {
    id: 'ghost-walker',
    title: 'Ghost Walker',
    description: 'Successfully tunnel through a barrier higher than your energy (Energy < Barrier). Spooky.',
    condition: (s) => s.particleEnergy < s.barrierHeight && s.particleEnergy > 10 && s.barrierThickness < 20
  },
  {
    id: 'brick-wall',
    title: 'Access Denied',
    description: 'Create a wall so thick and tall that the tunneling probability drops to 0%.',
    condition: (s) => {
      const delta = s.barrierHeight - s.particleEnergy;
      // Rough calc for "zero" chance
      return delta > 40 && s.barrierThickness > 40;
    }
  },
  {
    id: 'overkill',
    title: 'Brute Force',
    description: 'Just jump over the wall. Set Energy higher than the Barrier Height.',
    condition: (s) => s.particleEnergy > s.barrierHeight
  },
  {
    id: 'quantum-sweet-spot',
    title: 'The Goldilocks Zone',
    description: 'Find the sweet spot: Energy is low, but the wall is thin enough that >50% of particles get through.',
    condition: (s) => {
        if (s.particleEnergy >= s.barrierHeight) return false;
        // Simplified transmission check
        const k = Math.sqrt(s.barrierHeight - s.particleEnergy);
        const transmission = Math.exp(-2 * (s.barrierThickness/10) * k);
        return transmission > 0.5;
    }
  },
  {
    id: 'vacuum-state',
    title: 'Vacuum of Space',
    description: 'Remove the barrier entirely. Is it even tunneling if there is no wall?',
    condition: (s) => s.barrierHeight === 0 || s.barrierThickness === 0
  }
];

// --- 3. Canvas Renderer ---
// --- 3. Canvas Renderer (FIXED) ---
const QuantumCanvas = ({ values }: { values: QuantumState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const timeRef = useRef<number>(0);
  
  // FIXED: Create a ref to hold the latest values
  const valuesRef = useRef(values);

  // FIXED: Sync the ref whenever values change
  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  const particlesRef = useRef<{x: number, y: number, success: boolean}[]>([]);

  // FIXED: Dependency array is now empty [] so the loop starts once and never stops
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0, height = 0;

    const animate = () => {
      // Resize Handling
      const parent = canvas.parentElement;
      if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
        width = parent.clientWidth;
        height = parent.clientHeight;
        canvas.width = width;
        canvas.height = height;
      }

      // FIXED: Read from valuesRef.current instead of values
      const { particleEnergy, barrierHeight, barrierThickness } = valuesRef.current;
      
      timeRef.current += 0.05;

      // Probability of tunneling (T)
      let transmissionProb = 0;
      
      if (particleEnergy >= barrierHeight) {
        transmissionProb = 1.0; 
      } else {
        const deltaV = barrierHeight - particleEnergy;
        // Constants tweaked for visual satisfaction
        const exponent = -2 * (barrierThickness / 10) * Math.sqrt(deltaV / 10); 
        transmissionProb = Math.exp(exponent);
      }

      transmissionProb = Math.max(0, Math.min(1, transmissionProb));

      // --- Drawing ---
      ctx.fillStyle = '#09090b'; 
      ctx.fillRect(0, 0, width, height);

      const groundY = height - 50;
      const wallX = width / 2 - (barrierThickness * 2);
      const wallW = barrierThickness * 4; 
      const wallH = barrierHeight * 3; 

      // Draw The Barrier
      const grad = ctx.createLinearGradient(wallX, groundY - wallH, wallX, groundY);
      grad.addColorStop(0, '#ef4444'); 
      grad.addColorStop(1, '#7f1d1d'); 
      
      if (wallW > 0 && wallH > 0) {
        ctx.fillStyle = grad;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 20;
        ctx.fillRect(wallX, groundY - wallH, wallW, wallH);
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#fff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        if (wallH > 20) ctx.fillText("POTENTIAL BARRIER", wallX + wallW/2, groundY - wallH/2);
      }

      // Draw Particle Energy Line
      const energyY = groundY - (particleEnergy * 3);
      ctx.beginPath();
      ctx.strokeStyle = '#4ade80'; 
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;
      ctx.moveTo(0, energyY);
      ctx.lineTo(width, energyY);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = '#4ade80';
      ctx.fillText(`ENERGY LEVEL: ${particleEnergy}`, 60, energyY - 10);

      // Draw The Wave Function
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.5)';
      ctx.lineWidth = 3;

      for (let x = 0; x < width; x+=5) {
        let amp = 20; 
        
        if (x > wallX && x < wallX + wallW) {
            if (particleEnergy < barrierHeight) {
                const distIn = x - wallX;
                amp = 20 * Math.exp(-distIn * 0.05 * (barrierThickness/5));
            }
        } 
        else if (x >= wallX + wallW) {
            amp = 20 * transmissionProb;
        }

        const y = energyY + Math.sin(x * 0.1 - timeRef.current * 5) * amp;
        if (x===0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Particle Arcade System
      if (Math.random() < 0.1) {
        particlesRef.current.push({ x: 0, y: energyY, success: false }); 
      }

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += 4; 

        const drawY = p.y + Math.sin(p.x * 0.1) * 5;

        // Collision Logic
        if (!p.success && p.x >= wallX && p.x <= wallX + wallW) {
           if (p.x < wallX + 5) { 
               const roll = Math.random();
               if (roll > transmissionProb) {
                   p.x = -999; 
                   ctx.fillStyle = '#f87171';
                   ctx.beginPath();
                   ctx.arc(wallX, drawY, 5, 0, Math.PI*2);
                   ctx.fill();
               } else {
                   p.success = true; 
               }
           }
        }
        
        if (p.x < 0) {
            particlesRef.current.splice(i, 1);
            continue;
        }

        ctx.fillStyle = p.success || p.x > wallX + wallW ? '#fff' : '#4ade80';
        ctx.beginPath();
        ctx.arc(p.x, drawY, 3, 0, Math.PI * 2);
        ctx.fill();

        if (p.x > width) particlesRef.current.splice(i, 1);
      }

      // Stats
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'right';
      const percent = (transmissionProb * 100).toFixed(4);
      ctx.fillText(`TUNNELING PROBABILITY: ${percent}%`, width - 20, 40);

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []); // FIXED: No dependencies here

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// --- 4. Controls Render ---
const renderControls = ({ values, setValue }: { 
    values: QuantumState; 
    setValue: (k: keyof QuantumState, v: number) => void 
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
    
    {/* Energy Slider */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400 transition-colors">
            Particle Energy (E)
        </label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
          <span className="text-sm font-mono text-green-400 font-bold">
            {values.particleEnergy.toFixed(0)} <span className="text-zinc-500 text-xs">eV</span>
          </span>
        </div>
      </div>
      <input
        type="range" min="1" max="100" step="1"
        value={values.particleEnergy}
        onChange={(e) => setValue('particleEnergy', parseFloat(e.target.value))}
        className="glow-range"
      />
      <p className="text-[10px] text-zinc-600">
        How much caffeine the particle had this morning.
      </p>
    </div>

    {/* Barrier Height Slider */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-red-400 transition-colors">
            Barrier Height (V)
        </label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
          <span className="text-sm font-mono text-red-400 font-bold">
            {values.barrierHeight.toFixed(0)} <span className="text-zinc-500 text-xs">eV</span>
          </span>
        </div>
      </div>
      <input
        type="range" min="0" max="100" step="1"
        value={values.barrierHeight}
        onChange={(e) => setValue('barrierHeight', parseFloat(e.target.value))}
        className="glow-range accent-red-500"
        style={{ accentColor: '#ef4444' } as React.CSSProperties}
      />
       <p className="text-[10px] text-zinc-600">
        The height of the wall. Classically, you need Energy &gt; Height to pass.
      </p>
    </div>

    {/* Barrier Thickness Slider */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-blue-400 transition-colors">
            Wall Thickness (a)
        </label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
          <span className="text-sm font-mono text-blue-400 font-bold">
            {values.barrierThickness.toFixed(1)} <span className="text-zinc-500 text-xs">nm</span>
          </span>
        </div>
      </div>
      <input
        type="range" min="0" max="50" step="0.5"
        value={values.barrierThickness}
        onChange={(e) => setValue('barrierThickness', parseFloat(e.target.value))}
        className="glow-range accent-blue-500"
        style={{ accentColor: '#3b82f6' } as React.CSSProperties}
      />
       <p className="text-[10px] text-zinc-600">
        Thicker walls make tunneling exponentially harder.
      </p>
    </div>

  </div>
);

// --- 5. Export ---
export const SIMULATION_42 = {
  title: 'Quantum Tunneling',
  initialValues: { particleEnergy: 40, barrierHeight: 60, barrierThickness: 10 },
  achievements: achievements,
  renderSimulation: ({ values }: { values: QuantumState }) => (
    <QuantumCanvas values={values} />
  ),
  renderControls: renderControls
};