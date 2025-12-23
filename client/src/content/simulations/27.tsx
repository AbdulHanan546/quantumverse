import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine';

// 1. Interface
interface SimState {
  currentOrbit: number; // n = 1, 2, 3, 4
  targetOrbit: number;
  photonEnergy: number; // Energy to jump
  isJumping: boolean;
  emissionCount: number;
}

// 2. Achievements
const achievements: Achievement<SimState>[] = [
  {
    id: 'ground-zero',
    title: 'Home Base',
    description: 'Keep the electron in the Ground State (n=1) for its own safety.',
    condition: (s) => s.currentOrbit === 1
  },
  {
    id: 'quantum-jump',
    title: 'The Quantum Leap',
    description: 'Successfully jump the electron to a higher orbit.',
    condition: (s) => s.currentOrbit > 1
  },
  {
    id: 'high-society',
    title: 'High Society',
    description: 'Reach the highest available orbit (n=4). It is lonely at the top.',
    condition: (s) => s.currentOrbit === 4
  },
  {
    id: 'light-show',
    title: 'Personal Light Show',
    description: 'Emit 5 photons by jumping back down to lower orbits.',
    condition: (s) => s.emissionCount >= 5
  },
  {
    id: 'balmer-peak',
    title: 'The Balmer Drop',
    description: 'Jump from n=3 directly to n=2 to emit a visible red photon.',
    condition: (s) => s.currentOrbit === 2 && s.targetOrbit === 3 // Logic: was at 3, now at 2
  }
];

// 3. Canvas Component
const BohrCanvas = ({ values, setValue }: { values: SimState, setValue: any }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const electronPos = useRef({ angle: 0, r: 40 });
  const photons = useRef<{x: number, y: number, color: string, vx: number}[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      const width = canvas.width = canvas.parentElement?.clientWidth || 600;
      const height = canvas.height = canvas.parentElement?.clientHeight || 400;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      // Draw Nucleus (The Proton)
      ctx.beginPath();
      ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ef4444';
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw Possible Orbits (n=1 to n=4)
      for (let n = 1; n <= 4; n++) {
        const radius = n * 40;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = values.currentOrbit === n ? '#4ade80' : '#27272a';
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = '#3f3f46';
        ctx.font = '10px monospace';
        ctx.fillText(`n=${n}`, centerX + radius + 5, centerY);
      }

      // Update Electron Position
      const targetR = values.currentOrbit * 40;
      electronPos.current.r += (targetR - electronPos.current.r) * 0.1;
      electronPos.current.angle += 0.02 * (5 - values.currentOrbit); // Higher orbits move slower

      const ex = centerX + Math.cos(electronPos.current.angle) * electronPos.current.r;
      const ey = centerY + Math.sin(electronPos.current.angle) * electronPos.current.r;

      // Draw Electron
      ctx.beginPath();
      ctx.arc(ex, ey, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#4ade80';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#4ade80';
      ctx.fill();
      ctx.shadowBlur = 0;

      // Handle Photons
      photons.current.forEach((p, i) => {
        p.x += p.vx;
        ctx.beginPath();
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        // Wavy photon line
        for(let j=0; j<15; j++) {
            ctx.lineTo(p.x - j*3, p.y + Math.sin(p.x * 0.2 + j) * 5);
        }
        ctx.stroke();
        if(p.x > width || p.x < 0) photons.current.splice(i, 1);
      });

      requestAnimationFrame(animate);
    };

    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [values]);

  // Jump Helper
  const attemptJump = (newN: number) => {
    if (newN === values.currentOrbit) return;

    if (newN < values.currentOrbit) {
        // Falling down - Emit Photon
        const colors = ['#f87171', '#60a5fa', '#a78bfa', '#facc15'];
        photons.current.push({
            x: centerX + Math.cos(electronPos.current.angle) * electronPos.current.r,
            y: centerY + Math.sin(electronPos.current.angle) * electronPos.current.r,
            color: colors[values.currentOrbit - 1],
            vx: 5
        });
        setValue('emissionCount', (prev: number) => prev + 1);
    }
    setValue('targetOrbit', values.currentOrbit);
    setValue('currentOrbit', newN);
  };

  const centerX = (canvasRef.current?.width || 600) / 2;
  const centerY = (canvasRef.current?.height || 400) / 2;

  return (
    <div className="w-full h-full relative">
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 z-30">
            {[1, 2, 3, 4].map(n => (
                <button 
                    key={n}
                    onClick={() => attemptJump(n)}
                    className={`w-12 h-12 rounded-full font-bold border-2 transition-all ${
                        values.currentOrbit === n 
                        ? 'bg-green-500 border-white text-black scale-110 shadow-[0_0_15px_rgba(74,222,128,0.5)]' 
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-green-400'
                    }`}
                >
                    n={n}
                </button>
            ))}
        </div>
        <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

// 4. Main Export
export const SIMULATION_27 = {
  title: "Bohr's Atomic Social Ladder",
  initialValues: { currentOrbit: 1, targetOrbit: 1, photonEnergy: 0, isJumping: false, emissionCount: 0 },
  achievements: achievements,
  renderSimulation: ({ values, setValue }: { values: SimState, setValue: any }) => (
    <div className="w-full h-full relative">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center z-10 bg-black/60 p-3 rounded-lg border border-white/10 backdrop-blur-md w-2/3">
        <p className="text-zinc-300 text-xs">
          The electron can only live in the dotted lanes. <br/>
          Click the <b>n-levels</b> below to force a jump. Dropping down emits light!
        </p>
      </div>
      <BohrCanvas values={values} setValue={setValue} />
    </div>
  ),
  renderControls: ({ values }: { values: SimState, setValue: any }) => (
    <div className="flex justify-center items-center h-full">
        <div className="grid grid-cols-2 gap-12 text-center">
            <div className="space-y-1">
                <span className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Current State</span>
                <span className="text-2xl font-mono text-green-400 font-bold">{values.currentOrbit === 1 ? 'GROUND' : `EXCITED (n=${values.currentOrbit})`}</span>
            </div>
            <div className="space-y-1">
                <span className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Photons Emitted</span>
                <span className="text-2xl font-mono text-blue-400 font-bold">{values.emissionCount}</span>
            </div>
        </div>
    </div>
  )
};