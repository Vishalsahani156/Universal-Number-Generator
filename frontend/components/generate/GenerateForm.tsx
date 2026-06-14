"use client";

import { useEffect } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CountrySelector } from "./CountrySelector";
import { ExportOptionsPanel } from "./ExportOptionsPanel";
import { ModeToggle } from "./ModeToggle";
import { QuantityInput } from "./QuantityInput";
import { useCreateJob } from "@/hooks/useCreateJob";
import { useGenerateStore } from "@/stores/generate-store";
import {
  COLUMN_NAME_REGEX,
  LARGE_JOB_THRESHOLD,
  MIN_QUANTITY,
  XLSX_MAX_ROWS,
} from "@/lib/constants";
import {
  estimateDurationSeconds,
  estimateFileSizeBytes,
  formatDuration,
  formatFileSize,
  formatNumber,
  resolveColumnName,
} from "@/lib/utils";
import { ApiClientError } from "@/lib/api-client";

export function GenerateForm() {
  const {
    countryCode,
    quantity,
    mode,
    columnName,
    includeCountryCode,
    includeSerial,
    format,
    setFormat,
  } = useGenerateStore();
  const createJob = useCreateJob();
  const { showToast } = useToast();

  const estSize = estimateFileSizeBytes(quantity, format);
  const estDuration = estimateDurationSeconds(quantity, format);

  useEffect(() => {
    if (format === "xlsx" && quantity > XLSX_MAX_ROWS) {
      setFormat("csv");
    }
  }, [format, quantity, setFormat]);

  function validate(): string | null {
    if (!countryCode) return "Please select a country";
    if (quantity < MIN_QUANTITY) {
      return `Quantity must be at least ${formatNumber(MIN_QUANTITY)}`;
    }
    const resolvedColumnName = resolveColumnName(columnName);
    if (!COLUMN_NAME_REGEX.test(resolvedColumnName)) {
      return "Column name must be 1–50 chars (letters, numbers, spaces, underscores)";
    }
    if (format === "xlsx" && quantity > XLSX_MAX_ROWS) {
      return `XLSX supports max ${formatNumber(XLSX_MAX_ROWS)} rows`;
    }
    return null;
  }

  async function handleSubmit() {
    const error = validate();
    if (error) {
      showToast(error, "error");
      return;
    }

    if (quantity >= LARGE_JOB_THRESHOLD) {
      const confirmed = window.confirm(
        `You are about to generate ${formatNumber(quantity)} numbers. This may take ${formatDuration(estDuration)}. Continue?`,
      );
      if (!confirmed) return;
    }

    try {
      await createJob.mutateAsync({
        country_code: countryCode!,
        quantity,
        generation_mode: mode,
        export_format: format,
        export_options: {
          column_name: resolveColumnName(columnName),
          include_country_code: includeCountryCode,
          include_serial: includeSerial,
        },
      });
      showToast("Job queued successfully", "success");
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Failed to create job. Please try again.";
      showToast(message, "error");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="Select country" description="Choose from 30 supported countries">
        <CountrySelector />
      </Card>

      <div className="space-y-6">
        <Card title="Job configuration">
          <div className="space-y-6">
            <QuantityInput />
            <ModeToggle />
            <ExportOptionsPanel />
          </div>
        </Card>

        <Card title="Estimates">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-slate-500">File size</dt>
              <dd className="font-medium text-slate-900">~{formatFileSize(estSize)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Est. duration</dt>
              <dd className="font-medium text-slate-900">~{formatDuration(estDuration)}</dd>
            </div>
          </dl>
        </Card>

        <Button
          size="lg"
          className="w-full"
          loading={createJob.isPending}
          onClick={handleSubmit}
        >
          Generate numbers
        </Button>
      </div>
    </div>
  );
}
