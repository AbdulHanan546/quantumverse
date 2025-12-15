import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useProgress } from "../context/ProgressContext";

// Import all components
import Heading from "./blocks/Heading";
import MCQ from "./blocks/MCQ";
import TrueFalse from "./blocks/TrueFalse";
import Story from "./blocks/Story";
import Slice from "./blocks/Slice";
import PointToPonder from "./blocks/PointToPonder";
import Matching from "./blocks/Matching";
import FunFact from "./blocks/FunFact";
import Diagram from "./blocks/Diagram";
import Analogy from "./blocks/Analogy";
import StackOrder from "./blocks/StackOrder";
import Simulation from "./blocks/Simulation";
import FlipCardSet from "./blocks/FlipCardSet";
import StepFlow from "./blocks/StepFlow";
import ComparisonCards from "./blocks/ComparisonCards";
import ZoomReveal from "./blocks/ZoomReveal";
import ShortAnimation from "./blocks/ShortAnimation";
import ConceptMap from "./blocks/ConceptMap";

interface TopicRendererProps {
  components: any[];
}

export default function TopicRenderer({ components }: TopicRendererProps) {
  const [index, setIndex] = useState(0);
  const [allowTap, setAllowTap] = useState(true);
  const cooldownRef = useRef(false);

  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const topicDocumentId = slug;

  // Check if these are AI-generated slides
  const state = location.state as { isGenerated?: boolean; generatedAt?: string } | null;
  const isGenerated = state?.isGenerated ?? false;
  const generatedAt = state?.generatedAt;

  const { start, update, complete } = useProgress();
  const current = components[index];

  /** Next handler with debounce */
  const next = useCallback(() => {
    if (cooldownRef.current) return;
    cooldownRef.current = true;
    setTimeout(() => (cooldownRef.current = false), 400);

    if (index < components.length - 1) {
      if (topicDocumentId) void update(topicDocumentId, index + 1, components.length);
      setIndex((i) => i + 1);
      setAllowTap(true);
    } else {
      if (topicDocumentId) void complete(topicDocumentId);
      navigate(-1);
    }
  }, [index, components.length, topicDocumentId, update, complete, navigate]);

  /** Global tap handler */
  useEffect(() => {
    const handleTap = (e: MouseEvent | TouchEvent) => {
      if (!allowTap || cooldownRef.current) return;
      if ((e.target as HTMLElement)?.closest("[data-child-interactive='true']")) return;
      next();
    };
    window.addEventListener("click", handleTap);
    window.addEventListener("touchstart", handleTap);
    return () => {
      window.removeEventListener("click", handleTap);
      window.removeEventListener("touchstart", handleTap);
    };
  }, [allowTap, next]);

  /** Start progress */
  useEffect(() => {
    if (!topicDocumentId) return;
    const state = location.state as { chapterDocumentId?: string } | null;
    const chapterDocumentId = state?.chapterDocumentId;
    void start(topicDocumentId, components.length, chapterDocumentId);
  }, [topicDocumentId, components.length, start, location.state]);

  /** Child tap control */
  const disableGlobalTap = useCallback(() => setAllowTap(false), []);
  const enableGlobalTap = useCallback(() => setAllowTap(true), []);

  /** Component registry */
  const componentMap: Record<string, any> = {
    Heading,
    MCQ,
    TrueFalse,
    Story,
    Slice,
    PointToPonder,
    Matching,
    FunFact,
    Diagram,
    Analogy,
    StackOrder,
    Simulation,
    FlipCardSet,
    StepFlow,
    ComparisonCards,
    ZoomReveal,
    ShortAnimation,
    ConceptMap,
  };

  if (!current) return null;

  const Comp = componentMap[current.type];
  if (!Comp)
    return (
      <div className="text-white p-10">
        Unknown component: {current.type}
      </div>
    );

  /** Normalize props for Story / PointToPonder to handle old & new character schema */
  const props = { ...current.props, onNext: next, disableGlobalTap, enableGlobalTap };

  // For Story
  if (current.type === "Story" && current.props.scenes) {
    props.scenes = current.props.scenes.map((scene: any) => {
      const character = scene.character || {};
      return {
        ...scene,
        character: {
          name: character.name || "",
          image: character.image,
          expressions: character.expressions || [],
        },
        orientation: scene.orientation || "bottom-right",
        emotion: scene.emotion || "",
      };
    });
  }

  // For PointToPonder
  if (current.type === "PointToPonder" && current.props.character) {
    const char = current.props.character;
    props.character = {
      name: char.name || "",
      image: char.image || undefined,
      expressions: char.expressions || [],
    };
    props.characterEmotion = current.props.characterEmotion || undefined;
    props.characterOrientation = current.props.characterOrientation || "right";
  }

  return (
    <div
      className="w-full h-screen bg-black text-white overflow-hidden"
      data-child-interactive="false"
    >
      {/* Generated Slides Indicator */}
      {isGenerated && (
        <div className="fixed top-4 right-4 z-40 bg-blue-900/80 border border-blue-400/50 rounded-lg px-3 py-2 text-xs text-blue-200 flex items-center gap-2 backdrop-blur-sm">
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
          <span>AI-Generated Preview</span>
          {generatedAt && (
            <span className="text-blue-300/70">
              {new Date(generatedAt).toLocaleTimeString()}
            </span>
          )}
        </div>
      )}
      <Comp key={`${current.type}-${current.props.id || index}`} {...props} data-child-interactive="true" />
    </div>
  );
}
