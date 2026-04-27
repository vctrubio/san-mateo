"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type AuthMode = "sign-in" | "sign-up";

function getDestination(callbackUrl: string | null, role: string | undefined) {
  const fallback = role === "admin" ? "/admin" : "/user";

  if (!callbackUrl || callbackUrl === "/") {
    return fallback;
  }

  if (callbackUrl.startsWith("/admin") && role !== "admin") {
    return "/user";
  }

  return callbackUrl;
}

export default function SignInPage() {
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl = useMemo(() => searchParams.get("callbackUrl"), [searchParams]);

  const submitAuth = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      const formData = new FormData(event.currentTarget);
      const email = String(formData.get("email") ?? "").trim();
      const password = String(formData.get("password") ?? "");
      const name = String(formData.get("name") ?? "").trim();

      setError(null);
      setSuccess(null);

      if (!email || !password) {
        setError("Email and password are required.");
        return;
      }

      const actionResult =
        mode === "sign-in"
          ? await authClient.signIn.email({
              email,
              password,
            })
          : await authClient.signUp.email({
              email,
              password,
              name: name || "Guest",
            });

      if (actionResult.error) {
        setError(actionResult.error.message || "Authentication failed.");
        return;
      }

      const sessionResult = await authClient.getSession();
      const session = sessionResult.data;

      if (!session) {
        if (mode === "sign-up") {
          setMode("sign-in");
          setSuccess("Account created. Sign in to continue.");
          return;
        }

        setError("Session was not returned after sign-in. Try again.");
        return;
      }

      router.replace(getDestination(callbackUrl, session.user.role));
      router.refresh();
    });
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(236,201,155,0.28),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(3,105,161,0.18),_transparent_28%),linear-gradient(180deg,#f8f4ee_0%,#f3efe8_100%)] px-6 py-10 md:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-slate-950 px-8 py-10 text-white shadow-2xl shadow-slate-900/10 md:px-12 md:py-14">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_28%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between gap-10">
            <div className="space-y-6 max-w-xl">
              <p className="text-[10px] font-mono uppercase tracking-[0.45em] text-sky-200/80">
                Better Auth login
              </p>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter md:text-6xl">
                  Sign in to the San Mateo operations surface.
                </h1>
                <p className="max-w-lg text-sm leading-7 text-slate-200 md:text-base">
                  Email verification is disabled for development. Use this page to create a user, sign in, and
                  jump between the guest and admin surfaces while the role switch tools are still being built.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Guest view", value: "/user" },
                { label: "Admin view", value: "/admin" },
                { label: "Auth endpoint", value: "/api/auth/*" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="text-[10px] font-mono uppercase tracking-[0.35em] text-slate-300">
                    {item.label}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-white">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 md:p-8">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-slate-400">Account access</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tighter text-slate-900">
                Sign in or create a test user.
              </h2>
            </div>
            <div className="rounded-full border border-slate-200 bg-sand px-4 py-2 text-[10px] font-mono uppercase tracking-[0.35em] text-slate-600">
              Development mode
            </div>
          </div>

          <div className="mb-6 inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
            {(["sign-in", "sign-up"] as AuthMode[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] transition-colors ${
                  mode === item ? "bg-slate-950 text-white" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {item === "sign-in" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <form onSubmit={submitAuth} className="space-y-5">
            <label className="block space-y-2">
              <span className="text-xs font-mono uppercase tracking-[0.28em] text-slate-500">Email</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-ocean"
                placeholder="you@example.com"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-mono uppercase tracking-[0.28em] text-slate-500">Password</span>
              <input
                name="password"
                type="password"
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-ocean"
                placeholder="At least 8 characters"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-mono uppercase tracking-[0.28em] text-slate-500">
                Display name
              </span>
              <input
                name="name"
                type="text"
                autoComplete="name"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-ocean"
                placeholder="San Mateo Guest"
              />
            </label>

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3.5 text-sm font-bold uppercase tracking-[0.24em] text-white transition-colors hover:bg-ocean disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending
                ? "Working..."
                : mode === "sign-in"
                  ? "Sign in"
                  : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-sm leading-6 text-slate-500">
            In development, use the role switch on <span className="font-semibold text-slate-800">/user</span>
            to jump between guest and admin experiences after you are signed in.
          </p>
        </section>
      </div>
    </main>
  );
}