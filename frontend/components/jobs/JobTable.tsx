"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useCountries } from "@/hooks/useCountries";
import { countryFlag, formatDate, formatNumber } from "@/lib/format";
import type { HistoryItem } from "@/types/api";

interface JobTableProps {
  items: HistoryItem[];
  showActions?: boolean;
}

export function JobTable({ items, showActions = true }: JobTableProps) {
  const { data: countries } = useCountries();

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <p className="text-slate-500">No jobs found for this session.</p>
        <Link
          href="/generate"
          className="mt-2 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Start your first generation →
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-600">Country</th>
              <th className="px-4 py-3 font-medium text-slate-600">Quantity</th>
              <th className="px-4 py-3 font-medium text-slate-600">Format</th>
              <th className="px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="px-4 py-3 font-medium text-slate-600">Created</th>
              {showActions && (
                <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => {
              const country = countries?.find(
                (c) => c.iso_alpha2 === item.country_code
              );
              return (
                <tr key={item.job_id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <span className="mr-1.5">
                      {countryFlag(item.country_code)}
                    </span>
                    {country?.name ?? item.country_code}
                  </td>
                  <td className="px-4 py-3">{formatNumber(item.quantity)}</td>
                  <td className="px-4 py-3 uppercase">
                    {item.export_format ?? "csv"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDate(item.created_at)}
                  </td>
                  {showActions && (
                    <td className="px-4 py-3">
                      <Link
                        href={`/jobs/${item.job_id}`}
                        className="text-brand-600 hover:text-brand-700"
                      >
                        View
                      </Link>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface PaginationProps {
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  total,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-slate-500">
        Page {page + 1} of {totalPages} ({total} jobs)
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
