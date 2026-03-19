import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function formatCompactNumber(input: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(input);
}

export function formatMegabytes(input: number | null) {
  if (!input) {
    return "Size varies";
  }

  return `${(input / (1024 * 1024)).toFixed(1)} MB`;
}

export function shortenDigest(input: string | null) {
  if (!input) {
    return "Attached with release";
  }

  const digest = input.replace("sha256:", "");
  return `${digest.slice(0, 8)}...${digest.slice(-6)}`;
}

type SectionIntroProps = {
  eyebrow: string;
  title: string;
  accent: string;
  body: string;
  className?: string;
};

export function SectionIntro({ eyebrow, title, accent, body, className }: SectionIntroProps) {
  return (
    <ScrollReveal className={className}>
      <div className="eyebrow">{eyebrow}</div>
      <h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
        {title}
        <br />
        <span className="text-ink-soft">{accent}</span>
      </h2>
      <p className="mt-5 text-base leading-relaxed text-ink-soft">{body}</p>
    </ScrollReveal>
  );
}

export type SignalBandItem = {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
};

export function SignalBand({
  items,
  animated = true,
}: {
  items: SignalBandItem[];
  animated?: boolean;
}) {
  return (
    <div className="surface-elevated grid gap-3 rounded-[1.75rem] p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-4">
      {items.map((item, index) => (
        <SignalBandCard
          key={item.label}
          item={item}
          animated={animated}
          delay={index * 0.04}
        />
      ))}
    </div>
  );
}

function SignalBandCard({
  item,
  animated,
  delay,
}: {
  item: SignalBandItem;
  animated: boolean;
  delay: number;
}) {
  const card = (
    <article className="signal-card rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-paper">
          <item.icon className="h-[1.125rem] w-[1.125rem] text-ink" />
        </span>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
          {item.label}
        </p>
      </div>
      <p className="mt-4 font-display text-2xl font-semibold tracking-tight text-ink">
        {item.value}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.detail}</p>
    </article>
  );

  if (!animated) {
    return card;
  }

  return <ScrollReveal delay={delay}>{card}</ScrollReveal>;
}

type TrustChipProps = {
  icon: LucideIcon;
  label: string;
};

export function TrustChip({ icon: Icon, label }: TrustChipProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper-strong/70 px-3 py-1.5 text-xs font-medium text-ink-soft shadow-[0_10px_24px_rgba(12,25,41,0.05)]">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

export function SectionShell({
  children,
  id,
}: {
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="scroll-mt-24 pt-28 sm:scroll-mt-28 sm:pt-32">
      {children}
    </section>
  );
}
