import { Card } from "@/components/ui/Card";
import { AffordabilityBadge } from "@/components/ui/Badge";
import type { CalculationResult } from "@/lib/services/calculator";
import { formatCurrency } from "@/lib/utils/format";

export function AffordabilityCard({ result }: { result: CalculationResult }) {
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-muted">Estimated monthly leftover in</p>
          <h2 className="text-2xl font-bold text-text">{result.cityName}</h2>
        </div>
        <AffordabilityBadge rating={result.affordability.rating} label={result.affordability.label} />
      </div>

      <p
        className="mt-4 text-5xl font-bold tabular-nums"
        style={{ color: result.affordability.color }}
      >
        {formatCurrency(result.leftover)}
      </p>
      <p className="mt-1 text-sm text-muted">per month, after estimated expenses</p>

      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-sandstone/50 pt-4 text-sm">
        <div>
          <p className="text-muted">Monthly income</p>
          <p className="font-bold text-text tabular-nums">{formatCurrency(result.monthlyIncome)}</p>
        </div>
        <div>
          <p className="text-muted">Total estimated expenses</p>
          <p className="font-bold text-text tabular-nums">{formatCurrency(result.totalExpenses)}</p>
        </div>
      </div>
      <p className="mt-4 text-xs text-muted">
        All figures are estimates based on sample cost-of-living data, not real-time pricing.
      </p>
    </Card>
  );
}
