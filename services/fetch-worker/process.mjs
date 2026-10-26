import { spawn } from "node:child_process";

export function run(command, args, { timeoutMs = 180_000, maxOutput = 4 * 1024 * 1024, signal, cwd } = {}) {
  return new Promise(resolve => {
    const env = { PATH: process.env.PATH, LANG: "C.UTF-8", HOME: cwd, TMPDIR: cwd, TEMP: cwd, TMP: cwd };
    if (process.platform === "win32") env.SystemRoot = process.env.SystemRoot;
    const child = spawn(command, args, { cwd, env, detached: process.platform !== "win32", stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
    let stdout = "", stderr = "", size = 0, reason = null, settled = false;
    function kill(cause) {
      reason ??= cause;
      if (!child.pid) return;
      if (process.platform === "win32") spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" }).on("error", () => child.kill());
      else { try { process.kill(-child.pid, "SIGKILL"); } catch { child.kill("SIGKILL"); } }
    }
    const cancel = () => kill("cancelled");
    const timer = setTimeout(() => kill("timeout"), timeoutMs);
    signal?.addEventListener("abort", cancel, { once: true });
    if (signal?.aborted) cancel();
    child.stdout.on("data", chunk => { size += chunk.length; if (size > maxOutput) kill("output_limit"); else stdout += chunk.toString(); });
    child.stderr.on("data", chunk => { if (stderr.length < 64 * 1024) stderr += chunk.toString().slice(0, 64 * 1024 - stderr.length); });
    function finish(code) {
      if (settled) return;
      settled = true; clearTimeout(timer); signal?.removeEventListener("abort", cancel);
      resolve({ code: reason ? 1 : code ?? 1, stdout, stderr, reason });
    }
    child.on("error", () => finish(1));
    child.on("close", finish);
  });
}
