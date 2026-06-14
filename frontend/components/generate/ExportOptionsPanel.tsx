"use client";

import { useCountries } from "@/hooks/useCountries";
import { useGenerateStore } from "@/stores/generate-store";
import { Input } from "@/components/ui/Input";
import { DEFAULT_COLUMN_NAME, XLSX_MAX_ROWS } from "@/lib/constants";
import { formatNumber, resolveColumnName } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ExportFormat } from "@/types/api";

export function ExportOptionsPanel() {
  const {
    countryCode,
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
  const { data: countries } = useCountries();

  const selectedCountry = countries?.find((c) => c.code === countryCode);
  const dialCode = selectedCountry?.dial_code;
  const sampleDigits = "9".repeat(selectedCountry?.mobile_rules.length ?? 10);

  const xlsxDisabled = quantity > XLSX_MAX_ROWS;

  return (
    <div className="space-y-4">
      <Input
        label="Column header name"
        placeholder={DEFAULT_COLUMN_NAME}
        value={columnName}
        onChange={(e) => setColumnName(e.target.value)}
        hint={`Leave empty for default "${DEFAULT_COLUMN_NAME}", or type your own (max 50 chars)`}
      />

      {!columnName.trim() && (
        <p className="text-xs text-slate-500">
          CSV header will be: <span className="font-medium">{DEFAULT_COLUMN_NAME}</span>
        </p>
      )}

      {columnName.trim() && (
        <p className="text-xs text-slate-500">
          CSV header will be:{" "}
          <span className="font-medium">{resolveColumnName(columnName)}</span>
        </p>
      )}

      <div className="space-y-3">
        <label
          className={cn(
            "flex items-start gap-3",
            selectedCountry ? "cursor-pointer" : "cursor-not-allowed opacity-60",
          )}
        >
          <input
            type="checkbox"
            checked={includeCountryCode}
            disabled={!selectedCountry}
            onChange={(e) => setIncludeCountryCode(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 disabled:cursor-not-allowed"
          />
          <span className="text-sm text-slate-700">
            {selectedCountry ? (
              <>
                Include{" "}
                <span className="font-medium text-slate-900">{selectedCountry.name}</span> dial
                code ({dialCode})
              </>
            ) : (
              "Include country dial code (select a country first)"
            )}
          </span>
        </label>

        {includeCountryCode && dialCode && (
          <p className="ml-7 text-xs text-brand-700">
            Numbers will be generated as {dialCode}
            {sampleDigits.slice(0, 4)}… (e.g. {dialCode}
            {sampleDigits})
          </p>
        )}

        {!includeCountryCode && selectedCountry && (
          <p className="ml-7 text-xs text-slate-500">
            Unchecked: local number only (e.g. {sampleDigits})
          </p>
        )}

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
