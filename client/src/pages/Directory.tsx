import { ArrowLeft, ArrowUpRight, BookOpen, Boxes, Code2, FileText, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import ThemeToggle from "@/components/ThemeToggle";

type DirectorySection = "products" | "developers" | "docs";

type DirectoryPageProps = {
  section: DirectorySection;
};

const sectionCopy: Record<DirectorySection, { eyebrow: string; title: string; description: string; empty: string; icon: typeof Boxes }> = {
  products: {
    eyebrow: "01 / PRODUCT NODE",
    title: "PRODUCTS",
    description: "Tools and systems built by the Firebox team. The Admin workspace controls what appears here.",
    empty: "NO PRODUCTS PUBLISHED YET",
    icon: Boxes,
  },
  developers: {
    eyebrow: "02 / DEVELOPER NODE",
    title: "DEVELOPERS",
    description: "Resources for building with the Firebox stack, from starter tools to integration guides.",
    empty: "NO DEVELOPER RESOURCES PUBLISHED YET",
    icon: Code2,
  },
  docs: {
    eyebrow: "03 / DOCUMENTATION NODE",
    title: "DOCUMENTATION",
    description: "Reference material and practical notes for navigating the Firebox ecosystem.",
    empty: "NO DOCUMENTATION PUBLISHED YET",
    icon: BookOpen,
  },
};

export default function Directory({ section }: DirectoryPageProps) {
  const copy = sectionCopy[section];
  const Icon = copy.icon;
  const { data: items, isLoading, isError } = trpc.directory.list.useQuery({ section });

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 px-5 py-5 backdrop-blur-xl sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="group inline-flex items-center gap-3 font-[Space_Grotesk] text-sm font-bold tracking-[0.13em] text-foreground outline-none transition hover:text-[#ff5a1f] focus-visible:ring-2 focus-visible:ring-[#ff5a1f]">
            <span className="grid h-9 w-9 place-items-center border border-[#ff5a1f]/60 text-[#ff5a1f]">F//</span>
            FIREBOX<span className="text-[#ff5a1f]">//</span>STUDIOS
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/" className="hidden items-center gap-2 font-[IBM_Plex_Mono] text-[10px] tracking-[0.14em] text-muted-foreground transition hover:text-foreground sm:inline-flex">
              <ArrowLeft className="h-3.5 w-3.5" /> RETURN TO HERO
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
        <div className="flex items-end justify-between gap-6 border-b border-border pb-6">
          <div>
            <span className="font-[IBM_Plex_Mono] text-[10px] tracking-[0.18em] text-[#ff5a1f]">{copy.eyebrow}</span>
            <h1 className="mt-4 font-[Space_Grotesk] text-5xl font-bold tracking-[-0.06em] sm:text-7xl">{copy.title}</h1>
            <p className="mt-6 max-w-2xl font-[IBM_Plex_Mono] text-xs leading-6 text-muted-foreground sm:text-sm">{copy.description}</p>
          </div>
          <Icon className="hidden h-10 w-10 shrink-0 text-[#6ae4ff] sm:block" strokeWidth={1.5} />
        </div>

        {isLoading && <p className="mt-10 font-[IBM_Plex_Mono] text-xs tracking-[0.12em] text-muted-foreground">SYNCING {copy.title} NODE...</p>}
        {isError && <p className="mt-10 border border-[#ff5a1f]/30 bg-[#ff5a1f]/5 px-4 py-4 font-[IBM_Plex_Mono] text-[10px] tracking-[0.12em] text-[#ffae8c]">{copy.title} NODE OFFLINE / RETRY THE CONNECTION</p>}
        {!isLoading && !isError && items?.length === 0 && (
          <div className="mt-10 border border-border bg-card p-6 sm:p-8">
            <div className="flex items-center gap-3 font-[IBM_Plex_Mono] text-[10px] tracking-[0.14em] text-muted-foreground"><FileText className="h-4 w-4 text-[#ff5a1f]" /> {copy.empty}</div>
            <p className="mt-3 max-w-xl font-[IBM_Plex_Mono] text-xs leading-6 text-muted-foreground">The Admin workspace is ready for the team to publish the first entry.</p>
          </div>
        )}
        {!isLoading && !isError && (items?.length ?? 0) > 0 && (
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {items?.map((item, index) => (
              <article key={item.id} className="group flex min-h-56 flex-col justify-between border border-border bg-card p-6 transition hover:border-[#ff5a1f]/60 sm:p-8">
                <div>
                  <div className="flex items-center justify-between gap-4 font-[IBM_Plex_Mono] text-[10px] tracking-[0.14em] text-[#ff5a1f]"><span>0{index + 1} / {section.toUpperCase()}</span><Icon className="h-4 w-4 text-[#6ae4ff]" /></div>
                  <h2 className="mt-7 font-[Space_Grotesk] text-2xl font-semibold tracking-[-0.04em]">{item.title}</h2>
                  <p className="mt-3 font-[IBM_Plex_Mono] text-xs leading-6 text-muted-foreground">{item.description}</p>
                </div>
                {item.href && <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noreferrer" : undefined} className="group/link mt-8 inline-flex w-fit items-center gap-3 border-b border-[#ff5a1f] pb-2 font-[IBM_Plex_Mono] text-[10px] font-semibold tracking-[0.14em] text-foreground transition hover:border-[#6ae4ff] hover:text-[#6ae4ff]">OPEN RESOURCE <ArrowUpRight className="h-4 w-4 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" /></a>}
              </article>
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-border px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between font-[IBM_Plex_Mono] text-[10px] tracking-[0.14em] text-muted-foreground"><span>FIREBOX TECH / {copy.title} NODE</span><span className="inline-flex items-center gap-2"><Sparkles className="h-3 w-3 text-[#6ae4ff]" /> SIGNAL IS LIVE</span></div>
      </footer>
    </main>
  );
}

export function Products() {
  return <Directory section="products" />;
}

export function Developers() {
  return <Directory section="developers" />;
}

export function Documentation() {
  return <Directory section="docs" />;
}
