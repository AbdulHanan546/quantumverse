import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine';

// --- 1. Interface ---
interface MediumState {
  frequency: number; // Controlled by the source (your hand)
  amplitude: number; // How high the wave is
  density: number;   // Linear density (Thickness of the rope)
  tension: number;   // Tension (How tight we pull it)
}

// --- 2. Achievements ---
const achievements: Achievement<MediumState>[] = [
  {
    id: 'molasses',
    title: 'Stuck in Molasses',
    description: 'Create the slowest wave possible (Max Density, Min Tension).',
    condition: (s) => s.density >= 9 && s.tension <= 2
  },
  {
    id: 'fiber-optic',
    title: 'Light Speed',
    description: 'Make it travel instantly! (Min Density, Max Tension).',
    condition: (s) => s.density <= 2 && s.tension >= 18
  },
  {
    id: 'confused-physics',
    title: 'The Cancel Culture',
    description: 'High Tension tries to speed it up, High Density slows it down. Balance them.',
    condition: (s) => s.tension > 15 && s.density > 8
  },
  {
    id: 'flat-earth',
    title: 'Flat Earth Theory',
    description: 'Zero Amplitude. No wave, just a line. Boring.',
    condition: (s) => s.amplitude === 0
  },
  {
    id: 'perfect-storm',
    title: 'Tsunami Mode',
    description: 'Max Amplitude with a heavy medium (Density > 8).',
    condition: (s) => s.amplitude >= 140 && s.density > 8
  }
];

// --- 3. Canvas Component ---
const MediumCanvas = ({ values }: { values: MediumState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const timeRef = useRef<number>(0);
  const valuesRef = useRef(values);

  useEffect(() => { valuesRef.current = values; }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0, height = 0;

    const animate = () => {
      const parent = canvas.parentElement;
      if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
        width = parent.clientWidth;
        height = parent.clientHeight;
        canvas.width = width;
        canvas.height = height;
      }

      const { frequency, amplitude, density, tension } = valuesRef.current;
      
      // PHYSICS ENGINE ---------------------------
      // Wave Speed v is proportional to sqrt(Tension / Density)
      // We add a multiplier to make it look good on screen
      const waveSpeed = Math.sqrt(tension / density) * 15;
      
      // Angular Frequency (omega) = 2 * pi * f
      const omega = 2 * Math.PI * (frequency * 0.5);
      
      // Wave Number (k) = omega / v
      // This determines wavelength. If speed drops, k increases (wavelength shrinks).
      const k = waveSpeed > 0 ? omega / waveSpeed : 0;

      // Increment time
      // We use a fixed delta for smooth animation
      timeRef.current += 0.016; // approx 60fps

      // DRAWING ----------------------------------
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);
      
      const centerY = height / 2;

      // 1. Draw the "Medium" (The Rope)
      ctx.beginPath();
      
      // Visual Feedback: 
      // High Tension = Hot colors (Red/Orange)
      // Low Tension = Cold colors (Blue/Grey)
      const tensionColor = Math.min(255, (tension / 20) * 255);
      ctx.strokeStyle = `rgb(255, ${255 - tensionColor}, ${255 - tensionColor})`;
      
      // Visual Feedback:
      // High Density = Thick Line
      ctx.lineWidth = density * 1.5; 
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Draw the traveling sine wave
      // y = A * sin(kx - wt)
      // Note: We subtract wt to move Right. Add wt to move Left.
      
      for (let x = 0; x <= width; x += 2) {
        const y = centerY + amplitude * Math.sin((k * x) - (omega * timeRef.current));
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 2. Draw Particles (to show medium doesn't move forward, only up/down)
      // Let's draw a bead on the string every 100px
      const beadSpacing = 100;
      for (let x = 50; x < width; x += beadSpacing) {
         const y = centerY + amplitude * Math.sin((k * x) - (omega * timeRef.current));
         
         ctx.beginPath();
         ctx.arc(x, y, density + 3, 0, Math.PI * 2); // Bead size depends on density
         ctx.fillStyle = '#facc15'; // Yellow beads
         ctx.fill();
         
         // Little vertical arrows on the beads to show direction of motion
         ctx.beginPath();
         ctx.moveTo(x, y - (density+5));
         ctx.lineTo(x, y + (density+5));
         ctx.strokeStyle = '#000';
         ctx.lineWidth = 1;
         ctx.stroke();
      }

      // 3. Stats HUD (Head-up Display)
      ctx.fillStyle = '#52525b';
      ctx.font = '12px monospace';
      ctx.fillText(`Wave Speed: ${waveSpeed.toFixed(1)} m/s`, 20, 30);
      ctx.fillText(`Wavelength: ${(waveSpeed / (frequency || 1)).toFixed(1)} px`, 20, 50);

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// --- 4. Controls Component ---
const renderControls = ({ values, setValue }: { 
    values: MediumState, 
    setValue: (k: keyof MediumState, v: any) => void 
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
    
    {/* Frequency Source */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-blue-400 transition-colors">
            Source Frequency
        </label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
          <span className="text-sm font-mono text-blue-400 font-bold">
            {values.frequency.toFixed(1)} <span className="text-zinc-500 text-xs">Hz</span>
          </span>
        </div>
      </div>
      <input 
        type="range" min="0.1" max="5" step="0.1"
        value={values.frequency}
        onChange={(e) => setValue('frequency', parseFloat(e.target.value))}
        className="glow-range accent-blue-500"
      />
      <p className="text-[10px] text-zinc-600">How fast your hand shakes the rope.</p>
    </div>

    {/* Density (The Medium) */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-amber-600 transition-colors">
            Medium Density
        </label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
          <span className="text-sm font-mono text-amber-600 font-bold">
            {values.density.toFixed(1)} <span className="text-zinc-500 text-xs">kg/m</span>
          </span>
        </div>
      </div>
      <input 
        type="range" min="1" max="10" step="0.5"
        value={values.density}
        onChange={(e) => setValue('density', parseFloat(e.target.value))}
        className="glow-range accent-amber-600"
      />
      <p className="text-[10px] text-zinc-600">Thickness of the rope. Heavy = Slow.</p>
    </div>

    {/* Tension (The Force) */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-red-500 transition-colors">
            Rope Tension
        </label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
          <span className="text-sm font-mono text-red-500 font-bold">
            {values.tension.toFixed(0)} <span className="text-zinc-500 text-xs">N</span>
          </span>
        </div>
      </div>
      <input 
        type="range" min="1" max="20" step="1"
        value={values.tension}
        onChange={(e) => setValue('tension', parseFloat(e.target.value))}
        className="glow-range accent-red-500"
      />
      <p className="text-[10px] text-zinc-600">How hard you pull the rope. Tight = Fast.</p>
    </div>

    {/* Amplitude (Visuals) */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400 transition-colors">
            Amplitude
        </label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
          <span className="text-sm font-mono text-green-400 font-bold">
            {values.amplitude.toFixed(0)} <span className="text-zinc-500 text-xs">px</span>
          </span>
        </div>
      </div>
      <input 
        type="range" min="0" max="150" step="5"
        value={values.amplitude}
        onChange={(e) => setValue('amplitude', parseFloat(e.target.value))}
        className="glow-range accent-green-500"
      />
    </div>

  </div>
);

// --- 5. Export ---
export const SIMULATION_6 = {
    title: 'The Sludge Runner',
    initialValues: { frequency: 1, amplitude: 50, density: 5, tension: 10 },
    achievements: achievements,
    renderSimulation: ({ values }: { values: MediumState }) => (
        <MediumCanvas values={values} />
    ),
    renderControls: renderControls
};