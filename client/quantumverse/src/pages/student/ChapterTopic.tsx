import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

interface ChapterTopicsProps {
  onSelectTopic: (documentId: string) => void;
}

export default function ChapterTopics({ onSelectTopic }: ChapterTopicsProps) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [topics, setTopics] = useState([]);
  const [chapterName, setChapterName] = useState("");
  const [loading, setLoading] = useState(true);

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

  const openTopic = (documentId: string) => {
    onSelectTopic(documentId); // fetch topic data
    navigate(`/topic/${documentId}`);
  };

  if (loading) return <p className="p-4 text-gray-400">Loading topics...</p>;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 space-y-8">
      <button className="text-green-400" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1 className="text-3xl font-bold text-green-400">{chapterName}</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {topics.map((topic: any) => (
          <button
            key={topic.documentId}
            onClick={() => openTopic(topic.documentId)}
            className="bg-gray-900/40 border border-green-400/30 rounded-xl p-4 text-left hover:border-green-400 transition"
          >
            <h2 className="text-xl font-semibold text-green-300">{topic.name}</h2>
            <p className="text-slate-400 text-sm mt-1">{topic.description}</p>
          </button>
        ))}
      </div>
    </main>
  );
}
