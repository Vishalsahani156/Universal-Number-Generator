"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import { Spinner } from "@/components/ui/Spinner";
import { JobTable } from "@/components/jobs/JobTable";
import { useDownloadJob } from "@/hooks/useDownloadJob";
import { useHistory } from "@/hooks/useHistory";
import { ApiClientError } from "@/lib/api-client";
import type { ExportFormat } from "@/types/api";

export default function DownloadsPage() {
  const { data, isLoading, error } = useHistory(0);
  const download = useDownloadJob();
  const { showToast } = useToast();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const downloadableJobs = useMemo(
    () => data?.items.filter((j) => j.download_available) ?? [],
    [data],
  );

  async function handleDownload(jobId: string, format: ExportFormat) {
    setDownloadingId(jobId);
    showToast("Download started", "success");
    try {
      await download.mutateAsync({ jobId, format });
      showToast("Download successfully", "success");
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Download failed. Please try again.";
      showToast(message, "error");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 night:text-slate-200 sm:text-2xl">Download center</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 night:text-slate-500">
          Completed files ready for download. Files expire after 72 hours.
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300 night:border-red-900 night:bg-red-950/30 night:text-red-400">
          Failed to load downloads. Make sure the backend is running.
        </p>
      )}

      {data && downloadableJobs.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white px-4 py-10 text-center dark:border-slate-700 dark:bg-slate-800 night:border-slate-800 night:bg-slate-900 sm:px-6 sm:py-12">
          <p className="text-sm text-slate-500 dark:text-slate-400 night:text-slate-500">No files ready for download.</p>
          <Link
            href="/generate"
            className="mt-2 inline-block text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 night:text-brand-500 night:hover:text-brand-400"
          >
            Generate a new job →
          </Link>
        </div>
      )}

      {downloadableJobs.length > 0 && (
        <JobTable
          items={downloadableJobs}
          showDownload
          onDownload={handleDownload}
          downloadingId={downloadingId}
        />
      )}
    </div>
  );
}
