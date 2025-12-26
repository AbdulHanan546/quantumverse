import React, { useEffect, useRef } from 'react';
import { type Achievement } from "../../components/SimulationEngine";
import { FaBolt, FaWeightHanging } from 'react-icons/fa';

// --- 1. Interface ---
interface PhotonState {
  wavelength: number; // in nanometers (nm)
  intensity: number;  // number of particles
}

// --- 2. Helper: Wavelength to Color ---
const getSpectralColor = (l: number) => {
  let r=0, g=0, b=0;
  if (l >= 380 && l < 440) { r = -(l - 440) / (440 - 380); g = 0; b = 1; }
  else if (l >= 440 && l < 490) { r = 0; g = (l - 440) / (490 - 440); b = 1; }
  else if (l >= 490 && l < 510) { r = 0; g = 1; b = -(l - 510) / (510 - 490); }
  else if (l >= 510 && l < 580) { r = (l - 510) / (580 - 510); g = 1; b = 0; }
  else if (l >= 580 && l < 645) { r = 1; g = -(l - 645) / (645 - 580); b = 0; }
  else if (l >= 645 && l <= 780) { r = 1; g = 0; b = 0; }
  
  let alpha = 1;
  if (l > 700) alpha = 0.3 + 0.7 * (780 - l) / (780 - 700);
  else if (l < 420) alpha = 0.3 + 0.7 * (l - 380) / (420 - 380);

  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`;
};

// --- 3. Achievements ---
const achievements: Achievement<PhotonState>[] = [
  {
    id: 'hulk-mode',
    title: 'Gamma Rays?',
    description: 'Create high-energy photons (Violet/UV) by dropping wavelength below 400nm.',
    condition: (s) => s.wavelength <= 400
  },
  {
    id: 'chill-vibes',
    title: 'Infrared Snooze',
    description: 'Lower the energy to a lazy crawl (Red/IR) above 700nm.',
    condition: (s) => s.wavelength >= 700
  },
  {
    id: 'crowd-control',
    title: 'Photon Army',
    description: 'Crank the intensity to max.',
    condition: (s) => s.intensity >= 20
  },
  {
    id: 'ghost-town',
    title: 'Lone Ranger',
    description: 'Set intensity to 1.',
    condition: (s) => s.intensity === 1
  },
  {
    id: 'green-lantern',
    title: 'In Brightest Day',
    description: 'Find the sweet spot for pure Green light (~530-550nm).',
    condition: (s) => s.wavelength >= 530 && s.wavelength <= 550
  },
  {
    id: 'balanced-beam',
    title: 'Perfect Yellow',
    description: 'Create a nice sunny yellow beam (~580nm).',
    condition: (s) => Math.abs(s.wavelength - 580) < 10
  }
];

// --- 4. Canvas Component ---
const PhotonCanvas = ({ values }: { values: PhotonState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const particlesRef = useRef<any[]>([]);
  const targetHeatRef = useRef(0);
  
  // FIX: Use a ref for values so the loop doesn't restart on every slider change
  const valuesRef = useRef(values);
  useEffect(() => { valuesRef.current = values; }, [values]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0, height = 0;
    let frame = 0;

    const animate = () => {
      // Resize logic
      const parent = canvas.parentElement;
      if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
        width = parent.clientWidth;
        height = parent.clientHeight;
        canvas.width = width;
        canvas.height = height;
      }

      // FIX: Read from Ref instead of closure to keep animation smooth
      const currentValues = valuesRef.current;
      const { wavelength, intensity } = currentValues;

      // Clear Screen
      ctx.fillStyle = 'rgba(24, 24, 27, 0.4)';
      ctx.fillRect(0, 0, width, height);

      // --- Draw Target ---
      const targetX = width - 60;
      targetHeatRef.current = Math.max(0, targetHeatRef.current - 0.5);
      
      const heatColor = Math.min(255, targetHeatRef.current * 5);
      ctx.fillStyle = `rgb(${heatColor}, ${heatColor/2}, 50)`;
      ctx.strokeStyle = '#52525b';
      ctx.lineWidth = 4;
      
      const shake = (Math.random() - 0.5) * (targetHeatRef.current / 5);
      
      // FIX: Replaced roundRect with rect for compatibility
      ctx.beginPath();
      ctx.rect(targetX + shake, height/4, 20, height/2);
      ctx.fill();
      ctx.stroke();

      // --- Particle Logic ---
      if (frame % Math.max(1, Math.floor(21 - intensity)) === 0) {
        particlesRef.current.push({
          x: 0,
          y: height / 2 + (Math.random() - 0.5) * 50,
          speed: 5 + (750 - wavelength) / 50,
          amp: 10 + (wavelength / 20),
          freq: 0.05 + (750 - wavelength) / 2000,
          phase: frame * 0.1
        });
      }

      const color = getSpectralColor(wavelength);
      const energyFactor = (800 - wavelength) / 10; 

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        
        p.x += p.speed;
        const currentY = p.y + p.amp * Math.sin(p.freq * p.x - p.phase);

        // Draw Particle
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, currentY, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw Wave Trail
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for(let j=0; j<20; j++) {
            const trailX = p.x - j*2;
            const trailY = p.y + p.amp * Math.sin(p.freq * trailX - p.phase);
            if(j===0) ctx.moveTo(trailX, trailY);
            else ctx.lineTo(trailX, trailY);
        }
        ctx.stroke();

        // Collision or Off-screen
        if (p.x >= targetX) {
            targetHeatRef.current += energyFactor;
            particlesRef.current.splice(i, 1);
            
            // Flash
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(targetX, currentY, energyFactor/2, 0, Math.PI * 2);
            ctx.fill();
        } else if (p.x > width) {
            particlesRef.current.splice(i, 1);
        }
      }

      frame++;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []); // FIX: Empty dependency array ensures loop runs only once

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// --- 5. Controls ---
const RenderControls = ({ values, setValue }: { values: PhotonState, setValue: any }) => {
    
    const energyEV = (1240 / values.wavelength).toFixed(2);
    const momentumUnits = (1000 / values.wavelength).toFixed(2);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto items-end">
            
            {/* Wavelength Slider */}
            <div className="space-y-3 group col-span-1 md:col-span-2">
                <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-blue-400 transition-colors">
                        Wavelength (<span style={{ fontFamily: 'Times New Roman, serif', fontStyle: 'italic' }}>λ</span>)
                    </label>
                    <div className="bg-zinc-800 px-3 py-1 rounded border border-zinc-700 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getSpectralColor(values.wavelength) }}></div>
                        <span className="text-sm font-mono text-blue-400 font-bold">{values.wavelength} <span className="text-zinc-500 text-xs">nm</span></span>
                    </div>
                </div>
                <input 
                    type="range" min="380" max="780" step="10"
                    value={values.wavelength}
                    onChange={(e) => setValue('wavelength', parseFloat(e.target.value))}
                    className="glow-range"
                    style={{ '--range-color': getSpectralColor(values.wavelength) } as any}
                />
                <div className="flex justify-between text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                    <span>UV/Violet (High E)</span>
                    <span>Green</span>
                    <span>Red/IR (Low E)</span>
                </div>
            </div>

            {/* Intensity Slider */}
            <div className="space-y-3 group col-span-1">
                <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400 transition-colors">Intensity</label>
                    <div className="bg-zinc-800 px-3 py-1 rounded border border-zinc-700">
                        <span className="text-sm font-mono text-green-400 font-bold">{values.intensity}</span>
                    </div>
                </div>
                <input 
                    type="range" min="1" max="20" step="1"
                    value={values.intensity}
                    onChange={(e) => setValue('intensity', parseFloat(e.target.value))}
                    className="glow-range"
                />
            </div>

            {/* Live Stats Display */}
            <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800 grid grid-cols-2 gap-4">
                <div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <FaBolt className="text-yellow-500" /> Energy (eV)
                    </div>
                    <div className="text-xl font-mono text-white font-bold">
                        {energyEV}
                    </div>
                </div>
                <div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <FaWeightHanging className="text-blue-500" /> Momentum
                    </div>
                    <div className="text-xl font-mono text-white font-bold">
                        {momentumUnits}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 6. Export ---
export const SIMULATION_21 = {
    title: 'Photon Gun: Energy & Momentum',
    initialValues: { wavelength: 600, intensity: 5 },
    achievements: achievements,
    renderSimulation: ({ values }: { values: PhotonState }) => (
        <PhotonCanvas values={values} />
    ),
    renderControls: (props: any) => <RenderControls {...props} />
};