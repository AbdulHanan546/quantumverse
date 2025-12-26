import React, { useEffect, useRef, useState } from 'react';
import { type Achievement } from '../../components/SimulationEngine';
import { FaBolt, FaUndo, FaRocket } from 'react-icons/fa';

// --- 1. Interface ---
interface SimState {
  currentN: number;      // Current Principal Quantum Number (1-4)
  photonEnergy: number;  // The energy slider value (eV)
  lastResult: 'idle' | 'hit' | 'miss'; // Feedback for the user/achievements
  jumpsPerformed: number; // Counter for fun
}

// --- 2. Achievements ---
const achievements: Achievement<SimState>[] = [
  {
    id: 'first-hop',
    title: 'Baby Steps',
    description: 'Kick the electron from the ground floor (n=1) to the first floor (n=2). Needs about 10.2 eV.',
    condition: (s) => s.currentN === 2 && s.lastResult === 'hit'
  },
  {
    id: 'penthouse-suite',
    title: 'To The Moon',
    description: 'Send the electron straight to the highest level (n=4). It takes a lot of juice!',
    condition: (s) => s.currentN === 4
  },
  {
    id: 'swing-and-a-miss',
    title: 'Quantum Ghosting',
    description: 'Fire a photon with energy that doesn\'t match any level gap. It passes right through like a ghost.',
    condition: (s) => s.lastResult === 'miss'
  },
  {
    id: 'gravity-sucks',
    title: 'What Goes Up...',
    description: 'Reset the electron back to the Ground State (n=1) after exciting it.',
    condition: (s) => s.currentN === 1 && s.jumpsPerformed > 0
  },
  {
    id: 'lucky-guess',
    title: 'Sharpshooter',
    description: 'Hit a transition perfectly on the first try (Total jumps = 1 and result is hit).',
    condition: (s) => s.jumpsPerformed === 1 && s.lastResult === 'hit'
  }
];

