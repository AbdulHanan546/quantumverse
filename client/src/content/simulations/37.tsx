import React, { useEffect, useRef } from 'react';
import { FaEye, FaEyeSlash, FaAtom } from 'react-icons/fa';
import { type Achievement } from '../../components/SimulationEngine'; 

// --- 1. Interface ---
interface QuantumState {
  energyLevel: number;
  isObserved: boolean;
  particlePosition: number;
  measurementCount: number;
  lastProbabilityFound: number;
}

// --- 2. Achievements ---
const achievements: Achievement<QuantumState>[] = [
  {
    id: 'observer-effect',
    title: 'The Nosy Neighbor',
    description: 'Collapse the wavefunction for the first time.',
    condition: (s) => s.measurementCount >= 1 && s.isObserved
  },
  {
    id: 'statistical-insanity',
    title: 'Insanity Definition',
    description: 'Measure the particle 10 times.',
    condition: (s) => s.measurementCount >= 10
  },
  {
    id: 'energy-max',
    title: 'Sugar Rush',
    description: 'Crank the energy level to 4.',
    condition: (s) => s.energyLevel === 4
  },
 

  {
    id: 'center-stage',
    title: 'Bullseye',
    description: 'Catch the particle almost exactly in the center (0.45 - 0.55).',
    condition: (s) => s.isObserved && s.particlePosition > 0.45 && s.particlePosition < 0.55
  },
  {
    id: 'let-it-go',
    title: 'Free Spirit',
    description: 'Stop measuring and let it turn back into a wave.',
    condition: (s) => !s.isObserved && s.measurementCount > 0
  }
];

