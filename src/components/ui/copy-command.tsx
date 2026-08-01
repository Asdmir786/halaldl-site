"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

type CopyCommandProps = {
  command: string;
};

export function CopyCommand({ command }: CopyCommandProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-xl border border-line bg-paper-elevated/90 p-3">
      <div className="flex items-start justify-between gap-3">
        <code className="block min-w-0 flex-1 overflow-x-auto pr-2 text-xs font-medium text-ink sm:text-sm">
          {command}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line-strong bg-paper-strong px-3 py-2 text-xs font-semibold text-ink transition-colors hover:bg-paper"
          aria-label={copied ? "Copied command" : "Copy command"}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
