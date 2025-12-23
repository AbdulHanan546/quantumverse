import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine';

// 1. Interface
interface SimState {
  isFiring: boolean;
  observerEyeOpen: boolean; // The "Creeper" mode
  patternType: 'none' | 'stripes' | 'blobs'; // Detected pattern on back wall
  totalHits: number;
}

// 2. Achievements
const achievements: Achievement<SimState>[] = [
  {
    id: 'spray-and-pray',
    title: 'Spray and Pray',
    description: 'Start firing particles. Let chaos reign.',
    condition: (s) => s.isFiring
  },
  {
    id: 'ghost-party',
    title: 'Ghost Party (Wave Mode)',
    description: 'Turn OFF the Observer. Watch the particles form stripes (interference) like magic.',
    condition: (s) => !s.observerEyeOpen && s.patternType === 'stripes'
  },
  {
    id: 'party-pooper',
    title: 'Party Pooper (Particle Mode)',
    description: 'Turn ON the Observer. Watch the particles get shy and form two boring clumps.',
    condition: (s) => s.observerEyeOpen && s.patternType === 'blobs'
  },
  {
    id: 'data-farmer',
    title: 'Data Farmer',
    description: 'Let 500+ particles hit the screen to get a clear picture.',
    condition: (s) => s.totalHits > 500
  },
  {
    id: 'switcheroo',
    title: 'The Switcheroo',
    description: 'Start with the eye CLOSED, then OPEN it. Ruin the pattern halfway through.',
    condition: (s) => s.patternType === 'blobs' && s.totalHits > 200 && !s.observerEyeOpen // Tricky logic, requires manual state manipulation awareness
  }
];

