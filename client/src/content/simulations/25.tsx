import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine';
import { FaBolt, FaSatelliteDish, FaAtom, FaBullseye } from 'react-icons/fa';

// --- 1. Interface ---
interface SimState {
  electronVoltage: number; // 20V to 100V
  crystalSpacing: number;  // 1.0Å to 4.0Å
  isFiring: boolean;
  detectorAngle: number;   // 0 to 90 degrees (relative to surface normal)
}

// --- 2. Achievements ---
const achievements: Achievement<SimState>[] = [
  {
    id: 'ignite-beam',
    title: 'Power On',
    description: 'Fire the electron gun.',
    condition: (s) => s.isFiring
  },
  {
    id: 'historical-match',
    title: 'The 1927 Discovery',
    description: 'Replicate the historic result: 54V and ~50° detector angle.',
    condition: (s) => s.isFiring && s.electronVoltage === 54 && s.detectorAngle >= 48 && s.detectorAngle <= 52
  },
  {
    id: 'high-energy',
    title: 'Short Wavelength',
    description: 'Crank voltage > 90V. Notice the interference lobes get thinner and closer.',
    condition: (s) => s.electronVoltage > 90 && s.isFiring
  },
  {
    id: 'blind-spot',
    title: 'Destructive Interference',
    description: 'Place the detector in a "dead zone" (Signal < 10%) while firing.',
    condition: (s) => {
        // Approximate calculation for logic check
        const lambda = 12.27 / Math.sqrt(s.electronVoltage);
        const rad = s.detectorAngle * (Math.PI / 180);
        const pathDiff = s.crystalSpacing * Math.sin(rad);
        const phase = (pathDiff / lambda) * 2 * Math.PI;
        const intensity = Math.pow(Math.cos(phase), 4);
        return s.isFiring && s.electronVoltage > 40 && s.detectorAngle > 20 && intensity < 0.1;
    }
  }
];

