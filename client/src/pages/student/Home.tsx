import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { getAllChapterAggregates } from "../../api/chapterProgress";
import GenerateModal from "../../components/GenerateModal";

// Import dummy topic
import { dummyTopic } from "../../data/dummyTopic";

interface Topic {
  id: number;
  documentId: string;
  name: string;
  description?: string;
}

interface Chapter {
  id: number;
  documentId: string; 
  name: string;
  description: string;
  thumbnail?: { url: string };
  topics: Topic[];
}

export default function StudentHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [aggregates, setAggregates] = useState<Record<string, { totalTopics: number; completedTopics: number; averagePercent: number }>>({});
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function loadChapters() {
      try {
        const { data } = await axios.get(
          "https://smart-dance-067fc7b146.strapiapp.com/api/chapters?populate=*"
        );

        const formatted: Chapter[] = data.data.map((chapter: any) => ({
          id: chapter.id,
          documentId: chapter.documentId,
          name: chapter.name,
          description: chapter.description,
          thumbnail: chapter.thumbnail,
          topics: chapter.topics || [],
        }));

        setChapters(formatted);

        try {
          const aggs = await getAllChapterAggregates();
          const map: Record<string, { totalTopics: number; completedTopics: number; averagePercent: number }> = {};
          for (const a of aggs) {
            map[a.chapterDocumentId] = {
              totalTopics: a.totalTopics,
              completedTopics: a.completedTopics,
              averagePercent: a.averagePercent,
            };
          }
          setAggregates(map);
        } catch (e) {
          // ignore if user has no progress yet
        }
      } catch (err) {
        console.error("Failed to fetch chapters:", err);
      } finally {
        setLoading(false);
      }
    }

    loadChapters();
  }, []);

  const openChapter = (chapter: Chapter) => {
    navigate(`/chapter/${chapter.documentId}`);
  };

  const openGenerateSlides = () => {
    setModalOpen(true);
  };

  const startDummyTopic = () => {
  navigate("/topic/dummy-quantum-entanglement", {
    state: { components: dummyTopic, title: "Quantum Entanglement" },
  });
};

 // if (loading) return <p className="p-4 text-gray-400">Loading...</p>;

  return (
  <main className="mx-auto max-w-7xl px-4 py-6 space-y-8">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome{user?.email ? `, ${user.email}` : ""}!
        </h1>
        <p className="text-slate-400 mt-2">Choose a chapter to begin learning.</p>
      </div>
      <button
        onClick={openGenerateSlides}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium whitespace-nowrap"
      >
        Generate Slides
      </button>
    </div>

    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {/* Dummy Topic Card – SHOWS IMMEDIATELY */}
      <button
        onClick={startDummyTopic}
        className="bg-gray-900/40 border border-green-400/30 rounded-xl p-4 text-left hover:border-green-400 transition relative"
      >
        
        <h2 className="text-2xl font-semibold text-green-400">Compton Effect</h2>
        <p className="text-slate-400 text-sm mt-1">
          Explore  topic demonstrating compton effect with interactive components.
        </p>
        
      </button>

      {/* Real Chapters */}
      {loading ? (
        <p className="text-gray-500 col-span-full">Loading chapters…</p>
      ) : (
        chapters.map((chapter) => (
          <button
            key={chapter.id}
            onClick={() => openChapter(chapter)}
            className="bg-gray-900/40 border border-green-400/30 rounded-xl p-4 text-left hover:border-green-400 transition relative"
          >
            {chapter.thumbnail?.url && (
              <img
                src={chapter.thumbnail.url}
                alt={chapter.name}
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
            )}
            <h2 className="text-2xl font-semibold text-green-400">{chapter.name}</h2>
            <p className="text-slate-400 text-sm mt-1">{chapter.description}</p>
            {aggregates[chapter.documentId] && (
              <div className="absolute top-4 right-4 text-xs px-2 py-1 rounded-full border border-green-400/40 text-green-300">
                {aggregates[chapter.documentId].completedTopics}/
                {aggregates[chapter.documentId].totalTopics} completed ·{" "}
                {aggregates[chapter.documentId].averagePercent}% avg
              </div>
            )}
          </button>
        ))
      )}
    </div>

    {/* Generate Modal */}
    <GenerateModal
      open={modalOpen}
      onClose={() => {
        setModalOpen(false);
      }}
    />
  </main>
);

}
