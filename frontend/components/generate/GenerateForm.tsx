"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { CountrySelector } from "./CountrySelector";
import { ExportOptionsPanel } from "./ExportOptionsPanel";
import { ModeToggle } from "./ModeToggle";
import { QuantityInput } from "./QuantityInput";
import { useCreateJob } from "@/hooks/useCreateJob";
import { useGenerateStore } from "@/stores/generate-store";
import {
  LARGE_JOB_CONFIRM_THRESHOLD,
  MAX_QUANTITY,
  MIN_QUANTITY,
  XLSX_MAX_ROWS,
} from "@/lib/constants";
import {
  estimateFileSizeBytes,
  estimateGenerationTimeSeconds,
  formatDuration,
  formatFileSize,
  formatNumber,
  parseApiError,
} from "@/lib/format";

export function GenerateForm() {
  const store = useGenerateStore();
  const createJob = useCreateJob();
  const { showToast } = useToast();

  const estimates = useMemo(() => {
    const fileSize = estimateFileSizeBytes(
      store.quantity,
      store.includeCountryCode,
      store.includeSerial
    );
    const duration = estimateGenerationTimeSeconds(store.quantity);
    return { fileSize, duration };
  }, [store.quantity, store.includeCountryCode, store.includeSerial]);

  const isValid =
    store.quantity >= MIN_QUANTITY &&
    store.quantity <= MAX_QUANTITY &&
    store.columnName.trim().length > 0 &&
    /^[a-zA-Z0-9_ ]{1,50}$/.test(store.columnName) &&
    !(store.exportFormat === "xlsx" && store.quantity > XLSX_MAX_ROWS);

  async function handleSubmit() {
    if (!isValid) return;

    if (store.quantity >= LARGE_JOB_CONFIRM_THRESHOLD) {
      const confirmed = window.confirm(
        `You are about to generate ${formatNumber(store.quantity)} numbers. This may take ${formatDuration(estimates.duration)}. Continue?`
      );
      if (!confirmed) return;
    }

    try {
      await createJob.mutateAsync({
        country_code: store.countryCode,
        quantity: store.quantity,
        generation_mode: store.generationMode,
        export_format: store.exportFormat,
        export_options: {
          column_name: store.columnName.trim(),
          include_country_code: store.includeCountryCode,
          include_serial: store.includeSerial,
        },
      });
      showToast("Job queued successfully!", "success");
    } catch (err) {
      showToast(parseApiError(err), "error");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Select Country</CardTitle>
          <CardDescription>
            Choose from 30 supported countries
          </CardDescription>
        </CardHeader>
        <CountrySelector />
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Generation Settings</CardTitle>
            <CardDescription>
              Configure quantity and generation mode
            </CardDescription>
          </CardHeader>
          <div className="space-y-6">
            <QuantityInput />
            <ModeToggle />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export Options</CardTitle>
            <CardDescription>Customize output file format</CardDescription>
          </CardHeader>
          <ExportOptionsPanel />
        </Card>

        <Card className="bg-slate-50">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Est. file size</p>
              <p className="font-medium text-slate-900">
                {formatFileSize(estimates.fileSize)}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Est. time</p>
              <p className="font-medium text-slate-900">
                {formatDuration(estimates.duration)}
              </p>
            </div>
          </div>
        </Card>

        <Button
          size="lg"
          className="w-full"
          loading={createJob.isPending}
          disabled={!isValid}
          onClick={handleSubmit}
        >
          Generate Numbers
        </Button>
      </div>
    </div>
  );
}
