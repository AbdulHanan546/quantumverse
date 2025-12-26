import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine';
import { FaGhost, FaEye, FaEyeSlash } from 'react-icons/fa';

// --- 1. Interface ---
interface WaveState {
  frequency: number;   // How fast it wiggles (Hz)
  amplitude: number;   // How tall the wave is
  showComponents: boolean; // X-Ray mode for Standing Wave
  speed: number;       // How fast the wave travels
}

// --- 2. Achievements ---
const achievements: Achievement<WaveState>[] = [
  {
    id: 'tsunami',
    title: 'Tsunami Warning',
    description: 'Crank the Amplitude to the max. Hope you learned to swim.',
    condition: (s) => s.amplitude >= 140
  },
  {
    id: 'mosquito-sound',
    title: 'Mosquito Wing',
    description: 'Set Frequency to max. It is vibrating so fast it is barely visible.',
    condition: (s) => s.frequency >= 4.5
  },
  {
    id: 'x-ray-vision',
    title: 'Scooby Doo',
    description: 'Turn on "Ghost Mode" to unmask the Standing Wave.',
    condition: (s) => s.showComponents
  },
  {
    id: 'slow-mo',
    title: 'The Matrix',
    description: 'Drop the Wave Speed to minimum. Dodge the bullets.',
    condition: (s) => s.speed <= 1.0
  }
];

