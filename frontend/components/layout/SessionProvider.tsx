"use client";

import { useEffect } from "react";
import { ensureSessionId } from "@/lib/session";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    ensureSessionId();
  }, []);

  return <>{children}</>;
}
