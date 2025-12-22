import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine';

// 1. Interface
interface SimState {
  electronVoltage: number; // Accelerating voltage (determines speed/wavelength)
  crystalSpacing: number;  // The gap between atoms in the nickel target
  isFiring: boolean;
  detectorAngle: number;   // The angle we are looking at to find the "peak"
}

// 2. Achievements
const achievements: Achievement<SimState>[] = [
  {
    id: 'ignite-the-beam',
    title: 'Electronic Spark',
    description: 'Turn on the electron gun. Let the wavy particles fly!',
    condition: (s) => s.isFiring
  },
  {
    id: 'first-peak',
    title: 'The Sweet Spot',
    description: 'Find a constructive interference peak at a specific angle (Angle > 40).',
    condition: (s) => s.isFiring && s.detectorAngle > 45 && s.detectorAngle < 55 && s.electronVoltage > 50
  },
  {
    id: 'voltage-crank',
    title: 'High Speed Ripples',
    description: 'Set voltage to max. Notice how the "wave" stripes get much tighter.',
    condition: (s) => s.electronVoltage >= 90
  },
  {
    id: 'atomic-tinkerer',
    title: 'Atomic Tinkerer',
    description: 'Change the spacing of the atoms to the minimum value.',
    condition: (s) => s.crystalSpacing <= 1.2
  },
  {
    id: 'quantum-proof',
    title: 'Accidental Discovery',
    description: 'Match the historical 54V setting to prove electrons are waves.',
    condition: (s) => s.electronVoltage === 54 && s.isFiring
  }
];

// 3. Canvas Component
const DavissonCanvas = ({ values }: { values: SimState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<{ x: number, y: number, alpha: number }[]>([]);

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

      const crystalX = width * 0.7;
      const centerY = height / 2;

      // 1. Draw Nickel Crystal (The "Picket Fence")
      const spacing = values.crystalSpacing * 15;
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(crystalX, centerY + i * spacing, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#3f3f46';
        ctx.fill();
        ctx.strokeStyle = '#52525b';
        ctx.stroke();
      }

      // 2. Physics: Electron Wavelength λ = sqrt(150 / V) in Ångströms (roughly)
      const wavelength = Math.sqrt(150 / values.electronVoltage) * 10;
      const d = values.crystalSpacing * 10;
      
      // 3. Generate Electrons
      if (values.isFiring) {
        // Incoming Beam
        ctx.beginPath();
        ctx.strokeStyle = '#4ade80';
        ctx.setLineDash([5, 10]);
        ctx.moveTo(0, centerY);
        ctx.lineTo(crystalX, centerY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Diffraction Pattern (The interference visualization)
        // Intensity I ∝ cos^2( (pi * d * sin(theta)) / lambda )
        ctx.save();
        ctx.translate(crystalX, centerY);
        ctx.rotate(Math.PI); // Bounce back

        ctx.beginPath();
        ctx.strokeStyle = 'rgba(74, 222, 128, 0.2)';
        ctx.moveTo(0, 0);

        for (let angle = -Math.PI / 2; angle < Math.PI / 2; angle += 0.05) {
          const theta = Math.abs(angle);
          const interference = Math.pow(Math.cos((Math.PI * d * Math.sin(theta)) / (wavelength * 0.2)), 2);
          const r = 50 + interference * 150;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Highlight current detector angle
        const detRad = (values.detectorAngle - 90) * (Math.PI / 180);
        const interferenceAtAngle = Math.pow(Math.cos((Math.PI * d * Math.sin(Math.abs(detRad))) / (wavelength * 0.2)), 2);
        
        ctx.beginPath();
        ctx.strokeStyle = interferenceAtAngle > 0.8 ? '#4ade80' : '#166534';
        ctx.lineWidth = 3;
        const lineLen = 60 + interferenceAtAngle * 140;
        ctx.moveTo(0,0);
        ctx.lineTo(Math.cos(detRad) * lineLen, Math.sin(detRad) * lineLen);
        ctx.stroke();
        
        ctx.restore();
      }

      // 4. Draw labels
      ctx.fillStyle = '#71717a';
      ctx.font = '12px monospace';
      ctx.fillText(`Electron Wavelength (λ): ~${(wavelength/10).toFixed(2)}Å`, 20, 30);
      ctx.fillText(`Diffraction Strength: ${values.isFiring ? "ACTIVE" : "OFF"}`, 20, 50);

      requestAnimationFrame(animate);
    };

    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [values]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

// 4. Main Export
export const SIMULATION_25 = {
  title: "Davisson–Germer Experiment",
  initialValues: { electronVoltage: 54, crystalSpacing: 2.1, isFiring: false, detectorAngle: 50 },
  achievements: achievements,
  renderSimulation: ({ values }: { values: SimState }) => (
    <div className="w-full h-full relative">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center z-10 bg-black/60 p-3 rounded-lg border border-white/10 backdrop-blur-md">
        <p className="text-zinc-300 text-xs">
          Fire electrons at the crystal. If they were just balls, they'd scatter randomly. <br/>
          Instead, they form a <b>pattern</b>. Adjust Voltage to change the "Wave" size!
        </p>
      </div>
      <DavissonCanvas values={values} />
    </div>
  ),
  renderControls: ({ values, setValue }: { values: SimState, setValue: any }) => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
      
      {/* Gun Voltage */}
      <div className="space-y-3 group">
        <div className="flex justify-between items-end">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Gun Voltage (V)</label>
          <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
            <span className="text-sm font-mono text-green-400 font-bold">{values.electronVoltage}V</span>
          </div>
        </div>
        <input 
          type="range" min="20" max="100" step="1"
          value={values.electronVoltage}
          onChange={(e) => setValue('electronVoltage', parseInt(e.target.value))}
          className="glow-range"
        />
      </div>

      {/* Crystal Spacing */}
      <div className="space-y-3 group">
        <div className="flex justify-between items-end">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Atom Spacing (d)</label>
          <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
            <span className="text-sm font-mono text-blue-400 font-bold">{values.crystalSpacing.toFixed(1)}Å</span>
          </div>
        </div>
        <input 
          type="range" min="1" max="4" step="0.1"
          value={values.crystalSpacing}
          onChange={(e) => setValue('crystalSpacing', parseFloat(e.target.value))}
          className="glow-range"
        />
      </div>

      {/* Detector Angle */}
      <div className="space-y-3 group">
        <div className="flex justify-between items-end">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Detector Angle</label>
          <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
            <span className="text-sm font-mono text-yellow-400 font-bold">{values.detectorAngle}°</span>
          </div>
        </div>
        <input 
          type="range" min="0" max="180" step="1"
          value={values.detectorAngle}
          onChange={(e) => setValue('detectorAngle', parseInt(e.target.value))}
          className="glow-range"
        />
      </div>

      {/* Power Button */}
      <div className="flex flex-col justify-center">
        <button 
          onClick={() => setValue('isFiring', !values.isFiring)}
          className={`px-4 py-3 rounded-lg font-bold text-xs uppercase transition-all duration-300 border-2 ${
            values.isFiring 
            ? 'bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.3)]' 
            : 'bg-zinc-800 border-zinc-700 text-zinc-500'
          }`}
        >
          {values.isFiring ? 'Cease Fire' : 'Fire Electron Gun'}
        </button>
      </div>

    </div>
  )
};