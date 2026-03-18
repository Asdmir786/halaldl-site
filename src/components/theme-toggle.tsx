"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import {
  DEFAULT_THEME,
  getThemeSnapshotFromDocument,
  STORAGE_KEY,
  THEME_COOKIE,
  THEME_EVENT,
  type Theme,
} from "@/lib/theme";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const handleChange = () => callback();

  window.addEventListener(THEME_EVENT, handleChange);
  media.addEventListener("change", handleChange);

  return () => {
    window.removeEventListener(THEME_EVENT, handleChange);
    media.removeEventListener("change", handleChange);
  };
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem(STORAGE_KEY, theme);
  document.cookie = `${THEME_COOKIE}=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent(THEME_EVENT));
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getThemeSnapshotFromDocument, () => DEFAULT_THEME);
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => applyTheme(nextTheme)}
      className="theme-toggle flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft transition-colors hover:text-ink"
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
    >
      {theme === "dark" ? (
        <Sun className="h-[1.125rem] w-[1.125rem]" />
      ) : (
        <Moon className="h-[1.125rem] w-[1.125rem]" />
      )}
    </button>
  );
}
