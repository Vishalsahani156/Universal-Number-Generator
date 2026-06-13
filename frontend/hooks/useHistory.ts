"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { HISTORY_PAGE_SIZE } from "@/lib/constants";

export function useHistory(page = 0) {
  const offset = page * HISTORY_PAGE_SIZE;

  return useQuery({
    queryKey: ["history", page],
    queryFn: () => apiClient.getHistory(HISTORY_PAGE_SIZE, offset),
  });
}
