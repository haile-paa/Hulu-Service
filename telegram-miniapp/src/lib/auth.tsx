import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import * as api from "./api";

interface AuthState {
  token: string | null;
  user: api.AuthUser | null;
}

interface AuthContextValue extends AuthState {
  login: (phone: string, password: string) => Promise<void>;
  register: (input: Parameters<typeof api.register>[0]) => Promise<void>;
  logout: () => void;
}

const STORAGE_KEY = "hulu-service-auth";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ token: null, user: null });

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setState(JSON.parse(raw));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  function persist(next: AuthState) {
    setState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  async function login(phone: string, password: string) {
    const result = await api.login({ phone, password });
    persist({ token: result.token, user: result.user });
  }

  async function register(input: Parameters<typeof api.register>[0]) {
    const result = await api.register(input);
    persist({ token: result.token, user: result.user });
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setState({ token: null, user: null });
  }

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
