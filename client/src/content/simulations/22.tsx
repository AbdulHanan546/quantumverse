import React, { useEffect, useRef, useState } from 'react';
import { type Achievement } from '../../components/SimulationEngine';
import { FaAtom, FaBullseye } from 'react-icons/fa';

// --- 1. Interface ---
interface ComptonState {
  photonEnergy: number;    // 1 (Red/Low) to 10 (Gamma/High)
  impactParameter: number; // 0 (Head-on) to 10 (Miss)
}

// --- 2. Achievements ---
const achievements: Achievement<ComptonState>[] = [
  {
    id: 'direct-hit',
    title: 'Bullseye (Backscatter)',
    description: 'Hit the electron dead center (Impact = 0). The photon should bounce straight back!',
    condition: (s) => s.impactParameter === 0
  },
  {
    id: 'color-shift',
    title: 'Red Shift',
    description: 'Scatter a high-energy photon (Energy > 8) and watch it lose energy (turn redder).',
    condition: (s) => s.photonEnergy > 8 && s.impactParameter < 4
  },
  {
    id: 'glancing-blow',
    title: 'Grazing Shot',
    description: 'Barely touch the electron (Impact > 8). Little energy is lost.',
    condition: (s) => s.impactParameter > 8 && s.impactParameter < 10
  },
  {
    id: 'momentum-transfer',
    title: 'Knockout Punch',
    description: 'Transfer maximum momentum (High Energy, Low Impact).',
    condition: (s) => s.photonEnergy > 9 && s.impactParameter < 2
  }
];

