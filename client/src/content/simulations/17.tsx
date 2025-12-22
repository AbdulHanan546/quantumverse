import React, { useRef, useEffect } from 'react';
import { type Achievement } from '../../components/SimulationEngine';

// 1. Interface
// T is Temperature in Kelvin
// We'll simulate the "Peak Wavelength" (color) shifting
interface SimState {
  temperature: number; // in Kelvin
  showCatastrophe: boolean; // Toggle the "broken" math line
}

// 2. Achievements
const achievements: Achievement<SimState>[] = [
  {
    id: 'room-temp',
    title: 'Just Chillin\'',
    description: 'Set temperature below 300K (Room Temp). Boring, invisible IR light.',
    condition: (s) => s.temperature < 300
  },
  {
    id: 'red-hot',
    title: 'Red Hot Poker',
    description: 'Heat it up until it glows Red (around 1000K).',
    condition: (s) => s.temperature > 900 && s.temperature < 1500
  },
  {
    id: 'sun-surface',
    title: 'Solar Power',
    description: 'Match the surface temperature of the Sun (~5800K).',
    condition: (s) => s.temperature > 5500 && s.temperature < 6000
  },
  {
    id: 'blue-giant',
    title: 'Blue Giant',
    description: 'Go super nova! Exceed 10,000K.',
    condition: (s) => s.temperature > 10000
  },
  {
    id: 'catastrophe-witness',
    title: 'Witness the Disaster',
    description: 'Turn on the "Classical Math" line to see the infinite energy bug.',
    condition: (s) => s.showCatastrophe === true
  }
];

// 3. Canvas Renderer
const BlackbodyCanvas = ({ values }: { values: SimState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;

    const render = () => {
        // Resize logic
        const parent = canvas.parentElement;
        if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight;
        }

        const { width: w, height: h } = canvas;
        const { temperature, showCatastrophe } = values;

        ctx.clearRect(0, 0, w, h);

        // --- BACKGROUND GRADIENT (Visualizing the "Color") ---
        // Calculate approx RGB from temperature
        // Simple heuristic for visualization
        let r=0, g=0, b=0;
        if(temperature < 1000) { r=255; g=temperature/10; b=0; } // Reddish
        else if(temperature < 4000) { r=255; g=150 + (temperature/100); b=temperature/50; } // Orange/Yellow
        else if(temperature < 7000) { r=255; g=255; b=255; } // White
        else { r=200; g=200; b=255; } // Blueish
        
        // Clamp values
        r = Math.min(255, Math.max(0, r));
        g = Math.min(255, Math.max(0, g));
        b = Math.min(255, Math.max(0, b));

        const bgGradient = ctx.createRadialGradient(w/2, h/2, 10, w/2, h/2, w/1.5);
        bgGradient.addColorStop(0, `rgba(${r},${g},${b}, 0.2)`);
        bgGradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0,0,w,h);

        // --- GRAPH SETUP ---
        const pad = 60;
        const startX = pad;
        const startY = h - pad;
        const graphW = w - pad * 2;
        const graphH = h - pad * 2;

        // Axes
        ctx.strokeStyle = '#52525b'; // zinc-600
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX, pad);
        ctx.lineTo(startX, startY);
        ctx.lineTo(w - pad, startY);
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#a1a1aa';
        ctx.font = '12px sans-serif';
        ctx.fillText("Brightness (Intensity)", startX + 10, pad + 10);
        ctx.fillText("Wavelength (nm)", w - pad - 100, startY + 20);
        
        // --- PLANCK CURVE (REALITY) ---
        // Formula: I(λ) ~ (1/λ^5) * (1 / (e^(hc/λkT) - 1))
        // We will fake it for visual simplicity: y = x^-5 / (e^(1/xT) - 1)
        
        ctx.beginPath();
        ctx.strokeStyle = `rgb(${r},${g},${b})`; // Curve matches temp color
        ctx.lineWidth = 4;
        
        // We iterate pixels across X (wavelength)
        // Let's map x=0 to x=width as Wavelength 100nm to 3000nm
        for(let px = 0; px < graphW; px+=2) {
            // Avoid division by zero at x=0
            if (px === 0) continue;

            // Normalized X (Wavelength)
            // Smaller X = UV/Blue (High Energy), Larger X = IR/Red (Low Energy)
            // But usually graphs show Wavelength increasing to right.
            // Let's stick to standard: Left = UV (short), Right = IR (long)
            const wavelength = 100 + (px / graphW) * 3000; // nm
            
            // Planck's Law simplified for rendering
            // C1 and C2 are constants to make it fit on screen
            const c1 = 5.0e8; // Scaling factor for height
            const c2 = 1.0e7; // Scaling factor for exponent
            
            const num = c1 / Math.pow(wavelength, 5);
            const den = Math.exp(c2 / (wavelength * temperature)) - 1;
            
            let intensity = num / den;
            
            // Scale intensity to fit canvas height comfortably
            // We need a dynamic scale because 12000K is WAY brighter than 300K
            // So we apply a log scale or a compressor just for visualization
            // Or we just let it go off screen to show how energetic it is?
            // Let's scale it down by a factor related to max temp to keep it somewhat contained but growing
            intensity = intensity * 0.005; 

            const py = startY - intensity;
            
            // Clamp to top of graph
            if (py < pad) {
                 // if it shoots off top, just lineTo the top
                 ctx.lineTo(startX + px, pad);
            } else {
                if (px === 2) ctx.moveTo(startX + px, py);
                else ctx.lineTo(startX + px, py);
            }
        }
        ctx.stroke();

        // --- RAYLEIGH-JEANS (CATASTROPHE) ---
        if (showCatastrophe) {
            ctx.beginPath();
            ctx.strokeStyle = '#ef4444'; // Red for danger
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);

            for(let px = 0; px < graphW; px+=2) {
                if (px === 0) continue;
                const wavelength = 100 + (px / graphW) * 3000;
                
                // Classical law: I ~ T / wavelength^4
                // It goes to infinity as wavelength gets small (left side)
                const intensity = (temperature * 50000000) / Math.pow(wavelength, 4);
                
                const py = startY - (intensity * 0.005);
                
                if (py < pad) {
                    // Don't draw lines connecting top to bottom if it breaks
                    // Just stop
                } else {
                    if (px === 2) ctx.moveTo(startX + px, py);
                    else ctx.lineTo(startX + px, py);
                }
            }
            ctx.stroke();
            ctx.setLineDash([]);
        }
        
        // --- PEAK INDICATOR ---
        // Wien's Displacement Law: λ_max = b / T
        // b ≈ 2.898 x 10^6 nm K
        const peakWavelength = 2898000 / temperature;
        const peakX = ((peakWavelength - 100) / 3000) * graphW;
        
        if (peakX > 0 && peakX < graphW) {
             ctx.fillStyle = '#fff';
             ctx.beginPath();
             ctx.arc(startX + peakX, startY + 10, 4, 0, Math.PI*2);
             ctx.fill();
             ctx.font = '10px monospace';
             ctx.fillText(`${Math.round(peakWavelength)}nm`, startX + peakX - 20, startY + 25);
        }

        animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [values]);

  return <canvas ref={canvasRef} className="block w-full h-full" />;
};

