"use client";

import { useState } from "react";
import { CopyCommand } from "@/components/ui/copy-command";

type VerifyCommandOption = {
  id: "full" | "lite";
  label: string;
  fileName: string;
  command: string;
  description: string;
};

type VerifyCommandPanelProps = {
  options: VerifyCommandOption[];
};

export function VerifyCommandPanel({ options }: VerifyCommandPanelProps) {
  const [selectedId, setSelectedId] = useState<VerifyCommandOption["id"]>(options[0]?.id ?? "full");
  const selected = options.find((option) => option.id === selectedId) ?? options[0];

  if (!selected) {
    return null;
  }

  return (
    <div className="mt-5">
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = option.id === selectedId;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedId(option.id)}
              className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? "border-line-strong bg-paper text-ink"
                  : "border-line bg-paper-strong/70 text-ink-soft hover:bg-paper hover:text-ink"
              }`}
              aria-pressed={isActive}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-ink-soft">{selected.description}</p>
      <p className="mt-2 text-xs leading-relaxed text-ink-muted">
        Expected file name: <span className="font-medium text-ink">{selected.fileName}</span>
      </p>

      <CopyCommand command={selected.command} />
    </div>
  );
}
