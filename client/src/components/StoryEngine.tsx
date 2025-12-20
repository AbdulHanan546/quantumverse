import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FaForward, FaTerminal, FaMousePointer } from 'react-icons/fa';

// --- Types ---

export type DrawFunction = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  mouseX: number
) => void;

export interface StoryStep {
  speaker: string;
  text: string;
  mathTitle?: string;
  mathSub?: string;
  draw: DrawFunction; // The logic to render the canvas for this specific step
}

interface StoryEngineProps {
  title: string;
  script: StoryStep[];
  onFinish: () => void;
}

// --- CSS Styles for CRT Effect (Inline for portability) ---
const crtStyles = {
  scanline: {
    background: `
      linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%),
      linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))
    `,
    backgroundSize: '100% 2px, 3px 100%',
    pointerEvents: 'none' as const,
  },
  grid: {
    backgroundImage: `
      linear-gradient(rgba(245, 158, 11, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(245, 158, 11, 0.05) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
  }
};

export const StoryEngine: React.FC<StoryEngineProps> = ({ title, script, onFinish }) => {
  const [index, setIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Simulation State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const timeRef = useRef(0);
  const mouseXRef = useRef(0.5); // 0.0 to 1.0

  const currentStep = script[index];

  // --- Typewriter Effect ---
  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let charIndex = 0;
    const fullText = currentStep.text;
    
    const interval = setInterval(() => {
      if (charIndex < fullText.length) {
        setDisplayedText((prev) => prev + fullText.charAt(charIndex));
        charIndex++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 20); // Speed

    return () => clearInterval(interval);
  }, [index, currentStep.text]);

  // --- Canvas Animation Loop ---
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize handling (basic)
    const { clientWidth, clientHeight } = canvas.parentElement!;
    if (canvas.width !== clientWidth || canvas.height !== clientHeight) {
      canvas.width = clientWidth;
      canvas.height = clientHeight;
    }

    timeRef.current += 0.05;

    // Clear background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Call the draw function provided by the CURRENT STEP
    if (currentStep.draw) {
      currentStep.draw(ctx, canvas.width, canvas.height, timeRef.current, mouseXRef.current);
    }

    requestRef.current = requestAnimationFrame(animate);
  }, [currentStep]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [animate]);

  // --- Interaction ---
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    mouseXRef.current = x;
  };

  const handleNext = () => {
    if (isTyping) {
      // Instant finish typing
      setDisplayedText(currentStep.text);
      setIsTyping(false);
      return;
    }

    if (index < script.length - 1) {
      setIndex(index + 1);
    } else {
      onFinish();
    }
  };

  // Helper for speaker color
 const getSpeakerColor = (speaker: string) => {
  switch (speaker) {
    // --- The Interface ---
    case 'System': 
      return 'text-amber-500 border-amber-900';

    // --- Classical Mechanics (Determinism / Logic) ---
    case 'Newton':
    case 'Hooke':
    case 'Fourier':
    case 'Young':
    case 'Huygens':
      return 'text-blue-400 border-blue-900'; 

    // --- The Failure (Classical prediction) ---
    case 'Rayleigh': 
    case 'Jeans':
      return 'text-red-500 border-red-900'; 

    // --- The Spark (Energy & Quanta) ---
    case 'Planck': 
      return 'text-emerald-500 border-emerald-900'; // The solution found
    case 'Einstein':
    case 'Compton':
      return 'text-yellow-400 border-yellow-800'; // Light/Gold

    // --- Matter Waves (The Hybrid Era) ---
    case 'de Broglie':
    case 'Bohr':
    case 'Rutherford':
    case 'Davisson':
      return 'text-cyan-400 border-cyan-900'; 

    // --- Quantum Mechanics (The Abstract/Wave Function) ---
    case 'Schrödinger':
      return 'text-violet-500 border-violet-900'; // Deep purple for the wave function
    case 'Born':
      return 'text-purple-400 border-purple-800'; 
    
    // --- Uncertainty ---
    case 'Heisenberg':
      return 'text-fuchsia-500 border-fuchsia-900'; // Unpredictable color

    // --- Default ---
    default: 
      return 'text-zinc-300 border-zinc-700';
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-black p-4 font-mono select-none">
      
      {/* Main Container */}
      <div className="relative w-full max-w-[1200px] aspect-video bg-zinc-900 rounded-lg shadow-2xl overflow-hidden border border-zinc-800 flex flex-col group">
        
        {/* CRT Overlay (Scanlines) */}
        <div className="absolute inset-0 z-20 pointer-events-none" style={crtStyles.scanline} />

        {/* Header */}
        <div className="absolute top-0 w-full p-4 z-30 flex justify-between items-start pointer-events-none">
          <div className="bg-black/60 backdrop-blur px-3 py-1 border border-amber-900/50 text-xs text-amber-500 font-bold uppercase tracking-widest flex items-center gap-2">
            <FaTerminal /> {title}
          </div>
          <button 
            onClick={onFinish}
            className="pointer-events-auto flex items-center gap-2 px-3 py-1 text-xs text-zinc-500 hover:text-amber-500 border border-transparent hover:border-amber-900 transition-colors uppercase"
          >
            Skip <FaForward />
          </button>
        </div>

        {/* Simulation Layer */}
        <div className="absolute inset-0 z-0" style={crtStyles.grid} onMouseMove={handleMouseMove}>
          <canvas ref={canvasRef} className="w-full h-full block" />
          
          {/* Math Overlay */}
          <div className={`absolute top-16 right-16 text-right transition-opacity duration-1000 ${currentStep.mathTitle ? 'opacity-100' : 'opacity-0'}`}>
            <h2 className="text-3xl font-bold text-white shadow-black drop-shadow-md">{currentStep.mathTitle}</h2>
            <div className="text-sm text-amber-400 font-mono mt-1 whitespace-pre-line">{currentStep.mathSub}</div>
          </div>
        </div>

        {/* Dialogue Box */}
        <div className="absolute bottom-0 w-full z-30 p-6 flex justify-center pointer-events-none">
          <div 
            onClick={handleNext}
            className={`pointer-events-auto bg-zinc-900/95 w-full max-w-4xl rounded-xl p-6 min-h-[140px] relative cursor-pointer border shadow-[0_-10px_40px_rgba(0,0,0,0.8)] transition-all hover:border-amber-700/50 ${getSpeakerColor(currentStep.speaker).split(' ')[1].replace('text', 'border')}`}
          >
            {/* Speaker Label */}
            <div className={`absolute -top-3 left-6 bg-zinc-900 px-4 py-1 text-xs font-bold uppercase tracking-widest border transition-colors ${getSpeakerColor(currentStep.speaker)}`}>
              {currentStep.speaker}
            </div>

            {/* Text */}
            <p className="text-lg text-zinc-300 leading-relaxed font-mono">
              {displayedText}
              <span className="animate-pulse inline-block w-2 h-5 bg-amber-500 ml-1 align-middle"></span>
            </p>

            {/* Click Prompt */}
            <div className="absolute bottom-4 right-4 text-xs text-amber-600 flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
              {isTyping ? "TYPING..." : <><FaMousePointer /> CLICK TO CONTINUE</>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};