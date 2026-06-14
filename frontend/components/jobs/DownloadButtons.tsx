"use client";

import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { useDownloadJob } from "@/hooks/useDownloadJob";
import { ApiClientError } from "@/lib/api-client";
import type { ExportFormat } from "@/types/api";

interface DownloadButtonsProps {
  jobId: string;
  format: ExportFormat;
  downloadReady: boolean;
}

export function DownloadButtons({
  jobId,
  format,
  downloadReady,
}: DownloadButtonsProps) {
  const download = useDownloadJob();
  const { showToast } = useToast();

  async function handleDownload() {
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
    }
  }

  if (!downloadReady) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400 night:text-slate-500">
        Download will be available when the job completes.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        size="lg"
        loading={download.isPending}
        onClick={handleDownload}
      >
        Download {format.toUpperCase()}
      </Button>
    </div>
  );
}
