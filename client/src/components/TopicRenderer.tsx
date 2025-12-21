import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, ChevronLeft, Zap, CheckCircle2, XCircle, 
  RefreshCcw, BookOpen, Activity, ArrowRight, Quote, 
  Scale, Layers, Binary, Variable
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/* -------------------------------------------------------------------------- */
/*                                    UTILS                                   */
/* -------------------------------------------------------------------------- */

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export type SimulationCleanup = () => void;
export type SimulationDriver = (canvas: HTMLCanvasElement) => SimulationCleanup;

export type SlideType = 
  | "intro" 
  | "quote"
  | "concept-list" 
  | "concept-split"
  | "comparison"
  | "process"
  | "equation"
  | "quiz" 
  | "true-false"
  | "simulation" 
  | "summary"
  | "outro";

export interface BaseSlide {
  id: string | number;
  type: SlideType;
  title?: string;
}

export interface IntroSlide extends BaseSlide {
  type: "intro";
  subtitle: string;
  icon?: React.ReactNode;
  meta?: string;
}

export interface QuoteSlide extends BaseSlide {
  type: "quote";
  text: string;
  author?: string;
}

export interface ConceptListSlide extends BaseSlide {
  type: "concept-list";
  items: string[];
  context?: string;
}

export interface ConceptSplitSlide extends BaseSlide {
  type: "concept-split";
  leftContent: string;
  rightPoints: string[];
}

export interface ComparisonSlide extends BaseSlide {
  type: "comparison";
  leftTitle: string;
  leftPoints: string[];
  rightTitle: string;
  rightPoints: string[];
}

export interface ProcessSlide extends BaseSlide {
  type: "process";
  steps: { label: string; desc: string }[];
}

export interface EquationSlide extends BaseSlide {
  type: "equation";
  latex: string; // or simplified text representation
  description: string;
  variables: { symbol: string; meaning: string }[];
}

export interface QuizSlide extends BaseSlide {
  type: "quiz";
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TrueFalseSlide extends BaseSlide {
  type: "true-false";
  statement: string;
  isTrue: boolean;
  explanation: string;
}

export interface SimSlide extends BaseSlide {
  type: "simulation";
  description: string;
  /** 
   * A function that takes the canvas and returns a cleanup function.
   * This allows any topic to define its own drawing logic.
   */
  run: SimulationDriver; 
}

export interface SummarySlide extends BaseSlide {
  type: "summary";
  recap: string[];
}

export interface OutroSlide extends BaseSlide {
  type: "outro";
  text: string;
}

export type SlideData = 
  | IntroSlide | QuoteSlide | ConceptListSlide | ConceptSplitSlide 
  | ComparisonSlide | ProcessSlide | EquationSlide | QuizSlide 
  | TrueFalseSlide | SimSlide | SummarySlide | OutroSlide;

interface TopicViewerProps {
  slides: SlideData[];
  onComplete?: () => void;
  title?: string;
}

/* -------------------------------------------------------------------------- */
/*                                SUB-COMPONENTS                              */
/* -------------------------------------------------------------------------- */

const IntroView = ({ slide }: { slide: IntroSlide }) => (
  <div className="flex flex-col items-center justify-center text-center h-full max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
    <div className="w-32 h-32 bg-zinc-800 rounded-3xl flex items-center justify-center border border-zinc-700 shadow-[0_0_40px_-10px_rgba(74,222,128,0.3)]">
      {slide.icon || <Zap size={64} className="text-green-400" />}
    </div>
    <div className="space-y-4">
      <h1 className="text-5xl font-bold text-white tracking-tight">{slide.title}</h1>
      <p className="text-xl text-zinc-400">{slide.subtitle}</p>
    </div>
    {slide.meta && (
      <span className="inline-block px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-500 font-mono uppercase tracking-wider">
        {slide.meta}
      </span>
    )}
  </div>
);

const QuoteView = ({ slide }: { slide: QuoteSlide }) => (
  <div className="flex flex-col items-center justify-center h-full max-w-3xl mx-auto text-center px-8">
    <Quote className="text-green-500 mb-6 opacity-50" size={48} />
    <blockquote className="text-3xl md:text-4xl font-serif text-white leading-relaxed italic mb-8">
      "{slide.text}"
    </blockquote>
    {slide.author && (
      <cite className="text-zinc-400 not-italic font-mono uppercase tracking-widest text-sm">
        — {slide.author}
      </cite>
    )}
  </div>
);

const ConceptListView = ({ slide }: { slide: ConceptListSlide }) => (
  <div className="h-full max-w-3xl mx-auto flex flex-col justify-center">
    <h2 className="text-3xl font-bold text-white mb-4">{slide.title}</h2>
    {slide.context && <p className="text-zinc-400 mb-8 text-lg">{slide.context}</p>}
    <div className="space-y-3">
      {slide.items.map((item, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-center gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full shrink-0" />
          <span className="text-zinc-200 text-lg">{item}</span>
        </motion.div>
      ))}
    </div>
  </div>
);

const ConceptSplitView = ({ slide }: { slide: ConceptSplitSlide }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center h-full max-w-6xl mx-auto">
    <div className="space-y-6">
      <h2 className="text-4xl font-bold text-green-400 mb-6">{slide.title}</h2>
      <p className="text-xl text-zinc-300 leading-relaxed">{slide.leftContent}</p>
    </div>
    <div className="space-y-4">
      {slide.rightPoints.map((point, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.15 }}
          className="p-5 bg-zinc-800/50 border-l-4 border-green-500 rounded-r-xl"
        >
          <p className="text-zinc-200">{point}</p>
        </motion.div>
      ))}
    </div>
  </div>
);

