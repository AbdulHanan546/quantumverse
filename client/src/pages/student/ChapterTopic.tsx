import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  BookOpen, 
  PlayCircle, 
  Atom, 
  ArrowRight,
  CheckCircle2,
  Trophy
} from "lucide-react";
import chapterData from "../../content/chapters.json";
import { api } from "../../api/client";

// --- Types ---
interface Topic {
  id: number;
  name: string;
  description: string;
}

interface ChapterRaw {
  id: number;
  unit: number;
  title: string;
  description: string;
  thumbnail: string;
  topics: Topic[];
}

interface ProgressData {
  completed: {
    story: boolean;
    theory: boolean;
    lab: boolean;
  };
  timeSpent: any;
  achievements: string[];
}

// Unit ID to Name Mapper
const UNIT_MAP: Record<number, string> = {
  1: "Waves",
  2: "Modern Physics",
  3: "Quantum Mechanics"
};

export default function ChapterTopics() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [chapter, setChapter] = useState<ChapterRaw | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Stores progress keyed by topicId (e.g., { "1": { ... }, "2": { ... } })
  const [progressMap, setProgressMap] = useState<Record<string, ProgressData>>({});

  // --- Fetch Chapter Data ---
  useEffect(() => {
    async function loadData() {
      try {
        const found = chapterData.find((c: ChapterRaw) => c.id.toString() == id);
        if (!found) throw new Error("Chapter not found");
        setChapter(found);
        
        // Once chapter is found, fetch progress for all its topics
        await fetchProgressBatch(found.topics.map(t => t.id.toString()));
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  // --- API Helper ---
  const fetchProgressBatch = async (topicIds: string[]) => {
    try {
      const token = localStorage.getItem('token');
      if (!token || topicIds.length === 0) return;

      const res = await api.post('/user-progress/batch', 
        { topicIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Convert array response to a Map/Object for easier lookup: { "topicId": progressData }
      const map: Record<string, ProgressData> = {};
      res.data.forEach((item: any) => {
        map[item.topicId] = item.progressData;
      });
      
      setProgressMap(map);
    } catch (error) {
      console.error("Failed to sync progress:", error);
    }
  };

  // --- Logic Helper ---
  const getProgressStats = (topicId: number) => {
    const data = progressMap[topicId.toString()];
    if (!data) return { percent: 0, isComplete: false, tasks: 0 };

    const { story, theory, lab } = data.completed;
    const completedTasks = [story, theory, lab].filter(Boolean).length;
    const percent = Math.round((completedTasks / 3) * 100);

    return { percent, isComplete: percent === 100, tasks: completedTasks };
  };

  // --- Render Helpers ---
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-400"></div>
      </div>
    );
  }

  if (!chapter) return <div className="text-white p-10">Chapter not found.</div>;

  const [titleMain, titleSub] = chapter.title.includes(":") 
    ? chapter.title.split(":") 
    : [chapter.title, ""];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-green-500/30">
      
      {/* --- HERO SECTION --- */}
      <div className="relative w-full aspect-[21/9] min-h-[400px] overflow-hidden group">
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white/80 hover:bg-white/10 hover:text-white transition-all"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="absolute inset-0">
          {chapter.thumbnail ? (
            <img 
              src={`/chapter-thumbnails/${chapter.thumbnail}`} 
              alt={chapter.title}
              className="w-full h-full object-cover opacity-60 transition-transform duration-1000 transform group-hover:scale-105" 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 opacity-80" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent" />
        </div>

        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto max-w-7xl w-full px-6 pt-20 md:pt-0">
             <div className="max-w-3xl space-y-6 animate-fadeInUp">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 backdrop-blur-md border border-green-500/20 text-xs font-bold uppercase tracking-widest text-green-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                   <Atom size={14} />
                   {UNIT_MAP[chapter.unit] || "Unit " + chapter.unit}
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1] drop-shadow-2xl">
                  {titleMain}
                  {titleSub && <span className="block text-3xl md:text-4xl mt-2 font-medium text-green-200/80">{titleSub}</span>}
                </h1>
                <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-light border-l-4 border-green-500/50 pl-6 max-w-2xl">
                  {chapter.description}
                </p>
                <div className="flex items-center gap-2 pt-4 text-sm font-medium text-slate-400">
                  <BookOpen size={16} className="text-green-400" />
                  <span>{chapter.topics.length} Topics inside this chapter</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* --- TOPICS GRID --- */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-16 -mt-10">
        <div className="flex items-end justify-between mb-8 border-b border-slate-800 pb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="w-2 h-8 bg-green-500 rounded-sm"></span>
            Chapter Topics
          </h2>
          <span className="text-slate-500 text-sm hidden md:block">Explore the concepts</span>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
          {chapter.topics.map((topic, index) => {
            const indexStr = String(index + 1).padStart(2, '0');
            const { percent, isComplete, tasks } = getProgressStats(topic.id);

            return (
              <div 
                key={topic.id} 
                onClick={() => navigate(`/topic/${topic.id}`, { state: { chapterId: chapter?.id } })}
                className={`
                  group relative backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 cursor-pointer overflow-hidden
                  ${isComplete 
                    ? "bg-slate-900/60 border-green-500/30 hover:border-green-500/60 shadow-[0_0_15px_rgba(34,197,94,0.05)]" 
                    : "bg-slate-900/40 border-slate-800 hover:border-green-500/50 hover:bg-slate-900/60"
                  }
                `}
              >
                {/* Visual Connector Line */}
                <div className={`absolute left-6 top-0 bottom-0 w-px border-l border-dashed transition-colors hidden sm:block
                   ${isComplete ? "border-green-500/30" : "border-slate-800 group-hover:border-green-500/30"}`}>
                </div>
                
                <div className="flex gap-6 relative">
                  {/* Number Badge */}
                  <div className="hidden sm:flex flex-col items-center flex-shrink-0 z-10">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 shadow-lg
                      ${isComplete
                        ? "bg-green-500/10 border-green-500 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                        : "bg-slate-950 border-slate-700 text-slate-500 group-hover:border-green-500 group-hover:text-green-400"
                      }
                    `}>
                      {isComplete ? <CheckCircle2 size={18} /> : indexStr}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="flex-1 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`text-xl font-semibold transition-colors line-clamp-1 ${isComplete ? "text-green-300" : "text-slate-100 group-hover:text-green-300"}`}>
                        {topic.name}
                      </h3>
                      <div className="text-slate-600 group-hover:text-green-400 transition-colors">
                        {isComplete ? <Trophy size={24} className="text-green-500" /> : <PlayCircle size={24} className="opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all" />}
                      </div>
                    </div>
                    
                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 group-hover:text-slate-300 transition-colors mb-4">
                      {topic.description}
                    </p>

                    {/* Progress Bar Section */}
                    <div className="mt-auto">
                      <div className="flex justify-between items-end mb-2">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 group-hover:text-green-400 transition-colors">
                          {isComplete ? "Completed" : (percent > 0 ? "Resume" : "Start")} <ArrowRight size={12} />
                        </div>
                        {percent > 0 && (
                          <span className={`text-xs font-mono font-medium ${isComplete ? 'text-green-400' : 'text-slate-500'}`}>
                            {percent}%
                          </span>
                        )}
                      </div>
                      
                      {/* Bar */}
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${isComplete ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-green-500/70'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      
                      {/* Sub-module dots (optional detail) */}
                      {percent > 0 && !isComplete && (
                        <div className="flex gap-1 mt-2 justify-end">
                           <div className={`w-1.5 h-1.5 rounded-full ${tasks >= 1 ? 'bg-green-500' : 'bg-slate-800'}`} />
                           <div className={`w-1.5 h-1.5 rounded-full ${tasks >= 2 ? 'bg-green-500' : 'bg-slate-800'}`} />
                           <div className={`w-1.5 h-1.5 rounded-full ${tasks >= 3 ? 'bg-green-500' : 'bg-slate-800'}`} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-green-500/0 via-green-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}