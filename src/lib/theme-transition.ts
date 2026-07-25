"use client";

import {
  getThemeColor,
  getThemePreferenceSnapshotFromDocument,
  getThemeSnapshotFromDocument,
  resolvePreferenceToTheme,
  STORAGE_KEY,
  THEME_COOKIE,
  THEME_EVENT,
  type Theme,
  type ThemePreference,
} from "@/lib/theme";

const DEBOUNCE_MS = 220;
const FOREGROUND_MS = 180;
const CIRCLE_MS = 520;
const BLUR_PX = 8;

type ViewTransition = {
  ready: Promise<void>;
  finished: Promise<void>;
};

type DocumentWithViewTransition = Document & {
  startViewTransition?: (update: () => void) => ViewTransition;
};

let debounceTimer: number | null = null;
let pendingPreference: ThemePreference | null = null;
let pendingOrigin: HTMLElement | null = null;
let isTransitioning = false;

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

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function clearForegroundLead() {
  const root = document.documentElement;
  delete root.dataset.themeFg;
  root.style.removeProperty("--theme-fg-blur");
}

/** Instant apply — used by boot script path, OS sync, and reduced-motion. */
export function applyThemePreference(preference: ThemePreference) {
  const resolved = resolvePreferenceToTheme(preference);
  const root = document.documentElement;

  root.dataset.themePreference = preference;
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
  clearForegroundLead();
  root.classList.remove("theme-transitioning");
  window.localStorage.setItem(STORAGE_KEY, preference);
  document.cookie = `${THEME_COOKIE}=${preference}; Path=/; Max-Age=31536000; SameSite=Lax`;
  syncThemeColor(resolved);
  window.dispatchEvent(new CustomEvent(THEME_EVENT));
}

function commitPreferenceOnly(preference: ThemePreference) {
  document.documentElement.dataset.themePreference = preference;
  window.localStorage.setItem(STORAGE_KEY, preference);
  document.cookie = `${THEME_COOKIE}=${preference}; Path=/; Max-Age=31536000; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent(THEME_EVENT));
}

function applyForegroundLead(nextTheme: Theme) {
  const root = document.documentElement;
  root.classList.add("theme-transitioning");
  root.dataset.themeFg = nextTheme;
  root.style.setProperty("--theme-fg-blur", "1.25px");
}

function getCircleOrigin(origin: HTMLElement | null) {
  if (origin) {
    const rect = origin.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }

  return {
    x: window.innerWidth / 2,
    y: Math.min(72, window.innerHeight * 0.12),
  };
}

async function runCircleBlurTransition(
  preference: ThemePreference,
  origin: HTMLElement | null,
) {
  const doc = document as DocumentWithViewTransition;
  const { x, y } = getCircleOrigin(origin);
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  if (!doc.startViewTransition || prefersReducedMotion()) {
    applyThemePreference(preference);
    return;
  }

  const transition = doc.startViewTransition(() => {
    applyThemePreference(preference);
    document.documentElement.classList.add("theme-transitioning");
  });

  try {
    await transition.ready;

    const animation = document.documentElement.animate(
      [
        {
          clipPath: `circle(0px at ${x}px ${y}px)`,
          filter: `blur(${BLUR_PX}px)`,
        },
        {
          clipPath: `circle(${endRadius}px at ${x}px ${y}px)`,
          filter: "blur(0px)",
        },
      ],
      {
        duration: CIRCLE_MS,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        pseudoElement: "::view-transition-new(root)",
      },
    );

    await Promise.all([animation.finished.catch(() => undefined), transition.finished]);
  } catch {
    applyThemePreference(preference);
  } finally {
    document.documentElement.classList.remove("theme-transitioning");
    clearForegroundLead();
  }
}

async function runPhasedTransition(
  preference: ThemePreference,
  origin: HTMLElement | null,
) {
  const currentTheme = getThemeSnapshotFromDocument();
  const nextTheme = resolvePreferenceToTheme(preference);

  if (currentTheme === nextTheme) {
    applyThemePreference(preference);
    return;
  }

  if (prefersReducedMotion()) {
    applyThemePreference(preference);
    return;
  }

  isTransitioning = true;

  try {
    // Move the switcher pill immediately; colors follow in phases.
    commitPreferenceOnly(preference);

    // Phase 1 — text/ink leads with a soft blur.
    applyForegroundLead(nextTheme);
    await wait(90);
    document.documentElement.style.setProperty("--theme-fg-blur", "0px");
    await wait(FOREGROUND_MS - 90);

    // Phase 2 — background circle + blur wipe to the full theme.
    await runCircleBlurTransition(preference, origin);
  } finally {
    isTransitioning = false;
    document.documentElement.classList.remove("theme-transitioning");
    clearForegroundLead();

    if (pendingPreference) {
      const queued = pendingPreference;
      const queuedOrigin = pendingOrigin;
      pendingPreference = null;
      pendingOrigin = null;
      void runPhasedTransition(queued, queuedOrigin);
    }
  }
}

/**
 * Debounced theme change: coalesces rapid clicks, then runs
 * text-first → circle+blur background transition.
 */
export function requestThemePreference(
  preference: ThemePreference,
  origin: HTMLElement | null = null,
) {
  if (preference === getThemePreferenceSnapshotFromDocument() && !isTransitioning) {
    return;
  }

  pendingPreference = preference;
  pendingOrigin = origin;

  if (debounceTimer !== null) {
    window.clearTimeout(debounceTimer);
  }

  debounceTimer = window.setTimeout(() => {
    debounceTimer = null;

    if (!pendingPreference || isTransitioning) {
      // Keep pending so the in-flight transition can pick it up when done.
      return;
    }

    const next = pendingPreference;
    const originEl = pendingOrigin;
    pendingPreference = null;
    pendingOrigin = null;

    void runPhasedTransition(next, originEl);
  }, DEBOUNCE_MS);
}
