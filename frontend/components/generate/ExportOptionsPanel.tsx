"use client";

import { useCountries } from "@/hooks/useCountries";
import { useGenerateStore } from "@/stores/generate-store";
import { Input } from "@/components/ui/Input";
import { DEFAULT_COLUMN_NAME, XLSX_MAX_ROWS } from "@/lib/constants";
import { formatNumber, resolveColumnName } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ExportColumn, ExportFormat, ExtraField } from "@/types/api";

export function ExportOptionsPanel() {
  const {
    countryCode,
    quantity,
    columns,
    extraFields,
    includeCountryCode,
    includeSerial,
    format,
    addColumn,
    removeColumn,
    updateColumn,
    addExtraField,
    removeExtraField,
    updateExtraField,
    toggleExtraFieldGenerateDifferent,
    setIncludeCountryCode,
    setIncludeSerial,
    setFormat,
  } = useGenerateStore();
  const { data: countries } = useCountries();

  const selectedCountry = countries?.find((c) => c.code === countryCode);
  const dialCode = selectedCountry?.dial_code;
  const sampleDigits = "9".repeat(selectedCountry?.mobile_rules.length ?? 10);

  const xlsxDisabled = quantity > XLSX_MAX_ROWS;

  const allHeaders = [
    ...(includeSerial ? ["S.No"] : []),
    ...columns.map((c) => resolveColumnName(c.header)),
    ...extraFields.map((ef) => ef.label || ef.key),
  ];

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300 night:text-slate-400">
          Column headers
        </p>
        <div className="space-y-3">
          {columns.map((col: ExportColumn, index: number) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <Input
                  label={index === 0 ? "Phone number column" : `Column ${index + 1}`}
                  placeholder={index === 0 ? DEFAULT_COLUMN_NAME : "e.g. Name, Email"}
                  value={col.header}
                  onChange={(e) => updateColumn(index, "header", e.target.value)}
                  hint={
                    index === 0
                      ? `Leave empty for default "${DEFAULT_COLUMN_NAME}"`
                      : "Enter column header name"
                  }
                />
                {index > 0 && (
                  <Input
                    label="Static value"
                    placeholder="Value repeated for each row"
                    value={col.static_value}
                    onChange={(e) => updateColumn(index, "static_value", e.target.value)}
                    hint="Optional: fill with a fixed value for every row"
                  />
                )}
              </div>
              {columns.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeColumn(index)}
                  className="mt-6 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 night:hover:bg-red-950/20"
                  title="Remove column"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addColumn}
          className="mt-2 flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 night:text-brand-500 night:hover:text-brand-400"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add column
        </button>
      </div>

      <hr className="border-slate-200 dark:border-slate-700 night:border-slate-800" />

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300 night:text-slate-400">
          Extra fields <span className="text-xs font-normal text-slate-400">(optional)</span>
        </p>
        <div className="space-y-3">
          {extraFields.map((ef: ExtraField, index: number) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <Input
                  label="Label"
                  placeholder="e.g. Email, Name, Company"
                  value={ef.label}
                  onChange={(e) => updateExtraField(index, "label", e.target.value)}
                  hint="Column header name in export"
                />
                {!ef.generate_different && (
                  <Input
                    label="Value"
                    placeholder="Value for every row"
                    value={ef.value}
                    onChange={(e) => updateExtraField(index, "value", e.target.value)}
                    hint={`Key: ${ef.key || "auto-generated"}`}
                  />
                )}
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={ef.generate_different}
                    onChange={() => toggleExtraFieldGenerateDifferent(index)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 night:border-slate-700 night:bg-slate-900"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400 night:text-slate-500">
                    Generate different values for each row
                  </span>
                </label>
              </div>
              <button
                type="button"
                onClick={() => removeExtraField(index)}
                className="mt-6 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 night:hover:bg-red-950/20"
                title="Remove field"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addExtraField}
          className="mt-2 flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 night:text-brand-500 night:hover:text-brand-400"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add extra field
        </button>
      </div>

      <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-800/50 night:bg-slate-900/50">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 night:text-slate-500">
          Preview headers:{" "}
          <span className="font-mono text-slate-700 dark:text-slate-300 night:text-slate-400">
            {allHeaders.join(", ")}
          </span>
        </p>
      </div>

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
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 disabled:cursor-not-allowed dark:border-slate-600 dark:bg-slate-800 night:border-slate-700 night:bg-slate-900"
          />
          <span className="text-sm text-slate-700 dark:text-slate-300 night:text-slate-400">
            {selectedCountry ? (
              <>
                Include{" "}
                <span className="font-medium text-slate-900 dark:text-slate-100 night:text-slate-200">{selectedCountry.name}</span> dial
                code ({dialCode})
              </>
            ) : (
              "Include country dial code (select a country first)"
            )}
          </span>
        </label>

        {includeCountryCode && dialCode && (
          <p className="ml-7 text-xs text-brand-700 dark:text-brand-400 night:text-brand-500">
            Numbers will be generated as {dialCode}
            {sampleDigits.slice(0, 4)}… (e.g. {dialCode}
            {sampleDigits})
          </p>
        )}

        {!includeCountryCode && selectedCountry && (
          <p className="ml-7 text-xs text-slate-500 dark:text-slate-400 night:text-slate-500">
            Unchecked: local number only (e.g. {sampleDigits})
          </p>
        )}

        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={includeSerial}
            onChange={(e) => setIncludeSerial(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 night:border-slate-700 night:bg-slate-900"
          />
          <span className="text-sm text-slate-700 dark:text-slate-300 night:text-slate-400">Include S.No column</span>
        </label>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 night:text-slate-400">Export format</p>
        <div className="grid grid-cols-2 gap-2">
          {(["csv", "xlsx", "pdf"] as ExportFormat[]).map((f) => {
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
                    ? "border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20 dark:bg-brand-950/40 dark:text-brand-300 dark:ring-brand-500/30 night:bg-brand-950/30 night:text-brand-400 night:ring-brand-500/20"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 night:border-slate-700 night:bg-slate-900 night:text-slate-400 night:hover:bg-slate-800",
                  disabled && "cursor-not-allowed opacity-50",
                )}
              >
                {f}
              </button>
            );
          })}
        </div>
        {xlsxDisabled && (
          <p className="text-xs text-amber-600 dark:text-amber-400 night:text-amber-500">
            XLSX disabled — quantity exceeds {formatNumber(XLSX_MAX_ROWS)} row limit. Use CSV instead.
          </p>
        )}
      </div>
    </div>
  );
}
