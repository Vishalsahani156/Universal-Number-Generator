"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { JobTable } from "@/components/jobs/JobTable";
import { useHistory } from "@/hooks/useHistory";
import { useCountries } from "@/hooks/useCountries";
import { formatCompact } from "@/lib/utils";
import { MIN_QUANTITY } from "@/lib/constants";

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
      <section className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 px-4 py-8 text-white shadow-elevated sm:px-6 sm:py-10 md:px-10">
        <p className="text-sm font-medium text-brand-100">Universal Generator</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
          Generate millions of valid phone numbers
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-brand-100 sm:text-base">
          Select from 30 countries, configure export options, and download CSV or
          XLSX files. Jobs run in the background with real-time progress.
        </p>
        <Link href="/generate" className="mt-6 inline-block">
          <Button
            size="lg"
            className="w-full !border-0 !bg-black !text-white hover:!bg-slate-800 focus-visible:ring-slate-500 sm:w-auto"
          >
            Start generating
          </Button>
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400 night:text-slate-500">Countries</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100 night:text-slate-200">
            {countries?.length ?? 30}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400 night:text-slate-500">Active jobs</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100 night:text-slate-200">{activeCount}</p>
        </Card>
        <Card className="sm:col-span-2 lg:col-span-1">
          <p className="text-sm text-slate-500 dark:text-slate-400 night:text-slate-500">Completed</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100 night:text-slate-200">
            {completedCount}
          </p>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 night:text-slate-200">Recent jobs</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 night:text-slate-500">
              Scale: from {formatCompact(MIN_QUANTITY)} — no maximum limit
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
