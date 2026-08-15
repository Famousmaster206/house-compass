"use client";

import { useState } from "react";
import { Sparkles, AlertCircle, Loader } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { generateAiOverview } from "@/lib/api/client";
import type { CalculationResult, CalculatorInput } from "@/lib/services/calculator";

interface AiOverviewProps {
  input: CalculatorInput;
  result: CalculationResult;
}

export function AiOverview({ input, result }: AiOverviewProps) {
  const [overview, setOverview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [hasRequested, setHasRequested] = useState(false);

  const fetchOverview = async () => {
    setLoading(true);
    setError("");
    setHasRequested(true);

    try {
      const response = await generateAiOverview({
        cityName: result.cityName,
        monthlyIncome: result.monthlyIncome,
        expenses: result.expenses,
        leftover: result.leftover,
        affordabilityRating: result.affordability.rating,
        householdSize: input.householdSize,
        roommates: input.roommates,
        hasCar: input.hasCar,
        bedrooms: input.bedrooms,
      });

      if (response.success) {
        setOverview(response.overview);
      } else {
        setError("Failed to generate overview. Please try again.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred while generating the overview."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollReveal>
      <Card className="mt-8">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-primary" aria-hidden="true" />
          <p className="text-sm font-semibold text-muted">AI-Powered Overview</p>
        </div>

        {!hasRequested && !overview && (
          <p className="mt-4 text-sm text-text">
            Get personalized insights about your housing affordability and financial situation powered
            by AI.
          </p>
        )}

        {hasRequested && loading && (
          <div className="mt-4 flex items-center gap-2">
            <Loader className="animate-spin text-primary" size={18} />
            <p className="text-sm text-muted">Generating personalized insights...</p>
          </div>
        )}

        {error && (
          <div className="mt-4 flex gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
            <p>{error}</p>
          </div>
        )}

        {overview && !loading && (
          <div className="mt-4 space-y-3 text-sm text-text">
            {overview.split("\n").map((paragraph, idx) => (
              <p key={idx} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        )}

        {!overview && !loading && hasRequested && !error && (
          <p className="mt-4 text-sm text-muted">No overview available.</p>
        )}

        {!hasRequested && (
          <Button onClick={fetchOverview} variant="primary" className="mt-4" disabled={loading}>
            Generate AI Overview
          </Button>
        )}

        {overview && !loading && (
          <Button onClick={fetchOverview} variant="secondary" className="mt-4" disabled={loading}>
            Regenerate
          </Button>
        )}

        <p className="mt-3 text-xs text-muted">
          This AI-generated overview is for informational purposes and should not be considered financial
          advice.
        </p>
      </Card>
    </ScrollReveal>
  );
}
