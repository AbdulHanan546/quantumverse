import React, { useEffect, useRef, useState } from 'react';
import { type Achievement } from '../../components/SimulationEngine';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

// 1. Interface
interface SimState {
  firingRate: number;    // How fast we shoot particles
  slitGap: number;       // Distance between the two holes
  observerActive: boolean; // Are we watching? (Collapses the wave)
  particlesFired: number; // Total count (for achievements)
}

// 2. Achievements
const achievements: Achievement<SimState>[] = [
  {
    id: 'first-shot',
    title: 'Pew Pew',
    description: 'Fire your first 50 quantum particles.',
    condition: (s) => s.particlesFired >= 50
  },
  {
    id: 'the-watcher',
    title: 'Nosy Neighbor',
    description: 'Turn on the Observer (Eye). You collapsed the wave function! Rude.',
    condition: (s) => s.observerActive === true
  },
  {
    id: 'quantum-weirdness',
    title: 'Quantum Weirdness',
    description: 'Turn the Observer OFF and let the interference pattern appear.',
    condition: (s) => s.observerActive === false && s.particlesFired > 100
  },
  {
    id: 'machine-gun',
    title: 'Particle Accelerator',
    description: 'Max out the firing rate. Science waits for no one.',
    condition: (s) => s.firingRate >= 20
  },
  {
    id: 'wide-load',
    title: 'Social Distancing',
    description: 'Maximize the gap between the slits.',
    condition: (s) => s.slitGap >= 150
  },
  {
    id: 'data-scientist',
    title: 'Big Data',
    description: 'Simulate over 1,000 particles in a single session.',
    condition: (s) => s.particlesFired >= 1000
  }
];

