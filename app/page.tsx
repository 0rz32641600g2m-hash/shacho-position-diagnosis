import { DiagnosisForm } from "@/components/forms/diagnosis-form";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <DiagnosisForm />
    </main>
  );
}
