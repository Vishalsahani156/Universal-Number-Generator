export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-IN").format(n);
}

export function formatCompactNumber(n: number): string {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(0)}K`;
  }
  return String(n);
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins < 60) return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return remainMins > 0 ? `${hours}h ${remainMins}m` : `${hours}h`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function estimateFileSizeBytes(
  quantity: number,
  includeCountryCode: boolean,
  includeSerial: boolean
): number {
  const avgDigits = 12;
  const countryCodeExtra = includeCountryCode ? 4 : 0;
  const serialExtra = includeSerial ? 8 : 0;
  const rowOverhead = 2;
  const bytesPerRow =
    avgDigits + countryCodeExtra + serialExtra + rowOverhead + 10;
  return quantity * bytesPerRow;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function estimateGenerationTimeSeconds(quantity: number): number {
  const numbersPerMinute = 500_000;
  return Math.ceil((quantity / numbersPerMinute) * 60);
}

export function countryFlag(isoCode: string): string {
  const code = isoCode.toUpperCase();
  if (code.length !== 2) return "🌐";
  const offset = 127397;
  return String.fromCodePoint(
    ...[...code].map((c) => c.charCodeAt(0) + offset)
  );
}

export function isTerminalStatus(status: string): boolean {
  return ["completed", "failed", "cancelled", "expired"].includes(status);
}

export function parseApiError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
}
