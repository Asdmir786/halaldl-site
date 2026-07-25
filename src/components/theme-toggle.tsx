"use client";

import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { applyThemePreference } from "@/components/theme-provider";
import {
  DEFAULT_THEME_PREFERENCE,
  getThemePreferenceSnapshotFromDocument,
  THEME_EVENT,
  type ThemePreference,
} from "@/lib/theme";

const PREFERENCE_ORDER: ThemePreference[] = ["system", "light", "dark"];

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

function nextPreference(current: ThemePreference): ThemePreference {
  const index = PREFERENCE_ORDER.indexOf(current);
  return PREFERENCE_ORDER[(index + 1) % PREFERENCE_ORDER.length];
}

function preferenceLabel(preference: ThemePreference) {
  if (preference === "system") return "System";
  if (preference === "dark") return "Dark";
  return "Light";
}

export function ThemeToggle() {
  const preference = useSyncExternalStore(
    subscribe,
    getThemePreferenceSnapshotFromDocument,
    () => DEFAULT_THEME_PREFERENCE,
  );
  const next = nextPreference(preference);

  return (
    <button
      type="button"
      onClick={() => applyThemePreference(next)}
      className="theme-toggle flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft transition-colors hover:text-ink"
      aria-label={`Theme: ${preferenceLabel(preference)}. Switch to ${preferenceLabel(next)}`}
      title={`Theme: ${preferenceLabel(preference)} (click for ${preferenceLabel(next)})`}
    >
      {preference === "dark" ? (
        <Sun className="h-[1.125rem] w-[1.125rem]" />
      ) : preference === "light" ? (
        <Moon className="h-[1.125rem] w-[1.125rem]" />
      ) : (
        <Monitor className="h-[1.125rem] w-[1.125rem]" />
      )}
    </button>
  );
}
