import React, { useEffect, useState } from 'react';
import { 
  Trophy, 
  BookOpen, 
  Activity, 
  Clock, 
  Target, 
  Zap, 
  BarChart2,
  Calendar,
  Lock,
  ArrowLeft
} from 'lucide-react';
import { getMyStats } from '../api/user-progress';
import { format } from "date-fns";
import { useNavigate } from 'react-router-dom';

// --- Types Matching Backend Response ---
interface StatsData {
  overview: {
    account_age_days: number;
    last_active_at: string | null;
    global_completion_rate: number;
  };
  topics: {
    total_interacted: number;
    completed: number;
    in_progress: number;
    not_started: number;
    average_percent: number;
    total_blocks_read: number;
  };
  chapters: {
    total_interacted: number;
    average_percent: number;
    progress_breakdown: {
      total_topics_available: number;
      total_topics_completed: number;
      remaining_topics: number;
    };
  };
}

// --- Badge Configuration ---
const BADGES_CONFIG = [
  { id: 1, name: 'Newcomer', desc: 'Joined the platform', img: '/badges/1.png', condition: (s: StatsData) => s.overview.account_age_days >= 0 },
  { id: 2, name: 'First Step', desc: 'Completed your first topic', img: '/badges/2.png', condition: (s: StatsData) => s.topics.completed >= 1 },
  { id: 3, name: 'On a Roll', desc: 'Completed 5 topics', img: '/badges/3.png', condition: (s: StatsData) => s.topics.completed >= 5 },
  { id: 4, name: 'Scholar', desc: 'Read over 500 blocks', img: '/badges/4.png', condition: (s: StatsData) => s.topics.total_blocks_read >= 500 },
  { id: 5, name: 'High Achiever', desc: 'Avg score > 80%', img: '/badges/5.png', condition: (s: StatsData) => s.topics.average_percent >= 80 },
  { id: 6, name: 'Dedicated', desc: 'Active > 7 days', img: '/badges/6.png', condition: (s: StatsData) => s.overview.account_age_days >= 7 },
  { id: 7, name: 'Chapter Master', desc: '10 topics completed', img: '/badges/7.png', condition: (s: StatsData) => s.chapters.progress_breakdown.total_topics_completed >= 10 },
  { id: 8, name: 'Completionist', desc: 'Global rate > 90%', img: '/badges/8.png', condition: (s: StatsData) => s.overview.global_completion_rate >= 90 },
];

