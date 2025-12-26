import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine';
import { FaAtom, FaRunning, FaWater, FaExpandArrowsAlt } from 'react-icons/fa';

// --- 1. Interface ---
interface PacketState {
  groupVel: number;   // Speed of the Envelope (The "Lump")
  phaseVel: number;   // Speed of the Ripples (The "Wiggles")
  width: number;      // Width of the packet (Sigma)
  k: number;          // Wavenumber (Density of ripples)
  dispersion: boolean;// Does it spread out over time?
}

// --- 2. Achievements ---
const achievements: Achievement<PacketState>[] = [
  {
    id: 'light-speed',
    title: 'Vacuum of Space',
    description: 'Match Phase Velocity and Group Velocity perfectly. The shape stays frozen relative to the ripples.',
    condition: (s) => Math.abs(s.groupVel - s.phaseVel) < 0.1 && s.groupVel > 1.0
  },
  {
    id: 'moon-walk',
    title: 'The Moonwalk',
    description: 'Make the packet move forward (Group > 0) but the ripples move backward (Phase < 0).',
    condition: (s) => s.groupVel > 0.5 && s.phaseVel < -0.5
  },
  {
    id: 'heisenberg',
    title: 'Heisenberg Uncertainty',
    description: 'Make the packet extremely narrow (Width < 20). Position is known, momentum is unknown!',
    condition: (s) => s.width < 20
  },
  {
    id: 'ghost-particle',
    title: 'Stationary Envelope',
    description: 'Set Group Velocity to 0. The ripples flow through a ghost-like stationary shape.',
    condition: (s) => s.groupVel === 0 && Math.abs(s.phaseVel) > 1.0
  }
];

