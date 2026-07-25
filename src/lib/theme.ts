export type Theme = "light" | "dark";
export type ThemePreference = Theme | "system";

export const DEFAULT_THEME: Theme = "light";
export const DEFAULT_THEME_PREFERENCE: ThemePreference = "system";
export const STORAGE_KEY = "halaldl-site-theme";
export const THEME_EVENT = "halaldl-theme-change";
export const THEME_COOKIE = "halaldl-site-theme";
export const THEME_COLOR_LIGHT = "#f5f7fb";
export const THEME_COLOR_DARK = "#080e17";

export function resolveTheme(value: string | null | undefined): Theme {
  return value === "dark" ? "dark" : "light";
}

export function resolveThemePreference(value: string | null | undefined): ThemePreference {
  if (value === "light" || value === "dark" || value === "system") {
    return value;
  }

  return DEFAULT_THEME_PREFERENCE;
}

export function getSystemTheme(): Theme {
  if (typeof window === "undefined") {
    return DEFAULT_THEME;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function resolvePreferenceToTheme(preference: ThemePreference): Theme {
  return preference === "system" ? getSystemTheme() : preference;
}

export function getThemeColor(theme: Theme) {
  return theme === "dark" ? THEME_COLOR_DARK : THEME_COLOR_LIGHT;
}

export function getThemeSnapshotFromDocument(): Theme {
  if (typeof document === "undefined") {
    return DEFAULT_THEME;
  }

  return resolveTheme(document.documentElement.dataset.theme);
}

export function getThemePreferenceSnapshotFromDocument(): ThemePreference {
  if (typeof document === "undefined") {
    return DEFAULT_THEME_PREFERENCE;
  }

  return resolveThemePreference(document.documentElement.dataset.themePreference);
}

export function getThemeScript() {
  return `
    (() => {
      const storageKey = ${JSON.stringify(STORAGE_KEY)};
      const cookieName = ${JSON.stringify(THEME_COOKIE)};
      const darkMedia = "(prefers-color-scheme: dark)";
      const lightColor = ${JSON.stringify(THEME_COLOR_LIGHT)};
      const darkColor = ${JSON.stringify(THEME_COLOR_DARK)};

      const getSystemTheme = () =>
        window.matchMedia(darkMedia).matches ? "dark" : "light";

      const resolvePreference = (value) =>
        value === "light" || value === "dark" || value === "system" ? value : "system";

      const syncThemeColor = (theme) => {
        const color = theme === "dark" ? darkColor : lightColor;
        let meta = document.querySelector('meta[name="theme-color"][data-halaldl-theme]');
        if (!meta) {
          meta = document.createElement("meta");
          meta.setAttribute("name", "theme-color");
          meta.setAttribute("data-halaldl-theme", "true");
          document.head.appendChild(meta);
        }
        meta.setAttribute("content", color);
      };

      const applyTheme = (preference) => {
        const resolved =
          preference === "system" ? getSystemTheme() : preference;
        document.documentElement.dataset.themePreference = preference;
        document.documentElement.dataset.theme = resolved;
        document.documentElement.style.colorScheme = resolved;
        document.cookie = \`\${cookieName}=\${preference}; Path=/; Max-Age=31536000; SameSite=Lax\`;
        syncThemeColor(resolved);
      };

      try {
        const stored = window.localStorage.getItem(storageKey);
        applyTheme(resolvePreference(stored));
      } catch {
        applyTheme("system");
      }
    })();
  `;
}
