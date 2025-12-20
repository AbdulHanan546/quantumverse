import React, { useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaRedo, FaWaveSquare, FaCircleNotch, FaProjectDiagram } from 'react-icons/fa';
import { type Achievement } from '../../components/SimulationEngine';

// --- 1. Interface ---
interface SimState {
  omega: number;
  phase: number;
  amplitude: number;
  isPlaying: boolean;
  resetTrigger: number;
}

// --- 2. Achievements ---
const achievements: Achievement<SimState>[] = [
  {
    id: 'frozen-time',
    title: 'Za Warudo',
    description: 'Stop time by pausing the simulation.',
    condition: (s) => !s.isPlaying
  },
  {
    id: 'max-energy',
    title: 'Overdrive',
    description: 'Crank Angular Frequency (ω) and Amplitude (A) to the max.',
    condition: (s) => s.omega >= 5.0 && s.amplitude >= 1.5
  },
  {
    id: 'phase-shift',
    title: 'The Upside Down',
    description: 'Set Phase (φ) to roughly π (3.14). Starting from the left.',
    condition: (s) => s.phase >= 3.1 && s.phase <= 3.2
  },
  {
    id: 'slow-motion',
    title: 'Sloth Mode',
    description: 'Set Frequency to minimum (< 0.5).',
    condition: (s) => s.omega < 0.5
  },
  {
    id: 'perfect-zero',
    title: 'Null State',
    description: 'Set Phase to 0 and reset the timer.',
    condition: (s) => s.phase === 0 && s.resetTrigger > 0
  }
];

