import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import type { ProgressRow } from '../api/progress';
import { getMyProgress, startTopic as apiStart, updateTopicProgress as apiUpdate, completeTopic as apiComplete } from '../api/progress';

type ProgressMap = Record<string, ProgressRow>;

interface ProgressContextValue {
  byTopic: ProgressMap;
  refresh: () => Promise<void>;
  start: (topicDocumentId: string, totalBlocks: number, chapterDocumentId?: string) => Promise<ProgressRow | null>;
  update: (topicDocumentId: string, lastIndex: number, totalBlocks?: number) => Promise<ProgressRow | null>;
  complete: (topicDocumentId: string) => Promise<ProgressRow | null>;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, bootLoading } = useAuth();
  const [byTopic, setByTopic] = useState<ProgressMap>({});
  const loadingRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated || loadingRef.current) return;
    loadingRef.current = true;
    try {
      const rows = await getMyProgress();
      const map: ProgressMap = {};
      for (const r of rows) map[r.topicDocumentId] = r;
      setByTopic(map);
    } finally {
      loadingRef.current = false;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!bootLoading && isAuthenticated) {
      void refresh();
    } else if (!isAuthenticated) {
      setByTopic({});
    }
  }, [bootLoading, isAuthenticated, refresh]);

  const start = useCallback(async (topicDocumentId: string, totalBlocks: number, chapterDocumentId?: string) => {
    if (!isAuthenticated) return null;
    const row = await apiStart({ topicDocumentId, chapterDocumentId, totalBlocks });
    setByTopic((prev) => ({ ...prev, [topicDocumentId]: row }));
    return row;
  }, [isAuthenticated]);

  const update = useCallback(async (topicDocumentId: string, lastIndex: number, totalBlocks?: number) => {
    if (!isAuthenticated) return null;
    const row = await apiUpdate(topicDocumentId, { lastIndex, totalBlocks });
    setByTopic((prev) => ({ ...prev, [topicDocumentId]: row }));
    return row;
  }, [isAuthenticated]);

  const complete = useCallback(async (topicDocumentId: string) => {
    if (!isAuthenticated) return null;
    const row = await apiComplete(topicDocumentId);
    setByTopic((prev) => ({ ...prev, [topicDocumentId]: row }));
    return row;
  }, [isAuthenticated]);

  const value = useMemo<ProgressContextValue>(() => ({ byTopic, refresh, start, update, complete }), [byTopic, refresh, start, update, complete]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
