import Link from "next/link";
import { Compass } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-sandstone/50 bg-sandstone-light/40">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-lg font-extrabold text-text">
              <Compass className="text-primary" size={20} aria-hidden="true" />
              House Compass
            </div>
            <p className="mt-2 max-w-xs text-sm text-muted">
              Estimate your real cost of living across Arizona cities. Estimates only — not financial advice.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-2">
            <div>
              <h4 className="text-sm font-bold text-text">Product</h4>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-muted">
                <li><Link href="/about" className="transition-colors hover:text-primary">About</Link></li>
                <li><Link href="/about" className="transition-colors hover:text-primary">Methodology</Link></li>
                <li><Link href="/about" className="transition-colors hover:text-primary">Data Sources</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-text">Legal</h4>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-muted">
                <li><Link href="/privacy" className="transition-colors hover:text-primary">Privacy</Link></li>
                <li><Link href="/terms" className="transition-colors hover:text-primary">Terms</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-8 text-xs text-muted">
          &copy; {new Date().getFullYear()} House Compass. Sample data — not a substitute for professional financial advice.
        </p>
      </div>
    </footer>
  );
}
