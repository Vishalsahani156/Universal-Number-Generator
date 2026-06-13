"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            PN
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Phone Number Generator
            </p>
            <p className="text-xs text-slate-500">30 countries · 5M–20M scale</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 sm:hidden">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium",
              pathname === link.href
                ? "bg-brand-50 text-brand-700"
                : "text-slate-600",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
