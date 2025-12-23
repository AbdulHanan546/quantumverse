import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine';

// 1. Interface
interface SimState {
  shutterSpeed: number; // 1 (Fast/Freeze) to 10 (Slow/Blur)
  flashPower: number;   // 1 (Dim/Gentle) to 10 (Bright/Hard Kick)
  lastPhoto: 'none' | 'sharp' | 'blurry' | 'kicked';
  uncertaintyProduct: number; // The "Heisenberg Score"
}

// 2. Achievements
const achievements: Achievement<SimState>[] = [
  {
    id: 'crystal-clear',
    title: 'Frozen in Time',
    description: 'Use a fast shutter (1). You know EXACTLY where it is, but have no idea how fast it\'s moving.',
    condition: (s) => s.shutterSpeed === 1 && s.lastPhoto === 'sharp'
  },
  {
    id: 'speed-demon',
    title: 'The Blur',
    description: 'Use a slow shutter (10). You see the speed perfectly (the trail), but the position is a giant smudge.',
    condition: (s) => s.shutterSpeed === 10 && s.lastPhoto === 'blurry'
  },
  {
    id: 'bull-in-shop',
    title: 'Measurement Bully',
    description: 'Max out the Flash Power. You took the photo, but you punted the particle into next week.',
    condition: (s) => s.flashPower >= 9 && s.lastPhoto !== 'none'
  },
  {
    id: 'heisenberg-limit',
    title: 'The Heisenberg Limit',
    description: 'Try to cheat nature by balancing Shutter and Flash, but realize you still can\'t get zero uncertainty.',
    condition: (s) => s.uncertaintyProduct > 20 && s.uncertaintyProduct < 40 && s.lastPhoto !== 'none'
  }
];

