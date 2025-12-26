import React, { useEffect, useRef } from 'react';
import { type Achievement } from "../../components/SimulationEngine";
import { FaExchangeAlt,FaRunning, FaLayerGroup, FaHistory, FaCompressArrowsAlt } from 'react-icons/fa';

// --- 1. Interface ---
interface ReflectionState {
  density1: number;   // Medium 1 (Left)
  density2: number;   // Medium 2 (Right)
  isFiring: boolean;  // Trigger logic
  slowMo: boolean;    // To see the split clearly
}

// --- 2. Achievements ---
const achievements: Achievement<ReflectionState>[] = [
  {
    id: 'perfect-match',
    title: 'The Ghost Door',
    description: 'Match densities perfectly. 100% Transmission, 0% Reflection. The wave doesn\'t even know the boundary exists.',
    condition: (s) => Math.abs(s.density1 - s.density2) < 0.1 && s.isFiring
  },
  {
    id: 'hard-boundary',
    title: 'The Brick Wall',
    description: 'Light string (1.0) hits Heavy string (10.0). Watch the reflection FLIP upside down (Phase Shift).',
    condition: (s) => s.density1 <= 1.5 && s.density2 >= 9.5 && s.isFiring
  },
  {
    id: 'soft-boundary',
    title: 'The Open Window',
    description: 'Heavy string (10.0) hits Light string (1.0). The reflection stays UPRIGHT.',
    condition: (s) => s.density1 >= 9.5 && s.density2 <= 1.5 && s.isFiring
  },
  {
    id: 'bullet-time',
    title: 'Matrix Mode',
    description: 'Fire a pulse in Slow Motion.',
    condition: (s) => s.slowMo && s.isFiring
  }
];

