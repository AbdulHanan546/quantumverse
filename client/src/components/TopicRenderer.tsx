import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useLocation,useNavigate } from "react-router-dom";
import { useProgress } from "../context/ProgressContext";
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
  const { start, update, complete } = useProgress();

  const current = components[index];

  /** Move to next component safely */
  const next = useCallback(() => {
    if (cooldownRef.current) return;
    cooldownRef.current = true;
    setTimeout(() => (cooldownRef.current = false), 400); // debounce taps

    if (index < components.length - 1) {
      console.log(`👉 Moving to next component index: ${index + 1}`);
      // Update progress before moving UI index
      if (topicDocumentId) {
        void update(topicDocumentId, index + 1, components.length);
      }
      setIndex((prev) => prev + 1);
      setAllowTap(true);
    } else {
      console.log("✅ End of topic reached.");
      if (topicDocumentId) {
        void complete(topicDocumentId);
      }
      navigate(-1);
    }
  }, [index, components.length]);

  /** Log rendering info */
  useEffect(() => {
    console.log(`🎬 Rendering component index: ${index}`);
    console.log("🔍 Current component:", current?.type, current?.props);
  }, [index]);

  /** Global tap handler */
  useEffect(() => {
    const handleTap = (e: MouseEvent | TouchEvent) => {
      if (!allowTap) return;
      if (cooldownRef.current) return;

      // Prevent bubbling from child clicks
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

  // Start progress for this topic when mounted
  useEffect(() => {
    if (!topicDocumentId) return;
    const state = location.state as { chapterDocumentId?: string } | null;
    const chapterDocumentId = state?.chapterDocumentId;
    void start(topicDocumentId, components.length, chapterDocumentId);
  }, [topicDocumentId, components.length, start, location.state]);

  /** Tap control helpers for child components */
  const disableGlobalTap = useCallback(() => {
    console.log("🛑 Global tap disabled by child component");
    setAllowTap(false);
  }, []);

  const enableGlobalTap = useCallback(() => {
    console.log("🟢 Global tap re-enabled by child component");
    setAllowTap(true);
  }, []);

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
  };

  if (!current) {
    console.warn("⚠️ No current component found!");
    return null;
  }

  const Comp = componentMap[current.type];

  if (!Comp) {
    console.error(`❌ Unknown component type: "${current.type}"`);
    console.log("🧩 Available components:", Object.keys(componentMap));
    return (
      <div className="text-white p-10">Unknown component: {current.type}</div>
    );
  }

  try {
    return (
      <div
        className="w-full h-screen bg-black text-white overflow-hidden"
        // This attribute prevents parent taps from being triggered by interactive children
        data-child-interactive="false"
      >
        <Comp
              key={`${current.type}-${current.props.id || index}`} 

          {...current.props}
          onNext={next}
          disableGlobalTap={disableGlobalTap}
          enableGlobalTap={enableGlobalTap}
          data-child-interactive="true"
        />
      </div>
    );
  } catch (err) {
    console.error(`💥 Error rendering component ${current.type}:`, err);
    return (
      <div className="text-red-400 p-10">
        Error rendering {current.type}: {String(err)}
      </div>
    );
  }
}
