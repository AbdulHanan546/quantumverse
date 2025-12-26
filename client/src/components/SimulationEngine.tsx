import React, { useState, useEffect, useMemo } from 'react';
import { FaTrophy, FaCheckCircle, FaLock, FaBars, FaTimes, FaChevronRight } from 'react-icons/fa';

// --- Types ---

export interface Achievement<T> {
  id: string;
  title: string;
  description: string;
  /** Returns true if the condition is met based on current simulation values */
  condition: (values: T) => boolean;
}

interface SimulationEngineProps<T> {
  /** Title displayed in header */
  title?: string;
  simulation: {
    /** Initial state of the simulation variables */
    initialValues: T;
    /** List of achievements to track */
    achievements: Achievement<T>[];
    /** Render prop for the actual simulation (Canvas, WebGL, etc.) */
    renderSimulation: (props: { values: T }) => React.ReactNode;
    /** Render prop for the control panel (Inputs, Sliders) */
    renderControls: (props: { 
      values: T; 
      setValues: React.Dispatch<React.SetStateAction<T>>;
      setValue: (key: keyof T, val: any) => void;
    }) => React.ReactNode;
    /** Callback when an achievement is unlocked */
    
  };
  onAchievementUnlock?: (id: string) => void;
  /** Callback when ALL achievements are unlocked */
  onFinish?: () => void;
}

// --- The Generic Engine Component ---

export const SimulationEngine = <T extends object>({
  simulation,
  title = "Simulation",
  onFinish,
  onAchievementUnlock
}: SimulationEngineProps<T>) => {
  // State
  const { achievements, initialValues, renderControls, renderSimulation } = simulation;
  const [values, setValues] = useState<T>(initialValues);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hasFinished, setHasFinished] = useState(false);

  // Helper to set a single value
  const setValue = (key: keyof T, val: any) => {
    setValues(prev => ({ ...prev, [key]: val }));
  };

  // Achievement Monitoring System
  useEffect(() => {
    let newUnlock = false;
    const newUnlockedIds = new Set(unlockedIds);

    achievements.forEach(ach => {
      if (!unlockedIds.has(ach.id)) {
        if (ach.condition(values)) {
          newUnlockedIds.add(ach.id);
          newUnlock = true;
          if (onAchievementUnlock) onAchievementUnlock(ach.id);
        }
      }
    });

    if (newUnlock) {
      setUnlockedIds(newUnlockedIds);
      // Check for total completion
      if (newUnlockedIds.size === achievements.length && !hasFinished) {
        setHasFinished(true);
        if (onFinish) onFinish();
      }
    }
  }, [values, achievements, unlockedIds, onAchievementUnlock, onFinish, hasFinished]);

  // Calculate Progress
  const progress = Math.round((unlockedIds.size / achievements.length) * 100);

  return (
    <div className="relative w-full h-screen bg-zinc-950 text-zinc-200 font-sans flex overflow-hidden">
      
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'mr-80' : 'mr-0'}`}>
        
        {/* Simulation Canvas Area */}
        <div className="flex-1 relative bg-black overflow-hidden flex items-center justify-center p-4 min-h-0">
            <header className="absolute left-4 top-4 h-16 border-b rounded-xl border-zinc-800 flex items-center px-6 bg-zinc-900/50 backdrop-blur z-20">
          <h1 className="text-xl font-bold text-green-400 tracking-wider uppercase flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            {title}
          </h1>
        </header>
          <div className="w-full h-full relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-2xl">
            {renderSimulation({ values })}
          </div>
        </div>

        {/* Controls Area (Bottom) */}
        <div className="bg-zinc-900 border-t border-zinc-800 p-6 z-20 flex-shrink-0">
            {renderControls({ values, setValues, setValue })}
        </div>
      </div>

      {/* Achievement Sidebar (Absolute Overlay or Flex Item depending on logic, here Fixed right) */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 bg-zinc-900 border-l border-zinc-800 shadow-2xl z-30 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-zinc-800 bg-zinc-950">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FaTrophy className="text-yellow-500" />
              Achievements
            </h2>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-400 h-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-right mt-2 text-zinc-400 font-mono">
            {unlockedIds.size} / {achievements.length} UNLOCKED
          </div>
        </div>

        {/* Achievement List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {achievements.map((ach) => {
            const isUnlocked = unlockedIds.has(ach.id);
            return (
              <div 
                key={ach.id} 
                className={`
                  relative p-4 rounded-lg border transition-all duration-500
                  ${isUnlocked 
                    ? 'bg-green-900/10 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
                    : 'bg-zinc-800/30 border-zinc-800 grayscale opacity-70'}
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 text-lg ${isUnlocked ? 'text-green-400' : 'text-zinc-600'}`}>
                    {isUnlocked ? <FaCheckCircle /> : <FaLock />}
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold ${isUnlocked ? 'text-green-100' : 'text-zinc-400'}`}>
                      {ach.title}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      {ach.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Completion Footer */}
        {hasFinished && (
            <div className="p-6 bg-green-500/10 border-t border-green-500/20 text-center animate-pulse">
                <span className="text-green-400 font-bold text-sm tracking-widest uppercase">Simulation Mastered</span>
            </div>
        )}
      </div>
    </div>
  );
};