import { after } from "next/server";
import { notifyWorker } from "./notify-worker";

export function queueWorkerWake() {
  if (process.env.FETCH_WAKE_URL?.trim()) after(notifyWorker);
}
