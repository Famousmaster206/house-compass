import Image from "next/image";
import Link from "next/link";
import { ClipboardList, Sliders, MapPinned, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CityCard } from "@/components/cities/CityCard";
import { HomePreviewChart } from "@/components/charts/HomePreviewChart";
import { cities, getCityImageUrl } from "@/lib/data/cities";
import { GridBackground } from "@/components/effects/GridBackground";
import { MagneticButton } from "@/components/effects/MagneticButton";
import { SpotlightCard } from "@/components/effects/SpotlightCard";
import { ScrollReveal, ScrollRevealGroup } from "@/components/effects/ScrollReveal";

const howItWorks = [
  {
    icon: ClipboardList,
    title: "Tell us about your life",
    body: "Income, roommates, car, dining habits — a quick 7-step form with sensible defaults.",
  },
  {
    icon: MapPinned,
    title: "Pick an Arizona city",
    body: "Phoenix, Tucson, Scottsdale, Flagstaff, and more — each with real cost estimates.",
  },
  {
    icon: Sliders,
    title: "See your leftover money",
    body: "We estimate your monthly expenses and show what's actually left in your pocket.",
  },
  {
    icon: Sparkles,
    title: "Tweak and compare",
    body: "Adjust roommates, car, and budget live on What-If, or compare cities side by side.",
  },
];

export default function Home() {
  const previewCities = cities.slice(0, 3);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Image
          src={getCityImageUrl({ imageId: "1647929368246-193b86f4a3bc" }, 1920)}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-[0.08]"
        />
        <GridBackground glow />
        <div className="relative mx-auto w-full max-w-6xl px-4 pt-16 pb-20 sm:px-6 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-text sm:text-5xl">
              Can you actually afford to live in Arizona?
            </h1>
            <p className="mt-5 text-lg text-muted">
              Enter your income and lifestyle, pick a city, and see your estimated monthly leftover money —
              then tweak the assumptions in real time.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <MagneticButton>
                <Link href="/calculate">
                  <Button size="lg">
                    Calculate my affordability <ArrowRight size={18} aria-hidden="true" />
                  </Button>
                </Link>
              </MagneticButton>
              <Link href="/cities">
                <Button size="lg" variant="outline">
                  Browse cities
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-text sm:text-3xl">How it works</h2>
        <ScrollRevealGroup className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {howItWorks.map((step, i) => (
            <SpotlightCard key={step.title} className="h-full rounded-3xl">
              <Card className="h-full text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <step.icon size={24} aria-hidden="true" />
                </div>
                <p className="mt-3 text-xs font-bold text-primary">STEP {i + 1}</p>
                <h3 className="mt-1 font-bold text-text">{step.title}</h3>
                <p className="mt-2 text-sm text-muted">{step.body}</p>
              </Card>
            </SpotlightCard>
          ))}
        </ScrollRevealGroup>
      </section>

      {/* Example cities */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold text-text sm:text-3xl">Explore Arizona cities</h2>
          <Link href="/cities" className="text-sm font-semibold text-primary hover:underline">
            See all cities
          </Link>
        </div>
        <ScrollRevealGroup className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {previewCities.map((city) => (
            <CityCard key={city.slug} city={city} />
          ))}
        </ScrollRevealGroup>
      </section>

      {/* Preview chart + differentiation */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
          <ScrollReveal>
            <div>
              <h2 className="text-2xl font-bold text-text sm:text-3xl">What makes this different</h2>
              <ul className="mt-6 flex flex-col gap-4 text-sm text-muted">
                <li>
                  <span className="font-bold text-text">Interactive, not static.</span> Tweak roommates, car
                  ownership, and dining budget and watch your leftover money update live.
                </li>
                <li>
                  <span className="font-bold text-text">Arizona-specific.</span> Built around real AZ cities
                  and desert-living cost patterns, not a generic national calculator.
                </li>
                <li>
                  <span className="font-bold text-text">Honest about being an estimate.</span> Every number
                  is clearly labeled as estimated sample data — we tell you what we don&apos;t know.
                </li>
              </ul>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <Card>
              <p className="text-sm font-semibold text-muted">Estimated leftover money by city</p>
              <HomePreviewChart />
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6">
        <ScrollReveal>
          <Card className="bg-primary text-white text-center py-12 border-none">
            <h2 className="text-2xl font-bold sm:text-3xl">Ready to see your number?</h2>
            <p className="mt-2 text-white/90">Takes about two minutes. No account required.</p>
            <div className="mt-6">
              <MagneticButton>
                <Link href="/calculate">
                  <Button size="lg" className="bg-white text-primary hover:bg-sandstone-light">
                    Start the calculator
                  </Button>
                </Link>
              </MagneticButton>
            </div>
          </Card>
        </ScrollReveal>
      </section>
    </div>
  );
}
