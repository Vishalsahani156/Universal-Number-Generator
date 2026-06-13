"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function useCancelJob(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.cancelJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job", jobId] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });
}
