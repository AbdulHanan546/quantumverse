import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

interface Topic {
  id: number;
  documentId: string;
  name: string;
  description?: string;
}

interface Chapter {
  id: number;
  documentId: string; // add this
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



  if (loading) return <p className="p-4 text-gray-400">Loading...</p>;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 space-y-8">
      <h1 className="text-3xl font-bold">
        Welcome{user?.email ? `, ${user.email}` : ""}!
      </h1>

      <p className="text-slate-400">Choose a chapter to begin learning.</p>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {chapters.map((chapter) => (
  <button
    key={chapter.id}
    onClick={() => openChapter(chapter)}
    className="bg-gray-900/40 border border-green-400/30 rounded-xl p-4 text-left hover:border-green-400 transition"
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
  </button>
))}

      </div>
    </main>
  );
}
