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
function resolveMedia(media: any): string | null {
  if (!media) return null;
  // If media is string (legacy)
  if (typeof media === "string") return media;
  // Strapi media object
  return media?.url ?? media?.data?.attributes?.url ?? null;
}


// Fetch a single topic by documentId
export async function fetchTopic(documentId: string) {
  try {
    // 1️⃣ Fetch topic content shallowly
    const { data: topicRes } = await axios.get(
      `${BASE_URL}/topics/${documentId}?populate[content][populate]=*`
    );
    const topic = topicRes?.data;
    if (!topic?.content) return [];

    // 2️⃣ Fetch all characters separately
    const { data: charactersRes } = await axios.get(
      `${BASE_URL}/characters?populate[expressions][populate]=*`
    );
    const characters = charactersRes?.data || [];
    console.log("Fetched characters:", characters);

    // 3️⃣ Map and merge nested data
    const mappedComponents = topic.content.flatMap((block: any) => {
      const compType = mapStrapiComponentToType(block.__component);
      if (!compType) return [];

      // TrueFalse: one component per exercise
      if (block.__component === "slide.true-false" && block.exercises?.length) {
        return block.exercises.map((ex: any) => ({
          type: compType,
          props: {
            statement: ex.statement,
            isTrue: ex.boolean,
            negativeReason: ex.negativeReason,
          },
        }));
      }

      const props: any = { ...block };
      // Heading → Extract background image URL
if (block.__component === "slide.heading") {
  props.background =
    typeof block.background === "string"
      ? block.background
      : block.background?.url ?? null;
}


      // Diagram
      if (block.__component === "slide.diagram") {
        props.illustration = block.illustration?.url ?? "";
        props.text = block.text ?? "";
      }
if (block.__component === "slide.story") {
  props.scenes = block.scenes?.map((scene: any) => {
    
    let assignedChar = null;
    if (characters.length > 0) {
      const randomChar = characters[Math.floor(Math.random() * characters.length)];
      assignedChar = {
        id: randomChar.id,
        name: randomChar.name,
        description: randomChar.description,
        image:
          randomChar.expressions?.[0]?.image?.url ??
          randomChar.image?.url ??
          null,
        expressions:
          randomChar.expressions?.map((exp: any) => ({
            image: exp.image?.url ?? null,
            emotionType: exp.emotionType,
          })) ?? [],
      };
    }

    return {
      dialogue: scene.dialogue ?? "",
      emotion: scene.emotion ?? "",
      orientation:
        scene.orientation?.toLowerCase().replace(" ", "-") ?? "bottom-right",

      // ⭐ Universal Strapi media extraction
      background: resolveMedia(scene.background),

      character: assignedChar,
    };
  });
}


      // Story / FunFact / PointToPonder → assign random character
      if ([ "slide.fun-fact", "slide.point-to-ponder"].includes(block.__component)) {
        if (characters.length > 0) {
          const randomChar = characters[Math.floor(Math.random() * characters.length)];
          props.character = {
            id: randomChar.id,
            name: randomChar.name,
            description: randomChar.description,
            image: randomChar.expressions?.[0]?.image?.url ?? null,
          };
        }
      }

    if (block.__component === "slide.stack") {
  // Main illustration for the top of the StackOrder
  props.illustration = typeof block.illustration === "string"
    ? block.illustration
    : block.illustration?.url ?? null;

  // Map blocks separately
  if (block.blocks) {
    props.blocks = block.blocks.map((b: any, idx: number) => ({
      id: b.id ?? `stack-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      statement: b.statement ?? "",
      order: b.order ?? idx,
      illustration: typeof b.illustration === "string"
        ? b.illustration
        : b.illustration?.url ?? null, // <-- block-specific illustration
    }));
  } else {
    props.blocks = [];
  }
}




      // Matching options
      if (block.__component === "slide.matching" && block.options) {
        props.options = block.options;
      }

      return {
        type: compType,
        props,
      };
    });

    console.log("Fetched topic components:", mappedComponents);
    return mappedComponents;
    
  } catch (err) {
    console.error("Failed to fetch topic:", err);
    return [];
  }
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

