"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X, Compass } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

const links = [
  { href: "/calculate", label: "Calculate" },
  { href: "/compare", label: "Compare" },
  { href: "/cities", label: "Cities" },
  { href: "/explore", label: "Explore" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const reducedMotion = usePrefersReducedMotion();

  return (
    <header className="sticky top-0 z-40 border-b border-sandstone/50 bg-background/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold text-text">
          <Compass className="text-primary" size={24} aria-hidden="true" />
          AZ Living
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {links.map((link) => {
            const active = pathname === link.href || pathname?.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-sm font-semibold text-text hover:text-primary transition-colors"
              >
                {link.label}
                {active && (
                  <span
                    className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {!loading && user ? (
            <Link href="/account">
              <Button size="sm" variant="secondary">
                Account
              </Button>
            </Link>
          ) : (
            <Link href="/auth/login">
              <Button size="sm" variant="primary">
                Log in
              </Button>
            </Link>
          )}
        </div>

        <button
          type="button"
          className="md:hidden text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary rounded-lg p-1"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={reducedMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reducedMotion ? undefined : { opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-sandstone/50 bg-background md:hidden"
          >
          <div className="flex flex-col gap-1 px-4 py-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-2 py-2.5 text-sm font-semibold text-text hover:bg-sandstone-light"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={!loading && user ? "/account" : "/auth/login"}
              className="rounded-lg px-2 py-2.5 text-sm font-semibold text-primary hover:bg-sandstone-light"
              onClick={() => setOpen(false)}
            >
              {!loading && user ? "Account" : "Log in"}
            </Link>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
