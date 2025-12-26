import React, { useEffect, useRef } from 'react';
import { type Achievement } from "../../components/SimulationEngine";

// --- 1. Types & State ---

interface PhotoElectricState {
  intensity: number;    // 0 to 100 (How many photons)
  wavelength: number;   // 200nm (UV) to 800nm (IR) - (Color/Energy)
  workFunction: number; // 2.0eV to 6.0eV (How tightly the metal holds electrons)
  voltage: number;      // -5V to +5V (Retarding or Accelerating potential)
}

// Physics Constants for visual simulation
const HC_CONST = 1240; // Planck's constant approximation for eV-nm

// --- 2. Achievements (Gamified) ---

const achievements: Achievement<PhotoElectricState>[] = [
  {
    id: 'first-spark',
    title: 'Let There Be Light',
    description: 'Successfully eject an electron from the metal plate.',
    condition: (s) => {
      const energy = HC_CONST / s.wavelength;
      return s.intensity > 0 && energy > s.workFunction;
    }
  },
  {
    id: 'cheap-skate',
    title: 'Insufficient Funds',
    description: 'Try to use low-energy Red light (>700nm) on a tough metal (>3eV).',
    condition: (s) => s.wavelength > 700 && s.workFunction > 3.0 && s.intensity > 50
  },
  {
    id: 'uv-catastrophe',
    title: 'UV Overload',
    description: 'Use high-energy UV light (< 300nm) to rip electrons off even the toughest metal.',
    condition: (s) => s.wavelength < 300 && s.workFunction > 5.0
  },
  {
    id: 'stopping-potential',
    title: 'The Brakes',
    description: 'Eject electrons, but use negative Voltage (<-2V) to push them back.',
    condition: (s) => {
      const energy = HC_CONST / s.wavelength;
      const kineticEnergy = energy - s.workFunction;
      // If kinetic energy is positive (ejection) but voltage is strong enough to stop it
      return (
        energy > s.workFunction && 
        s.voltage < -2 && 
        kineticEnergy < Math.abs(s.voltage)
      );
    }
  },
  {
    id: 'flood-gate',
    title: 'The Flood',
    description: 'Max intensity and positive voltage to create a massive current.',
    condition: (s) => s.intensity > 90 && s.voltage > 3 && (HC_CONST / s.wavelength) > s.workFunction
  }
];

// --- 3. Canvas Renderer ---

