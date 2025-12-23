import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine';

// 1. Interface
interface SimState {
  electronLevel: number; // 0 = Ground, 1 = 1st Excited, etc.
  photonEnergy: number;  // The energy you are firing at the atom
  score: number;         // How many successful jumps
  feedback: string;      // "Miss!", "Perfect!", "Falling..."
  isFiring: boolean;     // Trigger for animation
}

// Fixed Energy Levels (in arbitrary "eV" units)
const LEVELS = [0, 4.5, 10.0, 16.5]; 
// Gaps: 
// 0 -> 1: 4.5
// 1 -> 2: 5.5
// 2 -> 3: 6.5
// 0 -> 2: 10.0
// etc.

// 2. Achievements
const achievements: Achievement<SimState>[] = [
  {
    id: 'wrong-change',
    title: 'Exact Change Only',
    description: 'Fire a photon that gets rejected because the energy wasn\'t exactly right.',
    condition: (s) => s.feedback === "MISS"
  },
  {
    id: 'first-promotion',
    title: 'Level Up',
    description: 'Successfully jump the electron from Ground to Level 1.',
    condition: (s) => s.electronLevel === 1 && s.score > 0
  },
  {
    id: 'penthouse-suite',
    title: 'Penthouse Suite',
    description: 'Reach the highest energy level (Level 3).',
    condition: (s) => s.electronLevel === 3
  },
  {
    id: 'big-spender',
    title: 'Skipping Floors',
    description: 'Jump more than one level in a single go (e.g., Level 0 to 2).',
    condition: (s) => s.electronLevel - (s.electronLevel > 1 ? 1 : 0) > 1 && s.feedback === "PERFECT FIT" // Simplified logic check
  },
  {
    id: 'gravity-wins',
    title: 'What Goes Up',
    description: 'Wait for the electron to spontaneously fall back down.',
    condition: (s) => s.feedback === "EMISSION"
  }
];

