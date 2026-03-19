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
  native?: boolean;
  renderMode?: "active" | "paired";
};

export function ThemedScreenshot({
  lightSrc,
  darkSrc,
  alt,
  sizes,
  priority = false,
  className,
  imageClassName,
  native = false,
  renderMode = "active",
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
  const sharedClassName = `bg-paper-strong ${imageClassName ?? ""}`.trim();

  return (
    <div
      role="img"
      aria-label={alt}
      className={`absolute inset-0 block ${className ?? ""}`.trim()}
    >
      {renderMode === "paired" ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightSrc}
            alt=""
            aria-hidden="true"
            loading={priority ? "eager" : "lazy"}
            className={`theme-image theme-image-light h-full w-full ${sharedClassName}`.trim()}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={darkSrc}
            alt=""
            aria-hidden="true"
            loading={priority ? "eager" : "lazy"}
            className={`theme-image theme-image-dark h-full w-full ${sharedClassName}`.trim()}
          />
        </>
      ) : native ? (
        // Native img avoids theme-switch lag for below-the-fold screenshot stages.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${theme}-${activeSrc}`}
          src={activeSrc}
          alt=""
          aria-hidden="true"
          loading={priority ? "eager" : "lazy"}
          className={`h-full w-full ${sharedClassName}`.trim()}
        />
      ) : (
        <Image
          key={`${theme}-${activeSrc}`}
          src={activeSrc}
          alt=""
          aria-hidden="true"
          fill
          priority={priority}
          sizes={sizes}
          className={sharedClassName}
        />
      )}
    </div>
  );
}
