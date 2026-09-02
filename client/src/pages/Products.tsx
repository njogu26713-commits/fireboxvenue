import {
  ArrowLeft,
  ArrowUpRight,
  ExternalLink,
  Github,
  Layers3,
  Sparkles,
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import ThemeToggle from "@/components/ThemeToggle";
import BrandMark from "@/components/BrandMark";

function CardLinks({
  liveUrl,
  githubUrl,
}: {
  liveUrl?: string | null;
  githubUrl?: string | null;
}) {
  if (!liveUrl && !githubUrl) return null;
  return (
    <div className="flex items-center gap-3">
      {liveUrl && (
        <a
          href={liveUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Open product live site"
          className="text-muted-foreground transition hover:text-[#6ae4ff]"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
      {githubUrl && (
        <a
          href={githubUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Open product GitHub repository"
          className="text-muted-foreground transition hover:text-[#6ae4ff]"
        >
          <Github className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}

export default function Products() {
  const { data, isLoading, isError } = trpc.content.list.useQuery();
  const products = data?.services ?? [];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <BrandMark />
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 px-5 py-5 backdrop-blur-xl sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.14em] text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> RETURN TO HERO
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
        <div className="flex items-end justify-between gap-6 border-b border-border pb-6">
          <div>
            <span className="font-sans text-[10px] tracking-[0.18em] text-[#ff5a1f]">
              01 / PRODUCTS
            </span>
            <h1 className="mt-4 font-sans text-5xl font-bold tracking-[-0.06em] sm:text-7xl">
              PRODUCTS
            </h1>
            <p className="mt-6 max-w-2xl font-sans text-xs leading-6 text-muted-foreground sm:text-sm">
              Products and digital systems built by the Firebox team. This page
              is managed from the Admin workspace.
            </p>
          </div>
          <Layers3
            className="hidden h-10 w-10 shrink-0 text-[#ff5a1f] sm:block"
            strokeWidth={1.5}
          />
        </div>

        {isLoading && (
          <p className="mt-10 font-sans text-xs tracking-[0.12em] text-muted-foreground">
            SYNCING PRODUCTS NODE...
          </p>
        )}
        {isError && (
          <p className="mt-10 border border-[#ff5a1f]/30 bg-[#ff5a1f]/5 px-4 py-4 font-sans text-[10px] tracking-[0.12em] text-[#ffae8c]">
            PRODUCTS NODE OFFLINE / RETRY THE CONNECTION
          </p>
        )}
        {!isLoading && !isError && products.length === 0 && (
          <div className="mt-10 border border-border bg-card p-6 sm:p-8">
            <div className="flex items-center gap-3 font-sans text-[10px] tracking-[0.14em] text-muted-foreground">
              NO PRODUCTS PUBLISHED YET
            </div>
            <p className="mt-3 max-w-xl font-sans text-xs leading-6 text-muted-foreground">
              The Admin workspace is ready for the team to publish the first
              service.
            </p>
          </div>
        )}
        {!isLoading && !isError && products.length > 0 && (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((service, index) => (
              <article
                key={service.id}
                className="group border border-border bg-card transition hover:border-[#ff5a1f]/70"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={
                      service.imageUrl ||
                      "/manus-storage/firebox-network-atrium_1879ff5e.png"
                    }
                    alt=""
                    className="h-full w-full object-cover opacity-75 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                  <span className="absolute left-4 top-4 font-sans text-[10px] tracking-[0.15em] text-foreground">
                    0{index + 1} / PRODUCT
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between gap-4 font-sans text-[10px] tracking-[0.14em] text-[#ff5a1f]">
                    <span>FIREBOX TECH</span>
                    <CardLinks
                      liveUrl={service.liveUrl}
                      githubUrl={service.githubUrl}
                    />
                  </div>
                  <h2 className="mt-4 font-sans text-2xl font-semibold tracking-[-0.04em]">
                    {service.title}
                  </h2>
                  <p className="mt-3 font-sans text-xs leading-6 text-muted-foreground">
                    {service.description}
                  </p>
                  {service.liveUrl && (
                    <a
                      href={service.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-6 inline-flex items-center gap-2 font-sans text-[10px] font-semibold tracking-[0.14em] text-[#6ae4ff]"
                    >
                      OPEN PRODUCT <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-border px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between font-sans text-[10px] tracking-[0.14em] text-muted-foreground">
          <span>FIREBOX TECH / PRODUCTS NODE</span>
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-[#6ae4ff]" /> SIGNAL IS LIVE
          </span>
        </div>
      </footer>
    </main>
  );
}
