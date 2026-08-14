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
  register: (data: {
    username: string;
    email?: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  favorites: Favorite[];
  favoritesLoading: boolean;
  isFavorite: (propertyId: string | number) => boolean;
  toggleFavorite: (propertyId: string | number, propertySnapshot?: any) => Promise<void>;
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

    // When the refresh token is rejected (401 on /api/token/refresh/),
    // http.ts fires this event — we react by clearing user state.
    const handleSessionExpired = () => {
      if (!cancelled) {
        setUser(null);
        setFavorites([]);
      }
    };
    window.addEventListener("kaizen:session-expired", handleSessionExpired);

    return () => {
      cancelled = true;
      window.removeEventListener(
        "kaizen:session-expired",
        handleSessionExpired,
      );
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

  const register = useCallback(
    async (data: {
      username: string;
      email?: string;
      password: string;
      first_name?: string;
      last_name?: string;
    }) => {
      const newUser = await api.register(data);
      setUser(newUser);
      loadFavorites();
      return newUser;
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
      favorites.some((f) => String(f.property.id) === String(propertyId)),
    [favorites],
  );

  const toggleFavorite = useCallback(
    async (propertyId: string | number, propertySnapshot?: any) => {
      const currentlyFavorite = favorites.some(
        (f) => String(f.property.id) === String(propertyId),
      );

      if (currentlyFavorite) {
        const snapshot = favorites;
        setFavorites((prev) =>
          prev.filter((f) => String(f.property.id) !== String(propertyId)),
        );
        try {
          await api.removeFavorite(propertyId);
        } catch (err) {
          console.error("Failed to remove favorite:", err);
          setFavorites(snapshot); // rollback
        }
      } else {
        const snapshot = favorites;
        const optimisticEntry = {
          id: `temp-${propertyId}`,
          property: propertySnapshot ?? { id: propertyId },
          created_at: new Date().toISOString(),
        } as any;
        setFavorites((prev) => [...prev, optimisticEntry]); // instant heart fill

        try {
          const created = await api.addFavorite(propertyId);
          if (created && typeof created === "object" && "property" in created) {
            setFavorites((prev) =>
              prev.map((f) => (f.id === optimisticEntry.id ? created : f)),
            );
          } else {
            await loadFavorites(); // backend said "already favorited" — resync
          }
        } catch (err) {
          console.error("Failed to add favorite:", err);
          setFavorites(snapshot); // rollback
        }
      }
    },
    [favorites, loadFavorites],
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
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
      register,
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
