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
    try {
      await download.mutateAsync({ jobId, format });
      showToast("Download started", "success");
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
        <h1 className="text-2xl font-bold text-slate-900">Download center</h1>
        <p className="mt-1 text-sm text-slate-500">
          Completed files ready for download. Files expire after 72 hours.
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load downloads. Make sure the backend is running.
        </p>
      )}

      {data && downloadableJobs.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
          <p className="text-sm text-slate-500">No files ready for download.</p>
          <Link
            href="/generate"
            className="mt-2 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
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
