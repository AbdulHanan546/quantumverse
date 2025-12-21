import { api } from './client';
import type { GenerationResponse } from '../types/generation.types';
export async function generateSlides(
  prompt: string,
  hints?: string
): Promise<any[]> {
  const response = await api.post<GenerationResponse>('/generation/generate-slides', {
    prompt,
    hints,
  });
  return response.data.slides as any[];
}

export async function generateSlidesRaw(
  prompt: string,
  hints?: string
): Promise<any[]> {
  return generateSlides(prompt, hints);
}