const PhotoElectricCanvas = ({ values }: { values: PhotoElectricState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Particle Systems
  const photons = useRef<any[]>([]);
  const electrons = useRef<any[]>([]);
  
  // Ref for values to allow animation loop to read fresh state without restarting
  const valuesRef = useRef(values);
  useEffect(() => { valuesRef.current = values; }, [values]);

  // Helper: Wavelength to Color
  const getWavelengthColor = (nm: number) => {
    if (nm < 380) return '#e0e7ff'; // UV (White/Blueish)
    if (nm < 450) return '#8b5cf6'; // Violet
    if (nm < 495) return '#3b82f6'; // Blue
    if (nm < 570) return '#22c55e'; // Green
    if (nm < 590) return '#eab308'; // Yellow
    if (nm < 620) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0, height = 0;

    const animate = () => {
      // 1. Resize & Clear
      const parent = canvas.parentElement;
      if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
        width = parent.clientWidth;
        height = parent.clientHeight;
        canvas.width = width;
        canvas.height = height;
      }

      const currentValues = valuesRef.current;

      ctx.fillStyle = '#09090b'; // Zinc-950
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Apparatus
      const plateX = width * 0.2;
      const collectorX = width * 0.8;
      const plateH = height * 0.6;
      const plateY = (height - plateH) / 2;

      // Draw Voltage Field Indicator (The "Atmosphere" between plates)
      if (currentValues.voltage !== 0) {
        ctx.globalAlpha = 0.15;
        // Green for accelerating (pulling right), Red for braking (pushing left)
        ctx.fillStyle = currentValues.voltage > 0 ? '#22c55e' : '#ef4444'; 
        ctx.fillRect(plateX + 10, plateY, collectorX - plateX - 10, plateH);
        ctx.globalAlpha = 1.0;
        
        // Field Arrows
        ctx.fillStyle = currentValues.voltage > 0 ? '#22c55e' : '#ef4444';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        const arrow = currentValues.voltage > 0 ? '>>> E-FIELD >>>' : '<<< E-FIELD <<<';
        ctx.fillText(arrow, (plateX + collectorX)/2, plateY - 20);
      }

      // The Metal Plate (Cathode)
      ctx.fillStyle = '#71717a'; // Zinc-500
      ctx.fillRect(plateX, plateY, 15, plateH);
      // Label
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`METAL`, plateX + 7, plateY + plateH + 15);
      
      // The Collector Plate (Anode)
      ctx.fillStyle = '#3f3f46';
      ctx.fillRect(collectorX, plateY, 15, plateH);
      ctx.fillText(`COLLECTOR`, collectorX + 7, plateY + plateH + 15);


      // 3. Logic: Spawn Photons
      // Probability of spawn based on intensity
      if (Math.random() * 100 < currentValues.intensity) {
        photons.current.push({
          x: 0,
          y: plateY + Math.random() * plateH,
          vx: 8 + Math.random() * 4, // Fast visuals
          color: getWavelengthColor(currentValues.wavelength)
        });
      }

      // 4. Update & Draw Photons
      const photonEnergy = HC_CONST / currentValues.wavelength; // eV
      
      for (let i = photons.current.length - 1; i >= 0; i--) {
        const p = photons.current[i];
        p.x += p.vx;

        // Draw Photon
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Collision with Plate
        if (p.x >= plateX) {
          // Check Physics: Does photon have enough energy?
          if (photonEnergy > currentValues.workFunction) {
            // EJECT ELECTRON!
            // Kinetic Energy = Photon Energy - Work Function
            const initialKE = photonEnergy - currentValues.workFunction; 
            
            // Visual speed scaling
            const vx = Math.sqrt(initialKE) * 3; 

            electrons.current.push({
              x: plateX + 16, // Spawn just outside plate
              y: p.y,
              vx: vx,
              vy: (Math.random() - 0.5) * 1.5, // Slight spread
              initialKE: initialKE
            });
          }
          photons.current.splice(i, 1); // Photon absorbed
        }
      }

      // 5. Update & Draw Electrons
      ctx.fillStyle = '#22d3ee'; // Cyan
      ctx.shadowColor = '#22d3ee';
      
      for (let i = electrons.current.length - 1; i >= 0; i--) {
        const e = electrons.current[i];
        
        // Apply Voltage Acceleration/Deceleration
        // F = qE. Positive voltage pulls electron right (+vx). Negative pushes left (-vx).
        const acceleration = currentValues.voltage * 0.1; 
        e.vx += acceleration;

        e.x += e.vx;
        e.y += e.vy;

        // Draw Electron
        ctx.beginPath();
        ctx.shadowBlur = 5;
        ctx.arc(e.x, e.y, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Bounds check
        const hitCollector = e.x >= collectorX;
        const hitBackPlate = e.x <= plateX && e.vx < 0; // Turned around by negative voltage
        const wentOffScreen = e.y < 0 || e.y > height;

        if (hitCollector) {
            // Flash on collector
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(e.x, e.y, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#22d3ee'; // Reset color
            electrons.current.splice(i, 1);
        } else if (hitBackPlate || wentOffScreen) {
            electrons.current.splice(i, 1);
        }
      }
      ctx.shadowBlur = 0;

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []); // Dependency array empty = Stable Animation Loop

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// --- 4. Controls Component ---

const Controls = ({ values, setValue }: { values: PhotoElectricState, setValue: any }) => {
  const energy = HC_CONST / values.wavelength;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      
      {/* Wavelength (Color) */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-xs font-bold text-zinc-400 uppercase">Light Source</label>
          <span className="text-xs font-mono text-white">{values.wavelength.toFixed(0)} nm</span>
        </div>
        <input 
          type="range" min="200" max="800" step="10"
          value={values.wavelength}
          onChange={(e) => setValue('wavelength', parseFloat(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer outline-none"
          style={{ background: 'linear-gradient(to right, #b91c1c, #eab308, #22c55e, #3b82f6, #8b5cf6, #ffffff)' }}
        />
        <div className="text-xs text-zinc-500 flex justify-between">
            <span>Photon Energy:</span>
            <span className="text-blue-400 font-bold">{energy.toFixed(2)} eV</span>
        </div>
      </div>

      {/* Intensity */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-xs font-bold text-zinc-400 uppercase">Intensity</label>
          <span className="text-xs font-mono text-white">{values.intensity.toFixed(0)}%</span>
        </div>
        <input 
          type="range" min="0" max="100" step="1"
          value={values.intensity}
          onChange={(e) => setValue('intensity', parseFloat(e.target.value))}
          className="glow-range"
        />
        <div className="text-xs text-zinc-500 text-right">
          Quantity of photons
        </div>
      </div>

      {/* Work Function (Metal Type) */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-xs font-bold text-zinc-400 uppercase">Metal Work Function</label>
          <span className="text-xs font-mono text-white">{values.workFunction.toFixed(1)} eV</span>
        </div>
        <input 
          type="range" min="1.0" max="6.0" step="0.1"
          value={values.workFunction}
          onChange={(e) => setValue('workFunction', parseFloat(e.target.value))}
          className="glow-range"
          style={{ '--range-color': '#f97316' } as any}
        />
        <div className="text-xs text-zinc-500 flex justify-between">
          <span>Cost to escape:</span>
          <span className="text-orange-400 font-bold">{values.workFunction.toFixed(2)} eV</span>
        </div>
      </div>

      {/* Voltage */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-xs font-bold text-zinc-400 uppercase">Voltage (V)</label>
          <span className={`text-xs font-mono ${values.voltage < 0 ? 'text-red-400' : 'text-green-400'}`}>
            {values.voltage.toFixed(1)} V
          </span>
        </div>
        <input 
          type="range" min="-5" max="5" step="0.5"
          value={values.voltage}
          onChange={(e) => setValue('voltage', parseFloat(e.target.value))}
          className="glow-range"
          style={{ '--range-color': values.voltage < 0 ? '#ef4444' : '#22c55e' } as any}
        />
        <div className="text-xs text-zinc-500 text-right">
          {values.voltage < 0 ? "Stopping (Brakes)" : "Accelerating (Gas)"}
        </div>
      </div>
      
    </div>
  );
};

// --- 5. Export ---

export const SIMULATION_20 = {
  title: 'Photoelectric Effect: The Bouncer',
  initialValues: { 
    intensity: 0, 
    wavelength: 600, // Yellow-ish
    workFunction: 2.5, 
    voltage: 0 
  },
  achievements: achievements,
  renderSimulation: ({ values }: { values: PhotoElectricState }) => <PhotoElectricCanvas values={values} />,
  renderControls: Controls
};