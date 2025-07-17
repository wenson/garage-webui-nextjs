import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/types";
import { STORAGE_KEYS } from "@/lib/constants";

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  verifyAuth: () => Promise<void>;
  setUser: (user: AuthUser) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,

      login: async (username: string, password: string) => {
        set({ isLoading: true });
        
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
          });

          const data = await response.json();

          if (response.ok && data.success) {
            set({ user: data.user, isLoading: false });
            return true;
          } else {
            set({ isLoading: false });
            return false;
          }
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          return false;
        }
      },

      logout: async () => {
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
          });
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ user: null });
        }
      },

      verifyAuth: async () => {
        try {
          const response = await fetch('/api/auth/verify');
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.user) {
              set({ user: data.user });
              return;
            }
          }
          
          // 如果验证失败，清除用户状态
          set({ user: null });
        } catch (error) {
          console.error('Auth verification error:', error);
          set({ user: null });
        }
      },

      setUser: (user: AuthUser) => {
        set({ user });
      },
    }),
    {
      name: STORAGE_KEYS.AUTH_TOKEN,
      partialize: (state) => ({ user: state.user }),
    }
  )
);
