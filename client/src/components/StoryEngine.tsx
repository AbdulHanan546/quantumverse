import React, { useEffect, useRef, useState, useCallback } from "react";
import { FaForward, FaTerminal, FaVolumeUp, FaVolumeMute } from "react-icons/fa";

/* ================= TYPES ================= */

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
  draw: DrawFunction;
}

interface StoryEngineProps {
  title: string;
  script: StoryStep[];
  onFinish: () => void;
}

/* ================= VOICE HELPER ================= */

const getFemaleVoice = (): SpeechSynthesisVoice | null => {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) =>
      v.lang === "en-US" &&
      /female|zira|samantha|victoria/i.test(v.name)
    ) || null
  );
};

/* ================= STYLES ================= */

const crtStyles = {
  scanline: {
    background: `linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.25) 50%),
                 linear-gradient(90deg, rgba(255,0,0,0.06), rgba(0,255,0,0.02), rgba(0,0,255,0.06))`,
    backgroundSize: "100% 2px, 3px 100%",
    pointerEvents: "none" as const,
  },
  grid: {
    backgroundImage: `
      linear-gradient(rgba(245,158,11,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(245,158,11,0.05) 1px, transparent 1px)
    `,
    backgroundSize: "40px 40px",
  },
};

/* ================= COMPONENT ================= */

