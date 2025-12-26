import React, { useEffect, useRef, useState } from 'react';
import { type Achievement } from '../../components/SimulationEngine';
import { FaCrosshairs, FaWind, FaMeteor } from 'react-icons/fa';

// 1. Interface
interface SimState {
  angle: number;         // Launch angle (degrees)
  velocity: number;      // Launch speed
  uncertainty: number;   // 0 = Laser Precision, 100 = "I closed my eyes"
  shotsFired: number;
  autoFire: boolean;     // Machine gun mode
}

// 2. Achievements
const achievements: Achievement<SimState>[] = [
  {
    id: 'sniper',
    title: 'The Newtonian Sniper',
    description: 'Hit the target with 0% Uncertainty. Boringly perfect.',
    condition: (s) => s.uncertainty === 0 && s.shotsFired > 5
  },
  {
    id: 'storm-trooper',
    title: 'Stormtrooper Aim',
    description: 'Max out the Uncertainty. You are not hitting anything.',
    condition: (s) => s.uncertainty >= 80
  },
  {
    id: 'monte-carlo',
    title: 'Monte Carlo Simulation',
    description: 'Fire over 200 shots to see the probability curve form.',
    condition: (s) => s.shotsFired >= 200
  },
  {
    id: 'max-power',
    title: 'To The Moon',
    description: 'Max velocity. Hope you have a big monitor.',
    condition: (s) => s.velocity >= 95
  }
];

