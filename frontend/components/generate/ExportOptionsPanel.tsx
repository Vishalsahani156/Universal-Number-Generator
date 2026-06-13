"use client";

import { useGenerateStore } from "@/stores/generate-store";
import { Input } from "@/components/ui/Input";
import { XLSX_MAX_ROWS } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ExportFormat } from "@/types/api";

export function ExportOptionsPanel() {
  const {
    quantity,
    columnName,
    includeCountryCode,
    includeSerial,
    format,
    setColumnName,
    setIncludeCountryCode,
    setIncludeSerial,
    setFormat,
  } = useGenerateStore();

  const xlsxDisabled = quantity > XLSX_MAX_ROWS;

  return (
    <div className="space-y-4">
      <Input
        label="Column header name"
        value={columnName}
        onChange={(e) => setColumnName(e.target.value)}
        hint="Letters, numbers, spaces, underscores (max 50 chars)"
      />

      <div className="space-y-3">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={includeCountryCode}
            onChange={(e) => setIncludeCountryCode(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm text-slate-700">Include country dial code (+91, etc.)</span>
        </label>

        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={includeSerial}
            onChange={(e) => setIncludeSerial(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm text-slate-700">Include S.No column</span>
        </label>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">Export format</p>
        <div className="grid grid-cols-2 gap-2">
          {(["csv", "xlsx"] as ExportFormat[]).map((f) => {
            const disabled = f === "xlsx" && xlsxDisabled;
            return (
              <button
                key={f}
                type="button"
                disabled={disabled}
                title={
                  disabled
                    ? `XLSX supports max ${formatNumber(XLSX_MAX_ROWS)} rows`
                    : undefined
                }
                onClick={() => setFormat(f)}
                className={cn(
                  "rounded-lg border px-4 py-3 text-sm font-medium uppercase transition-colors",
                  format === f
                    ? "border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                  disabled && "cursor-not-allowed opacity-50",
                )}
              >
                {f}
              </button>
            );
          })}
        </div>
        {xlsxDisabled && (
          <p className="text-xs text-amber-600">
            XLSX disabled — quantity exceeds {formatNumber(XLSX_MAX_ROWS)} row limit. Use CSV instead.
          </p>
        )}
      </div>
    </div>
  );
}
