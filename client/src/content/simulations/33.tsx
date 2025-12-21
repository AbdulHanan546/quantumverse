import React, { useEffect, useRef } from 'react';
import { FaGhost, FaEye, FaWaveSquare, FaDiceD20 } from 'react-icons/fa';
import { type Achievement } from '../../components/SimulationEngine'; // Adjust import path as needed

// --- 1. Interface ---

interface SimState {
  /** The Quantum Number (n). aka: How energetic/wiggly the ghost is. */
  n: number;
  /** The view mode: false = Wavefunction (ψ), true = Probability Density (|ψ|²) */
  showProbability: boolean;
  /** A counter to track how many times we've tried to find the particle */
  observationCount: number;
  /** The last relative position where we found the particle (0.0 to 1.0) */
  lastDetectedX: number | null;
}

// --- 2. Achievements ---

const achievements: Achievement<SimState>[] = [
  {
    id: 'basement-dweller',
    title: 'The Basement Level',
    description: 'Set the Quantum Number (n) to 1. The ghost is lazy and sleeping in one big lump.',
    condition: (s) => s.n === 1
  },
  {
    id: 'penthouse-party',
    title: 'High Energy Vibe',
    description: 'Crank the Quantum Number (n) to 5. The ghost is having a panic attack.',
    condition: (s) => s.n === 5
  },
  {
    id: 'squaring-the-ghost',
    title: 'Reality Check',
    description: 'Switch to "Probability Mode" (|ψ|²). No more negative waves, just raw likelihood.',
    condition: (s) => s.showProbability === true
  },
  {
    id: 'observer-effect',
    title: 'Gotcha!',
    description: 'Observe (measure) the particle position at least 3 times. Stop hiding!',
    condition: (s) => s.observationCount >= 3
  },
  {
    id: 'lucky-center',
    title: 'Bullseye',
    description: 'Find the particle in the dead center of the box (between 45% and 55%). Pure luck.',
    condition: (s) => s.lastDetectedX !== null && s.lastDetectedX > 0.45 && s.lastDetectedX < 0.55
  }
];

// --- 3. Canvas Component ---

