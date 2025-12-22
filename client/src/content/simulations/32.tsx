import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine'; // Adjust path as needed

// --- 1. Interface ---
interface SimState {
  /** 0 = Fully Happy, 1 = Fully Sad. 0.5 = Superposition */
  moodProbability: number;
  /** Is the box open? (Wavefunction collapsed) */
  isObserved: boolean;
  /** The result of the observation: 0 for Happy, 1 for Sad, null if not looked yet */
  collapsedResult: number | null;
  /** How many times the user has peeked */
  observationCount: number;
}

// --- 2. Achievements ---
const achievements: Achievement<SimState>[] = [
  {
    id: 'pure-optimist',
    title: 'Toxic Positivity',
    description: 'Ensure a 100% chance of happiness and check the result. No room for sadness here.',
    condition: (s) => s.isObserved && s.moodProbability === 0 && s.collapsedResult === 0
  },
  {
    id: 'pure-pessimist',
    title: 'Total Doom',
    description: 'Crank the sadness probability to max and stare into the abyss.',
    condition: (s) => s.isObserved && s.moodProbability === 1 && s.collapsedResult === 1
  },
  {
    id: 'perfect-balance',
    title: 'Schrodingers Emoji',
    description: 'Set the probability exactly to 50/50 and collapse the wavefunction.',
    condition: (s) => s.isObserved && s.moodProbability === 0.5
  },
  {
    id: 'against-odds',
    title: 'Quantum Miracle',
    description: 'Set a high chance of sadness (>80%) but get a Happy result anyway. Lucky you!',
    condition: (s) => s.isObserved && s.moodProbability > 0.8 && s.collapsedResult === 0
  },
  {
    id: 'scientist',
    title: 'Peer Reviewer',
    description: 'Perform 10 observations. Science requires reproducible data!',
    condition: (s) => s.observationCount >= 10
  }
];

