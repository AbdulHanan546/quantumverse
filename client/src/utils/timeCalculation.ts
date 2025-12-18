/**
 * Calculates reading time in milliseconds based on content
 * Supports text (word-based), images, and component types
 */

const WORDS_PER_MINUTE = 200; // average reading speed
const SECONDS_PER_IMAGE = 3000; // 3 seconds for images

interface TimeCalculationOptions {
  text?: string;
  hasImage?: boolean;
  componentType?: string;
  itemCount?: number; // for cards, steps, etc.
}

export function calculateReadingTime(options: TimeCalculationOptions): number {
  const { text = "", hasImage = false, componentType = "", itemCount = 1 } = options;

  let timeMs = 0;

  // Base time for text content (word-based)
  if (text) {
    const wordCount = text.trim().split(/\s+/).length;
    const readingTimeSeconds = (wordCount / WORDS_PER_MINUTE) * 60;
    timeMs += readingTimeSeconds * 1000;
  }

  // Add time for images
  if (hasImage) {
    timeMs += SECONDS_PER_IMAGE;
  }

  // Component-specific adjustments
  switch (componentType) {
    case "Story":
      // Add 2 seconds per scene for character animation
      timeMs += itemCount * 2000;
      break;
    case "FlipCardSet":
      // 3 seconds per card (flip + read)
      timeMs += itemCount * 3000;
      break;
    case "StepFlow":
      // 2 seconds per step
      timeMs += itemCount * 2000;
      break;
    case "Matching":
    case "MCQ":
    case "TrueFalse":
      // 4 seconds minimum for thinking time
      timeMs = Math.max(timeMs, 4000);
      break;
    case "Diagram":
    case "Analogy":
      // Add 3 seconds for visual comprehension
      timeMs += 3000;
      break;
    case "ConceptMap":
      // 2 seconds per link
      timeMs += itemCount * 2000;
      break;
    case "ShortAnimation":
      // Let the GIF play, add 2 seconds
      timeMs += 2000;
      break;
  }

  // Minimum 2 seconds, maximum 30 seconds per component
  return Math.max(2000, Math.min(timeMs, 30000));
}

/**
 * Extract word count from text (ignoring markdown)
 */
export function getWordCount(text: string): number {
  return text.trim().split(/\s+/).length;
}

/**
 * Calculate total time for a component
 */
export function calculateComponentTime(component: any): number {
  const { type, props } = component;
  let text = "";
  let hasImage = false;
  let itemCount = 1;

  // Extract relevant data based on component type
  switch (type) {
    case "Story":
      text = props.scenes?.map((s: any) => s.dialogue).join(" ") || "";
      itemCount = props.scenes?.length || 1;
      hasImage = props.scenes?.some((s: any) => s.background) || false;
      break;
    case "FlipCardSet":
      text = props.cards?.map((c: any) => c.front + " " + c.back).join(" ") || "";
      itemCount = props.cards?.length || 1;
      break;
    case "StepFlow":
      text = props.steps?.join(" ") || "";
      itemCount = props.steps?.length || 1;
      break;
    case "MCQ":
    case "TrueFalse":
      text = props.question || "";
      break;
    case "Diagram":
    case "Analogy":
    case "PointToPonder":
      text = (props.text || props.analogy || props.point) || "";
      hasImage = !!props.illustration || !!props.image;
      break;
    case "ShortAnimation":
      text = props.description || "";
      hasImage = !!props.gif;
      break;
    case "ConceptMap":
      text = props.center || "";
      itemCount = props.links?.length || 1;
      break;
    case "Heading":
      text = props.text || props.title || "";
      break;
    default:
      text = props.text || props.title || props.content || "";
  }

  return calculateReadingTime({
    text,
    hasImage,
    componentType: type,
    itemCount,
  });
}
