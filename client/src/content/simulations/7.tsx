import React, { useEffect, useRef, useState } from 'react';
import { type Achievement } from '../../components/SimulationEngine';
import { FaGhost, FaWaveSquare, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';

// --- 1. Interface ---
interface SuperpositionState {
  wave1Amp: number;   // Amplitude of first wave (-100 to 100)
  wave2Amp: number;   // Amplitude of second wave (-100 to 100)
  phaseShift: number; // Phase shift of second wave (0 to 360 degrees)
  isRunning: boolean;
}

// --- 2. Achievements ---
const achievements: Achievement<SuperpositionState>[] = [
  {
    id: 'ghost-mode',
    title: 'Ghost Mode (Destructive)',
    description: 'Make the waves cancel each other out perfectly. Total silence.',
    condition: (s) => Math.abs(s.wave1Amp + s.wave2Amp * Math.cos(s.phaseShift * Math.PI / 180)) < 5 && Math.abs(s.wave1Amp) > 20
  },
  {
    id: 'mega-wave',
    title: 'Mega Wave (Constructive)',
    description: 'Combine two large waves perfectly to create a monster wave (>180 amp).',
    condition: (s) => Math.abs(s.wave1Amp + s.wave2Amp) > 180 && s.phaseShift === 0
  },
  {
    id: 'opposite-day',
    title: 'Opposite Day',
    description: 'Have one wave fully positive and the other fully negative.',
    condition: (s) => s.wave1Amp === 100 && s.wave2Amp === -100
  },
  {
    id: 'phase-master',
    title: 'Phase Master',
    description: 'Set the phase shift exactly to 180 degrees.',
    condition: (s) => s.phaseShift === 180
  }
];

// --- 3. Physics Simulation ---
const SuperpositionCanvas = ({ values }: { values: SuperpositionState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const timeRef = useRef<number>(0);

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

      if (values.isRunning) {
        timeRef.current += 0.05;
      }

      const centerY = height / 2;
      const t = timeRef.current;

      ctx.fillStyle = '#09090b'; // Background
      ctx.fillRect(0, 0, width, height);

      // Draw Center Line
      ctx.strokeStyle = '#27272a';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Wave 1 (Red/Pink - Ghost)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(244, 114, 182, 0.4)'; // Pink-400 low opacity
      ctx.lineWidth = 3;
      for (let x = 0; x < width; x++) {
        const y = centerY + values.wave1Amp * Math.sin(x * 0.02 + t);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw Wave 2 (Blue - Ghost)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.4)'; // Blue-400 low opacity
      ctx.lineWidth = 3;
      const phaseRad = (values.phaseShift * Math.PI) / 180;
      for (let x = 0; x < width; x++) {
        // Wave 2 is shifted by phaseShift
        const y = centerY + values.wave2Amp * Math.sin(x * 0.02 + t + phaseRad);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw RESULT (Green - Solid)
      // This is the Principle of Superposition: y_total = y1 + y2
      ctx.beginPath();
      ctx.strokeStyle = '#4ade80'; // Green-400
      ctx.lineWidth = 5;
      ctx.shadowColor = 'rgba(74, 222, 128, 0.5)';
      ctx.shadowBlur = 15;
      
      let maxTotalAmp = 0;

      for (let x = 0; x < width; x++) {
        const y1 = values.wave1Amp * Math.sin(x * 0.02 + t);
        const y2 = values.wave2Amp * Math.sin(x * 0.02 + t + phaseRad);
        const yTotal = centerY + (y1 + y2); // Just adding them up!
        
        if (x === 0) ctx.moveTo(x, yTotal);
        else ctx.lineTo(x, yTotal);

        if (Math.abs(y1 + y2) > maxTotalAmp) maxTotalAmp = Math.abs(y1 + y2);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw Label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      let statusText = "Calculating...";
      
      if (maxTotalAmp < 5) statusText = "DESTRUCTIVE INTERFERENCE (Silence)";
      else if (maxTotalAmp > 150) statusText = "CONSTRUCTIVE INTERFERENCE (Loud!)";
      else statusText = "Mixed Signal";

      ctx.fillText(statusText, width / 2, height - 30);

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [values]);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// --- 4. Controls ---
const SuperpositionControls = ({ values, setValue }: { values: SuperpositionState, setValue: (k: keyof SuperpositionState, v: any) => void }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto items-center">
      
      {/* Wave 1 Controls */}
      <div className="space-y-6 p-6 bg-pink-500/5 rounded-2xl border border-pink-500/20">
        <h3 className="text-pink-400 font-bold uppercase tracking-widest flex items-center gap-2">
            <FaGhost /> Ghost Wave 1
        </h3>
        
        <div className="space-y-2 group">
            <div className="flex justify-between text-xs text-zinc-400 font-mono">
                <span>Amplitude</span>
                <span>{values.wave1Amp.toFixed(0)}</span>
            </div>
            <input 
                type="range" min="-100" max="100" step="1"
                value={values.wave1Amp}
                onChange={(e) => setValue('wave1Amp', parseFloat(e.target.value))}
                className="glow-range !accent-pink-500"
            />
        </div>
      </div>

      {/* Wave 2 Controls */}
      <div className="space-y-6 p-6 bg-blue-500/5 rounded-2xl border border-blue-500/20">
        <h3 className="text-blue-400 font-bold uppercase tracking-widest flex items-center gap-2">
            <FaGhost /> Ghost Wave 2
        </h3>
        
        <div className="space-y-2 group">
            <div className="flex justify-between text-xs text-zinc-400 font-mono">
                <span>Amplitude</span>
                <span>{values.wave2Amp.toFixed(0)}</span>
            </div>
            <input 
                type="range" min="-100" max="100" step="1"
                value={values.wave2Amp}
                onChange={(e) => setValue('wave2Amp', parseFloat(e.target.value))}
                className="glow-range !accent-blue-500"
            />
        </div>

        <div className="space-y-2 group">
            <div className="flex justify-between text-xs text-zinc-400 font-mono">
                <span>Phase Shift (Offset)</span>
                <span>{values.phaseShift}°</span>
            </div>
            <input 
                type="range" min="0" max="360" step="1"
                value={values.phaseShift}
                onChange={(e) => setValue('phaseShift', parseFloat(e.target.value))}
                className="glow-range !accent-blue-500"
            />
        </div>
      </div>

      {/* Global Controls */}
      <div className="md:col-span-2 flex justify-center pt-4 border-t border-zinc-800">
         <button
            onClick={() => setValue('isRunning', !values.isRunning)}
            className={`
                px-8 py-3 rounded-full font-bold uppercase tracking-widest transition-all
                ${values.isRunning 
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                    : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}
            `}
         >
            {values.isRunning ? 'Pause Time' : 'Resume Time'}
         </button>
      </div>

    </div>
  );
};

// --- 5. Export ---

export const SIMULATION_7 = {
  title: 'The Ghost Crossing (Superposition)',
  initialValues: { wave1Amp: 50, wave2Amp: 50, phaseShift: 0, isRunning: true },
  achievements: achievements,
  renderSimulation: ({ values }: { values: SuperpositionState }) => <SuperpositionCanvas values={values} />,
  renderControls: ({ values, setValue }: { values: SuperpositionState, setValue: (k: keyof SuperpositionState, v: any) => void }) => <SuperpositionControls values={values} setValue={setValue} />
};