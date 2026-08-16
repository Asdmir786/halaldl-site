import type { useHeroLiveAppDemo } from "@/components/home/use-hero-live-app-demo";
import { CURRENT_RELEASE } from "@/content/releases/registry";
import {
  AUDIO_OUTPUTS,
  HERO_APP_COLORS as C,
  HERO_HISTORY_ITEMS,
  HERO_SIDEBAR_ITEMS,
  VIDEO_OUTPUTS,
} from "@/components/home/hero-live-app-data";
import { HeroQueueCard, HeroSidebarItem } from "@/components/home/hero-live-app-ui";

type HeroLiveAppDemo = ReturnType<typeof useHeroLiveAppDemo>;

function HeroAppSidebar({ activeNav, downloadDone, downloadProgress }: Pick<HeroLiveAppDemo, "activeNav" | "downloadDone" | "downloadProgress">) {
  const isHistory = activeNav === "history";
  return (
    <aside style={{ width: 168, flexShrink: 0, background: C.sidebar, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", padding: "12px 8px", gap: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 8px 12px" }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, background: "linear-gradient(135deg, #0b7f72, #26e0c6)" }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: C.ink, letterSpacing: "-0.01em" }}>HalalDL</span>
      </div>
      {HERO_SIDEBAR_ITEMS.map((item) => <HeroSidebarItem key={item.id} item={item} active={activeNav === item.id} />)}
      <div style={{ marginTop: "auto", padding: "10px 8px 4px", borderTop: `1px solid ${C.border}`, opacity: isHistory ? 0 : 1, transition: "opacity 0.4s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
          <span style={{ fontSize: 9, color: C.mint }}>↓</span>
          <span style={{ fontSize: 9, color: C.inkSoft, fontWeight: 500 }}>{downloadDone ? "1 completed" : "Downloading · 2 waiting"}</span>
        </div>
        <div style={{ height: 2, background: C.progressTrack, borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: downloadDone ? "100%" : `${downloadProgress}%`, background: C.progressFill, borderRadius: 99, transition: "width 0.3s ease" }} />
        </div>
      </div>
      <div style={{ padding: "6px 8px 0" }}><span style={{ fontSize: 9, color: C.inkMuted, letterSpacing: "0.04em" }}>{CURRENT_RELEASE.tag} FULL</span></div>
    </aside>
  );
}

