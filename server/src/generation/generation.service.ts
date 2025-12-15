import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { GenerateSlidesDto } from './dto/generate-slides.dto';

// ============= TYPE DEFINITIONS =============

export type AllowedImage = "/images/4.png" | "/images/5.png" | "/images/6.png" | "/images/7.png";

export type CharacterEmotion = "curious" | "thinking" | "happy" | "excited" | "neutral";
export type Orientation = "bottom-right" | "bottom-left" | "top-right" | "top-left" | "center";

export type ComponentType =
  | "Heading"
  | "PointToPonder"
  | "Story"
  | "Diagram"
  | "FlipCardSet"
  | "Slice"
  | "StepFlow"
  | "Analogy"
  | "ComparisonCards"
  | "ZoomReveal"
  | "ShortAnimation"
  | "ConceptMap";

export interface HeadingProps {
  title: string;
  description: string;
  background: AllowedImage;
}

export interface PointToPonderProps {
  point: string;
  character: { name: string; image: AllowedImage };
  characterEmotion: CharacterEmotion;
}

export interface StoryScene {
  dialogue: string;
  character: { name: string; image: AllowedImage };
  background: AllowedImage;
  emotion: CharacterEmotion;
  orientation: Orientation;
}

export interface StoryProps {
  scenes: StoryScene[];
}

export interface DiagramProps {
  title: string;
  illustration: AllowedImage;
  text: string;
}

export interface FlipCard {
  front: string;
  back: string;
}

export interface FlipCardSetProps {
  title: string;
  cards: FlipCard[];
}

export interface SliceProps {
  title: string;
  content: string;
}

export interface StepFlowProps {
  title: string;
  steps: string[];
}

export interface AnalogyProps {
  analogy: string;
  point: string;
}

export interface ComparisonSide {
  label: string;
  image: AllowedImage;
  description: string;
}

export interface ComparisonCardsProps {
  title: string;
  left: ComparisonSide;
  right: ComparisonSide;
}

export interface ZoomLabel {
  text: string;
  x: number; // 0-100
  y: number; // 0-100
}

export interface ZoomRevealProps {
  title: string;
  image: AllowedImage;
  labels: ZoomLabel[];
}

export interface ShortAnimationProps {
  title: string;
  gif: AllowedImage;
  description: string;
}

export interface ConceptMapProps {
  title: string;
  center: string;
  links: string[];
}

export interface SlideComponent<T = any> {
  type: ComponentType;
  props: T;
}

