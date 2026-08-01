import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";

/** Lucide 1.x removed brand icons; this matches the old Github glyph for existing layouts. */
export const GitHubIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ className, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.09-.28-2.13-.95-2.15-.82-.02-1.57.5-1.97 1.27C9 4.8 8.15 5 7.25 5c-.9 0-1.76-.2-2.5-.73-.4-.77-1.15-1.29-1.97-1.27-.67.02-1.23 1.06-.95 2.15-1.01 1.06-1.48 2.28-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  ),
);

GitHubIcon.displayName = "GitHubIcon";