// --- 3. Visualization Component ---
const AtomCanvas = ({ values }: { values: SimState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const electronAngle = useRef(0);
  // We use this to animate the radius smoothly even if state snaps
  const visualRadius = useRef(50); 
  
  // Constants for drawing
  const ORBIT_GAP = 40;
  const BASE_RADIUS = 50;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0, height = 0;

    const animate = () => {
       // Resize logic
       const parent = canvas.parentElement;
       if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
           width = parent.clientWidth;
           height = parent.clientHeight;
           canvas.width = width;
           canvas.height = height;
       }

       // Clear
       ctx.fillStyle = '#09090b'; // Zinc-950
       ctx.fillRect(0, 0, width, height);
       
       const centerX = width / 2;
       const centerY = height / 2;

       // 1. Draw Nucleus (The sun of our tiny solar system)
       ctx.beginPath();
       ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
       ctx.fillStyle = '#ef4444'; // Red-500
       ctx.shadowColor = '#ef4444';
       ctx.shadowBlur = 20;
       ctx.fill();
       ctx.shadowBlur = 0;
       
       // Label Nucleus
       ctx.fillStyle = '#fff';
       ctx.font = 'bold 10px Arial';
       ctx.textAlign = 'center';
       ctx.textBaseline = 'middle';
       ctx.fillText('+Z', centerX, centerY);

       // 2. Draw Orbits (The tracks)
       ctx.lineWidth = 1;
       for(let n = 1; n <= 4; n++) {
         const r = BASE_RADIUS + (n-1) * ORBIT_GAP;
         ctx.beginPath();
         ctx.strokeStyle = values.currentN === n ? '#52525b' : '#27272a'; // Highlight current track
         ctx.setLineDash(values.currentN === n ? [] : [5, 5]);
         ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
         ctx.stroke();
         
         // Label Energy Levels
         ctx.fillStyle = '#71717a';
         ctx.fillText(`n=${n}`, centerX + r + 5, centerY);
       }
       ctx.setLineDash([]);

       // 3. Animate Electron Logic
       electronAngle.current += (0.05 / values.currentN); // Higher orbits = slower speed (Keplerish)
       const targetR = BASE_RADIUS + (values.currentN - 1) * ORBIT_GAP;
       
       // Smooth LERP for radius transition (The "Quantum Leap" visualization)
       visualRadius.current += (targetR - visualRadius.current) * 0.1;

       const ex = centerX + Math.cos(electronAngle.current) * visualRadius.current;
       const ey = centerY + Math.sin(electronAngle.current) * visualRadius.current;

       // 4. Draw Electron
       ctx.beginPath();
       ctx.arc(ex, ey, 8, 0, Math.PI * 2);
       ctx.fillStyle = '#3b82f6'; // Blue-500
       ctx.shadowColor = '#3b82f6';
       ctx.shadowBlur = 15;
       ctx.fill();

       // 5. Visual Feedback for Hit/Miss
       if (values.lastResult === 'miss') {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
          ctx.font = '20px monospace';
          ctx.fillText("MISSED! WRONG ENERGY", centerX, centerY + 180);
       } else if (values.lastResult === 'hit') {
          ctx.fillStyle = 'rgba(74, 222, 128, 0.5)';
          ctx.font = '20px monospace';
          ctx.fillText("ABSORBED!", centerX, centerY + 180);
       }

       requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [values]);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// --- 4. Controls Component ---
const Controls = ({ values, setValue }: { 
    values: SimState, 
    setValue: (k: keyof SimState, v: any) => void 
}) => {
    
    // Physics Logic (Bohr Model Simplified)
    // E = -13.6 / n^2
    const getEnergy = (n: number) => -13.6 / (n * n);
    
    const handleFire = () => {
        const currentE = getEnergy(values.currentN);
        const inputE = values.photonEnergy;
        
        let foundMatch = false;
        let nextN = values.currentN;

        // Check if input energy matches any gap required to jump UP
        for (let n = values.currentN + 1; n <= 4; n++) {
            const targetE = getEnergy(n);
            const requiredDelta = targetE - currentE;
            
            // Allow a small margin of error (+/- 0.3 eV) because we are nice
            if (Math.abs(inputE - requiredDelta) < 0.3) {
                nextN = n;
                foundMatch = true;
                break;
            }
        }

        if (foundMatch) {
            setValue('currentN', nextN);
            setValue('lastResult', 'hit');
            setValue('jumpsPerformed', values.jumpsPerformed + 1);
            // Auto reset feedback message after 2s
            setTimeout(() => setValue('lastResult', 'idle'), 2000);
        } else {
            setValue('lastResult', 'miss');
            // Auto reset feedback message after 1s
            setTimeout(() => setValue('lastResult', 'idle'), 1000);
        }
    };

    const handleReset = () => {
        setValue('currentN', 1);
        setValue('lastResult', 'idle');
    };

    // Calculate hints for the user (The cheat sheet)
    const hints = [];
    if (values.currentN < 4) {
        for(let n = values.currentN + 1; n <= 4; n++) {
            const gap = getEnergy(n) - getEnergy(values.currentN);
            hints.push(`To n=${n}: ~${gap.toFixed(1)} eV`);
        }
    } else {
        hints.push("Maximum Excitation Reached!");
    }

    return (
        <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto items-center">
            
            {/* Input Section */}
            <div className="flex-1 space-y-4 w-full">
                <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                        Photon Energy (Gun)
                    </label>
                    <span className="text-xl font-mono text-yellow-400 font-bold">
                        {values.photonEnergy.toFixed(1)} <span className="text-xs text-zinc-500">eV</span>
                    </span>
                </div>
                
                <input 
                    type="range" min="0" max="14" step="0.1"
                    value={values.photonEnergy}
                    onChange={(e) => setValue('photonEnergy', parseFloat(e.target.value))}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />

                <div className="flex gap-2 text-xs text-zinc-600 font-mono">
                    <span>0eV</span>
                    <span className="flex-1 text-center">UV / Visible Spectrum</span>
                    <span>14eV</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 w-full md:w-auto">
                 <button 
                    onClick={handleFire}
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                >
                    <FaBolt /> FIRE PHOTON
                </button>
                <button 
                    onClick={handleReset}
                    className="flex items-center justify-center gap-2 px-8 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-lg text-sm transition-all"
                >
                    <FaUndo /> Reset Electron
                </button>
            </div>

            {/* Info Panel / Cheat Sheet */}
            <div className="flex-1 bg-zinc-950/50 p-4 rounded-lg border border-zinc-800 w-full">
                <h4 className="text-zinc-400 text-xs font-bold uppercase mb-2 flex items-center gap-2">
                    <FaRocket className="text-blue-500"/> Cheat Sheet (Calculated Gaps)
                </h4>
                <div className="grid grid-cols-1 gap-1">
                    {hints.map((hint, i) => (
                        <div key={i} className="text-sm font-mono text-green-400/80">
                            • {hint}
                        </div>
                    ))}
                </div>
                <p className="text-xs text-zinc-600 mt-2 italic">
                    *Electrons ignore energy that isn't an exact match!
                </p>
            </div>

        </div>
    );
}

// --- 5. Export ---

// --- 5. Export ---
export const SIMULATION_28 = {
    title: 'Quantized Energy Levels',
    initialValues: { 
        currentN: 1, 
        photonEnergy: 10.2, 
        lastResult: 'idle',
        jumpsPerformed: 0
    },
    achievements: achievements,
    renderSimulation: ({ values }: { values: SimState }) => <AtomCanvas values={values} />,
    renderControls: Controls
};