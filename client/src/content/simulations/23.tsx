import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine';
import { FaRunning, FaWeightHanging, FaGhost, FaMeteor } from 'react-icons/fa';

// --- 1. Interface ---
interface DeBroglieState {
  mass: number;     // 1 to 100 (1 = Electron, 100 = Bowling Ball)
  velocity: number; // 1 to 50
}

// --- 2. Achievements ---
const achievements: Achievement<DeBroglieState>[] = [
  {
    id: 'ghost-mode',
    title: 'Quantum Ghost',
    description: 'Create a massive wavelength by being tiny (m < 5) and slow (v < 5).',
    condition: (s) => s.mass < 5 && s.velocity < 5
  },
  {
    id: 'classic-physics',
    title: 'Newton is Happy',
    description: 'Crush the wave nature! Max out Mass and Velocity so it goes in a straight line.',
    condition: (s) => s.mass > 90 && s.velocity > 40
  },
  {
    id: 'middle-ground',
    title: 'Identity Crisis',
    description: 'Make the particle unsure if it is a wave or a rock (Mass ~50, Velocity ~25).',
    condition: (s) => Math.abs(s.mass - 50) < 5 && Math.abs(s.velocity - 25) < 5
  },
  {
    id: 'hyper-speed',
    title: 'Warp Speed',
    description: 'Max out velocity regardless of mass.',
    condition: (s) => s.velocity === 50
  },
  {
    id: 'heavy-weight',
    title: 'Chonky Particle',
    description: 'Max out the mass. It takes a lot to make this thing wave.',
    condition: (s) => s.mass === 100
  }
];

