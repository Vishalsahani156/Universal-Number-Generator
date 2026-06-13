"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { JobTable } from "@/components/jobs/JobTable";
import { useHistory } from "@/hooks/useHistory";
import { HISTORY_PAGE_SIZE } from "@/lib/constants";

export default function HistoryPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading, error } = useHistory(page);

  const totalPages = data ? Math.ceil(data.total / HISTORY_PAGE_SIZE) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Job history</h1>
        <p className="mt-1 text-sm text-slate-500">
          All jobs for your current session (last 30 days).
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load history. Make sure the backend is running.
        </p>
      )}

      {data && (
        <>
          <JobTable items={data.items} />

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-slate-500">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
