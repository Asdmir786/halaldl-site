"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/components/experience/use-prefers-reduced-motion";
import {
  HERO_DEMO_CYCLES,
  HERO_HISTORY_ITEMS,
  type HeroDemoStage,
  type OutputMode,
} from "@/components/home/hero-live-app-data";

export function useHeroLiveAppDemo() {
  const reducedMotion = usePrefersReducedMotion();
  const [stage, setStage] = useState<HeroDemoStage>("downloading");
  const [typedUrl, setTypedUrl] = useState(HERO_DEMO_CYCLES[0]!.url);
  const [isFocused, setIsFocused] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(42);
  const [downloadDone, setDownloadDone] = useState(false);
  const [showHistoryCard, setShowHistoryCard] = useState(false);
  const [activeNav, setActiveNav] = useState("downloads");
  const [historyItemsVisible, setHistoryItemsVisible] = useState<number[]>([]);
  const [outputMode, setOutputMode] = useState<OutputMode>("video");
  const [selectedOutput, setSelectedOutput] = useState("4K");
  const [outputPickerActive, setOutputPickerActive] = useState(true);
  const [cycleIndex, setCycleIndex] = useState(0);
  const cycleRef = useRef(0);
  const timeoutIds = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timeoutIds.current.forEach((id) => window.clearTimeout(id));
    timeoutIds.current = [];
  }, []);

  const schedule = useCallback((callback: () => void, delay: number) => {
    const id = window.setTimeout(callback, delay);
    timeoutIds.current.push(id);
  }, []);

  const runAnimation = useCallback(function runAnimation() {
    const cycle = HERO_DEMO_CYCLES[cycleRef.current]!;
    setStage("init");
    setTypedUrl("");
    setIsFocused(false);
    setIsStarting(false);
    setDownloadProgress(0);
    setDownloadDone(false);
    setShowHistoryCard(false);
    setActiveNav("downloads");
    setHistoryItemsVisible([]);
    setOutputMode(cycle.outputMode);
    setSelectedOutput(cycle.outputSteps[0]!);
    setOutputPickerActive(false);

    schedule(() => {
      setIsFocused(true);
      setStage("typing");
    }, 540);

    let cursor = 0;
    const typeNext = () => {
      cursor += 1;
      setTypedUrl(cycle.url.slice(0, cursor));
      if (cursor < cycle.url.length) {
        schedule(typeNext, 32);
        return;
      }

      setStage("typed");
      schedule(() => {
        setStage("previewing");
        schedule(() => {
          setStage("selecting");
          setOutputPickerActive(true);
          const selectOutput = (index: number) => {
          setSelectedOutput(cycle.outputSteps[index]!);
          if (index < cycle.outputSteps.length - 1) {
            schedule(() => selectOutput(index + 1), 620);
            return;
          }
          schedule(() => {
            setOutputPickerActive(false);
            setIsStarting(true);
            setStage("starting");
            schedule(() => {
              setIsStarting(false);
              setStage("downloading");
              setIsFocused(false);

              let progress = 0;
              const tick = () => {
                progress += 1.1 + Math.random() * 0.8;
                if (progress >= 100) {
                  setDownloadProgress(100);
                  schedule(() => {
                    setDownloadDone(true);
                    setStage("done");
                    schedule(() => {
                      setActiveNav("history");
                      setStage("history");
                      schedule(() => setShowHistoryCard(true), 200);
                      HERO_HISTORY_ITEMS.forEach((_, index) => {
                        schedule(() => setHistoryItemsVisible((items) => [...items, index]), 300 + index * 180);
                      });
                      schedule(() => {
                        cycleRef.current = (cycleRef.current + 1) % HERO_DEMO_CYCLES.length;
                        setCycleIndex(cycleRef.current);
                        runAnimation();
                      }, 3200);
                    }, 1200);
                  }, 400);
                  return;
                }
                setDownloadProgress(progress);
                schedule(tick, 45);
              };
              schedule(tick, 200);
            }, 500);
          }, 560);
          };
          selectOutput(0);
        }, 980);
      }, 640);
    };

    schedule(typeNext, 920);
  }, [schedule]);

  useEffect(() => {
    if (reducedMotion) {
      setTypedUrl(HERO_DEMO_CYCLES[0]!.url);
      setDownloadProgress(100);
      setDownloadDone(true);
      setActiveNav("downloads");
      return;
    }

    const initialTimer = window.setTimeout(runAnimation, 3200);
    return () => {
      window.clearTimeout(initialTimer);
      clearTimers();
    };
  }, [clearTimers, reducedMotion, runAnimation]);

  return {
    stage,
    typedUrl,
    isFocused,
    isStarting,
    downloadProgress,
    downloadDone,
    showHistoryCard,
    activeNav,
    historyItemsVisible,
    outputMode,
    selectedOutput,
    outputPickerActive,
    cycleIndex,
    demoCycle: HERO_DEMO_CYCLES[cycleIndex]!,
  };
}
