"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/stores/theme-store";

export default function ThemeProvider() {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    // Initialize theme on mount
    setTheme(theme);

    // Listen for system theme changes when in auto mode
    if (theme === "auto") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      
      const handleChange = () => {
        if (theme === "auto") {
          const systemTheme = mediaQuery.matches ? "dark" : "light";
          document.documentElement.setAttribute("data-theme", systemTheme);
        }
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme, setTheme]);

  return null;
}
