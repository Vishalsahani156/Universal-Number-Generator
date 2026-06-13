"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ExportFormat } from "@/types/api";

export function useDownloadJob() {
  return useMutation({
    mutationFn: ({ jobId, format }: { jobId: string; format: ExportFormat }) =>
      apiClient.downloadFile(jobId, format),
  });
}
