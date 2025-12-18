import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { loadSimulation } from "../../engine/phaser/simulationHandlers";

export default function Simulation({
  simulationId,
  marginX = "px-4",
  marginY = "py-6",
  autoPlay = false,
  isPaused = false,
  togglePause = () => {},
}: {
  simulationId: string;
  marginX?: string;
  marginY?: string;
  autoPlay?: boolean;
  isPaused?: boolean;
  togglePause?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const game = loadSimulation(simulationId, ref.current!);
    return () => game.destroy(true);
  }, [simulationId]);

  return <div ref={ref} className="w-full h-full" />;
}
