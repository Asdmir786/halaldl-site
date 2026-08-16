"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/components/experience/use-prefers-reduced-motion";

// ─── Animation state machine ─────────────────────────────────────────────────
// idle → typing → typed → preset-open → preset-selected → downloading → done → idle

type Stage =
  | "idle"
  | "typing"
  | "typed"
  | "preset-open"
  | "preset-selected"
  | "downloading"
  | "done";

const URL_TEXT = "https://youtube.com/watch?v=dQw4w9WgXcQ";
const PRESETS = ["Best Video", "Best Video (Up to 1080p)", "Audio MP3", "WhatsApp Ready"];
const SELECTED_PRESET = "Best Video (Up to 1080p)";

// ─── Sub-components ──────────────────────────────────────────────────────────

function SidebarNav({ theme }: { theme: "light" | "dark" }) {
  const items = [
    { label: "Downloads", icon: "↓", active: true, badge: "2" },
    { label: "Presets", icon: "≡", active: false },
    { label: "Tools", icon: "⚙", active: false },
    { label: "Logs", icon: ">_", active: false },
    { label: "History", icon: "◷", active: false },
    { label: "Settings", icon: "⚙", active: false },
  ];

  const bg = theme === "dark" ? "#0c1422" : "#f0f4f9";
  const activeBg = theme === "dark" ? "#1a2434" : "#ffffff";
  const textColor = theme === "dark" ? "#a8bdd4" : "#5b7fa8";
  const activeText = theme === "dark" ? "#f5f7fb" : "#080e17";
  const borderColor = theme === "dark" ? "rgba(245,247,251,0.06)" : "rgba(8,14,23,0.06)";

  return (
    <div
      style={{
        width: 140,
        flexShrink: 0,
        background: bg,
        borderRight: `1px solid ${borderColor}`,
        display: "flex",
        flexDirection: "column",
        padding: "14px 8px",
        gap: 2,
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "4px 8px 12px",
          marginBottom: 4,
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: 5,
            background: "linear-gradient(135deg, #0b7f72, #26e0c6)",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: activeText,
            letterSpacing: "0.02em",
          }}
        >
          HalalDL
        </span>
      </div>

      {items.map((item) => (
        <div
          key={item.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "6px 8px",
            borderRadius: 8,
            background: item.active ? activeBg : "transparent",
            cursor: "default",
          }}
        >
          <span style={{ fontSize: 10, color: item.active ? "#0b7f72" : textColor, width: 14, textAlign: "center" }}>
            {item.icon}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: item.active ? 600 : 400,
              color: item.active ? activeText : textColor,
              flex: 1,
            }}
          >
            {item.label}
          </span>
          {item.badge && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: "#0b7f72",
                background: theme === "dark" ? "rgba(11,127,114,0.18)" : "rgba(11,127,114,0.12)",
                borderRadius: 99,
                padding: "1px 5px",
              }}
            >
              {item.badge}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function DownloadCard({
  title,
  status,
  progress,
  speed,
  theme,
  delay = 0,
}: {
  title: string;
  status: "done" | "active" | "queued";
  progress: number;
  speed?: string;
  theme: "light" | "dark";
  delay?: number;
}) {
  const statusColors: Record<string, string> = {
    done: "#0b7f72",
    active: "#5b7fa8",
    queued: "#d4860a",
  };
  const statusLabels: Record<string, string> = {
    done: "Done",
    active: "Downloading",
    queued: "Waiting",
  };
  const cardBg = theme === "dark"
    ? status === "active" ? "rgba(91,127,168,0.08)" : "rgba(245,247,251,0.03)"
    : status === "active" ? "rgba(91,127,168,0.06)" : "rgba(8,14,23,0.02)";
  const borderColor = theme === "dark"
    ? status === "active" ? "rgba(91,127,168,0.2)" : "rgba(245,247,251,0.06)"
    : status === "active" ? "rgba(91,127,168,0.15)" : "rgba(8,14,23,0.06)";
  const textColor = theme === "dark" ? "#f5f7fb" : "#080e17";
  const mutedColor = theme === "dark" ? "#5b7fa8" : "#5b7fa8";
  const trackBg = theme === "dark" ? "rgba(245,247,251,0.08)" : "rgba(8,14,23,0.08)";

  return (
    <div
      style={{
        background: cardBg,
        border: `1px solid ${borderColor}`,
        borderRadius: 10,
        padding: "10px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        opacity: status === "queued" ? 0.65 : 1,
        animationDelay: `${delay}ms`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: textColor, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {title}
        </span>
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: statusColors[status],
            background: `${statusColors[status]}18`,
            borderRadius: 99,
            padding: "2px 7px",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {statusLabels[status]}
        </span>
      </div>

      {status !== "queued" && (
        <>
          <div style={{ height: 3, background: trackBg, borderRadius: 99, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: status === "done"
                  ? "linear-gradient(90deg, #0b7f72, #26e0c6)"
                  : "linear-gradient(90deg, #5b7fa8, #8eacc8)",
                borderRadius: 99,
                transition: "width 0.4s ease",
              }}
            />
          </div>
          {speed && (
            <span style={{ fontSize: 9, color: mutedColor }}>{speed}</span>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main mockup ─────────────────────────────────────────────────────────────

export function HeroAppMockup({ theme }: { theme: "light" | "dark" }) {
  const reducedMotion = usePrefersReducedMotion();
  const [stage, setStage] = useState<Stage>("idle");
  const [typedUrl, setTypedUrl] = useState("");
  const [presetOpen, setPresetOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("Best Video");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [doneProgress, setDoneProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  const bg = theme === "dark" ? "#080e17" : "#f5f7fb";
  const headerBg = theme === "dark" ? "#0c1422" : "#ffffff";
  const borderColor = theme === "dark" ? "rgba(245,247,251,0.06)" : "rgba(8,14,23,0.06)";
  const inputBg = theme === "dark" ? "#121c2c" : "#f5f7fb";
  const inputBorder = theme === "dark" ? "rgba(245,247,251,0.1)" : "rgba(8,14,23,0.1)";
  const textColor = theme === "dark" ? "#f5f7fb" : "#080e17";
  const mutedColor = theme === "dark" ? "#5b7fa8" : "#5b7fa8";
  const dropdownBg = theme === "dark" ? "#121c2c" : "#ffffff";
  const dropdownBorder = theme === "dark" ? "rgba(245,247,251,0.1)" : "rgba(8,14,23,0.1)";
  const dropdownHover = theme === "dark" ? "rgba(245,247,251,0.06)" : "rgba(8,14,23,0.04)";

  const clear = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  const schedule = (fn: () => void, ms: number) => {
    timerRef.current = setTimeout(fn, ms);
  };

  useEffect(() => {
    if (reducedMotion) {
      // Static final state under reduced motion
      setStage("done");
      setTypedUrl(URL_TEXT);
      setSelectedPreset(SELECTED_PRESET);
      setDownloadProgress(100);
      setDoneProgress(100);
      return;
    }

    // ── Animation loop ──
    const runLoop = () => {
      // Reset
      setStage("idle");
      setTypedUrl("");
      setPresetOpen(false);
      setSelectedPreset("Best Video");
      setDownloadProgress(0);
      setDoneProgress(0);

      // 1. Pause at idle
      schedule(() => {
        setStage("typing");

        // 2. Type the URL character by character
        let i = 0;
        const typeNext = () => {
          i++;
          setTypedUrl(URL_TEXT.slice(0, i));
          if (i < URL_TEXT.length) {
            schedule(typeNext, 38);
          } else {
            setStage("typed");
            // 3. Open preset dropdown
            schedule(() => {
              setStage("preset-open");
              setPresetOpen(true);
              // 4. Select a preset
              schedule(() => {
                setSelectedPreset(SELECTED_PRESET);
                setPresetOpen(false);
                setStage("preset-selected");
                // 5. Start download
                schedule(() => {
                  setStage("downloading");
                  let progress = 0;
                  const tick = () => {
                    progress += 0.9 + Math.random() * 0.6;
                    if (progress >= 100) {
                      progress = 100;
                      setDownloadProgress(100);
                      setStage("done");
                      // 6. Show done state, then restart
                      schedule(() => {
                        setDoneProgress(100);
                        schedule(runLoop, 2800);
                      }, 300);
                      return;
                    }
                    setDownloadProgress(progress);
                    schedule(tick, 55);
                  };
                  schedule(tick, 80);
                }, 600);
              }, 700);
            }, 500);
          }
        };
        schedule(typeNext, 38);
      }, 900);
    };

    runLoop();
    return clear;
  }, [reducedMotion]);

  const isDownloading = stage === "downloading";
  const isDone = stage === "done";
  const speed = isDownloading
    ? `${(4.2 + (downloadProgress / 100) * 5.8).toFixed(1)} MB/s`
    : isDone
    ? "12.3 MB/s"
    : undefined;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: bg,
        borderRadius: "inherit",
        display: "flex",
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Sidebar */}
      <SidebarNav theme={theme} />

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div
          style={{
            background: headerBg,
            borderBottom: `1px solid ${borderColor}`,
            padding: "12px 16px 10px",
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: textColor, marginBottom: 1 }}>
            Downloads
          </div>
          <div style={{ fontSize: 10, color: mutedColor }}>
            {selectedPreset} · C:\Users\halal\Downloads\HalalDL
          </div>
        </div>

        {/* URL input + preset */}
        <div
          style={{
            padding: "10px 14px",
            borderBottom: `1px solid ${borderColor}`,
            background: headerBg,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {/* URL bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: inputBg,
              border: `1px solid ${stage === "typing" || stage === "typed" ? "#0b7f72" : inputBorder}`,
              borderRadius: 8,
              padding: "7px 10px",
              transition: "border-color 0.2s",
              boxShadow: (stage === "typing" || stage === "typed") ? "0 0 0 2px rgba(11,127,114,0.15)" : "none",
            }}
          >
            <span style={{ fontSize: 10, color: mutedColor, flexShrink: 0 }}>🔗</span>
            <span
              style={{
                fontSize: 10.5,
                color: typedUrl ? textColor : mutedColor,
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontFamily: "monospace",
              }}
            >
              {typedUrl || "Paste a video, playlist, or direct media URL"}
              {(stage === "typing") && (
                <span
                  style={{
                    display: "inline-block",
                    width: 1.5,
                    height: "0.85em",
                    background: "#0b7f72",
                    marginLeft: 1,
                    verticalAlign: "middle",
                    animation: "blink 0.8s step-end infinite",
                  }}
                />
              )}
            </span>
            <button
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: "#ffffff",
                background: isDone || isDownloading ? "#0b7f72" : "#5b7fa8",
                border: "none",
                borderRadius: 6,
                padding: "4px 10px",
                cursor: "default",
                flexShrink: 0,
                transition: "background 0.3s",
              }}
            >
              {isDone ? "✓ Done" : isDownloading ? "▶ Running" : "▶ Start"}
            </button>
          </div>

          {/* Preset selector */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: inputBg,
                border: `1px solid ${presetOpen ? "#0b7f72" : inputBorder}`,
                borderRadius: 8,
                padding: "6px 10px",
                cursor: "default",
                transition: "border-color 0.2s",
              }}
            >
              <div>
                <div style={{ fontSize: 8, fontWeight: 600, color: mutedColor, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 1 }}>
                  PRESET
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: textColor }}>{selectedPreset}</div>
              </div>
              <span style={{ fontSize: 10, color: mutedColor, transform: presetOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
            </div>

            {/* Dropdown */}
            {presetOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  left: 0,
                  right: 0,
                  background: dropdownBg,
                  border: `1px solid ${dropdownBorder}`,
                  borderRadius: 8,
                  zIndex: 10,
                  overflow: "hidden",
                  boxShadow: "0 8px 24px rgba(8,14,23,0.14)",
                }}
              >
                {PRESETS.map((p) => (
                  <div
                    key={p}
                    style={{
                      padding: "7px 10px",
                      fontSize: 11,
                      color: p === SELECTED_PRESET ? "#0b7f72" : textColor,
                      fontWeight: p === SELECTED_PRESET ? 600 : 400,
                      background: p === SELECTED_PRESET ? dropdownHover : "transparent",
                      cursor: "default",
                    }}
                  >
                    {p === SELECTED_PRESET ? "✓ " : "  "}{p}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Download queue */}
        <div
          style={{
            flex: 1,
            padding: "10px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            overflowY: "hidden",
          }}
        >
          {/* Queue label */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#0b7f72" }} />
            <span style={{ fontSize: 9, fontWeight: 700, color: mutedColor, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Queue
            </span>
          </div>

          {/* Active download card — only shows when downloading or done */}
          {(isDownloading || isDone) && (
            <DownloadCard
              title="Best Video (Up to 1080p) · youtube.com"
              status={isDone ? "done" : "active"}
              progress={isDone ? 100 : downloadProgress}
              speed={speed}
              theme={theme}
            />
          )}

          {/* Static waiting card */}
          <DownloadCard
            title="Audio MP3 · soundcloud.com/track"
            status="queued"
            progress={0}
            theme={theme}
          />

          {/* Done card from previous run */}
          <DownloadCard
            title="WhatsApp Ready · instagram.com/reel"
            status="done"
            progress={100}
            theme={theme}
          />
        </div>

        {/* Status bar */}
        <div
          style={{
            borderTop: `1px solid ${borderColor}`,
            padding: "5px 14px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: headerBg,
          }}
        >
          {isDownloading && (
            <div style={{ flex: 1, height: 2, background: theme === "dark" ? "rgba(245,247,251,0.08)" : "rgba(8,14,23,0.08)", borderRadius: 99, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${downloadProgress}%`,
                  background: "linear-gradient(90deg, #5b7fa8, #0b7f72)",
                  borderRadius: 99,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          )}
          <span style={{ fontSize: 9, color: mutedColor, whiteSpace: "nowrap" }}>
            {isDone
              ? "✓ 1 completed"
              : isDownloading
              ? `↓ ${downloadProgress.toFixed(0)}%  ·  ${speed}`
              : "2 active · 1 waiting"}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