// --- 3. Canvas Component (Unchanged) ---
const QuantumCanvas = ({ values }: { values: QuantumState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef<number>(0);
  const valuesRef = useRef(values);

  useEffect(() => { valuesRef.current = values; }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let requestID: number;
    let width = 0, height = 0;

    const animate = () => {
      const parent = canvas.parentElement;
      if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
        width = parent.clientWidth;
        height = parent.clientHeight;
        canvas.width = width;
        canvas.height = height;
      }

      const { energyLevel, isObserved, particlePosition } = valuesRef.current;
      timeRef.current += 0.05;

      // Draw Background
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      const baselineY = height * 0.8;
      const amplitude = height * 0.4;

      // Draw Box
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(0, height);
      ctx.moveTo(width, 0); ctx.lineTo(width, height);
      ctx.stroke();

      // Draw Wave
      ctx.beginPath();
      ctx.moveTo(0, baselineY);
      const waveOpacity = isObserved ? 0.2 : 1; 
      
      for (let x = 0; x <= width; x += 2) {
        const xNorm = x / width;
        const prob = Math.pow(Math.sin(energyLevel * Math.PI * xNorm), 2);
        const breathe = isObserved ? 1 : 1 + (Math.sin(timeRef.current * 2) * 0.1);
        const y = baselineY - (prob * amplitude * breathe);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, baselineY);
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, baselineY - amplitude, 0, baselineY);
      gradient.addColorStop(0, `rgba(167, 139, 250, ${waveOpacity})`);
      gradient.addColorStop(1, `rgba(167, 139, 250, 0)`);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = `rgba(139, 92, 246, ${waveOpacity})`;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw Particle
      if (isObserved) {
        const px = particlePosition * width;
        const pY = baselineY - 10;
        const glowSize = 20 + Math.sin(timeRef.current * 10) * 5;
        const radGrad = ctx.createRadialGradient(px, pY, 5, px, pY, glowSize);
        radGrad.addColorStop(0, '#f472b6');
        radGrad.addColorStop(1, 'rgba(244, 114, 182, 0)');
        ctx.fillStyle = radGrad;
        ctx.fillRect(px - glowSize, pY - glowSize, glowSize * 2, glowSize * 2);

        ctx.beginPath();
        ctx.arc(px, pY, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ec4899';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText("THERE IT IS!", px, pY - 40);
      } else {
        ctx.fillStyle = '#a78bfa';
        ctx.font = 'italic 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("? ? ?", width / 2, baselineY - amplitude - 20);
      }

      requestID = requestAnimationFrame(animate);
    };

    requestID = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestID);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// --- 4. Controls Component (With Debug Log) ---

const RenderControls = ({ values, setValue, setValues }: any) => {
  
  const handleMeasure = () => {
    let found = false;
    let pos = 0;
    let prob = 0;
    let attempts = 0;

    // Safety break loop
    while (!found && attempts < 2000) {
      const candidateX = Math.random(); 
      const probabilityAtX = Math.pow(Math.sin(values.energyLevel * Math.PI * candidateX), 2);
      
      if (Math.random() < probabilityAtX) {
        pos = candidateX;
        prob = probabilityAtX;
        found = true;
      }
      attempts++;
    }

    if (found) {
      // Debugging: This will let you see how rare < 0.1 actually is!
      console.log(`Measured! Position: ${pos.toFixed(2)}, Probability height: ${prob.toFixed(3)}`);
      
      setValues((prev: QuantumState) => ({
        ...prev,
        isObserved: true,
        particlePosition: pos,
        lastProbabilityFound: prob,
        measurementCount: prev.measurementCount + 1
      }));
    }
  };

  const handleReset = () => {
    setValue('isObserved', false);
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-8 max-w-6xl mx-auto w-full">
      
      {/* Sliders */}
      <div className="flex-1 w-full space-y-6">
        <div className="space-y-3 group">
            <div className="flex justify-between items-end">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-purple-400 transition-colors">
                Energy Level (n)
            </label>
            <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
                <span className="text-sm font-mono text-purple-400 font-bold">{values.energyLevel}</span>
            </div>
            </div>
            <input
            type="range" min="1" max="4" step="1"
            disabled={values.isObserved} 
            value={values.energyLevel}
            onChange={(e) => setValue('energyLevel', parseInt(e.target.value))}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer transition-all ${values.isObserved ? 'bg-zinc-800 grayscale cursor-not-allowed' : 'bg-zinc-700 hover:bg-zinc-600'}`}
            />
            <p className="text-xs text-zinc-500 h-4">
                {values.isObserved ? "Stop looking to change energy!" : "Higher energy = more places it might be."}
            </p>
        </div>
      </div>

      {/* Button */}
      <div className="flex-shrink-0 flex flex-col items-center gap-4">
        {!values.isObserved ? (
            <button 
                onClick={handleMeasure}
                className="group relative px-8 py-6 bg-purple-600 hover:bg-purple-500 rounded-2xl shadow-[0_0_30px_rgba(147,51,234,0.3)] hover:shadow-[0_0_50px_rgba(147,51,234,0.6)] transition-all transform hover:scale-105 active:scale-95 border border-purple-400/30"
            >
                <div className="flex flex-col items-center gap-2 text-white">
                    <FaEye className="text-3xl animate-pulse" />
                    <span className="font-bold tracking-wider">MEASURE</span>
                </div>
            </button>
        ) : (
            <button 
                onClick={handleReset}
                className="group relative px-8 py-6 bg-zinc-800 hover:bg-zinc-700 rounded-2xl border border-zinc-600 transition-all transform hover:scale-105 active:scale-95"
            >
                 <div className="flex flex-col items-center gap-2 text-zinc-300">
                    <FaEyeSlash className="text-3xl" />
                    <span className="font-bold tracking-wider">STOP LOOKING</span>
                </div>
            </button>
        )}
      </div>

      {/* Stats */}
      <div className="flex-1 w-full flex justify-end">
        <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800 w-full md:w-64 space-y-3">
            <h4 className="text-zinc-400 text-xs font-bold uppercase border-b border-zinc-800 pb-2 mb-2 flex items-center gap-2">
                <FaAtom /> Quantum Log
            </h4>
            
            <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Measurements:</span>
                <span className="text-zinc-200 font-mono">{values.measurementCount}</span>
            </div>
            
            <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Status:</span>
                <span className={`${values.isObserved ? 'text-pink-400' : 'text-purple-400'} font-bold font-mono`}>
                    {values.isObserved ? 'COLLAPSED' : 'SUPERPOSITION'}
                </span>
            </div>

            {values.isObserved && (
                <div className="mt-2 pt-2 border-t border-zinc-800/50 animate-in fade-in slide-in-from-bottom-2">
                     <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-500">Prob. Density:</span>
                        <span className={`${values.lastProbabilityFound < 0.25 ? 'text-green-400' : 'text-zinc-400'} font-mono`}>
                            {(values.lastProbabilityFound * 100).toFixed(1)}%
                        </span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-zinc-500">Position:</span>
                        <span className="text-pink-400 font-mono">{(values.particlePosition * 100).toFixed(1)}%</span>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

// --- 5. Export ---

export const SIMULATION_37 = {
  title: 'Measurement Postulate',
  initialValues: {
    energyLevel: 1,
    isObserved: false,
    particlePosition: 0.5,
    measurementCount: 0,
    lastProbabilityFound: 0
  },
  achievements: achievements,
  renderSimulation: ({ values }: { values: QuantumState }) => <QuantumCanvas values={values} />,
  renderControls: (props: any) => <RenderControls {...props} />
};