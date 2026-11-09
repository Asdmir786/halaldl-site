// One request per resource, with a coalesced follow-up and visibility control.
export function createReadController(options: {
  read: (signal: AbortSignal) => Promise<void>;
  interval: () => number;
  onError?: () => void;
  retryMs?: number;
  maxRetryMs?: number;
}) {
  let visible = false, stopped = false, pending = false, failures = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let controller: AbortController | undefined;
  let active: Promise<void> | undefined;
  function clear() { clearTimeout(timer); timer = undefined; }
  function refresh(): Promise<void> {
    if (stopped) return Promise.resolve();
    if (!visible) { pending = true; return Promise.resolve(); }
    if (active) { pending = true; return active; }
    clear(); pending = false;
    const current = controller = new AbortController();
    active = Promise.resolve().then(() => options.read(current.signal)).then(() => { failures = 0; }).catch(() => {
      if (!current.signal.aborted) { failures++; options.onError?.(); }
    }).finally(() => {
      active = undefined;
      if (!visible || stopped) return;
      const delay = failures ? Math.min(options.maxRetryMs ?? 30_000, (options.retryMs ?? 2000) * 2 ** Math.min(failures - 1, 8)) : pending ? 0 : options.interval();
      if (Number.isFinite(delay)) timer = setTimeout(() => { void refresh(); }, delay);
    });
    return active;
  }
  return {
    refresh,
    setVisible(value: boolean, refreshNow = true) {
      visible = value;
      if (!value) { clear(); controller?.abort(); }
      else if (refreshNow || pending) void refresh();
    },
    stop() { stopped = true; clear(); controller?.abort(); },
  };
}

export type ReadController = ReturnType<typeof createReadController>;
