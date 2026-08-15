"use client";

import { useEffect, useState } from "react";
import { Compass } from "lucide-react";

const messages = ["Scanning Maricopa County...", "Checking for optimal AC units...", "Calculating sun exposure...", "Finding your oasis..."];

export function SearchLoading({ onComplete }: { onComplete: () => void }) {
  const [messageIndex, setMessageIndex] = useState(0);
  useEffect(() => { const phraseTimer = window.setInterval(() => setMessageIndex((index) => (index + 1) % messages.length), 650); const completeTimer = window.setTimeout(onComplete, 2800); return () => { window.clearInterval(phraseTimer); window.clearTimeout(completeTimer); }; }, [onComplete]);
  return <section className="flex min-h-[calc(100svh-73px)] items-center justify-center overflow-hidden bg-[#20382d] px-5 text-center text-white"><div className="relative max-w-md"><div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e9813f]/25 blur-3xl" /><div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur"><span className="absolute inset-2 animate-spin rounded-full border-2 border-[#f6ae68] border-t-transparent" /><Compass size={30} className="text-[#f8b46f]" /></div><p className="relative mt-9 text-sm font-extrabold uppercase tracking-[0.2em] text-[#f5ad68]">House Compass is looking</p><h1 className="relative mt-3 text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl">Reading the desert details.</h1><p className="relative mt-5 min-h-7 text-lg text-white/80" aria-live="polite">{messages[messageIndex]}</p><div className="relative mx-auto mt-9 h-1.5 w-60 overflow-hidden rounded-full bg-white/15"><div className="h-full animate-[search-progress_2.8s_ease-out_forwards] rounded-full bg-[#f5a65c]" /></div></div></section>;
}
