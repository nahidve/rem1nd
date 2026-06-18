import { create } from "zustand";
import { api } from "../api/axios";
import { getToken, setToken, deleteToken } from "../utils/token";
import {
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
} from "../api/auth.api";

type User = {
  uid: string;
  email?: string;
  dbUserId: string;
};

type AuthState = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const data = await loginApi(email, password);
    set({
      user: data.user,
      isAuthenticated: true,
    });
  },

  register: async (email, password) => {
    const data = await registerApi(email, password);
    set({
      user: data.user,
      isAuthenticated: true,
    });
  },

  logout: async () => {
    await logoutApi();
    set({
      user: null,
      isAuthenticated: false,
    });
  },

  hydrate: async () => {
    try {
      const token = await getToken();

      if (!token) {
        set({
          user: null,
          isAuthenticated: false,
          loading: false,
        });
        return;
      }

      const res = await api.get("/auth/me");

      set({
        user: res.data.user,
        isAuthenticated: true,
        loading: false,
      });
    } catch {
      await deleteToken();

      set({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  },
}));
