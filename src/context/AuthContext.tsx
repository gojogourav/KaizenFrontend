/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getStoredToken, setStoredToken, removeStoredToken } from '../api/client';
import { User as DbUser } from '../types/database';

export interface User extends Partial<DbUser> {
  id: string | number;
  name?: string;
  username?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: any;
  is_staff?: boolean;
  is_superuser?: boolean;
  avatarUrl?: string;
  company?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  favorites: string[];
  login: (email: string, password?: string) => Promise<User | null>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  toggleFavorite: (propertyId: string | number) => Promise<boolean>;
  isFavorite: (propertyId: string | number) => boolean;
  refreshFavorites: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeUser = (u: any): User => {
  if (!u) return u;
  const name = u.name || (u.first_name || u.last_name ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : u.username || u.email);
  return {
    ...u,
    id: u.id,
    email: u.email,
    name,
    username: u.username || u.email,
    role: u.role || (u.is_staff ? 'admin' : 'customer'),
  };
};

const extractFavoriteIds = (favRes: any): string[] => {
  if (!favRes) return [];
  if (Array.isArray(favRes)) {
    return favRes.map((f: any) => String(f.property?.id || f.id || f));
  }
  if (favRes.favoriteIds && Array.isArray(favRes.favoriteIds)) {
    return favRes.favoriteIds.map((id: any) => String(id));
  }
  if (favRes.favorites && Array.isArray(favRes.favorites)) {
    return favRes.favorites.map((f: any) => String(f.property?.id || f.id || f));
  }
  return [];
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load user profile on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getStoredToken();
      if (storedToken) {
        try {
          const res: any = await api.getUserProfile();
          const rawUser = res?.user || (res?.email || res?.id ? res : null);
          const userObj = rawUser ? normalizeUser(rawUser) : null;
          if (userObj) {
            setUser(userObj);
            setToken(storedToken);
            // Load favorites
            const favRes = await api.getFavorites().catch(() => []);
            setFavorites(extractFavoriteIds(favRes));
          } else {
            removeStoredToken();
            setToken(null);
          }
        } catch (err) {
          console.warn('Failed to restore session:', err);
          removeStoredToken();
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password?: string): Promise<User | null> => {
    setIsLoading(true);
    try {
      const res: any = await api.login({ email, password });
      const rawUser = res?.user || (res?.email || res?.id ? res : null);
      const userObj = rawUser ? normalizeUser(rawUser) : null;
      if (res?.token && userObj) {
        setStoredToken(res.token);
        setToken(res.token);
        setUser(userObj);

        // Fetch favorites after login
        const favRes = await api.getFavorites().catch(() => []);
        setFavorites(extractFavoriteIds(favRes));
        return userObj;
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout().catch(() => {});
    } finally {
      removeStoredToken();
      setToken(null);
      setUser(null);
      setFavorites([]);
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    const res: any = await api.updateUserProfile(data);
    const rawUser = res?.user || (res?.email || res?.id ? res : null);
    const userObj = rawUser ? normalizeUser(rawUser) : null;
    if (userObj) {
      setUser(userObj);
    }
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
      try {
        const res = await api.removeFavorite(strId);
        if (res) setFavorites(extractFavoriteIds(res));
        return false;
      } catch (err) {
        setFavorites((prev) => [...prev, strId]); // revert
        throw err;
      }
    } else {
      setFavorites((prev) => [...prev, strId]);
      try {
        const res = await api.addFavorite(strId);
        if (res) setFavorites(extractFavoriteIds(res));
        return true;
      } catch (err) {
        setFavorites((prev) => prev.filter((id) => id !== strId)); // revert
        throw err;
      }
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