export function Profile() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getMyStats();
        setStats(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load profile statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center space-y-4">
      <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
      <span className="text-emerald-500/80 font-mono text-sm animate-pulse">SYNCING_QUANTUM_LINK...</span>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-red-400 font-mono">
      [ERROR]: {error}
    </div>
  );

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 font-sans selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Section */}
        <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800/50 flex items-center justify-between shadow-lg">
          <div className='flex gap-4 items-center'>
            <button onClick={() => navigate("/student")} className='bg-zinc-900 hover:bg-zinc-700 cursor-pointer text-white px-4 py-2 rounded-lg transition-colors border border-zinc-800'>
                <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Subject Profile
                </h1>
                <p className="text-zinc-400 mt-1 text-sm md:text-base">
                Neural interface statistics and progression tracking.
                </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium shadow-[0_0_10px_-3px_rgba(16,185,129,0.2)]">
            <Calendar className="w-4 h-4" />
            <span>Operational for {stats.overview.account_age_days} days</span>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Topics Completed" 
            value={stats.topics.completed} 
            subValue={`/${stats.chapters.progress_breakdown.total_topics_available} initiated`}
            icon={<BookOpen className="w-5 h-5" />}
          />
          <StatCard 
            title="Global Sync" 
            value={`${stats.overview.global_completion_rate}%`} 
            subValue="Completion Rate"
            icon={<Activity className="w-5 h-5" />}
          />
          <StatCard 
            title="Performance" 
            value={`${stats.topics.average_percent}%`} 
            subValue="Avg. Score"
            icon={<Target className="w-5 h-5" />}
          />
          <StatCard 
            title="Data Processed" 
            value={stats.topics.total_blocks_read} 
            subValue="Blocks Read"
            icon={<Zap className="w-5 h-5" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Detailed Stats */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-md h-full">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-zinc-800 pb-4">
                <BarChart2 className="w-5 h-5 text-emerald-500" />
                Data Analysis
              </h3>
              
              <div className="space-y-8">
                {/* Topic Status */}
                <div>
                  <div className="flex justify-between text-xs uppercase tracking-wider mb-2 text-zinc-500 font-semibold">
                    <span>In Progress</span>
                    <span className="text-emerald-400">{stats.topics.in_progress} Topics</span>
                  </div>
                  <ProgressBar 
                    current={stats.topics.in_progress} 
                    total={stats.topics.total_interacted || 1} 
                  />
                </div>

                {/* Chapter Progress */}
                <div>
                  <div className="flex justify-between text-xs uppercase tracking-wider mb-2 text-zinc-500 font-semibold">
                    <span>Chapter Completion</span>
                    <span className="text-emerald-400">
                      {stats.chapters.progress_breakdown.total_topics_completed} / {stats.chapters.progress_breakdown.total_topics_available}
                    </span>
                  </div>
                  <ProgressBar 
                    current={stats.overview.global_completion_rate} 
                    total={100} 
                    isPercent 
                  />
                </div>

                {/* Last Active */}
                <div className="pt-6 border-t border-zinc-800 mt-4">
                  <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-2">Last Uplink</p>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <span className="font-mono text-sm">
                      {stats.overview.last_active_at 
                        ? format(new Date(stats.overview.last_active_at) , 'do MMMM yyyy')
                        : 'NO_DATA'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Badges */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-md h-full">
              <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-emerald-500" />
                  Achievements
                </h3>
                <span className="text-xs font-mono text-emerald-500/80 bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-900">
                  {BADGES_CONFIG.filter(b => b.condition(stats)).length} / {BADGES_CONFIG.length} UNLOCKED
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {BADGES_CONFIG.map((badge) => {
                  const isUnlocked = badge.condition(stats);
                  return (
                    <div 
                      key={badge.id} 
                      className={`
                        relative group flex flex-col items-center p-4 rounded-xl border transition-all duration-500
                        ${isUnlocked 
                          ? 'bg-gradient-to-br from-zinc-800 to-zinc-900 border-emerald-500/30 shadow-[0_0_15px_-5px_rgba(16,185,129,0.15)] hover:border-emerald-500/50' 
                          : 'bg-zinc-900/40 border-zinc-800/60 opacity-60 grayscale'
                        }
                      `}
                    >
                      {/* Badge Image */}
                      <div className="w-16 h-16 mb-4 relative">
                        <img 
                          src={badge.img} 
                          alt={badge.name} 
                          className={`
                            w-full h-full object-contain drop-shadow-md transition-transform duration-300 
                            ${isUnlocked ? 'group-hover:scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]' : ''}
                          `}
                          onError={(e) => {
                             (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150/000000/10b981?text=?';
                          }}
                        />
                        {!isUnlocked && (
                           <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] rounded-full">
                             <Lock className="w-5 h-5 text-zinc-500" />
                           </div>
                        )}
                      </div>
                      
                      <h4 className={`text-sm font-bold text-center mb-1 ${isUnlocked ? 'text-white group-hover:text-emerald-400 transition-colors' : 'text-zinc-600'}`}>
                        {badge.name}
                      </h4>
                      <p className="text-[10px] uppercase tracking-wide text-center text-zinc-500 leading-tight">
                        {badge.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---

function StatCard({ title, value, subValue, icon }: { title: string, value: string|number, subValue: string, icon: any }) {
  return (
    <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 flex items-start justify-between group hover:border-emerald-500/30 transition-all duration-300 hover:shadow-[0_4px_20px_-10px_rgba(16,185,129,0.1)]">
      <div>
        <p className="text-xs uppercase tracking-wider font-semibold text-zinc-500 mb-1 group-hover:text-emerald-500/80 transition-colors">{title}</p>
        <h2 className="text-2xl font-bold text-white tracking-tight">{value}</h2>
        <p className="text-xs text-zinc-600 mt-1 font-mono">{subValue}</p>
      </div>
      <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-black transition-all duration-300">
        {icon}
      </div>
    </div>
  );
}

function ProgressBar({ current, total, isPercent = false }: { current: number, total: number, isPercent?: boolean }) {
  const percentage = isPercent ? current : Math.min(100, (current / total) * 100);
  
  return (
    <div className="w-full bg-zinc-800/80 rounded-full h-2 overflow-hidden border border-zinc-800">
      <div 
        className="bg-emerald-500 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-out" 
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}