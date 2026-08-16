"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Building2, House, Mountain, Palmtree, Sparkles, Sun, Trees, Waves } from "lucide-react";

const steps = [
  {
    eyebrow: "Your place",
    title: "What kind of home feels like you?",
    options: [
      { label: "Desert modern", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80", icon: House },
      { label: "Resort-style", image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=900&q=80", icon: Palmtree },
      { label: "Lock & leave", image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=900&q=80", icon: Building2 },
      { label: "No preference", image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80", icon: Sparkles },
    ],
  },
  {
    eyebrow: "Your essentials",
    title: "What should we prioritize?",
    options: [
      { label: "A pool", image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=900&q=80", icon: Waves },
      { label: "Low-water landscaping", image: "https://images.unsplash.com/photo-1594818379496-da1e345b0ded?auto=format&fit=crop&w=900&q=80", icon: Trees },
      { label: "A modern kitchen", image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=80", icon: Mountain },
      { label: "No preference", image: "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=900&q=80", icon: Sparkles },
    ],
  },
  {
    eyebrow: "Your rhythm",
    title: "How do you want to spend your weekends?",
    options: [
      { label: "Outdoors & trails", image: "https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&w=900&q=80", icon: Mountain },
      { label: "Dining & design", image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80", icon: Sparkles },
      { label: "Quiet and tucked away", image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=900&q=80", icon: Sun },
      { label: "No preference", image: "https://images.unsplash.com/photo-1594818379496-da1e345b0ded?auto=format&fit=crop&w=900&q=80", icon: Sparkles },
    ],
  },
  {
    eyebrow: "Your north star",
    title: "What&apos;s your comfortable home budget?",
    options: [
      { label: "Up to $750K", image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=900&q=80", sublabel: "Thoughtful value" },
      { label: "$750K to $1.25M", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80", sublabel: "Room to roam" },
      { label: "$1.25M+", image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80", sublabel: "Dream-home mode" },
      { label: "No preference", image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=900&q=80", sublabel: "Show me everything" },
    ],
  },
  {
    eyebrow: "Your city",
    title: "Where in Arizona?",
    options: [
      { label: "Phoenix", slug: "phoenix", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80", sublabel: "Big-city energy" },
      { label: "Scottsdale", slug: "scottsdale", image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=900&q=80", sublabel: "Resort-town polish" },
      { label: "Tempe", slug: "tempe", image: "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=900&q=80", sublabel: "Walkable & youthful" },
      { label: "No preference", slug: undefined, image: "https://images.unsplash.com/photo-1594818379496-da1e345b0ded?auto=format&fit=crop&w=900&q=80", sublabel: "We'll suggest one" },
    ],
  },
] as const;

export interface HomeSearchAnswers {
  style: string;
  priority: string;
  rhythm: string;
  budget: string;
  /** Arizona city slug from lib/data/cities.ts, or undefined if "Not sure yet." */
  citySlug: string | undefined;
}

export function PreferenceWizard({
  onBack,
  onSubmit,
}: {
  onBack: () => void;
  onSubmit: (answers: HomeSearchAnswers) => void;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(["Desert modern", "A pool", "Outdoors & trails", "$750K to $1.25M", "No preference"]);
  const current = steps[step];
  const select = (option: string) => setAnswers((previous) => previous.map((answer, index) => index === step ? option : answer));
  const next = () => {
    if (step < steps.length - 1) {
      setStep((value) => value + 1);
      return;
    }
    const cityStep = steps[steps.length - 1];
    const cityOption = cityStep.options.find((o) => o.label === answers[4]);
    const citySlug = cityOption && "slug" in cityOption ? cityOption.slug : undefined;
    onSubmit({ style: answers[0], priority: answers[1], rhythm: answers[2], budget: answers[3], citySlug });
  };

  return <section className="min-h-[calc(100svh-73px)] bg-[#faf6ef] px-5 py-12 sm:px-8 sm:py-16"><div className="mx-auto max-w-3xl"><button onClick={step === 0 ? onBack : () => setStep((value) => value - 1)} className="inline-flex items-center gap-2 text-sm font-bold text-[#68756b] transition hover:text-[#253a2e]"><ArrowLeft size={17} />Back</button><div className="mt-9 flex items-center justify-between gap-5"><p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#bd612f]">Step {step + 1} of {steps.length}</p><p className="text-sm font-semibold text-[#788078]">{Math.round(((step + 1) / steps.length) * 100)}% complete</p></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eadfce]"><div className="h-full rounded-full bg-gradient-to-r from-[#d66732] to-[#efa156] transition-all duration-500" style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div><div className="mt-12"><p className="text-sm font-bold text-[#7c887d]">{current.eyebrow}</p><h1 className="mt-2 text-4xl font-extrabold tracking-[-0.045em] text-[#23382d] sm:text-5xl">{current.title.replace("&apos;", "'")}</h1><p className="mt-4 max-w-xl text-lg leading-7 text-[#697269]">Pick whatever fits. We use these to narrow down what actually matters to you.</p><div className="mt-9 grid gap-4 sm:grid-cols-3">{current.options.map((option) => { const selected = answers[step] === option.label; const Icon = "icon" in option ? option.icon : undefined; return <button key={option.label} onClick={() => select(option.label)} className={`group relative min-h-48 overflow-hidden rounded-3xl border-2 p-5 text-left transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#d66732] ${selected ? "border-[#d66732] bg-[#fffaf3] shadow-lg shadow-[#d66732]/10" : "border-[#e5d9c9] bg-white hover:-translate-y-1 hover:border-[#bdc8b8] hover:shadow-lg hover:shadow-black/5"}`}>{"image" in option && <Image src={option.image} alt="" fill sizes="33vw" className="absolute inset-0 object-cover opacity-20 transition group-hover:opacity-30" />}<span className={`relative flex h-11 w-11 items-center justify-center rounded-2xl ${selected ? "bg-[#d66732] text-white" : "bg-[#edf1e9] text-[#48604e]"}`}>{Icon && <Icon size={22} />}</span><span className="relative mt-8 block text-lg font-extrabold text-[#263a30]">{option.label}</span>{"sublabel" in option && <span className="relative mt-1 block text-sm text-[#778078]">{option.sublabel}</span>}<span className={`absolute right-4 top-4 h-5 w-5 rounded-full border-2 ${selected ? "border-[#d66732] bg-[#d66732] shadow-[inset_0_0_0_3px_white]" : "border-[#c8cec5]"}`} /></button>; })}</div></div><div className="mt-10 flex items-center justify-between border-t border-[#e4d9c9] pt-6"><p className="hidden text-sm text-[#737c72] sm:block">Your choices stay private to this search.</p><button onClick={next} className="ml-auto inline-flex items-center gap-2 rounded-full bg-[#243b2f] px-6 py-3.5 font-bold text-white shadow-lg shadow-[#243b2f]/15 transition hover:-translate-y-0.5 hover:bg-[#345342]">{step === steps.length - 1 ? "Find my match" : "Continue"}<ArrowRight size={18} /></button></div></div></section>;
}
