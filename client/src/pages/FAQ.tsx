import { ArrowLeft, HelpCircle, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import ThemeToggle from "@/components/ThemeToggle";
import BrandMark from "@/components/BrandMark";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  const { data: faqs, isLoading, isError } = trpc.faq.list.useQuery();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <BrandMark />
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 px-5 py-5 backdrop-blur-xl sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-end gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 border border-white/20 bg-white/[0.04] px-3 py-2 font-sans text-[10px] tracking-[0.14em] text-muted-foreground transition hover:border-[#ff5a1f] hover:bg-[#ff5a1f]/10 hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> BACK TO HOME
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="flex items-end justify-between gap-6 border-b border-border pb-6">
          <div>
            <span className="font-sans text-[10px] tracking-[0.18em] text-[#ff5a1f]">
              01 / KNOWLEDGE NODE
            </span>
            <h1 className="mt-4 font-sans text-5xl font-bold tracking-[-0.06em] sm:text-7xl">
              FREQUENTLY ASKED.
            </h1>
            <p className="mt-6 max-w-2xl font-sans text-xs leading-6 text-muted-foreground sm:text-sm">
              Clear answers to the questions we hear most. The Firebox team can
              update this knowledge node from the Admin workspace.
            </p>
          </div>
          <HelpCircle
            className="hidden h-10 w-10 shrink-0 text-[#6ae4ff] sm:block"
            strokeWidth={1.5}
          />
        </div>

        {isLoading && (
          <p className="mt-10 font-sans text-xs tracking-[0.12em] text-muted-foreground">
            SYNCING KNOWLEDGE NODE...
          </p>
        )}
        {isError && (
          <p className="mt-10 border border-[#ff5a1f]/30 bg-[#ff5a1f]/5 px-4 py-4 font-sans text-[10px] tracking-[0.12em] text-[#ffae8c]">
            FAQ NODE OFFLINE / RETRY THE CONNECTION
          </p>
        )}
        {!isLoading && !isError && faqs?.length === 0 && (
          <div className="mt-10 border border-border bg-card p-6 sm:p-8">
            <p className="font-sans text-[10px] tracking-[0.14em] text-muted-foreground">
              NO FAQ ENTRIES PUBLISHED YET
            </p>
            <p className="mt-3 max-w-xl font-sans text-xs leading-6 text-muted-foreground">
              The Admin workspace is ready for the team to write and publish the
              first answers.
            </p>
          </div>
        )}
        {!isLoading && !isError && (faqs?.length ?? 0) > 0 && (
          <Accordion
            type="single"
            collapsible
            className="mt-10 border-t border-border"
          >
            {faqs?.map((faq, index) => (
              <AccordionItem
                key={faq.id}
                value={String(faq.id)}
                className="border-border"
              >
                <AccordionTrigger className="gap-6 py-6 font-sans text-lg font-semibold tracking-[-0.025em] hover:no-underline sm:text-xl">
                  <span className="flex items-start gap-4 text-left">
                    <span className="pt-1 font-sans text-[10px] font-medium tracking-[0.12em] text-[#ff5a1f]">
                      0{index + 1}
                    </span>
                    <span>{faq.question}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pl-10 pr-8 font-sans text-xs leading-6 text-muted-foreground sm:text-sm">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      <footer className="border-t border-border px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-4xl items-center justify-between font-sans text-[10px] tracking-[0.14em] text-muted-foreground">
          <span>FIREBOX TECH / KNOWLEDGE NODE</span>
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-[#6ae4ff]" /> SIGNAL IS LIVE
          </span>
        </div>
      </footer>
    </main>
  );
}
