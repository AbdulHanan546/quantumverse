import React, { useEffect, useRef, useState } from 'react';
import { type Achievement } from '../../components/SimulationEngine';

// --- 1. Interface ---
interface PhaseState {
  omega: number;     // Angular Frequency (speed of rotation)
  phi: number;       // Phase Constant (starting angle)
  amplitude: number; // Size of the circle/motion
  isRunning: boolean;
}

// --- 2. Achievements ---
const achievements: Achievement<PhaseState>[] = [
  {
    id: 'turtle-mode',
    title: 'Turtle Mode',
    description: 'Set the angular frequency (ω) to less than 0.5 rad/s. Snooze fest.',
    condition: (s) => s.omega < 0.5 && s.omega > 0
  },
  {
    id: 'hyperspace',
    title: 'Hyperspace',
    description: 'Crank the frequency (ω) above 8.0. dizzy yet?',
    condition: (s) => s.omega > 8.0
  },
  {
    id: 'anti-phase',
    title: 'The Upside Down',
    description: 'Set the Phase (φ) to roughly 3.14 (π). You are now starting at the end.',
    condition: (s) => Math.abs(s.phi - Math.PI) < 0.2
  },
  {
    id: 'tiny-universe',
    title: 'Tiny Universe',
    description: 'Minimum Amplitude. Is this thing even on?',
    condition: (s) => s.amplitude <= 20
  },
  {
    id: 'maximum-chaos',
    title: 'Maximum Chaos',
    description: 'Max Amplitude AND Max Frequency. The simulation might explode (not really).',
    condition: (s) => s.amplitude >= 140 && s.omega >= 9.5
  },
  {
    id: 'frozen-time',
    title: 'ZA WARUDO',
    description: 'Pause the simulation using the toggle. Time has stopped.',
    condition: (s) => !s.isRunning
  }
];

