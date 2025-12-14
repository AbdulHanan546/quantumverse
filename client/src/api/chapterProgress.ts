import { api } from './client';

export interface ChapterAggregate {
  id: number;
  chapterDocumentId: string;
  totalTopics: number;
  completedTopics: number;
  averagePercent: number;
}

export async function getChapterAggregate(chapterDocumentId: string): Promise<ChapterAggregate> {
  const { data } = await api.get<ChapterAggregate>(`/progress/chapter/${chapterDocumentId}`);
  return data;
}

export async function getAllChapterAggregates(): Promise<ChapterAggregate[]> {
  const { data } = await api.get<ChapterAggregate[]>(`/progress/chapters`);
  return data;
}
