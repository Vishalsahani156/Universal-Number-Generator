"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { DownloadButtons } from "@/components/jobs/DownloadButtons";
import { JobMetadata } from "@/components/jobs/JobMetadata";
import { ProgressBar } from "@/components/jobs/ProgressBar";
import { useJobStatus } from "@/hooks/useJobStatus";
import { apiClient } from "@/lib/api-client";
import { isTerminalStatus, parseApiError } from "@/lib/format";
import { useQueryClient } from "@tanstack/react-query";

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  const { data: job, isLoading, error } = useJobStatus(jobId);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const prevStatus = useRef<string | undefined>();

  useEffect(() => {
    if (
      job?.status === "completed" &&
      prevStatus.current &&
      prevStatus.current !== "completed"
    ) {
      showToast("Job completed! Download is ready.", "success");
    }
    prevStatus.current = job?.status;
  }, [job?.status, showToast]);

  async function handleCancel() {
    if (!window.confirm("Cancel this job?")) return;
    try {
      await apiClient.cancelJob(jobId);
      queryClient.invalidateQueries({ queryKey: ["job-status", jobId] });
      showToast("Job cancelled", "info");
    } catch (err) {
      showToast(parseApiError(err), "error");
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="h-96 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Card>
          <p className="text-red-600">
            {error ? parseApiError(error) : "Job not found"}
          </p>
          <Link href="/history" className="mt-4 inline-block text-brand-600">
            ← Back to history
          </Link>
        </Card>
      </div>
    );
  }

  const canCancel =
    job.status === "queued" || job.status === "processing";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/history"
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← Back to history
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Job Details</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <ProgressBar
            progress={job.progress}
            status={job.status}
          />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <JobMetadata job={job} />
        </Card>

        {job.error && (
          <Card className="border-red-200 bg-red-50">
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="mt-1 text-sm text-red-700">{job.error}</p>
            <Link href="/generate" className="mt-3 inline-block">
              <Button variant="secondary" size="sm">
                Try Again
              </Button>
            </Link>
          </Card>
        )}

        <div className="flex flex-wrap gap-3">
          <DownloadButtons
            jobId={job.job_id}
            format={job.export_format}
            downloadReady={job.download_ready}
          />

          {canCancel && (
            <Button variant="danger" onClick={handleCancel}>
              Cancel Job
            </Button>
          )}

          {isTerminalStatus(job.status) && !job.download_ready && (
            <Link href="/generate">
              <Button variant="secondary">New Generation</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
