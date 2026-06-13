"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import type { CreateJobRequest } from "@/types/api";

export function useCreateJob() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateJobRequest) =>
      apiClient.createJob(body, crypto.randomUUID()),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
      router.push(`/jobs/${data.job_id}`);
    },
  });
}
