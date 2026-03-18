"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import { DEFAULT_THEME, getThemeSnapshotFromDocument, THEME_EVENT } from "@/lib/theme";

type ThemedScreenshotProps = {
  lightSrc: string;
  darkSrc: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
};

export function ThemedScreenshot({
  lightSrc,
  darkSrc,
  alt,
  sizes,
  priority = false,
  className,
  imageClassName,
}: ThemedScreenshotProps) {
  const theme = useSyncExternalStore(
    (callback) => {
      if (typeof window === "undefined") {
        return () => {};
      }

      const handleThemeChange = () => callback();
      window.addEventListener(THEME_EVENT, handleThemeChange);

      return () => {
        window.removeEventListener(THEME_EVENT, handleThemeChange);
      };
    },
    getThemeSnapshotFromDocument,
    () => DEFAULT_THEME,
  );
  const activeSrc = theme === "dark" ? darkSrc : lightSrc;

  return (
    <div
      role="img"
      aria-label={alt}
      className={`absolute inset-0 block ${className ?? ""}`.trim()}
    >
      <Image
        src={activeSrc}
        alt=""
        aria-hidden="true"
        fill
        priority={priority}
        sizes={sizes}
        className={`bg-paper-strong ${imageClassName ?? ""}`.trim()}
      />
    </div>
  );
}