export interface GeminiOptions {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

// ============= UTILITY FUNCTIONS =============

function sanitizeString(s: any, fallback = ""): string {
  if (typeof s === "string") return s.trim();
  if (s == null) return fallback;
  try {
    return String(s).trim();
  } catch {
    return fallback;
  }
}

function sanitizeArray<T>(a: any, fallback: T[] = []): T[] {
  if (Array.isArray(a)) return a as T[];
  return fallback;
}

function isAllowedImage(img: string): img is AllowedImage {
  const allowedImages: AllowedImage[] = ["/images/4.png", "/images/5.png", "/images/6.png", "/images/7.png"];
  return allowedImages.includes(img as AllowedImage);
}

function coerceAllowedImage(img: string): AllowedImage {
  if (isAllowedImage(img)) return img as AllowedImage;
  return "/images/4.png";
}

function coerceEmotion(e: any): CharacterEmotion {
  const allowed: CharacterEmotion[] = ["curious", "thinking", "happy", "excited", "neutral"];
  return allowed.includes(e) ? e : "neutral";
}

function coerceOrientation(o: any): Orientation {
  const allowed: Orientation[] = ["bottom-right", "bottom-left", "top-right", "top-left", "center"];
  return allowed.includes(o) ? o : "bottom-right";
}

function clamp01To100(n: any): number {
  const x = Number(n);
  if (isNaN(x)) return 50;
  return Math.max(0, Math.min(100, Math.round(x)));
}

// ============= SANITIZATION FUNCTIONS =============

function sanitizeHeadingProps(p: any): HeadingProps {
  return {
    title: sanitizeString(p?.title, "Untitled"),
    description: sanitizeString(p?.description, ""),
    background: coerceAllowedImage(p?.background)
  };
}

function sanitizePointToPonderProps(p: any): PointToPonderProps {
  return {
    point: sanitizeString(p?.point, "Consider this..."),
    character: {
      name: sanitizeString(p?.character?.name, "Guide"),
      image: coerceAllowedImage(p?.character?.image || "/images/6.png")
    },
    characterEmotion: coerceEmotion(p?.characterEmotion || "curious")
  };
}

function sanitizeStoryProps(p: any): StoryProps {
  const scenes = sanitizeArray<any>(p?.scenes).map((s: any) => ({
    dialogue: sanitizeString(s?.dialogue, ""),
    character: {
      name: sanitizeString(s?.character?.name, "Guide"),
      image: coerceAllowedImage(s?.character?.image || "/images/6.png")
    },
    background: coerceAllowedImage(s?.background || "/images/5.png"),
    emotion: coerceEmotion(s?.emotion || "neutral"),
    orientation: coerceOrientation(s?.orientation || "bottom-right")
  }));
  if (scenes.length === 0) {
    scenes.push({
      dialogue: "Let's explore this topic.",
      character: { name: "Guide", image: "/images/6.png" },
      background: "/images/5.png",
      emotion: "curious",
      orientation: "bottom-right"
    });
  }
  return { scenes };
}

function sanitizeDiagramProps(p: any): DiagramProps {
  return {
    title: sanitizeString(p?.title, "Diagram"),
    illustration: coerceAllowedImage(p?.illustration || "/images/4.png"),
    text: sanitizeString(p?.text, "")
  };
}

function sanitizeFlipCardSetProps(p: any): FlipCardSetProps {
  const cards = sanitizeArray<any>(p?.cards).map((c: any) => ({
    front: sanitizeString(c?.front, ""),
    back: sanitizeString(c?.back, "")
  })).filter(c => c.front || c.back);
  return {
    title: sanitizeString(p?.title, "Knowledge Cards"),
    cards: cards.length ? cards : [{ front: "Key Term", back: "Definition" }]
  };
}

function sanitizeSliceProps(p: any): SliceProps {
  return {
    title: sanitizeString(p?.title, "Overview"),
    content: sanitizeString(p?.content, "")
  };
}

function sanitizeStepFlowProps(p: any): StepFlowProps {
  const steps = sanitizeArray<any>(p?.steps).map((s: any) => sanitizeString(s, "")).filter(Boolean);
  return {
    title: sanitizeString(p?.title, "Steps"),
    steps: steps.length ? steps : ["Step 1", "Step 2", "Step 3"]
  };
}

function sanitizeAnalogyProps(p: any): AnalogyProps {
  return {
    analogy: sanitizeString(p?.analogy, ""),
    point: sanitizeString(p?.point, "")
  };
}

function sanitizeComparisonCardsProps(p: any): ComparisonCardsProps {
  return {
    title: sanitizeString(p?.title, "Comparison"),
    left: {
      label: sanitizeString(p?.left?.label, "Left"),
      image: coerceAllowedImage(p?.left?.image || "/images/4.png"),
      description: sanitizeString(p?.left?.description, "")
    },
    right: {
      label: sanitizeString(p?.right?.label, "Right"),
      image: coerceAllowedImage(p?.right?.image || "/images/5.png"),
      description: sanitizeString(p?.right?.description, "")
    }
  };
}

function sanitizeZoomRevealProps(p: any): ZoomRevealProps {
  const labels = sanitizeArray<any>(p?.labels).map((l: any) => ({
    text: sanitizeString(l?.text, ""),
    x: clamp01To100(l?.x),
    y: clamp01To100(l?.y)
  })).filter(l => l.text);
  return {
    title: sanitizeString(p?.title, "Zoom Reveal"),
    image: coerceAllowedImage(p?.image || "/images/4.png"),
    labels
  };
}

function sanitizeShortAnimationProps(p: any): ShortAnimationProps {
  return {
    title: sanitizeString(p?.title, "Short Animation"),
    gif: coerceAllowedImage(p?.gif || "/images/5.png"),
    description: sanitizeString(p?.description, "")
  };
}

function sanitizeConceptMapProps(p: any): ConceptMapProps {
  const links = sanitizeArray<any>(p?.links).map((s: any) => sanitizeString(s, "")).filter(Boolean);
  return {
    title: sanitizeString(p?.title, "Concept Map"),
    center: sanitizeString(p?.center, "Center"),
    links
  };
}

function sanitizeComponent(c: any): SlideComponent | null {
  const allowedTypes: ComponentType[] = [
    "Heading",
    "PointToPonder",
    "Story",
    "Diagram",
    "FlipCardSet",
    "Slice",
    "StepFlow",
    "Analogy",
    "ComparisonCards",
    "ZoomReveal",
    "ShortAnimation",
    "ConceptMap",
  ];
  
  const type = c?.type;
  if (!allowedTypes.includes(type)) return null;

  let propsSanitized: any;
  try {
    switch (type) {
      case "Heading":
        propsSanitized = sanitizeHeadingProps(c?.props);
        break;
      case "PointToPonder":
        propsSanitized = sanitizePointToPonderProps(c?.props);
        break;
      case "Story":
        propsSanitized = sanitizeStoryProps(c?.props);
        break;
      case "Diagram":
        propsSanitized = sanitizeDiagramProps(c?.props);
        break;
      case "FlipCardSet":
        propsSanitized = sanitizeFlipCardSetProps(c?.props);
        break;
      case "Slice":
        propsSanitized = sanitizeSliceProps(c?.props);
        break;
      case "StepFlow":
        propsSanitized = sanitizeStepFlowProps(c?.props);
        break;
      case "Analogy":
        propsSanitized = sanitizeAnalogyProps(c?.props);
        break;
      case "ComparisonCards":
        propsSanitized = sanitizeComparisonCardsProps(c?.props);
        break;
      case "ZoomReveal":
        propsSanitized = sanitizeZoomRevealProps(c?.props);
        break;
      case "ShortAnimation":
        propsSanitized = sanitizeShortAnimationProps(c?.props);
        break;
      case "ConceptMap":
        propsSanitized = sanitizeConceptMapProps(c?.props);
        break;
      default:
        return null;
    }
  } catch {
    return null;
  }

  return { type, props: propsSanitized };
}

function sanitizeSlides(generated: any): SlideComponent[] {
  const arr = Array.isArray(generated) ? generated : [];
  const cleaned = arr.map(sanitizeComponent).filter(Boolean) as SlideComponent[];

  if (cleaned.length === 0) {
    cleaned.push(
      {
        type: "Heading",
        props: {
          title: "Untitled Topic",
          description: "Auto-generated overview.",
          background: "/images/4.png"
        }
      },
      {
        type: "Slice",
        props: {
          title: "Overview",
          content: "1. Key idea.\n2. Explanation.\n3. Summary."
        }
      }
    );
  }

  return cleaned;
}

// ============= GEMINI API INTEGRATION =============

async function callGeminiRaw(fullPrompt: string, geminiApiKey: string, opts: GeminiOptions = {}) {
  if (!geminiApiKey) throw new Error('GEMINI_API_KEY not set');

  const model = opts.model || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: fullPrompt }]
      }
    ],
    generationConfig: {
      temperature: opts.temperature ?? 0.7,
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': geminiApiKey
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${text}`);
  }

  const json: any = await res.json();
  const text =
    json?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text || "").join("") ||
    json?.candidates?.[0]?.output ||
    JSON.stringify(json);

  return { raw: json, text };
}

function buildSystemPrompt(): string {
  const allowedImages: AllowedImage[] = ["/images/4.png", "/images/5.png", "/images/6.png", "/images/7.png"];
  const allowedTypes: ComponentType[] = [
    "Heading",
    "PointToPonder",
    "Story",
    "Diagram",
    "FlipCardSet",
    "Slice",
    "StepFlow",
    "Analogy",
    "ComparisonCards",
    "ZoomReveal",
    "ShortAnimation",
    "ConceptMap",
  ];

  return `
You are an expert content generator. Generate clear, concise, and informative content based on the user's topic.
Use a professional and engaging tone. Ensure the content is well-structured and free of errors.

STRICT OUTPUT REQUIREMENTS:
- Output MUST be a valid JSON array.
- Each item MUST have shape: { "type": "<ComponentType>", "props": { ... } }.
- Allowed "type" values ONLY: ${allowedTypes.join(", ")}.
- Use ONLY images from: ${allowedImages.join(", ")}.
  - /images/4.png and /images/5.png: presenting
  - /images/6.png: curious
  - /images/7.png: thinking
- Do NOT include any other fields or types.
- No Markdown in property values except minor inline emphasis allowed in "analogy" and "point".
- Keep descriptions concise.
- Ensure each component's props match EXACTLY the schema below.

SCHEMA:
- Heading:
  props: { title: string, description: string, background: AllowedImage }
- PointToPonder:
  props: { point: string, character: { name: string, image: AllowedImage }, characterEmotion: "curious" | "thinking" | "happy" | "excited" | "neutral" }
- Story:
  props: { scenes: Array<{ dialogue: string, character: { name: string, image: AllowedImage }, background: AllowedImage, emotion: CharacterEmotion, orientation: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "center" }> }
- Diagram:
  props: { title: string, illustration: AllowedImage, text: string }
- FlipCardSet:
  props: { title: string, cards: Array<{ front: string, back: string }> }
- Slice:
  props: { title: string, content: string }
- StepFlow:
  props: { title: string, steps: string[] }
- Analogy:
  props: { analogy: string, point: string }
- ComparisonCards:
  props: { title: string, left: { label: string, image: AllowedImage, description: string }, right: { label: string, image: AllowedImage, description: string } }
- ZoomReveal:
  props: { title: string, image: AllowedImage, labels: Array<{ text: string, x: number, y: number }> }
- ShortAnimation:
  props: { title: string, gif: AllowedImage, description: string }
- ConceptMap:
  props: { title: string, center: string, links: string[] }

CONTENT GUIDELINES:
- Tailor content to the requested topic.
- Favor short sentences and educational clarity.
- Provide 10-14 components covering overview, key ideas, examples, steps, and recap.
`;
}

function buildUserPrompt(topic: string, hints?: string): string {
  return `Topic: ${topic}
${hints ? `Hints: ${hints}` : ""}
Return ONLY the JSON array as specified. No prose or explanations outside JSON.`;
}

function buildFullPrompt(topic: string, hints?: string): string {
  return `${buildSystemPrompt()}\n\n${buildUserPrompt(topic, hints)}`;
}

async function generateSlidesForTopic(
  topic: string,
  geminiApiKey: string,
  hints?: string,
  opts: GeminiOptions = {}
): Promise<SlideComponent[]> {
  const prompt = buildFullPrompt(topic, hints);
  const { text } = await callGeminiRaw(prompt, geminiApiKey, opts);

  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    const match = text.match(/\[\s*[\s\S]*\]/);
    if (match) {
      try {
        parsed = JSON.parse(match[0]);
      } catch {
        parsed = [];
      }
    } else {
      parsed = [];
    }
  }

  const slides = sanitizeSlides(parsed);
  return slides;
}

// ============= SERVICE =============

@Injectable()
export class GenerationService {
  private readonly geminiApiKey: string;

  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY || '';
  }

  async generateSlides(
    userId: number,
    prompt: string,
    hints?: string
  ) {
    try {
      // Validate input
      if (!prompt || prompt.trim().length < 3) {
        throw new BadRequestException('Prompt must be at least 3 characters');
      }

      if (!this.geminiApiKey) {
        throw new InternalServerErrorException(
          'Generation service is not configured. Please contact support.'
        );
      }

      // Call Gemini
      const slides = await generateSlidesForTopic(
        prompt,
        this.geminiApiKey,
        hints,
        {
          model: 'gemini-2.5-flash',
          temperature: 0.7,
        }
      );

      // Return with metadata
      return {
        slides,
        generatedAt: new Date().toISOString(),
        prompt,
        userId, // for logging purposes only
      };
    } catch (error: any) {
      // Handle specific errors
      if (error.message?.includes('GEMINI_API_KEY')) {
        throw new InternalServerErrorException(
          'AI generation service is not properly configured.'
        );
      }

      // Handle Gemini API errors
      if (error.message?.includes('Gemini API error')) {
        throw new InternalServerErrorException(
          'Failed to generate slides. The AI service encountered an error. Please try again.'
        );
      }

      // Re-throw validation errors
      if (error.getStatus?.() === 400) {
        throw error;
      }

      // Generic error
      throw new InternalServerErrorException(
        'Failed to generate slides. Please try again.'
      );
    }
  }
}
