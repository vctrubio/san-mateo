"use client";

import { Suspense, useMemo, useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Users, User, Shield, Sparkles, Loader2, LogIn } from "lucide-react";
import { getMockUsers, seedMockData } from "@/app/actions/mock";

type AuthMode = "sign-in" | "sign-up";

function getDestination(callbackUrl: string | null | undefined, role: string | null | undefined) {
  const fallback = role === "admin" ? "/admin" : "/user";
  if (!callbackUrl || callbackUrl === "/") {
    return fallback;
  }
  if (callbackUrl.startsWith("/admin") && role !== "admin") {
    return "/user";
  }
  return callbackUrl;
}

function SignInContent() {
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [mockUsers, setMockUsers] = useState<any[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl = useMemo(() => searchParams.get("callbackUrl"), [searchParams]);

  const fetchUsers = async () => {
    const users = await getMockUsers();
    setMockUsers(users);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSeedAction = async () => {
    setIsSeeding(true);
    const res = await seedMockData();
    setIsSeeding(false);
    if (res.success) {
      setSuccess("Mock bookings & users generated successfully!");
      fetchUsers();
    } else {
      setError(res.error || "Failed to generate mock data.");
    }
  };

  const handleQuickLogin = (email: string) => {
    startTransition(async () => {
      setError(null);
      setSuccess(null);

      const res = await authClient.signIn.email({
        email,
        password: "SanMateoAdmin123!",
      });

      if (res.error) {
        setError(res.error.message || "Sign in failed.");
        return;
      }

      const sessionResult = await authClient.getSession();
      const session = sessionResult.data;

      if (!session) {
        setError("Session failed to load. Try again.");
        return;
      }

      router.replace(getDestination(callbackUrl ?? undefined, session.user.role));
      router.refresh();
    });
  };

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

        setError("Session failed to load. Try again.");
        return;
      }

      router.replace(getDestination(callbackUrl ?? undefined, session.user.role));
      router.refresh();
    });
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(236,201,155,0.28),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(3,105,161,0.18),_transparent_28%),linear-gradient(180deg,#f8f4ee_0%,#f3efe8_100%)] px-6 py-10 md:px-10">
      
      {/* Top Section with existing visual styling */}
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch mb-12">
        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-slate-950 px-8 py-10 text-white shadow-2xl shadow-slate-900/10 md:px-12 md:py-14">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_28%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between gap-10">
            <div className="space-y-6 max-w-xl">
              <p className="text-[10px] font-mono uppercase tracking-[0.45em] text-sky-200/80">
                Better Auth login
              </p>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter md:text-6xl leading-none">
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
              <h2 className="mt-2 text-3xl font-bold tracking-tighter text-slate-900 leading-none">
                Sign in or create a test user.
              </h2>
            </div>
            <div className="rounded-full border border-slate-200 bg-sand px-4 py-2 text-[10px] font-mono uppercase tracking-[0.35em] text-slate-600">
              Development mode
            </div>
          </div>

          <div className="mb-6 inline-flex rounded-full border border-slate-200 bg-slate-50 p-1 select-none">
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

          <form onSubmit={submitAuth} className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-mono uppercase tracking-[0.28em] text-slate-500">Email</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-ocean text-sm"
                placeholder="you@example.com"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-mono uppercase tracking-[0.28em] text-slate-500">Password</span>
              <input
                name="password"
                type="password"
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-ocean text-sm"
                placeholder="At least 8 characters"
              />
            </label>

            {mode === "sign-up" && (
              <label className="block space-y-1.5">
                <span className="text-xs font-mono uppercase tracking-[0.28em] text-slate-500">Display name</span>
                <input
                  name="name"
                  type="text"
                  autoComplete="name"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-ocean text-sm"
                  placeholder="San Mateo Guest"
                />
              </label>
            )}

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
              className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3.5 text-sm font-bold uppercase tracking-[0.24em] text-white transition-colors hover:bg-ocean disabled:cursor-not-allowed disabled:opacity-70 select-none cursor-pointer flex items-center justify-center gap-2"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              {isPending ? "Working..." : mode === "sign-in" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-sm leading-6 text-slate-500">
            In development, use the role switch on <span className="font-semibold text-slate-800">/user</span>
            or manage users at <span className="font-semibold text-slate-800">/users</span> after you are signed in.
          </p>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-sand px-4 py-3 text-xs text-slate-600 flex justify-between items-center flex-wrap gap-2">
            <div>
              <span className="font-mono uppercase tracking-[0.2em] text-slate-500">Seeded admin</span>
              <div className="mt-1 font-mono text-[11px] text-slate-700">
                admin@sanmateo.test · SanMateoAdmin123!
              </div>
            </div>
            <button
              onClick={() => handleQuickLogin("admin@sanmateo.test")}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-ocean transition-all select-none"
            >
              Quick Login
            </button>
          </div>
        </section>
      </div>

      {/* Development Quick Actions & Testing Portal below the main layout */}
      <div className="mx-auto max-w-6xl bg-white rounded-[2rem] border border-slate-200 p-8 shadow-2xl shadow-slate-200/40 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-ocean mb-1">Testing Portal</p>
            <h2 className="text-3xl font-bold tracking-tighter text-slate-900">Direct Fast Login</h2>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              Select one of the 20 mock user profiles to fast-login and visualize booking status on the guest interface or analytics on the admin portal.
            </p>
          </div>
          <button
            onClick={handleSeedAction}
            disabled={isSeeding}
            className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-ocean hover:shadow-lg hover:shadow-ocean/20 transition-all select-none cursor-pointer"
          >
            {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-400" />}
            <span>{isSeeding ? "Generating..." : "Generate 20 test users & bookings"}</span>
          </button>
        </div>

        {mockUsers.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-10 text-center text-slate-400 text-sm flex flex-col items-center justify-center gap-2">
            <Users className="w-8 h-8 opacity-40 mb-1" />
            <p className="font-medium text-slate-600">No mock users generated yet</p>
            <p className="text-xs text-slate-400">Click on 'Generate 20 test users &amp; bookings' above to initialize testing entries.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-h-[420px] overflow-y-auto pr-1">
            {mockUsers.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-sky-100 hover:bg-white hover:shadow-md transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      {item.role === "admin" ? (
                        <Shield className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span className="text-xs font-bold text-slate-900 leading-tight">
                        {item.name}
                      </span>
                    </span>
                    <span className={`px-2 py-0.5 rounded-full border text-[8px] font-mono uppercase tracking-wider ${
                      item.role === 'admin' ? 'border-sky-200 bg-sky-50 text-sky-700 font-bold' : 'border-slate-200 bg-slate-100 text-slate-600'
                    }`}>
                      {item.role}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mb-3 truncate max-w-full">{item.email}</div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100/60 mt-auto">
                  <div className="text-[9px] font-mono text-slate-400 uppercase tracking-widest leading-none">
                    Bookings: <span className="font-bold text-slate-700">{item.bookings_count}</span>
                  </div>
                  <button
                    onClick={() => handleQuickLogin(item.email)}
                    className="flex items-center gap-1 text-[10px] font-bold text-sky-600 hover:text-sky-700 uppercase tracking-[0.12em] hover:underline"
                  >
                    <span>Fast Sign In</span>
                    <LogIn className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInContent />
    </Suspense>
  );
}
