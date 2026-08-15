import { RelocationForm } from "@/components/calculator/RelocationForm";

export default function RelocateCalculatorPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="text-3xl font-extrabold text-text">Moving to Arizona from somewhere else?</h1>
        <p className="mt-2 text-muted">
          Tell us your income and what you spend today, and we&apos;ll convert it into an estimated
          Arizona budget.
        </p>
      </div>
      <RelocationForm />
    </div>
  );
}
