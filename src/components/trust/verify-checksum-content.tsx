import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardCheck, ExternalLink, FileCheck2, ShieldAlert, ShieldCheck, TerminalSquare } from "lucide-react";
import type { GitHubSnapshot } from "@/lib/github";
import { SITE_LINKS } from "@/lib/site";
import { SiteHeader } from "@/components/home/home-header";
import { SubpageRouteStrip } from "@/components/site/subpage-route-strip";
import { VerifyCommandPanel } from "@/components/trust/verify-command-panel";
import { ProductRelatedGuides } from "@/components/guides/product-related-guides";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { shortenDigest } from "@/components/home/home-shared";

type VerifyChecksumContentProps = {
  github: GitHubSnapshot;
  fullSetupName: string;
  liteSetupName: string;
  fullHashCommand: string;
  liteHashCommand: string;
};

const verificationSteps = [
  { number: "01", title: "Keep one release together", body: "Download the installer and SHA256SUMS.txt from the exact same GitHub Release.", icon: ExternalLink },
  { number: "02", title: "Calculate your local file", body: "Run the PowerShell command below to calculate the SHA256 value for the installer you actually downloaded.", icon: TerminalSquare },
  { number: "03", title: "Compare the two values", body: "A match means the local file matches the hash published in that release. A mismatch means delete it and start again.", icon: FileCheck2 },
];

