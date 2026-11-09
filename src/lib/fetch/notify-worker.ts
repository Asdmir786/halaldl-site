export async function notifyWorker() {
  const url = process.env.FETCH_WAKE_URL?.trim();
  const token = process.env.FETCH_WAKE_TOKEN?.trim();
  if (!url || !token || [process.env.WORKER_TOKEN?.trim(), process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim()].includes(token)) return;
  try {
    const response = await fetch(url, { method: "POST", headers: { authorization: `Bearer ${token}` }, redirect: "error", signal: AbortSignal.timeout(1000) });
    await response.body?.cancel();
  } catch { /* The durable queue and worker tick recover missed notifications. */ }
}
