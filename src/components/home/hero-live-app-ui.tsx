import {
  HERO_APP_COLORS as C,
  type HeroSidebarItem,
} from "@/components/home/hero-live-app-data";

export function HeroWindowChrome({ title }: { title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px 7px", background: C.sidebar, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
      <span style={{ width: 10, height: 10, borderRadius: "50%", background: C.red, flexShrink: 0 }} />
      <span style={{ width: 10, height: 10, borderRadius: "50%", background: C.yellow, flexShrink: 0 }} />
      <span style={{ width: 10, height: 10, borderRadius: "50%", background: C.green, flexShrink: 0 }} />
      <span style={{ fontSize: 11, fontWeight: 600, color: C.inkMuted, marginLeft: 6, letterSpacing: "0.03em" }}>{title} — HalalDL</span>
    </div>
  );
}

export function HeroSidebarItem({ item, active }: { item: HeroSidebarItem; active: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, background: active ? C.sidebarActive : "transparent", cursor: "default" }}>
      <span style={{ fontSize: 11, color: active ? C.mint : C.inkMuted, width: 16, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
      <span style={{ fontSize: 12, fontWeight: active ? 600 : 400, color: active ? C.ink : C.inkSoft, flex: 1 }}>{item.label}</span>
      {item.badge ? <span style={{ fontSize: 9, fontWeight: 700, color: C.mint, background: C.mintDim, borderRadius: 99, padding: "1px 5px" }}>{item.badge}</span> : null}
    </div>
  );
}

type QueueCardStatus = "active" | "done" | "queued";

export function HeroQueueCard({
  progress,
  status,
  title,
  formats = [],
}: {
  progress: number;
  status: QueueCardStatus;
  title: string;
  formats?: string[];
}) {
  const tagColor = status === "done" ? C.tagDone : status === "queued" ? C.tagQueued : C.tagActive;
  const tagText = status === "queued" ? "#febc2e" : C.mint;
  const tagLabel = status === "done" ? "✓ Done" : status === "queued" ? "Queued" : "Active";

  return (
    <div style={{ background: C.card, border: `1px solid ${status === "active" ? C.mintBorder : C.cardBorder}`, borderRadius: 10, padding: "10px 12px", boxShadow: status === "active" ? `0 0 0 1px ${C.mintBorder}, 0 4px 16px rgba(38,224,198,0.06)` : "none" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 7 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.ink, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: tagText, background: tagColor, borderRadius: 99, padding: "2px 8px", flexShrink: 0 }}>{tagLabel}</span>
      </div>
      {formats.length > 0 ? <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: status !== "queued" ? 7 : 0 }}>
        {formats.map((format) => <span key={format} style={{ fontSize: 8, lineHeight: 1, fontWeight: 700, color: C.inkSoft, background: C.pill, border: `1px solid ${C.cardBorder}`, borderRadius: 99, padding: "3px 5px", letterSpacing: "0.02em" }}>{format}</span>)}
      </div> : null}
      {status !== "queued" ? <>
        <div style={{ height: 3, background: C.progressTrack, borderRadius: 99, overflow: "hidden", marginBottom: 5 }}>
          <div style={{ height: "100%", width: `${progress}%`, background: C.progressFill, borderRadius: 99, transition: "width 0.3s ease", boxShadow: status === "active" ? "0 0 6px rgba(38,224,198,0.4)" : "none" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 9, color: C.inkMuted }}>{status === "done" ? "Completed" : `${progress.toFixed(0)}%`}</span>
          {status === "active" ? <span style={{ fontSize: 9, color: C.mint, fontWeight: 600 }}>{(3.2 + (progress / 100) * 8.4).toFixed(1)} MB/s</span> : null}
        </div>
      </> : null}
    </div>
  );
}
