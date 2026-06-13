import { GenerateForm } from "@/components/generate/GenerateForm";

export default function GeneratePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Generate numbers</h1>
        <p className="mt-1 text-sm text-slate-500">
          Configure your job and submit. Processing runs in the background.
        </p>
      </div>
      <GenerateForm />
    </div>
  );
}
