import { api } from './client';

// Define a User type
export interface User {
  id: string;
  email: string;
  role: string;
createdAt?: string; // optional if not always returned
  [key: string]: any;  // add other fields if your API returns more
}

/**
 * Fetch list of users
 * @returns array of users
 */
export async function listUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>('/users');
  return data;
}
