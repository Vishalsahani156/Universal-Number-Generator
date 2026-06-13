"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { JobTable } from "@/components/jobs/JobTable";
import { useHistory } from "@/hooks/useHistory";
import { useCountries } from "@/hooks/useCountries";
import { formatCompact } from "@/lib/utils";

export default function DashboardPage() {
  const { data: history, isLoading } = useHistory(0);
  const { data: countries } = useCountries();

  const recentJobs = history?.items.slice(0, 5) ?? [];
  const completedCount =
    history?.items.filter((j) => j.status === "completed").length ?? 0;
  const activeCount =
    history?.items.filter((j) =>
      ["queued", "processing"].includes(j.status),
    ).length ?? 0;

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-10 text-white shadow-elevated sm:px-10">
        <p className="text-sm font-medium text-brand-100">Universal Generator</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Generate millions of valid phone numbers
        </h1>
        <p className="mt-3 max-w-2xl text-brand-100">
          Select from 30 countries, configure export options, and download CSV or
          XLSX files. Jobs run in the background with real-time progress.
        </p>
        <Link href="/generate" className="mt-6 inline-block">
          <Button
            size="lg"
            className="bg-white text-brand-700 hover:bg-brand-50"
          >
            Start generating
          </Button>
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Countries</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {countries?.length ?? 30}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Active jobs</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{activeCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Completed</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {completedCount}
          </p>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Recent jobs</h2>
            <p className="text-sm text-slate-500">
              Scale: {formatCompact(5_000_000)} – {formatCompact(20_000_000)} per job
            </p>
          </div>
          <Link href="/history">
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : (
          <JobTable items={recentJobs} />
        )}
      </section>
    </div>
  );
}
