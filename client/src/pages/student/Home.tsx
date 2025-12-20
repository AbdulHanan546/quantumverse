import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
// import { getAllChapterAggregates } from "../../api/chapterProgress"; // Removed
import GenerateModal from "../../components/GenerateModal";
import { 
  BookOpen, 
  Atom, 
  Waves, 
  Zap,
  ArrowRight,
  User2,
  BarChart2
} from "lucide-react";
import { cms, cmsUrl } from "../../api/cms";
import chapterData from "../../content/chapters.json"

// --- Types ---
interface Topic {
  id: number;
  name: string;
  description: string;
}

interface Chapter {
  id: number;
  documentId: string; // We will use ID as string here
  name: string; // Mapped from 'title'
  unit: string; // Mapped from 1, 2, 3
  description: string;
  thumbnail: string; // String filename like "1.jpg"
  topics: Topic[];
}

// --- Configuration Data ---
const UNIT_CONFIG: Record<string, { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  image: string; 
  color: string;
}> = {
  "Waves": {
    icon: <Waves className="w-5 h-5" />,
    title: "WAVES: The Pinnacle of Curve",
    description: "Explore the rhythmic dance of energy transfer. From mechanical oscillations to electromagnetic spectrums, master the equations that define the motion of the universe.",
    image: "https://t3.ftcdn.net/jpg/06/23/52/82/360_F_623528258_IUnOc787vwus3Bzg1coip2BUdDWGqpTv.jpg",
    color: "text-blue-400"
  },
  "Modern Physics": {
    icon: <Atom className="w-5 h-5" />,
    title: "MODERN PHYSICS: Beyond the Atom",
    description: "Dive into the subatomic realm where classical laws break down. Understand relativity, nuclear reactions, and the fundamental building blocks of matter.",
    image: "https://wallpapercave.com/wp/wp7217466.jpg",
    color: "text-purple-400"
  },
  "Quantum Mechanics": {
    icon: <Zap className="w-5 h-5" />,
    title: "QUANTUM: The Uncertainty Principle",
    description: "Unravel the mysteries of duality. Where particles act like waves and observation changes reality. Prepared to have your intuition challenged.",
    image: "https://wallpapercave.com/wp/wp4425600.jpg",
    color: "text-emerald-400"
  },
};

// Mapping numeric IDs from JSON to String Keys
const UNIT_ID_MAP: Record<number, string> = {
  1: "Waves",
  2: "Modern Physics",
  3: "Quantum Mechanics"
};

const UNITS = Object.keys(UNIT_CONFIG);

