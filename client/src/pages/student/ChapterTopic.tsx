import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle2, 
  PlayCircle, 
  Lock, 
  Atom, 
  Activity 
} from "lucide-react";

import { useProgress } from "../../context/ProgressContext";
import { getChapterAggregate } from "../../api/chapterProgress";
import { fetchTopic } from "../../services/cms";

// --- Types based on your Strapi JSON ---
interface Topic {
  id: number;
  documentId: string;
  name: string;
  description: string;
}

interface ChapterData {
  name: string;
  description: string;
  unit: string;
  thumbnail: {
    url: string;
  } | null;
  topics: Topic[];
}

interface ChapterAggregate {
  totalTopics: number;
  completedTopics: number;
  averagePercent: number;
}

export default function ChapterTopics() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [chapter, setChapter] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chapterAgg, setChapterAgg] = useState<ChapterAggregate | null>(null);
  
  // Context
  const { byTopic, refresh } = useProgress();

  // --- 1. Fetch Chapter Data ---
  useEffect(() => {
    async function loadData() {
      try {
        const { data } = await axios.get(
          `https://smart-dance-067fc7b146.strapiapp.com/api/chapters?filters[documentId][$eq]=${id}&populate=*`
        );

        const fetchedChapter = data.data[0];
        
        if (!fetchedChapter) throw new Error("Chapter not found");

        setChapter({
          name: fetchedChapter.name,
          description: fetchedChapter.description,
          unit: fetchedChapter.unit || "General",
          thumbnail: fetchedChapter.thumbnail,
          topics: fetchedChapter.topics || [],
        });

      } catch (err) {
        console.error("Failed to load chapter data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  // --- 2. Fetch Progress Stats ---
  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!id) return;
    getChapterAggregate(id)
      .then((agg) => setChapterAgg(agg))
      .catch(() => setChapterAgg(null));
  }, [id, byTopic]);

  // --- 3. Handlers ---
  const openTopic = async (documentId: string) => {
    try {
      const topicData = await fetchTopic(documentId);
      navigate(`/topic/${documentId}`, { 
        state: { 
          chapterDocumentId: id,
          components: topicData 
        } 
      });
    } catch (err) {
      console.error("Failed to load topic:", err);
    }
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

  // Split title logic (if applicable based on your example)
  const [titleMain, titleSub] = chapter.name.includes(":") 
    ? chapter.name.split(":") 
    : [chapter.name, ""];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-green-500/30">
      
      {/* --- HERO SECTION --- */}
      <div className="relative w-full aspect-[21/9] min-h-[450px] overflow-hidden group">
        
        {/* Back Button (Absolute) */}
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white/80 hover:bg-white/10 hover:text-white transition-all"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Background Image with Zoom Effect */}
        <div className="absolute inset-0">
          {chapter.thumbnail?.url ? (
            <img 
              src={chapter.thumbnail.url} 
              alt={chapter.name}
              className="w-full h-full object-cover opacity-60 transition-transform duration-1000 transform group-hover:scale-105" 
            />
          ) : (
            // Fallback gradient if no image
            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 opacity-80" />
          )}
          
          {/* Overlay Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto max-w-7xl w-full px-6 pt-20 md:pt-0">
             <div className="max-w-3xl space-y-6 animate-fadeInUp">
                
                {/* Unit Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 backdrop-blur-md border border-green-500/20 text-xs font-bold uppercase tracking-widest text-green-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                   <Atom size={14} />
                   {chapter.unit} Unit
                </div>

                {/* Title */}
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1] drop-shadow-2xl">
                  {titleMain}
                  {titleSub && (
                    <span className="block text-3xl md:text-4xl mt-2 font-medium text-green-200/80">
                      {titleSub}
                    </span>
                  )}
                </h1>

                {/* Description */}
                <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-light border-l-4 border-green-500/50 pl-6 max-w-2xl">
                  {chapter.description}
                </p>

                {/* Aggregate Stats (Hero Footer) */}
                {chapterAgg && (
                  <div className="flex items-center gap-6 pt-4 text-sm font-medium text-slate-400">
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} className="text-green-400" />
                      <span>{chapterAgg.completedTopics} / {chapterAgg.totalTopics} Topics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity size={16} className={chapterAgg.averagePercent === 100 ? "text-green-400" : "text-yellow-400"} />
                      <span>{Math.round(chapterAgg.averagePercent)}% Complete</span>
                    </div>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* --- TOPICS GRID --- */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-16 -mt-10">
        
        {/* Section Header */}
        <div className="flex items-end justify-between mb-8 border-b border-slate-800 pb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="w-2 h-8 bg-green-500 rounded-sm"></span>
            Chapter Topics
          </h2>
          <span className="text-slate-500 text-sm hidden md:block">
            Master these concepts to complete the unit
          </span>
        </div>

        {/* Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
          {chapter.topics.map((topic, index) => {
            const progress = byTopic[topic.documentId];
            const percent = progress?.percent ?? 0;
            const isCompleted = progress?.status === 'completed';
            const indexStr = String(index + 1).padStart(2, '0');

            return (
              <div 
                key={topic.documentId} 
                onClick={() => openTopic(topic.documentId)}
                className="group relative bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:border-green-500/50 hover:bg-slate-900/60 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Visual Connector (The Dotted Line idea) */}
                <div className="absolute left-6 top-0 bottom-0 w-px border-l border-dashed border-slate-800 group-hover:border-green-500/30 transition-colors hidden sm:block"></div>
                
                <div className="flex gap-6 relative">
                  
                  {/* Node / Number Badge */}
                  <div className="hidden sm:flex flex-col items-center flex-shrink-0 z-10">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 shadow-lg
                      ${isCompleted 
                        ? "bg-green-500/20 border-green-500 text-green-400" 
                        : "bg-slate-950 border-slate-700 text-slate-500 group-hover:border-green-500 group-hover:text-green-400 group-hover:shadow-[0_0_10px_rgba(6,182,212,0.4)]"}
                    `}>
                      {isCompleted ? <CheckCircle2 size={18} /> : indexStr}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-semibold text-slate-100 group-hover:text-green-300 transition-colors line-clamp-1">
                        {topic.name}
                      </h3>
                      {/* Status Icon */}
                      <div className="text-slate-600 group-hover:text-green-400 transition-colors">
                        {isCompleted ? (
                           <span className="text-green-500 text-xs font-bold px-2 py-1 bg-green-500/10 rounded uppercase">Done</span>
                        ) : percent > 0 ? (
                           <PlayCircle size={20} />
                        ) : (
                           <Lock size={18} className="opacity-50"/>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 group-hover:text-slate-300 transition-colors">
                      {topic.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="pt-2">
                      <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-medium">
                        <span>Progress</span>
                        <span className={isCompleted ? "text-green-400" : "text-green-400"}>
                          {Math.round(percent)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ease-out ${
                            isCompleted ? 'bg-gradient-to-r from-green-600 to-emerald-400' : 'bg-gradient-to-r from-green-600 to-blue-400'
                          }`}
                          style={{ width: `${percent}%` }}
                        >
                          {/* Shimmer effect on bar */}
                          <div className="w-full h-full animate-pulse bg-white/10"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-green-500/0 via-green-500/10 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}