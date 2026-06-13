"use client";

import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useHistory } from "@/hooks/useHistory";

export function StatsCards() {
  const { data: history } = useHistory(0);

  const completed =
    history?.items.filter((j) => j.status === "completed").length ?? 0;
  const processing =
    history?.items.filter(
      (j) => j.status === "processing" || j.status === "queued"
    ).length ?? 0;

  const stats = [
    {
      label: "Supported Countries",
      value: "30",
      description: "With format-valid rules",
    },
    {
      label: "Scale Range",
      value: "5M – 20M",
      description: "Numbers per job",
    },
    {
      label: "Session Jobs",
      value: String(history?.total ?? 0),
      description: "Last 30 days",
    },
    {
      label: "Active / Done",
      value: `${processing} / ${completed}`,
      description: "Processing / completed",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <p className="text-sm font-medium text-slate-500">{stat.label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</p>
          <p className="mt-1 text-xs text-slate-500">{stat.description}</p>
        </Card>
      ))}
    </div>
  );
}

export function RecentJobsList() {
  const { data: history, isLoading, error } = useHistory(0);

  const recent = history?.items.slice(0, 5) ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Jobs</CardTitle>
          <CardDescription>Your latest generation jobs</CardDescription>
        </div>
        <Link
          href="/history"
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          View all →
        </Link>
      </CardHeader>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-slate-500">
          Connect to the API to see your job history.
        </p>
      )}

      {!isLoading && !error && recent.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-slate-500">No jobs yet.</p>
          <Link
            href="/generate"
            className="mt-2 inline-block text-sm font-medium text-brand-600"
          >
            Generate your first batch →
          </Link>
        </div>
      )}

      {!isLoading && recent.length > 0 && (
        <div className="divide-y divide-slate-100">
          {recent.map((job) => (
            <Link
              key={job.job_id}
              href={`/jobs/${job.job_id}`}
              className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50 -mx-2 px-2 rounded-lg"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {job.country_code} · {(job.quantity / 1_000_000).toFixed(0)}M
                  numbers
                </p>
                <p className="text-xs text-slate-500 capitalize">{job.status}</p>
              </div>
              <span className="text-xs text-brand-600">View →</span>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
