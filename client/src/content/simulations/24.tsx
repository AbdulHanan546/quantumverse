import React, { useEffect, useRef, useState } from 'react';
import { type Achievement } from '../../components/SimulationEngine';
import { FaEye, FaEyeSlash, FaWeightHanging, FaRunning } from 'react-icons/fa';

// --- 1. Interface ---
interface SimState {
  mass: number;        // 1 (Quantum) to 10 (Classical)
  velocity: number;    // Speed
  observerEffect: boolean; // True = Particle Mode, False = Wave Mode
}

// --- 2. Achievements ---
const achievements: Achievement<SimState>[] = [
  {
    id: 'ghost-mode',
    title: 'Quantum Ghost',
    description: 'Minimize mass (< 2). The wavelength becomes huge!',
    condition: (s) => s.mass < 2
  },
  {
    id: 'classic-rock',
    title: 'Classical Rock',
    description: 'Max out mass (> 9). The wave nature disappears; it acts like a solid rock.',
    condition: (s) => s.mass > 9
  },
  {
    id: 'hidden-reality',
    title: 'The Hidden Reality',
    description: 'Turn off the Observer Effect to see the underlying wave function.',
    condition: (s) => !s.observerEffect
  },
  {
    id: 'fast-and-furious',
    title: 'Supersonic',
    description: 'High velocity compresses the wavelength.',
    condition: (s) => s.velocity > 9
  }
];

