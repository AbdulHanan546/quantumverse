import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Block {
  id?: string; // optional, generate if missing
  order: number;
  statement: string;
  illustration?: string; // media URL
}

interface StackOrderProps {
  statement: string;
  illustration?: string;
  blocks: Block[];
  onNext?: () => void;
  disableGlobalTap?: () => void;
  enableGlobalTap?: () => void;
}

function SortableItem({ id, statement, illustration }: Block & { id: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 1.05 }}
      layout
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="flex items-center gap-4 p-4 bg-[#1a1a2a] border border-[#2b2b3b] rounded-xl cursor-grab active:cursor-grabbing shadow-md"
    >
      {illustration && (
        <img src={illustration} alt="" className="w-12 h-12 object-contain" />
      )}
      <span className="text-gray-200 text-lg">{statement}</span>
    </motion.div>
  );
}

export default function StackOrder({
  statement,
  illustration,
  blocks,
  onNext,
  disableGlobalTap,
  enableGlobalTap,
}: StackOrderProps) {
  const [items, setItems] = useState(
    () =>
      blocks
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((b, idx) => ({
          ...b,
          id: b.id || `block-${idx}-${Math.random().toString(36).slice(2, 7)}`,
        }))
  );
  const [submitted, setSubmitted] = useState(false);
  const [showTapHint, setShowTapHint] = useState(false);

  useEffect(() => {
    disableGlobalTap?.();
    return () => enableGlobalTap?.();
  }, []);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    setItems((items) => arrayMove(items, oldIndex, newIndex));
  };

  const checkOrder = () => {
    if (submitted) return;
    setSubmitted(true);
    setTimeout(() => setShowTapHint(true), 1000);
  };

  const handleTap = () => {
    if (submitted && showTapHint) {
      onNext?.();
      enableGlobalTap?.();
    }
  };

  return (
    <div
      className="relative w-full h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#090913] to-[#111122] text-white select-none"
      onClick={handleTap}
      onTouchStart={handleTap}
    >
      {/* Background glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-indigo-800/20 via-transparent to-black"
        animate={{ scale: [1, 1.03, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ repeat: Infinity, duration: 8 }}
      />

      {/* Top Section */}
      <div className="z-10 max-w-2xl text-center mb-10 px-6">
        <h2 className="text-2xl text-blue-300 font-semibold mb-3">{statement}</h2>
        {illustration && (
          <img
            src={illustration}
            alt="illustration"
            className="mx-auto max-h-64 object-contain opacity-80 mb-6"
          />
        )}
      </div>

      {/* Draggable List */}
      <div className="w-full max-w-xl space-y-4 z-10">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={items.map((i) => i.id!)}
            strategy={verticalListSortingStrategy}
          >
            <AnimatePresence>
              {items.map((item) => (
                <SortableItem key={item.id} {...item} />
              ))}
            </AnimatePresence>
          </SortableContext>
        </DndContext>
      </div>

      {/* Submit Button */}
      {!submitted && (
        <motion.button
          onClick={checkOrder}
          className="mt-10 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl shadow-lg font-medium z-10"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Check Order
        </motion.button>
      )}

      {/* Feedback */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            key="feedback"
            className="mt-8 text-center text-lg text-gray-300 z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
          >
            ✅ Correct Order!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tap hint */}
      {showTapHint && (
        <motion.div
          className="absolute bottom-10 text-sm text-gray-400 tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Tap to continue
        </motion.div>
      )}
    </div>
  );
}
