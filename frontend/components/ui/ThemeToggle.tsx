"use client";

import { useTheme, type Theme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

const themeMeta: Record<
  Theme,
  { label: string; icon: string }
> = {
  light: { label: "Light", icon: "☀️" },
  dark: { label: "Dark", icon: "🌙" },
  night: { label: "Night", icon: "🌃" },
};

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, cycleTheme } = useTheme();
  const { label, icon } = themeMeta[theme];

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 night:border-slate-800 night:bg-slate-900 night:text-slate-400 night:hover:bg-slate-800",
        className,
      )}
      aria-label={`Theme: ${label}. Click to change.`}
      title={`Theme: ${label}`}
    >
      <span aria-hidden="true">{icon}</span>
      <span className="hidden xs:inline sm:inline">{label}</span>
    </button>
  );
}
