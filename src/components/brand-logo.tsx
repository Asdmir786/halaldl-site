import Image from "next/image";

type BrandLogoProps = {
  size?: number;
  className?: string;
  alt?: string;
};

export function BrandLogo({ size = 26, className, alt = "HalalDL" }: BrandLogoProps) {
  return (
    <span
      role="img"
      aria-label={alt}
      className={`brand-logo relative inline-block shrink-0 overflow-hidden rounded ${className ?? ""}`.trim()}
      style={{ width: size, height: size }}
    >
      <Image
        src="/brand/icon-light.png"
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        sizes={`${size}px`}
        className="theme-image theme-image-light h-full w-full object-contain"
      />
      <Image
        src="/brand/icon-dark.png"
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        sizes={`${size}px`}
        className="theme-image theme-image-dark h-full w-full object-contain"
      />
    </span>
  );
}
