"use client";

import { useMemo, useState } from "react";
import { useCountries } from "@/hooks/useCountries";
import { useGenerateStore } from "@/stores/generate-store";
import { countryFlag } from "@/lib/format";
import { cn } from "@/lib/utils";

export function CountrySelector() {
  const { data: countries, isLoading, error } = useCountries();
  const { countryCode, setCountryCode } = useGenerateStore();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!countries) return [];
    const q = search.toLowerCase().trim();
    if (!q) return countries;
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.iso_alpha2.toLowerCase().includes(q) ||
        c.dial_code.includes(q)
    );
  }, [countries, search]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-lg bg-slate-100"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-600">
        Failed to load countries. Is the API running?
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <input
        type="search"
        placeholder="Search country, code, or dial..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      />

      <div className="grid max-h-80 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((country) => (
          <button
            key={country.iso_alpha2}
            type="button"
            onClick={() => setCountryCode(country.iso_alpha2)}
            className={cn(
              "flex flex-col items-start rounded-lg border p-3 text-left transition-all hover:border-brand-300 hover:shadow-sm",
              countryCode === country.iso_alpha2
                ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/20"
                : "border-slate-200 bg-white"
            )}
          >
            <span className="text-2xl">{countryFlag(country.iso_alpha2)}</span>
            <span className="mt-1 text-sm font-medium text-slate-900">
              {country.name}
            </span>
            <span className="text-xs text-slate-500">
              {country.dial_code} · {country.iso_alpha2}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-slate-500">No countries found.</p>
      )}
    </div>
  );
}