// 3. Canvas Component
const MeasurementCanvas = ({ values, setValue }: { values: SimState, setValue: any }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Particle state held in ref to survive re-renders
  const particle = useRef({ x: 50, y: 200, vx: 5, vy: 0 });
  const photoOverlay = useRef<{active: boolean, x: number, y: number, type: string, width: number} | null>(null);

  const takePhoto = () => {
    const p = particle.current;
    
    // 1. Determine Photo Characteristics
    const isBlurry = values.shutterSpeed > 5;
    const blurAmount = values.shutterSpeed * 10;
    
    // 2. Apply "The Kick" (The measurement disturbing the system)
    // High flash power changes the velocity RANDOMLY and VIOLENTLY
    const kick = values.flashPower * 2;
    p.vx += (Math.random() - 0.5) * kick;
    p.vy += (Math.random() - 0.5) * kick;

    // 3. Set Visuals
    photoOverlay.current = {
        active: true,
        x: p.x,
        y: p.y,
        type: isBlurry ? 'blurry' : 'sharp',
        width: isBlurry ? blurAmount : 10
    };

    // 4. Update Sim State for Achievements
    // Uncertainty Principle: Delta X * Delta P >= h/2
    // Low Shutter = Low Delta X (Good Pos), High Delta P (Bad Momentum info)
    const positionUncertainty = values.shutterSpeed; 
    const momentumUncertainty = (11 - values.shutterSpeed) + values.flashPower; 
    
    setValue('lastPhoto', values.flashPower > 8 ? 'kicked' : (isBlurry ? 'blurry' : 'sharp'));
    setValue('uncertaintyProduct', positionUncertainty * momentumUncertainty);

    // Hide photo after 1 sec
    setTimeout(() => { photoOverlay.current = null; }, 1000);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      const width = canvas.width = canvas.parentElement?.clientWidth || 600;
      const height = canvas.height = canvas.parentElement?.clientHeight || 400;

      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      // Move Particle
      const p = particle.current;
      p.x += p.vx;
      p.y += p.vy;

      // Bounce off walls
      if (p.x > width || p.x < 0) p.vx *= -1;
      if (p.y > height || p.y < 0) p.vy *= -1;

      // Draw Particle (The "Reality")
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#52525b'; // Grey (hard to see without flash)
      ctx.fill();

      // Draw Photo Overlay (The "Measurement")
      if (photoOverlay.current && photoOverlay.current.active) {
          const photo = photoOverlay.current;
          
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.strokeRect(photo.x - 100, photo.y - 75, 200, 150); // Frame
          
          ctx.fillStyle = '#fff';
          ctx.font = '10px monospace';
          ctx.fillText("CAPTURED IMAGE", photo.x - 90, photo.y - 60);

          // The Captured Image
          if (photo.type === 'sharp') {
              // Sharp dot
              ctx.beginPath();
              ctx.arc(photo.x, photo.y, 5, 0, Math.PI * 2);
              ctx.fillStyle = '#4ade80';
              ctx.fill();
              ctx.fillStyle = '#4ade80';
              ctx.fillText(`Pos: EXACT (+/- ${values.shutterSpeed}px)`, photo.x + 10, photo.y);
              ctx.fillText(`Speed: ???`, photo.x + 10, photo.y + 15);
          } else {
              // Blurry streak
              ctx.beginPath();
              ctx.fillStyle = 'rgba(74, 222, 128, 0.5)';
              ctx.roundRect(photo.x - photo.width/2, photo.y - 5, photo.width, 10, 5);
              ctx.fill();
              ctx.fillStyle = '#4ade80';
              ctx.fillText(`Pos: ??? (+/- ${photo.width}px)`, photo.x - 40, photo.y + 25);
              ctx.fillText(`Speed: PRECISE`, photo.x - 40, photo.y + 40);
          }
      }

      requestAnimationFrame(animate);
    };

    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [values]);

  return (
    <div className="w-full h-full relative">
        <button 
            onClick={takePhoto}
            className="absolute bottom-4 right-4 bg-white text-black font-bold p-4 rounded-full shadow-lg border-4 border-zinc-300 hover:scale-105 active:scale-95 transition-all z-20"
        >
            📸 SNAP
        </button>
        <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

// 4. Main Export
export const SIMULATION_31 = {
  title: "The Uncertainty Camera",
  initialValues: { shutterSpeed: 5, flashPower: 2, lastPhoto: 'none', uncertaintyProduct: 0 },
  achievements: achievements,
  renderSimulation: ({ values, setValue }: { values: SimState, setValue: any }) => (
    <div className="w-full h-full relative">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center z-10 bg-black/60 p-3 rounded-lg border border-white/10 backdrop-blur-md">
        <p className="text-zinc-300 text-xs">
          <b>The Trade-off:</b> A fast shutter sees <i>Where</i> (Position). <br/>
          A slow shutter sees <i>Movement</i> (Momentum). You cannot have both.
        </p>
      </div>
      <MeasurementCanvas values={values} setValue={setValue} />
    </div>
  ),
  renderControls: ({ values, setValue }: { values: SimState, setValue: any }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      
      {/* Shutter Speed */}
      <div className="space-y-3 group">
        <div className="flex justify-between items-end">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Shutter Speed</label>
          <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
            <span className="text-sm font-mono text-green-400 font-bold">
                {values.shutterSpeed === 1 ? "1/1000s (FREEZE)" : values.shutterSpeed === 10 ? "1s (BLUR)" : `${values.shutterSpeed}`}
            </span>
          </div>
        </div>
        <input 
          type="range" min="1" max="10" step="1"
          value={values.shutterSpeed}
          onChange={(e) => setValue('shutterSpeed', parseInt(e.target.value))}
          className="glow-range"
        />
        <p className="text-[10px] text-zinc-600">
            Low = Exact Position, Unknown Speed. High = Exact Speed, Unknown Position.
        </p>
      </div>

      {/* Flash Power */}
      <div className="space-y-3 group">
        <div className="flex justify-between items-end">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Flash Intensity (Photon Energy)</label>
          <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
            <span className="text-sm font-mono text-yellow-400 font-bold">{values.flashPower}</span>
          </div>
        </div>
        <input 
          type="range" min="1" max="10" step="1"
          value={values.flashPower}
          onChange={(e) => setValue('flashPower', parseInt(e.target.value))}
          className="glow-range"
        />
        <p className="text-[10px] text-zinc-600">
            High Power = Clearer image, but disturbs the particle (Changes its speed).
        </p>
      </div>

    </div>
  )
};