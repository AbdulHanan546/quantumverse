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

export interface GenerationResponse {
  slides: SlideComponent[];
  generatedAt: string;
  prompt: string;
  topicDocumentId: string;
}
