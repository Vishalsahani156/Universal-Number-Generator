import { cn, getStatusColor } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  status?: string;
}

export function Badge({ children, className, status }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        status ? getStatusColor(status) : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 night:bg-slate-900 night:text-slate-400",
        className,
      )}
    >
      {children}
    </span>
  );
}
