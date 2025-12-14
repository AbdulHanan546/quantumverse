import { api } from './client';
import type { SlideComponent, GenerationResponse } from '../types/generation.types';

export async function generateSlides(
  prompt: string,
  hints?: string
): Promise<SlideComponent[]> {
  const response = await api.post<GenerationResponse>('/generation/generate-slides', {
    prompt,
    hints,
  });
  return response.data.slides;
}