// --- 3. Canvas ---
const WaveCanvas = ({ values }: { values: DeBroglieState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Ref to hold current values for the animation loop
  const valuesRef = useRef(values);
  useEffect(() => { valuesRef.current = values; }, [values]);

  // We need to track "real" X position for the sine wave math
  const distanceRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0, height = 0;
    
    // Trail history: Defined INSIDE this effect so it persists while dragging sliders
    // because this effect only runs ONCE on mount now.
    const trail: {x: number, y: number, alpha: number}[] = [];

    const animate = () => {
      // Resize
      const parent = canvas.parentElement;
      if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
        width = parent.clientWidth;
        height = parent.clientHeight;
        canvas.width = width;
        canvas.height = height;
      }

      // Read from REF to get latest values without resetting the loop
      const { mass, velocity } = valuesRef.current;
      const centerY = height / 2;

      // PHYSICS MATH:
      // De Broglie Wavelength lambda = h / (mv)
      // We use an arbitrary constant '3000' to make it look good on screen
      const momentum = mass * velocity;
      const wavelength = 3000 / Math.max(1, momentum); 
      
      // Amplitude: 
      // In QM, amplitude relates to probability. Here we visualize "uncertainty" 
      // by making the wave taller when momentum is low.
      const amplitude = Math.min(100, 4000 / momentum);

      // Update position
      const moveSpeed = velocity * 0.15;
      distanceRef.current += moveSpeed;
      
      // Calculate current screen position
      // We wrap the X so it stays on screen, but we calculate Y based on total distance
      const screenX = (distanceRef.current % (width + 100)) - 50;
      const screenY = centerY + Math.sin(distanceRef.current * (2 * Math.PI / wavelength)) * amplitude;

      // Clear Screen
      ctx.fillStyle = '#18181b'; 
      ctx.fillRect(0, 0, width, height);

      // Draw Grid (The "Classical" Straight Lines)
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Horizontal center line
      ctx.moveTo(0, centerY); ctx.lineTo(width, centerY);
      // Vertical grid lines
      for(let x=0; x<width; x+=50) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
      ctx.stroke();

      // Manage Trail
      trail.push({ x: screenX, y: screenY, alpha: 1.0 });
      if (trail.length > 50) trail.shift(); // Keep last 50 points

      // Draw Trail (The Wave Function)
      const isWave = momentum < 500;
      const trailColor = isWave ? '132, 204, 22' : '59, 130, 246'; // Lime vs Blue
      
      ctx.beginPath();
      for (let i = 0; i < trail.length - 1; i++) {
        const pt = trail[i];
        const nextPt = trail[i+1];
        
        // Don't draw line if it wrapped around screen (from right edge to left edge)
        if (nextPt.x < pt.x) continue;
        
        ctx.strokeStyle = `rgba(${trailColor}, ${i / trail.length})`;
        ctx.lineWidth = 3 + (isWave ? 2 : 0); // Thicker line for waves
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(nextPt.x, nextPt.y);
        ctx.stroke();
      }

      // Draw Particle
      ctx.shadowBlur = 15;
      ctx.shadowColor = isWave ? '#84cc16' : '#3b82f6';
      ctx.fillStyle = '#ffffff';
      
      ctx.beginPath();
      // Size changes with mass
      const size = 5 + (mass / 3); 
      ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
      ctx.fill();

      // Draw "Wobble" Radius (Heisenberg Uncertainty hint)
      if (isWave) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(132, 204, 22, 0.3)`;
          ctx.lineWidth = 1;
          ctx.arc(screenX, screenY, size + amplitude/2, 0, Math.PI * 2);
          ctx.stroke();
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []); // Dependency array is empty! Loop runs once and persists.

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// --- 4. Controls ---
const RenderControls = ({ values, setValue }: { values: DeBroglieState, setValue: any }) => {
    
    const momentum = values.mass * values.velocity;
    const isWave = momentum < 500; // Threshold for text feedback

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
            
            {/* Mass Slider */}
            <div className="space-y-4 group">
                <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <FaWeightHanging className="text-purple-500" /> Mass ($m$)
                    </label>
                    <div className="bg-zinc-800 px-3 py-1 rounded border border-zinc-700">
                        <span className="text-sm font-mono text-purple-400 font-bold">
                            {values.mass === 1 ? 'Electron' : values.mass === 100 ? 'Bowling Ball' : values.mass} 
                            <span className="text-zinc-600 text-[10px] ml-1">amu</span>
                        </span>
                    </div>
                </div>
                <input 
                    type="range" min="1" max="100" step="1"
                    value={values.mass}
                    onChange={(e) => setValue('mass', parseFloat(e.target.value))}
                    className="glow-range"
                    style={{'--range-color': '#a855f7'} as any}
                />
                 <p className="text-[10px] text-zinc-500">
                    Lower mass = More wave-like. Heavy things don't like to wiggle.
                </p>
            </div>

            {/* Velocity Slider */}
            <div className="space-y-4 group">
                <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                         <FaRunning className="text-orange-500" /> Velocity ($v$)
                    </label>
                    <div className="bg-zinc-800 px-3 py-1 rounded border border-zinc-700">
                        <span className="text-sm font-mono text-orange-400 font-bold">
                            {values.velocity} <span className="text-zinc-600 text-[10px] ml-1">m/s</span>
                        </span>
                    </div>
                </div>
                <input 
                    type="range" min="1" max="50" step="1"
                    value={values.velocity}
                    onChange={(e) => setValue('velocity', parseFloat(e.target.value))}
                    className="glow-range"
                    style={{'--range-color': '#f97316'} as any}
                />
                <p className="text-[10px] text-zinc-500">
                    Slower speed = More time to wiggle (Larger $\lambda$).
                </p>
            </div>

            {/* Live Feedback Board */}
            <div className={`p-4 rounded-xl border transition-all duration-500 flex flex-col items-center justify-center text-center gap-2
                ${isWave ? 'bg-lime-900/20 border-lime-500/50' : 'bg-blue-900/20 border-blue-500/50'}
            `}>
                {isWave ? (
                    <>
                        <FaGhost className="text-3xl text-lime-400 animate-bounce" />
                        <div>
                            <h3 className="text-lime-400 font-bold uppercase tracking-widest text-sm">Wave Mode</h3>
                            <p className="text-xs text-lime-200/70 mt-1">
                                "I am everywhere and nowhere!"
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <FaMeteor className="text-3xl text-blue-400" />
                        <div>
                            <h3 className="text-blue-400 font-bold uppercase tracking-widest text-sm">Particle Mode</h3>
                            <p className="text-xs text-blue-200/70 mt-1">
                                "Out of my way, I'm a solid object!"
                            </p>
                        </div>
                    </>
                )}
                <div className="mt-2 w-full h-px bg-white/10"></div>
                <div className="text-[10px] font-mono text-zinc-400">
                    $\lambda \approx { (3000 / Math.max(1, momentum)).toFixed(1) }$ units
                </div>
            </div>

        </div>
    );
};

// --- 5. Export ---
export const SIMULATION_23 = {
    title: 'De Broglie Hypothesis',
    initialValues: { mass: 20, velocity: 15 },
    achievements: achievements,
    renderSimulation: ({ values }: { values: DeBroglieState }) => (
        <WaveCanvas values={values} />
    ),
    renderControls: (props: any) => <RenderControls {...props} />
};