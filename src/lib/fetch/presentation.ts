export function jobPresentation(status: string, available: boolean, queuePosition?: number | null) {
  if (["queued", "probing", "downloading"].includes(status) && !available) return { label: "Paused", detail: "Processing is paused. Your link is saved and will resume when the service returns.", moving: false };
  if (status === "queued") return { label: queuePosition ? `Queued · #${queuePosition}` : "Queued", detail: queuePosition === 1 ? "You're next in line." : "Your link is saved. Earlier requests go first.", moving: false };
  if (status === "probing") return { label: "Working", detail: "Checking your link for available files…", moving: true };
  if (status === "downloading") return { label: "Working", detail: "Preparing your file…", moving: true };
  if (status === "waiting_choice") return { label: "Choose a file", detail: "Choose the format and quality you want to save.", moving: false };
  if (status === "ready") return { label: "Done", detail: "Your file is ready to preview or download.", moving: false };
  if (status === "cancelled") return { label: "Cancelled", detail: "You can retry this link or start another.", moving: false };
  return { label: status === "expired" ? "Expired" : status === "cancelled" ? "Cancelled" : "Couldn’t finish", detail: "", moving: false };
}
