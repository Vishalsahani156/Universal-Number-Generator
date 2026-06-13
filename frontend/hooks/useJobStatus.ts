"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { POLL_INTERVAL_MS } from "@/lib/constants";
import { isTerminalStatus } from "@/lib/format";

export function useJobStatus(jobId: string | undefined) {
  return useQuery({
    queryKey: ["job-status", jobId],
    queryFn: () => apiClient.getJobStatus(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status || isTerminalStatus(status)) return false;
      return POLL_INTERVAL_MS;
    },
  });
}
