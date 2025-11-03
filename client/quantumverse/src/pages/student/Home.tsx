import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

interface StudentHomeProps {
  onSelectTopic: (slug: string) => void;
}

interface Topic {
  id: number;
  documentId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export default function StudentHome({ onSelectTopic }: StudentHomeProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTopics() {
      try {
        setLoading(true);
        const { data } = await axios.get(
          "https://smart-dance-067fc7b146.strapiapp.com/api/topics"
        );
        setTopics(data?.data || []);
      } catch (err) {
        console.error("Failed to fetch topics:", err);
        setError("Unable to load topics from CMS.");
      } finally {
        setLoading(false);
      }
    }

    loadTopics();
  }, []);

  const handleClick = async (documentId: string) => {
    await onSelectTopic(documentId);
    navigate(`/topic/${documentId}`);
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-slate-400 animate-pulse">Loading topics...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-red-400">{error}</p>
      </main>
    );
  }

  if (topics.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-slate-400">
          No topics available right now. Please check back later.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-4">
        Welcome{user?.email ? `, ${user.email}` : ""}!
      </h1>
      <p className="text-slate-400 mb-6">
        Choose a topic below to start your quantum learning journey.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => (
          <button
            key={topic.documentId}
            onClick={() => handleClick(topic.documentId)}
            className="rounded-xl border border-green-400/30 bg-gray-900/40 p-6 hover:bg-green-500/10 transition flex flex-col items-start text-left"
          >
            <h3 className="text-xl font-semibold text-green-400">
              {topic.name}
            </h3>
            <p className="text-slate-400 mt-2 line-clamp-2">
              {topic.description || "Click to explore this topic."}
            </p>
          </button>
        ))}
      </div>
    </main>
  );
}
