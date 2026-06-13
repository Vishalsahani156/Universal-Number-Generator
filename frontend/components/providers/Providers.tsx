"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { ensureSessionId } from "@/lib/session";
import { ToastProvider } from "./ToastProvider";
import { ToastContainer } from "@/components/ui/Toast";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  useEffect(() => {
    ensureSessionId();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        {children}
        <ToastContainer />
      </ToastProvider>
    </QueryClientProvider>
  );
}
