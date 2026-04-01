"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ShieldCheck, Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Status = "loading" | "success" | "error" | "already_verified";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Verifying your email address…");

  useEffect(() => {
    async function handleVerification() {
      // Supabase sends tokens as hash fragments (#access_token=...&type=signup)
      // When user clicks the email link, Supabase auto-processes the hash via the JS client
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setStatus("error");
        setMessage(error.message);
        return;
      }

      if (data.session?.user?.email_confirmed_at) {
        // Mark as verified in our Prisma DB via API
        try {
          await fetch("/api/auth/verify-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: data.session.user.email }),
          });
        } catch {
          // Non-critical — login route will sync anyway
        }
        setStatus("success");
        setMessage("Your email has been verified successfully!");
        // Auto-redirect to login after 3 seconds
        setTimeout(() => router.push("/login/user"), 3000);
      } else {
        setStatus("error");
        setMessage("Verification link may have expired or is invalid. Please request a new one.");
      }
    }

    handleVerification();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#0B0F19] px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-900/50">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Suraksha</p>
          <h1 className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">Email Verification</h1>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-[#2A303C] bg-white dark:bg-[#131B2B] shadow-xl shadow-black/20 px-8 py-10 text-center">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
              <p className="text-slate-600 dark:text-slate-300">{message}</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/10">
                <CheckCircle2 className="h-9 w-9 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Account Activated!</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{message}</p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Redirecting to login in 3 seconds…</p>
              </div>
              <Link
                href="/login/user"
                className="mt-2 w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md shadow-emerald-900/30 transition hover:bg-emerald-700"
              >
                Sign in now →
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10">
                <XCircle className="h-9 w-9 text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Verification Failed</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{message}</p>
              </div>
              <ResendVerification />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResendVerification() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function resend(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Failed to resend. Please try again.");
      } else {
        setSent(true);
      }
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="mt-2 w-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
        ✅ Verification email sent! Check your inbox.
      </div>
    );
  }

  return (
    <form onSubmit={resend} className="mt-2 w-full space-y-3">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email to resend"
        className="w-full rounded-lg border border-slate-200 dark:border-[#2A303C] bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-white px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400"
      />
      {err && <p className="text-xs text-red-500">{err}</p>}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-3 text-sm font-bold text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-50"
      >
        <Mail className="h-4 w-4" />
        {loading ? "Sending…" : "Resend verification email"}
      </button>
    </form>
  );
}
