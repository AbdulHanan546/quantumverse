import React, { useEffect, useRef, useState } from 'react';
import { type Achievement } from '../../components/SimulationEngine';
import { FaTemperatureLow, FaSearchPlus, FaRulerHorizontal, FaCheck } from 'react-icons/fa';

// 1. Interface
interface SimState {
  targetLength: number;   // The goal (e.g., 50.000 mm)
  userLength: number;     // Where the user has positioned the cutter
  magnification: number;  // 1 = Eye, 10 = Lens, 100 = Microscope
  temperature: number;    // 0 = Absolute Zero, 100 = Meltdown
  bestError: number;      // Closest attempt so far
  isLocked: boolean;      // Did they click "Measure"?
}

// 2. Achievements
const achievements: Achievement<SimState>[] = [
  {
    id: 'ballpark',
    title: 'Good Enough',
    description: 'Get within 1.0mm of the target. A regular ruler works here.',
    condition: (s) => s.isLocked && Math.abs(s.userLength - s.targetLength) < 1.0
  },
  {
    id: 'precision',
    title: 'Swiss Watchmaker',
    description: 'Get within 0.05mm. You need the magnifying glass.',
    condition: (s) => s.isLocked && Math.abs(s.userLength - s.targetLength) < 0.05
  },
  {
    id: 'absolute-zero',
    title: 'Freeze Ray',
    description: 'Drop Temperature to 0. Stop those atoms from wiggling!',
    condition: (s) => s.temperature === 0
  },
  {
    id: 'impossible-measure',
    title: 'Heisenberg’s Headache',
    description: 'Try to measure with high precision (100x) while the object is super hot (>80). Good luck.',
    condition: (s) => s.isLocked && s.magnification === 100 && s.temperature > 80
  },
  {
    id: 'perfect-cut',
    title: 'The Perfect Cut',
    description: 'Achieve an error less than 0.005mm. (Hint: You need to be zoomed in AND cold).',
    condition: (s) => s.isLocked && Math.abs(s.userLength - s.targetLength) < 0.005
  }
];

