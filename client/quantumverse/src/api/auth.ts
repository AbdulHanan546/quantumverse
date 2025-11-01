import { api } from './client';

// Define types for responses
interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthResponse {
  accessToken: string;
  user: User;
}

/**
 * Login user
 * @param email - user's email
 * @param password - user's password
 * @returns accessToken and user info
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
  return data;
}

/**
 * Register user
 * @param email - user's email
 * @param password - user's password
 * @returns accessToken and user info
 */
export async function register(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', { email, password });
  return data;
}

/**
 * Get current logged-in user
 * @returns user info
 */
export async function getMe(): Promise<User> {
  const { data } = await api.get<{ user: User }>('/auth/me');
  return data.user;
}
