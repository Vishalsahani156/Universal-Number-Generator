"use client";

import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { DownloadButtons } from "@/components/jobs/DownloadButtons";
import { useHistory } from "@/hooks/useHistory";
import { countryFlag, formatDate, formatNumber } from "@/lib/format";
import { useCountries } from "@/hooks/useCountries";
import { StatusBadge } from "@/components/ui/Badge";

export default function DownloadsPage() {
  const { data: history, isLoading, error } = useHistory(0);
  const { data: countries } = useCountries();

  const downloadable =
    history?.items.filter(
      (j) => j.status === "completed" && j.download_available
    ) ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Download Center
        </h1>
        <p className="mt-1 text-slate-500">
          Completed files ready for download (expires after 72 hours)
        </p>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <p className="text-sm text-red-700">
            Failed to load downloads. Is the API running?
          </p>
        </Card>
      )}

      {!isLoading && !error && downloadable.length === 0 && (
        <Card className="text-center">
          <CardHeader>
            <CardTitle>No downloads available</CardTitle>
            <CardDescription>
              Complete a generation job to see files here
            </CardDescription>
          </CardHeader>
          <Link
            href="/generate"
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Start generating →
          </Link>
        </Card>
      )}

      <div className="space-y-4">
        {downloadable.map((job) => {
          const country = countries?.find(
            (c) => c.iso_alpha2 === job.country_code
          );
          return (
            <Card key={job.job_id}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {countryFlag(job.country_code)}
                    </span>
                    <p className="font-medium text-slate-900">
                      {country?.name ?? job.country_code} —{" "}
                      {formatNumber(job.quantity)} numbers
                    </p>
                    <StatusBadge status={job.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Created {formatDate(job.created_at)} · Expires{" "}
                    {formatDate(job.expires_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/jobs/${job.job_id}`}
                    className="text-sm text-brand-600 hover:text-brand-700"
                  >
                    Details
                  </Link>
                  <DownloadButtons
                    jobId={job.job_id}
                    format={job.export_format ?? "csv"}
                    downloadReady={job.download_available}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
