import { Card } from "@/components/ui/Card";

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold text-text">About House Compass</h1>

      <div className="mt-8 flex flex-col gap-6">
        <Card>
          <h2 className="text-lg font-bold text-text">What this is</h2>
          <p className="mt-2 text-muted">
            House Compass is a cost-of-living calculator focused on one question: can you actually afford to live
            in a given Arizona city? Enter your income and lifestyle assumptions and see an estimated monthly
            leftover, then tweak roommates, car ownership, and dining budget to see it change in real time.
          </p>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-text">Methodology</h2>
          <p className="mt-2 text-muted">
            Housing costs are split across roommates from a per-city estimated rent baseline. Groceries and
            dining use per-city cost multipliers applied to national baseline averages. Transportation assumes
            a fixed monthly mileage and MPG when you have a car, or a simplified transit estimate otherwise.
            Affordability ratings (comfortable/moderate/tight/difficult) are based on leftover money as a
            percentage of your monthly income, using fixed thresholds defined in one place in the codebase.
          </p>
        </Card>

        <Card className="border-2 border-primary/30 bg-primary/5">
          <h2 className="text-lg font-bold text-text">Important disclaimer</h2>
          <p className="mt-2 text-muted">
            All numbers on this site are <strong>estimates based on sample data</strong>, not real-time
            market pricing. This tool is for informational and planning purposes only and does not constitute
            financial advice. Always verify current rent, utility, and tax figures before making a
            relocation or budgeting decision.
          </p>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-text">Data sources &amp; future work</h2>
          <p className="mt-2 text-muted">This MVP currently uses static, hand-estimated sample data. Planned integrations:</p>
          <ul className="mt-2 list-disc pl-5 text-muted">
            <li>Live rent/housing cost API (e.g. Zillow, Apartment List, or similar)</li>
            <li>Live gas price API (e.g. AAA or EIA regional feeds)</li>
            <li>Grocery/dining cost-of-living API (e.g. Numbeo, C2ER, BLS regional CPI)</li>
            <li>Federal + Arizona state tax-aware net income calculator</li>
            <li>Public transit fare data by city</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
