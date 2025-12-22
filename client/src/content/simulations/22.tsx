import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine';

// 1. Interface
interface SimState {
  photonEnergy: number; // Incoming energy (Frequency)
  impactParameter: number; // How "off-center" the hit is
  isScattered: boolean;
  finalWavelengthShift: number;
}

// 2. Achievements
const achievements: Achievement<SimState>[] = [
  {
    id: 'direct-hit',
    title: 'Bullseye',
    description: 'Aim for a perfectly centered hit (Impact = 0).',
    condition: (s) => s.impactParameter === 0 && s.isScattered
  },
  {
    id: 'color-shift',
    title: 'The Great Reddening',
    description: 'Scatter a high-energy photon and watch its wavelength increase (turn redder).',
    condition: (s) => s.photonEnergy > 8 && s.isScattered
  },
  {
    id: 'glancing-blow',
    title: 'Just a Scratch',
    description: 'Hit the electron at the very edge (Impact > 8).',
    condition: (s) => s.impactParameter > 8 && s.isScattered
  },
  {
    id: 'energy-thief',
    title: 'Energy Thief',
    description: 'Successfully transfer energy to the electron so it flies away at high speed.',
    condition: (s) => s.photonEnergy > 7 && s.impactParameter < 3 && s.isScattered
  }
];

// 3. Canvas Component
const ComptonCanvas = ({ values, setValue }: { values: SimState, setValue: any }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ 
    photon: { x: -50, y: 0, active: true, angle: 0, energy: values.photonEnergy },
    electron: { x: 0, y: 0, active: true, vx: 0, vy: 0 },
    animating: false 
  });

  const runCollision = () => {
    stateRef.current.photon = { x: 0, y: values.impactParameter * 5, active: true, angle: 0, energy: values.photonEnergy };
    stateRef.current.electron = { x: 300, y: 200, active: true, vx: 0, vy: 0 };
    stateRef.current.animating = true;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      const width = canvas.width = canvas.parentElement?.clientWidth || 600;
      const height = canvas.height = canvas.parentElement?.clientHeight || 400;
      const centerY = height / 2;

      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      const { photon, electron, animating } = stateRef.current;

      // Draw Stationary Electron (The 8-ball)
      ctx.beginPath();
      ctx.arc(300, centerY, 15, 0, Math.PI * 2);
      ctx.fillStyle = '#18181b';
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#4ade80';
      ctx.font = '10px monospace';
      ctx.fillText("ELECTRON", 280, centerY + 30);

      if (animating) {
        // Move Incoming Photon
        if (photon.x < 300) {
          photon.x += 10;
          photon.y = centerY + (values.impactParameter * 4);
        } else if (photon.active) {
          // COLLISION LOGIC (Simplified Physics)
          // The angle of scattering theta depends on the impact parameter
          const theta = (Math.PI / 2) * (values.impactParameter / 10);
          photon.angle = theta;
          
          // Compton Shift: Delta Lambda = (h/mc)(1 - cos(theta))
          // We'll simulate this by slowing the photon and changing color
          const shift = (1 - Math.cos(theta)) * values.photonEnergy * 0.5;
          setValue('isScattered', true);
          setValue('finalWavelengthShift', shift);
          
          // Kick the electron
          electron.vx = Math.cos(theta - Math.PI/2) * (values.photonEnergy * 0.5);
          electron.vy = Math.sin(theta - Math.PI/2) * (values.photonEnergy * 0.5);
          
          photon.active = false; // Transformation point
        }

        if (!photon.active) {
          // Post-Collision Movement
          photon.x += Math.cos(photon.angle) * 8;
          photon.y += Math.sin(photon.angle) * 8;
          electron.x += electron.vx;
          electron.y += electron.vy;
          
          // Draw Electron moving
          ctx.beginPath();
          ctx.arc(electron.x, electron.y, 15, 0, Math.PI * 2);
          ctx.fillStyle = '#4ade80';
          ctx.fill();
        }

        // Draw Photon (Wavy line or Pulse)
        const hue = 280 - (values.photonEnergy * 20) + (values.finalWavelengthShift * 20);
        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 1)`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let j = 0; j < 20; j++) {
            const wx = photon.x - j * 5;
            const wy = photon.y + Math.sin(wx * 0.2) * 10;
            if (j === 0) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
        }
        ctx.stroke();
      }

      requestAnimationFrame(animate);
    };

    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [values, setValue]);

  return (
    <div className="w-full h-full relative">
      <button 
        onClick={runCollision}
        className="absolute bottom-4 right-4 bg-green-500 hover:bg-green-400 text-black font-bold py-2 px-6 rounded-full transition-all z-30"
      >
        FIRE PHOTON
      </button>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

// 4. Main Export
export const SIMULATION_22 = {
  title: "Compton Scattering",
  initialValues: { 
    photonEnergy: 5, 
    impactParameter: 2, 
    isScattered: false, 
    finalWavelengthShift: 0 
  },
  achievements: achievements,
  renderSimulation: ({ values, setValue }: { values: SimState, setValue: any }) => (
    <div className="w-full h-full relative">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center z-10 bg-black/60 p-3 rounded-lg border border-white/10 backdrop-blur-md">
        <p className="text-zinc-300 text-xs">
          When light hits an electron, it behaves like a billiard ball. <br/>
          It loses energy, changes color, and gets deflected. 
        </p>
      </div>
      <ComptonCanvas values={values} setValue={setValue} />
    </div>
  ),
  renderControls: ({ values, setValue }: { values: SimState, setValue: any }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      
      {/* Photon Energy */}
      <div className="space-y-3 group">
        <div className="flex justify-between items-end">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Photon Energy (X-Ray Intensity)</label>
          <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
            <span className="text-sm font-mono text-green-400 font-bold">{values.photonEnergy.toFixed(1)}</span>
          </div>
        </div>
        <input 
          type="range" min="1" max="10" step="0.5"
          value={values.photonEnergy}
          onChange={(e) => {
              setValue('photonEnergy', parseFloat(e.target.value));
              setValue('isScattered', false); // Reset for new run
          }}
          className="glow-range"
        />
      </div>

      {/* Impact Parameter */}
      <div className="space-y-3 group">
        <div className="flex justify-between items-end">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Aim (Impact Parameter)</label>
          <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
            <span className="text-sm font-mono text-blue-400 font-bold">{values.impactParameter === 0 ? "BULLSEYE" : values.impactParameter.toFixed(1)}</span>
          </div>
        </div>
        <input 
          type="range" min="0" max="10" step="1"
          value={values.impactParameter}
          onChange={(e) => {
              setValue('impactParameter', parseFloat(e.target.value));
              setValue('isScattered', false);
          }}
          className="glow-range"
        />
      </div>

    </div>
  )
};