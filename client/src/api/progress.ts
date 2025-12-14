import { api } from './client';

export interface ProgressRow {
  id: number;
  topicDocumentId: string;
  chapterDocumentId?: string | null;
  lastIndex: number;
  totalBlocks: number;
  percent: number;
  status: 'not_started' | 'in_progress' | 'completed';
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string | null;
}

export async function getMyProgress(): Promise<ProgressRow[]> {
  const { data } = await api.get<ProgressRow[]>('/progress/me');
  return data;
}

export async function getTopicProgress(topicDocumentId: string): Promise<ProgressRow | null> {
  try {
    const { data } = await api.get<ProgressRow>(`/progress/topic/${topicDocumentId}`);
    return data;
  } catch {
    return null;
  }
}

export async function startTopic(payload: { topicDocumentId: string; chapterDocumentId?: string; totalBlocks: number; }): Promise<ProgressRow> {
  const { data } = await api.post<ProgressRow>('/progress/start', payload);
  return data;
}

export async function updateTopicProgress(topicDocumentId: string, patch: { lastIndex: number; totalBlocks?: number; }): Promise<ProgressRow> {
  const { data } = await api.patch<ProgressRow>(`/progress/topic/${topicDocumentId}`, patch);
  return data;
}

export async function completeTopic(topicDocumentId: string): Promise<ProgressRow> {
  const { data } = await api.post<ProgressRow>('/progress/complete', { topicDocumentId });
  return data;
}
