import type { ReactNode } from "react";

type MarketingShellProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Soft first-paint enter for marketing content below the site header.
 * CSS-only (opacity + translateY), reduced-motion kill-switch in globals.css.
 * Do not nest inside another opacity-0 reveal for the same above-fold block.
 */
export function MarketingShell({ children, className }: MarketingShellProps) {
  return (
    <div className={["marketing-shell-enter", className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
