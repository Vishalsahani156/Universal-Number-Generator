export const MIN_QUANTITY = 5_000_000;
export const MAX_QUANTITY = 20_000_000;
export const XLSX_MAX_ROWS = 1_048_576;
export const LARGE_JOB_CONFIRM_THRESHOLD = 10_000_000;
export const POLL_INTERVAL_MS = 2000;
export const HISTORY_PAGE_SIZE = 20;

export const SESSION_STORAGE_KEY = "phone_gen_session_id";

export const JOB_STATUS_LABELS: Record<string, string> = {
  queued: "Queued",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
  expired: "Expired",
};

export const JOB_STATUS_COLORS: Record<string, string> = {
  queued: "bg-slate-100 text-slate-700",
  processing: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-amber-100 text-amber-700",
  expired: "bg-gray-100 text-gray-600",
};
