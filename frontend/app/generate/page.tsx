import { GenerateForm } from "@/components/generate/GenerateForm";

export default function GeneratePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Generate Numbers
        </h1>
        <p className="mt-1 text-slate-500">
          Select a country, configure options, and start a background job
        </p>
      </div>

      <GenerateForm />
    </div>
  );
}
