import React, { useEffect, useRef, useState } from 'react';
import { type Achievement } from '../../components/SimulationEngine';
import { FaEye, FaWaveSquare, FaRedo, FaGhost } from 'react-icons/fa';

// --- 1. Interface ---
interface QuantumState {
  fuzziness: number;    // How spread out the probability cloud is
  energy: number;       // How fast it wiggles
  operator: 'none' | 'position' | 'momentum'; // Which operator is currently active
  clickCount: number;   // Just to track interaction
}

// --- 2. Achievements ---
const achievements: Achievement<QuantumState>[] = [
  {
    id: 'first-collapse',
    title: 'The Nosy Neighbor',
    description: 'Force the particle to choose a location by using the Position Operator.',
    condition: (s) => s.operator === 'position'
  },
  {
    id: 'wave-dude',
    title: 'Surfs Up',
    description: 'Apply the Momentum Operator to see the particle behave like a pure wave.',
    condition: (s) => s.operator === 'momentum'
  },
  {
    id: 'maximum-chaos',
    title: 'Hyperactive Ghost',
    description: 'Max out the Energy while keeping the particle in a fuzzy Superposition.',
    condition: (s) => s.energy >= 9.5 && s.operator === 'none'
  },
  {
    id: 'pinpoint-accuracy',
    title: 'The Sniper',
    description: 'Measure Position while Fuzziness is set to minimum (creating a sharp probability spike).',
    condition: (s) => s.operator === 'position' && s.fuzziness <= 10
  },
  {
    id: 'spread-thin',
    title: 'Existential Crisis',
    description: 'Max out the Fuzziness so the particle is basically everywhere at once.',
    condition: (s) => s.fuzziness >= 190
  }
];