// 3. Canvas Logic
const MeasurementCanvas = ({ values }: { values: SimState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const timeRef = useRef<number>(0);

  // We keep the "True" physical length separate from the "Target"
  // The object expands with heat!
  const physicalLengthRef = useRef<number>(values.targetLength);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0, height = 0;

    const animate = () => {
        // Resize
        const parent = canvas.parentElement;
        if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
            width = parent.clientWidth;
            height = parent.clientHeight;
            canvas.width = width;
            canvas.height = height;
        }

        timeRef.current += 0.05;
        const { userLength, targetLength, magnification, temperature } = values;

        // --- PHYSICS SIMULATION ---
        
        // 1. Thermal Expansion
        // Formula: L = L0 * (1 + alpha * T)
        // We simulate slight growth as temp goes up
        const expansion = (temperature / 100) * 0.2; 
        const trueTarget = targetLength + expansion;

        // 2. Thermal Vibration (Noise)
        // The atoms at the edge vibrate. The amplitude depends on Temp.
        // We generate a "current" edge position that jitters.
        const noiseAmplitude = (temperature / 100) * 0.05; // Max 0.05mm jitter
        const vibration = (Math.random() - 0.5) * noiseAmplitude;
        const visibleTargetEdge = trueTarget + vibration;

        // --- RENDERING ---
        
        // Background
        ctx.fillStyle = '#18181b';
        ctx.fillRect(0, 0, width, height);

        // Viewport Math
        // We need to zoom in on the edge.
        // Center of screen should represent the `userLength` (the caliper jaw)
        // Or better, center roughly around the target area.
        
        // Pixels per MM
        const baseScale = 20; // 20px = 1mm at 1x zoom
        const scale = baseScale * magnification;
        
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Function to map World MM to Screen X
        // We center the view on the User's Cutter/Caliper
        const worldToScreen = (mm: number) => {
            return centerX + (mm - userLength) * scale;
        };

        // 1. Draw The Metal Bar
        // It comes from the left (0) to `visibleTargetEdge`
        const barScreenStart = worldToScreen(0); // This might be way off screen to left
        const barScreenEnd = worldToScreen(visibleTargetEdge);

        // Bar Color based on Temp
        const r = Math.min(255, temperature * 2.5 + 50);
        const b = Math.max(50, 255 - temperature * 2);
        ctx.fillStyle = `rgb(${r}, 100, ${b})`;
        
        // Draw main block
        ctx.fillRect(Math.max(0, barScreenStart), centerY - 50, barScreenEnd - Math.max(0, barScreenStart), 100);

        // Draw Atoms at the edge (if zoomed in)
        if (magnification > 1) {
            ctx.fillStyle = `rgba(${r}, 150, ${b}, 0.8)`;
            const atomSize = scale * 0.02; // Visual atom size
            if (atomSize > 2) {
                // Draw a grid of circles at the edge to visualize the "Grain"
                const rows = 5;
                const cols = 4;
                for(let i=0; i<cols; i++) {
                    for(let j=0; j<rows; j++) {
                        // Offset them slightly by vibration
                        const atomJitterX = (Math.random() - 0.5) * noiseAmplitude * scale;
                        const atomJitterY = (Math.random() - 0.5) * noiseAmplitude * scale;
                        
                        const ax = barScreenEnd - (i * atomSize * 1.5) + atomJitterX;
                        const ay = centerY - 50 + 10 + (j * 20) + atomJitterY;
                        
                        ctx.beginPath();
                        ctx.arc(ax, ay, atomSize/2, 0, Math.PI*2);
                        ctx.fill();
                    }
                }
            }
        }

        // 2. Draw The User's Cutter / Caliper Jaw
        // This is always at exact center because we center view on `userLength`
        ctx.strokeStyle = '#4ade80'; // Green
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, height);
        ctx.stroke();

        // Label for Cutter
        ctx.fillStyle = '#4ade80';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`CUTTER: ${userLength.toFixed(4)} mm`, centerX + 10, centerY - 60);


        // 3. Draw The "Target" Line (Theoretical Perfect Length)
        // Only visible if low difficulty? No, let's hide it or make it faint.
        // The user sees the BAR edge. They don't see the "Target" value explicitly visually, 
        // they have to align with the physical object.
        // We won't draw a "Goal Line" because the goal is the bar itself.
        
        // 4. Ruler Markings
        ctx.strokeStyle = '#52525b';
        ctx.lineWidth = 1;
        ctx.font = '10px monospace';
        ctx.fillStyle = '#71717a';
        
        // Determine visible range in mm
        const screenWidthMM = width / scale;
        const startMM = userLength - screenWidthMM / 2;
        const endMM = userLength + screenWidthMM / 2;

        // Step size depends on zoom
        let step = 1; // 1mm
        if (magnification >= 10) step = 0.1;
        if (magnification >= 50) step = 0.01;

        // Round start to nearest step
        const firstMark = Math.floor(startMM / step) * step;

        for (let m = firstMark; m <= endMM; m += step) {
            const x = worldToScreen(m);
            const isWhole = Math.abs(m % 1) < 0.0001; // Is it a whole number?
            const heightTick = isWhole ? 20 : 10;
            
            ctx.beginPath();
            ctx.moveTo(x, height);
            ctx.lineTo(x, height - heightTick);
            ctx.stroke();

            if (isWhole) {
                ctx.fillText(m.toFixed(0), x + 2, height - 25);
            }
        }

        // 5. Visual Feedback "Fuzziness"
        // If high temp and zoomed in, blur the screen slightly?
        // Let's just rely on the atom vibration visuals.

        requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full cursor-crosshair" />;
};

