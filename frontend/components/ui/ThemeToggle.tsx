"use client";

import { useTheme, type Theme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

const options: { value: Theme; label: string; icon: string }[] = [
  { value: "light", label: "Light", icon: "☀️" },
  { value: "dark", label: "Dark", icon: "🌙" },
  { value: "night", label: "Night", icon: "🌃" },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={cn(
        "inline-flex rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-800 night:border-slate-800 night:bg-slate-900",
        className,
      )}
      role="group"
      aria-label="Theme"
    >
      {options.map((opt) => {
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-brand-600 text-white shadow-sm dark:bg-brand-500 night:bg-brand-600"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 night:text-slate-500 night:hover:bg-slate-800",
            )}
            aria-label={opt.label}
            aria-pressed={active}
            title={opt.label}
          >
            <span aria-hidden="true">{opt.icon}</span>
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