// --- 3. Canvas Component (FIXED) ---
const PhaseSpaceCanvas = ({ values }: { values: SimState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const timeRef = useRef<number>(0);
  const trailRef = useRef<{pos: number, vel: number}[]>([]);
  
  // FIX: Store latest values in a ref so the animation loop can read them 
  // without restarting the useEffect hook.
  const valuesRef = useRef(values);

  // Sync the ref whenever props change
  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  // Handle Reset logic (Independent of the animation loop)
  useEffect(() => {
    timeRef.current = 0;
    trailRef.current = [];
  }, [values.resetTrigger]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0, height = 0;

    const animate = () => {
        // 1. Read latest state from Ref (prevents freezing)
        const currentVals = valuesRef.current;

        // --- Resize ---
        const parent = canvas.parentElement;
        if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
            width = parent.clientWidth;
            height = parent.clientHeight;
            canvas.width = width;
            canvas.height = height;
        }

        // --- Physics Logic ---
        if (currentVals.isPlaying) {
            timeRef.current += 0.05;
        }

        // Use currentVals instead of values
        const theta = (currentVals.omega * timeRef.current) + currentVals.phase;
        
        const scale = Math.min(width, height) / 6;
        const radius = currentVals.amplitude * scale;
        
        const x = radius * Math.cos(theta);
        // Dampen velocity visually
        const v = -radius * Math.sin(theta); 
        
        // Update Trail
        if (currentVals.isPlaying) {
            trailRef.current.push({ pos: x, vel: v });
            if (trailRef.current.length > 200) trailRef.current.shift();
        }

        // --- Drawing ---
        ctx.fillStyle = '#18181b'; 
        ctx.fillRect(0, 0, width, height);
        
        const cy = height / 2;
        const cxPhasor = width * 0.16;
        const cxWaveStart = width * 0.35;
        const cxWaveEnd = width * 0.65;
        const cxPhase = width * 0.84;

        // Dividers
        ctx.strokeStyle = '#27272a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(width * 0.30, 20); ctx.lineTo(width * 0.30, height - 20);
        ctx.moveTo(width * 0.70, 20); ctx.lineTo(width * 0.70, height - 20);
        ctx.stroke();

        // 1. PHASOR
        ctx.strokeStyle = '#3f3f46';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cxPhasor, cy, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cxPhasor - radius - 10, cy); ctx.lineTo(cxPhasor + radius + 10, cy);
        ctx.moveTo(cxPhasor, cy - radius - 10); ctx.lineTo(cxPhasor, cy + radius + 10);
        ctx.stroke();

        const tipX = cxPhasor + x;
        const tipY = cy - (radius * Math.sin(theta)); 

        ctx.strokeStyle = '#a1a1aa';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cxPhasor, cy);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();

        ctx.fillStyle = '#4ade80';
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(74, 222, 128, 0.5)';
        ctx.beginPath();
        ctx.arc(tipX, tipY, 6, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#71717a';
        ctx.font = '10px monospace';
        ctx.fillText("PHASOR", cxPhasor - 20, height - 10);

        // 2. TIME DOMAIN
        ctx.save();
        ctx.beginPath();
        ctx.rect(cxWaveStart, 0, cxWaveEnd - cxWaveStart, height);
        ctx.clip();

        ctx.strokeStyle = '#27272a';
        ctx.beginPath();
        ctx.moveTo(cxWaveStart, cy); ctx.lineTo(cxWaveEnd, cy);
        ctx.stroke();

        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(74, 222, 128, 0.4)';
        ctx.beginPath();

        const wavePlotX = cxWaveStart + 20; 
        
        for(let i=0; i<trailRef.current.length; i++) {
            const pt = trailRef.current[trailRef.current.length - 1 - i];
            const px = wavePlotX + (i * 3); 
            const py = cy - pt.pos;
            if (px > cxWaveEnd) break;
            
            if (i===0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#71717a';
        ctx.fillText("TIME DOMAIN x(t)", cxWaveStart + 10, height - 10);

        // 3. PHASE SPACE
        ctx.strokeStyle = '#27272a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cxPhase, cy - height/3); ctx.lineTo(cxPhase, cy + height/3);
        ctx.moveTo(cxPhase - width/10, cy); ctx.lineTo(cxPhase + width/10, cy);
        ctx.stroke();

        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(74, 222, 128, 0.4)';
        ctx.beginPath();
        for(let i=0; i<trailRef.current.length; i++) {
            const pt = trailRef.current[trailRef.current.length - 1 - i];
            const px = cxPhase + pt.pos;
            const py = cy - (pt.vel * 0.8); 
            
            if (i===0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        const psX = cxPhase + x;
        const psY = cy - (v * 0.8);
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(psX, psY, 4, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#71717a';
        ctx.fillText("PHASE SPACE (v vs x)", cxPhase - 40, height - 10);

        requestRef.current = requestAnimationFrame(animate);
    };

    // FIX: Dependency array is empty. The loop starts once and never stops/restarts.
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []); 

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// --- 4. Controls Component (Unchanged) ---
const renderControls = ({ values, setValue }: { 
    values: SimState, 
    setValue: (k: keyof SimState, v: any) => void 
}) => (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-4">
                 <button 
                    onClick={() => setValue('isPlaying', !values.isPlaying)}
                    className={`
                        w-12 h-12 flex items-center justify-center rounded-full border transition-all duration-300
                        ${values.isPlaying 
                            ? 'bg-green-500/10 border-green-500/50 text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.2)]' 
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'}
                    `}
                >
                    {values.isPlaying ? <FaPause /> : <FaPlay className="ml-1" />}
                </button>
                <button 
                    onClick={() => setValue('resetTrigger', values.resetTrigger + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-all"
                    title="Reset t=0"
                >
                    <FaRedo size={14} />
                </button>
            </div>
            <div className="flex gap-6 font-mono text-xs">
                <div className="text-right">
                    <span className="block text-zinc-500 uppercase tracking-wider text-[10px]">Position x(t)</span>
                    <span className="text-green-400 font-bold text-lg">
                        {(values.amplitude * Math.cos(values.phase)).toFixed(2)}
                    </span>
                </div>
                <div className="w-px bg-zinc-800"></div>
                <div className="text-right">
                    <span className="block text-zinc-500 uppercase tracking-wider text-[10px]">Velocity v(t)</span>
                    <span className="text-yellow-400 font-bold text-lg">
                        {(-values.amplitude * values.omega * Math.sin(values.phase)).toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4 group">
                <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                        <FaCircleNotch className="text-zinc-600 group-hover:text-green-400 transition-colors" />
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400 transition-colors">
                            Angular Freq (ω)
                        </label>
                    </div>
                    <span className="text-sm font-mono text-green-400 font-bold bg-green-900/10 px-2 py-1 rounded border border-green-500/20">
                        {values.omega.toFixed(1)} <span className="text-zinc-500 text-[10px]">rad/s</span>
                    </span>
                </div>
                <input 
                    type="range" min="0.1" max="5.0" step="0.1"
                    value={values.omega}
                    onChange={(e) => setValue('omega', parseFloat(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-green-400 hover:accent-green-300"
                />
            </div>
            <div className="space-y-4 group">
                <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                        <FaWaveSquare className="text-zinc-600 group-hover:text-blue-400 transition-colors" />
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-blue-400 transition-colors">
                            Phase (φ)
                        </label>
                    </div>
                    <span className="text-sm font-mono text-blue-400 font-bold bg-blue-900/10 px-2 py-1 rounded border border-blue-500/20">
                        {values.phase.toFixed(2)} <span className="text-zinc-500 text-[10px]">rad</span>
                    </span>
                </div>
                <input 
                    type="range" min="0" max="6.28" step="0.1"
                    value={values.phase}
                    onChange={(e) => setValue('phase', parseFloat(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-400 hover:accent-blue-300"
                />
            </div>
            <div className="space-y-4 group">
                <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                        <FaProjectDiagram className="text-zinc-600 group-hover:text-amber-400 transition-colors" />
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-amber-400 transition-colors">
                            Amplitude (A)
                        </label>
                    </div>
                    <span className="text-sm font-mono text-amber-400 font-bold bg-amber-900/10 px-2 py-1 rounded border border-amber-500/20">
                        {values.amplitude.toFixed(1)} <span className="text-zinc-500 text-[10px]">units</span>
                    </span>
                </div>
                <input 
                    type="range" min="0.2" max="1.5" step="0.1"
                    value={values.amplitude}
                    onChange={(e) => setValue('amplitude', parseFloat(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400 hover:accent-amber-300"
                />
            </div>
        </div>
    </div>
);

// --- 5. Export ---
export const SIMULATION_2 = {
    title: 'The Cosmic Dance',
    initialValues: { 
        omega: 1.0, 
        phase: 0.0, 
        amplitude: 1.0,
        isPlaying: true,
        resetTrigger: 0
    },
    achievements: achievements,
    renderSimulation: ({ values }: { values: SimState }) => <PhaseSpaceCanvas values={values} />,
    renderControls: renderControls
};