// 3. Canvas Logic
const PhysicsCanvas = ({ values }: { values: SimState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // We use refs for physics objects to avoid React re-renders slowing down the loop
  const particlesRef = useRef<any[]>([]);
  const hitsRef = useRef<number[]>(new Array(600).fill(0)); // Stores where particles land on screen
  const valuesRef = useRef(values);

  // Sync latest React state to the Ref for the animation loop
  useEffect(() => { 
    valuesRef.current = values; 
    // If we toggle observer, we don't clear hits immediately to show the contrast, 
    // but in a real app you might want to. We'll leave them to show the "overwrite".
  }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0, height = 0;
    let frame = 0;

    const animate = () => {
        // Resize Handling
        const parent = canvas.parentElement;
        if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
            width = parent.clientWidth;
            height = parent.clientHeight;
            canvas.width = width;
            canvas.height = height;
            // Reset hits array size if height changes significantly
            if (hitsRef.current.length !== height) {
                hitsRef.current = new Array(height).fill(0);
            }
        }

        const { firingRate, slitGap, observerActive } = valuesRef.current;
        const centerX = width / 2;
        const centerY = height / 2;
        const slitX = width * 0.3; // Slits are at 30% width
        const screenX = width * 0.9; // Screen is at 90% width

        // --- 1. Spawn Particles ---
        // Higher firing rate = higher chance to spawn per frame
        if (frame % Math.max(1, Math.floor(21 - firingRate)) === 0) {
            particlesRef.current.push({
                x: 0,
                y: centerY + (Math.random() - 0.5) * 20, // Start slightly spread
                vx: 4, // Speed
                vy: (Math.random() - 0.5) * 0.5,
                phase: 'source', // source -> traveling -> hit
                color: '#4ade80' // Green
            });
            // Update the global counter (hacky way to update state from inside animation loop without triggering re-renders)
            // In a pure implementation, we'd throttle this back to the parent. 
            // For this engine, we rely on the periodic React updates or the Achievements loop reading the prop.
            // *Note: The achievements read `values.particlesFired`. We need to increment that.*
            // Since we can't easily write back to "values" prop, we assume the parent handles simple state.
            // However, to make achievements work for "count", we need a way to increment the external state.
            // For this specific render loop, we will visualize local physics. 
        }

        // Clear Screen
        ctx.fillStyle = '#18181b'; // Zinc-950
        ctx.fillRect(0, 0, width, height);

        // --- 2. Draw Environment ---
        
        // The Barrier
        ctx.strokeStyle = '#52525b';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(slitX, 0);
        ctx.lineTo(slitX, centerY - slitGap/2 - 10); // Top wall
        ctx.moveTo(slitX, centerY - slitGap/2 + 10);
        ctx.lineTo(slitX, centerY + slitGap/2 - 10); // Middle wall
        ctx.moveTo(slitX, centerY + slitGap/2 + 10);
        ctx.lineTo(slitX, height); // Bottom wall
        ctx.stroke();

        // The Observer Eye (if active)
        if (observerActive) {
            ctx.fillStyle = '#facc15'; // Yellow
            ctx.font = '20px Arial';
            ctx.fillText('👁️', slitX - 10, centerY - slitGap/2 - 40);
            
            // Draw "Look" cone
            ctx.fillStyle = 'rgba(250, 204, 21, 0.1)';
            ctx.beginPath();
            ctx.moveTo(slitX, centerY - slitGap/2 - 30);
            ctx.lineTo(slitX + 100, centerY - 50);
            ctx.lineTo(slitX + 100, centerY + 50);
            ctx.fill();
        }

        // --- 3. Update & Draw Particles ---
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
            const p = particlesRef.current[i];
            
            p.x += p.vx;
            p.y += p.vy;

            // Collision with Barrier Logic
            if (p.phase === 'source' && p.x > slitX) {
                // Check if it hit the wall or went through a slit
                const inTopSlit = p.y > (centerY - slitGap/2 - 10) && p.y < (centerY - slitGap/2 + 10);
                const inBottomSlit = p.y > (centerY + slitGap/2 - 10) && p.y < (centerY + slitGap/2 + 10);

                if (!inTopSlit && !inBottomSlit) {
                    // Splat on wall
                    particlesRef.current.splice(i, 1);
                    continue;
                } else {
                    // Passed through!
                    p.phase = 'traveling';
                    
                    // QUANTUM MAGIC HERE
                    if (observerActive) {
                        // PARTICLE BEHAVIOR: They fly roughly straight like bullets
                        p.vy = (Math.random() - 0.5) * 1.5; 
                        p.color = '#f87171'; // Red particles when observed
                    } else {
                        // WAVE BEHAVIOR: Interference Pattern
                        // We cheat to simulate physics: We nudge the vertical velocity based on a probability distribution
                        // Simulating constructive/destructive interference zones
                        const wavelength = 40;
                        const distanceToScreen = screenX - slitX;
                        // Determine a target Y based on interference math
                        // y = (m * wavelength * D) / d
                        // We simulate this by biasing the random angle
                        const angle = (Math.random() - 0.5) * Math.PI;
                        // Intensity function: cos^2
                        const intensity = Math.cos((p.y - centerY) * 0.1) * Math.cos((p.y - centerY) * 0.1); 
                        
                        // Simply: Add a sine wave bias to the velocity
                        p.vy += Math.sin(frame * 0.1) * 0.5 + (Math.random() - 0.5);
                    }
                }
            }

            // Hit the Screen
            if (p.x > screenX) {
                const hitY = Math.floor(p.y);
                if (hitY >= 0 && hitY < hitsRef.current.length) {
                    hitsRef.current[hitY] = (hitsRef.current[hitY] || 0) + 1;
                }
                particlesRef.current.splice(i, 1);
                continue;
            }

            // Draw Particle
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, observerActive ? 3 : 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // --- 4. Draw Screen Intensity Graph (The Result) ---
        ctx.fillStyle = '#27272a';
        ctx.fillRect(screenX, 0, width - screenX, height); // Screen background

        ctx.strokeStyle = observerActive ? '#f87171' : '#4ade80';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let y = 0; y < height; y++) {
            const intensity = hitsRef.current[y] || 0;
            // Draw a line sticking out from the right wall to show intensity
            const barLength = Math.min(intensity * 2, 80);
            ctx.moveTo(screenX, y);
            ctx.lineTo(screenX + barLength, y);
        }
        ctx.stroke();

        // Draw Label on Screen
        ctx.fillStyle = 'white';
        ctx.font = '10px monospace';
        ctx.fillText(observerActive ? "PARTICLE PATTERN" : "INTERFERENCE PATTERN", screenX + 10, 20);

        frame++;
        requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// 4. Controls
const renderControls = ({ values, setValue, setValues }: any) => {
    // Helper to increment particle count artificially for the "simulation" logic
    // In a real app, the canvas would call a callback, but here we just approximate 
    // accumulation based on firing rate for the sake of the achievement tracker
    useEffect(() => {
        const interval = setInterval(() => {
             setValues((prev: SimState) => ({
                 ...prev,
                 particlesFired: prev.particlesFired + (prev.firingRate / 5)
             }));
        }, 100);
        return () => clearInterval(interval);
    }, [values.firingRate]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
            
            {/* Observer Switch - The Main Feature */}
            <div className="flex flex-col items-center justify-center space-y-3 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">The Observer</label>
                <button
                    onClick={() => {
                        setValue('observerActive', !values.observerActive);
                        // Reset hits on mode switch to make it clear
                        setValue('particlesFired', 0); // Optional: reset count or keep it
                    }}
                    className={`
                        relative px-6 py-3 rounded-full font-bold transition-all duration-300 flex items-center gap-3
                        ${values.observerActive 
                            ? 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.4)]' 
                            : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'}
                    `}
                >
                    {values.observerActive ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
                    {values.observerActive ? 'WATCHING' : 'NOT LOOKING'}
                </button>
                <p className="text-[10px] text-zinc-500 text-center">
                    {values.observerActive 
                        ? "Wave function collapsed! Particles act like particles." 
                        : "Quantum probability waves interacting."}
                </p>
            </div>

            {/* Slit Distance Slider */}
            <div className="space-y-3 group">
                <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400 transition-colors">Slit Separation</label>
                    <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
                        <span className="text-sm font-mono text-green-400 font-bold">{values.slitGap} <span className="text-zinc-500 text-xs">px</span></span>
                    </div>
                </div>
                <input 
                    type="range" min="50" max="200" step="10"
                    value={values.slitGap}
                    onChange={(e) => setValue('slitGap', parseFloat(e.target.value))}
                    className="glow-range"
                />
            </div>

            {/* Firing Rate Slider */}
            <div className="space-y-3 group">
                <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400 transition-colors">Beam Intensity</label>
                    <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
                        <span className="text-sm font-mono text-green-400 font-bold">{values.firingRate} <span className="text-zinc-500 text-xs">photons/ms</span></span>
                    </div>
                </div>
                <input 
                    type="range" min="1" max="40" step="1"
                    value={values.firingRate}
                    onChange={(e) => setValue('firingRate', parseFloat(e.target.value))}
                    className="glow-range"
                />
            </div>
        </div>
    );
}

export const SIMULATION_29 = {
    title: 'Double Slit Experiment',
    initialValues: { firingRate: 5, slitGap: 80, observerActive: false, particlesFired: 0 },
    achievements: achievements,
    renderSimulation: ({ values }: { values: SimState }) => (
        <PhysicsCanvas values={values} />
    ),
    renderControls: renderControls
};