const ComparisonView = ({ slide }: { slide: ComparisonSlide }) => (
  <div className="h-full max-w-5xl mx-auto flex flex-col justify-center">
    <h2 className="text-2xl font-bold text-white mb-8 text-center">{slide.title}</h2>
    <div className="grid grid-cols-2 gap-8">
      {/* Left Side */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-blue-400 font-bold uppercase tracking-wider mb-6 pb-2 border-b border-zinc-800 flex items-center gap-2">
            <Scale size={16} /> {slide.leftTitle}
        </h3>
        <ul className="space-y-4">
          {slide.leftPoints.map((p, i) => (
            <li key={i} className="text-zinc-400 text-sm flex gap-2">
                <span className="text-blue-500/50">•</span> {p}
            </li>
          ))}
        </ul>
      </div>
      {/* Right Side */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-green-400 font-bold uppercase tracking-wider mb-6 pb-2 border-b border-zinc-800 flex items-center gap-2">
            <Scale size={16} /> {slide.rightTitle}
        </h3>
        <ul className="space-y-4">
          {slide.rightPoints.map((p, i) => (
            <li key={i} className="text-zinc-400 text-sm flex gap-2">
                <span className="text-green-500/50">•</span> {p}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

const ProcessView = ({ slide }: { slide: ProcessSlide }) => (
  <div className="h-full max-w-4xl mx-auto flex flex-col justify-center">
    <h2 className="text-3xl font-bold text-white mb-10 text-center">{slide.title}</h2>
    <div className="relative">
      {/* Connector Line */}
      <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-zinc-800" />
      
      <div className="space-y-8">
        {slide.steps.map((step, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2 }}
            className="relative flex items-start gap-6 pl-2"
          >
            <div className="relative z-10 w-8 h-8 rounded-full bg-zinc-900 border-2 border-green-500 flex items-center justify-center text-green-500 font-bold text-sm shrink-0 shadow-[0_0_15px_rgba(74,222,128,0.2)]">
              {i + 1}
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex-1">
              <h3 className="font-bold text-white mb-1">{step.label}</h3>
              <p className="text-zinc-400 text-sm">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

const EquationView = ({ slide }: { slide: EquationSlide }) => (
  <div className="h-full max-w-4xl mx-auto flex flex-col justify-center items-center">
    <div className="bg-zinc-950 p-10 rounded-2xl border border-zinc-800 mb-10 shadow-2xl">
      <span className="text-4xl md:text-6xl font-serif text-white tracking-wider">
        {slide.latex}
      </span>
    </div>
    <p className="text-xl text-zinc-400 mb-12 text-center max-w-2xl">{slide.description}</p>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      {slide.variables.map((v, i) => (
        <div key={i} className="flex items-center gap-4 p-3 bg-zinc-900/30 rounded border border-zinc-800/50">
          <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center font-serif text-green-400 text-xl font-bold">
            {v.symbol}
          </div>
          <span className="text-zinc-300 text-sm">{v.meaning}</span>
        </div>
      ))}
    </div>
  </div>
);

const QuizView = ({ slide }: { slide: QuizSlide }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => { setSelected(null); setIsSubmitted(false); }, [slide.id]);

  const handleSelect = (idx: number) => {
    if (isSubmitted) return;
    setSelected(idx);
  };

  const isCorrect = selected === slide.correctIndex;

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col justify-center h-full">
      <div className="mb-8">
        <span className="text-green-400 font-mono text-xs uppercase tracking-widest border border-green-900/50 bg-green-900/20 px-2 py-1 rounded">
          Quiz
        </span>
        <h2 className="text-2xl font-bold text-white mt-4">{slide.question}</h2>
      </div>

      <div className="space-y-3">
        {slide.options.map((opt, idx) => {
          let styles = "border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800";
          if (isSubmitted) {
            if (idx === slide.correctIndex) styles = "border-green-500 bg-green-500/10";
            else if (idx === selected) styles = "border-red-500 bg-red-500/10";
            else styles = "border-zinc-800 opacity-50";
          } else if (selected === idx) {
            styles = "border-green-500 bg-zinc-800";
          }
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={cn("w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center", styles)}
            >
              <span className="text-zinc-300">{opt}</span>
              {isSubmitted && idx === slide.correctIndex && <CheckCircle2 size={20} className="text-green-500" />}
              {isSubmitted && idx === selected && idx !== slide.correctIndex && <XCircle size={20} className="text-red-500" />}
            </button>
          );
        })}
      </div>

      {!isSubmitted && selected !== null && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setIsSubmitted(true)}
          className="mt-8 py-3 w-full bg-white text-black font-bold rounded-lg hover:scale-[1.02] transition-transform"
        >
          Check Answer
        </motion.button>
      )}

      {isSubmitted && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-6 p-4 rounded-xl bg-zinc-900 border border-zinc-700">
           <p className={cn("font-bold mb-1", isCorrect ? "text-green-400" : "text-red-400")}>{isCorrect ? "Correct!" : "Incorrect"}</p>
           <p className="text-zinc-400 text-sm">{slide.explanation}</p>
        </motion.div>
      )}
    </div>
  );
};

const TrueFalseView = ({ slide }: { slide: TrueFalseSlide }) => {
    // Reusing Quiz Logic internally but simplified UI
    const quizSlide: QuizSlide = {
        ...slide,
        type: 'quiz',
        question: slide.statement,
        options: ["True", "False"],
        correctIndex: slide.isTrue ? 0 : 1,
    };
    return <QuizView slide={quizSlide} />;
};

const SimulationView = ({ slide }: { slide: SimSlide }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !slide.run) return;

    // Initial resize
    const resize = () => {
        if(containerRef.current && canvas) {
            canvas.width = containerRef.current.clientWidth;
            canvas.height = containerRef.current.clientHeight;
        }
    };
    resize();
    window.addEventListener('resize', resize);

    // Run the passed simulation function
    const cleanup = slide.run(canvas);

    return () => {
      // cleanup();
      window.removeEventListener('resize', resize);
    };
  }, [slide]);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white mb-1">{slide.title}</h2>
        <p className="text-zinc-400 text-sm">{slide.description}</p>
      </div>
      <div ref={containerRef} className="flex-grow bg-zinc-950 rounded-2xl border border-zinc-800 relative overflow-hidden shadow-inner cursor-crosshair">
        <canvas ref={canvasRef} className="block" />
        <div className="absolute bottom-4 right-4 text-xs text-zinc-600 pointer-events-none select-none">
            Interactive Simulation
        </div>
      </div>
    </div>
  );
};

