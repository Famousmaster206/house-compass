import { CalculatorForm } from "@/components/calculator/CalculatorForm";
import { CalculatorPathPicker } from "@/components/calculator/CalculatorPathPicker";

export default function CalculatePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="text-3xl font-extrabold text-text">Let&apos;s calculate your affordability</h1>
        <p className="mt-2 text-muted">
          Answer a few quick questions about your income and lifestyle. All figures are estimates.
        </p>
      </div>
      <CalculatorPathPicker />
      <CalculatorForm />
    </div>
  );
}
