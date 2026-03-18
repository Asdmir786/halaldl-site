"use client";

import { useSyncExternalStore } from "react";
import { MoonStar, SunMedium } from "lucide-react";

const STORAGE_KEY = "halaldl-site-theme";
const THEME_EVENT = "halaldl-theme-change";

type Theme = "light" | "dark";

function getThemeSnapshot(): Theme {
  if (typeof document === "undefined") {
    return "light";
  }

  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

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
  window.dispatchEvent(new CustomEvent(THEME_EVENT));
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot, () => "light");
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => applyTheme(nextTheme)}
      className="theme-toggle inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-ink"
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
    >
      {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
      <span className="hidden sm:inline">{theme === "dark" ? "Light mode" : "Dark mode"}</span>
    </button>
  );
}
