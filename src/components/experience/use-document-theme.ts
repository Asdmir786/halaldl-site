"use client";

import { useSyncExternalStore } from "react";

function subscribeTheme(onStoreChange: () => void) {
  const root = document.documentElement;
  const observer = new MutationObserver(onStoreChange);
  observer.observe(root, { attributes: true, attributeFilter: ["data-theme", "class"] });
  return () => observer.disconnect();
}

function getThemeSnapshot(): "light" | "dark" {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function useDocumentTheme() {
  return useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => "light" as const);
}
