import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export function Card({ children, className, title, description }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-4 shadow-card transition-colors duration-200 dark:border-slate-700 dark:bg-slate-800 night:border-slate-800 night:bg-slate-900 sm:p-6",
        className,
      )}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 night:text-slate-200">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 night:text-slate-500">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
