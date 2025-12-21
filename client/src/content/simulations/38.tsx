import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine';
import { FaPlay, FaRocket, FaSlidersH } from 'react-icons/fa';

// --- 1. Interface & Physics Constants ---

interface QuantumState {
  packetWidth: number;     // Uncertainty
  momentum: number;        // Velocity
  barrierHeight: number;   // Potential V
  simulationKey: number;   // The "Trigger" to restart the simulation
}

// Grid settings
const N = 300; 

// --- 2. Achievements ---

const achievements: Achievement<QuantumState>[] = [
  {
    id: 'speed-demon',
    title: 'Warp Speed',
    description: 'Launch with momentum > 4.5. Watch the rainbow blur!',
    condition: (s) => s.momentum > 4.5
  },
  {
    id: 'gandalf',
    title: 'You Shall Not Pass',
    description: 'Max out the barrier (100). The wave hits a brick wall.',
    condition: (s) => s.barrierHeight >= 95
  },
  {
    id: 'quantum-tunneling',
    title: 'Ghost Mode',
    description: 'High barrier (> 60), Low speed (< 2.0). Watch it teleport through the wall.',
    condition: (s) => s.barrierHeight > 60 && s.momentum < 2.0 && s.momentum > 0.5
  },
  {
    id: 'uncertainty-principle',
    title: 'Heisenberg\'s Nightmare',
    description: 'Ultra narrow width (< 6). It spreads out instantly!',
    condition: (s) => s.packetWidth < 6
  },
  {
    id: 'flat-earther',
    title: 'The Infinite Void',
    description: 'Remove the barrier entirely (0).',
    condition: (s) => s.barrierHeight === 0
  }
];

// --- 3. The Visualizer ---

