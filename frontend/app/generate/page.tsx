import { GenerateForm } from "@/components/generate/GenerateForm";

export default function GeneratePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 night:text-slate-200 sm:text-2xl">
          Generate numbers
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 night:text-slate-500">
          Configure your job and submit. Processing runs in the background.
        </p>
      </div>
      <GenerateForm />
    </div>
  );
}