function HeroOutputPicker({ outputMode, selectedOutput, outputPickerActive }: Pick<HeroLiveAppDemo, "outputMode" | "selectedOutput" | "outputPickerActive">) {
  const renderOptions = (mode: "video" | "audio", options: string[]) => options.map((option) => {
    const active = outputMode === mode && selectedOutput === option;
    return <span key={option} style={{ fontSize: 8, fontWeight: 700, padding: "3px 6px", borderRadius: 99, color: active ? C.mint : C.inkSoft, background: active ? C.mintDim : C.pill, border: `1px solid ${active ? C.mintBorder : C.cardBorder}`, boxShadow: active && outputPickerActive ? "0 0 12px rgba(38,224,198,0.28)" : "none", transform: active && outputPickerActive ? "translateY(-1px) scale(1.04)" : "translateY(0) scale(1)", transition: "color 260ms ease, background 260ms ease, border-color 260ms ease, box-shadow 260ms ease, transform 260ms cubic-bezier(0.22,1,0.36,1)" }}>{option}</span>;
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap", transform: outputPickerActive ? "translateY(-1px)" : "translateY(0)", transition: "transform 0.45s cubic-bezier(0.22,1,0.36,1)" }}>
      <span style={{ fontSize: 8, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginRight: 2 }}>Output</span>
      <span style={{ fontSize: 8, fontWeight: 700, color: C.inkMuted, letterSpacing: "0.08em" }}>Video</span>
      {renderOptions("video", VIDEO_OUTPUTS)}
      <span style={{ width: 1, height: 12, background: C.borderStrong, margin: "0 2px" }} />
      <span style={{ fontSize: 8, fontWeight: 700, color: C.inkMuted, letterSpacing: "0.08em" }}>Audio</span>
      {renderOptions("audio", AUDIO_OUTPUTS)}
    </div>
  );
}

function HeroDownloadsView(demo: HeroLiveAppDemo) {
  const isHistory = demo.activeNav === "history";
  const activeFormats = demo.cycleIndex === 0 ? ["4K HDR", "MP4", "Subtitles"] : demo.cycleIndex === 1 ? ["Carousel", "Media", "Original"] : ["MP3", "Playlist", "18 tracks"];
  const queuedFormats = demo.cycleIndex === 0 ? ["MP3", "Playlist", "Audio"] : demo.cycleIndex === 1 ? ["Video", "Playlist", "12 items"] : ["MP4", "Subtitles", ".srt"];

  return (
    <section aria-hidden={isHistory} style={{ flex: 1, display: "flex", flexDirection: "column", opacity: isHistory ? 0 : 1, transform: isHistory ? "translateX(-16px)" : "translateX(0)", transition: "opacity 0.35s ease, transform 0.35s cubic-bezier(0.22,1,0.36,1)", padding: "16px 18px", gap: 12, overflow: "hidden", position: "absolute", inset: 0 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.ink, letterSpacing: "-0.02em" }}>Downloads</h2>
        <p style={{ margin: "2px 0 0", fontSize: 11, color: C.inkMuted }}>Best Video · C:\\Users\\Demo\\Downloads\\HalalDL</p>
      </div>
      <div style={{ background: C.input, border: `1px solid ${demo.isFocused ? C.mint : C.inputBorder}`, borderRadius: 9, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, boxShadow: demo.isFocused ? "0 0 0 2px rgba(38,224,198,0.15)" : "none", transition: "border-color 0.2s ease, box-shadow 0.2s ease" }}>
        <span style={{ fontSize: 12, color: C.inkMuted, flexShrink: 0 }}>🔗</span>
        <span style={{ flex: 1, fontSize: 12, color: demo.typedUrl ? C.ink : C.inkMuted, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {demo.typedUrl || "Paste a video, playlist, or social-media URL"}
          {demo.isFocused && demo.stage === "typing" ? <span style={{ display: "inline-block", width: 1.5, height: "0.85em", background: C.mint, marginLeft: 1, verticalAlign: "middle", animation: "blink 0.75s step-end infinite" }} /> : null}
        </span>
        <button type="button" tabIndex={-1} style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: demo.isStarting || demo.stage === "typed" ? `linear-gradient(135deg, #0b7f72, ${C.mint})` : demo.downloadDone ? C.mint : "#1a2a3a", border: "none", borderRadius: 7, padding: "5px 12px", cursor: "default", flexShrink: 0, transition: "background 0.3s ease", boxShadow: demo.isStarting ? "0 0 12px rgba(38,224,198,0.5)" : "none" }}>
          {demo.downloadDone ? "✓ Done" : demo.stage === "downloading" ? "▶ Running" : "+ Start"}
        </button>
      </div>
      {demo.stage === "previewing" ? <div style={{ display: "flex", alignItems: "center", gap: 9, background: C.card, border: `1px solid ${C.mintBorder}`, borderRadius: 9, padding: "8px 10px", boxShadow: "0 0 16px rgba(38,224,198,0.08)" }}>
        <span style={{ display: "flex", width: 22, height: 22, alignItems: "center", justifyContent: "center", borderRadius: 6, background: C.mintDim, color: C.mint, fontSize: 11 }}>✓</span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ margin: 0, color: C.ink, fontSize: 10, fontWeight: 700 }}>{demo.demoCycle.previewLabel}</p>
          <p style={{ margin: "2px 0 0", color: C.inkMuted, fontSize: 9 }}>Choose entries before the queue starts</p>
        </div>
        <span style={{ flexShrink: 0, borderRadius: 99, background: C.mintDim, color: C.mint, fontSize: 8, fontWeight: 700, padding: "3px 6px" }}>{demo.demoCycle.selectionLabel}</span>
      </div> : null}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Preset</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: C.pill, borderRadius: 7, padding: "4px 10px" }}><span style={{ fontSize: 11, fontWeight: 600, color: C.inkSoft }}>{demo.demoCycle.preset}</span><span style={{ fontSize: 10, color: C.inkMuted }}>▾</span></div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>{["All 5", "Active 2", "Queued 2", "Done 1"].map((tag, index) => <span key={tag} style={{ fontSize: 9, fontWeight: 600, padding: "3px 7px", borderRadius: 6, background: index === 0 ? C.pill : index === 1 ? C.tagActive : index === 2 ? C.tagQueued : C.tagDone, color: index === 0 ? C.inkSoft : index === 2 ? "#febc2e" : C.mint }}>{tag}</span>)}</div>
      </div>
      <HeroOutputPicker outputMode={demo.outputMode} selectedOutput={demo.selectedOutput} outputPickerActive={demo.outputPickerActive} />
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: C.mint, flexShrink: 0 }} /><span style={{ fontSize: 9, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Queue</span></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        <HeroQueueCard progress={demo.downloadDone ? 100 : demo.downloadProgress} status={demo.downloadDone ? "done" : "active"} title={demo.demoCycle.activeTitle} formats={activeFormats} />
        <HeroQueueCard progress={0} status="queued" title={demo.demoCycle.queuedTitle} formats={queuedFormats} />
      </div>
    </section>
  );
}

