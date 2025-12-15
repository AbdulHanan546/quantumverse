import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useProgress } from "../../context/ProgressContext";
import { getChapterAggregate } from "../../api/chapterProgress";
import { fetchTopic } from "../../services/cms";
interface ChapterTopicsProps {
  onSelectTopic: (documentId: string) => void;
}

export default function ChapterTopics() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [topics, setTopics] = useState([]);
  const [chapterName, setChapterName] = useState("");
  const [loading, setLoading] = useState(true);
  const { byTopic, refresh } = useProgress();
  const [chapterAgg, setChapterAgg] = useState<{ totalTopics: number; completedTopics: number; averagePercent: number } | null>(null);

  useEffect(() => {
    async function loadTopics() {
      try {
       const { data } = await axios.get(
  `https://smart-dance-067fc7b146.strapiapp.com/api/chapters?filters[documentId][$eq]=${id}&populate=*`
);

const chapter = data.data[0]; // only one result
if (!chapter) throw new Error("Chapter not found");

// NO .attributes here
setChapterName(chapter.name);

const formattedTopics =
  chapter.topics?.map((topic: any) => ({
    id: topic.id,
    documentId: topic.documentId,
    name: topic.name,
    description: topic.description,
  })) || [];

setTopics(formattedTopics);


      } catch (err) {
        console.error("Failed to load topics:", err);
      } finally {
        setLoading(false);
      }
    }

    loadTopics();
  }, [id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!id) return;
    getChapterAggregate(id)
      .then((agg) => setChapterAgg({
        totalTopics: agg.totalTopics,
        completedTopics: agg.completedTopics,
        averagePercent: agg.averagePercent,
      }))
      .catch(() => setChapterAgg(null));
  }, [id, byTopic]);

   // In ChapterTopics.tsx
const openTopic = async (documentId: string) => {
  try {
    const topicData = await fetchTopic(documentId);
    console.log("Fetched topic data:", topicData);
    
    // topicData IS the components array, not an object with a components property
    navigate(`/topic/${documentId}`, { 
      state: { 
        chapterDocumentId: id,
        components: topicData  // Changed from topicData.components to just topicData
      } 
    });
  } catch (err) {
    console.error("Failed to load topic:", err);
  }
};



  if (loading) return <p className="p-4 text-gray-400">Loading topics...</p>;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 space-y-8">
      <button className="text-green-400" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div>
        <h1 className="text-3xl font-bold text-green-400">{chapterName}</h1>
        {chapterAgg && (
          <div className="text-green-300 text-xs inline-block border border-green-400/40 rounded-full px-2 py-1 mt-2">
            {chapterAgg.completedTopics}/{chapterAgg.totalTopics} completed · {chapterAgg.averagePercent}% avg
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {topics.map((topic: any) => {
          const pr = byTopic[topic.documentId];
          const percent = pr?.percent ?? 0;
          const isCompleted = pr?.status === 'completed';
          return (
            <div key={topic.documentId} className="bg-gray-900/40 border border-green-400/30 rounded-xl p-4 text-left hover:border-green-400 transition">
              <button onClick={() => openTopic(topic.documentId)} className="text-left w-full">
                <h2 className="text-xl font-semibold text-green-300">{topic.name}</h2>
                <p className="text-slate-400 text-sm mt-1">{topic.description}</p>
                <div className="text-xs px-2 py-1 rounded-full border border-green-400/40 text-green-300 mt-3 inline-block">
                  {isCompleted ? 'Completed ✅' : `${percent}%`}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}
