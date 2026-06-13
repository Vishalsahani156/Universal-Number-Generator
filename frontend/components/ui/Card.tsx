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
        "rounded-xl border border-slate-200 bg-white p-6 shadow-card",
        className,
      )}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