export default function StudentHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Get current unit from URL or default
  const currentUnit = searchParams.get("unit") || "Waves";
  const currentConfig = UNIT_CONFIG[currentUnit] || UNIT_CONFIG["Waves"];

  // --- Fetch Data ---
  useEffect(() => {
    async function loadChapters() {
      try {
        // FETCHING LOCAL JSON
        const data = chapterData;

        const formatted: Chapter[] = data.map((chapter: any) => ({
          id: chapter.id,
          documentId: chapter.id.toString(), // Using ID as documentId for routing
          name: chapter.title, // Mapping 'title' to 'name'
          description: chapter.description,
          unit: UNIT_ID_MAP[chapter.unit] || "Waves", // Mapping 1 -> Waves
          thumbnail: chapter.thumbnail,
          topics: chapter.topics || [],
        }));

        setChapters(formatted);
      } catch (err) {
        console.error("Failed to fetch chapters:", err);
      } finally {
        setLoading(false);
      }
    }

    loadChapters();
  }, []);

  // --- Derived State ---
  const filteredChapters = useMemo(() => {
    return chapters.filter((c) => c.unit === currentUnit);
    // Removed sort by 'order' since JSON doesn't have it, relying on array index naturally
  }, [chapters, currentUnit]);

  // --- Handlers ---
  const handleUnitChange = (unit: string) => {
    setSearchParams({ unit });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openChapter = (chapter: Chapter) => {
    // Assuming routing still works with ID
    navigate(`/chapter/${chapter.documentId}`);
  };
  
  return (
    <div className="relative min-h-screen pb-32 bg-black">
      
      {/* --- HERO SECTION (Unchanged) --- */}
      <div className="relative w-full aspect-[21/9] min-h-[400px] overflow-hidden group">
      <div className="flex gap-8 items-center absolute z-50 top-8 right-8 tracking-widest font-light font-heading">
        <Link to="/profile" className="flex gap-2 items-center tracking-widest font-light font-heading hover:text-green-500">
          <User2 />
          <span>CHECK PROFILE</span>
        </Link>
        <Link to="/leaderboards" className="flex gap-2 items-center tracking-widest font-light font-heading hover:text-cyan-500">
          <BarChart2 />
          <span>CHECK LEADERBOARDS</span>
        </Link>
      </div>
        <div className="absolute inset-0">
          <img 
            src={currentConfig.image} 
            alt={currentConfig.title}
            className="w-full h-full object-cover opacity-80 transition-transform duration-1000 transform group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
        </div>

        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto max-w-5xl w-full px-6 pt-20 md:pt-0">
             <div className="max-w-2xl space-y-6 animate-fadeInUp">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold uppercase tracking-wider ${currentConfig.color}`}>
                   {currentConfig.icon}
                   {currentUnit} Unit
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1] drop-shadow-2xl">
                  {currentConfig.title.split(": ")[0]}
                  <span className={`block text-2xl md:text-4xl mt-2 font-medium opacity-90 ${currentConfig.color}`}>
                    {currentConfig.title.split(": ")[1]}
                  </span>
                </h1>
                <p className="text-lg text-slate-300 leading-relaxed font-light border-l-4 border-white/20 pl-4">
                  {currentConfig.description}
                </p>
                <div className="pt-4">
                   <button 
                     onClick={() => setModalOpen(true)}
                     className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-bold hover:bg-slate-200 transition active:scale-95"
                   >
                     <Zap className="w-4 h-4" />
                     Generate Study Slides
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>

      <main className="relative mx-auto max-w-5xl px-4 py-16 space-y-8">
        {/* --- Content Header --- */}
        <div className="flex items-end justify-between border-b border-gray-800 pb-4">
           <div>
             <h2 className="text-2xl font-bold text-white">Chapter Roadmap</h2>
             <p className="text-slate-500 text-sm mt-1">
               {filteredChapters.length} Chapters • {filteredChapters.reduce((acc, curr) => acc + curr.topics.length, 0)} Topics
             </p>
           </div>
        </div>
 
        {/* --- Timeline Section --- */}
        <div className="relative pl-4 md:pl-0">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className={`w-10 h-10 border-4 border-t-transparent rounded-full animate-spin ${currentConfig.color.replace('text', 'border')}`} />
                <p className="text-slate-500 animate-pulse">Loading Quantum Data...</p>
             </div>
          ) : filteredChapters.length === 0 ? (
            <div className="text-center py-20 bg-gray-900/30 rounded-2xl border border-dashed border-gray-700">
              <p className="text-slate-400">No chapters found for {currentUnit}.</p>
              <button onClick={() => handleUnitChange("Waves")} className="text-blue-400 mt-2 underline">Go to Waves</button>
            </div>
          ) : (
            <div className="relative space-y-8">
              
              {/* Vertical Timeline Line */}
              <div className="absolute left-[19px] top-4 bottom-8 w-0.5 bg-gradient-to-b from-gray-700 via-gray-800 to-transparent" />

              {filteredChapters.map((chapter, index) => {
                
                return (
                  <div key={chapter.id} className="relative pl-16 group">
                    
                    {/* The Number Node (Always gray since no progress) */}
                    <div 
                      className={`
                        absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full 
                        flex items-center justify-center z-10 border-4 border-black
                        transition-all duration-300 group-hover:scale-110 shadow-lg
                        bg-gray-800 text-slate-400 border-gray-700
                      `}
                    >
                      <span className="font-bold text-sm">{index + 1}</span>
                    </div>

                    {/* The Card */}
                    <div 
                      onClick={() => openChapter(chapter)}
                      className="
                        relative flex flex-col md:flex-row gap-6 p-5 
                        bg-gray-900/60 backdrop-blur-sm border border-white/5 rounded-xl
                        hover:border-white/10 hover:bg-gray-900 hover:shadow-2xl hover:shadow-black/50
                        transition-all duration-300 cursor-pointer group-hover:-translate-y-1
                      "
                    >
                      {/* Thumbnail Image */}
                      <div className="w-full md:w-48 shrink-0 aspect-video md:aspect-[3/1] rounded-lg overflow-hidden relative bg-black">
                        {chapter.thumbnail ? (
                          <img 
                            // Assuming images are in public/assets or similar. Adjust path as needed.
                            src={`/chapter-thumbnails/${chapter.thumbnail}`} 
                            alt={chapter.name} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 bg-gray-800">
                            <BookOpen className="w-8 h-8 opacity-50" />
                          </div>
                        )}
                        
                         <div className="absolute bottom-1 right-1 bg-black/80 text-[10px] text-white px-1.5 py-0.5 rounded font-mono border border-white/10">
                           {chapter.topics.length} TOPICS
                         </div>
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 flex flex-col justify-center min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl font-bold text-slate-100 truncate pr-4 group-hover:text-white transition-colors">
                            {chapter.name}
                          </h3>
                          <ArrowRight className="w-5 h-5 text-slate-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        </div>
                        
                        <p className="text-sm text-slate-400 mt-2 line-clamp-2 leading-relaxed h-[2.5rem]">
                          {chapter.description || "Dive into this chapter to master the fundamental concepts."}
                        </p>

                        {/* Footer Row (No progress bars) */}
                        <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                              <span className="text-xs text-slate-400 font-medium">Readings Available</span>
                            </div>
                          </div>
                          
                          <span className="text-xs text-slate-600 font-mono group-hover:text-blue-400 transition-colors">
                            START CHAPTER
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* --- Bottom Navigation (Unchanged) --- */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-md">
        <div className="backdrop-blur-xl bg-black/80 border border-white/10 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] p-2 flex items-center justify-between">
          {UNITS.map((unit) => {
            const isActive = currentUnit === unit;
            const config = UNIT_CONFIG[unit];
            return (
              <button
                key={unit}
                onClick={() => handleUnitChange(unit)}
                className={`
                  relative flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-all duration-300
                  ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'}
                `}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-white/10 rounded-xl shadow-inner -z-10 animate-pulse" />
                )}
                <div className={`mb-1 transition-transform duration-300 ${isActive ? 'scale-110 ' + config.color : ''}`}>
                  {config.icon}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                  {unit.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <GenerateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}