export const MIN_QUANTITY = 1;
export const XLSX_MAX_ROWS = 1_048_576;
export const LARGE_JOB_THRESHOLD = 100_000;
export const POLL_INTERVAL_MS = 2000;
export const HISTORY_PAGE_SIZE = 20;

export const TERMINAL_STATUSES = [
  "completed",
  "failed",
  "cancelled",
  "expired",
] as const;

export const COLUMN_NAME_REGEX = /^[a-zA-Z0-9_ ]{1,50}$/;
