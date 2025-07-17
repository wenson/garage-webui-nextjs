import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Theme } from "@/types";
import { STORAGE_KEYS } from "@/lib/constants";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "auto",
      setTheme: (theme: Theme) => {
        set({ theme });
        
        // Apply theme to document
        const root = document.documentElement;
        
        if (theme === "auto") {
          const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches 
            ? "dark" 
            : "light";
          root.setAttribute("data-theme", systemTheme);
        } else {
          root.setAttribute("data-theme", theme);
        }
      },
    }),
    {
      name: STORAGE_KEYS.THEME,
    }
  )
);
