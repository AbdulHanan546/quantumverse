import React, { useEffect, useRef, useState } from 'react';
import { type Achievement } from "../../components/SimulationEngine";
import { FaBroadcastTower, FaSignal, FaQuestion, FaCheck, FaTimes } from 'react-icons/fa';

// --- 1. Interface ---
interface TransportState {
  distance: number;     // How far the signal travels (Attenuates signal)
  noiseLevel: number;   // Background static
  signalPower: number;  // Initial Amplitude
  mode: 'analog' | 'digital';
  isTransmitting: boolean;
}

// --- 2. Achievements ---
const achievements: Achievement<TransportState>[] = [
  {
    id: 'clear-signal',
    title: '5 Bars',
    description: 'Receive a signal with > 90% integrity over a long distance (> 300px).',
    condition: (s) => s.distance > 300 && s.signalPower > 80 && s.noiseLevel < 10
  },
  {
    id: 'static-noise',
    title: 'White Noise',
    description: 'Max out the noise. The signal is completely unrecognizable.',
    condition: (s) => s.noiseLevel >= 45
  },
  {
    id: 'digital-resilience',
    title: 'Error Correction',
    description: 'Use Digital Mode with moderate noise (20-30). Notice how the bits (Green/Red) can still be recovered perfectly unlike Analog.',
    condition: (s) => s.mode === 'digital' && s.noiseLevel >= 20 && s.noiseLevel <= 30
  },
  {
    id: 'fading-signal',
    title: 'Energy Loss',
    description: 'Set max distance and min power. The wave dies before reaching the end.',
    condition: (s) => s.distance >= 380 && s.signalPower <= 30
  }
];

