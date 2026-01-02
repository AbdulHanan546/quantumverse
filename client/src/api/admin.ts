import { api } from './client';

export interface User {
    id: number;
    email: string;
    role: 'student' | 'admin';
    createdAt: string;
    updatedAt: string;
    stats?: {
        topicsStarted: number;
        topicsCompleted: number;
        globalAverageScore: number;
        totalAchievements: number;
        lastActive: string;
        subscriptionDays: number;
    };
}

export const getUsers = async () => {
    const res = await api.get('/users');
    return res.data as User[];
};

export const getUser = async (id: number) => {
    const res = await api.get(`/users/${id}`);
    return res.data as User;
};

export const deleteUser = async (id: number) => {
    await api.delete(`/users/${id}`);
};

export const updateUser = async (id: number, data: { role?: 'student' | 'admin' }) => {
    const res = await api.patch(`/users/${id}`, data);
    return res.data as User;
};
