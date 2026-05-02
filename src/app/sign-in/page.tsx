'use client';

import { Suspense, useMemo, useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Users, User, Shield, CheckCircle2, Loader2, Sparkles, LogIn } from "lucide-react";
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
          ? await authClient.signIn.email({ email, password })
          : await authClient.signUp.email({ email, password, name: name || "Guest" });

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
    <main className="min-h-screen bg-[#F5F2ED] p-6 md:p-12">
      <div className="max-w-[1400px] mx-auto grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
        
        {/* Left Side: Mock users quick listing */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200/80 p-8 shadow-2xl shadow-slate-100/40 space-y-6 flex flex-col justify-between h-full min-h-[700px]">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.45em] text-ocean mb-1">
                  Mock guest profiles &amp; testing
                </p>
                <h2 className="text-4xl font-bold tracking-tighter text-slate-900 leading-none">
                  Quick Access Portal
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed max-w-2xl mt-1.5">
                  Direct sign-in buttons for all 20 mock users. See exactly how many bookings they have made and check their interface with real data for Monday's presentation.
                </p>
              </div>
              <button
                onClick={handleSeedAction}
                disabled={isSeeding}
                className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-ocean hover:shadow-lg hover:shadow-ocean/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 select-none cursor-pointer"
              >
                {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-400" />}
                <span>{isSeeding ? "Generating..." : "Generate 20 test users & bookings"}</span>
              </button>
            </div>

            {mockUsers.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center text-slate-400 text-sm flex flex-col items-center justify-center gap-2">
                <Users className="w-8 h-8 opacity-40 mb-2" />
                <p className="font-medium text-slate-600">No mock users available yet</p>
                <p className="text-xs text-slate-400">Click on 'Generate 20 test users &amp; bookings' above to start testing on the fly.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[520px] overflow-y-auto pr-1">
                {mockUsers.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:border-sky-100 hover:bg-white hover:shadow-md transition-all duration-300"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span className="flex items-center gap-1.5">
                          {item.role === "admin" ? (
                            <Shield className="w-4 h-4 text-sky-500 shrink-0" />
                          ) : (
                            <User className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <span className="text-sm font-bold text-slate-900 leading-tight">
                            {item.name}
                          </span>
                        </span>
                        <span className={`px-2 py-0.5 rounded-full border text-[9px] font-mono uppercase tracking-wider ${
                          item.role === 'admin' ? 'border-sky-200 bg-sky-50 text-sky-700 font-bold' : 'border-slate-200 bg-slate-100 text-slate-600'
                        }`}>
                          {item.role}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mb-4">{item.email}</div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100/60 mt-auto flex-wrap gap-2">
                      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                        Bookings made: <span className="font-bold text-slate-700">{item.bookings_count}</span>
                      </div>
                      <button
                        onClick={() => handleQuickLogin(item.email)}
                        className="flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 uppercase tracking-[0.15em] hover:underline"
                      >
                        <span>Fast Sign In</span>
                        <LogIn className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Seed Admin reference card */}
          <div className="rounded-2xl border border-slate-200 bg-sand/30 p-4 text-xs text-slate-600 flex justify-between items-center gap-4 flex-wrap">
            <div>
              <span className="font-mono uppercase tracking-[0.2em] text-slate-500 font-bold">Standard administrator</span>
              <div className="mt-1 font-mono text-[11px] text-slate-700">
                admin@sanmateo.test · SanMateoAdmin123!
              </div>
            </div>
            <button
              onClick={() => handleQuickLogin("admin@sanmateo.test")}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-ocean transition-all select-none"
            >
              Sign In as Admin
            </button>
          </div>
        </section>

        {/* Right Side: Regular Sign in & Sign Up forms */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200/80 p-8 shadow-2xl shadow-slate-100/40 space-y-6">
          <div className="mb-4">
            <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-slate-400">Account Access</span>
            <h2 className="text-3xl font-bold tracking-tighter text-slate-900 leading-none mt-1">Form entry</h2>
          </div>

          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1 select-none">
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
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-400">Email</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-ocean text-sm"
                placeholder="you@example.com"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-400">Password</span>
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
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-400">Display name</span>
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
              className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-4 text-xs font-bold uppercase tracking-[0.24em] text-white transition-colors hover:bg-ocean disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center gap-3 select-none"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              {isPending ? "Signing in..." : mode === "sign-in" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="text-xs leading-6 text-slate-500 pt-3 border-t border-slate-100">
            For rapid presentation on Monday, use the role switch tools on <span className="font-semibold text-slate-800">/user</span> or manage users at <span className="font-semibold text-slate-800">/users</span>.
          </p>
        </section>

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
