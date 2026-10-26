export type FetchTier = "anonymous" | "free";

export type TierLimits = {
  dailyDownloads: number;
  dailyProbes: number;
  activeUrls: number;
  maxHeight: number;
  maxSeconds: number;
  maxBytes: number;
  maxCarouselItems: number;
};

export const TIER_LIMITS: Record<FetchTier, TierLimits> = {
  anonymous: {
    dailyDownloads: 50,
    dailyProbes: 100,
    activeUrls: 1,
    maxHeight: 1080,
    maxSeconds: 10 * 60,
    maxBytes: 200 * 1024 * 1024,
    maxCarouselItems: 1,
  },
  free: {
    dailyDownloads: 75,
    dailyProbes: 150,
    activeUrls: 3,
    maxHeight: 2160,
    maxSeconds: 30 * 60,
    maxBytes: 800 * 1024 * 1024,
    maxCarouselItems: 1,
  },

};

export const SERVER_LIMITS = {
  maxRunning: 1,
  maxWaiting: 4,
  maxLoad: 8,
  minFreeDiskMb: 12 * 1024,
  minFreeMemoryMb: 3 * 1024,
  staleJobMs: 20 * 60 * 1000,
  fileTtlMs: 6 * 60 * 60 * 1000,
  recordTtlMs: 30 * 24 * 60 * 60 * 1000,
  gateTtlMs: 30 * 60 * 1000,
  linkTtlSeconds: 15 * 60,
  heartbeatTtlMs: 30 * 1000,
  probeGapMs: 8 * 1000,
};

export function startOfUtcDay(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}
