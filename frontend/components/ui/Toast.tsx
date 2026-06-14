"use client";

import { useToast } from "@/components/providers/ToastProvider";
import { cn } from "@/lib/utils";

const typeStyles = {
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 night:border-emerald-900 night:bg-emerald-950/40 night:text-emerald-400",
  error:
    "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300 night:border-red-900 night:bg-red-950/40 night:text-red-400",
  info:
    "border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 night:border-slate-800 night:bg-slate-900 night:text-slate-300",
};

export function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-3 right-3 z-50 flex flex-col gap-2 sm:left-auto sm:right-4 sm:w-auto">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm shadow-elevated sm:min-w-[280px] sm:max-w-sm",
            typeStyles[toast.type],
          )}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => dismissToast(toast.id)}
            className="shrink-0 text-current opacity-60 hover:opacity-100"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
