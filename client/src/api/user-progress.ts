import { api } from './client';

export const getMyStats = async () => {
  const response = await api.get(`/user-progress/profile-stats`);
  return response.data;
};

// Example of the existing update function just in case
export const updateProgress = async (topicId: string, stats: any) => {
  return api.post(`/user-progress/update`, 
    { topicId, stats }
  );
};