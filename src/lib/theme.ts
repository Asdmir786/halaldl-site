export type Theme = "light" | "dark";

export const DEFAULT_THEME: Theme = "light";
export const STORAGE_KEY = "halaldl-site-theme";
export const THEME_EVENT = "halaldl-theme-change";
export const THEME_COOKIE = "halaldl-site-theme";

export function resolveTheme(value: string | null | undefined): Theme {
  return value === "dark" ? "dark" : "light";
}

export function getThemeSnapshotFromDocument(): Theme {
  if (typeof document === "undefined") {
    return DEFAULT_THEME;
  }

  return resolveTheme(document.documentElement.dataset.theme);
}

export function getThemeScript() {
  return `
    (() => {
      const storageKey = ${JSON.stringify(STORAGE_KEY)};
      const cookieName = ${JSON.stringify(THEME_COOKIE)};
      const darkMedia = "(prefers-color-scheme: dark)";

      const applyTheme = (theme) => {
        document.documentElement.dataset.theme = theme;
        document.documentElement.style.colorScheme = theme;
        document.cookie = \`\${cookieName}=\${theme}; Path=/; Max-Age=31536000; SameSite=Lax\`;
      };

      try {
        const stored = window.localStorage.getItem(storageKey);
        const theme =
          stored === "light" || stored === "dark"
            ? stored
            : window.matchMedia(darkMedia).matches
              ? "dark"
              : "light";

        applyTheme(theme);
      } catch {
        applyTheme(window.matchMedia(darkMedia).matches ? "dark" : "light");
      }
    })();
  `;
}
