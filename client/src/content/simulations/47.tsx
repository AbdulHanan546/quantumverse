import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine'; // Adjust import path as needed

// --- 1. Interface & State ---

interface SimState {
  observationLevel: number; // 0 to 100 (How much are we peeking?)
  uncertainty: number;      // 1 to 50 (How messy/spread out the wave is naturally)
  speed: number;            // 0 to 10 (How fast it's evolving/moving)
}

// --- 2. Narrative & Achievements ---

/* 
 * The Story:
 * Imagine a teenager dancing in their room (Time Evolution). They are everywhere, 
 * doing moves that defy physics. This is the "Wave Function".
 * 
 * Suddenly, a parent opens the door (Measurement/Collapse). 
 * The teenager instantly freezes in one spot, looking awkward. 
 * 
 * In Quantum Mechanics, particles are waves of probability until we look at them.
 * Then they "collapse" into a boring particle.
 */

const achievements: Achievement<SimState>[] = [
  {
    id: 'privacy-please',
    title: 'Privacy Mode',
    description: 'Stop looking! Set Observation to 0 so the particle can dance in peace.',
    condition: (s) => s.observationLevel === 0
  },
  {
    id: 'caught-red-handed',
    title: 'The Stalker',
    description: 'Maximum Observation. Force that wave to become a particle. No secrets allowed.',
    condition: (s) => s.observationLevel >= 95
  },
  {
    id: 'hyperactive-ghost',
    title: 'Hyperactive Ghost',
    description: 'High speed with zero observation. It is everywhere at once, very fast.',
    condition: (s) => s.speed > 8 && s.observationLevel === 0
  },
  {
    id: 'frozen-time',
    title: 'Awkward Silence',
    description: 'Stop the motion (Speed 0) while staring at it (Obs > 50). It is just... sitting there.',
    condition: (s) => s.speed === 0 && s.observationLevel > 50
  },
  {
    id: 'heisenberg-confused',
    title: 'Heisenberg\'s Headache',
    description: 'Create a massive messy cloud. Max Uncertainty, no observation.',
    condition: (s) => s.uncertainty >= 45 && s.observationLevel === 0
  }
];

// --- 3. Canvas Renderer ---

