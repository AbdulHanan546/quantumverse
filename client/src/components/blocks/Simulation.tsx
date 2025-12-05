import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { loadSimulation } from "../../engine/phaser/simulationHandlers";

export default function Simulation({ simulationId }: { simulationId: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const game = loadSimulation(simulationId, ref.current!);
    return () => game.destroy(true);
  }, [simulationId]);

  return <div ref={ref} className="w-full h-full" />;
}