// 3. Canvas Component
const EnergyLevelCanvas = ({ values, setValue }: { values: SimState, setValue: any }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const electronY = useRef<number>(350); // Start at bottom
  const projectiles = useRef<{x: number, y: number, active: boolean, type: 'in' | 'out', color: string}[]>([]);
  const timerRef = useRef<number>(0);

  useEffect(() => {
    // Spontaneous Emission Logic
    // If electron is high up, random chance to drop down
    const checkDecay = setInterval(() => {
      if (values.electronLevel > 0 && !values.isFiring) {
        if (Math.random() < 0.05) {
          const newLevel = Math.max(0, values.electronLevel - 1);
          setValue('electronLevel', newLevel);
          setValue('feedback', 'EMISSION');
          
          // Spawn emitted photon
          projectiles.current.push({
            x: 300, 
            y: 350 - (LEVELS[values.electronLevel] * 15),
            active: true,
            type: 'out',
            color: '#a78bfa'
          });
        }
      }
    }, 100);
    return () => clearInterval(checkDecay);
  }, [values.electronLevel, values.isFiring, setValue]);

  // Firing Logic
  useEffect(() => {
    if (values.isFiring) {
      projectiles.current.push({
        x: 0,
        y: 350 - (LEVELS[values.electronLevel] * 15),
        active: true,
        type: 'in',
        color: '#fbbf24' // Yellow for incoming
      });
      
      // Reset firing trigger immediately so we don't spam
      const timeout = setTimeout(() => setValue('isFiring', false), 100);
      return () => clearTimeout(timeout);
    }
  }, [values.isFiring, values.electronLevel, setValue]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      const width = canvas.width = canvas.parentElement?.clientWidth || 600;
      const height = canvas.height = canvas.parentElement?.clientHeight || 400;

      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const bottomY = height - 50;
      const scaleY = 15; // Pixels per eV

      // Draw Levels
      LEVELS.forEach((ev, index) => {
        const y = bottomY - (ev * scaleY);
        ctx.beginPath();
        ctx.strokeStyle = index === 0 ? '#fff' : '#52525b';
        ctx.lineWidth = 2;
        ctx.moveTo(centerX - 100, y);
        ctx.lineTo(centerX + 100, y);
        ctx.stroke();

        ctx.fillStyle = '#71717a';
        ctx.font = '12px monospace';
        ctx.fillText(`n=${index} (${ev.toFixed(1)} eV)`, centerX + 110, y + 4);
      });

      // Target Y for electron
      const targetY = bottomY - (LEVELS[values.electronLevel] * scaleY);
      electronY.current += (targetY - electronY.current) * 0.1;

      // Draw Electron
      ctx.beginPath();
      ctx.arc(centerX, electronY.current, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#4ade80';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#4ade80';
      ctx.fill();
      ctx.shadowBlur = 0;

      // Handle Projectiles (Photons)
      projectiles.current.forEach((p, i) => {
        if (p.type === 'in') {
           p.x += 8;
        } else {
           p.x += 8; // Emitted goes right
           // p.x -= 8; // Or left? Let's go right for "exit"
        }

        // Draw Wavy Photon
        ctx.beginPath();
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3;
        const waveY = p.y + Math.sin(p.x * 0.1 + timerRef.current) * 5;
        ctx.moveTo(p.x - 10, waveY);
        ctx.lineTo(p.x + 10, waveY);
        ctx.stroke();

        // Hit Detection for Incoming
        if (p.type === 'in' && Math.abs(p.x - centerX) < 10 && p.active) {
            p.active = false; // Consumed or passed
            
            // Check if energy matches any gap from current level
            let hit = false;
            for (let next = values.electronLevel + 1; next < LEVELS.length; next++) {
                const gap = LEVELS[next] - LEVELS[values.electronLevel];
                // Tolerance of 0.5 eV
                if (Math.abs(values.photonEnergy - gap) <= 0.3) {
                    setValue('electronLevel', next);
                    setValue('score', (s: number) => s + 1);
                    setValue('feedback', 'PERFECT FIT');
                    hit = true;
                    break;
                }
            }
            
            if (!hit) {
                setValue('feedback', 'MISS');
                // Ghost photon passes through
                p.active = true; // Keep moving visually
                p.color = 'rgba(251, 191, 36, 0.2)'; // Fade out
            }
        }
      });

      // Cleanup off-screen projectiles
      projectiles.current = projectiles.current.filter(p => p.x < width + 50);
      timerRef.current += 0.5;

      requestAnimationFrame(animate);
    };

    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [values, setValue]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

// 4. Main Export
export const SIMULATION_28 = {
  title: "Quantized Energy Ladder",
  initialValues: { electronLevel: 0, photonEnergy: 4.5, score: 0, feedback: "Ready", isFiring: false },
  achievements: achievements,
  renderSimulation: ({ values, setValue }: { values: SimState, setValue: any }) => (
    <div className="w-full h-full relative">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center z-10 bg-black/60 p-3 rounded-lg border border-white/10 backdrop-blur-md">
        <p className="text-zinc-300 text-xs">
          <b>Status:</b> <span className={values.feedback === 'MISS' ? 'text-red-400' : 'text-green-400'}>{values.feedback}</span> <br/>
          Match the gap exactly. Current Level: {LEVELS[values.electronLevel]} eV.
        </p>
      </div>
      <EnergyLevelCanvas values={values} setValue={setValue} />
    </div>
  ),
  renderControls: ({ values, setValue }: { values: SimState, setValue: any }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">
      
      {/* Energy Slider */}
      <div className="space-y-3 group">
        <div className="flex justify-between items-end">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Photon Energy Input</label>
          <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
            <span className="text-sm font-mono text-yellow-400 font-bold">{values.photonEnergy.toFixed(1)} eV</span>
          </div>
        </div>
        <input 
          type="range" min="0.5" max="20" step="0.5"
          value={values.photonEnergy}
          onChange={(e) => setValue('photonEnergy', parseFloat(e.target.value))}
          className="glow-range"
        />
        <div className="flex justify-between text-[10px] text-zinc-600 font-mono">
            <span>0 eV</span>
            <span>20 eV</span>
        </div>
      </div>

      {/* Fire Button */}
      <div className="flex flex-col justify-center">
        <button 
          onClick={() => setValue('isFiring', true)}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 px-8 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all transform hover:scale-105 active:scale-95"
        >
          SHOOT PHOTON
        </button>
      </div>

    </div>
  )
};