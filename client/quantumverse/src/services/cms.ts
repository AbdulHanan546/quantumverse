import axios from "axios";

const BASE_URL = "https://smart-dance-067fc7b146.strapiapp.com/api";

// Fetch all topics
export async function fetchAllTopics() {
  const { data } = await axios.get(`${BASE_URL}/topics/populate=*`);
  return data.data;
}
// Fetch all chapters with their topics and thumbnails
export async function fetchAllChapters() {
  const { data } = await axios.get(
    `${BASE_URL}/chapters?populate=topics,thumbnail`
  );

  return data.data;
}

// Fetch a single topic by documentId
export async function fetchTopic(documentId: string) {
  const { data } = await axios.get(`${BASE_URL}/topics/${documentId}?populate=*`);
  const topic = data?.data;

  if (!topic?.content) {
    console.warn("No content found for topic", topic);
    return [];
  }

  // 🧩 Transform CMS components into the format TopicRenderer expects
  const mappedComponents = topic.content.map((block: any) => {
    const compType = mapStrapiComponentToType(block.__component);
    return {
      type: compType,
      props: { ...block },
    };
  });

  return mappedComponents;
}

// 🔠 Map Strapi components (slide.*) to your frontend types
function mapStrapiComponentToType(strapiType: string): string {
  switch (strapiType) {
    case "slide.heading":
      return "Heading";
    case "slide.point-to-ponder":
      return "PointToPonder";
    case "slide.story":
      return "Story";
    case "slide.slice":
      return "Slice";
    case "slide.mcq":
      return "MCQ";
    case "slide.true-false":
      return "TrueFalse";
    case "slide.matching":
      return "Matching";
    case "slide.fun-fact":
      return "FunFact";
    case "slide.diagram":
      return "Diagram";
    case "slide.analogy":
      return "Analogy";
    case "slide.stack":
      return "StackOrder";
    case "slide.simulation":
      return "Simulation";
    default:
      console.warn("Unknown Strapi component:", strapiType);
      return "Unknown";
  }
}

