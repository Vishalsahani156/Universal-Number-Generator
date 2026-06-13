"use client";

import { useGenerateStore } from "@/stores/generate-store";
import { cn } from "@/lib/utils";
import type { GenerationMode } from "@/types/api";

const modes: { value: GenerationMode; label: string; description: string }[] = [
  {
    value: "sequential",
    label: "Sequential",
    description: "Continuous range with valid prefixes",
  },
  {
    value: "random",
    label: "Random",
    description: "Random valid prefixes and digits",
  },
];

export function ModeToggle() {
  const { mode, setMode } = useGenerateStore();

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">Generation mode</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {modes.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setMode(m.value)}
            className={cn(
              "rounded-lg border px-4 py-3 text-left transition-colors",
              mode === m.value
                ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/20"
                : "border-slate-200 bg-white hover:bg-slate-50",
            )}
          >
            <p className="text-sm font-medium text-slate-900">{m.label}</p>
            <p className="mt-0.5 text-xs text-slate-500">{m.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
