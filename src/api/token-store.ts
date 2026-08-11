const ACCESS_TOKEN_KEY = "kaizen_access_token";
const REFRESH_TOKEN_KEY = "kaizen_refresh_token";

let accessToken: string | null = null;
let refreshToken: string | null = null;

if (typeof window !== "undefined") {
  accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
}

export const getAccessToken = (): string | null => {
  if (!accessToken && typeof window !== "undefined") {
    accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  }
  return accessToken;
};

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  }
};

export const getRefreshToken = (): string | null => {
  if (!refreshToken && typeof window !== "undefined") {
    refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return refreshToken;
};

export const setRefreshToken = (token: string | null): void => {
  refreshToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }
};

/**
 * Wipes all stored tokens from memory and localStorage.
 * Also dispatches a "kaizen:session-expired" event so AuthContext can
 * react and clear the user state without a page reload.
 */
export const clearAllTokens = (): void => {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.dispatchEvent(new CustomEvent("kaizen:session-expired"));
  }
};
