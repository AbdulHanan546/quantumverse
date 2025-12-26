import React, { useEffect, useRef } from 'react';
import { type Achievement } from '../../components/SimulationEngine';
import { FaVolumeUp, FaRulerHorizontal, FaBolt } from 'react-icons/fa'; // Assuming you have react-icons or similar, if not, standard text works

// --- 1. Interface ---
interface EnergyState {
  sourceAmplitude: number; // How loud the speaker is (A)
  frequency: number;       // Pitch (f)
  observerDistance: number; // How far away the "Ear" is (r)
  showParticles: boolean;   // Toggle for particle view vs wave view
}

// --- 2. Achievements ---
const achievements: Achievement<EnergyState>[] = [
  {
    id: 'library-mode',
    title: 'Library Mode',
    description: 'Keep it quiet. Source Amplitude below 10.',
    condition: (s) => s.sourceAmplitude < 10 && s.sourceAmplitude > 0
  },
  {
    id: 'ear-bleed',
    title: 'Eardrum Destroyer',
    description: 'Max volume (Amp > 90) while standing right next to the speaker (Dist < 10).',
    condition: (s) => s.sourceAmplitude > 90 && s.observerDistance < 10
  },
  {
    id: 'safe-zone',
    title: 'Social Distancing',
    description: 'Move far away (Dist > 150) to escape the noise.',
    condition: (s) => s.observerDistance > 150
  },
  {
    id: 'energy-crisis',
    title: 'Energy Waster',
    description: 'High Frequency + High Amplitude. Look at that power usage!',
    condition: (s) => s.sourceAmplitude > 80 && s.frequency > 8
  },
  {
    id: 'total-silence',
    title: 'The Void',
    description: 'Turn the amplitude to 0. True silence.',
    condition: (s) => s.sourceAmplitude === 0
  }
];