// 3. Canvas Component
const DualityCanvas = ({ values, setValue }: { values: SimState, setValue: any }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // We keep high-frequency data in refs to avoid React re-renders slowing down the anim
  const particles = useRef<{x: number, y: number, vy: number, phase: number}[]>([]);
  const screenBuckets = useRef<number[]>(new Array(100).fill(0));
  const frameCount = useRef(0);

  // Clear screen when toggling firing to keep visual clean
  useEffect(() => {
    if (values.totalHits === 0) {
        screenBuckets.current = new Array(100).fill(0);
    }
  }, [values.totalHits]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      const width = canvas.width = canvas.parentElement?.clientWidth || 600;
      const height = canvas.height = canvas.parentElement?.clientHeight || 400;
      const centerY = height / 2;
      const screenX = width - 50;
      const wallX = width / 2;
      
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      // 1. Draw The Barrier
      ctx.fillStyle = '#27272a';
      ctx.fillRect(wallX, 0, 10, height);
      // Cut Slits
      ctx.fillStyle = '#09090b';
      const slitGap = 40;
      ctx.fillRect(wallX, centerY - slitGap - 10, 10, 20); // Top Slit
      ctx.fillRect(wallX, centerY + slitGap - 10, 10, 20); // Bottom Slit

      // 2. Draw The "Eye" (Observer)
      const eyeColor = values.observerEyeOpen ? '#ef4444' : '#52525b';
      ctx.strokeStyle = eyeColor;
      ctx.lineWidth = 3;
      // Eye shape
      ctx.beginPath();
      ctx.ellipse(wallX, centerY - 100, 20, 12, 0, 0, Math.PI * 2);
      ctx.stroke();
      if (values.observerEyeOpen) {
          ctx.beginPath();
          ctx.arc(wallX, centerY - 100, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#ef4444';
          ctx.fill();
          
          // "Looking" Cone
          ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
          ctx.beginPath();
          ctx.moveTo(wallX, centerY - 100);
          ctx.lineTo(wallX + 50, centerY - 60);
          ctx.lineTo(wallX + 50, centerY + 60);
          ctx.fill();
      }

      // 3. Particle Logic
      if (values.isFiring) {
          // Spawn
          if (Math.random() > 0.1) {
              particles.current.push({
                  x: 0,
                  y: centerY + (Math.random() - 0.5) * 20,
                  vy: 0,
                  phase: Math.random() * Math.PI * 2
              });
          }
      }

      particles.current.forEach((p, i) => {
          p.x += 6; // Move forward

          // Passing the Wall
          if (p.x > wallX && p.x < wallX + 10) {
              // Quantum Decision Moment
              if (values.observerEyeOpen) {
                  // PARTICLE MODE: Pick a slit and fly straight-ish
                  const pickTop = Math.random() > 0.5;
                  p.y = pickTop ? centerY - slitGap : centerY + slitGap;
                  p.vy = (Math.random() - 0.5) * 2; // Random spread (Classical)
              } else {
                  // WAVE MODE: Probability spread
                  // We simulate the destination based on interference math
                  // I ~ cos^2(y)
                  // We don't actually calculate the trajectory, we pre-destine the impact (Monte Carlo style visual cheat)
                  // This ensures the pattern emerges naturally on the screen
                  let valid = false;
                  while(!valid) {
                      const testY = (Math.random() - 0.5) * height; // Random spot on wall
                      const relativeY = (testY) / 20; // Scale factor
                      const probability = Math.pow(Math.cos(relativeY), 2);
                      if (Math.random() < probability) {
                          p.vy = (centerY + testY - p.y) / ((screenX - wallX)/6); // Calculate velocity to hit that spot
                          valid = true;
                      }
                  }
              }
          }
          
          p.y += p.vy;

          // Draw Particle
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = values.observerEyeOpen ? '#fca5a5' : '#a78bfa';
          ctx.fill();

          // Hitting Screen
          if (p.x >= screenX) {
              const binIndex = Math.floor((p.y / height) * 100);
              if (binIndex >= 0 && binIndex < 100) {
                  screenBuckets.current[binIndex]++;
                  // Update React State less frequently
                  if (frameCount.current % 10 === 0) {
                      setValue('totalHits', (prev: number) => prev + 1);
                  }
              }
              particles.current[i] = { x: -999, y: 0, vy: 0, phase: 0 }; // Mark for deletion
          }
      });

      // Cleanup
      particles.current = particles.current.filter(p => p.x > -100);

      // 4. Draw Detection Screen (Histogram)
      ctx.fillStyle = values.observerEyeOpen ? '#ef4444' : '#a78bfa';
      screenBuckets.current.forEach((count, i) => {
          if (count > 0) {
            const barY = (i / 100) * height;
            const barH = height / 100;
            ctx.fillRect(screenX, barY, count * 2, barH);
          }
      });

      // 5. Pattern Recognition Logic (Simple)
      // Check middle bucket (index 50). 
      // In Interference (Observer OFF), middle is a PEAK.
      // In Classical (Observer ON), middle is a VALLEY (gap between piles).
      if (frameCount.current % 30 === 0 && values.totalHits > 50) {
          const middleDensity = screenBuckets.current.slice(45, 55).reduce((a,b) => a+b, 0);
          const totalDensity = values.totalHits;
          // If middle is dense -> Stripes. If middle is empty -> Blobs.
          const ratio = middleDensity / totalDensity;
          setValue('patternType', ratio > 0.15 ? 'stripes' : 'blobs');
      }

      frameCount.current++;
      requestAnimationFrame(animate);
    };

    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [values, setValue]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

// 4. Main Export
export const SIMULATION_29 = {
  title: "The Quantum Double-Slit",
  initialValues: { isFiring: false, observerEyeOpen: false, patternType: 'none', totalHits: 0 },
  achievements: achievements,
  renderSimulation: ({ values, setValue }: { values: SimState, setValue: any }) => (
    <div className="w-full h-full relative">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center z-10 bg-black/60 p-3 rounded-lg border border-white/10 backdrop-blur-md w-3/4">
        <p className="text-zinc-300 text-xs">
          <b>The Paradox:</b> Matter acts like a wave (Stripes) until you measure it.<br/>
          Toggle the <b>Observer Eye</b> to ruin the magic.
        </p>
      </div>
      <DualityCanvas values={values} setValue={setValue} />
    </div>
  ),
  renderControls: ({ values, setValue }: { values: SimState, setValue: any }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      
      {/* Fire Control */}
      <div className="flex flex-col justify-center space-y-2">
        <button 
          onClick={() => setValue('isFiring', !values.isFiring)}
          className={`px-4 py-4 rounded-xl font-bold text-sm uppercase transition-all duration-300 border-2 ${
            values.isFiring 
            ? 'bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.3)]' 
            : 'bg-zinc-800 border-zinc-700 text-zinc-500'
          }`}
        >
          {values.isFiring ? 'Stop Firing Particles' : 'Fire Electron Gun'}
        </button>
      </div>

      {/* Observer Toggle */}
      <div className="flex flex-col justify-center space-y-2">
        <button 
          onClick={() => {
              setValue('observerEyeOpen', !values.observerEyeOpen);
              // Optional: Reset screen to see pattern clearly
              setValue('totalHits', 0); 
          }}
          className={`px-4 py-4 rounded-xl font-bold text-sm uppercase transition-all duration-300 border-2 ${
            values.observerEyeOpen 
            ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
            : 'bg-purple-500/20 border-purple-500 text-purple-400'
          }`}
        >
          {values.observerEyeOpen ? 'OBSERVER: ON (PARTICLE MODE)' : 'OBSERVER: OFF (WAVE MODE)'}
        </button>
        <p className="text-[10px] text-zinc-500 text-center">
            {values.observerEyeOpen ? "The particles are embarrassed. No interference." : "The particles are dancing. Interference pattern active."}
        </p>
      </div>

    </div>
  )
};