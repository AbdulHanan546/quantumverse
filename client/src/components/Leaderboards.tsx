import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Medal, 
  Crown, 
  ArrowLeft, 
  Zap, 
  Target,
  User
} from 'lucide-react';
import { api } from '../api/client';

// --- Types ---
interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  score: number;
  topicsCompleted: number;
  achievements: number;
}

export default function Leaderboard() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // For highlighting the current user (assuming you store ID in localstorage/context)
  // You might need to decode your JWT to get this ID on the frontend
  const currentUserId = 5; // REPLACE with actual logic: JSON.parse(atob(token.split('.')[1])).id

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/user-progress/leaderboard/global');
        setData(res.data);
      } catch (err) {
        console.error("Failed to load leaderboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
      <div className="w-10 h-10 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>
      <span className="text-green-500 font-mono text-sm animate-pulse tracking-widest">CALCULATING RANKINGS...</span>
    </div>
  );

  const topThree = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <div className="min-h-screen bg-black text-slate-200 font-sans selection:bg-green-500/30 overflow-hidden relative">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-96 bg-green-900/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 py-8 relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <button 
            onClick={() => navigate('/student')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-green-500/50 hover:text-white transition-all"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-bold uppercase tracking-wider">Dashboard</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase flex items-center gap-3 justify-center">
              <Trophy className="text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" size={32} />
              Global Rankings
            </h1>
            <p className="text-slate-500 text-sm mt-2 mb-12 font-mono">Top performing students in the neural network</p>
          </div>
          
          {/* Spacer for centering */}
          <div className="w-[100px]"></div>
        </div>

        {/* --- PODIUM SECTION --- */}
        {topThree.length > 0 && (
            <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8 mb-16 px-4">
            {/* 2nd Place */}
            {topThree[1] && (
                <div className="order-2 md:order-1 flex flex-col items-center w-full md:w-1/3">
                    <PodiumCard entry={topThree[1]} place={2} />
                </div>
            )}
            
            {/* 1st Place */}
            {topThree[0] && (
                <div className="order-1 md:order-2 flex flex-col items-center w-full md:w-1/3 -mt-10 z-20">
                    <PodiumCard entry={topThree[0]} place={1} />
                </div>
            )}

            {/* 3rd Place */}
            {topThree[2] && (
                <div className="order-3 md:order-3 flex flex-col items-center w-full md:w-1/3">
                    <PodiumCard entry={topThree[2]} place={3} />
                </div>
            )}
            </div>
        )}

        {/* --- LIST SECTION --- */}
        <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <div className="col-span-2 md:col-span-1 text-center">Rank</div>
            <div className="col-span-6 md:col-span-5">Student</div>
            <div className="col-span-2 hidden md:block text-center">Completed</div>
            <div className="col-span-2 hidden md:block text-center">Badges</div>
            <div className="col-span-4 md:col-span-2 text-right pr-4">Score</div>
          </div>

          <div className="divide-y divide-slate-800/50">
            {rest.map((entry) => (
              <div 
                key={entry.userId}
                className={`
                  grid grid-cols-12 gap-4 p-4 items-center transition-colors hover:bg-slate-800/50
                  ${entry.userId === currentUserId ? 'bg-green-900/10 border-l-2 border-green-500' : ''}
                `}
              >
                <div className="col-span-2 md:col-span-1 text-center font-mono text-slate-400 font-bold">
                  #{entry.rank}
                </div>
                <div className="col-span-6 md:col-span-5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                    <User size={14} className="text-slate-400" />
                  </div>
                  <span className={`font-semibold ${entry.userId === currentUserId ? 'text-green-400' : 'text-slate-200'}`}>
                    {entry.username} {entry.userId === currentUserId && "(You)"}
                  </span>
                </div>
                <div className="col-span-2 hidden md:flex items-center justify-center gap-1 text-slate-400 font-mono text-sm">
                   <Target size={14} className="text-slate-600" /> {entry.topicsCompleted}
                </div>
                <div className="col-span-2 hidden md:flex items-center justify-center gap-1 text-slate-400 font-mono text-sm">
                   <Medal size={14} className="text-slate-600" /> {entry.achievements}
                </div>
                <div className="col-span-4 md:col-span-2 text-right pr-4 font-mono font-bold text-green-400">
                  {entry.score.toLocaleString()}
                </div>
              </div>
            ))}
            
            {rest.length === 0 && topThree.length > 3 && (
                <div className="p-8 text-center text-slate-500 italic">
                    All other data is classified.
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Helper Component for Top 3 ---
function PodiumCard({ entry, place }: { entry: LeaderboardEntry, place: number }) {
    const isFirst = place === 1;
    
    // Color config
    const colors = {
        1: "from-yellow-500/20 to-yellow-900/20 border-yellow-500/50 text-yellow-500",
        2: "from-slate-400/20 to-slate-800/20 border-slate-400/50 text-slate-300",
        3: "from-orange-700/20 to-orange-900/20 border-orange-700/50 text-orange-400"
    };
    
    const iconColor = {
        1: "text-yellow-400",
        2: "text-slate-300",
        3: "text-orange-400"
    };

    const heightClass = isFirst ? "h-72" : "h-60";

    return (
        <div className={`
            relative w-full ${heightClass} flex flex-col items-center justify-end p-6 rounded-t-2xl border-t border-x 
            bg-gradient-to-b ${colors[place as keyof typeof colors]} backdrop-blur-sm transition-transform hover:scale-[1.02]
        `}>
            {/* Rank Badge */}
            <div className="absolute -top-6">
                {isFirst ? (
                    <Crown size={48} className="text-yellow-400 fill-yellow-400/20 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] animate-bounce-slow" />
                ) : (
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl font-black bg-black ${colors[place as keyof typeof colors]}`}>
                        {place}
                    </div>
                )}
            </div>

            {/* User Info */}
            <div className="text-center space-y-2 mb-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-slate-950 border-2 border-slate-800 flex items-center justify-center mb-3">
                    <User size={32} className={iconColor[place as keyof typeof iconColor]} />
                </div>
                <h3 className={`font-bold text-lg truncate max-w-[150px] ${isFirst ? 'text-white' : 'text-slate-200'}`}>
                    {entry.username}
                </h3>
                <div className="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-widest opacity-80">
                   <span className="flex items-center gap-1"><Target size={12}/> {entry.topicsCompleted}</span>
                   <span className="w-1 h-1 bg-current rounded-full"></span>
                   <span className="flex items-center gap-1"><Zap size={12}/> {entry.achievements}</span>
                </div>
            </div>

            {/* Score */}
            <div className={`
                px-6 py-2 rounded-full font-mono font-black text-xl shadow-lg border
                ${isFirst ? 'bg-yellow-500 text-black border-yellow-400' : 'bg-slate-900 text-white border-slate-700'}
            `}>
                {entry.score.toLocaleString()}
            </div>
            
            {/* Base Glow */}
            <div className={`absolute bottom-0 w-full h-20 bg-gradient-to-t from-current to-transparent opacity-20 ${iconColor[place as keyof typeof iconColor]}`} />
        </div>
    );
}