// --- 3. Canvas Component ---
const MatterWaveCanvas = ({ values }: { values: SimState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Refs for smooth animation state
  const valuesRef = useRef(values);
  useEffect(() => { valuesRef.current = values; }, [values]);

  const physicsRef = useRef({
    x: 0,
    time: 0
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      // Resize & Clear
      const parent = canvas.parentElement;
      if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Trail Effect: Fade out previous frames slightly for a "motion blur" feel
      ctx.fillStyle = 'rgba(9, 9, 11, 0.2)'; 
      ctx.fillRect(0, 0, width, height);

      const { mass, velocity, observerEffect } = valuesRef.current;
      const { x, time } = physicsRef.current;

      // --- Physics Math ---
      // Wavelength is inversely proportional to Momentum (p = mv)
      const momentum = mass * velocity;
      const wavelength = 2000 / Math.max(1, momentum); 
      // Amplitude represents "uncertainty". Low momentum = High Uncertainty (Big Wave)
      const amplitude = Math.min(60, 200 / mass);

      // --- Update Position ---
      physicsRef.current.x += velocity * 0.5;
      physicsRef.current.time += 0.1;
      
      // Wrap around screen
      if (physicsRef.current.x > width + 50) physicsRef.current.x = -50;

      const currentX = physicsRef.current.x;
      // The Y position oscillates if we are looking at the wave
      const waveY = centerY + Math.sin((currentX / wavelength) * Math.PI * 2 - time) * amplitude;
      const particleY = centerY; // Particle path is classically straight

      // --- Drawing ---

      if (observerEffect) {
        // === PARTICLE VIEW (Classical) ===
        // Draw a straight line guide
        ctx.beginPath();
        ctx.strokeStyle = '#27272a';
        ctx.moveTo(0, centerY); ctx.lineTo(width, centerY);
        ctx.stroke();

        // Draw the Solid Particle
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#a855f7';
        ctx.fillStyle = '#ffffff';
        const size = mass * 3; // Size scales with mass
        
        ctx.beginPath();
        ctx.arc(currentX, particleY, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Label
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#a855f7';
        ctx.font = '10px monospace';
        ctx.fillText("PARTICLE DETECTED", currentX - 40, particleY - size - 10);

      } else {
        // === WAVE VIEW (Quantum) ===
        // Draw the wave trail
        ctx.beginPath();
        ctx.strokeStyle = `hsla(270, 100%, 60%, 0.8)`;
        ctx.lineWidth = 3;
        
        // Draw sine wave segment around the particle
        for(let i = -100; i < 100; i+=2) {
             const wx = currentX + i;
             // Envelope function (Gaussian) to limit wave to a "packet"
             const envelope = Math.exp(-(i*i)/(2000 + (1000/mass))); 
             const wy = centerY + Math.sin(((wx) / wavelength) * Math.PI * 2 - time) * amplitude * envelope;
             
             if(i===-100) ctx.moveTo(wx, wy);
             else ctx.lineTo(wx, wy);
        }
        ctx.stroke();

        // Draw the "Fuzzy" center
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#d8b4fe';
        ctx.fillStyle = 'rgba(216, 180, 254, 0.8)';
        
        ctx.beginPath();
        // The size is "smeared" out
        ctx.arc(currentX, waveY, 5 + (20/mass), 0, Math.PI * 2);
        ctx.fill();

        // Draw Uncertainty Bounds
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, centerY - amplitude); ctx.lineTo(width, centerY - amplitude);
        ctx.moveTo(0, centerY + amplitude); ctx.lineTo(width, centerY + amplitude);
        ctx.stroke();
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// --- 4. Controls ---
const RenderControls = ({ values, setValue }: { values: SimState, setValue: any }) => {
    
    // Calculate display values
    const momentum = values.mass * values.velocity;
    const wavelength = (100 / momentum).toFixed(2); // Arbitrary unit scaling

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
            
            {/* Mass Slider */}
            <div className="space-y-4 group">
                <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <FaWeightHanging className="text-purple-500"/> Mass ($m$)
                    </label>
                    <div className="bg-zinc-800 px-3 py-1 rounded border border-zinc-700">
                        <span className="text-sm font-mono text-purple-400 font-bold">{values.mass.toFixed(1)}</span>
                    </div>
                </div>
                <input 
                    type="range" min="1" max="10" step="0.5"
                    value={values.mass}
                    onChange={(e) => setValue('mass', parseFloat(e.target.value))}
                    className="glow-range"
                    style={{'--range-color': '#a855f7'} as any}
                />
            </div>

            {/* Velocity Slider */}
            <div className="space-y-4 group">
                <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <FaRunning className="text-blue-500"/> Velocity ($v$)
                    </label>
                    <div className="bg-zinc-800 px-3 py-1 rounded border border-zinc-700">
                        <span className="text-sm font-mono text-blue-400 font-bold">{values.velocity.toFixed(1)}</span>
                    </div>
                </div>
                <input 
                    type="range" min="1" max="10" step="0.5"
                    value={values.velocity}
                    onChange={(e) => setValue('velocity', parseFloat(e.target.value))}
                    className="glow-range"
                    style={{'--range-color': '#3b82f6'} as any}
                />
            </div>

            {/* Observer / Stats Box */}
            <div className="flex flex-col gap-4">
                {/* Toggle Button */}
                <button 
                    onClick={() => setValue('observerEffect', !values.observerEffect)}
                    className={`
                        relative w-full py-4 rounded-xl border transition-all duration-300 flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-xs
                        ${values.observerEffect 
                            ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white' 
                            : 'bg-purple-900/30 border-purple-500 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                        }
                    `}
                >
                    {values.observerEffect ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                    {values.observerEffect ? 'Observer: ON' : 'Observer: OFF'}
                </button>
                
                {/* Wavelength Readout */}
                <div className="flex justify-between items-center px-4 py-2 bg-zinc-900 rounded border border-zinc-800">
                    <span className="text-zinc-500 text-xs font-bold">Wavelength ($\lambda$)</span>
                    <span className={`font-mono text-sm ${!values.observerEffect ? 'text-purple-400 animate-pulse' : 'text-zinc-600'}`}>
                        {wavelength} nm
                    </span>
                </div>
            </div>

        </div>
    );
};

// --- 5. Export ---
export const SIMULATION_24 = {
  title: 'Matter Waves: Particle or Wave?',
  initialValues: { mass: 2, velocity: 5, observerEffect: true },
  achievements: achievements,
  renderSimulation: ({ values }: { values: SimState }) => (
    <div className="w-full h-full relative">
      <MatterWaveCanvas values={values} />
      {/* Context Overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur border border-white/10 px-4 py-2 rounded-full pointer-events-none">
        <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
           Mode: <span className="text-white font-bold">{values.observerEffect ? "Classical Particle" : "Quantum Wave Function"}</span>
        </p>
      </div>
    </div>
  ),
  renderControls: (props: any) => <RenderControls {...props} />
};