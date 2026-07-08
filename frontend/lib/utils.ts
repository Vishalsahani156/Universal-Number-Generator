import { clsx, type ClassValue } from "clsx";

import { DEFAULT_COLUMN_NAME } from "@/lib/constants";

export function resolveColumnName(name: string): string {
  const trimmed = name.trim();
  return trimmed || DEFAULT_COLUMN_NAME;
}

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

export function formatCompact(value: number): string {
  if (value >= 10_000_000 && value % 10_000_000 === 0) {
    return `${value / 10_000_000} cr`;
  }
  if (value >= 100_000 && value % 100_000 === 0) {
    return `${value / 100_000} lakh`;
  }
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${millions % 1 === 0 ? millions : millions.toFixed(1)}M`;
  }
  return formatNumber(value);
}

/** Parse quantity input: plain numbers, commas, lakh/lac, cr/crore. */
export function parseQuantityInput(raw: string): number | null {
  const normalized = raw.trim().toLowerCase().replace(/,/g, "").replace(/\s+/g, " ");
  if (!normalized) return null;

  const crMatch = normalized.match(/^(\d+(?:\.\d+)?)\s*(?:cr|crore|crores)$/);
  if (crMatch) return Math.round(parseFloat(crMatch[1]) * 10_000_000);

  const lakhMatch = normalized.match(/^(\d+(?:\.\d+)?)\s*(?:l|lakh|lakhs|lac|lacs)$/);
  if (lakhMatch) return Math.round(parseFloat(lakhMatch[1]) * 100_000);

  const num = Number(normalized);
  if (!Number.isFinite(num) || !Number.isInteger(num)) return null;
  return num;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.round(seconds % 60);
  if (minutes < 60) return remaining > 0 ? `${minutes}m ${remaining}s` : `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function estimateFileSizeBytes(quantity: number, format: "csv" | "xlsx" | "pdf"): number {
  const bytesPerRow = format === "csv" ? 14 : format === "pdf" ? 60 : 18;
  return quantity * bytesPerRow;
}

export function estimateDurationSeconds(
  quantity: number,
  format: "csv" | "xlsx" | "pdf" = "csv",
): number {
  const rowsPerMinute = format === "xlsx" ? 1_500_000 : format === "pdf" ? 500_000 : 2_000_000;
  return Math.max(1, Math.round((quantity / rowsPerMinute) * 60));
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "completed":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 night:bg-emerald-950/50 night:text-emerald-400";
    case "processing":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 night:bg-blue-950/50 night:text-blue-400";
    case "queued":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 night:bg-amber-950/50 night:text-amber-400";
    case "failed":
      return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 night:bg-red-950/50 night:text-red-400";
    case "cancelled":
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 night:bg-slate-900 night:text-slate-400";
    case "expired":
      return "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500 night:bg-slate-900 night:text-slate-500";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 night:bg-slate-900 night:text-slate-400";
  }
}
