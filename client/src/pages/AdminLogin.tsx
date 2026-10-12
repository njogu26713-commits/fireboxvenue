import { useState, type FormEvent } from "react";
import { ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import BrandMark from "@/components/BrandMark";
import ThemeToggle from "@/components/ThemeToggle";
import { trpc } from "@/lib/trpc";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [passcode, setPasscode] = useState("");
  const status = trpc.auth.adminPasscodeStatus.useQuery();
  const login = trpc.auth.adminPasscodeLogin.useMutation({
    onSuccess: () => {
      setPasscode("");
      toast.success("Admin access granted");
      window.location.assign("/admin#project-tracker");
    },
    onError: error => toast.error(error.message),
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    login.mutate({ passcode });
  };

  const alreadyAdmin =
    status.data?.isAdmin && !status.data.passcodeAuthenticated;

  return (
    <main className="flex min-h-screen flex-col bg-[#06080d] text-[#f5f1eb]">
      <header className="border-b border-white/10 bg-[#080b11] px-5 py-5 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between gap-4">
          <BrandMark />
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.14em] text-[#9da9b8] transition hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> BACK TO HOME
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-5 py-14">
        <section className="w-full max-w-md border border-white/10 bg-[#0a0e15] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.32)] sm:p-9">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#6ae4ff]/25 bg-[#6ae4ff]/5 text-[#6ae4ff]">
            {alreadyAdmin ? (
              <ShieldCheck className="h-5 w-5" />
            ) : (
              <KeyRound className="h-5 w-5" />
            )}
          </div>
          <p className="mt-6 font-sans text-[10px] tracking-[0.2em] text-[#ff5a1f]">
            FIREBOX / ADMIN ACCESS
          </p>
          <h1 className="mt-2 font-sans text-3xl font-semibold tracking-[-0.04em]">
            {alreadyAdmin ? "ACCESS READY." : "ENTER PASSCODE."}
          </h1>
          <p className="mt-3 font-sans text-xs leading-6 text-[#99a6b7]">
            {alreadyAdmin
              ? "This signed-in account already has administrator access."
              : "Use the administrator passcode configured for this site to manage projects and homepage media."}
          </p>

          {status.isLoading ? (
            <div className="mt-7 border border-white/10 bg-[#0d141d] p-4 font-sans text-xs text-[#99a6b7]">
              Checking admin access…
            </div>
          ) : alreadyAdmin ? (
            <Link
              href="/admin#project-tracker"
              className="action-button mt-7 inline-flex"
            >
              <ShieldCheck className="h-4 w-4" /> OPEN ADMIN
            </Link>
          ) : status.data?.passcodeAuthenticated ? (
            <button
              type="button"
              onClick={() => setLocation("/admin#project-tracker")}
              className="action-button mt-7"
            >
              <ShieldCheck className="h-4 w-4" /> OPEN ADMIN
            </button>
          ) : !status.data?.configured ? (
            <div className="mt-7 border border-[#ff5a1f]/25 bg-[#ff5a1f]/5 p-4">
              <p className="font-sans text-xs font-semibold text-[#ffae8c]">
                Passcode login is not configured yet.
              </p>
              <p className="mt-2 font-sans text-[11px] leading-5 text-[#a6b1bf]">
                Set <code className="text-white">ADMIN_PASSCODE</code> in your
                hosting environment variables to a secret of at least 16
                characters, then restart or redeploy the app.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-7 space-y-4">
              <label className="block">
                <span className="field-label">Administrator passcode</span>
                <input
                  type="password"
                  name="admin-passcode"
                  autoComplete="current-password"
                  autoFocus
                  required
                  minLength={status.data.minPasscodeLength}
                  maxLength={256}
                  value={passcode}
                  onChange={event => setPasscode(event.target.value)}
                  placeholder="Enter passcode"
                  className="field-input"
                />
              </label>
              <p className="font-sans text-[10px] leading-5 text-[#7f8c9d]">
                The server checks this value directly. It is not saved in
                browser storage. Successful sign-ins use a secure, HTTP-only
                session that expires after 12 hours.
              </p>
              <button
                type="submit"
                disabled={
                  login.isPending ||
                  passcode.length < status.data.minPasscodeLength
                }
                className="action-button w-full justify-center"
              >
                <KeyRound className="h-4 w-4" />
                {login.isPending ? "VERIFYING…" : "SIGN IN"}
              </button>
            </form>
          )}

          <div className="mt-7 border-t border-white/10 pt-5">
            <p className="font-sans text-[9px] leading-5 text-[#617084]">
              Failed attempts are rate-limited. Project drafts and admin-only
              changes remain unavailable without a valid session.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