const QuantumCanvas = ({ values }: { values: QuantumState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Physics State (Refs for performance)
  const reRef = useRef<Float32Array>(new Float32Array(N)); 
  const imRef = useRef<Float32Array>(new Float32Array(N)); 
  const vRef = useRef<Float32Array>(new Float32Array(N));
  const timeStepRef = useRef<number>(0);
  
  // Ref for current values
  const valuesRef = useRef(values);

  // Initialize System
  const resetSimulation = () => {
    const { packetWidth, momentum, barrierHeight } = valuesRef.current;
    
    // 1. Setup Potential Barrier
    const V = vRef.current;
    V.fill(0);
    const wallStart = Math.floor(N * 0.55);
    const wallEnd = Math.floor(N * 0.60);
    
    for (let i = wallStart; i < wallEnd; i++) {
      V[i] = barrierHeight * 0.08; 
    }

    // 2. Setup Wave Packet (Gaussian)
    const Re = reRef.current;
    const Im = imRef.current;
    const x0 = N * 0.2; // Start on the left
    
    for (let i = 0; i < N; i++) {
      const dx = i - x0;
      const envelope = Math.exp(-(dx * dx) / (2 * packetWidth * packetWidth));
      
      // e^(ikx)
      Re[i] = envelope * Math.cos(momentum * 0.3 * i); 
      Im[i] = envelope * Math.sin(momentum * 0.3 * i);
    }
    timeStepRef.current = 0;
  };

  // Keep values ref updated
  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  // RESET ONLY ON KEY CHANGE
  useEffect(() => {
    resetSimulation();
  }, [values.simulationKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = 0, height = 0;

    const animate = () => {
      // Resize Handling
      const parent = canvas.parentElement;
      if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
        width = parent.clientWidth;
        height = parent.clientHeight;
        canvas.width = width;
        canvas.height = height;
      }

      // --- PHYSICS ENGINE ---
      const Re = reRef.current;
      const Im = imRef.current;
      const V = vRef.current;
      
      // SLOW MOTION SETTINGS:
      const subSteps = 2; 
      const dt = 0.2;     

      for (let s = 0; s < subSteps; s++) {
        const newRe = new Float32Array(N);
        const newIm = new Float32Array(N);

        for (let i = 1; i < N - 1; i++) {
            const lapRe = Re[i+1] - 2*Re[i] + Re[i-1];
            const lapIm = Im[i+1] - 2*Im[i] + Im[i-1];

            const H_Re = -0.5 * lapRe + V[i] * Re[i];
            const H_Im = -0.5 * lapIm + V[i] * Im[i];

            newRe[i] = Re[i] - H_Im * dt;
            newIm[i] = Im[i] + H_Re * dt;
        }
        
        // Damping at edges
        for(let i=0; i<N; i++) {
            if (i < 5 || i > N-5) { newRe[i] *= 0.8; newIm[i] *= 0.8; }
            Re[i] = newRe[i];
            Im[i] = newIm[i];
        }
      }
      timeStepRef.current += 1;

      // --- RENDERING ---
      ctx.fillStyle = '#020205'; 
      ctx.fillRect(0, 0, width, height);
      
      // --- POSITIONING TWEAKS ---
      // Moved baseline to 90% down the screen (Much lower now)
      const centerY = height * 0.9; 
      const scaleY = height / 4; 

      // Draw Grid
      ctx.strokeStyle = '#18181b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for(let x=0; x<width; x+=40) { ctx.moveTo(x,0); ctx.lineTo(x,height); }
      for(let y=0; y<height; y+=40) { ctx.moveTo(0,y); ctx.lineTo(width,y); }
      ctx.stroke();

      // Draw Barrier 
      const barrierEffectiveHeight = valuesRef.current.barrierHeight;
      if (barrierEffectiveHeight > 1) {
        const wallStartIdx = Math.floor(N * 0.55);
        const wallEndIdx = Math.floor(N * 0.60);
        const barX = (wallStartIdx / N) * width;
        const barW = ((wallEndIdx - wallStartIdx) / N) * width;
        
        // Limit visual height based on the new larger headroom
        const visHeight = (barrierEffectiveHeight / 100) * (height * 0.7); 
        
        // Gradient
        const grad = ctx.createLinearGradient(0, centerY - visHeight, 0, centerY);
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
        grad.addColorStop(1, 'rgba(239, 68, 68, 0.1)');

        ctx.fillStyle = grad;
        // Draw from centerY UPWARDS
        ctx.fillRect(barX, centerY - visHeight, barW, visHeight);
        
        // Scanlines
        ctx.fillStyle = 'rgba(255, 100, 100, 0.4)';
        if (Math.floor(timeStepRef.current / 5) % 2 === 0) {
             ctx.fillRect(barX, centerY - visHeight, barW, 2);
        }
        
        ctx.strokeStyle = '#ef4444';
        ctx.strokeRect(barX, centerY - visHeight, barW, visHeight);
      }

      // Draw Wavefunction
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 15;
      
      const points: {x: number, y: number, hue: number, mag: number}[] = [];

      for (let i = 0; i < N; i++) {
        const x = (i / N) * width;
        const magSquared = (Re[i]*Re[i] + Im[i]*Im[i]);
        
        // Amplitude Logic: 
        // Baseline is at 0.9, giving us huge space above. 
        // Adjusted multiplier to 140 to make waves look tall and nice.
        const y = centerY - (magSquared * scaleY * 140); 
        
        let hue = 0;
        if (magSquared > 0.00001) {
             const phase = Math.atan2(Im[i], Re[i]);
             hue = ((phase + Math.PI) / (2 * Math.PI)) * 360;
        }
        points.push({x, y, hue, mag: magSquared});
      }

      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i+1];
        if (p1.mag > 0.0001) {
            ctx.beginPath();
            ctx.strokeStyle = `hsla(${p1.hue}, 100%, 60%, 1)`;
            ctx.shadowColor = `hsla(${p1.hue}, 100%, 50%, 1)`;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
      }

      // Baseline Floor Line
      ctx.strokeStyle = '#52525b';
      ctx.shadowBlur = 0;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return (
    <div className="w-full h-full relative group bg-black rounded-xl overflow-hidden">
      <canvas ref={canvasRef} className="block w-full h-full" />
      
      {/* HUD Overlay */}
      <div className="absolute top-4 right-4 pointer-events-none flex flex-col items-end gap-1">
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-500 font-mono font-bold tracking-widest">LIVE SOLVER</span>
        </div>
        <div className="text-[10px] text-zinc-600 font-mono">TIMESCALE: 0.2x (SLOW MOTION)</div>
      </div>
    </div>
  );
};

// --- 4. Controls Component ---

const renderControls = ({ values, setValue }: { 
    values: QuantumState, 
    setValue: (k: keyof QuantumState, v: any) => void 
}) => (
  <div className="flex flex-col gap-6 max-w-6xl mx-auto p-2">
    
    {/* HEADER ROW */}
    <div className="flex flex-row justify-between items-start border-b border-zinc-800 pb-6">
        <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FaSlidersH className="text-zinc-500"/> Configuration
            </h3>
            <p className="text-sm text-zinc-500 mt-1">Adjust parameters and fire the simulation.</p>
        </div>

        {/* FIRE BUTTON */}
        <button 
            onClick={() => setValue('simulationKey', values.simulationKey + 1)}
            className="relative group px-6 py-3 bg-zinc-900 rounded-lg border border-green-900/50 overflow-hidden transition-all hover:scale-105 active:scale-95 hover:border-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 to-emerald-900/20 group-hover:opacity-100 opacity-0 transition-opacity" />
            <div className="flex items-center gap-3 relative z-10">
                <FaRocket className="text-green-500 group-hover:animate-bounce" />
                <div className="text-left">
                    <div className="text-[10px] text-green-600 font-bold tracking-widest uppercase">Apply Changes</div>
                    <div className="text-sm font-black text-white tracking-wide">FIRE CANNON</div>
                </div>
                <FaPlay className="text-green-500 text-xs ml-2" />
            </div>
        </button>
    </div>

    {/* SLIDERS ROW */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Momentum Control */}
        <div className="space-y-4 group">
            <div className="flex justify-between items-end">
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest group-hover:text-cyan-400 transition-colors">
                Momentum (Speed)
                </label>
                <div className="bg-zinc-900 px-3 py-1 rounded-md border border-zinc-800 group-hover:border-cyan-500/50 transition-colors">
                <span className="text-lg font-mono text-cyan-400 font-bold drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                    {values.momentum.toFixed(1)} <span className="text-zinc-600 text-xs">au</span>
                </span>
                </div>
            </div>
            <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-cyan-500/30 w-full" />
            </div>
            <input
                type="range" min="0.5" max="5.0" step="0.1"
                value={values.momentum}
                onChange={(e) => setValue('momentum', parseFloat(e.target.value))}
                className="w-full h-2 bg-transparent appearance-none cursor-pointer accent-cyan-400 -mt-4 relative z-10"
            />
            <p className="text-[10px] text-zinc-500 leading-relaxed">
                Wavelength control. <span className="text-cyan-600">Faster = More Rainbow Cycles.</span>
            </p>
        </div>

        {/* Width Control */}
        <div className="space-y-4 group">
            <div className="flex justify-between items-end">
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest group-hover:text-purple-400 transition-colors">
                Uncertainty (Width)
                </label>
                <div className="bg-zinc-900 px-3 py-1 rounded-md border border-zinc-800 group-hover:border-purple-500/50 transition-colors">
                <span className="text-lg font-mono text-purple-400 font-bold drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]">
                    {values.packetWidth.toFixed(0)} <span className="text-zinc-600 text-xs">px</span>
                </span>
                </div>
            </div>
            <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-purple-500/30 w-full" />
            </div>
            <input
                type="range" min="5" max="30" step="1"
                value={values.packetWidth}
                onChange={(e) => setValue('packetWidth', parseFloat(e.target.value))}
                className="w-full h-2 bg-transparent appearance-none cursor-pointer accent-purple-400 -mt-4 relative z-10"
            />
            <p className="text-[10px] text-zinc-500 leading-relaxed">
                Smaller width = Faster spread.
            </p>
        </div>

        {/* Barrier Control */}
        <div className="space-y-4 group">
            <div className="flex justify-between items-end">
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest group-hover:text-red-500 transition-colors">
                Barrier Power
                </label>
                <div className="bg-zinc-900 px-3 py-1 rounded-md border border-zinc-800 group-hover:border-red-500/50 transition-colors">
                <span className="text-lg font-mono text-red-500 font-bold drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                    {values.barrierHeight.toFixed(0)} <span className="text-zinc-600 text-xs">eV</span>
                </span>
                </div>
            </div>
            <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-red-500/30 w-full" />
            </div>
            <input
                type="range" min="0" max="100" step="5"
                value={values.barrierHeight}
                onChange={(e) => setValue('barrierHeight', parseFloat(e.target.value))}
                className="w-full h-2 bg-transparent appearance-none cursor-pointer accent-red-500 -mt-4 relative z-10"
            />
            <p className="text-[10px] text-zinc-500 leading-relaxed">
                The wall height. Set to mid-range to see <span className="text-red-600 font-bold">Tunneling.</span>
            </p>
        </div>

    </div>
  </div>
);

// --- 5. Final Export ---

export const SIMULATION_38 = {
  title: "Schrödinger's Rave",
  initialValues: { packetWidth: 15, momentum: 2.5, barrierHeight: 50, simulationKey: 0 },
  achievements: achievements,
  renderSimulation: ({ values }: { values: QuantumState }) => <QuantumCanvas values={values} />,
  renderControls: renderControls
};