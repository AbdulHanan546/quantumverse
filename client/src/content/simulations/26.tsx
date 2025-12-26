import React, { useEffect, useRef, useState } from 'react';
import { type Achievement } from '../../components/SimulationEngine';

// --- 1. Interface ---

interface RutherfordState {
  protonCount: number; // The "size" and charge of the nucleus
  alphaSpeed: number;  // How fast we throw the particles
  beamWidth: number;   // How focused the stream is
  showTrails: boolean; // Visual candy
}

// --- 2. Achievements ---

const achievements: Achievement<RutherfordState>[] = [
  {
    id: 'ghost-town',
    title: 'Ghost Town',
    description: 'Reduce the nucleus to almost nothing (Protons < 10). It\'s basically empty space down there.',
    condition: (s) => s.protonCount < 10
  },
  {
    id: 'brick-wall',
    title: 'The Brick Wall',
    description: 'Crank the protons to max (100). You are basically throwing pebbles at a tank.',
    condition: (s) => s.protonCount >= 100
  },
  {
    id: 'sniper-mode',
    title: 'Sniper Mode',
    description: 'Focus the beam width to minimum (Width < 10). Precision matters.',
    condition: (s) => s.beamWidth < 10
  },
  {
    id: 'spray-and-pray',
    title: 'Spray and Pray',
    description: 'Max out the beam width. Who needs aiming anyway?',
    condition: (s) => s.beamWidth >= 150
  },
  {
    id: 'slow-motion',
    title: 'Matrix Mode',
    description: 'Set particle speed to minimum. Watch them dodge the nucleus in slow-mo.',
    condition: (s) => s.alphaSpeed <= 3
  },
  {
    id: 'momentum-master',
    title: 'Unstoppable Force',
    description: 'Max speed and max protons. Let\'s see who wins.',
    condition: (s) => s.alphaSpeed >= 15 && s.protonCount >= 80
  }
];

// --- 3. Canvas Component ---

