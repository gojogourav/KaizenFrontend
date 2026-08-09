import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "../api/client";
import type { User, Favorite } from "../types/database";

export type { User };

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  favorites: Favorite[];
  favoritesLoading: boolean;
  isFavorite: (propertyId: string | number) => boolean;
  toggleFavorite: (propertyId: string | number) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  const loadFavorites = useCallback(async () => {
    setFavoritesLoading(true);
    try {
      const list = await api.getFavorites();
      setFavorites(list);
    } catch {
      setFavorites([]);
    } finally {
      setFavoritesLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const restored = await api.restoreSession();
      if (cancelled) return;
      if (!restored) {
        setLoading(false);
        return;
      }
      try {
        const profile = await api.getUserProfile();
        if (!cancelled) {
          setUser(profile);
          loadFavorites();
        }
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadFavorites]);

  const login = useCallback(
    async (email: string, password: string) => {
      const loggedInUser = await api.login({ email, password });
      setUser(loggedInUser);
      loadFavorites();
      return loggedInUser;
    },
    [loadFavorites],
  );

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
    setFavorites([]);
  }, []);

  const isFavorite = useCallback(
    (propertyId: string | number) =>
      favorites.some((f) => f.property.id === propertyId),
    [favorites],
  );

  const toggleFavorite = useCallback(
    async (propertyId: string | number) => {
      const currentlyFavorite = favorites.some(
        (f) => f.property.id === propertyId,
      );
      if (currentlyFavorite) {
        await api.removeFavorite(propertyId);
        setFavorites((prev) =>
          prev.filter((f) => f.property.id !== propertyId),
        );
      } else {
        const created = await api.addFavorite(propertyId);
        setFavorites((prev) => [...prev, created]);
      }
    },
    [favorites],
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      favorites,
      favoritesLoading,
      isFavorite,
      toggleFavorite,
    }),
    [
      user,
      loading,
      login,
      logout,
      favorites,
      favoritesLoading,
      isFavorite,
      toggleFavorite,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
