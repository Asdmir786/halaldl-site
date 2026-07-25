"use client";

import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { requestThemePreference } from "@/components/theme-provider";
import {
  DEFAULT_THEME_PREFERENCE,
  getThemePreferenceSnapshotFromDocument,
  THEME_EVENT,
} from "@/lib/theme";

const THEME_OPTIONS = [
  { value: "system" as const, label: "System", icon: Monitor },
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
];

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

/**
 * Three-way theme control (System / Light / Dark), adapted from the
 * 21st.dev Toggle Theme pattern: radiogroup + Motion layoutId pill.
 */
export function ThemeToggle() {
  const preference = useSyncExternalStore(
    subscribe,
    getThemePreferenceSnapshotFromDocument,
    () => DEFAULT_THEME_PREFERENCE,
  );
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className="theme-switcher inline-flex items-center overflow-hidden rounded-full border border-line bg-paper-strong/80 p-0.5 shadow-sm"
    >
      {THEME_OPTIONS.map((option) => {
        const Icon = option.icon;
        const isActive = preference === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={`${option.label} theme`}
            title={option.label}
            onClick={(event) => {
              requestThemePreference(option.value, event.currentTarget);
            }}
            className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              isActive ? "text-ink" : "text-ink-muted hover:text-ink-soft"
            }`}
          >
            {isActive ? (
              <motion.span
                layoutId="theme-switcher-pill"
                className="absolute inset-0 rounded-full bg-mint ring-1 ring-mint-strong/30"
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 420, damping: 32, mass: 0.6 }
                }
              />
            ) : null}
            <Icon className="relative z-10 h-3.5 w-3.5" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
