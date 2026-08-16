"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Captions,
  CheckCircle2,
  ChevronRight,
  Download,
  FolderOpen,
  Link2,
  ListVideo,
  Music2,
  Play,
  SlidersHorizontal,
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { valueProps } from "@/components/home/home-data";
import { SectionIntro, SectionShell } from "@/components/home/home-shared";
import { usePrefersReducedMotion } from "@/components/experience/use-prefers-reduced-motion";

const WORKFLOW_STEPS = [
  {
    id: "paste",
    num: "01",
    label: "Preview & select",
    title: "Preview the link. Pick the entries you actually want.",
    body: "Bring in a supported video, playlist, channel, or social-media link, then preview it before the queue begins. A playlist can be narrowed to the entries worth keeping.",
    detail: "Selection happens before the queue, so a larger source does not become an accidental bulk download.",
    tags: ["Link preview", "Playlist entries", "Explicit queue"],
    icon: ListVideo,
  },
  {
    id: "choose",
    num: "02",
    label: "Choose output",
    title: "Set the quality, format, and helpers for the job.",
    body: "Start with a practical preset—Best Video, MP3 audio, subtitles, or a social-ready export—then choose the available quality and reuse that setup whenever it fits.",
    detail: "Choose up to 4K where the source provides it, or switch to audio, subtitles, cookies, and SponsorBlock controls when needed.",
    tags: ["720p / 1080p / 4K*", "MP3 audio", "Subtitles"],
    icon: SlidersHorizontal,
  },
  {
    id: "finish",
    num: "03",
    label: "Finish locally",
    title: "Recover, organize, and create from completed media.",
    body: "Download Doctor turns common failures into safe next steps. When a job is complete, Library and Follows keep it organized while Clip Maker turns local media into a new clip.",
    detail: "Keep the queue visible, recover deliberately, then reopen, organize, or create without handing your files to a cloud account.",
    tags: ["Download Doctor", "Library & Follows", "Clip Maker"],
    icon: FolderOpen,
  },
] as const;

type WorkflowStepId = (typeof WORKFLOW_STEPS)[number]["id"];

