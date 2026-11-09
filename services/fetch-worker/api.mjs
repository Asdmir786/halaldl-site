// Keep machine traffic on the project's stable production alias, with its
// automation credential in a header rather than a URL or a log entry.
export function createWorkerApi({ api, token, bypassToken, signal, fetchImpl = fetch }) {
  const origin = new URL(api);
  if (origin.protocol !== "https:" || origin.username || origin.password || origin.search || origin.hash || !token?.trim()) throw new Error("invalid_worker_api");
  const headers = { authorization: `Bearer ${token.trim()}`, "x-halaldl-worker-protocol": "2", "content-type": "application/json" };
  if (bypassToken?.trim()) headers["x-vercel-protection-bypass"] = bypassToken.trim();
  return async (method, body, jobId) => {
    const response = await fetchImpl(`${api.replace(/\/$/, "")}/api/worker${jobId ? `?jobId=${encodeURIComponent(jobId)}` : ""}`, {
      method, headers, redirect: "error", body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.any([...(signal ? [signal] : []), AbortSignal.timeout(method === "DELETE" ? 60_000 : 15_000)]),
    });
    if (!response.ok) {
      const error = new Error("worker_api_failed");
      error.status = response.status;
      error.mitigation = ["deny", "challenge"].includes(response.headers.get("x-vercel-mitigated")) ? response.headers.get("x-vercel-mitigated") : null;
      await response.body?.cancel();
      throw error;
    }
    return response.json();
  };
}

export function retryDelay(failures) {
  return Math.min(60_000, 5000 * 2 ** Math.min(Math.max(failures - 1, 0), 4));
}
