import React, { useEffect, useRef, useMemo } from 'react';
import { FaLightbulb, FaAtom, FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { type Achievement } from '../../components/SimulationEngine';

// --- 1. Interface ---
interface BohrState {
  currentOrbit: number; // 1 to 4
  emissionCount: number;
  lastEmittedColor: string | null; // To display in HUD
  lastEnergyDiff: number | null;
}

// --- 2. Constants & Helpers ---
const ORBIT_SCALE = 50; // Radius multiplier
const ELECTRON_SPEED = 2; // Radians per second factor

// Rydberg formula approximation for color mapping
const getEnergy = (n: number) => -13.6 / (n * n);

const getColorForTransition = (nHigh: number, nLow: number): string => {
  const eDiff = Math.abs(getEnergy(nHigh) - getEnergy(nLow));
  // Simple mapping for the simulation visuals
  if (nLow === 1) return '#a78bfa'; // Lyman Series (UV) -> Violet/Invisible representation
  if (nLow === 2) {
    // Balmer Series (Visible)
    if (nHigh === 3) return '#ef4444'; // H-Alpha (Red)
    if (nHigh === 4) return '#06b6d4'; // H-Beta (Cyan)
    return '#3b82f6'; // Higher (Blue)
  }
  if (nLow === 3) return '#f87171'; // Paschen (IR) -> Deep Red representation
  return '#ffffff';
};

// --- 3. Achievements ---
const achievements: Achievement<BohrState>[] = [
  {
    id: 'ground-state',
    title: 'Stable Ground',
    description: 'Rest at n=1. The electron cannot fall any further.',
    condition: (s) => s.currentOrbit === 1
  },
  {
    id: 'excitation',
    title: 'Quantum Leap',
    description: 'Absorb energy to jump to an excited state (n > 1).',
    condition: (s) => s.currentOrbit > 1
  },
  {
    id: 'balmer-series',
    title: 'Visible Light',
    description: 'Create visible light by dropping to n=2 (The Balmer Series).',
    condition: (s) => s.lastEmittedColor === '#ef4444' || s.lastEmittedColor === '#06b6d4'
  },
  {
    id: 'uv-blast',
    title: 'Lyman Burst (UV)',
    description: 'Drop to n=1. This release is high energy Ultraviolet.',
    condition: (s) => s.currentOrbit === 1 && s.lastEnergyDiff !== null && s.lastEnergyDiff > 10
  },
  {
    id: 'max-excitation',
    title: 'Edge of Ionization',
    description: 'Push the electron to n=4.',
    condition: (s) => s.currentOrbit === 4
  }
];

// --- 4. Canvas Component ---
const BohrCanvas = ({ values }: { values: BohrState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Physics Ref: Stores animation state that updates 60fps independent of React renders
  const phys = useRef({
    electronRad: values.currentOrbit * ORBIT_SCALE,
    electronAngle: 0,
    targetRad: values.currentOrbit * ORBIT_SCALE,
    prevOrbit: values.currentOrbit,
    photons: [] as Array<{ x: number, y: number, vx: number, vy: number, color: string, waveOffset: number }>
  });

  // Sync React State to Physics Target
  useEffect(() => {
    phys.current.targetRad = values.currentOrbit * ORBIT_SCALE;
    
    // Detect Drop -> Spawn Photon
    if (values.currentOrbit < phys.current.prevOrbit) {
      const color = getColorForTransition(phys.current.prevOrbit, values.currentOrbit);
      
      // Calculate spawn position (where the electron is NOW)
      const ex = Math.cos(phys.current.electronAngle) * phys.current.electronRad;
      const ey = Math.sin(phys.current.electronAngle) * phys.current.electronRad;
      const angle = Math.atan2(ey, ex);

      phys.current.photons.push({
        x: ex, y: ey,
        vx: Math.cos(angle) * 5, // Shoot outward
        vy: Math.sin(angle) * 5,
        color: color,
        waveOffset: 0
      });
    }
    phys.current.prevOrbit = values.currentOrbit;
  }, [values.currentOrbit]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      // Auto-resize
      const parent = canvas.parentElement;
      if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
      
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      // 1. Clear
      ctx.fillStyle = '#09090b'; // Zinc-950
      ctx.fillRect(0, 0, w, h);

      // 2. Draw Orbits
      ctx.lineWidth = 1;
      for(let n=1; n<=4; n++) {
        const r = n * ORBIT_SCALE;
        
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        
        if (n === values.currentOrbit) {
            ctx.strokeStyle = '#4ade80'; // Green active
            ctx.setLineDash([4, 4]);
            // Glow effect for active orbit
            ctx.shadowColor = '#4ade80';
            ctx.shadowBlur = 10;
        } else {
            ctx.strokeStyle = '#27272a'; // Zinc-800 inactive
            ctx.setLineDash([]);
            ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset
        ctx.setLineDash([]); // Reset

        // Labels
        ctx.fillStyle = '#52525b';
        ctx.font = '10px monospace';
        ctx.fillText(`n=${n}`, cx + 5, cy - r + 10);
      }

      // 3. Draw Nucleus
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI*2);
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 8px Arial';
      ctx.fillText('+Z', cx, cy);

      // 4. Update Electron Physics
      // Lerp radius for smooth jumping
      phys.current.electronRad += (phys.current.targetRad - phys.current.electronRad) * 0.1;
      // Orbit speed slows down further out (conservation of angular momentum approximation)
      phys.current.electronAngle += ELECTRON_SPEED / Math.sqrt(values.currentOrbit);

      const ex = cx + Math.cos(phys.current.electronAngle) * phys.current.electronRad;
      const ey = cy + Math.sin(phys.current.electronAngle) * phys.current.electronRad;

      // 5. Draw Electron
      ctx.beginPath();
      ctx.arc(ex, ey, 6, 0, Math.PI*2);
      ctx.fillStyle = '#4ade80';
      ctx.shadowColor = '#4ade80';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;

      // 6. Update & Draw Photons
      for (let i = phys.current.photons.length - 1; i >= 0; i--) {
        const p = phys.current.photons[i];
        p.x += p.vx;
        p.y += p.vy;
        p.waveOffset += 0.5;

        // Draw Wave Packet (Sine wave along velocity vector)
        ctx.beginPath();
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        
        // Calculate perpendicular vector for wave amplitude
        const mag = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
        const ux = p.vx / mag;
        const uy = p.vy / mag;
        const perpX = -uy;
        const perpY = ux;

        // Draw sine wave tail
        const tailLength = 40;
        const px = cx + p.x;
        const py = cy + p.y;
        
        ctx.moveTo(px, py);
        for(let j=0; j<tailLength; j+=2) {
             const wave = Math.sin((j * 0.3) + p.waveOffset) * 5; // Amplitude 5
             const tx = px - (ux * j) + (perpX * wave);
             const ty = py - (uy * j) + (perpY * wave);
             ctx.lineTo(tx, ty);
        }
        ctx.stroke();

        // Remove off-screen
        if (p.x < -w || p.x > w || p.y < -h || p.y > h) {
            phys.current.photons.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, []); // Run once, refs handle updates

  return <canvas ref={canvasRef} className="w-full h-full block" />;
};

// --- 5. Controls Component ---
const renderControls = ({ values, setValue }: { values: BohrState, setValue: any }) => {
    
    const handleTransition = (targetN: number) => {
        if (targetN === values.currentOrbit) return;
        
        const currentE = getEnergy(values.currentOrbit);
        const targetE = getEnergy(targetN);
        const diff = Math.abs(targetE - currentE);
        
        let color = null;
        if (targetN < values.currentOrbit) {
            // Emission
            color = getColorForTransition(values.currentOrbit, targetN);
            setValue('emissionCount', values.emissionCount + 1);
            setValue('lastEmittedColor', color);
            setValue('lastEnergyDiff', diff);
        } else {
            // Absorption
            setValue('lastEmittedColor', null);
            setValue('lastEnergyDiff', null);
        }

        setValue('currentOrbit', targetN);
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl mx-auto p-2">
            
            {/* Energy Level Selector */}
            <div className="flex-1 bg-zinc-800/50 p-4 rounded-xl border border-zinc-700 backdrop-blur-sm">
                <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FaAtom /> Select Orbit (n)
                    

[Image of Bohr model energy levels]

                </h3>
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((n) => {
                        const isCurrent = values.currentOrbit === n;
                        const isLower = n < values.currentOrbit;
                        return (
                            <button
                                key={n}
                                onClick={() => handleTransition(n)}
                                className={`
                                    relative h-20 rounded-lg font-mono text-xl font-bold transition-all duration-300
                                    flex flex-col items-center justify-center gap-1
                                    ${isCurrent 
                                        ? 'bg-green-500 text-zinc-950 scale-105 shadow-[0_0_20px_rgba(74,222,128,0.3)] ring-2 ring-green-400' 
                                        : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-700'
                                    }
                                `}
                            >
                                <span>n={n}</span>
                                {isCurrent && <span className="text-[10px] font-sans uppercase tracking-widest opacity-70">Current</span>}
                                {!isCurrent && isLower && <FaArrowDown className="text-xs text-red-400 absolute bottom-2" />}
                                {!isCurrent && !isLower && <FaArrowUp className="text-xs text-blue-400 absolute bottom-2" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Stats & Spectrum */}
            <div className="flex-1 space-y-4">
                
                {/* Energy Display */}
                <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700 flex justify-between items-center">
                     <div>
                        <div className="text-zinc-500 text-xs uppercase font-bold">Electron Energy</div>
                        <div className="text-2xl font-mono text-green-400">
                            {getEnergy(values.currentOrbit).toFixed(2)} <span className="text-sm text-zinc-600">eV</span>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-zinc-500 text-xs uppercase font-bold">Total Photons</div>
                        <div className="text-2xl font-mono text-white">{values.emissionCount}</div>
                     </div>
                </div>

                {/* Last Emission Info */}
                <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700 relative overflow-hidden">
                    <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <FaLightbulb /> Emission Spectrum
                        

[Image of hydrogen emission spectrum]

                    </h3>
                    
                    {values.lastEmittedColor ? (
                        <div className="flex items-center gap-4 animate-pulse">
                            <div 
                                className="w-12 h-12 rounded-full shadow-[0_0_15px_currentColor]"
                                style={{ backgroundColor: values.lastEmittedColor, color: values.lastEmittedColor }}
                            />
                            <div>
                                <div className="text-white font-bold text-sm">Photon Emitted!</div>
                                <div className="text-xs text-zinc-400">
                                    Energy released: {values.lastEnergyDiff?.toFixed(2)} eV
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-12 flex items-center text-zinc-600 text-sm italic">
                            Move to a lower orbit to emit light...
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

// --- 6. Main Export ---
export const SIMULATION_27 = {
  title: 'Bohr Model: Energy Levels',
  initialValues: { 
      currentOrbit: 1, 
      emissionCount: 0,
      lastEmittedColor: null,
      lastEnergyDiff: null
  },
  achievements: achievements,
  renderSimulation: ({ values }: { values: BohrState }) => (
      <BohrCanvas values={values} />
  ),
  renderControls: renderControls
};