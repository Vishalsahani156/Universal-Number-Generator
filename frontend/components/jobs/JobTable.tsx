"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate, formatNumber } from "@/lib/utils";
import type { HistoryItem } from "@/types/api";

interface JobTableProps {
  items: HistoryItem[];
  showDownload?: boolean;
  onDownload?: (jobId: string, format: "csv" | "xlsx") => void;
  downloadingId?: string | null;
}

function JobActions({
  item,
  showDownload,
  onDownload,
  downloadingId,
}: {
  item: HistoryItem;
  showDownload: boolean;
  onDownload?: (jobId: string, format: "csv" | "xlsx") => void;
  downloadingId?: string | null;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href={`/jobs/${item.job_id}`}>
        <Button variant="ghost" size="sm">
          View
        </Button>
      </Link>
      {showDownload && item.download_available && onDownload && (
        <Button
          variant="secondary"
          size="sm"
          loading={downloadingId === item.job_id}
          onClick={() => onDownload(item.job_id, item.export_format)}
        >
          Download
        </Button>
      )}
    </div>
  );
}

export function JobTable({
  items,
  showDownload = false,
  onDownload,
  downloadingId,
}: JobTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-white px-4 py-10 text-center dark:border-slate-700 dark:bg-slate-800 night:border-slate-800 night:bg-slate-900 sm:px-6 sm:py-12">
        <p className="text-sm text-slate-500 dark:text-slate-400 night:text-slate-500">
          No jobs found for this session.
        </p>
        <Link href="/generate">
          <Button variant="secondary" className="mt-4">
            Create your first job
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {items.map((item) => (
          <div
            key={item.job_id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-700 dark:bg-slate-800 night:border-slate-800 night:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100 night:text-slate-200">
                  {item.country_code}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 night:text-slate-500">
                  {formatDate(item.created_at)}
                </p>
              </div>
              <Badge status={item.status}>{item.status}</Badge>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-xs text-slate-500 dark:text-slate-400">Quantity</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-200">
                  {formatNumber(item.quantity)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 dark:text-slate-400">Format</dt>
                <dd className="font-medium uppercase text-slate-900 dark:text-slate-200">
                  {item.export_format}
                </dd>
              </div>
            </dl>
            <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-700 night:border-slate-800">
              <JobActions
                item={item}
                showDownload={showDownload}
                onDownload={onDownload}
                downloadingId={downloadingId}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 night:border-slate-800 night:bg-slate-900 md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400 night:border-slate-800 night:bg-slate-950/50 night:text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Country</th>
                <th className="px-4 py-3 font-medium">Quantity</th>
                <th className="px-4 py-3 font-medium">Format</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 night:divide-slate-800">
              {items.map((item) => (
                <tr
                  key={item.job_id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 night:hover:bg-slate-800/40"
                >
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100 night:text-slate-200">
                    {item.country_code}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400 night:text-slate-500">
                    {formatNumber(item.quantity)}
                  </td>
                  <td className="px-4 py-3 uppercase text-slate-600 dark:text-slate-400 night:text-slate-500">
                    {item.export_format}
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={item.status}>{item.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400 night:text-slate-500">
                    {formatDate(item.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <JobActions
                      item={item}
                      showDownload={showDownload}
                      onDownload={onDownload}
                      downloadingId={downloadingId}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
