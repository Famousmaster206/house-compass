"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { PreferenceWizard } from "@/components/home-search/PreferenceWizard";
import { PropertyResults } from "@/components/home-search/PropertyResults";
import { PropertySummary, SAMPLE_LISTINGS, type SampleListing } from "@/components/home-search/PropertySummary";
import { SearchLoading } from "@/components/home-search/SearchLoading";

type JourneyStage = "preferences" | "loading" | "results" | "summary";

export function SearchExperience() {
  const router = useRouter();
  const [stage, setStage] = useState<JourneyStage>("preferences");
  const [selectedListing, setSelectedListing] = useState<SampleListing>(SAMPLE_LISTINGS[0]);

  function restart() {
    router.push("/");
  }

  function selectListing(listing: SampleListing) {
    setSelectedListing(listing);
    setStage("summary");
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {stage === "preferences" && <motion.div key="preferences" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}><PreferenceWizard onBack={restart} onSubmit={() => setStage("loading")} /></motion.div>}
      {stage === "loading" && <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><SearchLoading onComplete={() => setStage("results")} /></motion.div>}
      {stage === "results" && <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}><PropertyResults onSelect={selectListing} onRestart={restart} /></motion.div>}
      {stage === "summary" && <motion.div key="summary" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}><PropertySummary listing={selectedListing} onRestart={restart} onBackToResults={() => setStage("results")} /></motion.div>}
    </AnimatePresence>
  );
}
