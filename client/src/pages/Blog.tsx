import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import { Link } from "wouter";
import ThemeToggle from "@/components/ThemeToggle";
import BrandMark from "@/components/BrandMark";

type BlogPost = {
  category: string;
  date: string;
  readTime: string;
  title: string;
  excerpt: string;
};

const posts: BlogPost[] = [
  {
    category: "BUILD LOG",
    date: "SEP 03, 2026",
    readTime: "5 MIN READ",
    title: "Designing digital systems that feel alive",
    excerpt:
      "Why strong interfaces need more than polish: they need rhythm, hierarchy, and a point of view that users can feel.",
  },
  {
    category: "FIELD NOTES",
    date: "AUG 26, 2026",
    readTime: "4 MIN READ",
    title: "From signal to system",
    excerpt:
      "A practical look at how Firebox turns an early creative signal into a reliable product, brand, or interactive experience.",
  },
  {
    category: "TECHNOLOGY",
    date: "AUG 14, 2026",
    readTime: "6 MIN READ",
    title: "The case for a sharper web",
    excerpt:
      "Performance, accessibility, and visual ambition are not competing goals. The best digital work makes them reinforce each other.",
  },
];

export default function Blog() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <BrandMark />
      <header className="border-b border-border bg-background/90 px-5 py-5 backdrop-blur-xl sm:px-8 lg:px-12">
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
            <span className="font-sans text-[10px] tracking-[0.18em] text-[#6ae4ff]">
              01 / TRANSMISSION LOG
            </span>
            <h1 className="mt-4 font-sans text-5xl font-bold tracking-[-0.06em] sm:text-7xl">
              THE BLOG
            </h1>
            <p className="mt-6 max-w-2xl font-sans text-xs leading-6 text-muted-foreground sm:text-sm">
              Ideas, field notes, and build logs from the people making the
              signal unmissable.
            </p>
          </div>
          <BookOpen
            className="hidden h-10 w-10 shrink-0 text-[#ff5a1f] sm:block"
            strokeWidth={1.5}
          />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {posts.map((post, index) => (
            <article
              key={post.title}
              className="group flex min-h-[22rem] flex-col justify-between border border-border bg-card p-6 transition hover:border-[#ff5a1f]/70 sm:p-8"
            >
              <div>
                <div className="flex items-center justify-between gap-4 font-sans text-[10px] tracking-[0.14em] text-[#ff5a1f]">
                  <span>
                    0{index + 1} / {post.category}
                  </span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
                <h2 className="mt-10 font-sans text-3xl font-semibold leading-[0.98] tracking-[-0.05em]">
                  {post.title}
                </h2>
                <p className="mt-5 font-sans text-xs leading-6 text-muted-foreground">
                  {post.excerpt}
                </p>
              </div>
              <div className="mt-10 flex items-center justify-between border-t border-border pt-4 font-sans text-[9px] tracking-[0.12em] text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5 text-[#6ae4ff]" />{" "}
                  {post.date}
                </span>
                <span>{post.readTime}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <footer className="border-t border-border px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between font-sans text-[10px] tracking-[0.14em] text-muted-foreground">
          <span>FIREBOX TECH / TRANSMISSION LOG</span>
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-[#6ae4ff]" /> SIGNAL IS LIVE
          </span>
        </div>
      </footer>
    </main>
  );
}
