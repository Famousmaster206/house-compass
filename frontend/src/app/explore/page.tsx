import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";

const links = [
  { title: "Cheapest AZ cities", desc: "Sorted by lowest cost of living index.", href: "/cities?sort=cheapest" },
  { title: "Most affordable for renters", desc: "Lowest 1BR rent estimates.", href: "/cities?sort=rent-low" },
  { title: "Highest housing costs", desc: "Sorted by highest cost of living index.", href: "/cities?sort=priciest" },
  { title: "Cost by income", desc: "See what income you'd need across cities.", href: "/cities" },
  { title: "Phoenix vs Tucson", desc: "Big city vs affordable college town.", href: "/compare?cities=phoenix,tucson" },
  { title: "Phoenix vs Flagstaff", desc: "Desert heat vs mountain cool.", href: "/compare?cities=phoenix,flagstaff" },
  { title: "Phoenix vs Scottsdale", desc: "Everyday value vs resort-town polish.", href: "/compare?cities=phoenix,scottsdale" },
  { title: "Budget-friendly cities", desc: "Cities with a cost index under 95.", href: "/cities?filter=budget" },
];

export default function ExplorePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold text-text">Explore</h1>
      <p className="mt-2 text-muted">Jump straight into a comparison or filtered view.</p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {links.map((link) => (
          <Link key={link.title} href={link.href}>
            <Card className="flex items-center justify-between transition-shadow hover:shadow-lg">
              <div>
                <h3 className="font-bold text-text">{link.title}</h3>
                <p className="mt-1 text-sm text-muted">{link.desc}</p>
              </div>
              <ArrowRight className="text-primary shrink-0" size={20} aria-hidden="true" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