// --- 3. Canvas Component ---
const TransportCanvas = ({ values }: { values: TransportState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const valuesRef = useRef(values);
  const requestRef = useRef<number>();
  // Simulation State
  const timeRef = useRef(0);
  const packetsRef = useRef<{x: number, data: number[]}[]>([]); // For digital bits

  useEffect(() => { valuesRef.current = values; }, [values]);

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

      const { distance, noiseLevel, signalPower, mode, isTransmitting } = valuesRef.current;
      
      if (isTransmitting) {
        timeRef.current += 0.05;
      } else {
        // Reset time if stopped, or just pause? Let's pause.
      }
      const t = timeRef.current;

      // --- RENDER ---
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);
      
      const centerY = height / 2;
      const startX = 50;
      const endX = startX + distance;

      // Draw Transmitter
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(startX - 20, centerY - 20, 20, 40);
      ctx.font = '10px sans-serif';
      ctx.fillText("TX", startX - 18, centerY + 5);

      // Draw Receiver
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(endX, centerY - 20, 20, 40);
      ctx.fillText("RX", endX + 5, centerY + 5);

      // Draw Cable / Path
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(startX, centerY);
      ctx.lineTo(endX, centerY);
      ctx.stroke();

      // --- PHYSICS SIMULATION ---
      
      // Calculate Energy Loss Factor (Attenuation)
      // Signal decays exponentially-ish or linearly for sim
      // A(x) = A0 * e^(-alpha * x)
      const alpha = 0.005; // attenuation coeff

      ctx.beginPath();
      ctx.lineWidth = 2;
      
      // We draw the wave physically traveling from Start to End
      // x goes from 0 to distance
      
      for (let x = 0; x <= distance; x+=2) {
         // Current world position
         const worldX = startX + x;
         
         // 1. Amplitude Decay
         const decay = Math.exp(-alpha * x);
         const localAmp = signalPower * decay;

         // 2. Generate Signal
         let signal = 0;
         
         // Wave travels Right, so phase is (kx - wt)
         // But we want the pattern to look like it's emerging from TX.
         // Signal at x, t is what was emitted at t - x/v
         const v = 2.0; // speed
         const emissionTime = t - (x / 20 / v); // scaled time
         
         if (emissionTime < 0) {
           // Signal hasn't reached here yet? 
           // For simpler visual, let's just animate the whole line
           signal = 0; 
         } else {
            if (mode === 'analog') {
               // Sine wave with some complexity
               signal = Math.sin(emissionTime * 2) + 0.5 * Math.sin(emissionTime * 3);
            } else {
               // Digital: Square wave (0s and 1s)
               // Simple clock: every 3 time units flip
               const bit = Math.floor(emissionTime) % 2;
               signal = bit === 0 ? -1 : 1; 
            }
         }

         // 3. Add Noise
         // Noise is random but needs to be consistent per frame for "static" feel
         // We use a simple hash of position+time for jitter
         const noise = (Math.random() - 0.5) * noiseLevel; // Simple flicker noise
         
         // Combined Signal
         const y = centerY - ((signal * localAmp) + noise);

         if (x === 0) ctx.moveTo(worldX, y);
         else ctx.lineTo(worldX, y);
      }
      
      // Color Logic
      // If signal is strong: Green/Cyan. If weak: Red.
      // We check the amplitude at the END of the cable.
      const endDecay = Math.exp(-alpha * distance);
      const endAmp = signalPower * endDecay;
      const isWeak = endAmp < noiseLevel * 1.5; // Signal-to-Noise Ratio bad?

      ctx.strokeStyle = isWeak ? '#ef4444' : (mode === 'analog' ? '#22d3ee' : '#22c55e');
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;


      // --- SIGNAL METRICS DISPLAY (Bottom) ---
      const statsY = height - 40;
      
      // Draw Input (Ideal)
      ctx.fillStyle = '#71717a';
      ctx.font = '10px monospace';
      ctx.fillText("INPUT SIGNAL", startX, statsY);
      // Mini graph
      ctx.strokeStyle = '#22d3ee';
      ctx.beginPath();
      for(let i=0; i<30; i++) {
        const val = mode === 'analog' ? Math.sin(t*2 - i*0.2) : ((Math.floor(t - i*0.1)%2)*2 -1);
        const y = statsY + 15 - (val * 5);
        if(i===0) ctx.moveTo(startX + i*2, y); else ctx.lineTo(startX + i*2, y);
      }
      ctx.stroke();

      // Draw Output (Real)
      ctx.fillStyle = '#71717a';
      ctx.fillText("RECEIVED SIGNAL", endX - 80, statsY);
      
      // Interpret the signal at receiver
      const rxSignal = endAmp; // Roughly
      const snr = endAmp / (noiseLevel + 0.1); // Signal to Noise Ratio
      
      ctx.fillStyle = snr > 2.0 ? '#22c55e' : '#ef4444';
      ctx.font = 'bold 12px sans-serif';
      const status = snr > 2.0 ? "INTACT" : "CORRUPTED";
      ctx.fillText(`STATUS: ${status}`, endX - 80, statsY + 30);
      
      // Draw SNR Bar
      ctx.fillStyle = '#3f3f46';
      ctx.fillRect(endX - 80, statsY + 12, 60, 4);
      const barW = Math.min(60, snr * 10);
      ctx.fillStyle = snr > 2.0 ? '#22c55e' : '#ef4444';
      ctx.fillRect(endX - 80, statsY + 12, barW, 4);


      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// --- 4. Controls Component ---
const renderControls = ({ values, setValue }: { 
  values: TransportState; 
  setValue: (k: keyof TransportState, v: any) => void;
}) => (
  <div className="flex flex-col gap-6 max-w-6xl mx-auto">
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
      
      {/* Distance Slider */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
             Distance (Energy Loss)
          </label>
          <span className="text-xs font-mono bg-blue-900/20 text-blue-300 px-2 py-1 rounded">
             {values.distance.toFixed(0)} km
          </span>
        </div>
        <input 
          type="range" min="50" max="400" step="10"
          value={values.distance}
          onChange={(e) => setValue('distance', parseFloat(e.target.value))}
          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>

      {/* Signal Power */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-green-400 uppercase tracking-widest flex items-center gap-2">
             TX Signal Power
          </label>
          <span className="text-xs font-mono bg-green-900/20 text-green-300 px-2 py-1 rounded">
             {values.signalPower.toFixed(0)} W
          </span>
        </div>
        <input 
          type="range" min="10" max="100" step="5"
          value={values.signalPower}
          onChange={(e) => setValue('signalPower', parseFloat(e.target.value))}
          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-green-500"
        />
      </div>

      {/* Noise Level */}
      <div className="space-y-4 md:col-span-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
             Background Interference (Noise)
          </label>
          <span className="text-xs font-mono bg-zinc-800 text-zinc-300 px-2 py-1 rounded">
             {values.noiseLevel.toFixed(0)} %
          </span>
        </div>
        <input 
          type="range" min="0" max="50" step="1"
          value={values.noiseLevel}
          onChange={(e) => setValue('noiseLevel', parseFloat(e.target.value))}
          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-500"
        />
      </div>

    </div>

    {/* Mode Toggle */}
    <div className="flex justify-center gap-6">
       <button
         onClick={() => setValue('mode', 'analog')}
         className={`
           px-6 py-3 rounded-lg font-bold uppercase text-xs tracking-widest transition-all w-32
           ${values.mode === 'analog' 
             ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500' 
             : 'bg-zinc-800 text-zinc-500 border border-zinc-700'}
         `}
       >
         Analog
       </button>
       
       <button
         onClick={() => setValue('mode', 'digital')}
         className={`
           px-6 py-3 rounded-lg font-bold uppercase text-xs tracking-widest transition-all w-32
           ${values.mode === 'digital' 
             ? 'bg-green-500/20 text-green-400 border border-green-500' 
             : 'bg-zinc-800 text-zinc-500 border border-zinc-700'}
         `}
       >
         Digital
       </button>
    </div>

    <div className="text-center text-[10px] text-zinc-600">
      {values.mode === 'analog' 
        ? 'Analog signals degrade gracefully but pick up noise easily.' 
        : 'Digital signals are robust against noise until they completely fail.'}
    </div>

  </div>
);

// --- 5. Export ---
export const SIMULATION_16 = {
  title: 'Information & Energy Transport',
  initialValues: { 
    distance: 200, 
    noiseLevel: 5, 
    signalPower: 60,
    mode: 'analog' as const,
    isTransmitting: true
  },
  achievements: achievements,
  renderSimulation: ({ values }: { values: TransportState }) => (
    <TransportCanvas values={values} />
  ),
  renderControls: renderControls
};