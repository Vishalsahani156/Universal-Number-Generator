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

export function JobTable({
  items,
  showDownload = false,
  onDownload,
  downloadingId,
}: JobTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
        <p className="text-sm text-slate-500">No jobs found for this session.</p>
        <Link href="/generate">
          <Button variant="secondary" className="mt-4">
            Create your first job
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Country</th>
              <th className="px-4 py-3 font-medium">Quantity</th>
              <th className="px-4 py-3 font-medium">Format</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.job_id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {item.country_code}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {formatNumber(item.quantity)}
                </td>
                <td className="px-4 py-3 uppercase text-slate-600">
                  {item.export_format}
                </td>
                <td className="px-4 py-3">
                  <Badge status={item.status}>{item.status}</Badge>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {formatDate(item.created_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
