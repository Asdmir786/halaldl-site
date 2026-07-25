"use client";

import { useEffect } from "react";
import {
  getSystemTheme,
  getThemeColor,
  resolveThemePreference,
  STORAGE_KEY,
  THEME_COOKIE,
  THEME_EVENT,
  type Theme,
  type ThemePreference,
} from "@/lib/theme";

function syncThemeColor(theme: Theme) {
  const color = getThemeColor(theme);
  let meta = document.querySelector('meta[name="theme-color"][data-halaldl-theme]');

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    meta.setAttribute("data-halaldl-theme", "true");
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", color);
}

export function applyThemePreference(preference: ThemePreference) {
  const resolved = preference === "system" ? getSystemTheme() : preference;

  document.documentElement.dataset.themePreference = preference;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
  window.localStorage.setItem(STORAGE_KEY, preference);
  document.cookie = `${THEME_COOKIE}=${preference}; Path=/; Max-Age=31536000; SameSite=Lax`;
  syncThemeColor(resolved);
  window.dispatchEvent(new CustomEvent(THEME_EVENT));
}

/** Keeps system preference live and theme-color meta in sync with the resolved theme. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handleMediaChange = () => {
      const preference = resolveThemePreference(window.localStorage.getItem(STORAGE_KEY));
      if (preference === "system") {
        applyThemePreference("system");
      }
    };

    // Ensure theme-color meta exists after hydration.
    const resolved =
      document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    syncThemeColor(resolved);

    media.addEventListener("change", handleMediaChange);
    return () => media.removeEventListener("change", handleMediaChange);
  }, []);

  return children;
}
