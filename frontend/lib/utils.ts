import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

export function formatCompact(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${millions % 1 === 0 ? millions : millions.toFixed(1)}M`;
  }
  return formatNumber(value);
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

export function estimateFileSizeBytes(quantity: number, format: "csv" | "xlsx"): number {
  const bytesPerRow = format === "csv" ? 14 : 18;
  return quantity * bytesPerRow;
}

export function estimateDurationSeconds(quantity: number): number {
  const minutes = quantity / 500_000;
  return Math.round(minutes * 60);
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
      return "bg-emerald-100 text-emerald-800";
    case "processing":
      return "bg-blue-100 text-blue-800";
    case "queued":
      return "bg-amber-100 text-amber-800";
    case "failed":
      return "bg-red-100 text-red-800";
    case "cancelled":
      return "bg-slate-100 text-slate-700";
    case "expired":
      return "bg-slate-100 text-slate-500";
    default:
      return "bg-slate-100 text-slate-700";
  }
}
