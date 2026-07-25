"use client";

import { useEffect } from "react";
import { applyThemePreference } from "@/lib/theme-transition";
import {
  getThemeColor,
  resolveThemePreference,
  STORAGE_KEY,
  type Theme,
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

export { applyThemePreference, requestThemePreference } from "@/lib/theme-transition";

/** Keeps system preference live and theme-color meta in sync with the resolved theme. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handleMediaChange = () => {
      const preference = resolveThemePreference(window.localStorage.getItem(STORAGE_KEY));
      if (preference === "system") {
        // OS changes should follow immediately without a staged click animation.
        applyThemePreference("system");
      }
    };

    const resolved =
      document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    syncThemeColor(resolved);

    media.addEventListener("change", handleMediaChange);
    return () => media.removeEventListener("change", handleMediaChange);
  }, []);

  return children;
}
