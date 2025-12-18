import { useEffect, useRef, useState } from "react";

interface UseAutoPlayOptions {
  duration: number; // total time in milliseconds
  enabled?: boolean;
  onComplete?: () => void; // called when time runs out
}

interface UseAutoPlayReturn {
  isPaused: boolean;
  togglePause: () => void;
  reset: () => void;
  elapsedTime: number;
  remainingTime: number;
}

/**
 * Hook for managing auto-play/auto-advance functionality
 * Handles pause/resume on tap and tracks elapsed/remaining time
 */
export function useAutoPlay({
  duration,
  enabled = true,
  onComplete,
}: UseAutoPlayOptions): UseAutoPlayReturn {
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const animationIdRef = useRef<number | undefined>(undefined);

  const remainingTime = duration - elapsedTime;

  // Reset elapsed time when duration changes (component changes)
  useEffect(() => {
    setElapsedTime(0);
    pausedTimeRef.current = 0;
  }, [duration]);

  // Animation loop for smooth progress tracking
  useEffect(() => {
    if (!enabled || isPaused) {
      return;
    }

    startTimeRef.current = performance.now() - pausedTimeRef.current;

    const tick = (now: number) => {
      const elapsed = now - startTimeRef.current;
      setElapsedTime(elapsed);

      if (elapsed >= duration) {
        setElapsedTime(duration);
        onComplete?.();
      } else {
        animationIdRef.current = requestAnimationFrame(tick);
      }
    };

    animationIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [enabled, isPaused, duration, onComplete]);

  const togglePause = () => {
    if (isPaused) {
      pausedTimeRef.current = elapsedTime;
    }
    setIsPaused(!isPaused);
  };

  const reset = () => {
    setElapsedTime(0);
    pausedTimeRef.current = 0;
    setIsPaused(false);
  };

  return {
    isPaused,
    togglePause,
    reset,
    elapsedTime,
    remainingTime,
  };
}
