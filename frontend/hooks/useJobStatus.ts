"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { POLL_INTERVAL_MS, TERMINAL_STATUSES } from "@/lib/constants";
import type { JobStatus } from "@/types/api";

function isTerminal(status: JobStatus | undefined): boolean {
  return !!status && (TERMINAL_STATUSES as readonly string[]).includes(status);
}

export function useJobStatus(jobId: string | null) {
  return useQuery({
    queryKey: ["job", jobId],
    queryFn: () => apiClient.getJobStatus(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return isTerminal(status) ? false : POLL_INTERVAL_MS;
    },
  });
}