// 4. Controls
const renderControls = ({ values, setValue, setValues }: any) => {
    
    // Helper to nudge the value
    const nudge = (amount: number) => {
        setValues((prev: SimState) => ({
            ...prev,
            userLength: parseFloat((prev.userLength + amount).toFixed(4)),
            isLocked: false // Reset lock if they move
        }));
    };

    const handleLock = () => {
        // Calculate error
        // Note: The "True" target includes thermal expansion?
        // For simplicity of teaching, let's say the Target is the Target, 
        // but thermal expansion makes the object *appear* larger/unstable.
        // So if they measure the HOT object perfectly, they are technically WRONG about the "Standard" length (at 20C).
        // This is a subtle physics lesson! 
        // Let's simplify: Error is difference between user and `targetLength`. 
        // But visually they aligned with `targetLength + expansion`.
        
        // Actually, let's make the goal "Measure the CURRENT length".
        // So target matches the expansion.
        const expansion = (values.temperature / 100) * 0.2; 
        const currentPhysicalLength = values.targetLength + expansion;
        const err = Math.abs(values.userLength - currentPhysicalLength);
        
        setValues((prev: SimState) => ({
            ...prev,
            isLocked: true,
            bestError: err
        }));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-start">
            
            {/* Left: Movement Controls */}
            <div className="space-y-4 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
                <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Micrometer Adjust</label>
                    <span className="font-mono text-green-400 font-bold">{values.userLength.toFixed(4)} mm</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                    {/* Coarse */}
                    <div className="flex flex-col gap-1">
                        <button onClick={() => nudge(-1)} className="btn-zinc-sm">-1.0</button>
                        <button onClick={() => nudge(1)} className="btn-zinc-sm">+1.0</button>
                        <span className="text-[9px] text-center text-zinc-500">COARSE</span>
                    </div>
                    {/* Fine */}
                    <div className="flex flex-col gap-1">
                        <button onClick={() => nudge(-0.1)} className="btn-zinc-sm">-0.1</button>
                        <button onClick={() => nudge(0.1)} className="btn-zinc-sm">+0.1</button>
                        <span className="text-[9px] text-center text-zinc-500">FINE</span>
                    </div>
                    {/* Micro */}
                    <div className="flex flex-col gap-1">
                        <button onClick={() => nudge(-0.01)} className="btn-zinc-sm" disabled={values.magnification < 10}>-0.01</button>
                        <button onClick={() => nudge(0.01)} className="btn-zinc-sm" disabled={values.magnification < 10}>+0.01</button>
                        <span className="text-[9px] text-center text-zinc-500">MICRO</span>
                    </div>
                </div>

                <button 
                    onClick={handleLock}
                    className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded font-bold flex items-center justify-center gap-2"
                >
                    <FaCheck /> MEASURE
                </button>
                
                {values.isLocked && (
                    <div className={`text-center text-sm font-bold ${values.bestError < 0.05 ? 'text-green-400' : 'text-red-400'}`}>
                        ERROR: {values.bestError.toFixed(4)} mm
                    </div>
                )}
            </div>

            {/* Middle: Zoom Controls */}
            <div className="space-y-4 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700 h-full flex flex-col justify-center">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest text-center flex items-center justify-center gap-2">
                    <FaSearchPlus /> Magnification
                </label>
                <div className="flex justify-center gap-4">
                     {[1, 10, 100].map(m => (
                         <button
                            key={m}
                            onClick={() => setValue('magnification', m)}
                            className={`
                                w-16 h-16 rounded-full flex items-center justify-center font-bold border-2 transition-all
                                ${values.magnification === m 
                                    ? 'border-green-400 bg-green-400/20 text-green-400 scale-110 shadow-[0_0_15px_rgba(74,222,128,0.3)]' 
                                    : 'border-zinc-600 text-zinc-500 hover:border-zinc-400'}
                            `}
                         >
                            {m}x
                         </button>
                     ))}
                </div>
                <p className="text-[10px] text-zinc-500 text-center">
                    {values.magnification === 1 ? "Naked Eye" : values.magnification === 10 ? "Magnifying Glass" : "Microscope"}
                </p>
            </div>

            {/* Right: Environment (Temperature) */}
            <div className="space-y-4 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
                <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <FaTemperatureLow /> Temperature
                    </label>
                    <span className={`font-mono font-bold ${values.temperature > 50 ? 'text-red-400' : 'text-blue-400'}`}>
                        {values.temperature} K
                    </span>
                </div>
                <input 
                    type="range" min="0" max="100" step="1"
                    value={values.temperature}
                    onChange={(e) => {
                        setValue('temperature', parseFloat(e.target.value));
                        setValue('isLocked', false);
                    }}
                    className={`glow-range ${values.temperature > 50 ? 'accent-red-500' : 'accent-blue-500'}`}
                />
                <p className="text-[10px] text-zinc-500">
                    Higher temperature causes <span className="text-red-400">Thermal Expansion</span> and <span className="text-red-400">Atomic Vibration</span> (Noise).
                </p>
            </div>
        </div>
    );
}

export const SIMULATION_31 = {
    title: 'Precision & Uncertainty',
    initialValues: { 
        targetLength: 50.00, 
        userLength: 48.00, 
        magnification: 1, 
        temperature: 20, // Room temp
        bestError: 0,
        isLocked: false
    },
    achievements: achievements,
    renderSimulation: ({ values }: { values: SimState }) => (
        <MeasurementCanvas values={values} />
    ),
    renderControls: renderControls
};