// Minimal/stub tax module for MVP.
// Arizona has a flat state income tax and no local income tax complexity,
// so a full bracket-aware calculator is out of scope for the MVP.
//
// TODO: implement a real federal + AZ state tax-aware net-income calculator
// (federal brackets, standard deduction, AZ flat rate, FICA) once a tax API
// or maintained bracket dataset is wired in. For now this module exists as a
// placeholder so the rest of the app can call a stable interface.

export interface TaxEstimateInput {
  grossAnnualIncome: number;
}

export interface TaxEstimateResult {
  estimatedNetAnnualIncome: number;
  note: string;
}

/**
 * Placeholder: currently a pass-through (assumes the user enters
 * take-home/net monthly income directly in the calculator). Not used for
 * real tax math yet. See TODO above.
 */
export function estimateNetIncome(
  input: TaxEstimateInput
): TaxEstimateResult {
  return {
    estimatedNetAnnualIncome: input.grossAnnualIncome,
    note: "Tax calculation not yet implemented. Treat input income as net/take-home for now.",
  };
}