const QuantumCanvas = ({ values }: { values: SimState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const timeRef = useRef<number>(0);
  
  // We use a ref for values to access the latest state inside the animation loop
  // without re-triggering the useEffect dependency on every frame
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

      // 2. Clear Screen
      ctx.fillStyle = '#09090b'; // Zinc-950
      ctx.fillRect(0, 0, width, height);

      // 3. Get Physics Values
      const { observationLevel, uncertainty, speed } = valuesRef.current;
      
      // Update time based on speed
      timeRef.current += speed * 0.05;

      const centerX = width / 2;
      const centerY = height / 2;

      // 4. Calculate Wave Properties
      // The "Observation" crushes the spread (Standard Deviation)
      // If Obs is 0, spread is controlled by 'uncertainty'.
      // If Obs is 100, spread becomes very small (Particle-like).
      const baseSpread = 20 + uncertainty * 4; 
      const collapseFactor = observationLevel / 100; // 0 to 1
      
      // The actual width of the wave packet
      // As collapseFactor goes up, sigma goes down.
      const sigma = baseSpread * (1 - collapseFactor * 0.95); 

      // Movement logic (Oscillation)
      // If looking (collapsed), it shouldn't move smoothly, it should "jitter" or stay put?
      // For this sim, we will let it move, but the wave packet is tight.
      const amplitude = (width / 3) * Math.sin(timeRef.current * 0.02);
      const waveX = centerX + amplitude;

      // 5. Draw the "Eye" (The Observer)
      const eyeOpenness = observationLevel / 100;
      if (eyeOpenness > 0) {
        ctx.save();
        ctx.translate(width / 2, height / 5);
        
        // Sclera
        ctx.beginPath();
        ctx.moveTo(-50, 0);
        ctx.quadraticCurveTo(0, -30 * eyeOpenness, 50, 0);
        ctx.quadraticCurveTo(0, 30 * eyeOpenness, -50, 0);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + eyeOpenness * 0.2})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(74, 222, 128, ${eyeOpenness})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Pupil
        if (eyeOpenness > 0.1) {
            ctx.beginPath();
            ctx.arc(0, 0, 10 * eyeOpenness, 0, Math.PI * 2);
            ctx.fillStyle = '#4ade80';
            ctx.fill();
        }
        ctx.restore();
      }

      // 6. Draw The Quantum Wave Function
      ctx.beginPath();
      ctx.strokeStyle = observationLevel > 80 ? '#f87171' : '#60a5fa'; // Red if collapsed, Blue if wave
      ctx.lineWidth = 3;

      // We draw the probability curve
      for (let x = 0; x < width; x+=2) {
        // Gaussian distribution formula: e^(-(x-mu)^2 / (2*sigma^2))
        const dist = x - waveX;
        const envelope = Math.exp(-(dist * dist) / (2 * sigma * sigma));
        
        // Add the "wavy" part inside the envelope (De Broglie wavelength)
        // High observation kills the internal wave frequency visual usually, but let's keep it cool.
        const frequency = 0.2; 
        const wave = Math.cos(dist * frequency - timeRef.current * 0.5);
        
        // Height of the wave at this pixel
        const y = centerY - (envelope * wave * 150);

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 7. Visual Effects for Collapse
      if (observationLevel > 80) {
        // Draw "Particle" indicator
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#f87171';
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(waveX, centerY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Add "Jitter" text or glitched lines
        ctx.fillStyle = 'rgba(248, 113, 113, 0.5)';
        ctx.font = '10px monospace';
        ctx.fillText("PARTICLE STATE", waveX - 40, centerY - 60);
      } else {
        ctx.fillStyle = 'rgba(96, 165, 250, 0.5)';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText("PROBABILITY CLOUD", waveX, centerY - 100);
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// --- 4. Controls Component ---

const RenderControls = ({ values, setValue }: { 
    values: SimState; 
    setValue: (k: keyof SimState, v: number) => void 
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
    
    {/* Observation Slider */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400 transition-colors">
            Observation (The Eye)
        </label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
          <span className={`text-sm font-mono font-bold ${values.observationLevel > 80 ? 'text-red-400' : 'text-green-400'}`}>
            {values.observationLevel.toFixed(0)}%
          </span>
        </div>
      </div>
      <input
        type="range" min="0" max="100" step="1"
        value={values.observationLevel}
        onChange={(e) => setValue('observationLevel', parseFloat(e.target.value))}
        className="glow-range"
      />
      <p className="text-[10px] text-zinc-600">
        0% = Ignore it (Wave). 100% = Stare at it (Particle).
      </p>
    </div>

    {/* Uncertainty Slider */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400 transition-colors">
            Uncertainty (Cloud Size)
        </label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
          <span className="text-sm font-mono text-green-400 font-bold">
            {values.uncertainty.toFixed(0)} <span className="text-zinc-500 text-xs">units</span>
          </span>
        </div>
      </div>
      <input
        type="range" min="1" max="50" step="1"
        value={values.uncertainty}
        onChange={(e) => setValue('uncertainty', parseFloat(e.target.value))}
        className="glow-range"
      />
      <p className="text-[10px] text-zinc-600">
        How big is the probability cloud when you aren't looking?
      </p>
    </div>

    {/* Speed Slider */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400 transition-colors">
            Time Evolution (Speed)
        </label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
          <span className="text-sm font-mono text-green-400 font-bold">
            {values.speed.toFixed(0)}x
          </span>
        </div>
      </div>
      <input
        type="range" min="0" max="10" step="0.5"
        value={values.speed}
        onChange={(e) => setValue('speed', parseFloat(e.target.value))}
        className="glow-range"
      />
       <p className="text-[10px] text-zinc-600">
        How fast the wave moves through the quantum void.
      </p>
    </div>

  </div>
);

// --- 5. Final Export ---

export const SIMULATION_47 = {
  title: 'Quantum Peek-a-Boo',
  initialValues: { observationLevel: 0, uncertainty: 25, speed: 2 },
  achievements: achievements,
  renderSimulation: (props: { values: SimState }) => <QuantumCanvas values={props.values} />,
  renderControls: RenderControls
};