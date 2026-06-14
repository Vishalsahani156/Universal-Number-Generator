"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { DownloadButtons } from "@/components/jobs/DownloadButtons";
import { JobMetadata } from "@/components/jobs/JobMetadata";
import { ProgressBar } from "@/components/jobs/ProgressBar";
import { useCancelJob } from "@/hooks/useCancelJob";
import { useJobStatus } from "@/hooks/useJobStatus";
import { ApiClientError } from "@/lib/api-client";

function usePrevious<T>(value: T): T | undefined {
  const [prev, setPrev] = useState<T | undefined>(undefined);
  useEffect(() => {
    setPrev(value);
  }, [value]);
  return prev;
}

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  const { data: job, isLoading, error } = useJobStatus(jobId);
  const cancelJob = useCancelJob(jobId);
  const { showToast } = useToast();

  const isActive = job?.status === "queued" || job?.status === "processing";
  const prevStatus = usePrevious(job?.status);

  useEffect(() => {
    if (prevStatus && prevStatus !== "completed" && job?.status === "completed") {
      showToast("Job completed! Your file is ready to download.", "success");
    }
  }, [job?.status, prevStatus, showToast]);

  async function handleCancel() {
    if (!window.confirm("Cancel this job?")) return;
    try {
      await cancelJob.mutateAsync();
      showToast("Job cancelled", "info");
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Failed to cancel job.";
      showToast(message, "error");
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <Card>
        <p className="text-sm text-red-600 dark:text-red-400">
          {error instanceof ApiClientError
            ? error.message
            : "Job not found or failed to load."}
        </p>
        <Link href="/history" className="mt-4 inline-block">
          <Button variant="secondary">Back to history</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 night:text-slate-200 sm:text-2xl">Job details</h1>
          <p className="mt-1 break-all font-mono text-xs text-slate-500 dark:text-slate-400 night:text-slate-500">{job.job_id}</p>
        </div>
        {isActive && (
          <Button
            variant="danger"
            size="sm"
            loading={cancelJob.isPending}
            onClick={handleCancel}
          >
            Cancel job
          </Button>
        )}
      </div>

      <Card title="Progress">
        <ProgressBar progress={job.progress} status={job.status} />
      </Card>

      <Card title="Job info">
        <JobMetadata job={job} />
      </Card>

      {(job.status === "completed" || job.download_ready) && (
        <Card title="Download">
          <DownloadButtons
            jobId={job.job_id}
            format={job.export_format ?? "csv"}
            downloadReady={job.download_ready}
          />
        </Card>
      )}

      {job.status === "failed" && (
        <Link href="/generate">
          <Button>Try again</Button>
        </Link>
      )}
    </div>
  );
}
