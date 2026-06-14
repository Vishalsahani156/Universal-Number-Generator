"use client";

import { useMemo, useState } from "react";
import { useCountries } from "@/hooks/useCountries";
import { useGenerateStore } from "@/stores/generate-store";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/Spinner";
import { Input } from "@/components/ui/Input";

export function CountrySelector() {
  const { data: countries, isLoading, error } = useCountries();
  const { countryCode, setCountryCode, applyCountryDefaults } = useGenerateStore();
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!countries || !query) return [];
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.code.toLowerCase().includes(query) ||
        c.dial_code.includes(query),
    );
  }, [countries, query]);

  function selectCountry(code: string) {
    const country = countries?.find((c) => c.code === code);
    if (!country) return;
    setCountryCode(country.code);
    applyCountryDefaults(country.default_export);
    setSearch("");
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Failed to load countries. Make sure the backend is running.
      </p>
    );
  }

  if (!countries?.length) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        No countries loaded. Seed the database:{" "}
        <code className="text-xs">PYTHONPATH=backend python backend/scripts/seed_countries.py</code>
      </p>
    );
  }

  const selectedCountry = countries.find((c) => c.code === countryCode);

  return (
    <div className="space-y-4">
      <Input
        label="Search country"
        placeholder="Type to search — e.g. i, India, IN, +91..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        hint={!query ? "Start typing to see matching countries" : undefined}
      />

      {query && filtered.length > 0 && (
        <div className="grid max-h-80 grid-cols-1 gap-2 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/50 p-2 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((country) => (
            <button
              key={country.code}
              type="button"
              onClick={() => selectCountry(country.code)}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                countryCode === country.code
                  ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/20"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
              )}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                {country.iso_alpha2}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  {country.name}
                </p>
                <p className="text-xs text-slate-500">
                  {country.dial_code} · {country.mobile_rules.length} digits
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {query && filtered.length === 0 && (
        <p className="text-center text-sm text-slate-500">No countries match your search.</p>
      )}

      {selectedCountry && (
        <p className="rounded-lg bg-brand-50 px-4 py-2 text-sm text-brand-800">
          Selected:{" "}
          <span className="font-medium">{selectedCountry.name}</span> (
          {selectedCountry.dial_code}) — numbers will be generated for this country.
        </p>
      )}
    </div>
  );
}
