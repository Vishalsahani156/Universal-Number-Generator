"use client";

import { formatDuration, formatNumber } from "@/lib/utils";
import type { JobProgress } from "@/types/api";

interface ProgressBarProps {
  progress: JobProgress | null;
  status: string;
}

export function ProgressBar({ progress, status }: ProgressBarProps) {
  const percent = progress?.percent ?? (status === "queued" ? 0 : 0);
  const isActive = status === "processing" || status === "queued";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-300 night:text-slate-400">
          {status === "queued" ? "Waiting in queue..." : `${percent.toFixed(1)}% complete`}
        </span>
        {progress?.eta_seconds != null && status === "processing" && (
          <span className="text-slate-500 dark:text-slate-400 night:text-slate-500">
            ETA: {formatDuration(progress.eta_seconds)}
          </span>
        )}
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700 night:bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isActive ? "bg-brand-500" : "bg-emerald-500"
          } ${status === "queued" ? "animate-pulse" : ""}`}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>

      {progress && (
        <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400 night:text-slate-500">
          <span>{formatNumber(progress.generated_count)} generated</span>
          {progress.current_chunk != null && progress.total_chunks != null && (
            <span>
              Chunk {progress.current_chunk} / {progress.total_chunks}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
