import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine';

// 1. Interface
interface SimState {
  mass: number;
  k: number;
  amplitude: number;
}

// 2. Achievements
const achievements: Achievement<SimState>[] = [
  {
    id: 'heavy-lifter',
    title: 'Heavy Lifter',
    description: 'Simulate a mass greater than 9.0 kg.',
    condition: (s) => s.mass > 9.0
  },
  {
    id: 'high-frequency',
    title: 'High Frequency',
    description: 'Create a stiff spring (k > 18) with a light mass (m < 2).',
    condition: (s) => s.k > 18 && s.mass < 2
  },
  {
    id: 'perfect-stillness',
    title: 'Perfect Stillness',
    description: 'Set the amplitude to 0 to stop the motion entirely.',
    condition: (s) => s.amplitude === 0
  },
  {
    id: 'resonance-master',
    title: 'Balanced System',
    description: 'Match Mass and K perfectly (e.g. 5kg and 5N/m).',
    condition: (s) => s.mass === s.k
  }
];

// 3. Canvas
const PhysicsCanvas = ({ values }: { values: SimState }) => {
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
        // Resize logic tailored for the container
        const parent = canvas.parentElement;
        if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
            width = parent.clientWidth;
            height = parent.clientHeight;
            canvas.width = width;
            canvas.height = height;
        }

        const { mass, k, amplitude } = valuesRef.current;
        timeRef.current += 0.1;
        
        const omega = Math.sqrt(k / mass);
        const disp = amplitude * Math.cos(omega * timeRef.current);

        ctx.fillStyle = '#18181b';
        ctx.fillRect(0, 0, width, height);

        // Center line
        ctx.strokeStyle = '#27272a';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(width/2, 0); ctx.lineTo(width/2, height);
        ctx.stroke();
        ctx.setLineDash([]);

        const centerX = width / 2;
        const centerY = height / 2;
        const blockX = centerX + disp;

        // Spring
        ctx.beginPath();
        ctx.strokeStyle = '#52525b';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.moveTo(0, centerY);
        
        const coils = 12;
        for(let i=0; i<=coils; i++) {
            const x = (i/coils) * blockX;
            const yOffset = i%2===0 ? -15 : 15;
            if (i===0 || i===coils) ctx.lineTo(x, centerY);
            else ctx.lineTo(x, centerY + yOffset);
        }
        ctx.stroke();

        // Mass Block
        ctx.fillStyle = '#18181b';
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(74, 222, 128, 0.4)';
        ctx.shadowBlur = 25;
        
        const size = 50 + (mass * 4);
        ctx.fillRect(blockX - size/2, centerY - size/2, size, size);
        ctx.strokeRect(blockX - size/2, centerY - size/2, size, size);
        
        // Label
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#4ade80';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${mass.toFixed(1)}kg`, blockX, centerY);

        requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

const renderControls = ({ values, setValue }) => (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            
            {/* Mass Slider */}
            <div className="space-y-3 group">
              <div className="flex justify-between items-end">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400 transition-colors">Mass (m)</label>
                <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
                    <span className="text-sm font-mono text-green-400 font-bold">{values.mass.toFixed(1)} <span className="text-zinc-500 text-xs">kg</span></span>
                </div>
              </div>
              <input 
                type="range" min="0.5" max="10" step="0.5"
                value={values.mass}
                onChange={(e) => setValue('mass', parseFloat(e.target.value))}
                className="glow-range"
              />
            </div>

            {/* Spring Constant Slider */}
            <div className="space-y-3 group">
              <div className="flex justify-between items-end">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400 transition-colors">Spring Constant (k)</label>
                <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
                    <span className="text-sm font-mono text-green-400 font-bold">{values.k.toFixed(0)} <span className="text-zinc-500 text-xs">N/m</span></span>
                </div>
              </div>
              <input 
                type="range" min="1" max="20" step="1"
                value={values.k}
                onChange={(e) => setValue('k', parseFloat(e.target.value))}
                className="glow-range"
              />
            </div>

            {/* Amplitude Slider */}
            <div className="space-y-3 group">
              <div className="flex justify-between items-end">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400 transition-colors">Amplitude (A)</label>
                <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
                    <span className="text-sm font-mono text-green-400 font-bold">{values.amplitude.toFixed(0)} <span className="text-zinc-500 text-xs">px</span></span>
                </div>
              </div>
              <input 
                type="range" min="0" max="250" step="10"
                value={values.amplitude}
                onChange={(e) => setValue('amplitude', parseFloat(e.target.value))}
                className="glow-range"
              />
            </div>

          </div>
)

export const SIMULATION_1 = {
    title: 'Harmonic Oscillator',
    initialValues: { mass: 2, k: 5, amplitude: 100 },
    achievements: achievements,
    renderSimulation: ({ values }) => (
        <PhysicsCanvas values={values} />
    ),
    renderControls: renderControls
}