const QuantumCanvas = ({ values }: { values: SimState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const timeRef = useRef<number>(0);
  
  // We use a ref for values to access the latest state inside the animation loop without restarting it
  const valuesRef = useRef(values);
  useEffect(() => { valuesRef.current = values; }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0, height = 0;

    const animate = () => {
      // 1. Resize Handling
      const parent = canvas.parentElement;
      if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
        width = parent.clientWidth;
        height = parent.clientHeight;
        canvas.width = width;
        canvas.height = height;
      }

      // 2. Clear Canvas
      ctx.fillStyle = '#09090b'; // zinc-950
      ctx.fillRect(0, 0, width, height);

      const { n, showProbability, lastDetectedX } = valuesRef.current;
      timeRef.current += 0.05;

      const centerY = height / 2;
      const margin = 40;
      const boxWidth = width - (margin * 2);
      const boxStart = margin;
      
      // 3. Draw "The Box" (Infinite Potential Well boundaries)
      ctx.strokeStyle = '#52525b'; // zinc-600
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(boxStart, centerY - 100);
      ctx.lineTo(boxStart, centerY + 100);
      ctx.moveTo(boxStart + boxWidth, centerY - 100);
      ctx.lineTo(boxStart + boxWidth, centerY + 100);
      ctx.stroke();

      // Bottom line of the box
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(boxStart, centerY + 100);
      ctx.lineTo(boxStart + boxWidth, centerY + 100);
      ctx.stroke();

      // 4. Draw the Wavefunction (or Probability Density)
      ctx.beginPath();
      ctx.lineWidth = 3;
      
      // Color logic: Blue for Wave, Gold for Probability
      const primaryColor = showProbability ? '#fbbf24' : '#a78bfa'; // amber-400 vs violet-400
      ctx.strokeStyle = primaryColor;

      // Phase oscillation for the wave (makes it breathe), locked for Probability
      const phase = showProbability ? 1 : Math.cos(timeRef.current); 

      for (let x = 0; x <= boxWidth; x++) {
        // xRelative is 0 to 1
        const xRelative = x / boxWidth;
        
        // The Math: sin(n * pi * x/L)
        const psi = Math.sin(n * Math.PI * xRelative);
        
        let yOffset = 0;

        if (showProbability) {
            // Plot |ψ|² (Always positive)
            // Scale it up by 150px
            yOffset = -(psi * psi) * 150; 
        } else {
            // Plot ψ (Oscillates up and down)
            yOffset = -psi * 150 * phase; 
        }

        // We plot relative to centerY + 80 (near bottom of box) for Probability, 
        // or centerY for Wavefunction
        const baseLine = showProbability ? centerY + 100 : centerY;
        
        if (x === 0) ctx.moveTo(boxStart + x, baseLine + yOffset);
        else ctx.lineTo(boxStart + x, baseLine + yOffset);
      }
      ctx.stroke();

      // 5. Fill Gradient for Probability Mode
      if (showProbability) {
        ctx.lineTo(boxStart + boxWidth, centerY + 100);
        ctx.lineTo(boxStart, centerY + 100);
        ctx.fillStyle = 'rgba(251, 191, 36, 0.15)'; // faint amber
        ctx.fill();
      }

      // 6. Draw Text Labels
      ctx.fillStyle = '#71717a';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(showProbability ? `|ψ|² (Probability Density)` : `ψ (Wavefunction)`, width/2, centerY - 120);
      ctx.fillText(`n = ${n}`, width/2, centerY - 140);

      // 7. Draw Detected Particle (if exists)
      if (lastDetectedX !== null) {
          const particleX = boxStart + (lastDetectedX * boxWidth);
          const particleY = centerY + 100; // Sitting on the floor of the box

          // Glow
          const glowSize = 10 + (Math.sin(timeRef.current * 10) * 2);
          ctx.fillStyle = showProbability ? '#fbbf24' : '#4ade80'; 
          ctx.shadowColor = ctx.fillStyle;
          ctx.shadowBlur = 20;
          
          ctx.beginPath();
          ctx.arc(particleX, particleY - 6, 6, 0, Math.PI * 2);
          ctx.fill();

          // Reset Shadow
          ctx.shadowBlur = 0;
          
          // Label
          ctx.fillStyle = '#fff';
          ctx.fillText("DETECTED", particleX, particleY - 20);
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// --- 4. Controls Component ---

const Controls = ({ values, setValue }: { 
    values: SimState; 
    setValue: (key: keyof SimState, val: any) => void 
}) => {

    // Logic to "measure" the particle based on quantum probability
    const handleMeasure = () => {
        // We use Rejection Sampling to pick a random spot that respects the probability distribution
        let found = false;
        let position = 0;
        
        // Safety break counter
        let attempts = 0;

        while (!found && attempts < 1000) {
            attempts++;
            // Pick a random spot in the box (0 to 1)
            const x = Math.random();
            // Calculate probability at this spot: sin^2(n*pi*x)
            const prob = Math.pow(Math.sin(values.n * Math.PI * x), 2);
            
            // Roll a die against that probability
            // If random roll is LESS than probability, we found the particle here.
            // This means we are MORE likely to find it where prob is high.
            if (Math.random() < prob) {
                position = x;
                found = true;
            }
        }

        setValue('lastDetectedX', position);
        setValue('observationCount', values.observationCount + 1);
        
        // If we are looking at the wave, force switch to probability view for a second to make sense of it? 
        // Nah, let's just let them see the dot appear.
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
            
            {/* Quantum Number Slider */}
            <div className="space-y-3 group">
                <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-violet-400 transition-colors flex items-center gap-2">
                        <FaGhost /> Energy Level (n)
                    </label>
                    <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
                        <span className="text-sm font-mono text-violet-400 font-bold">{values.n}</span>
                    </div>
                </div>
                <input 
                    type="range" min="1" max="5" step="1"
                    value={values.n}
                    onChange={(e) => {
                        setValue('n', parseInt(e.target.value));
                        setValue('lastDetectedX', null); // Reset particle when wave changes
                    }}
                    className="glow-range accent-violet-500"
                />
                <p className="text-[10px] text-zinc-600">
                    Higher 'n' means more wiggles. More wiggles = More Energy.
                </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex justify-center">
                <button
                    onClick={() => setValue('showProbability', !values.showProbability)}
                    className={`
                        relative px-6 py-3 rounded-lg border flex items-center gap-3 font-bold transition-all duration-300 w-full md:w-auto justify-center
                        ${values.showProbability 
                            ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]' 
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'}
                    `}
                >
                    {values.showProbability ? <FaEye /> : <FaWaveSquare />}
                    <span>{values.showProbability ? "Probability View (|ψ|²)" : "Wave Function (ψ)"}</span>
                </button>
            </div>

            {/* Measurement Button */}
            <div className="flex flex-col items-end gap-2">
                 <button
                    onClick={handleMeasure}
                    className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg font-bold shadow-lg hover:shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <FaDiceD20 />
                    Collapse Wavefunction
                </button>
                <div className="text-xs text-zinc-500 font-mono">
                    Observations made: <span className="text-emerald-400">{values.observationCount}</span>
                </div>
            </div>

        </div>
    );
};

// --- 5. Export ---

export const SIMULATION_33 = {
  title: 'The Quantum Ghost (Wavefunctions)',
  initialValues: { 
    n: 1, 
    showProbability: false, 
    observationCount: 0, 
    lastDetectedX: null 
  },
  achievements: achievements,
  renderSimulation: ({ values }: { values: SimState }) => <QuantumCanvas values={values} />,
  renderControls: (props: any) => <Controls {...props} />
};