const RutherfordCanvas = ({ values }: { values: RutherfordState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // We keep particles in a Ref so they persist across renders without causing re-renders
  const particlesRef = useRef<Array<{
    x: number, y: number, vx: number, vy: number, history: {x: number, y: number}[] 
  }>>([]);

  // Ref for values to be accessible inside the animation loop
  const valuesRef = useRef(values);
  useEffect(() => { valuesRef.current = values; }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0, height = 0;
    let frameCount = 0;

    const animate = () => {
      // 1. Auto-resize
      const parent = canvas.parentElement;
      if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
        width = parent.clientWidth;
        height = parent.clientHeight;
        canvas.width = width;
        canvas.height = height;
      }

      const { protonCount, alphaSpeed, beamWidth, showTrails } = valuesRef.current;
      const centerX = width / 2;
      const centerY = height / 2;

      // 2. Clear Screen (with slight fade for trail effect if desired, but we do manual trails)
      ctx.fillStyle = '#18181b'; // Zinc-950
      ctx.fillRect(0, 0, width, height);

      // 3. Spawn Particles (Continuous Stream)
      // Only spawn every few frames to prevent chaos, depending on speed
      if (frameCount % 2 === 0) {
        particlesRef.current.push({
          x: 0,
          y: centerY + (Math.random() - 0.5) * beamWidth * 2,
          vx: alphaSpeed,
          vy: 0,
          history: []
        });
      }

      // 4. Draw Nucleus
      // The "size" is visual, the "charge" is physics
      const nucleusRadius = 5 + (protonCount / 4);
      
      // Glow
      const gradient = ctx.createRadialGradient(centerX, centerY, nucleusRadius * 0.2, centerX, centerY, nucleusRadius * 3);
      gradient.addColorStop(0, 'rgba(234, 179, 8, 1)'); // Yellow-500 center
      gradient.addColorStop(0.4, 'rgba(234, 179, 8, 0.4)');
      gradient.addColorStop(1, 'rgba(234, 179, 8, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, nucleusRadius * 3, 0, Math.PI * 2);
      ctx.fill();

      // Solid Core
      ctx.fillStyle = '#facc15'; // Yellow-400
      ctx.beginPath();
      ctx.arc(centerX, centerY, nucleusRadius, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(protonCount > 80 ? 'Gold (Au)' : protonCount < 20 ? 'Hydrogenish' : 'Nucleus', centerX, centerY + nucleusRadius + 15);

      // 5. Physics & Draw Particles
      // Coulomb's Law Approximation: F = k * (q1*q2) / r^2
      // We only care about repulsion vector.
      const repulsionStrength = protonCount * 150; 

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];

        // Calculate distance to nucleus
        const dx = p.x - centerX;
        const dy = p.y - centerY;
        const distSq = dx*dx + dy*dy;
        const dist = Math.sqrt(distSq);

        // Apply Force (Repulsion)
        // Avoid division by zero and cap the maximum force to prevent particles teleporting
        if (dist > nucleusRadius) {
            const force = repulsionStrength / (distSq * 0.1); // 0.1 is a dampener
            const angle = Math.atan2(dy, dx);
            
            p.vx += Math.cos(angle) * force;
            p.vy += Math.sin(angle) * force;
        }

        // Update Position
        p.x += p.vx;
        p.y += p.vy;

        // History for trails
        if (showTrails && frameCount % 3 === 0) {
            p.history.push({x: p.x, y: p.y});
            if (p.history.length > 20) p.history.shift();
        }

        // Drawing Trail
        if (showTrails && p.history.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(167, 139, 250, 0.4)`; // Purple tint
            ctx.lineWidth = 2;
            ctx.moveTo(p.history[0].x, p.history[0].y);
            for (let pt of p.history) ctx.lineTo(pt.x, pt.y);
            ctx.stroke();
        }

        // Drawing Particle
        ctx.fillStyle = '#a78bfa'; // Violet-400
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Cleanup: Remove particles that are way off screen
        if (p.x < -100 || p.x > width + 100 || p.y < -100 || p.y > height + 100) {
           particlesRef.current.splice(i, 1);
        }
      }

      frameCount++;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full cursor-crosshair" />;
};

// --- 4. Controls Component ---

const renderControls = ({ values, setValue }: { 
  values: RutherfordState; 
  setValue: (k: keyof RutherfordState, v: any) => void 
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto items-end">
    
    {/* Proton Count */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-yellow-400 transition-colors">
            Nucleus Size (Protons)
            

[Image of rutherford atomic model diagram]

        </label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
          <span className="text-sm font-mono text-yellow-400 font-bold">{values.protonCount}</span>
        </div>
      </div>
      <input 
        type="range" min="1" max="100" step="1"
        value={values.protonCount}
        onChange={(e) => setValue('protonCount', parseInt(e.target.value))}
        className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-500 hover:accent-yellow-400"
      />
      <p className="text-[10px] text-zinc-600">More protons = stronger "repelling" force.</p>
    </div>

    {/* Speed */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-violet-400 transition-colors">Alpha Speed</label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
          <span className="text-sm font-mono text-violet-400 font-bold">{values.alphaSpeed}</span>
        </div>
      </div>
      <input 
        type="range" min="2" max="25" step="1"
        value={values.alphaSpeed}
        onChange={(e) => setValue('alphaSpeed', parseInt(e.target.value))}
        className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500 hover:accent-violet-400"
      />
      <p className="text-[10px] text-zinc-600">Faster particles are harder to deflect.</p>
    </div>

    {/* Beam Width */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-blue-400 transition-colors">Beam Spread</label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
          <span className="text-sm font-mono text-blue-400 font-bold">{values.beamWidth}px</span>
        </div>
      </div>
      <input 
        type="range" min="0" max="200" step="5"
        value={values.beamWidth}
        onChange={(e) => setValue('beamWidth', parseInt(e.target.value))}
        className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
      />
      <p className="text-[10px] text-zinc-600">Narrow beam hits center, wide beam misses.</p>
    </div>

     {/* Toggle Trails */}
     <div className="flex items-center justify-between bg-zinc-800/50 p-3 rounded border border-zinc-700">
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest cursor-pointer">Show Trails</label>
        <button 
            onClick={() => setValue('showTrails', !values.showTrails)}
            className={`w-12 h-6 rounded-full transition-colors relative ${values.showTrails ? 'bg-green-500' : 'bg-zinc-700'}`}
        >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${values.showTrails ? 'left-7' : 'left-1'}`} />
        </button>
    </div>

  </div>
);

// --- 5. Export ---

export const SIMULATION_26 = {
    title: 'The Gold Foil Scandal',
    initialValues: { 
        protonCount: 79, // Gold
        alphaSpeed: 10, 
        beamWidth: 50,
        showTrails: true
    },
    achievements: achievements,
    renderSimulation: ({ values }: { values: RutherfordState }) => (
        <RutherfordCanvas values={values} />
    ),
    renderControls: renderControls
};