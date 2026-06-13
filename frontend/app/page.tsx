import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { RecentJobsList, StatsCards } from "@/components/dashboard/RecentJobsList";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-slate-500">
            Generate and export millions of format-valid phone numbers
          </p>
        </div>
        <Link href="/generate">
          <Button size="lg">Start Generating</Button>
        </Link>
      </div>

      <div className="space-y-8">
        <StatsCards />
        <RecentJobsList />
      </div>
    </div>
  );
}
