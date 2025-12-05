import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAllChapterAggregates } from "../api/chapterProgress";
import axios from "axios";

export default function Navbar() {
  const { user } = useAuth();
  const [completedChapters, setCompletedChapters] = useState<number | null>(null);
  const [totalChapters, setTotalChapters] = useState<number | null>(null);

  // Generate initials for avatar
  const initials = user?.email
    ? user.email
        .split("@")[0]
        .split(".")
        .map((n) => n[0].toUpperCase())
        .join("")
    : "U";

  useEffect(() => {
    let mounted = true;
    async function loadAggs() {
      try {
        const aggs = await getAllChapterAggregates();
        const count = aggs.filter((a) => a.totalTopics > 0 && a.completedTopics === a.totalTopics).length;
        if (mounted) setCompletedChapters(count);
      } catch {
        if (mounted) setCompletedChapters(null);
      }
    }
    async function loadTotalChapters() {
      try {
        const { data } = await axios.get(
          "https://smart-dance-067fc7b146.strapiapp.com/api/chapters?fields=documentId"
        );
        const total = Array.isArray(data?.data) ? data.data.length : 0;
        if (mounted) setTotalChapters(total);
      } catch {
        if (mounted) setTotalChapters(null);
      }
    }
    if (user) {
      loadAggs();
      loadTotalChapters();
    } else {
      setCompletedChapters(null);
      setTotalChapters(null);
    }
    return () => {
      mounted = false;
    };
  }, [user]);

  const percent = useMemo(() => {
    if (completedChapters == null || totalChapters == null || totalChapters === 0) return null;
    return Math.round((completedChapters / totalChapters) * 100);
  }, [completedChapters, totalChapters]);

  return (
    <nav className="w-full bg-gray-900/80 backdrop-blur-md px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-green-400">
        Quantum Verse
      </Link>

      {user && (
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-green-400 flex items-center justify-center text-black font-bold">
            {initials}
          </div>
          {/* User Name/Email */}
          <span className="text-gray-200 text-sm font-medium">{user.email}</span>
          {percent !== null && (
            <div className="ml-3 flex items-center">
              <div
                className="w-10 h-10 rounded-full relative"
                style={{
                  background: `conic-gradient(#22c55e ${percent * 3.6}deg, rgba(34,197,94,0.2) 0deg)`,
                }}
                title={`Chapter progress: ${percent}%`}
              >
                <div className="absolute inset-1 rounded-full bg-gray-900 flex items-center justify-center">
                  <span className="text-[10px] font-semibold text-green-300">{percent}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