// --- 3. Canvas Component ---
const ComptonCanvas = ({ values }: { values: ComptonState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Simulation State (Refs for performance)
  // We don't want React re-renders to handle 60fps physics
  const simRef = useRef({
    isRunning: false,
    photon: { x: -100, y: 0, vx: 0, vy: 0, energy: 0, angle: 0, hasCollided: false },
    electron: { x: 0, y: 0, vx: 0, vy: 0 }
  });

  // Keep track of current slider values without triggering re-renders in the loop
  const valuesRef = useRef(values);
  useEffect(() => { valuesRef.current = values; }, [values]);

  const firePhoton = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const { photonEnergy, impactParameter } = valuesRef.current;
    
    simRef.current.isRunning = true;
    simRef.current.photon = {
      x: 0,
      y: canvas.height / 2 + (impactParameter * 4), // Offset by impact parameter
      vx: 8, // Speed of light (simulated)
      vy: 0,
      energy: photonEnergy,
      angle: 0,
      hasCollided: false
    };
    simRef.current.electron = {
      x: canvas.width * 0.6, // Target position
      y: canvas.height / 2,
      vx: 0,
      vy: 0
    };
  };

  const getPhotonColor = (energy: number) => {
    // Map energy 1-10 to HSL (Red to Violet)
    const hue = Math.max(0, Math.min(280, (energy / 10) * 280));
    return `hsl(${hue}, 100%, 60%)`;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const animate = () => {
      // Resize & Clear
      const parent = canvas.parentElement;
      if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      // --- Draw Scene ---
      
      const { photon, electron, isRunning } = simRef.current;
      time += 0.2;

      // 1. Draw Target Zone (if idle)
      if (!isRunning) {
         simRef.current.electron.x = width * 0.6;
         simRef.current.electron.y = centerY;
      }

      // 2. Physics Updates
      if (isRunning) {
        // Move Photon
        photon.x += photon.vx;
        photon.y += photon.vy;
        
        // Move Electron
        electron.x += electron.vx;
        electron.y += electron.vy;

        // Collision Detection
        const dx = photon.x - electron.x;
        const dy = photon.y - electron.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        // Collision happens when photon gets close to electron center
        if (!photon.hasCollided && dist < 20) {
            photon.hasCollided = true;
            
            // PHYSICS CALCULATION
            // Scattering angle depends on impact parameter
            // b=0 -> theta=PI (Backscatter), b=Max -> theta=0
            // Simplified approximation for visualization:
            const impact = valuesRef.current.impactParameter;
            const theta = Math.PI - (impact * 0.3); // Rough mapping
            
            // Compton Shift: New Energy < Old Energy
            // E' = E / (1 + (E/mc^2)(1 - cos theta))
            // We simulate this visually by reducing energy value
            const energyLossFactor = (1 - Math.cos(theta)) * 0.3; 
            const newEnergy = Math.max(1, photon.energy * (1 - energyLossFactor));
            
            // Update Photon Vector
            // Scatter up or down depending on impact y relative to electron
            const scatterDir = photon.y > electron.y ? 1 : -1;
            photon.vx = Math.cos(scatterDir * theta) * 6; // Slow down slightly
            photon.vy = Math.sin(scatterDir * theta) * 6;
            photon.energy = newEnergy; // Change color!

            // Update Electron Vector (Conservation of Momentum roughly)
            // Electron goes roughly opposite to photon scatter
            electron.vx = Math.cos(scatterDir * theta + Math.PI) * (valuesRef.current.photonEnergy * 0.5);
            electron.vy = Math.sin(scatterDir * theta + Math.PI) * (valuesRef.current.photonEnergy * 0.5);
        }
      }

      // 3. Draw Electron
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#4ade80';
      ctx.fillStyle = '#18181b';
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 3;
      
      ctx.beginPath();
      ctx.arc(electron.x, electron.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#4ade80';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("e-", electron.x, electron.y + 4);
      ctx.shadowBlur = 0;


      // 4. Draw Photon (Wave Packet)
      if (isRunning) {
          const color = getPhotonColor(photon.energy);
          ctx.strokeStyle = color;
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';
          ctx.beginPath();
          
          // Draw a wave packet of finite length
          const packetLength = 40;
          // Frequency depends on energy (High Energy = High Freq)
          const freq = 0.2 + (photon.energy * 0.05);
          // Amplitude
          const amp = 8;

          for(let i=0; i<packetLength; i++) {
              const px = photon.x - (photon.vx !== 0 ? Math.sign(photon.vx)*i : i);
              const py = photon.y - (photon.vy !== 0 ? Math.sign(photon.vy)*i : 0);
              
              // Perpendicular oscillation
              // We need to calculate perpendicular vector to velocity
              const speed = Math.sqrt(photon.vx*photon.vx + photon.vy*photon.vy) || 1;
              const perpX = -photon.vy / speed;
              const perpY = photon.vx / speed;

              const waveOffset = Math.sin((i * freq) - time) * amp * Math.sin((i/packetLength)*Math.PI); // Envelope function
              
              const wx = px + perpX * waveOffset;
              const wy = py + perpY * waveOffset;

              if (i===0) ctx.moveTo(wx, wy);
              else ctx.lineTo(wx, wy);
          }
          ctx.stroke();
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return (
    <div className="w-full h-full relative group">
      <canvas ref={canvasRef} className="block w-full h-full" />
      
      {/* Overlay Instructions / Fire Button */}
      <div className="absolute bottom-6 right-6 flex flex-col items-end gap-2">
         <div className="text-xs text-zinc-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Adjust sliders, then fire!
         </div>
         <button 
            onClick={firePhoton}
            className="bg-green-500 hover:bg-green-400 text-black font-bold py-3 px-8 rounded-full shadow-lg shadow-green-900/20 transform hover:scale-105 transition-all flex items-center gap-2"
         >
            <FaBullseye /> FIRE PHOTON
         </button>
      </div>
    </div>
  );
};

// --- 4. Controls ---
const RenderControls = ({ values, setValue }: { values: ComptonState, setValue: any }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Photon Energy Slider */}
            <div className="space-y-4 group">
                <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <FaAtom className="text-purple-500"/> Photon Energy ($h\nu$)
                    </label>
                    <div className="bg-zinc-800 px-3 py-1 rounded border border-zinc-700">
                         <span className="text-sm font-mono font-bold" style={{ color: `hsl(${Math.max(0, Math.min(280, (values.photonEnergy / 10) * 280))}, 100%, 60%)` }}>
                            {values.photonEnergy.toFixed(1)} <span className="text-zinc-600 text-[10px]">keV</span>
                         </span>
                    </div>
                </div>
                <input 
                    type="range" min="1" max="10" step="0.5"
                    value={values.photonEnergy}
                    onChange={(e) => setValue('photonEnergy', parseFloat(e.target.value))}
                    className="glow-range"
                    style={{'--range-color': `hsl(${Math.max(0, Math.min(280, (values.photonEnergy / 10) * 280))}, 100%, 60%)`} as any}
                />
                <div className="flex justify-between text-[10px] text-zinc-600 uppercase font-bold">
                    <span>Red (Low E)</span>
                    <span>Violet (High E)</span>
                </div>
            </div>

            {/* Impact Parameter Slider */}
            <div className="space-y-4 group">
                <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <FaBullseye className="text-blue-500"/> Impact Parameter ($b$)
                    </label>
                    <div className="bg-zinc-800 px-3 py-1 rounded border border-zinc-700">
                        <span className="text-sm font-mono text-blue-400 font-bold">
                            {values.impactParameter.toFixed(1)}
                        </span>
                    </div>
                </div>
                <input 
                    type="range" min="0" max="10" step="0.5"
                    value={values.impactParameter}
                    onChange={(e) => setValue('impactParameter', parseFloat(e.target.value))}
                    className="glow-range"
                    style={{'--range-color': '#3b82f6'} as any}
                />
                <div className="flex justify-between text-[10px] text-zinc-600 uppercase font-bold">
                    <span>Direct Hit</span>
                    <span>Miss</span>
                </div>
            </div>

        </div>
    );
};

// --- 5. Export ---
export const SIMULATION_22 = {
  title: 'Compton Scattering',
  initialValues: { photonEnergy: 9, impactParameter: 1 },
  achievements: achievements,
  renderSimulation: ({ values }: { values: ComptonState }) => <ComptonCanvas values={values} />,
  renderControls: (props: any) => <RenderControls {...props} />
};