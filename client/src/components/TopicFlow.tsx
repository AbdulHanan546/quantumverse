import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SimulationEngine } from './SimulationEngine';
import TopicViewer from './TopicRenderer';
import { StoryEngine } from './StoryEngine';
import { TOPIC_MAP } from '../content/data';

interface TrackingData {
  timeSpent: {
    story: number;
    theory: number;
    lab: number;
  };
  completed: {
    story: boolean;
    theory: boolean;
    lab: boolean;
  };
  achievements: string[];
  totalTime: number;
}

// ==========================================
// 4. Main Component: TopicFlow
// ==========================================

// ADDED: 'intro' to the Stage type
type Stage = 'intro' | 'story' | 'theory' | 'lab' | 'transition' | 'summary';

export function TopicFlow() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  
  // UPDATED: Initial state is now 'intro'
  const [currentStage, setCurrentStage] = useState<Stage>('intro');
  const [nextStage, setNextStage] = useState<Stage | null>(null);
  const [transitionMessage, setTransitionMessage] = useState("");
  
  const topicData = topicId ? TOPIC_MAP[topicId] : null;

  const [tracking, setTracking] = useState<TrackingData>({
    timeSpent: { story: 0, theory: 0, lab: 0 },
    completed: { story: false, theory: false, lab: false },
    achievements: [],
    totalTime: 0
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Timer Logic ---
  useEffect(() => {
    if (!topicData) return;
    
    // UPDATED: Don't run timer during 'intro'
    if (currentStage === 'intro' || currentStage === 'transition' || currentStage === 'summary') return;

    timerRef.current = setInterval(() => {
      setTracking(prev => ({
        ...prev,
        totalTime: prev.totalTime + 1,
        timeSpent: {
          ...prev.timeSpent,
          [currentStage]: prev.timeSpent[currentStage as keyof typeof prev.timeSpent] + 1
        }
      }));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentStage, topicData]);

  // --- Handlers ---

  // ADDED: Handler to leave intro and start the story
  const startModule = () => {
    setCurrentStage('story');
  };

  const handleTransition = (next: Stage, msg: string) => {
    setNextStage(next);
    setTransitionMessage(msg);
    setCurrentStage('transition');
    
    setTimeout(() => {
        // Optional auto-advance logic specific to transitions
    }, 3000);
  };

  const finishStory = () => {
    setTracking(prev => ({ ...prev, completed: { ...prev.completed, story: true } }));
    handleTransition('theory', "Story complete! Now, let's dive into the Theory.");
  };

  const finishTheory = () => {
    setTracking(prev => ({ ...prev, completed: { ...prev.completed, theory: true } }));
    handleTransition('lab', "Theory learned! It's time to test your skills in the Lab.");
  };

  const finishLab = () => {
    setTracking(prev => ({ ...prev, completed: { ...prev.completed, lab: true } }));
  };

  const goToSummary = () => {
    handleTransition('summary', "Simulation Complete! Let's see how you did.");
  };

  const handleAchievement = (achievement: string) => {
    if (!tracking.achievements.includes(achievement)) {
      setTracking(prev => ({
        ...prev,
        achievements: [...prev.achievements, achievement]
      }));
    }
  };

  const confirmTransition = () => {
    if (nextStage) {
      setCurrentStage(nextStage);
      setNextStage(null);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  if (!topicData) {
    return <div className="text-white p-10">Topic not found.</div>;
  }

  const isLab = currentStage === 'lab';
  const isLabFinished = tracking.completed.lab;

  // --- Render Helpers ---

  const renderContent = () => {
    switch (currentStage) {
      // ADDED: Intro Case
      case 'intro':
        return (
          <div className="flex flex-col items-center justify-center h-full bg-black text-white animate-fadeIn px-6">
            <div className="text-center max-w-2xl">
              <p className="text-zinc-500 uppercase tracking-widest text-sm mb-4">Module Preparation</p>
              <h1 className="text-5xl font-light mb-8 text-white">{topicData.title}</h1>
              <p className="text-xl text-zinc-400 font-light mb-12">
                You are about to enter the learning environment. 
                We will begin with an interactive story, followed by theory concepts, 
                and finally a hands-on simulation lab.
              </p>
              <button 
                onClick={startModule} 
                className="px-10 py-4 border border-zinc-500 text-zinc-300 rounded-full hover:bg-white hover:text-black hover:border-white transition-all duration-300 text-lg tracking-wider uppercase"
              >
                Start Learning
              </button>
            </div>
          </div>
        );

      case 'story':
        return <StoryEngine title={topicData.title} script={topicData.story} onFinish={finishStory} />;
      case 'theory':
        return <TopicViewer title={topicData.title} slides={topicData.theory} onComplete={finishTheory} />;
      case 'lab':
        return <SimulationEngine title={topicData.title} simulation={topicData.lab} onFinish={finishLab} onAchievementUnlock={handleAchievement} />;
      case 'transition':
        return (
          <div className="flex flex-col items-center justify-center h-full bg-black text-white animate-fadeIn">
            <h2 className="text-3xl font-light mb-6 text-center max-w-lg px-4">{transitionMessage}</h2>
            <button onClick={confirmTransition} className="px-8 py-3 border border-white rounded-full hover:bg-white hover:text-black transition duration-300">
              Continue &rarr;
            </button>
          </div>
        );
      case 'summary':
        return (
          <div className="min-h-screen flex flex-col items-center h-full bg-zinc-900 text-zinc-100 overflow-y-auto py-10">
            {/* Header Section */}
            <div className="text-center mb-12">
              <div className="inline-block p-3 rounded-full bg-green-500/10 mb-4 border border-green-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                Module Complete
              </h1>
              <p className="text-zinc-400 text-lg">Great work! You've mastered {topicData.title}.</p>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-6">
              
              {/* Total Time Card */}
              <div className="bg-zinc-800/50 border border-zinc-700/50 p-6 rounded-2xl flex items-center space-x-4 hover:border-green-500/30 transition-colors">
                <div className="p-3 bg-zinc-700/50 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                  <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Total Session Time</h3>
                  <p className="text-2xl font-mono text-white mt-1">{formatTime(tracking.totalTime)}</p>
                </div>
              </div>

              {/* Achievement Card */}
              <div className="bg-zinc-800/50 border border-zinc-700/50 p-6 rounded-2xl flex items-center space-x-4 hover:border-green-500/30 transition-colors">
                <div className="p-3 bg-zinc-700/50 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                </div>
                <div>
                  <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Achievements Unlocked</h3>
                  <p className="text-2xl font-mono text-white mt-1">{tracking.achievements.length}</p>
                </div>
              </div>

              {/* Time Breakdown */}
              <div className="col-span-1 md:col-span-2 bg-zinc-800/50 border border-zinc-700/50 p-8 rounded-2xl">
                 <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-6">Session Breakdown</h3>
                 <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col items-center w-full">
                        <div className="w-full h-2 bg-zinc-700 rounded-full mb-2 overflow-hidden">
                            <div className="h-full bg-green-500/40 w-full"></div>
                        </div>
                        <span className="text-zinc-500 text-sm mb-1">Interactive Story</span>
                        <span className="text-xl font-medium text-green-100">{formatTime(tracking.timeSpent.story)}</span>
                    </div>
                    <div className="flex flex-col items-center w-full">
                        <div className="w-full h-2 bg-zinc-700 rounded-full mb-2 overflow-hidden">
                            <div className="h-full bg-green-500/60 w-full"></div>
                        </div>
                        <span className="text-zinc-500 text-sm mb-1">Theory Slides</span>
                        <span className="text-xl font-medium text-green-100">{formatTime(tracking.timeSpent.theory)}</span>
                    </div>
                    <div className="flex flex-col items-center w-full">
                        <div className="w-full h-2 bg-zinc-700 rounded-full mb-2 overflow-hidden">
                            <div className="h-full bg-green-500 w-full"></div>
                        </div>
                        <span className="text-zinc-500 text-sm mb-1">Simulation Lab</span>
                        <span className="text-xl font-medium text-green-100">{formatTime(tracking.timeSpent.lab)}</span>
                    </div>
                 </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-12">
                <button 
                    onClick={() => navigate('/student')}
                    className="group relative px-8 py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(22,163,74,0.3)] hover:shadow-[0_0_30px_rgba(22,163,74,0.5)] flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Return to Dashboard
                </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const StageIndicator = ({ name, stageKey }: { name: string, stageKey: Stage }) => {
    const isActive = currentStage === stageKey;
    const isPast = tracking.completed[stageKey as keyof typeof tracking.completed];
    
    let colorClass = "text-zinc-600";
    if (isActive) colorClass = "text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)] font-bold";
    else if (isPast) colorClass = "text-green-600"; 

    return (
      <span className={`uppercase tracking-widest text-sm transition-all duration-300 ${colorClass}`}>
        {name}
      </span>
    );
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans">
      
      {/* Main Content Area */}
      <div className="w-full h-full">
        {renderContent()}
      </div>

      {/* 
        UI Overlay
        UPDATED: Condition allows hiding the overlay during 'intro', 'summary', and 'transition'
      */}
      {currentStage !== 'summary' && currentStage !== 'transition' && currentStage !== 'intro' && (
        <>
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
            {currentStage === 'lab' && isLabFinished ? (
               <button 
                 onClick={goToSummary}
                 className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold tracking-widest uppercase rounded-full shadow-[0_0_20px_rgba(22,163,74,0.6)] animate-pulse hover:animate-none transition-all duration-300 border border-green-400 transform hover:scale-105"
               >
                 Topic Completed
               </button>
            ) : (
              <div 
                className="transition-all duration-700 ease-in-out flex gap-4 items-center bg-zinc-900/80 px-6 py-2 rounded-full backdrop-blur-md border border-zinc-700/50 shadow-xl"
              >
                <StageIndicator name="Story" stageKey="story" />
                <div className="w-6 h-[1px] bg-zinc-700"></div>
                <StageIndicator name="Theory" stageKey="theory" />
                <div className="w-6 h-[1px] bg-zinc-700"></div>
                <StageIndicator name="Lab" stageKey="lab" />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}