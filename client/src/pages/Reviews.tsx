import { ArrowLeft, MessageSquareQuote } from "lucide-react";
import { Link } from "wouter";
import BrandMark from "@/components/BrandMark";
import ThemeToggle from "@/components/ThemeToggle";

export default function Reviews() {
  return (
    <main className="min-h-screen w-full bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 px-5 py-5 backdrop-blur-xl sm:px-8 lg:px-12">
        <div className="flex w-full items-center justify-between gap-4">
          <BrandMark />
          <div className="flex items-center gap-4 sm:gap-5">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.14em] text-muted-foreground transition hover:text-[#ff5a1f]"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> BACK TO HOME
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <section className="w-full border-b border-border px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
        <div className="max-w-4xl">
          <span className="font-sans text-[10px] tracking-[0.18em] text-[#ff5a1f]">
            08 / FIELD REPORTS
          </span>
          <h1 className="mt-4 font-sans text-5xl font-bold tracking-[-0.06em] sm:text-7xl">
            REVIEWS
          </h1>
          <p className="mt-6 max-w-2xl font-sans text-xs leading-6 text-muted-foreground sm:text-sm">
            Honest signals from the people and teams who experience Firebox work
            in the field.
          </p>
        </div>
      </section>

      <section className="w-full px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
        <div className="mx-auto max-w-3xl border border-border bg-card/40 p-8 sm:p-12">
          <div className="flex items-start justify-between gap-6">
            <div>
              <span className="font-sans text-[10px] tracking-[0.18em] text-[#6ae4ff]">
                REVIEW NODE / STANDBY
              </span>
              <h2 className="mt-5 font-sans text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
                Reviews are coming soon.
              </h2>
            </div>
            <MessageSquareQuote className="h-7 w-7 shrink-0 text-[#ff5a1f]" strokeWidth={1.4} />
          </div>
          <p className="mt-6 max-w-2xl font-sans text-sm leading-7 text-muted-foreground">
            We are collecting permission-based feedback from clients and partners.
            Published reviews will appear here once they are ready to share.
          </p>
          <Link
            href="/support"
            className="mt-8 inline-flex items-center border-b border-[#ff5a1f] pb-2 font-sans text-[10px] font-semibold tracking-[0.16em] text-foreground transition hover:border-[#6ae4ff] hover:text-[#6ae4ff]"
          >
            SHARE YOUR EXPERIENCE
          </Link>
        </div>
      </section>
    </main>
  );
}