function HeroHistoryView({ activeNav, historyItemsVisible, showHistoryCard }: Pick<HeroLiveAppDemo, "activeNav" | "historyItemsVisible" | "showHistoryCard">) {
  const isHistory = activeNav === "history";
  return (
    <section aria-hidden={!isHistory} style={{ flex: 1, display: "flex", flexDirection: "column", opacity: isHistory ? 1 : 0, transform: isHistory ? "translateX(0)" : "translateX(16px)", transition: "opacity 0.35s ease 0.1s, transform 0.35s cubic-bezier(0.22,1,0.36,1) 0.1s", padding: "16px 18px", gap: 12, overflow: "hidden", position: "absolute", inset: 0 }}>
      <div><div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: C.mintDim, borderRadius: 6, padding: "3px 8px", marginBottom: 6 }}><span style={{ fontSize: 9, color: C.mint }}>◷</span><span style={{ fontSize: 9, fontWeight: 700, color: C.mint, textTransform: "uppercase", letterSpacing: "0.08em" }}>Archive</span></div><h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.ink, letterSpacing: "-0.02em" }}>History</h2></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>{[{ label: "Archived", value: "4", sub: "Total stored jobs" }, { label: "Completed", value: "4", sub: "Ready to reopen or copy", check: true }].map((stat) => <div key={stat.label} style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 9, padding: "10px 12px" }}><p style={{ margin: "0 0 4px", fontSize: 9, fontWeight: 700, color: C.inkMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>{stat.label}{stat.check ? <span style={{ color: C.mint, marginLeft: 4 }}>✓</span> : null}</p><p style={{ margin: "0 0 2px", fontSize: 22, fontWeight: 700, color: C.ink }}>{stat.value}</p><p style={{ margin: 0, fontSize: 10, color: C.inkMuted }}>{stat.sub}</p></div>)}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{HERO_HISTORY_ITEMS.map((item, index) => {
        const visible = showHistoryCard && historyItemsVisible.includes(index);
        return <div key={item.title} style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 9, padding: "9px 12px", display: "flex", alignItems: "center", gap: 10, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.35s ease, transform 0.35s cubic-bezier(0.22,1,0.36,1)" }}><div style={{ width: 32, height: 32, borderRadius: 7, flexShrink: 0, background: `linear-gradient(135deg, ${item.color}40, ${item.color}20)`, border: `1px solid ${item.color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 12, color: item.color }}>▶</span></div><div style={{ flex: 1, overflow: "hidden" }}><p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</p><p style={{ margin: "2px 0 0", fontSize: 9, color: C.inkMuted }}>{item.meta}</p></div><span style={{ fontSize: 9, fontWeight: 600, color: C.mint, background: C.mintDim, borderRadius: 99, padding: "2px 7px", flexShrink: 0 }}>On disk</span></div>;
      })}</div>
    </section>
  );
}

export function HeroLiveAppViews(demo: HeroLiveAppDemo) {
  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
      <HeroAppSidebar activeNav={demo.activeNav} downloadDone={demo.downloadDone} downloadProgress={demo.downloadProgress} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: C.bg, position: "relative" }}>
        <HeroDownloadsView {...demo} />
        <HeroHistoryView activeNav={demo.activeNav} historyItemsVisible={demo.historyItemsVisible} showHistoryCard={demo.showHistoryCard} />
      </div>
    </div>
  );
}
