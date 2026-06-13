"use client";

import { useState } from "react";
import { JobTable, Pagination } from "@/components/jobs/JobTable";
import { useHistory } from "@/hooks/useHistory";
import { HISTORY_PAGE_SIZE } from "@/lib/constants";

export default function HistoryPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading, error } = useHistory(page);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Job History
        </h1>
        <p className="mt-1 text-slate-500">
          All jobs for your current session (last 30 days)
        </p>
      </div>

      {isLoading && (
        <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Failed to load history. Make sure the backend API is running.
        </div>
      )}

      {data && (
        <div className="space-y-6">
          <JobTable items={data.items} />
          <Pagination
            page={page}
            total={data.total}
            pageSize={HISTORY_PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