// --- 3. Canvas (The Visualization) ---
const QuantumCanvas = ({ values }: { values: SimState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const timeRef = useRef<number>(0);
  
  // We allow the canvas to react to values changing
  const valuesRef = useRef(values);
  useEffect(() => { valuesRef.current = values; }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0, height = 0;

    const drawFace = (x: number, y: number, size: number, isSad: boolean, opacity: number) => {
      ctx.globalAlpha = opacity;
      
      // Face shape
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = isSad ? '#3f3f46' : '#fbbf24'; // Zinc-700 (Sad) vs Amber-400 (Happy)
      ctx.fill();
      ctx.strokeStyle = isSad ? '#71717a' : '#f59e0b';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Eyes
      ctx.fillStyle = '#18181b';
      const eyeOffset = size * 0.35;
      const eyeSize = size * 0.12;
      ctx.beginPath();
      ctx.arc(x - eyeOffset, y - eyeOffset, eyeSize, 0, Math.PI * 2); // Left
      ctx.arc(x + eyeOffset, y - eyeOffset, eyeSize, 0, Math.PI * 2); // Right
      ctx.fill();

      // Mouth
      ctx.beginPath();
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#18181b';
      const mouthY = y + size * 0.15;
      const mouthW = size * 0.5;
      if (isSad) {
        // Frown (Arc goes up)
        ctx.arc(x, mouthY + mouthW * 0.4, mouthW, Math.PI * 1.2, Math.PI * 1.8);
      } else {
        // Smile (Arc goes down)
        ctx.arc(x, mouthY, mouthW, 0, Math.PI);
      }
      ctx.stroke();

      ctx.globalAlpha = 1.0; // Reset
    };

    const animate = () => {
      // Resize logic
      const parent = canvas.parentElement;
      if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
        width = parent.clientWidth;
        height = parent.clientHeight;
        canvas.width = width;
        canvas.height = height;
      }

      // Physics/Animation loop
      timeRef.current += 0.05;
      const { moodProbability, isObserved, collapsedResult } = valuesRef.current;

      // Clear Screen
      ctx.fillStyle = '#18181b'; // Zinc-950
      ctx.fillRect(0, 0, width, height);
      
      const centerX = width / 2;
      const centerY = height / 2;
      const baseSize = 80;

      // --- VISUALIZATION LOGIC ---
      
      if (isObserved) {
        // STATE COLLAPSED: We see exactly one reality
        const isSad = collapsedResult === 1;
        drawFace(centerX, centerY, baseSize, isSad, 1);

        // Text Feedback
        ctx.fillStyle = isSad ? '#a1a1aa' : '#fbbf24';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(isSad ? 'STATE: SAD (|1⟩)' : 'STATE: HAPPY (|0⟩)', centerX, centerY + 140);
        ctx.font = '14px monospace';
        ctx.fillStyle = '#52525b';
        ctx.fillText('(Wavefunction Collapsed)', centerX, centerY + 165);

      } else {
        // SUPERPOSITION: Both exist at once!
        
        // We vibrate the position slightly to show "uncertainty"
        const shake = 3; 
        const offsetX = Math.sin(timeRef.current * 10) * shake;
        const offsetY = Math.cos(timeRef.current * 15) * shake;

        // Draw "Sad" Potential (Ghostly)
        // Opacity corresponds to the probability of being sad
        if (moodProbability > 0) {
            drawFace(centerX + offsetX - 10, centerY + offsetY, baseSize, true, moodProbability * 0.6);
        }

        // Draw "Happy" Potential (Ghostly)
        // Opacity corresponds to probability of being happy (1 - sad_prob)
        if (moodProbability < 1) {
            drawFace(centerX - offsetX + 10, centerY - offsetY, baseSize, false, (1 - moodProbability) * 0.6);
        }

        // Draw the "Box" overlay (Conceptually)
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseSize + 20, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = '#4ade80';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SUPERPOSITION', centerX, centerY + 140);
        
        // Math representation
        const alpha = Math.sqrt(1 - moodProbability).toFixed(2);
        const beta = Math.sqrt(moodProbability).toFixed(2);
        ctx.fillStyle = '#71717a';
        ctx.font = '16px monospace';
        ctx.fillText(`ψ = ${alpha}|Happy⟩ + ${beta}|Sad⟩`, centerX, centerY + 170);
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// --- 4. Controls ---
const renderControls = ({ values, setValues }: { 
    values: SimState; 
    setValues: React.Dispatch<React.SetStateAction<SimState>>;
    setValue: (k: keyof SimState, v: any) => void; 
}) => {

    const handleObserve = () => {
        // THE MOMENT OF TRUTH
        // We roll the dice based on the current probability
        const roll = Math.random();
        // If roll is less than the sadness probability, it becomes sad (1)
        const result = roll < values.moodProbability ? 1 : 0;

        setValues(prev => ({
            ...prev,
            isObserved: true,
            collapsedResult: result,
            observationCount: prev.observationCount + 1
        }));
    };

    const handleReset = () => {
        // Close the box, restore superposition
        setValues(prev => ({
            ...prev,
            isObserved: false,
            collapsedResult: null
        }));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">
            
            {/* Probability Slider */}
            <div className="space-y-4 group">
                <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400 transition-colors">
                        Sadness Probability (|β|²)
                    </label>
                    <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
                        <span className="text-sm font-mono text-green-400 font-bold">
                            {(values.moodProbability * 100).toFixed(0)}%
                        </span>
                    </div>
                </div>
                
                <input 
                    type="range" min="0" max="1" step="0.01"
                    disabled={values.isObserved} // Can't change physics after measuring!
                    value={values.moodProbability}
                    onChange={(e) => setValues(prev => ({...prev, moodProbability: parseFloat(e.target.value)}))}
                    className={`glow-range w-full ${values.isObserved ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                />
                
                <div className="flex justify-between text-xs text-zinc-600 font-mono">
                    <span>Defintely Happy</span>
                    <span>Maybe?</span>
                    <span>Definitely Sad</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col items-center justify-center space-y-3">
                {!values.isObserved ? (
                    <button 
                        onClick={handleObserve}
                        className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-bold text-lg uppercase tracking-widest rounded shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all transform hover:scale-105 active:scale-95"
                    >
                        Observe State 👁️
                    </button>
                ) : (
                    <div className="w-full space-y-3 animate-in fade-in slide-in-from-bottom-4">
                        <div className={`p-3 rounded text-center border font-mono font-bold ${values.collapsedResult === 0 ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' : 'bg-zinc-700/50 border-zinc-600 text-zinc-400'}`}>
                            RESULT: {values.collapsedResult === 0 ? "✨ HAPPY ✨" : "💀 SAD 💀"}
                        </div>
                        <button 
                            onClick={handleReset}
                            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold uppercase tracking-wider rounded transition-all"
                        >
                            Reset Experiment 🔄
                        </button>
                    </div>
                )}
                <p className="text-xs text-zinc-500 text-center max-w-xs mt-2">
                    {values.isObserved 
                        ? "The wavefunction has collapsed. The outcome is now reality." 
                        : "The emoji exists in a superposition of states until you click Observe."}
                </p>
            </div>
        </div>
    );
};

// --- 5. Export ---

export const SIMULATION_32 = {
    title: 'Quantum State: The Emoji Box',
    initialValues: { 
        moodProbability: 0.5, 
        isObserved: false, 
        collapsedResult: null,
        observationCount: 0 
    } as SimState,
    achievements: achievements,
    renderSimulation: ({ values }: { values: SimState }) => (
        <QuantumCanvas values={values} />
    ),
    renderControls: renderControls
};