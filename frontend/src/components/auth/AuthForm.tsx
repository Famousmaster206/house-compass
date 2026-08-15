"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { signUp, logIn } from "@/lib/firebase/auth";
import { isFirebaseConfigured } from "@/lib/firebase/config";

export interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const configured = isFirebaseConfigured();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = mode === "login" ? await logIn(email, password) : await signUp(email, password);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/account");
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-16 sm:px-6">
      <h1 className="text-center text-3xl font-extrabold text-text">
        {mode === "login" ? "Log in" : "Create an account"}
      </h1>
      <p className="mt-2 text-center text-muted">
        {mode === "login" ? "Welcome back to AZ Living." : "Save calculations and favorite cities."}
      </p>

      <Card className="mt-8">
        {!configured && (
          <div className="mb-4 flex items-start gap-2 rounded-xl bg-moderate/10 p-3 text-sm text-moderate">
            <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>Sign in to save calculations — auth isn&apos;t configured for this deployment yet.</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!configured}
          />
          <Input
            label="Password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={!configured}
          />
          {error && (
            <p role="alert" className="text-sm font-medium text-difficult">
              {error}
            </p>
          )}
          <Button type="submit" disabled={!configured || submitting}>
            {submitting ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
          </Button>
        </form>
      </Card>

      <p className="mt-6 text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