// 4. Controls
const renderControls = ({ values, setValue }: { values: SimState, setValue: any }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">
        
        {/* Temperature Slider */}
        <div className="space-y-4 group">
            <div className="flex justify-between items-end">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-green-400 transition-colors">
                    Temperature (Kelvin)
                </label>
                <div className="bg-zinc-800 px-3 py-1 rounded border border-zinc-700 flex items-center gap-2">
                    <span className="text-xl font-mono text-white font-bold">{values.temperature} K</span>
                </div>
            </div>
            
            <input 
                type="range" min="200" max="12000" step="50"
                value={values.temperature}
                onChange={(e) => setValue('temperature', parseFloat(e.target.value))}
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
            
            <div className="flex justify-between text-xs text-zinc-600 font-mono">
                <span>200K (Ice)</span>
                <span>6000K (Sun)</span>
                <span>12000K (Star)</span>
            </div>
        </div>

        {/* Toggle Catastrophe */}
        <div className="flex items-center justify-center">
            <button
                onClick={() => setValue('showCatastrophe', !values.showCatastrophe)}
                className={`
                    flex items-center gap-3 px-6 py-4 rounded-xl border transition-all duration-300 w-full justify-center
                    ${values.showCatastrophe 
                        ? 'bg-red-900/20 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'}
                `}
            >
                <span className="font-bold text-lg">
                    {values.showCatastrophe ? "Hiding Classical Math" : "Show 'Classical' Math"}
                </span>
            </button>
        </div>
    </div>
);

// 5. Export
export const SIMULATION_17 = {
    title: 'Blackbody Spectrum',
    initialValues: { temperature: 3000, showCatastrophe: false },
    achievements: achievements,
    renderSimulation: ({ values }: { values: SimState }) => (
        <BlackbodyCanvas values={values} />
    ),
    renderControls: renderControls
};