// --- 3. Canvas Component ---
const DavissonCanvas = ({ values }: { values: SimState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Refs for animation state (decoupled from React render cycle)
  const valuesRef = useRef(values);
  useEffect(() => { valuesRef.current = values; }, [values]);

  const particlesRef = useRef<any[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      // Resize Logic
      const parent = canvas.parentElement;
      if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;
      const crystalX = width * 0.5;

      // 1. Clear & Background
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      // Read latest values
      const { electronVoltage, crystalSpacing, isFiring, detectorAngle } = valuesRef.current;

      // --- PHYSICS CALCULATION ---
      // lambda (Å) approx 12.27 / sqrt(V)
      const wavelength = 12.27 / Math.sqrt(electronVoltage);
      
      // Bragg/Diffraction condition approx for surface: n*lambda = d * sin(theta)
      // We calculate intensity map for the polar plot
      const calculateIntensity = (deg: number) => {
        const rad = deg * (Math.PI / 180);
        const pathDiff = crystalSpacing * Math.sin(rad);
        const phase = (pathDiff / wavelength) * 2 * Math.PI;
        return Math.pow(Math.cos(phase), 4); 
      };

      // 2. Draw Crystal (Target)
      ctx.fillStyle = '#71717a';
      for(let i = -4; i <= 4; i++) {
          ctx.beginPath();
          ctx.arc(crystalX, centerY + (i * 20), 4, 0, Math.PI * 2);
          ctx.fill();
      }
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '10px monospace';
      ctx.fillText("Ni CRYSTAL", crystalX - 30, centerY + 100);

      // 3. Draw Gun (Source)
      ctx.fillStyle = '#3f3f46';
      ctx.fillRect(20, centerY - 10, 40, 20);
      ctx.fillStyle = '#ef4444'; // Hot filament
      ctx.fillRect(20, centerY - 2, 5, 4);

      // 4. Draw Detector (Movable Arc)
      const detectorRad = detectorAngle * (Math.PI / 180);
      const detDist = 120;
      
      // Detector visual position
      const visualAngle = Math.PI - detectorRad; // Mirror to left side
      const dX = crystalX + Math.cos(visualAngle) * detDist;
      const dY = centerY + Math.sin(visualAngle) * detDist;

      // Draw Arc Path
      ctx.beginPath();
      ctx.strokeStyle = '#27272a';
      ctx.setLineDash([5, 5]);
      ctx.arc(crystalX, centerY, detDist, Math.PI/2, 1.5 * Math.PI);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Detector Box
      const intensityAtDetector = calculateIntensity(detectorAngle);
      
      ctx.save();
      ctx.translate(dX, dY);
      ctx.rotate(visualAngle - Math.PI/2);
      ctx.fillStyle = intensityAtDetector > 0.8 ? '#4ade80' : '#1f2937';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.rect(-10, -10, 20, 20); // Detector head
      ctx.fill();
      ctx.stroke();
      
      // Detector Glow
      if (intensityAtDetector > 0.1 && isFiring) {
          ctx.shadowBlur = intensityAtDetector * 20;
          ctx.shadowColor = '#4ade80';
          ctx.fillStyle = `rgba(74, 222, 128, ${intensityAtDetector})`;
          ctx.fill();
          ctx.shadowBlur = 0;
      }
      ctx.restore();


      // 5. Draw Probability Cloud (Polar Plot Overlay)
      if (isFiring) {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(74, 222, 128, 0.3)';
          ctx.lineWidth = 2;
          for(let a = 0; a <= 90; a+=1) {
              const intensity = calculateIntensity(a);
              const r = 30 + (intensity * 100); // Radius scaling
              const rad = Math.PI - (a * Math.PI / 180);
              const pX = crystalX + Math.cos(rad) * r;
              const pY = centerY + Math.sin(rad) * r;
              if (a===0) ctx.moveTo(pX, pY);
              else ctx.lineTo(pX, pY);
          }
          ctx.stroke();
          
          // Mirror for bottom half (symmetry)
           ctx.beginPath();
           for(let a = 0; a <= 90; a+=1) {
              const intensity = calculateIntensity(a);
              const r = 30 + (intensity * 100);
              const rad = Math.PI + (a * Math.PI / 180); // Mirror
              const pX = crystalX + Math.cos(rad) * r;
              const pY = centerY + Math.sin(rad) * r;
              if (a===0) ctx.moveTo(pX, pY);
              else ctx.lineTo(pX, pY);
          }
          ctx.stroke();
      }

      // 6. Particle System
      // Incident Beam
      if (isFiring) {
          if (Math.random() > 0.5) {
              particlesRef.current.push({
                  x: 60, y: centerY, vx: 5 + (electronVoltage/20), vy: 0, 
                  type: 'incident', life: 100
              });
          }
      }

      // Update Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          p.x += p.vx;
          p.y += p.vy;
          
          ctx.fillStyle = '#60a5fa'; // Blue electrons
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          ctx.fill();

          // Hit Crystal Logic
          if (p.type === 'incident' && p.x >= crystalX) {
              // SCATTER!
              p.type = 'scattered';
              p.life = 60;
              
              // Determine scatter angle based on probability distribution
              let validAngle = false;
              let angle = 0;
              let attempts = 0;
              while(!validAngle && attempts < 5) {
                  angle = (Math.random() * 180) - 90; // -90 to 90 degrees
                  const prob = calculateIntensity(Math.abs(angle));
                  if (Math.random() < prob) validAngle = true;
                  attempts++;
              }
              const rad = Math.PI - (angle * Math.PI / 180); // Shoot leftwards
              const speed = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
              p.vx = Math.cos(rad) * speed;
              p.vy = Math.sin(rad) * speed;
              p.x = crystalX; // Reset to center
          }

          p.life--;
          if (p.life <= 0 || p.x < 0 || p.y < 0 || p.y > height) {
              particlesRef.current.splice(i, 1);
          }
      }

      requestAnimationFrame(animate);
    };

    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// --- 4. Controls ---
const RenderControls = ({ values, setValue }: { values: SimState, setValue: any }) => {
    
    // Physics Calc for Display
    // lambda = h / p = 12.27 / sqrt(V)
    const lambda = (12.27 / Math.sqrt(values.electronVoltage)).toFixed(2);
    
    // Calculate intensity for the detector gauge
    const calculateGaugeIntensity = (deg: number) => {
        const rad = deg * (Math.PI / 180);
        const pathDiff = values.crystalSpacing * Math.sin(rad);
        const l = 12.27 / Math.sqrt(values.electronVoltage);
        const phase = (pathDiff / l) * 2 * Math.PI;
        return Math.pow(Math.cos(phase), 4);
    };
    const intensity = calculateGaugeIntensity(values.detectorAngle);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto items-end">
            
            {/* Voltage Control */}
            <div className="space-y-3 group">
                <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <FaBolt className="text-yellow-500" /> Voltage
                    </label>
                    <div className="bg-zinc-800 px-3 py-1 rounded border border-zinc-700">
                        <span className="text-sm font-mono text-yellow-400 font-bold">{values.electronVoltage}V</span>
                    </div>
                </div>
                <input 
                    type="range" min="20" max="100" step="1"
                    value={values.electronVoltage}
                    onChange={(e) => setValue('electronVoltage', parseInt(e.target.value))}
                    className="glow-range"
                    style={{'--range-color': '#eab308'} as any}
                />
                <div className="text-[10px] text-zinc-500 flex justify-between">
                    <span>λ ≈ {lambda} Å</span>
                </div>
            </div>

            {/* Crystal Spacing */}
            <div className="space-y-3 group">
                <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <FaAtom className="text-blue-500" /> Lattice ($d$)
                    </label>
                    <div className="bg-zinc-800 px-3 py-1 rounded border border-zinc-700">
                        <span className="text-sm font-mono text-blue-400 font-bold">{values.crystalSpacing.toFixed(1)}Å</span>
                    </div>
                </div>
                <input 
                    type="range" min="1.0" max="3.0" step="0.1"
                    value={values.crystalSpacing}
                    onChange={(e) => setValue('crystalSpacing', parseFloat(e.target.value))}
                    className="glow-range"
                    style={{'--range-color': '#3b82f6'} as any}
                />
            </div>

            {/* Detector Angle */}
            <div className="space-y-3 group">
                <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <FaSatelliteDish className="text-green-500" /> Detector
                    </label>
                    <div className="bg-zinc-800 px-3 py-1 rounded border border-zinc-700">
                        <span className="text-sm font-mono text-green-400 font-bold">{values.detectorAngle}°</span>
                    </div>
                </div>
                <input 
                    type="range" min="0" max="90" step="1"
                    value={values.detectorAngle}
                    onChange={(e) => setValue('detectorAngle', parseInt(e.target.value))}
                    className="glow-range"
                    style={{'--range-color': '#22c55e'} as any}
                />
            </div>

            {/* Intensity Gauge & Fire Button */}
            <div className="flex flex-col gap-4">
                <div className="bg-black/40 rounded-lg p-3 border border-zinc-800 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Signal Strength</span>
                    <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-zinc-700 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-green-500 transition-all duration-100" 
                                style={{ width: `${intensity * 100}%`, opacity: values.isFiring ? 1 : 0.2 }}
                            ></div>
                        </div>
                        <span className={`text-xs font-mono font-bold ${intensity > 0.8 ? 'text-green-400' : 'text-zinc-600'}`}>
                            {(intensity * 100).toFixed(0)}%
                        </span>
                    </div>
                </div>

                <button 
                    onClick={() => setValue('isFiring', !values.isFiring)}
                    className={`
                        w-full py-3 rounded-lg font-bold text-xs uppercase transition-all duration-300 border-2
                        ${values.isFiring 
                            ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                            : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-white hover:border-zinc-500'
                        }
                    `}
                >
                    {values.isFiring ? 'Stop Beam' : 'Fire Electron Gun'}
                </button>
            </div>

        </div>
    );
};

// --- 5. Export ---
export const SIMULATION_25 = {
  title: 'Davisson–Germer Experiment',
  initialValues: { electronVoltage: 54, crystalSpacing: 2.15, isFiring: false, detectorAngle: 50 },
  achievements: achievements,
  renderSimulation: ({ values }: { values: SimState }) => (
    <div className="w-full h-full relative">
       {/* Experimental Context Overlay */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none opacity-50">
         <div className="text-[10px] text-zinc-500 font-mono">
            TARGET: Nickel Crystal<br/>
            PLANES: Surface (Reflection)<br/>
         </div>
      </div>
      
      <DavissonCanvas values={values} />
      
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center z-10 bg-black/80 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md pointer-events-none">
        <p className="text-zinc-400 text-[10px] uppercase tracking-wider">
           Electron Wave Nature Verification
        </p>
      </div>
    </div>
  ),
  renderControls: (props: any) => <RenderControls {...props} />
};