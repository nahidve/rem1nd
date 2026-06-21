import { create } from "zustand";
import { api } from "../api/axios";
import { getToken, setToken, deleteToken } from "../utils/token";
import { getExpoPushToken } from "../services/pushToken";
import {
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
  loginAsGuest,
} from "../api/auth.api";

type User = {
  uid: string;
  email?: string;
  name?: string;
  dbUserId: string;
  homeCurrency?: string;
};

type AuthState = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  guestLogin: () => Promise<void>;
  hydrate: () => Promise<void>;
  updateHomeCurrency: (currency: string) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  isAuthenticated: false,

  updateHomeCurrency: (currency) => {
    set((state) => ({
      user: state.user ? { ...state.user, homeCurrency: currency } : null,
    }));
  },

  login: async (email, password) => {
    const data = await loginApi(email, password);

    try {
      const pushToken = await getExpoPushToken();
      if (pushToken) {
        await api.post("/users/push-token", {
          token: pushToken,
        });
      }
    } catch (e) {
      console.warn("Failed to register push token:", e);
    }

    set({
      user: data.data,
      isAuthenticated: true,
      loading: false,
    });
  },

  register: async (email, password) => {
    const data = await registerApi(email, password);

    try {
      const pushToken = await getExpoPushToken();
      if (pushToken) {
        await api.post("/users/push-token", {
          token: pushToken,
        });
      }
    } catch (e) {
      console.warn("Failed to register push token:", e);
    }

    set({
      user: data.data,
      isAuthenticated: true,
      loading: false,
    });
  },

  guestLogin: async () => {
    const data = await loginAsGuest();

    set({
      user: data.data,
      isAuthenticated: true,
      loading: false,
    });
  },

  logout: async () => {
    await logoutApi();
    await deleteToken();

    set({
      user: null,
      isAuthenticated: false,
      loading: false,
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
        user: res.data.data,
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
