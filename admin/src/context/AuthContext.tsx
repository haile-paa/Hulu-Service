import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { api } from "@/api/client";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem("hulu_admin_user");
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser());
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (phone: string, password: string) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { phone, password });
      if (data.user.role !== "admin") {
        throw new Error("This account doesn't have admin access.");
      }
      localStorage.setItem("hulu_admin_token", data.token);
      localStorage.setItem("hulu_admin_user", JSON.stringify(data.user));
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("hulu_admin_token");
    localStorage.removeItem("hulu_admin_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