// --- 3. Canvas Component ---
const EnergyCanvas = ({ values }: { values: EnergyState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const timeRef = useRef<number>(0);
  const valuesRef = useRef(values);

  useEffect(() => { valuesRef.current = values; }, [values]);

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

      const { sourceAmplitude, frequency, observerDistance } = valuesRef.current;
      const centerY = height / 2;
      
      // Physics Constants
      timeRef.current += frequency * 0.05;
      
      // Clear
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      // --- 1. Draw The Source (The Speaker) ---
      const speakerX = 50;
      // The speaker cone vibrates based on current time
      const vibration = Math.sin(timeRef.current) * (sourceAmplitude / 5);
      
      ctx.fillStyle = '#27272a';
      ctx.fillRect(0, centerY - 60, speakerX, 120); // Box
      
      // Cone
      ctx.beginPath();
      ctx.moveTo(speakerX, centerY - 50);
      ctx.lineTo(speakerX + 20 + vibration, centerY - 30);
      ctx.lineTo(speakerX + 20 + vibration, centerY + 30);
      ctx.lineTo(speakerX, centerY + 50);
      ctx.closePath();
      ctx.fillStyle = '#52525b';
      ctx.fill();
      ctx.stroke();

      // --- 2. Draw The Wave (Decaying over distance) ---
      // We simulate spherical spreading in 2D by reducing Amp by 1/distance
      
      ctx.beginPath();
      ctx.lineWidth = 3;
      
      // We'll change color based on intensity at that point
      // High Intensity = Red/Orange, Low = Blue/Fade
      
      for (let x = speakerX + 20; x < width; x+=2) {
        const distFromSource = x - speakerX;
        
        // Damping factor (fake Inverse Square Law for visuals)
        // We add a base value so it doesn't divide by zero or disappear instantly
        const damping = 100 / (100 + distFromSource * 0.8); 
        
        const currentAmp = sourceAmplitude * damping;
        const waveY = centerY + Math.sin((x * 0.05) - timeRef.current) * currentAmp;

        // Color Gradient Logic
        const energyLevel = (currentAmp * frequency) / 50; // heuristic for color
        const r = Math.min(255, energyLevel * 200);
        const g = Math.max(0, 200 - (energyLevel * 100));
        const b = 255 - r;
        
        ctx.strokeStyle = `rgb(${r},${g},${b})`;
        ctx.beginPath();
        // Drawing segment by segment to allow gradient color
        const prevX = x - 2;
        const prevDist = prevX - speakerX;
        const prevDamp = 100 / (100 + prevDist * 0.8);
        const prevAmp = sourceAmplitude * prevDamp;
        const prevY = centerY + Math.sin((prevX * 0.05) - timeRef.current) * prevAmp;
        
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, waveY);
        ctx.stroke();
      }

      // --- 3. Draw The Observer (Sensor/Ear) ---
      // Map observerDistance (0-200 slider) to screen coordinates
      // We map 0-200 slider to X pixels relative to speaker
      const sensorX = speakerX + 50 + (observerDistance * 3); 
      
      // Draw Line
      ctx.beginPath();
      ctx.strokeStyle = '#fff';
      ctx.setLineDash([5, 5]);
      ctx.moveTo(sensorX, 0);
      ctx.lineTo(sensorX, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Sensor Box
      ctx.fillStyle = '#fff';
      ctx.fillRect(sensorX - 10, centerY - 10, 20, 20);
      
      // Calculate Received Intensity
      // Intensity ~ (Amplitude^2)
      // Damped Amplitude at sensor:
      const sensorDistRaw = sensorX - speakerX;
      const sensorDamping = 100 / (100 + sensorDistRaw * 0.8);
      const receivedAmp = sourceAmplitude * sensorDamping;
      
      // Physics: Intensity is proportional to Amp^2 * Freq^2
      // We scale it down for display
      const receivedIntensity = (Math.pow(receivedAmp, 2) * Math.pow(frequency, 2)) / 1000;

      // --- 4. HUD (Heads Up Display) ---
      
      // Source Power Display (Left)
      const sourcePower = (Math.pow(sourceAmplitude, 2) * Math.pow(frequency, 2)) / 1000;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`SOURCE POWER`, 20, 30);
      
      // Bar for Source
      ctx.fillStyle = '#3f3f46';
      ctx.fillRect(20, 40, 150, 10);
      ctx.fillStyle = '#ef4444'; // Red for source
      ctx.fillRect(20, 40, Math.min(150, sourcePower), 10);

      // Received Intensity Display (At Sensor)
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.fillText(`RECEIVED INTENSITY`, sensorX, centerY - 80);
      ctx.fillText(`${receivedIntensity.toFixed(0)} units`, sensorX, centerY - 60);

      // Visual Circle at sensor showing how much it's shaking
      ctx.beginPath();
      ctx.arc(sensorX, centerY - 40, receivedIntensity/50, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(74, 222, 128, ${Math.min(1, receivedIntensity/500)})`; // Green glow
      ctx.fill();

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// --- 4. Controls Component ---
const renderControls = ({ values, setValue }: { 
    values: EnergyState, 
    setValue: (k: keyof EnergyState, v: any) => void 
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
    
    {/* Source Amplitude */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-red-400 transition-colors">
            Source Loudness (Amp)
        </label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
          <span className="text-sm font-mono text-red-400 font-bold">
            {values.sourceAmplitude.toFixed(0)}
          </span>
        </div>
      </div>
      <input 
        type="range" min="0" max="100" step="1"
        value={values.sourceAmplitude}
        onChange={(e) => setValue('sourceAmplitude', parseFloat(e.target.value))}
        className="glow-range accent-red-500"
      />
      <p className="text-[10px] text-zinc-600">
          Warning: Energy increases by Square of Amplitude! (2x Amp = 4x Energy)
      </p>
    </div>

    {/* Frequency */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-blue-400 transition-colors">
            Pitch (Frequency)
        </label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
          <span className="text-sm font-mono text-blue-400 font-bold">
            {values.frequency.toFixed(1)} <span className="text-zinc-500 text-xs">Hz</span>
          </span>
        </div>
      </div>
      <input 
        type="range" min="1" max="10" step="0.5"
        value={values.frequency}
        onChange={(e) => setValue('frequency', parseFloat(e.target.value))}
        className="glow-range accent-blue-500"
      />
    </div>

    {/* Observer Distance */}
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400 transition-colors">
            Distance (Observer)
        </label>
        <div className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
          <span className="text-sm font-mono text-green-400 font-bold">
            {values.observerDistance.toFixed(0)} <span className="text-zinc-500 text-xs">m</span>
          </span>
        </div>
      </div>
      <input 
        type="range" min="0" max="200" step="1"
        value={values.observerDistance}
        onChange={(e) => setValue('observerDistance', parseFloat(e.target.value))}
        className="glow-range accent-green-500"
      />
      <p className="text-[10px] text-zinc-600">
          Move the sensor away to see Intensity drop.
      </p>
    </div>

  </div>
);

// --- 5. Export ---
export const SIMULATION_15 = {
    title: 'The Decibel Destroyer',
    initialValues: { sourceAmplitude: 50, frequency: 3, observerDistance: 50, showParticles: false },
    achievements: achievements,
    renderSimulation: ({ values }: { values: EnergyState }) => (
        <EnergyCanvas values={values} />
    ),
    renderControls: renderControls
};