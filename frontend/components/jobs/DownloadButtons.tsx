"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { downloadJobFile } from "@/lib/api-client";
import { parseApiError } from "@/lib/format";
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
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  if (!downloadReady) return null;

  async function handleDownload() {
    setLoading(true);
    try {
      await downloadJobFile(jobId, format);
      showToast("Download started", "success");
    } catch (err) {
      showToast(parseApiError(err), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button loading={loading} onClick={handleDownload}>
      Download {format.toUpperCase()}
    </Button>
  );
}
