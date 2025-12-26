import React, { useEffect, useRef } from 'react';
import { type Achievement } from "../../components/SimulationEngine";
import { FaHeadphones, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

// --- 1. Interface ---
interface InterferenceState {
  userPhase: number;   // Your control (0 to 360 degrees)
  noisePhase: number;  // The noise phase
  amplitude: number;   // Wave amplitude
  isPlaying: boolean;  // Should the noise phase drift automatically?
}

// --- 2. Achievements ---
const achievements: Achievement<InterferenceState>[] = [
  {
    id: 'perfect-silence',
    title: 'Active Noise Cancellation',
    description: 'Achieve perfect Destructive Interference (Result amplitude < 5%).',
    condition: (s) => {
      const diff = Math.abs(s.userPhase - s.noisePhase) % 360;
      return diff > 170 && diff < 190;
    }
  },
  {
    id: 'maximum-volume',
    title: 'Ear Damage',
    description: 'Accidentally double the noise (Constructive Interference).',
    condition: (s) => {
      const diff = Math.abs(s.userPhase - s.noisePhase) % 360;
      return diff < 10 || diff > 350;
    }
  },
  {
    id: 'drifting-target',
    title: 'Moving Target',
    description: 'Keep the noise drifting (Play Mode) while trying to cancel it.',
    condition: (s) => s.isPlaying
  }
];

// --- 3. Canvas Component ---
const InterferenceCanvas = ({ values }: { values: InterferenceState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const requestRef = useRef<number | null>(null); // ✅ FIXED

  const valuesRef = useRef(values);
  useEffect(() => { valuesRef.current = values; }, [values]);

  const timeRef = useRef(0);

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

      // Physics & time
      const { userPhase, noisePhase, amplitude, isPlaying } = valuesRef.current;
      timeRef.current += 0.05;

      const drift = isPlaying ? timeRef.current * 0.2 : 0;

      const radUser = (userPhase * Math.PI) / 180;
      const radNoise = (noisePhase * Math.PI) / 180 + drift;

      // --- RENDER ---
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      const laneHeight = height / 3;

      const freq = 0.05; // spatial frequency

      const drawWave = (offsetY: number, color: string, phaseShift: number, label: string) => {
        const midY = offsetY + laneHeight / 2;

        ctx.fillStyle = color;
        ctx.font = 'bold 10px monospace';
        ctx.fillText(label, 20, offsetY + 20);

        ctx.strokeStyle = '#27272a';
        ctx.beginPath();
        ctx.moveTo(0, midY); ctx.lineTo(width, midY);
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;

        for (let x = 0; x < width; x += 5) {
          const y = midY + amplitude * Math.sin(freq * x - timeRef.current + phaseShift);
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      };

      drawWave(0, '#ef4444', radNoise, "INCOMING NOISE (SOURCE)");
      drawWave(laneHeight, '#3b82f6', radUser, "ANTI-NOISE (YOU)");

      // Result wave
      const midRes = laneHeight * 2 + laneHeight / 2;
      ctx.fillStyle = '#a855f7';
      ctx.font = 'bold 10px monospace';
      ctx.fillText("RESULT (WHAT YOU HEAR)", 20, laneHeight * 2 + 20);

      ctx.strokeStyle = '#27272a';
      ctx.beginPath();
      ctx.moveTo(0, midRes); ctx.lineTo(width, midRes);
      ctx.stroke();

      ctx.beginPath();
      const delta = radUser - radNoise;
      const interferenceFactor = Math.abs(Math.cos(delta / 2));
      const resColor = interferenceFactor < 0.1 ? '#22c55e' : (interferenceFactor > 0.9 ? '#ef4444' : '#a855f7');

      ctx.strokeStyle = resColor;
      ctx.shadowColor = resColor;
      ctx.shadowBlur = interferenceFactor < 0.1 ? 20 : 0;
      ctx.lineWidth = 4;

      for (let x = 0; x < width; x += 5) {
        const valNoise = amplitude * Math.sin(freq * x - timeRef.current + radNoise);
        const valUser = amplitude * Math.sin(freq * x - timeRef.current + radUser);
        const y = midRes + valNoise + valUser;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      if (interferenceFactor < 0.1) {
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("NOISE CANCELLED", width / 2, midRes - 40);
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// --- 4. Controls ---
const renderInterferenceControls = ({ values, setValue }: any) => (
  <div className="flex flex-col gap-6 max-w-4xl mx-auto items-center">
    <div className="w-full max-w-lg bg-zinc-900 p-6 rounded-2xl border border-zinc-800 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 opacity-20"></div>
      <div className="flex justify-between items-end mb-4">
        <label className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
          <FaHeadphones /> Anti-Noise Phase Shift
        </label>
        <span className="text-2xl font-mono text-white font-bold">{values.userPhase.toFixed(0)}°</span>
      </div>
      <input 
        type="range" min="0" max="360" step="1"
        value={values.userPhase}
        onChange={(e) => setValue('userPhase', parseFloat(e.target.value))}
        className="w-full h-4 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
      />
      <div className="flex justify-between text-[10px] text-zinc-600 mt-2 font-mono uppercase">
        <span>0°</span>
        <span>180°</span>
        <span>360°</span>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
      <div className={`p-4 rounded-xl border text-center transition-all duration-300 ${
        Math.abs(Math.abs(values.userPhase - values.noisePhase) % 360 - 180) < 20
          ? 'bg-green-500/10 border-green-500/50 text-green-400' 
          : 'bg-zinc-800 border-zinc-700 text-zinc-500'
      }`}>
        <div className="text-2xl mb-1"><FaVolumeMute className="mx-auto"/></div>
        <div className="text-[10px] font-bold uppercase tracking-widest">Destructive</div>
        <div className="text-xs">Silence</div>
      </div>

      <div className={`p-4 rounded-xl border text-center transition-all duration-300 ${
        Math.abs(Math.abs(values.userPhase - values.noisePhase) % 360) < 20
          ? 'bg-red-500/10 border-red-500/50 text-red-400' 
          : 'bg-zinc-800 border-zinc-700 text-zinc-500'
      }`}>
        <div className="text-2xl mb-1"><FaVolumeUp className="mx-auto"/></div>
        <div className="text-[10px] font-bold uppercase tracking-widest">Constructive</div>
        <div className="text-xs">Loudness x2</div>
      </div>
    </div>
  </div>
);

// --- 5. Export ---
export const SIMULATION_8 = {
  title: 'Noise Cancellation (Interference)',
  initialValues: { 
    userPhase: 0, 
    noisePhase: 180, 
    amplitude: 40,
    isPlaying: false
  },
  achievements,
  renderSimulation: ({ values }: { values: InterferenceState }) => (
    <InterferenceCanvas values={values} />
  ),
  renderControls: renderInterferenceControls
};
