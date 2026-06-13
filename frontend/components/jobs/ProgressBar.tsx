"use client";

import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import type { JobProgress } from "@/types/api";

interface ProgressBarProps {
  progress: JobProgress;
  status: string;
}

export function ProgressBar({ progress, status }: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, progress.percent ?? 0));
  const isActive = status === "processing" || status === "queued";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">
          {status === "queued" ? "Waiting in queue..." : `${percent.toFixed(1)}% complete`}
        </span>
        {progress.eta_seconds != null && isActive && (
          <span className="text-slate-500">
            ETA: {Math.ceil(progress.eta_seconds / 60)} min
          </span>
        )}
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-200">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            status === "completed" && "bg-emerald-500",
            status === "failed" && "bg-red-500",
            status === "cancelled" && "bg-amber-500",
            isActive && "bg-brand-500 animate-pulse"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
        <span>
          Generated: {formatNumber(progress.generated_count ?? 0)}
        </span>
        {progress.current_chunk != null && progress.total_chunks != null && (
          <span>
            Chunk {progress.current_chunk} / {progress.total_chunks}
          </span>
        )}
      </div>
    </div>
  );
}
