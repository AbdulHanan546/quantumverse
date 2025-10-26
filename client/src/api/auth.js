import { api } from './client';

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  return data; // { accessToken, user }
}

export async function register(email, password) {
  const { data } = await api.post('/auth/register', { email, password });
  return data; // { accessToken, user }
}

export async function getMe() {
  const { data } = await api.get('/auth/me');
  return data.user; // { id, email, role }
}