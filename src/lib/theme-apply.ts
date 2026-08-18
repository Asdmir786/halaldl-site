import {
  getThemeColor,
  resolvePreferenceToTheme,
  STORAGE_KEY,
  THEME_COOKIE,
  THEME_EVENT,
  type ThemePreference,
} from "@/lib/theme";

function clearForegroundLead() {
  const root = document.documentElement;
  delete root.dataset.themeFg;
  root.style.removeProperty("--theme-fg-blur");
}

function syncThemeColor(theme: "light" | "dark") {
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

/** Lightweight theme application used by boot-time and OS preference changes. */
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