// --- 3. Canvas Component ---
const WaveCanvas = ({ values }: { values: WaveState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const timeRef = useRef<number>(0);
  const valuesRef = useRef(values);

  // Sync latest values
  useEffect(() => { valuesRef.current = values; }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0, height = 0;

    const animate = () => {
      // Resize Logic
      const parent = canvas.parentElement;
      if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
        width = parent.clientWidth;
        height = parent.clientHeight;
        canvas.width = width;
        canvas.height = height;
      }

      const { frequency, amplitude, speed, showComponents } = valuesRef.current;
      
      // Time flows faster if speed is higher, but frequency also affects wiggling
      // Let's separate them: 
      // Speed determines how fast the peaks move left/right.
      // Frequency determines how close the peaks are (Wavelength).
      timeRef.current += 0.05 * speed; 

      // Wavelength calculation: lambda = v / f
      // In code pixels: k = 2PI / lambda.
      // Let's assume a base scale.
      const k = (frequency * 0.1); 
      const omega = frequency * 0.2 * speed; 

      // --- RENDER ---
      
      // 1. Background
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      const splitH = height / 2;

      // --- TOP HALF: TRAVELLING WAVE ---
      // Concept: Energy moves from Left to Right.
      // Formula: y = A * sin(kx - wt)
      
      const midY1 = splitH / 2;
      
      // Draw Grid
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, midY1); ctx.lineTo(width, midY1);
      ctx.stroke();

      // Label
      ctx.fillStyle = '#22d3ee'; // Cyan
      ctx.font = 'bold 12px monospace';
      ctx.fillText("TRAVELLING WAVE (Energy Moves →)", 20, 30);
      
      ctx.beginPath();
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 10;
      
      for (let x = 0; x < width; x+=2) {
        // The negative time term makes it move right
        const y = midY1 + amplitude * Math.sin(k * x - timeRef.current);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset glow

      // Draw a "Surfer" particle to prove wave moves but matter just bobs
      const surferX = width / 2;
      const surferY = midY1 + amplitude * Math.sin(k * surferX - timeRef.current);
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(surferX, surferY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#71717a';
      ctx.font = '10px sans-serif';
      ctx.fillText("I just go up & down!", surferX + 10, surferY);


      // --- BOTTOM HALF: STANDING WAVE ---
      // Concept: Energy is trapped. Parts move, parts stay still.
      // Formula: y = 2A * sin(kx) * cos(wt)
      
      const midY2 = splitH + (splitH / 2);
      
      // Separator Line
      ctx.strokeStyle = '#3f3f46';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, splitH); ctx.lineTo(width, splitH);
      ctx.stroke();

      // Label
      ctx.fillStyle = '#f472b6'; // Pink
      ctx.font = 'bold 12px monospace';
      ctx.fillText("STANDING WAVE (Energy Trapped)", 20, splitH + 30);

      // GHOST MODE: Show the two travelling waves that make this up
      if (showComponents) {
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        
        // Wave 1: Going Right (Green)
        ctx.strokeStyle = '#4ade80';
        ctx.beginPath();
        for (let x = 0; x < width; x+=4) {
          const y = midY2 + amplitude * Math.sin(k * x - timeRef.current);
          if (x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.stroke();

        // Wave 2: Going Left (Yellow)
        ctx.strokeStyle = '#facc15';
        ctx.beginPath();
        for (let x = 0; x < width; x+=4) {
          const y = midY2 + amplitude * Math.sin(k * x + timeRef.current);
          if (x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.stroke();
        
        ctx.globalAlpha = 1.0;
      }

      // The Main Standing Wave
      ctx.beginPath();
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#f472b6';
      ctx.shadowBlur = 10;

      for (let x = 0; x < width; x+=2) {
        // sin(kx) defines the shape, cos(t) makes it bob up and down
        const y = midY2 + amplitude * Math.sin(k * x) * Math.cos(timeRef.current);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw Nodes (The spots that never move)
      // Nodes happen where sin(kx) = 0
      ctx.fillStyle = '#ef4444';
      for (let x = 0; x < width; x++) {
        // Check if sin(kx) is close to 0
        if (Math.abs(Math.sin(k * x)) < 0.05) {
          // Verify it's actually a node visual check (simple spacing check is better but this works for sim)
          // We only draw every few pixels to avoid clustering
          if (x % 20 === 0) { 
             ctx.beginPath();
             ctx.arc(x, midY2, 4, 0, Math.PI * 2);
             ctx.fill();
          }
        }
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// --- 4. Controls Component ---
const renderWaveControls = ({ values, setValue }: { 
  values: WaveState; 
  setValue: (k: keyof WaveState, v: any) => void;
}) => (
  <div className="flex flex-col gap-6 max-w-6xl mx-auto">
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      {/* Frequency Slider */}
      <div className="space-y-2 group">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest group-hover:text-cyan-400 transition-colors">
            Frequency (Tightness)
          </label>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-900/20 px-2 py-0.5 rounded">
            {values.frequency.toFixed(1)} Hz
          </span>
        </div>
        <input 
          type="range" min="0.5" max="5.0" step="0.1"
          value={values.frequency}
          onChange={(e) => setValue('frequency', parseFloat(e.target.value))}
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
        />
      </div>

      {/* Speed Slider */}
      <div className="space-y-2 group">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest group-hover:text-yellow-400 transition-colors">
            Wave Speed
          </label>
          <span className="text-xs font-mono text-yellow-400 bg-yellow-900/20 px-2 py-0.5 rounded">
            {values.speed.toFixed(1)} x
          </span>
        </div>
        <input 
          type="range" min="1.0" max="5.0" step="0.5"
          value={values.speed}
          onChange={(e) => setValue('speed', parseFloat(e.target.value))}
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-500 hover:accent-yellow-400"
        />
      </div>

      {/* Amplitude Slider */}
      <div className="space-y-2 group">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest group-hover:text-pink-400 transition-colors">
            Amplitude (Height)
          </label>
          <span className="text-xs font-mono text-pink-400 bg-pink-900/20 px-2 py-0.5 rounded">
            {values.amplitude.toFixed(0)} px
          </span>
        </div>
        <input 
          type="range" min="10" max="150" step="10"
          value={values.amplitude}
          onChange={(e) => setValue('amplitude', parseFloat(e.target.value))}
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-pink-500 hover:accent-pink-400"
        />
      </div>
    </div>

    {/* Toggle Button for Ghost Mode */}
    <div className="border-t border-zinc-800 pt-4 flex justify-between items-center">
      <div className="text-xs text-zinc-500 max-w-md">
        <strong className="text-zinc-300">Physics Tip:</strong> Travelling waves transfer energy. Standing waves trap energy in pockets.
      </div>
      
      <button
        onClick={() => setValue('showComponents', !values.showComponents)}
        className={`
          flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all
          ${values.showComponents
            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
            : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'}
        `}
      >
        {values.showComponents ? <FaEyeSlash /> : <FaEye />}
        {values.showComponents ? 'Hide Secret' : 'Ghost Mode'}
      </button>
    </div>

  </div>
);

// --- 5. Export ---
export const SIMULATION_4 = {
  title: 'Travelling vs Standing Waves',
  initialValues: { 
    frequency: 1.0, 
    amplitude: 50, 
    speed: 2.0,
    showComponents: false
  },
  achievements: achievements,
  renderSimulation: ({ values }: { values: WaveState }) => (
    <WaveCanvas values={values} />
  ),
  renderControls: renderWaveControls
};