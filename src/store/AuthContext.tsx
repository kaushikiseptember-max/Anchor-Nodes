import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User } from "../types";
import { api } from "../services/api";

export type AuthPageType = "signup" | "login";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authPage: AuthPageType;
  setAuthPage: (page: AuthPageType) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "anchornode_token";
const LAST_PAGE_KEY = "anchornode_last_auth_page";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authPage, setAuthPageState] = useState<AuthPageType>(() => {
    if (typeof window !== "undefined") {
      const savedPage = localStorage.getItem(LAST_PAGE_KEY);
      if (savedPage === "login" || savedPage === "signup") {
        return savedPage;
      }
    }
    return "signup";
  });

  const setAuthPage = useCallback((page: AuthPageType) => {
    setAuthPageState(page);
    if (typeof window !== "undefined") {
      localStorage.setItem(LAST_PAGE_KEY, page);
    }
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        if (isMounted) {
          setUser(null);
          setToken(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const verifiedUser = await api.getMe();
        if (isMounted) {
          if (verifiedUser) {
            setUser(verifiedUser);
            setToken(storedToken);
          } else {
            localStorage.removeItem(TOKEN_KEY);
            setUser(null);
            setToken(null);
          }
        }
      } catch (err) {
        console.warn("[AnchorNode Auth] Token validation failed:", err);
        if (isMounted) {
          localStorage.removeItem(TOKEN_KEY);
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    // Subscribe to 401 Unauthorized events from api service
    const unsubscribe = api.onUnauthorized(() => {
      if (isMounted) {
        setUser(null);
        setToken(null);
        setAuthPage("login");
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [setAuthPage]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await api.login({ email, password });
      setUser(response.user);
      setToken(response.token);
      setAuthPage("login");
    },
    [setAuthPage]
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const response = await api.signup({ name, email, password });
      setUser(response.user);
      setToken(response.token);
      setAuthPage("login");
    },
    [setAuthPage]
  );

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      setToken(null);
      setAuthPage("login");
    }
  }, [setAuthPage]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        authPage,
        setAuthPage,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
