"use client";

import { useToast } from "@/components/providers/ToastProvider";
import { cn } from "@/lib/utils";

const typeStyles = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-slate-200 bg-white text-slate-800",
};

export function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex min-w-[280px] max-w-sm items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm shadow-elevated",
            typeStyles[toast.type],
          )}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => dismissToast(toast.id)}
            className="text-current opacity-60 hover:opacity-100"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