export function VerifyChecksumContent({ github, fullSetupName, liteSetupName, fullHashCommand, liteHashCommand }: VerifyChecksumContentProps) {
  return (
    <main id="main-content" className="secondary-page overflow-x-hidden">
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8 sm:pb-20">
        <SiteHeader currentPage="none" />
        <SubpageRouteStrip currentPage="trust" />

        <nav aria-label="Breadcrumb" className="mt-6 flex items-center gap-2 text-sm text-ink-muted"><Link href="/" className="transition-colors hover:text-ink">Home</Link><span>/</span><span className="font-medium text-ink">Verify SHA256</span></nav>

        <section className="secondary-hero relative mt-7 overflow-hidden rounded-[2rem] border border-line bg-paper/65 p-6 sm:p-9 lg:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-mint/55 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-24 left-1/4 h-52 w-52 rounded-full bg-sky/70 blur-3xl" aria-hidden="true" />
          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-center">
            <div className="max-w-xl"><div className="eyebrow"><ShieldCheck className="h-3.5 w-3.5" /> Windows verification</div><h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl lg:text-[3.65rem]">A file match—<span className="text-ink-soft">not a trust slogan.</span></h1><p className="mt-5 text-base leading-relaxed text-ink-soft sm:text-lg">This is the practical check: keep the installer and SHA256SUMS.txt from one official release, calculate the local file hash, and continue only when the values match.</p><div className="mt-7 flex flex-wrap gap-3"><a href={github.checksumsUrl} target="_blank" rel="noreferrer" className="glass-cta inline-flex items-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all hover:-translate-y-0.5">Open SHA256SUMS.txt <ExternalLink className="h-4 w-4" /></a><Link href="/download" className="inline-flex items-center gap-2 rounded-2xl border border-line-strong bg-paper-strong px-5 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-paper">Back to download</Link></div><div className="mt-6 flex flex-wrap gap-2"><span className="rounded-full border border-line bg-paper-strong/80 px-3 py-1.5 text-sm text-ink-soft">{github.latestVersion}</span><span className="rounded-full border border-line bg-paper-strong/80 px-3 py-1.5 text-sm text-ink-soft">Checksum sample {shortenDigest(github.checksumDigest)}</span></div></div>

            <aside className="rounded-[1.7rem] border border-line bg-paper-strong/85 p-5 shadow-[0_20px_54px_rgba(8,14,23,0.12)]"><div className="flex items-start justify-between gap-4 border-b border-line pb-4"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">Match check</p><p className="mt-1 font-display text-2xl font-semibold text-ink">Your Downloads folder</p></div><span className="rounded-full bg-mint px-3 py-1 text-xs font-semibold text-mint-strong">Three files</span></div><div className="mt-4 grid gap-3"><div className="rounded-2xl border border-line bg-paper/70 p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">01 Installer</p><p className="mt-2 break-all text-sm font-semibold text-ink">{fullSetupName}</p></div><div className="rounded-2xl border border-line bg-paper/70 p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">02 Checksum manifest</p><p className="mt-2 text-sm font-semibold text-ink">SHA256SUMS.txt</p></div><div className="rounded-2xl border border-mint-strong/20 bg-mint/25 p-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-mint-strong">03 Expected result</p><p className="mt-2 flex items-center gap-2 text-sm font-semibold text-ink"><CheckCircle2 className="h-4 w-4 text-mint-strong" /> SHA256 MATCH</p></div></div></aside>
          </div>
        </section>

        <section className="pt-16 sm:pt-20"><ScrollReveal><div className="max-w-2xl"><div className="eyebrow"><ClipboardCheck className="h-3.5 w-3.5" /> The exact sequence</div><h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">One source. One calculation. One decision.</h2></div></ScrollReveal><div className="mt-8 grid gap-4 lg:grid-cols-3">{verificationSteps.map((step, index) => { const Icon = step.icon; return <ScrollReveal key={step.title} delay={index * 0.07} className="surface-card-static rounded-[1.6rem] p-6"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky text-sm font-semibold text-sky-strong">{step.number}</span><Icon className="mt-5 h-4 w-4 text-mint-strong" /><h3 className="mt-3 font-display text-xl font-semibold text-ink">{step.title}</h3><p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.body}</p></ScrollReveal>; })}</div></section>

        <section className="pt-16 sm:pt-20"><div className="section-divider mb-12" /><ScrollReveal className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start"><div><div className="eyebrow"><TerminalSquare className="h-3.5 w-3.5" /> PowerShell helper</div><h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">Use the command for the installer you downloaded.</h2><p className="mt-4 text-base leading-relaxed text-ink-soft">Keep the installer and SHA256SUMS.txt in Downloads, select the matching build below, then paste the command into Windows PowerShell 5.1 or PowerShell 7.</p><div className="mt-6 rounded-2xl border border-line bg-paper/70 p-4 text-sm leading-relaxed text-ink-soft"><span className="font-semibold text-ink">Do not mix releases.</span> A v0.6.0 installer must be compared with the v0.6.0 SHA256SUMS.txt file.</div></div><div className="surface-card-static rounded-[1.75rem] p-5 sm:p-6"><VerifyCommandPanel options={[{ id: "full", label: "Full installer", fileName: fullSetupName, command: fullHashCommand, description: "Use this if you downloaded the recommended Full setup." }, { id: "lite", label: "Lite installer", fileName: liteSetupName, command: liteHashCommand, description: "Use this if you downloaded Lite and manage more of the setup boundary." }]} /></div></ScrollReveal></section>

        <section className="pt-16 sm:pt-20"><ScrollReveal className="grid gap-5 lg:grid-cols-2"><article className="rounded-[1.75rem] border border-amber-strong/25 bg-amber/30 p-6 sm:p-7"><div className="flex items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber"><ShieldAlert className="h-5 w-5 text-amber-strong" /></div><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-strong">If SmartScreen appears</p><h2 className="mt-2 font-display text-2xl font-semibold text-ink">Pause. Verify. Then decide.</h2><p className="mt-3 text-sm leading-relaxed text-ink-soft">Current installers are not code-signed yet. SmartScreen is not proof that a checksum failed, and it is not a reason to skip your own verification route.</p></div></div></article><article className="surface-card-static rounded-[1.75rem] p-6 sm:p-7"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">A mismatch means stop</p><h2 className="mt-3 font-display text-2xl font-semibold text-ink">Delete the file and begin from the official release again.</h2><p className="mt-3 text-sm leading-relaxed text-ink-soft">Do not run a file that does not match the hash in the checksum manifest. Download it again from the canonical GitHub Release and repeat the same check.</p><a href={github.latestReleaseUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-ink-soft">Open official release <ExternalLink className="h-4 w-4" /></a></article></ScrollReveal></section>

        <section className="pt-16 sm:pt-20"><ScrollReveal className="flex flex-wrap items-center justify-between gap-5 rounded-[1.75rem] border border-line bg-paper/70 p-6 sm:p-7"><div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">Next move</p><h2 className="mt-3 font-display text-2xl font-semibold text-ink">Match first, then install.</h2><p className="mt-2 text-sm leading-relaxed text-ink-soft">When the values match, return to the download path knowing the installer you have is the one attached to the release you checked.</p></div><div className="flex flex-wrap gap-3"><Link href="/download" className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-paper transition-opacity hover:opacity-90">Go to download <ArrowRight className="h-4 w-4" /></Link><a href={SITE_LINKS.repoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-paper-strong px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper">Inspect source <ExternalLink className="h-4 w-4" /></a></div></ScrollReveal></section>

        <ProductRelatedGuides slug="verify-sha256-smartscreen" />
      </div>
    </main>
  );
}
