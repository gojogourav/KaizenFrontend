import React, { createContext, useContext, useState, useEffect } from 'react';
import { z } from 'zod';
import api from '../api/client';
import { getAccessToken, setAccessToken } from '../lib/api/token_store';

export const UserSchema = z.object({
  id: z.union([z.string(), z.number()]),
  email: z.string().email(),
  username: z.string().optional().nullable(),
  first_name: z.string().optional().nullable(),
  last_name: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  is_staff: z.boolean().optional().nullable(),
  is_superuser: z.boolean().optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
}).transform((data) => {
  const name = (data.first_name || data.last_name)
    ? `${data.first_name || ''} ${data.last_name || ''}`.trim()
    : data.username || data.email;

  return {
    ...data,
    name,
    role: data.role || (data.is_staff ? 'admin' : 'customer')
  };
});

export type User = z.infer<typeof UserSchema>;

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  favorites: string[];
  login: (identifier: string, password?: string) => Promise<User | null>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  toggleFavorite: (propertyId: string | number) => Promise<boolean>;
  isFavorite: (propertyId: string | number) => boolean;
  refreshFavorites: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const extractFavoriteIds = (favRes: any): string[] => {
  if (!favRes) return [];
  if (Array.isArray(favRes)) {
    return favRes.map((f: any) => String(f.property?.id || f.id || f));
  }
  return [];
};

const removeToken = () => setAccessToken(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAccessToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getAccessToken();
      if (storedToken) {
        try {
          const rawUser = await api.getUserProfile();

          const parsedUser = UserSchema.parse(rawUser);

          setUser(parsedUser);
          setToken(storedToken);

          const favRes = await api.getFavorites().catch(() => []);
          setFavorites(extractFavoriteIds(favRes));
        } catch (err) {
          console.warn('Session expired or invalid schema returned from backend:', err);
          removeToken();
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Secure Login via Django API
  const login = async (identifier: string, password?: string): Promise<User | null> => {
    setIsLoading(true);

    try {
      const isEmail = identifier.includes('@');
      const credentials = {
        [isEmail ? 'email' : 'username']: identifier,
        password: password || '',
      };

      const rawUser = await api.login(credentials);

      const parsedUser = UserSchema.parse(rawUser);

      const currentToken = getAccessToken();

      if (currentToken && parsedUser) {
        setToken(currentToken);
        setUser(parsedUser);

        const favRes = await api.getFavorites().catch(() => []);
        setFavorites(extractFavoriteIds(favRes));

        setIsLoading(false);
        return parsedUser;
      }

      throw new Error('Authentication failed. No token received.');
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout().catch(() => {});
    } finally {
      removeToken();
      setToken(null);
      setUser(null);
      setFavorites([]);
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    const res = await api.updateUserProfile(data);
    const rawUser = (res as any).user || res;

    const parsedUser = UserSchema.parse(rawUser);
    setUser(parsedUser);
  };

  const refreshFavorites = async () => {
    if (!token) return;
    try {
      const res = await api.getFavorites();
      setFavorites(extractFavoriteIds(res));
    } catch (err) {
      console.warn('Failed to fetch favorites:', err);
    }
  };

  const toggleFavorite = async (propertyId: string | number): Promise<boolean> => {
    if (!token || !user) {
      throw new Error('Please login to save properties to your favorites.');
    }

    const strId = String(propertyId);
    const exists = favorites.includes(strId);

    if (exists) {
      setFavorites((prev) => prev.filter((id) => id !== strId));
    } else {
      setFavorites((prev) => [...prev, strId]);
    }

    try {
      if (exists) {
        await api.removeFavorite(propertyId);
        return false;
      } else {
        await api.addFavorite(propertyId);
        return true;
      }
    } catch (err) {
      setFavorites((prev) =>
        exists ? [...prev, strId] : prev.filter((id) => id !== strId)
      );
      throw err;
    }
  };

  const isFavorite = (propertyId: string | number) => favorites.includes(String(propertyId));

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        favorites,
        login,
        logout,
        updateProfile,
        toggleFavorite,
        isFavorite,
        refreshFavorites,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