// --- 3. Canvas Component ---
const PacketCanvas = ({ values }: { values: PacketState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Ref Pattern
  const valuesRef = useRef(values);
  useEffect(() => { valuesRef.current = values; }, [values]);

  const timeRef = useRef(0);
  const spreadTimeRef = useRef(0); // Separate time for dispersion scaling

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

      const { groupVel, phaseVel, width: baseWidth, k, dispersion } = valuesRef.current;
      
      // Update Time
      timeRef.current += 0.05;
      if (dispersion) {
        spreadTimeRef.current += 0.01;
      } else {
        spreadTimeRef.current = 0; // Reset spread if toggled off
      }
      
      const t = timeRef.current;

      // --- CALCULATIONS ---
      
      // Calculate Dispersion Spread Factor
      // Width(t) = w0 * sqrt(1 + t^2) roughly for Gaussian
      const currentWidth = baseWidth * (1 + (spreadTimeRef.current * 2));
      
      // Calculate Packet Position (Group Velocity)
      // We loop it around the screen
      let packetCenter = (width * 0.1) + (groupVel * t * 20); 
      packetCenter = packetCenter % (width + 400); // Allow it to go off screen slightly then wrap
      if (packetCenter > width + 200) {
         // Soft reset logic could go here, but modulo works for position.
         // For smooth looping of the *phase*, we need to be careful, but for visual sim:
         // We'll map the packetCenter back to -200 if it exceeds width.
         timeRef.current -= (width + 400) / (groupVel * 20);
      }
      
      // Adjust packetCenter based on the modulo'd time
      packetCenter = (width * 0.2) + (groupVel * timeRef.current * 20);
      // Let's do a hard modulo on position for drawing
      const drawCenter = packetCenter % (width + 400) - 200;


      // --- RENDER ---
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);
      
      const centerY = height / 2;
      const amplitude = 100;

      // Draw Grid
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY); ctx.lineTo(width, centerY);
      ctx.stroke();

      // --- DRAW THE ENVELOPE (The Group) ---
      // This is the "Container"
      ctx.strokeStyle = '#facc15'; // Yellow
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      for (let x = 0; x < width; x+=4) {
        // Gaussian: e ^ -((x-center)^2 / 2w^2)
        const diff = x - drawCenter;
        const envY = amplitude * Math.exp(-(diff * diff) / (2 * currentWidth * currentWidth));
        
        if (x===0) ctx.moveTo(x, centerY - envY);
        else ctx.lineTo(x, centerY - envY);
      }
      // Also draw bottom envelope
      for (let x = width; x >= 0; x-=4) {
        const diff = x - drawCenter;
        const envY = amplitude * Math.exp(-(diff * diff) / (2 * currentWidth * currentWidth));
        ctx.lineTo(x, centerY + envY);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // --- DRAW THE WAVE (The Phase) ---
      // Psi = Envelope * cos(k(x - vp*t))
      ctx.strokeStyle = '#22d3ee'; // Cyan
      ctx.lineWidth = 3;
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      
      // Optimization: Only draw where envelope is visible
      const startDraw = Math.max(0, drawCenter - currentWidth * 3);
      const endDraw = Math.min(width, drawCenter + currentWidth * 3);

      for (let x = startDraw; x < endDraw; x+=2) {
        const diff = x - drawCenter;
        const env = amplitude * Math.exp(-(diff * diff) / (2 * currentWidth * currentWidth));
        
        // Phase calculation: k * (x - v_phase * t)
        // We need to use absolute world position 'x' implies x=0 is screen left.
        // To make it look right relative to packet start time, we use total time.
        const osc = Math.cos(k * (x - (phaseVel * t * 20))); 
        
        const y = centerY - (env * osc);
        if (x === startDraw) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;


      // --- TRACKERS (The Dots) ---
      
      // 1. Group Tracker (Green Dot on Center)
      if (drawCenter > 0 && drawCenter < width) {
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(drawCenter, centerY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '10px sans-serif';
        ctx.fillText("GROUP", drawCenter - 15, centerY + 20);
      }

      // 2. Phase Tracker (Red Dot on a specific peak)
      // We want to track a peak. A peak happens when argument of cos is 2*PI*n
      // k(x - vp*t) = 0 (for the central peak at t=0) -> x = vp*t
      // Let's track the peak that started at x=0
      let phaseX = (phaseVel * t * 20);
      // We want this dot to wrap or stay relevant. 
      // Let's calculate the peak strictly closest to the packet center to visualize the "Flow"
      // actually, tracking a SINGLE infinite peak is better to show speed.
      // Modulo phaseX to keep it somewhat on screen or just let it fly?
      // Let's just track the peak x = vp*t + C that is currently inside the window
      
      // Trick: Find peak closest to drawCenter
      // Peak condition: k(x - vt) = 2*PI*N
      // x = 2*PI*N/k + vt
      // We solve for N that puts x near drawCenter
      const vt = phaseVel * t * 20;
      const wavelength = (2 * Math.PI) / k;
      const N = Math.round((drawCenter - vt) / wavelength);
      const peakX = (N * wavelength) + vt;

      // Only draw if it's inside the visible envelope
      if (Math.abs(peakX - drawCenter) < currentWidth * 2 && peakX > 0 && peakX < width) {
        const diff = peakX - drawCenter;
        const env = amplitude * Math.exp(-(diff * diff) / (2 * currentWidth * currentWidth));
        
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(peakX, centerY - env, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.fillText("PHASE", peakX - 15, centerY - env - 10);
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// --- 4. Controls Component ---
const renderControls = ({ values, setValue }: { 
  values: PacketState; 
  setValue: (k: keyof PacketState, v: any) => void;
}) => (
  <div className="flex flex-col gap-6 max-w-6xl mx-auto">
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      
      {/* Velocity Controls */}
      <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 space-y-6">
        <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <FaRunning /> Velocities
        </h3>

        {/* Group Vel */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-green-400 font-bold">Group Velocity ($v_g$)</span>
            <span className="font-mono text-zinc-500">{values.groupVel.toFixed(1)}</span>
          </div>
          <input 
            type="range" min="-3" max="5" step="0.1"
            value={values.groupVel}
            onChange={(e) => setValue('groupVel', parseFloat(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-green-500"
          />
          <p className="text-[10px] text-zinc-600">Speed of the envelope (The "Lump"). Moves the Energy.</p>
        </div>

        {/* Phase Vel */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-red-400 font-bold">Phase Velocity ($v_p$)</span>
            <span className="font-mono text-zinc-500">{values.phaseVel.toFixed(1)}</span>
          </div>
          <input 
            type="range" min="-5" max="5" step="0.1"
            value={values.phaseVel}
            onChange={(e) => setValue('phaseVel', parseFloat(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
          <p className="text-[10px] text-zinc-600">Speed of the ripples. Moves the Wiggles.</p>
        </div>
      </div>

      {/* Shape Controls */}
      <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 space-y-6">
        <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <FaAtom /> Wave Properties
        </h3>

        {/* Width */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-yellow-400 font-bold">Spatial Width ($\Delta x$)</span>
            <span className="font-mono text-zinc-500">{values.width.toFixed(0)} px</span>
          </div>
          <input 
            type="range" min="10" max="150" step="5"
            value={values.width}
            onChange={(e) => setValue('width', parseFloat(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
          />
        </div>

        {/* Wavenumber */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-cyan-400 font-bold">Carrier Density (k)</span>
            <span className="font-mono text-zinc-500">{values.k.toFixed(2)}</span>
          </div>
          <input 
            type="range" min="0.05" max="0.5" step="0.01"
            value={values.k}
            onChange={(e) => setValue('k', parseFloat(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        {/* Dispersion Toggle */}
        <button
           onClick={() => setValue('dispersion', !values.dispersion)}
           className={`
             w-full py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all flex items-center justify-center gap-2
             ${values.dispersion 
               ? 'bg-purple-500/10 text-purple-400 border-purple-500/50' 
               : 'bg-zinc-800 text-zinc-500 border-zinc-700'}
           `}
        >
          <FaExpandArrowsAlt /> {values.dispersion ? 'Dispersion: ON' : 'Dispersion: OFF'}
        </button>

      </div>
    </div>
  </div>
);

// --- 5. Export ---
export const SIMULATION_11 = {
  title: 'Wave Packets: Group vs Phase',
  initialValues: { 
    groupVel: 2.0, 
    phaseVel: 4.0, 
    width: 60, 
    k: 0.2,
    dispersion: false
  },
  achievements: achievements,
  renderSimulation: ({ values }: { values: PacketState }) => (
    <PacketCanvas values={values} />
  ),
  renderControls: renderControls
};