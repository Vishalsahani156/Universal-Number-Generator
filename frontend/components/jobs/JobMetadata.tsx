"use client";

import { StatusBadge } from "@/components/ui/Badge";
import { countryFlag, formatDate, formatNumber } from "@/lib/format";
import { useCountries } from "@/hooks/useCountries";
import type { JobStatusResponse } from "@/types/api";

interface JobMetadataProps {
  job: JobStatusResponse;
}

export function JobMetadata({ job }: JobMetadataProps) {
  const { data: countries } = useCountries();
  const country = countries?.find((c) => c.iso_alpha2 === job.country_code);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Status
        </p>
        <div className="mt-1">
          <StatusBadge status={job.status} />
        </div>
      </div>

      {job.country_code && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Country
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {country ? (
              <>
                {countryFlag(country.iso_alpha2)} {country.name} (
                {country.dial_code})
              </>
            ) : (
              job.country_code
            )}
          </p>
        </div>
      )}

      {job.quantity != null && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Quantity
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {formatNumber(job.quantity)}
          </p>
        </div>
      )}

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Format
        </p>
        <p className="mt-1 text-sm font-medium uppercase text-slate-900">
          {job.export_format}
        </p>
      </div>

      {job.generation_mode && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Mode
          </p>
          <p className="mt-1 text-sm font-medium capitalize text-slate-900">
            {job.generation_mode}
          </p>
        </div>
      )}

      {job.created_at && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Created
          </p>
          <p className="mt-1 text-sm text-slate-900">
            {formatDate(job.created_at)}
          </p>
        </div>
      )}

      {job.expires_at && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Expires
          </p>
          <p className="mt-1 text-sm text-slate-900">
            {formatDate(job.expires_at)}
          </p>
        </div>
      )}

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Job ID
        </p>
        <p className="mt-1 break-all font-mono text-xs text-slate-600">
          {job.job_id}
        </p>
      </div>
    </div>
  );
}
