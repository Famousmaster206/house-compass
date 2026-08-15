"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/context/AuthContext";

export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
