import React, { useRef, useEffect } from 'react';
import { type Achievement } from '../../components/SimulationEngine';

// 1. Interface: Temperature is the main driver. 
// We use a "Planck vs Classical" toggle to show the disaster.
interface SimState {
  temperature: number; // In Kelvin
  showClassical: boolean;
  wavelengthLimit: number; // For "zooming" into the UV range
}

// 2. Achievements
const achievements: Achievement<SimState>[] = [
  {
    id: 'warm-up',
    title: 'Toaster Mode',
    description: 'Heat things up to at least 3000K. Starting to glow red!',
    condition: (s) => s.temperature >= 3000
  },
  {
    id: 'the-catastrophe',
    title: 'The Infinite Oven',
    description: 'Turn on the "Classical Prediction" and watch the math break reality.',
    condition: (s) => s.showClassical === true
  },
  {
    id: 'sun-surface',
    title: 'Touch the Sun',
    description: 'Match the surface temperature of the Sun (~5800K).',
    condition: (s) => s.temperature >= 5700 && s.temperature <= 5900
  },
  {
    id: 'uv-danger',
    title: 'UV Overload',
    description: 'At high temps with classical physics, the energy goes off the charts. Literally.',
    condition: (s) => s.showClassical && s.temperature > 8000
  },
  {
    id: 'quantum-saver',
    title: 'Planck to the Rescue',
    description: 'Avert the catastrophe by turning off classical physics at high heat.',
    condition: (s) => !s.showClassical && s.temperature > 9000
  }
];

// 3. Canvas Component
const BlackbodyCanvas = ({ values }: { values: SimState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width = canvas.parentElement?.clientWidth || 800;
    const height = canvas.height = canvas.parentElement?.clientHeight || 500;

    const padding = 50;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    // Physics Constants (Simplified for visualization)
    const h = 6.626; // Planck
    const c = 3.0;   // Speed of light
    const kB = 1.38; // Boltzmann

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw Axes
      ctx.strokeStyle = '#3f3f46';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, height - padding);
      ctx.lineTo(width - padding, height - padding);
      ctx.stroke();

      // Labels
      ctx.fillStyle = '#71717a';
      ctx.font = '10px monospace';
      ctx.fillText("Wavelength (Short -> Long)", padding, height - padding + 20);
      ctx.save();
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("Energy Density", -height / 2, padding - 10);
      ctx.restore();

      // The Curves
      const T = values.temperature;
      
      // 1. Classical (Rayleigh-Jeans) - The "Catastrophe"
      if (values.showClassical) {
        ctx.beginPath();
        ctx.strokeStyle = '#ef4444'; // Red for danger/catastrophe
        ctx.setLineDash([5, 5]);
        for (let x = 1; x < graphWidth; x++) {
          const wavelength = x * 10; 
          // Rayleigh-Jeans: Intensity = 8*pi*kT / lambda^4
          const intensity = (8 * Math.PI * kB * T) / Math.pow(wavelength / 50, 4);
          const drawY = height - padding - (intensity * 0.00001);
          
          if (x === 1) ctx.moveTo(padding + x, drawY);
          else ctx.lineTo(padding + x, drawY);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = '#ef4444';
        ctx.fillText("Classical Prediction (Infinite Energy!)", padding + 20, padding + 20);
      }

      // 2. Quantum (Planck's Law) - The Reality
      ctx.beginPath();
      ctx.strokeStyle = '#4ade80'; // Green for the solution
      ctx.lineWidth = 3;
      for (let x = 1; x < graphWidth; x++) {
        const lambda = x * 5; 
        // Planck's Law (Simplified scaling for visual)
        const exponent = (h * c) / (lambda * kB * T * 0.001);
        const intensity = (1 / Math.pow(lambda, 5)) * (1 / (Math.exp(exponent) - 1)) * 1e12;
        
        const drawY = height - padding - (intensity * (T / 1000));
        
        if (x === 1) ctx.moveTo(padding + x, drawY);
        else ctx.lineTo(padding + x, Math.max(padding, drawY));
      }
      ctx.stroke();

      // Rainbow Visible Spectrum Overlay
      const visibleStart = 150; 
      const visibleEnd = 250;
      const gradient = ctx.createLinearGradient(padding + visibleStart, 0, padding + visibleEnd, 0);
      gradient.addColorStop(0, 'violet');
      gradient.addColorStop(0.2, 'blue');
      gradient.addColorStop(0.4, 'green');
      gradient.addColorStop(0.6, 'yellow');
      gradient.addColorStop(0.8, 'orange');
      gradient.addColorStop(1, 'red');
      
      ctx.fillStyle = gradient;
      ctx.globalAlpha = 0.2;
      ctx.fillRect(padding + visibleStart, padding, visibleEnd - visibleStart, graphHeight);
      ctx.globalAlpha = 1.0;
    };

    draw();
  }, [values]);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// 4. Main Export
export const SIMULATION_18 = {
  title: 'The Ultraviolet Catastrophe',
  initialValues: { 
    temperature: 3000, 
    showClassical: false, 
    wavelengthLimit: 1000 
  },
  achievements: achievements,
  renderSimulation: ({ values }: { values: SimState }) => (
    <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="absolute top-8 text-center px-10">
            <p className="text-zinc-400 text-sm italic">
                {values.showClassical 
                    ? "According to old physics, this oven should be shooting X-rays at your face right now." 
                    : "Max Planck fixed this by suggesting energy comes in tiny 'packets' called Quanta."}
            </p>
        </div>
        <BlackbodyCanvas values={values} />
    </div>
  ),
  renderControls: ({ values, setValue }: { values: SimState, setValue: any }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      
      {/* Temperature Slider */}
      <div className="space-y-3 group">
        <div className="flex justify-between items-end">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400 transition-colors">Object Temperature</label>
          <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
            <span className="text-sm font-mono text-green-400 font-bold">{values.temperature} <span className="text-zinc-500 text-xs">K</span></span>
          </div>
        </div>
        <input 
          type="range" min="300" max="10000" step="100"
          value={values.temperature}
          onChange={(e) => setValue('temperature', parseInt(e.target.value))}
          className="glow-range"
        />
      </div>

      {/* Classical Toggle */}
      <div className="flex flex-col justify-center space-y-4">
        <button 
          onClick={() => setValue('showClassical', !values.showClassical)}
          className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 border-2 ${
            values.showClassical 
            ? 'bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' 
            : 'bg-zinc-800 border-zinc-700 text-zinc-400'
          }`}
        >
          {values.showClassical ? 'CLASSICAL PHYSICS: ON (DANGER)' : 'ENABLE CLASSICAL PREDICTION'}
        </button>
        <p className="text-[10px] text-zinc-600 text-center uppercase tracking-tighter">
            Warning: Classical physics may cause infinite energy loops and existential dread.
        </p>
      </div>

    </div>
  )
};