function WorkflowFlowPreview({ activeId }: { activeId: WorkflowStepId }) {
  const activeIndex = WORKFLOW_STEPS.findIndex((step) => step.id === activeId);
  const status = activeId === "paste"
    ? "Preview ready — select the entries that belong in the queue"
    : activeId === "choose"
      ? "Output selected — preparing the local queue"
      : "Finished locally — ready to recover, organize, or create";

  return (
    <div className="workflow-flow-preview" data-active-step={activeId} aria-label="Animated download workflow pipeline">
      <div className="workflow-flow-kicker"><span /> LOCAL DOWNLOAD FLOW</div>
      <div className="workflow-flow-track">
        {WORKFLOW_STEPS.map((step, index) => {
          const Icon = step.icon;
          const state = index < activeIndex ? "is-complete" : index === activeIndex ? "is-active" : "";
          return (
            <div className="contents" key={step.id}>
              <div className={`workflow-flow-node ${state}`}>
                <span className="workflow-flow-node-icon"><Icon className="h-4 w-4" /></span>
                <span className="workflow-flow-node-label">{step.label}</span>
                <span className="workflow-flow-node-caption">{index === 0 ? "Choose exact items" : index === 1 ? "Video or audio" : "Recover & create"}</span>
              </div>
              {index < WORKFLOW_STEPS.length - 1 && (
                <div className={`workflow-flow-connector ${index < activeIndex ? "is-complete" : ""}`}>
                  <span />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="workflow-flow-status"><CheckCircle2 className="h-3.5 w-3.5" />{status}</div>
    </div>
  );
}

export function WorkflowSection() {
  const reducedMotion = usePrefersReducedMotion();
  const [activeId, setActiveId] = useState<WorkflowStepId>("paste");
  const sectionRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef(new Map<WorkflowStepId, HTMLElement>());
  const jumpLockUntil = useRef(0);

  const activeIndex = useMemo(
    () => WORKFLOW_STEPS.findIndex((step) => step.id === activeId),
    [activeId],
  );

  const registerBlock = useCallback((id: WorkflowStepId) => {
    return (node: HTMLElement | null) => {
      if (node) blockRefs.current.set(id, node);
      else blockRefs.current.delete(id);
    };
  }, []);

  useEffect(() => {
    const nodes = Array.from(blockRefs.current.values());
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < jumpLockUntil.current) return;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = (entry.target as HTMLElement).dataset.workflowId as WorkflowStepId | undefined;
          if (id) setActiveId(id);
        }
      },
      { rootMargin: "-42% 0px -46% 0px", threshold: 0 },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const jumpToStep = useCallback((id: WorkflowStepId) => {
    setActiveId(id);
    jumpLockUntil.current = Date.now() + (reducedMotion ? 80 : 700);
    blockRefs.current.get(id)?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "center",
    });
  }, [reducedMotion]);

  return (
    <SectionShell>
      <div className="section-divider mb-16" />

      <div ref={sectionRef} className="grid gap-10 lg:grid-cols-[minmax(17rem,0.86fr)_minmax(0,1.14fr)] lg:items-start lg:gap-14 xl:grid-cols-[minmax(20rem,0.92fr)_minmax(0,1.08fr)] xl:gap-20">
        <div className="lg:sticky lg:top-24">
          <SectionIntro
            id="features"
            eyebrow="Workflow"
            title="From a link to a file."
            accent="Without the shell routine."
            body="HalalDL turns the local media workflow into three plain decisions: preview and select the source, choose the output, then recover, organize, or create from the files you keep."
          />

          <div className="workflow-narrative-panel mt-7">
            <div
              className="workflow-stepper"
              role="tablist"
              aria-label="HalalDL download workflow"
              style={{ "--workflow-progress": `${((activeIndex + 1) / WORKFLOW_STEPS.length) * 100}%` } as React.CSSProperties}
            >
              {WORKFLOW_STEPS.map((step, index) => {
                const isActive = step.id === activeId;
                return (
                  <button
                    key={step.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => jumpToStep(step.id)}
                    className={`workflow-stepper-item ${isActive ? "is-active" : ""}`}
                  >
                    <span className="workflow-stepper-num">{step.num}</span>
                    <span className="workflow-stepper-label">{step.label}</span>
                  </button>
                );
              })}
            </div>

            <WorkflowFlowPreview activeId={activeId} />

            <p className="workflow-source-note">
              <span className="font-semibold text-mint-strong">Free & local.</span> Your queue, presets, history, and logs stay on your machine.
            </p>
          </div>
        </div>

        <div className="workflow-story-rail">
          {WORKFLOW_STEPS.map((step, index) => {
            const isActive = step.id === activeId;
            const Icon = step.icon;
            return (
              <article
                key={step.id}
                ref={registerBlock(step.id)}
                data-workflow-id={step.id}
                className={`workflow-story ${isActive ? "is-active" : ""}`}
              >
                <div className="workflow-story-inner">
                  <div className="flex items-center gap-3">
                    <span className="workflow-story-icon"><Icon className="h-4 w-4" /></span>
                    <span className="workflow-story-count">{step.num} / 03</span>
                  </div>
                  <p className="workflow-story-label">{step.label}</p>
                  <h3 className="workflow-story-title">{step.title}</h3>
                  <p className="workflow-story-body">{step.body}</p>
                  <div className="workflow-story-tags" aria-label={`${step.label} capabilities`}>
                    {step.tags.map((tag) => <span key={tag}>{tag}</span>)}
                  </div>
                  <div className="workflow-story-detail">
                    {index === 0 ? <ListVideo className="h-4 w-4" /> : index === 1 ? <Music2 className="h-4 w-4" /> : <FolderOpen className="h-4 w-4" />}
                    <span>{step.detail}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="mt-12 grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        {valueProps.map((prop, index) => (
          <ScrollReveal key={prop.title} className="h-full" delay={index * 0.04} amount={0.42}>
            <article className="surface-card flex h-full min-h-[12.25rem] flex-col rounded-2xl p-5 lg:p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky">
                <prop.icon className="h-5 w-5 text-sky-strong" />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-ink lg:text-lg">{prop.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{prop.body}</p>
            </article>
          </ScrollReveal>
        ))}
      </div>
    </SectionShell>
  );
}
