"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PreferenceWizard } from "@/components/home-search/PreferenceWizard";
import { PropertySummary } from "@/components/home-search/PropertySummary";
import { SearchLanding } from "@/components/home-search/SearchLanding";
import { SearchLoading } from "@/components/home-search/SearchLoading";

type JourneyStage = "landing" | "preferences" | "loading" | "summary";

export function HomeSearchExperience() {
  const [stage, setStage] = useState<JourneyStage>("landing");

  return (
    <AnimatePresence mode="wait" initial={false}>
      {stage === "landing" && <motion.div key="landing" exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}><SearchLanding onStart={() => setStage("preferences")} /></motion.div>}
      {stage === "preferences" && <motion.div key="preferences" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}><PreferenceWizard onBack={() => setStage("landing")} onSubmit={() => setStage("loading")} /></motion.div>}
      {stage === "loading" && <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><SearchLoading onComplete={() => setStage("summary")} /></motion.div>}
      {stage === "summary" && <motion.div key="summary" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}><PropertySummary onRestart={() => setStage("landing")} /></motion.div>}
    </AnimatePresence>
  );
}
