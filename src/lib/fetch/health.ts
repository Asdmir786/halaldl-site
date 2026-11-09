export type WorkerHealth = {
  reported_at?: Date | string | null; protocol_version?: number;
  accepting?: boolean; transcoding?: boolean; detail?: string | null;
};

export function workerAvailability(worker: WorkerHealth | undefined, storageReady: boolean, now = Date.now()) {
  const age = worker?.reported_at ? now - new Date(worker.reported_at).getTime() : Infinity;
  const connected = Number.isFinite(age) && age >= -5000 && age < 30_000;
  const reason = !storageReady ? "storage" : !connected ? "offline" : (worker?.protocol_version ?? 0) < 2 || worker?.detail === "updating" ? "maintenance" : !worker?.accepting || worker?.transcoding ? "capacity" : "ok";
  const messages = {
    storage: "Downloads are temporarily unavailable. Please try again shortly.",
    offline: "The download service is offline. Please try again shortly.",
    maintenance: "The download service is being updated. Please try again shortly.",
    capacity: "Downloads are temporarily paused. Please try again shortly.",
    ok: "Ready to check your link.",
  };
  return { available: reason === "ok", reason, message: messages[reason], workerConnected: connected };
}

export function configuredConcurrency(value = process.env.FETCH_MAX_RUNNING) {
  const count = Number(value ?? 1);
  return Number.isInteger(count) && count >= 1 && count <= 12 ? count : 1;
}