// 3. Canvas Logic
const CannonCanvas = ({ values }: { values: SimState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Physics Storage
  const particlesRef = useRef<any[]>([]); // The balls
  const impactsRef = useRef<number[]>([]); // Where they landed (x-coordinates)
  const valuesRef = useRef(values);

  // Keep ref in sync
  useEffect(() => { valuesRef.current = values; }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0, height = 0;
    let frame = 0;

    const animate = () => {
        // --- Setup & Resize ---
        const parent = canvas.parentElement;
        if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
            width = parent.clientWidth;
            height = parent.clientHeight;
            canvas.width = width;
            canvas.height = height;
            // Clear impacts on resize to keep visuals accurate
            impactsRef.current = [];
        }

        const { angle, velocity, uncertainty, autoFire } = valuesRef.current;
        const radianAngle = (angle * Math.PI) / 180;
        const groundY = height - 50;
        const originX = 50;
        const originY = groundY - 20;

        // --- 1. Spawner (The Cannon) ---
        // If AutoFire is on, fire every few frames
        if (autoFire && frame % 5 === 0) {
            // MATH: Add randomness based on uncertainty
            // Uncertainty of 50 means +/- 25 degrees variance (huge)
            const angleNoise = (Math.random() - 0.5) * (uncertainty / 2); 
            const velocityNoise = (Math.random() - 0.5) * (uncertainty / 5);

            // Apply noise to launch vector
            const finalAngle = ((angle + angleNoise) * Math.PI) / 180;
            const finalVel = (velocity + velocityNoise) * 0.25; // Scale down for canvas pixels

            particlesRef.current.push({
                x: originX,
                y: originY,
                vx: Math.cos(finalAngle) * finalVel * 5,
                vy: -Math.sin(finalAngle) * finalVel * 5,
                life: 1.0,
                color: uncertainty === 0 ? '#ef4444' : '#4ade80' // Red if exact, Green if probabilistic
            });
        }

        // --- Clear Screen ---
        ctx.fillStyle = '#09090b'; // Very dark background
        ctx.fillRect(0, 0, width, height);

        // --- 2. Draw Environment ---
        
        // Ground
        ctx.strokeStyle = '#27272a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(width, groundY);
        ctx.stroke();

        // The Cannon
        ctx.save();
        ctx.translate(originX, originY);
        ctx.rotate(-radianAngle);
        ctx.fillStyle = '#52525b';
        ctx.fillRect(0, -10, 60, 20); // Barrel
        ctx.restore();
        
        // Cannon Base
        ctx.fillStyle = '#3f3f46';
        ctx.beginPath();
        ctx.arc(originX, originY, 20, 0, Math.PI*2);
        ctx.fill();

        // --- 3. Physics Loop ---
        const gravity = 0.4;

        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
            const p = particlesRef.current[i];
            
            // Move
            p.vy += gravity;
            p.x += p.vx;
            p.y += p.vy;

            // Draw Ball
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
            ctx.fillStyle = p.color;
            ctx.fill();

            // Collision with Ground
            if (p.y >= groundY) {
                // Register Impact
                impactsRef.current.push(p.x);
                // Remove particle
                particlesRef.current.splice(i, 1);
            }
            // Out of bounds
            else if (p.x > width || p.y > height + 50) {
                particlesRef.current.splice(i, 1);
            }
        }

        // --- 4. Visualization: The Probability Curve ---
        // This draws the history of where balls landed
        if (impactsRef.current.length > 0) {
            // Optimization: Only draw landing markers if < 500, else just draw the curve
            if (impactsRef.current.length < 500) {
                ctx.fillStyle = 'rgba(74, 222, 128, 0.5)';
                for (let x of impactsRef.current) {
                    ctx.fillRect(x, groundY, 2, 4);
                }
            }
        }

        // --- 5. The "Text" Feedback ---
        // We calculate the spread (Standard Deviation roughly)
        ctx.font = 'bold 80px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (uncertainty === 0) {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.1)'; // Red Watermark
            ctx.fillText("DETERMINISTIC", width/2, height/3);
            
            // Draw predicted path line for 0 uncertainty
            if (velocity > 0) {
                ctx.strokeStyle = '#ef4444';
                ctx.setLineDash([5, 5]);
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(originX, originY);
                // Simple Bezier approximation for visual guide
                // Calculate max height point
                const v0 = velocity * 0.25 * 5;
                const vy = v0 * Math.sin(radianAngle);
                const vx = v0 * Math.cos(radianAngle);
                const t_flight = (2 * vy) / gravity;
                const x_final = originX + vx * t_flight;
                const y_max = originY - (vy*vy)/(2*gravity);
                
                ctx.quadraticCurveTo(originX + (x_final-originX)/2, originY - (vy*vy)/(gravity) * 2, x_final, groundY); 
                // Note: Control point for quadratic curve to match parabola is tricky, 
                // simplistic line to landing spot is better for "prediction"
                ctx.stroke();
                ctx.setLineDash([]);
                
                // Target Marker X
                ctx.fillStyle = '#ef4444';
                ctx.fillText("×", x_final, groundY - 10);
                ctx.font = '12px monospace';
                ctx.fillText("PREDICTED LANDING", x_final, groundY - 40);
            }

        } else {

            
            // Draw Range bars
            if (impactsRef.current.length > 1) {
                const minX = Math.min(...impactsRef.current);
                const maxX = Math.max(...impactsRef.current);
                
                // Draw a box indicating the "Spread"
                ctx.fillStyle = 'rgba(74, 222, 128, 0.1)';
                ctx.fillRect(minX, groundY - 50, maxX - minX, 50);
                
                ctx.fillStyle = '#4ade80';
                ctx.font = '14px monospace';
                ctx.fillText(`SPREAD: ${Math.round(maxX - minX)}px`, (minX + maxX)/2, groundY - 60);
            }
        }

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
    
    // Auto-fire logic for "shotsFired" achievement tracking
    useEffect(() => {
        let interval: any;
        if (values.autoFire) {
            interval = setInterval(() => {
                setValues((prev: SimState) => ({
                    ...prev,
                    shotsFired: prev.shotsFired + 1
                }));
            }, 100); // 10 shots per second approx
        }
        return () => clearInterval(interval);
    }, [values.autoFire]);

    const clearShots = () => {
        setValues((prev: SimState) => ({ ...prev, shotsFired: 0 }));
        // Note: Canvas clears automatically on resize or we could add a toggle trigger
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto items-center">
            
            {/* Fire Button */}
            <div className="flex flex-col items-center justify-center p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
                <button
                    onClick={() => setValue('autoFire', !values.autoFire)}
                    className={`
                        w-full py-4 rounded-lg font-bold text-lg transition-all flex flex-col items-center gap-1
                        ${values.autoFire 
                            ? 'bg-red-500/20 text-red-400 border border-red-500 animate-pulse' 
                            : 'bg-green-500 hover:bg-green-400 text-black shadow-lg'}
                    `}
                >
                    <FaMeteor />
                    {values.autoFire ? 'STOP FIRING' : 'FIRE CANNON'}
                </button>
                <div className="mt-2 text-xs font-mono text-zinc-500">
                    SHOTS FIRED: {values.shotsFired}
                </div>
            </div>

            {/* Angle Slider */}
            <div className="space-y-2 group">
                <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Angle</label>
                    <span className="text-sm font-mono text-green-400 font-bold">{values.angle}°</span>
                </div>
                <input 
                    type="range" min="0" max="90" step="1"
                    value={values.angle}
                    onChange={(e) => setValue('angle', parseFloat(e.target.value))}
                    className="glow-range"
                />
            </div>

            {/* Velocity Slider */}
            <div className="space-y-2 group">
                <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Power</label>
                    <span className="text-sm font-mono text-green-400 font-bold">{values.velocity}%</span>
                </div>
                <input 
                    type="range" min="10" max="100" step="1"
                    value={values.velocity}
                    onChange={(e) => setValue('velocity', parseFloat(e.target.value))}
                    className="glow-range"
                />
            </div>

            {/* Uncertainty Slider (The Main Lesson) */}
            <div className="space-y-2 group border-l pl-6 border-zinc-700">
                <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                        <FaWind /> Uncertainty
                    </label>
                    <span className={`text-sm font-mono font-bold ${values.uncertainty === 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {values.uncertainty}%
                    </span>
                </div>
                <input 
                    type="range" min="0" max="100" step="1"
                    value={values.uncertainty}
                    onChange={(e) => {
                        setValue('uncertainty', parseFloat(e.target.value));
                        if (parseFloat(e.target.value) === 0) clearShots();
                    }}
                    className="glow-range accent-red-500"
                />
                <p className="text-[10px] text-zinc-500 h-4">
                    {values.uncertainty === 0 
                        ? "Newtonian Physics (Perfect Prediction)" 
                        : "Real World / Quantum Noise"}
                </p>
            </div>

        </div>
    );
}

export const SIMULATION_30 = {
    title: 'Kinematics: Order vs Chaos',
    initialValues: { angle: 45, velocity: 60, uncertainty: 20, shotsFired: 0, autoFire: false },
    achievements: achievements,
    renderSimulation: ({ values }: { values: SimState }) => (
        <CannonCanvas values={values} />
    ),
    renderControls: renderControls
};