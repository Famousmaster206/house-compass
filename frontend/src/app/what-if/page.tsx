import { Suspense } from "react";
import { WhatIfView } from "@/components/calculator/WhatIfView";

export default function WhatIfPage() {
  return (
    <Suspense fallback={null}>
      <WhatIfView />
    </Suspense>
  );
}
