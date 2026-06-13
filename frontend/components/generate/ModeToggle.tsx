"use client";

import { useGenerateStore } from "@/stores/generate-store";
import { cn } from "@/lib/utils";
import type { GenerationMode } from "@/types/api";

const modes: { value: GenerationMode; label: string; description: string }[] =
  [
    {
      value: "sequential",
      label: "Sequential",
      description: "Unique numbers within valid range",
    },
    {
      value: "random",
      label: "Random",
      description: "Random prefixes and digits",
    },
  ];

export function ModeToggle() {
  const { generationMode, setGenerationMode } = useGenerateStore();

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">Generation Mode</p>
      <div className="grid grid-cols-2 gap-3">
        {modes.map((mode) => (
          <button
            key={mode.value}
            type="button"
            onClick={() => setGenerationMode(mode.value)}
            className={cn(
              "rounded-lg border p-3 text-left transition-all",
              generationMode === mode.value
                ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/20"
                : "border-slate-200 bg-white hover:border-slate-300"
            )}
          >
            <p className="text-sm font-medium text-slate-900">{mode.label}</p>
            <p className="mt-0.5 text-xs text-slate-500">{mode.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
