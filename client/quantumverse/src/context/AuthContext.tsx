import  React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,

} from 'react';
import type { ReactNode } from 'react';

import { useNavigate } from 'react-router-dom';
import { login as apiLogin, register as apiRegister, getMe } from '../api/auth';
import { tokenStorage } from '../api/tokenStorage';
import type { User } from '../api/user'; // import the User type from your API typings

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  bootLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [bootLoading, setBootLoading] = useState(true);

  const handlePostAuthNavigate = useCallback(
    (role: string) => {
      if (role === 'admin') navigate('/admin', { replace: true });
      else navigate('/student', { replace: true });
    },
    [navigate]
  );

  const bootstrap = useCallback(async () => {
    const token = tokenStorage.get();
    if (!token) {
      setBootLoading(false);
      return;
    }
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      tokenStorage.clear();
    } finally {
      setBootLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { accessToken, user } = await apiLogin(email, password);
      tokenStorage.set(accessToken);
      setUser(user);
      handlePostAuthNavigate(user.role);
      return user;
    },
    [handlePostAuthNavigate]
  );

  const register = useCallback(
    async (email: string, password: string) => {
      const { accessToken, user } = await apiRegister(email, password);
      tokenStorage.set(accessToken);
      setUser(user);
      handlePostAuthNavigate(user.role);
      return user;
    },
    [handlePostAuthNavigate]
  );

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    navigate('/signin', { replace: true });
  }, [navigate]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      bootLoading,
      login,
      register,
      logout,
    }),
    [user, bootLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
