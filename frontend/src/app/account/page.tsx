"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { logOut } from "@/lib/firebase/auth";
import {
  getUserCalculations,
  deleteCalculation,
  getUserFavorites,
  type SavedCalculation,
} from "@/lib/firebase/firestore";
import { formatCurrency } from "@/lib/utils/format";

export default function AccountPage() {
  const { user, loading } = useAuth();
  const [calculations, setCalculations] = useState<SavedCalculation[] | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const dataLoading = calculations === null;

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    Promise.all([getUserCalculations(user.uid), getUserFavorites(user.uid)]).then(
      ([calcRes, favRes]) => {
        if (cancelled) return;
        setCalculations(calcRes.calculations);
        setFavorites(favRes.favorites);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleDelete(id: string) {
    if (!user) return;
    await deleteCalculation(user.uid, id);
    setCalculations((prev) => (prev ? prev.filter((c) => c.id !== id) : prev));
  }

  if (loading) {
    return <p className="mx-auto max-w-2xl px-4 py-24 text-center text-muted">Loading account…</p>;
  }

  if (!user) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-text">Log in to view your account</h1>
        <p className="mt-2 text-muted">Save calculations and favorite cities by creating a free account.</p>
        <Link href="/auth/login" className="mt-6">
          <Button>Go to login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-text">Your account</h1>
          <p className="mt-1 text-muted">{user.email}</p>
        </div>
        <Button
          variant="outline"
          onClick={async () => {
            await logOut();
          }}
        >
          <LogOut size={16} aria-hidden="true" /> Log out
        </Button>
      </div>

      <Card className="mt-8">
        <h2 className="text-lg font-bold text-text">Saved calculations</h2>
        {dataLoading && <p className="mt-2 text-muted">Loading…</p>}
        {!dataLoading && calculations && calculations.length === 0 && (
          <p className="mt-2 text-muted">No saved calculations yet. Run the calculator and save your results.</p>
        )}
        <ul className="mt-4 flex flex-col gap-3">
          {(calculations ?? []).map((calc) => (
            <li
              key={calc.id}
              className="flex items-center justify-between rounded-xl border border-sandstone/50 p-4"
            >
              <div>
                <p className="font-bold text-text">{calc.cityName}</p>
                <p className="text-sm text-muted">
                  Leftover: {formatCurrency(calc.leftover)} · {calc.affordability.label}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(calc.id)}
                className="rounded-full p-2 text-muted hover:bg-difficult/10 hover:text-difficult focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                aria-label={`Delete saved calculation for ${calc.cityName}`}
              >
                <Trash2 size={18} />
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mt-8">
        <h2 className="text-lg font-bold text-text">Favorite cities</h2>
        {!dataLoading && favorites.length === 0 && (
          <p className="mt-2 text-muted">No favorite cities yet.</p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {favorites.map((slug) => (
            <Link
              key={slug}
              href={`/cities/${slug}`}
              className="rounded-full border border-sandstone px-4 py-2 text-sm font-semibold text-text hover:bg-sandstone-light"
            >
              {slug}
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