// --- 3. Canvas Renderer ---
const QuantumCanvas = ({ values }: { values: QuantumState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef<number>(0);
  const valuesRef = useRef(values);

  // Keep ref in sync for the animation loop without re-triggering effects
  useEffect(() => { valuesRef.current = values; }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0, height = 0;
    let animationFrameId: number;

    const animate = () => {
      // 1. Auto-resize logic
      const parent = canvas.parentElement;
      if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
        width = parent.clientWidth;
        height = parent.clientHeight;
        canvas.width = width;
        canvas.height = height;
      }

      const { fuzziness, energy, operator } = valuesRef.current;
      timeRef.current += (0.05 + (energy * 0.01));

      // Clear Screen
      ctx.fillStyle = '#18181b'; // zinc-950
      ctx.fillRect(0, 0, width, height);
      
      const cx = width / 2;
      const cy = height / 2;

      // --- VISUALIZATION LOGIC ---
      
      // Scenario A: SUPERPOSITION (Operator = None)
      // Visual: A fuzzy, shifting cloud of potential realities
      if (operator === 'none') {
        const particles = 30;
        
        // Draw the "Ghost" label
        ctx.fillStyle = 'rgba(161, 161, 170, 0.5)';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText("? SUPERPOSITION ?", cx, cy - 100);
        ctx.font = '12px monospace';
        ctx.fillText("(The particle hasn't decided where to be yet)", cx, cy - 80);

        for (let i = 0; i < particles; i++) {
          // Calculate a chaotic but bounded position based on "Fuzziness"
          const offset = i * (Math.PI * 2 / particles);
          const radius = (fuzziness * 1.5) * Math.sin(timeRef.current + offset);
          
          const x = cx + Math.cos(timeRef.current * (i % 3 === 0 ? 1 : -1) + offset) * radius;
          const y = cy + Math.sin(timeRef.current * (i % 2 === 0 ? 1 : -1) + offset) * (radius * 0.5);

          ctx.beginPath();
          ctx.arc(x, y, 5 + (energy), 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${280 + (i * 4)}, 70%, 60%, 0.3)`; // Purple/Pink ghostly colors
          ctx.fill();
        }
      }

      // Scenario B: POSITION OPERATOR (Operator = X)
      // Visual: A sharp spike (Gaussian collapse)
      else if (operator === 'position') {
        ctx.fillStyle = '#4ade80'; // Green
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText("OPERATOR: POSITION (X)", cx, cy - 100);
        ctx.font = '12px monospace';
        ctx.fillText("Wavefunction collapsed to a single point!", cx, cy - 80);

        // Draw the axis
        ctx.strokeStyle = '#3f3f46';
        ctx.beginPath();
        ctx.moveTo(0, cy + 50);
        ctx.lineTo(width, cy + 50);
        ctx.stroke();

        // Draw the Probability Spike (Gaussian)
        ctx.beginPath();
        ctx.moveTo(0, cy + 50);
        
        // The width of the spike depends on "Fuzziness" (Uncertainty Principle inverted essentially for visual aid)
        // If fuzziness is high in simulation input, we actually make the spike wider here to show 'lesser' precision,
        // or we can treat the input 'fuzziness' as the initial state width. 
        // Let's treat 'fuzziness' input as the resulting error margin.
        const sigma = Math.max(10, fuzziness / 2); 
        
        for (let x = 0; x < width; x+=5) {
          const dist = x - cx;
          // Gaussian function
          const heightVal = 150 * Math.exp(-(dist * dist) / (2 * sigma * sigma));
          ctx.lineTo(x, (cy + 50) - heightVal);
        }
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Fill the area
        ctx.lineTo(width, cy + 50);
        ctx.fillStyle = 'rgba(74, 222, 128, 0.2)';
        ctx.fill();

        // The "Particle" found
        ctx.beginPath();
        ctx.arc(cx, cy + 50, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
      }

      // Scenario C: MOMENTUM OPERATOR (Operator = P)
      // Visual: A continuous sine wave (Plane Wave)
      else if (operator === 'momentum') {
        ctx.fillStyle = '#38bdf8'; // Blue
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText("OPERATOR: MOMENTUM (P)", cx, cy - 100);
        ctx.font = '12px monospace';
        ctx.fillText("Position is now unknown (Wave spread everywhere)", cx, cy - 80);

        // Draw the wave
        ctx.beginPath();
        ctx.moveTo(0, cy);
        
        const frequency = 0.02 + (energy * 0.005); // Energy determines wavelength
        
        for (let x = 0; x < width; x++) {
          // Traveling wave equation
          const y = Math.sin((x * frequency) - (timeRef.current * 5)) * 50;
          ctx.lineTo(x, cy + y);
        }

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Add a "Glow" behind it
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#0ea5e9';
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// --- 4. Controls Component ---
const renderControls = ({ values, setValue }: { 
  values: QuantumState; 
  setValue: (key: keyof QuantumState, val: any) => void 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
      
      {/* SECTION 1: The Environment */}
      <div className="space-y-6 bg-zinc-800/50 p-4 rounded-xl border border-zinc-700">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-700 pb-2">
          Wave Properties
        </h3>

        {/* Fuzziness Slider */}
        <div className="space-y-2 group">
          <div className="flex justify-between items-end">
            <label className="text-xs font-bold text-zinc-500 group-hover:text-purple-400 transition-colors">
              Fuzziness (Uncertainty)
            </label>
            <span className="text-xs font-mono text-purple-400">{values.fuzziness.toFixed(0)}%</span>
          </div>
          <input
            type="range" min="0" max="200" step="10"
            value={values.fuzziness}
            onChange={(e) => setValue('fuzziness', parseFloat(e.target.value))}
            className="w-full h-2 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400"
          />
          <p className="text-[10px] text-zinc-500">
            How "cloudy" the particle is before measurement.
          </p>
        </div>

        {/* Energy Slider */}
        <div className="space-y-2 group">
          <div className="flex justify-between items-end">
            <label className="text-xs font-bold text-zinc-500 group-hover:text-yellow-400 transition-colors">
              Energy Level
            </label>
            <span className="text-xs font-mono text-yellow-400">{values.energy.toFixed(1)} eV</span>
          </div>
          <input
            type="range" min="1" max="10" step="0.5"
            value={values.energy}
            onChange={(e) => setValue('energy', parseFloat(e.target.value))}
            className="w-full h-2 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-yellow-500 hover:accent-yellow-400"
          />
        </div>
      </div>

      {/* SECTION 2: The Operators */}
      <div className="space-y-4 md:col-span-1 lg:col-span-2 bg-zinc-800/50 p-4 rounded-xl border border-zinc-700">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-700 pb-2">
          Apply an Operator
        </h3>
        
        <div className="grid grid-cols-3 gap-4">
          {/* Reset / None */}
          <button
            onClick={() => setValue('operator', 'none')}
            className={`
              p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all
              ${values.operator === 'none' 
                ? 'bg-purple-900/20 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300'}
            `}
          >
            <FaGhost className="text-2xl" />
            <span className="text-xs font-bold uppercase">Leave Alone</span>
          </button>

          {/* Position Operator */}
          <button
            onClick={() => {
              setValue('operator', 'position');
              setValue('clickCount', values.clickCount + 1);
            }}
            className={`
              p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all
              ${values.operator === 'position' 
                ? 'bg-green-900/20 border-green-500 text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.2)]' 
                : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300'}
            `}
          >
            <FaEye className="text-2xl" />
            <span className="text-xs font-bold uppercase">Measure Position</span>
          </button>

          {/* Momentum Operator */}
          <button
            onClick={() => {
              setValue('operator', 'momentum');
              setValue('clickCount', values.clickCount + 1);
            }}
            className={`
              p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all
              ${values.operator === 'momentum' 
                ? 'bg-sky-900/20 border-sky-500 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]' 
                : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300'}
            `}
          >
            <FaWaveSquare className="text-2xl" />
            <span className="text-xs font-bold uppercase">Measure Momentum</span>
          </button>
        </div>

        <div className="p-3 bg-zinc-900 rounded border border-zinc-800 text-xs text-zinc-400 leading-relaxed italic">
          <span className="text-yellow-500 font-bold not-italic">Hint: </span>
          In Quantum Mechanics, applying an operator (like measuring where something is) <span className="text-white">destroys</span> the superposition. You force the cloud to become a specific value.
        </div>
      </div>

    </div>
  );
};

// --- 5. Export ---
export const SIMULATION_35 = {
  title: 'The Indecisive Particle (Observables)',
  initialValues: { 
    fuzziness: 100, 
    energy: 2, 
    operator: 'none', 
    clickCount: 0 
  } as QuantumState,
  achievements: achievements,
  renderSimulation: (props: { values: QuantumState }) => <QuantumCanvas {...props} />,
  renderControls: renderControls
};