const SummaryView = ({ slide }: { slide: SummarySlide }) => (
  <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto">
    <h2 className="text-3xl font-bold text-white mb-8 border-b border-zinc-800 pb-4 w-full text-center">
        {slide.title || "Summary"}
    </h2>
    <div className="w-full space-y-4">
      {slide.recap.map((item, i) => (
        <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-4"
        >
            <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20} />
            <span className="text-zinc-300 text-lg">{item}</span>
        </motion.div>
      ))}
    </div>
  </div>
);

const OutroView = ({ slide }: { slide: OutroSlide }) => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="mb-6 animate-bounce">
            <span className="text-6xl">🏆</span>
        </div>
        <h1 className="text-5xl font-bold text-green-400 mb-6">{slide.title}</h1>
        <p className="text-xl text-zinc-300 max-w-xl">{slide.text}</p>
    </div>
);

/* -------------------------------------------------------------------------- */
/*                              MAIN COMPONENT                                */
/* -------------------------------------------------------------------------- */

export default function TopicViewer({ slides, onComplete, title }: TopicViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const currentSlide = slides[currentIndex];
  const progress = ((currentIndex + 1) / slides.length) * 100;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    } else {
        onComplete?.();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  const renderContent = () => {
    switch (currentSlide.type) {
      case "intro": return <IntroView slide={currentSlide} />;
      case "quote": return <QuoteView slide={currentSlide} />;
      case "concept-list": return <ConceptListView slide={currentSlide} />;
      case "concept-split": return <ConceptSplitView slide={currentSlide} />;
      case "comparison": return <ComparisonView slide={currentSlide} />;
      case "process": return <ProcessView slide={currentSlide} />;
      case "equation": return <EquationView slide={currentSlide} />;
      case "quiz": return <QuizView slide={currentSlide} />;
      case "true-false": return <TrueFalseView slide={currentSlide} />;
      case "simulation": return <SimulationView slide={currentSlide} />;
      case "summary": return <SummaryView slide={currentSlide} />;
      case "outro": return <OutroView slide={currentSlide} />;
      default: return <div className="text-red-500">Unknown Slide Type</div>;
    }
  };

  return (
    <div className="w-full h-screen bg-black text-white font-sans selection:bg-green-500/30 overflow-hidden flex items-center justify-center p-0 md:p-6 lg:p-8">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-green-900/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 w-full max-w-[1400px] h-full md:h-auto md:aspect-[16/9] bg-zinc-950 md:rounded-3xl border-x-0 border-y-0 md:border md:border-zinc-800 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="h-16 border-b border-zinc-800/50 flex items-center justify-between px-6 bg-zinc-900/30 backdrop-blur-md">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-green-400">
                    <Activity size={18} />
                </div>
                <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 block">Topic</span>
                    <span className="text-sm font-semibold text-zinc-200">{title || "Interactive Lesson"}</span>
                </div>
            </div>
            <div className="flex flex-col items-end gap-1 w-32 md:w-48">
                <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider flex justify-between w-full">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div 
                        className="h-full bg-green-500" 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>
        </header>

        {/* Stage */}
        <div className="flex-grow relative overflow-y-auto overflow-x-hidden p-6 md:p-12 scrollbar-hide">
            <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    initial={{ opacity: 0, x: direction * 50, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: direction * -50, scale: 0.98 }}
                    transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                    className="w-full h-full"
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="h-20 border-t border-zinc-800/50 flex items-center justify-between px-6 bg-zinc-900/30 backdrop-blur-md">
            <button 
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-zinc-400 hover:text-white disabled:opacity-0 transition-all"
            >
                <ChevronLeft size={20} /> Back
            </button>

            <div className="hidden md:flex gap-1.5">
                {slides.map((_, i) => (
                    <div 
                        key={i} 
                        className={cn(
                            "w-1 h-1 rounded-full transition-all duration-300",
                            i === currentIndex ? "bg-green-500 w-4" : "bg-zinc-800"
                        )} 
                    />
                ))}
            </div>

            <button 
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-green-400 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/20"
            >
                {currentIndex === slides.length - 1 ? "Complete" : "Continue"}
                <ArrowRight size={18} />
            </button>
        </footer>
      </div>
    </div>
  );
}