import Link from "next/link";
import { ClipboardList, ArrowRightLeft, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SpotlightCard } from "@/components/effects/SpotlightCard";

/**
 * Two entry points into affordability calculation:
 *  - Build a budget from scratch for an Arizona city (the form directly below).
 *  - Convert an existing out-of-state budget into an equivalent AZ budget (/calculate/relocate).
 */
export function CalculatorPathPicker() {
  return (
    <div className="mx-auto mb-10 grid max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2">
      <SpotlightCard className="rounded-3xl">
        <Card className="flex h-full flex-col">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ClipboardList size={22} aria-hidden="true" />
          </div>
          <h2 className="mt-3 font-bold text-text">Build my budget</h2>
          <p className="mt-1 flex-1 text-sm text-muted">
            Start fresh — enter your income and lifestyle to estimate affordability in an Arizona city.
          </p>
          <p className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary">
            Use the calculator below <ArrowRight size={14} aria-hidden="true" />
          </p>
        </Card>
      </SpotlightCard>

      <Link href="/calculate/relocate" className="block h-full">
        <SpotlightCard className="h-full rounded-3xl">
          <Card className="flex h-full flex-col">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ArrowRightLeft size={22} aria-hidden="true" />
            </div>
            <h2 className="mt-3 font-bold text-text">I&apos;m moving from another city</h2>
            <p className="mt-1 flex-1 text-sm text-muted">
              Tell us what you spend in Los Angeles, San Francisco, Chicago, or New York, and we&apos;ll
              convert it to an equivalent Arizona budget.
            </p>
            <p className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary">
              Convert my cost of living <ArrowRight size={14} aria-hidden="true" />
            </p>
          </Card>
        </SpotlightCard>
      </Link>
    </div>
  );
}
