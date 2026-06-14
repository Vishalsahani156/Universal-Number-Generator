"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/generate", label: "Generate" },
  { href: "/history", label: "History" },
  { href: "/downloads", label: "Downloads" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur transition-colors duration-200 dark:border-slate-700 dark:bg-slate-900/90 night:border-slate-800 night:bg-[#070b14]/95">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-3 sm:h-16 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white sm:h-9 sm:w-9 sm:text-sm">
            PN
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100 night:text-slate-200">
              Phone Number Generator
            </p>
            <p className="hidden text-xs text-slate-500 dark:text-slate-400 night:text-slate-500 xs:block sm:block">
              30 countries · no max limit
            </p>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 night:bg-brand-950/40 night:text-brand-400"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 night:text-slate-500 night:hover:bg-slate-900 night:hover:text-slate-200",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-3 py-2 dark:border-slate-800 night:border-slate-900 md:hidden">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              pathname === link.href
                ? "bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 night:bg-brand-950/40 night:text-brand-400"
                : "text-slate-600 dark:text-slate-400 night:text-slate-500",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
