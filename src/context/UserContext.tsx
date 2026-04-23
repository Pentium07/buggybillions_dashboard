import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import api, { setupInterceptors } from "../helpers/api";

interface UserProviderProps {
  children: React.ReactNode;
}

export interface UserProps {
  id:number |string | null
  bug_id: number;
  username: string;
  fullname: string;
  email: string;
  role: string;
  stack?: string;
  department?: string;
  mobile?: string;
}

interface UserContextType {
  user: UserProps | null;
  token: string | null;
  role: string | null;
  login: (token: string, role: string) => void;
  logout: () => void;
  isLoggedIn: boolean;
  refreshUser: (token:string) => Promise<void>;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<UserProps | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      const storedRole = localStorage.getItem("role");
      if (!storedToken || !storedUser || !storedRole) {
        setLoading(false);
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setRole(storedRole);
        setUser(parsedUser);

        await refreshUser(storedToken);
      } catch (error) {
        console.warn("Invalid or expired session. Clearing...");
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  
  const login = async (token: string, role: string) => {
    try {
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      setToken(token);
      setRole(role);
      
      await refreshUser(token);
    } catch (error) {
      console.error("Login failed:", error);
      logout();
      throw error;
    }
  };


  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    setToken(null);
    setRole(null);
    setUser(null);

    toast.success("Logged out successfully");
    window.location.href = "/";
  };

  useEffect(() => {
    setupInterceptors(logout);
  }, []);

  async function refreshUser(authToken: string) {
    if (!authToken) throw new Error("No token");

    try {
      const response = await api.get("/api/me", {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });

      const { user } = response.data;

      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user.role);
    } catch (err: any) {
      console.error("Failed to refresh user:", err);
      if (err.response?.status === 401) {
        logout();
      }
      throw err;
    }
  }

  const isLoggedIn = !!token;

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        login,
        logout,
        isLoggedIn,
        refreshUser,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
