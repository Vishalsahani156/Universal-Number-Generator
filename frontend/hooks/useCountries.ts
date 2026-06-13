"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function useCountries() {
  return useQuery({
    queryKey: ["countries"],
    queryFn: () => apiClient.getCountries(),
    staleTime: 5 * 60 * 1000,
  });
}
