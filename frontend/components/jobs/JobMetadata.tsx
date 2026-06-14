"use client";

import { useCountries } from "@/hooks/useCountries";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatNumber } from "@/lib/utils";
import type { JobStatusResponse } from "@/types/api";

interface JobMetadataProps {
  job: JobStatusResponse;
}

export function JobMetadata({ job }: JobMetadataProps) {
  const { data: countries } = useCountries();
  const country = countries?.find((c) => c.code === job.country_code);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-3">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 night:text-slate-500">Status</p>
          <Badge status={job.status} className="mt-1">
            {job.status}
          </Badge>
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 night:text-slate-500">Country</p>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 night:text-slate-200">
            {country ? `${country.name} (${country.dial_code})` : job.country_code ?? "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 night:text-slate-500">Quantity</p>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 night:text-slate-200">
            {job.quantity ? formatNumber(job.quantity) : "—"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 night:text-slate-500">Mode</p>
          <p className="text-sm font-medium capitalize text-slate-900 dark:text-slate-100 night:text-slate-200">
            {job.generation_mode ?? "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 night:text-slate-500">Format</p>
          <p className="text-sm font-medium uppercase text-slate-900 dark:text-slate-100 night:text-slate-200">
            {job.export_format ?? "—"}
          </p>
        </div>
        {job.created_at && (
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 night:text-slate-500">Created</p>
            <p className="text-sm text-slate-900 dark:text-slate-200 night:text-slate-300">{formatDate(job.created_at)}</p>
          </div>
        )}
        {job.expires_at && (
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 night:text-slate-500">Expires</p>
            <p className="text-sm text-slate-900 dark:text-slate-200 night:text-slate-300">{formatDate(job.expires_at)}</p>
          </div>
        )}
      </div>

      {job.error && (
        <div className="col-span-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300 night:border-red-900 night:bg-red-950/30 night:text-red-400">
          {job.error}
        </div>
      )}
    </div>
  );
}
