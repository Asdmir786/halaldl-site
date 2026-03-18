import Image from "next/image";

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
  return (
    <div
      role="img"
      aria-label={alt}
      className={`relative block h-full w-full ${className ?? ""}`.trim()}
    >
      <Image
        src={lightSrc}
        alt=""
        aria-hidden="true"
        fill
        priority={priority}
        sizes={sizes}
        className={`theme-image theme-image-light ${imageClassName ?? ""}`}
      />
      <Image
        src={darkSrc}
        alt=""
        aria-hidden="true"
        fill
        priority={priority}
        sizes={sizes}
        className={`theme-image theme-image-dark ${imageClassName ?? ""}`}
      />
    </div>
  );
}