export const StoryEngine: React.FC<StoryEngineProps> = ({
  title,
  script,
  onFinish,
}) => {
  const [index, setIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  // REFS
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const timeRef = useRef(0);
  const mouseXRef = useRef(0.5);

  // TRACKING REFS (Critical for the pause/resume logic)
  // This tracks exactly how many characters have been shown so far.
  const charIndexRef = useRef(0); 
  // This helps us detect if the effect ran because the slide changed or just the audio toggle changed.
  const lastSlideIndexRef = useRef(-1);

  const currentStep = script[index];

  /* ========== LOAD VOICES ========== */

  useEffect(() => {
    const loadVoices = () => {
      const v = getFemaleVoice();
      if (v) setVoice(v);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  /* ========== TYPEWRITER & AUDIO LOGIC ========== */

  useEffect(() => {
    const fullText = currentStep.text;
    let intervalId: number | null = null;

    // 1. NEW SLIDE DETECTION
    // If the index has changed since the last run, reset everything.
    if (lastSlideIndexRef.current !== index) {
      lastSlideIndexRef.current = index;
      charIndexRef.current = 0;
      setDisplayedText("");
      setIsTyping(true);
      window.speechSynthesis.cancel();
    }

    // 2. CHECK IF FINISHED
    // If we've already typed everything, don't restart logic
    if (charIndexRef.current >= fullText.length) {
      setIsTyping(false);
      setDisplayedText(fullText);
      return;
    }

    // 3. PREPARE RESUME DATA
    // We resume from wherever charIndexRef is currently pointing
    const startFromIndex = charIndexRef.current;
    const remainingText = fullText.slice(startFromIndex);

    // Helper: The function that adds one character
    const typeNextChar = () => {
      charIndexRef.current++;
      setDisplayedText(fullText.slice(0, charIndexRef.current));

      if (charIndexRef.current >= fullText.length) {
        setIsTyping(false);
        if (intervalId) clearInterval(intervalId);
      }
    };

    // 4. AUDIO vs SILENT LOGIC
    window.speechSynthesis.cancel(); // Always stop previous audio first

    if (isAudioEnabled && voice && remainingText.length > 0) {
      // --- AUDIO MODE ---
      // We speak ONLY the remaining text
      const utterance = new SpeechSynthesisUtterance(remainingText);
      utterance.voice = voice;
      utterance.rate = 1.1;
      utterance.pitch = 1.25;
      utterance.volume = 0.9;

      utterance.onstart = () => {
        // Only start typing visually when audio actually starts
        if (intervalId) clearInterval(intervalId);
        intervalId = window.setInterval(typeNextChar, 45);
      };

      utterance.onend = () => {
        // Ensure we snap to finish in case of timing drift
        setIsTyping(false);
        setDisplayedText(fullText);
        charIndexRef.current = fullText.length;
        if (intervalId) clearInterval(intervalId);
      };

      utterance.onerror = () => {
        setIsTyping(false);
        if (intervalId) clearInterval(intervalId);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // --- SILENT MODE ---
      // Just run the interval immediately from current spot
      intervalId = window.setInterval(typeNextChar, 45);
    }

    // CLEANUP
    return () => {
      if (intervalId) clearInterval(intervalId);
      window.speechSynthesis.cancel();
    };
  }, [index, isAudioEnabled, voice, currentStep.text]); 
  // ^ Re-runs when audio is toggled OR slide changes

  /* ========== CANVAS ANIMATION LOOP ========== */

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize handling
    const parent = canvas.parentElement;
    if (parent) {
      if (canvas.width !== parent.clientWidth) canvas.width = parent.clientWidth;
      if (canvas.height !== parent.clientHeight) canvas.height = parent.clientHeight;
    }

    timeRef.current += 0.05;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    currentStep.draw?.(
      ctx,
      canvas.width,
      canvas.height,
      timeRef.current,
      mouseXRef.current
    );

    requestRef.current = requestAnimationFrame(animate);
  }, [currentStep]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [animate]);

  /* ========== HANDLERS ========== */

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseXRef.current = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  };

  const handleNext = () => {
    // 1. If currently typing, fast-forward to end
    if (isTyping) {
      setIsTyping(false);
      setDisplayedText(currentStep.text);
      charIndexRef.current = currentStep.text.length; // Mark as done
      window.speechSynthesis.cancel();
      return;
    }

    // 2. If done, go to next slide
    if (index < script.length - 1) {
      setIndex(index + 1);
      // Note: The Effect will handle resetting refs because index changes
    } else {
      onFinish();
    }
  };

  const getSpeakerColor = (speaker: string) =>
    speaker === "System"
      ? "text-amber-500 border-amber-900"
      : "text-blue-400 border-blue-900";

  /* ========== UI ========== */

  return (
    <div className="flex items-center justify-center min-h-screen bg-black p-4 font-mono select-none">
      <div className="relative w-full max-w-[1200px] aspect-video bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
        
        <div className="absolute inset-0 z-20" style={crtStyles.scanline} />

        {/* HEADER */}
        <div className="absolute top-0 w-full p-4 z-30 flex justify-between items-center">
          <div className="bg-black/60 px-3 py-1 border border-amber-900 text-xs text-amber-500 flex items-center gap-2">
            <FaTerminal /> {title}
          </div>

          <div className="flex items-center gap-4">
             {/* TOGGLE BUTTON */}
            <button
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              className={`flex items-center gap-2 text-xs transition-colors ${
                isAudioEnabled ? "text-amber-500" : "text-zinc-500"
              } hover:text-amber-400`}
            >
              {isAudioEnabled ? (
                <><FaVolumeUp /> Voice On</>
              ) : (
                <><FaVolumeMute /> Voice Off</>
              )}
            </button>

            <button
              onClick={onFinish}
              className="flex items-center gap-2 text-xs text-zinc-400 hover:text-amber-500"
            >
              Skip <FaForward />
            </button>
          </div>
        </div>

        {/* CANVAS LAYER */}
        <div
          className="absolute inset-0 z-0"
          style={crtStyles.grid}
          onMouseMove={handleMouseMove}
        >
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>

        {/* DIALOGUE BOX */}
        <div className="absolute bottom-0 w-full z-30 p-6 flex justify-center">
          <div
            onClick={handleNext}
            className={`bg-zinc-900/95 w-full max-w-4xl rounded-xl p-6 min-h-[140px] cursor-pointer border ${getSpeakerColor(
              currentStep.speaker
            )}`}
          >
            <div className="text-xs uppercase font-bold mb-2">
              {currentStep.speaker}
            </div>

            <p className="text-lg text-zinc-300 leading-relaxed">
              {displayedText}
              {isTyping && (
                <span className="inline-block w-2 h-5 bg-amber-500 ml-1 animate-pulse" />
              )}
            </p>

            <div className="text-xs text-amber-600 mt-3 opacity-60">
              {isTyping ? "TYPING..." : "CLICK TO CONTINUE"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};