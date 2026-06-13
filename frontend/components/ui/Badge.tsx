import { cn } from "@/lib/utils";
import { JOB_STATUS_COLORS } from "@/lib/constants";

interface BadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: BadgeProps) {
  const colorClass =
    JOB_STATUS_COLORS[status] ?? "bg-slate-100 text-slate-700";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        colorClass,
        className
      )}
    >
      {status}
    </span>
  );
}