// --- 3. Canvas Component ---
const ReflectionCanvas = ({ values }: { values: ReflectionState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Ref Pattern
  const valuesRef = useRef(values);
  useEffect(() => { valuesRef.current = values; }, [values]);

  // Animation State
  // Instead of a continuous grid, we use analytical pulses for cleaner math visualization
  const pulsesRef = useRef<{
    type: 'incident' | 'reflected' | 'transmitted';
    x: number;     // position relative to boundary (0)
    amp: number;   // amplitude factor
    width: number; // visual width scaling
    vel: number;   // velocity
  }[]>([]);

  const timeRef = useRef(0);

  // Trigger Logic
  useEffect(() => {
    if (values.isFiring) {
      // Reset and spawn incident
      timeRef.current = 0;
      // Calculate Velocity based on Density (v ~ 1/sqrt(rho))
      const v1 = 4.0 / Math.sqrt(values.density1);
      
      pulsesRef.current = [{
        type: 'incident',
        x: -400, // Start far left
        amp: 1.0,
        width: 1.0, // Base width
        vel: v1
      }];
    }
  }, [values.isFiring]); // Only re-run when firing toggles

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

      const { density1, density2, slowMo } = valuesRef.current;
      const speedMult = slowMo ? 0.2 : 1.0;

      // PHYSICS CONSTANTS
      // Impedance Z = sqrt(density) roughly for strings
      const Z1 = Math.sqrt(density1);
      const Z2 = Math.sqrt(density2);
      
      // Coefficients
      // R = (Z1 - Z2) / (Z1 + Z2)
      // T = (2*Z1) / (Z1 + Z2)
      // Note: Formula depends on definition. For strings, R = (v2-v1)/(v2+v1) or (Z1-Z2)/(Z1+Z2).
      // Let's use the standard string form:
      // R_amp = (Z1 - Z2) / (Z1 + Z2)
      // T_amp = (2 * Z1) / (Z1 + Z2)
      const R_coeff = (Z1 - Z2) / (Z1 + Z2);
      const T_coeff = (2 * Z1) / (Z1 + Z2);

      // Velocities
      const v1 = 4.0 / Math.sqrt(density1);
      const v2 = 4.0 / Math.sqrt(density2);

      // --- UPDATE PULSES ---
      // We process the list
      const activePulses = [];
      let hasSplit = false;

      for (const p of pulsesRef.current) {
        p.x += p.vel * speedMult;
        
        // COLLISION LOGIC
        if (p.type === 'incident' && p.x >= 0 && !hasSplit) {
          // It hit the boundary (x=0)! Split it.
          // We effectively remove the incident and replace with R and T
          // But visually we want to see it cross. 
          // Simple visual hack: Once center crosses 0, we spawn R and T and hide incident?
          // Or smoothly blend? Let's spawn R and T exactly at 0.
          
          activePulses.push({
             type: 'reflected',
             x: 0,
             amp: p.amp * R_coeff,
             width: 1.0, // Reflected has same width as Incident (same medium)
             vel: -v1
          });

          activePulses.push({
             type: 'transmitted',
             x: 0,
             amp: p.amp * T_coeff,
             width: v2 / v1, // Width scales with velocity ratio!
             vel: v2
          });
          
          hasSplit = true; // Don't keep spawning
        } else if (p.type === 'incident' && p.x >= 0) {
           // Incident pulse is "consumed" by the boundary
        } else {
           activePulses.push(p);
        }
      }
      
      if (hasSplit) {
        pulsesRef.current = activePulses as any;
      }

      // --- RENDER ---
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      const centerY = height / 2;
      const boundaryX = width / 2;

      // Draw Boundary Line
      ctx.strokeStyle = '#3f3f46';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(boundaryX, 0); ctx.lineTo(boundaryX, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Medium Backgrounds (Subtle)
      ctx.fillStyle = 'rgba(34, 211, 238, 0.05)'; // Cyan tint left
      ctx.fillRect(0, 0, boundaryX, height);
      ctx.fillStyle = 'rgba(244, 114, 182, 0.05)'; // Pink tint right
      ctx.fillRect(boundaryX, 0, width - boundaryX, height);

      // Draw Strings (Rest Position)
      // Left String
      ctx.beginPath();
      ctx.lineWidth = 1 + density1; // Visual thickness
      ctx.strokeStyle = '#22d3ee';
      ctx.moveTo(0, centerY); ctx.lineTo(boundaryX, centerY);
      ctx.stroke();
      
      // Right String
      ctx.beginPath();
      ctx.lineWidth = 1 + density2;
      ctx.strokeStyle = '#f472b6';
      ctx.moveTo(boundaryX, centerY); ctx.lineTo(width, centerY);
      ctx.stroke();


      // --- DRAW PULSES ---
      // We use a Gaussian function drawn vertex-by-vertex
      const drawPulse = (p: any) => {
        const centerScreen = boundaryX + p.x;
        const baseWidth = 60; 
        const visualWidth = baseWidth * p.width; 
        const heightScale = 100 * p.amp;

        ctx.beginPath();
        
        // Choose color based on type
        if (p.type === 'incident') ctx.strokeStyle = '#fff';
        else if (p.type === 'reflected') ctx.strokeStyle = '#22d3ee'; // Cyan
        else ctx.strokeStyle = '#f472b6'; // Pink

        ctx.lineWidth = 3;
        
        // Draw range
        const start = centerScreen - visualWidth * 2;
        const end = centerScreen + visualWidth * 2;

        for (let px = start; px <= end; px+=2) {
          // Don't draw past boundary for reflected/incident if they shouldn't be there visually?
          // Actually, let's just clip drawing to the correct medium
          if (p.type === 'reflected' && px > boundaryX) continue;
          if (p.type === 'transmitted' && px < boundaryX) continue;
          if (p.type === 'incident' && px > boundaryX) continue;

          const dist = (px - centerScreen) / visualWidth;
          const yOff = heightScale * Math.exp(-2 * dist * dist); // Gaussian
          
          if (px === start) ctx.moveTo(px, centerY - yOff);
          else ctx.lineTo(px, centerY - yOff);
        }
        ctx.stroke();
        
        // Label Pulse
        if (Math.abs(p.amp) > 0.05) {
          ctx.fillStyle = ctx.strokeStyle;
          ctx.font = 'bold 12px sans-serif';
          const label = p.type === 'incident' ? 'I' : (p.type === 'reflected' ? 'R' : 'T');
          ctx.fillText(label, centerScreen, centerY - (heightScale * 1.2));
        }
      };

      pulsesRef.current.forEach(drawPulse);

      // --- HUD ---
      const percentR = (R_coeff * 100).toFixed(0);
      const percentT = (T_coeff * 100).toFixed(0);
      
      // Left Side Info
      ctx.fillStyle = '#22d3ee';
      ctx.textAlign = 'left';
      ctx.font = '10px monospace';
      ctx.fillText(`MEDIUM 1 (Density ${density1.toFixed(1)})`, 20, height - 20);
      
      // Right Side Info
      ctx.fillStyle = '#f472b6';
      ctx.textAlign = 'right';
      ctx.fillText(`MEDIUM 2 (Density ${density2.toFixed(1)})`, width - 20, height - 20);

      // Center Stats
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`R: ${percentR}%`, boundaryX - 80, 50);
      ctx.fillText(`T: ${percentT}%`, boundaryX + 80, 50);
      
      ctx.font = '10px monospace';
      ctx.fillStyle = '#71717a';
      ctx.fillText("AMPLITUDE COEFFICIENTS", boundaryX, 30);

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// --- 4. Controls Component ---
const renderControls = ({ values, setValue }: { 
  values: ReflectionState; 
  setValue: (k: keyof ReflectionState, v: any) => void;
}) => (
  <div className="flex flex-col gap-6 max-w-5xl mx-auto">
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
      
      {/* Density 1 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            Medium 1 Density
          </label>
          <span className="text-xs font-mono bg-cyan-900/20 text-cyan-300 px-2 py-1 rounded">
             {values.density1.toFixed(1)}
          </span>
        </div>
        <input 
          type="range" min="1.0" max="10.0" step="0.5"
          value={values.density1}
          onChange={(e) => setValue('density1', parseFloat(e.target.value))}
          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
      </div>

      {/* Density 2 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-pink-400 uppercase tracking-widest">
            Medium 2 Density
          </label>
          <span className="text-xs font-mono bg-pink-900/20 text-pink-300 px-2 py-1 rounded">
             {values.density2.toFixed(1)}
          </span>
        </div>
        <input 
          type="range" min="1.0" max="10.0" step="0.5"
          value={values.density2}
          onChange={(e) => setValue('density2', parseFloat(e.target.value))}
          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
        />
      </div>

    </div>

    {/* Action Bar */}
    <div className="flex justify-center gap-6">
       
       <button
         onClick={() => setValue('isFiring', !values.isFiring)} // Toggle to re-fire or simple logic
         onMouseDown={() => setValue('isFiring', false)} // Reset on click
         onMouseUp={() => setValue('isFiring', true)}   // Fire on release
         className="px-10 py-4 bg-gradient-to-r from-cyan-600 to-pink-600 rounded-xl font-bold text-white shadow-lg hover:scale-105 transition-transform flex items-center gap-3"
       >
         <FaExchangeAlt /> FIRE PULSE
       </button>

       <button
         onClick={() => setValue('slowMo', !values.slowMo)}
         className={`
           px-6 py-4 rounded-xl font-bold border transition-all flex items-center gap-2
           ${values.slowMo 
             ? 'bg-white/10 text-white border-white/50' 
             : 'bg-zinc-800 text-zinc-500 border-zinc-700'}
         `}
       >
         {values.slowMo ? 'Slow Mo: ON' : 'Slow Mo: OFF'}
       </button>
    </div>
    
    <div className="text-center text-[10px] text-zinc-600">
      Tip: Click and release "FIRE PULSE" to spawn a new wave.
    </div>

  </div>
);

// --- 5. Export ---
export const SIMULATION_13 = {
  title: 'Reflection & Transmission',
  initialValues: { 
    density1: 1.0, 
    density2: 4.0, 
    isFiring: false,
    slowMo: false
  },
  achievements: achievements,
  renderSimulation: ({ values }: { values: ReflectionState }) => (
    <ReflectionCanvas values={values} />
  ),
  renderControls: renderControls
};