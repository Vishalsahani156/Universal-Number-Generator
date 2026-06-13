"use client";

import { Input } from "@/components/ui/Input";
import { useGenerateStore } from "@/stores/generate-store";
import { XLSX_MAX_ROWS } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ExportFormat } from "@/types/api";

export function ExportOptionsPanel() {
  const {
    columnName,
    includeCountryCode,
    includeSerial,
    exportFormat,
    quantity,
    setColumnName,
    setIncludeCountryCode,
    setIncludeSerial,
    setExportFormat,
  } = useGenerateStore();

  const xlsxDisabled = quantity > XLSX_MAX_ROWS;

  return (
    <div className="space-y-4">
      <Input
        label="Column Header Name"
        value={columnName}
        onChange={(e) => setColumnName(e.target.value)}
        hint="Letters, numbers, underscores, spaces (max 50 chars)"
        maxLength={50}
      />

      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={includeCountryCode}
          onChange={(e) => setIncludeCountryCode(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        <span className="text-sm text-slate-700">
          Include country code prefix (e.g. +91)
        </span>
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

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">Export Format</p>
        <div className="grid grid-cols-2 gap-3">
          {(["csv", "xlsx"] as ExportFormat[]).map((format) => {
            const disabled = format === "xlsx" && xlsxDisabled;
            return (
              <button
                key={format}
                type="button"
                disabled={disabled}
                title={
                  disabled
                    ? `XLSX limited to ${formatNumber(XLSX_MAX_ROWS)} rows. Use CSV for large jobs.`
                    : undefined
                }
                onClick={() => !disabled && setExportFormat(format)}
                className={cn(
                  "rounded-lg border p-3 text-left uppercase transition-all",
                  exportFormat === format
                    ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/20"
                    : "border-slate-200 bg-white hover:border-slate-300",
                  disabled && "cursor-not-allowed opacity-50"
                )}
              >
                <p className="text-sm font-medium text-slate-900">{format}</p>
                {format === "xlsx" && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    Max {formatNumber(XLSX_MAX_ROWS)} rows
                  </p>
                )}
                {format === "csv" && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    Recommended for large jobs
                  </p>
                )}
              </button>
            );
          })}
        </div>
        {xlsxDisabled && exportFormat === "xlsx" && (
          <p className="text-xs text-amber-600">
            Quantity exceeds XLSX limit. CSV will be used or select a smaller
            quantity.
          </p>
        )}
      </div>
    </div>
  );
}