// --- 3. Canvas Component ---
const PhaseSpaceCanvas = ({ values }: { values: PhaseState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const timeRef = useRef<number>(0);
  
  // We need to track the trail for the Phase Space loop
  const trailRef = useRef<{x: number, v: number}[]>([]);
  const valuesRef = useRef(values);

  // Sync latest values to ref for animation loop
  useEffect(() => { 
    valuesRef.current = values; 
  }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0, height = 0;

    const animate = () => {
      // Handle resizing
      const parent = canvas.parentElement;
      if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
        width = parent.clientWidth;
        height = parent.clientHeight;
        canvas.width = width;
        canvas.height = height;
      }

      const { omega, phi, amplitude, isRunning } = valuesRef.current;

      // Only advance time if running
      if (isRunning) {
        timeRef.current += 0.016; // approx 60fps
      }

      // Physics Math
      // x(t) = A * cos(wt + phi)
      // v(t) = -A * w * sin(wt + phi)
      const angle = (omega * timeRef.current) + phi;
      const x = amplitude * Math.cos(angle);
      const v = -amplitude * omega * Math.sin(angle);

      // --- Drawing ---
      
      // Clear Background
      ctx.fillStyle = '#09090b'; // Zinc-950
      ctx.fillRect(0, 0, width, height);

      // Split screen: Left (Physical View), Right (Phase Space)
      const splitX = width / 2;

      // --- LEFT SIDE: The Rotating Phasor (The "Why" of Angular Freq) ---
      const centerY = height / 2;
      const leftCenterX = splitX / 2;

      // Draw Axes for Left Side
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(leftCenterX, 50); ctx.lineTo(leftCenterX, height - 50); // Vertical
      ctx.moveTo(50, centerY); ctx.lineTo(splitX - 50, centerY); // Horizontal
      ctx.stroke();

      // Draw the Reference Circle
      ctx.strokeStyle = '#3f3f46';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(leftCenterX, centerY, amplitude, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw the Rotating Arm (Phasor)
      const dotX = leftCenterX + x; // x is already calculated with cos
      const dotY = centerY - (amplitude * Math.sin(angle)); // visualizing the circular motion

      ctx.strokeStyle = '#a1a1aa';
      ctx.beginPath();
      ctx.moveTo(leftCenterX, centerY);
      ctx.lineTo(dotX, dotY);
      ctx.stroke();

      // Draw the "Real" mass (Projection onto X-axis)
      ctx.fillStyle = '#22c55e'; // Green
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(dotX, centerY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw connecting dashed line from Rotator to Mass
      ctx.strokeStyle = '#22c55e';
      ctx.globalAlpha = 0.3;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(dotX, dotY);
      ctx.lineTo(dotX, centerY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1.0;

      // Labels Left
      ctx.fillStyle = '#71717a';
      ctx.font = '10px monospace';
      ctx.fillText("REFERENCE CIRCLE", leftCenterX - 40, centerY + amplitude + 20);
      ctx.fillText("ACTUAL MOTION", leftCenterX - 35, centerY + 20);

      // --- RIGHT SIDE: Phase Space (The Abstract View) ---
      const rightCenterX = splitX + (splitX / 2);
      
      // Update Trail
      if (isRunning) {
        trailRef.current.push({ x, v });
        if (trailRef.current.length > 200) trailRef.current.shift();
      } else {
         // If paused, we keep the trail but don't add to it
      }

      // Draw Axes for Phase Space
      ctx.strokeStyle = '#27272a';
      ctx.beginPath();
      ctx.moveTo(rightCenterX, 50); ctx.lineTo(rightCenterX, height - 50); // V-axis
      ctx.moveTo(splitX + 50, centerY); ctx.lineTo(width - 50, centerY); // X-axis
      ctx.stroke();

      // Draw Labels
      ctx.fillStyle = '#3b82f6'; // Blue for Velocity
      ctx.fillText("VELOCITY (v)", rightCenterX + 10, 60);
      ctx.fillStyle = '#22c55e'; // Green for Position
      ctx.fillText("POSITION (x)", width - 80, centerY - 10);

      // Draw Trail
      ctx.beginPath();
      ctx.strokeStyle = '#3b82f6'; // Blue trail
      ctx.lineWidth = 2;
      if (trailRef.current.length > 1) {
        // Need to scale V to fit screen cleanly. 
        // V max is A*w. If w is high, V is huge. Let's scale V visually by dividing by max possible omega (10) roughly
        const vScale = 0.15; 
        
        trailRef.current.forEach((p, i) => {
          const drawX = rightCenterX + p.x; 
          const drawY = centerY - (p.v * vScale); // Invert Y because canvas Y is down

          if (i === 0) ctx.moveTo(drawX, drawY);
          else ctx.lineTo(drawX, drawY);
        });
        ctx.stroke();

        // Draw current head of trail
        const last = trailRef.current[trailRef.current.length - 1];
        const headX = rightCenterX + last.x;
        const headY = centerY - (last.v * vScale);
        
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(headX, headY, 4, 0, Math.PI*2);
        ctx.fill();
      }
      
      // Divider Line
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(splitX, 0); ctx.lineTo(splitX, height);
      ctx.stroke();

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full cursor-crosshair" />;
};

// --- 4. Controls Component ---
const renderPhaseControls = ({ values, setValue }: { 
  values: PhaseState; 
  setValue: (k: keyof PhaseState, v: any) => void;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto items-start">
    
    {/* Angular Frequency Slider */}
    <div className="space-y-2 group">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest group-hover:text-blue-400 transition-colors">
          Angular Freq (ω)
        </label>
        <span className="text-xs font-mono text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">
          {values.omega.toFixed(1)} rad/s
        </span>
      </div>
      <input 
        type="range" min="0.1" max="10" step="0.1"
        value={values.omega}
        onChange={(e) => setValue('omega', parseFloat(e.target.value))}
        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
      />
      <p className="text-[10px] text-zinc-600">
        How fast the reference circle spins. Faster spin = Faster wobble.
      </p>
    </div>

    {/* Phase Slider */}
    <div className="space-y-2 group">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest group-hover:text-purple-400 transition-colors">
          Phase Constant (φ)
        </label>
        <span className="text-xs font-mono text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded">
          {values.phi.toFixed(2)} rad
        </span>
      </div>
      <input 
        type="range" min="0" max={Math.PI * 2} step="0.01"
        value={values.phi}
        onChange={(e) => setValue('phi', parseFloat(e.target.value))}
        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400"
      />
      <p className="text-[10px] text-zinc-600">
        The "Head Start." 0 starts at max. 3.14 starts at opposite max.
      </p>
    </div>

    {/* Amplitude Slider */}
    <div className="space-y-2 group">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400 transition-colors">
          Amplitude (A)
        </label>
        <span className="text-xs font-mono text-green-400 bg-green-400/10 px-2 py-0.5 rounded">
          {values.amplitude.toFixed(0)} px
        </span>
      </div>
      <input 
        type="range" min="10" max="150" step="10"
        value={values.amplitude}
        onChange={(e) => setValue('amplitude', parseFloat(e.target.value))}
        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-400"
      />
      <p className="text-[10px] text-zinc-600">
        The radius of the circle, or how far the object stretches.
      </p>
    </div>

    {/* Play/Pause Button */}
    <div className="flex flex-col justify-end h-full pb-1">
      <button
        onClick={() => setValue('isRunning', !values.isRunning)}
        className={`
          w-full py-2 px-4 rounded font-bold uppercase tracking-wider text-xs transition-all
          ${values.isRunning 
            ? 'bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500/20' 
            : 'bg-green-500/10 text-green-400 border border-green-500/50 hover:bg-green-500/20'}
        `}
      >
        {values.isRunning ? 'Stop Time' : 'Resume Time'}
      </button>
      <p className="text-[10px] text-zinc-600 mt-2 text-center">
        See the shape freeze in Phase Space!
      </p>
    </div>

  </div>
);

// --- 5. Export ---
export const SIMULATION_2 = {
  title: 'Phase Space & Angular Freq',
  initialValues: { 
    omega: 2.0, 
    phi: 0, 
    amplitude: 80, 
    isRunning: true 
  },
  achievements: achievements,
  renderSimulation: ({ values }: { values: PhaseState }) => (
    <PhaseSpaceCanvas values={values} />
  ),
  renderControls: renderPhaseControls
};