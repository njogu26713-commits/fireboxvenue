import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import { Link, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import ThemeToggle from "@/components/ThemeToggle";
import BrandMark from "@/components/BrandMark";
import { Streamdown } from "streamdown";

function videoSource(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    if (parsed.hostname === "youtu.be")
      return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
    if (parsed.hostname.includes("vimeo.com"))
      return `https://player.vimeo.com/video/${parsed.pathname.split("/").filter(Boolean).pop()}`;
  } catch {
    return url;
  }
  return url;
}

function VideoPlayer({ url }: { url: string }) {
  const embedUrl = videoSource(url);
  const isDirect = /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
  return isDirect ? (
    <video
      controls
      className="mt-10 w-full border border-border bg-black"
      src={url}
    >
      Your browser does not support video playback.
    </video>
  ) : (
    <iframe
      title="Blog tutorial video"
      src={embedUrl}
      className="mt-10 aspect-video w-full border border-border bg-black"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/90 px-5 py-5 backdrop-blur-xl sm:px-8 lg:px-12">
        <div className="flex w-full items-center justify-between gap-4">
          <BrandMark />
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.14em] text-muted-foreground transition hover:text-[#ff5a1f]"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> BACK TO HOME
          </Link>
          <ThemeToggle />
        </div>
      </header>
      {children}
      <footer className="border-t border-border px-5 py-8 sm:px-8 lg:px-12">
        <div className="flex w-full items-center justify-between font-sans text-[10px] tracking-[0.14em] text-muted-foreground">
          <span>FIREBOX TECH / TRANSMISSION LOG</span>
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-[#6ae4ff]" /> SIGNAL IS LIVE
          </span>
        </div>
      </footer>
    </main>
  );
}

export default function Blog() {
  const { data: posts, isLoading, isError } = trpc.blog.list.useQuery();
  return (
    <PageShell>
      <div className="w-full px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
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
        {isLoading && (
          <p className="mt-10 font-sans text-xs tracking-[0.12em] text-muted-foreground">
            SYNCING TRANSMISSION LOG...
          </p>
        )}
        {isError && (
          <p className="mt-10 border border-[#ff5a1f]/30 bg-[#ff5a1f]/5 px-4 py-4 font-sans text-[10px] tracking-[0.12em] text-[#ffae8c]">
            BLOG NODE OFFLINE / RETRY THE CONNECTION
          </p>
        )}
        {!isLoading && !isError && posts?.length === 0 && (
          <div className="mt-10 border border-border bg-card p-6 sm:p-8">
            <p className="font-sans text-[10px] tracking-[0.14em] text-muted-foreground">
              NO PUBLISHED POSTS YET
            </p>
            <p className="mt-3 font-sans text-xs leading-6 text-muted-foreground">
              The next transmission will appear here when it is published from
              Admin.
            </p>
          </div>
        )}
        {!isLoading && !isError && (posts?.length ?? 0) > 0 && (
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {posts?.map((post, index) => (
              <article
                key={post.id}
                className="group flex min-h-[22rem] flex-col justify-between border border-border bg-card p-6 transition hover:border-[#ff5a1f]/70 sm:p-8"
              >
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt=""
                    className="-mx-6 -mt-6 mb-6 h-40 w-[calc(100%+3rem)] object-cover opacity-80 sm:-mx-8 sm:-mt-8 sm:mb-8 sm:h-48 sm:w-[calc(100%+4rem)]"
                  />
                )}
                {post.videoUrl && (
                  <div className="mb-6 border border-[#6ae4ff]/20 bg-[#6ae4ff]/5 px-3 py-2 font-sans text-[9px] tracking-[0.12em] text-[#6ae4ff]">
                    VIDEO TUTORIAL AVAILABLE
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between gap-4 font-sans text-[10px] tracking-[0.14em] text-[#ff5a1f]">
                    <span>
                      0{index + 1} /{" "}
                      {post.category.replace("-", " ").toUpperCase()}
                    </span>
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                  <h2 className="mt-8 font-sans text-3xl font-semibold leading-[0.98] tracking-[-0.05em]">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="transition hover:text-[#ff5a1f]"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-5 font-sans text-xs leading-6 text-muted-foreground">
                    {post.excerpt}
                  </p>
                </div>
                <div className="mt-10 flex items-center justify-between border-t border-border pt-4 font-sans text-[9px] tracking-[0.12em] text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5 text-[#6ae4ff]" />{" "}
                    {new Date(
                      post.publishedAt ?? post.createdAt
                    ).toLocaleDateString()}
                  </span>
                  <span>{post.author}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}

export function BlogPost() {
  const [, params] = useRoute<{ slug: string }>("/blog/:slug");
  const {
    data: post,
    isLoading,
    isError,
  } = trpc.blog.getBySlug.useQuery(
    { slug: params?.slug ?? "" },
    { enabled: Boolean(params?.slug) }
  );
  if (isLoading)
    return (
      <PageShell>
        <div className="w-full px-5 py-24 font-sans text-xs tracking-[0.12em] text-muted-foreground sm:px-8 lg:px-12">
          SYNCING ARTICLE...
        </div>
      </PageShell>
    );
  if (isError || !post)
    return (
      <PageShell>
        <div className="w-full px-5 py-24 sm:px-8 lg:px-12">
          <p className="font-sans text-xs tracking-[0.12em] text-[#ffae8c]">
            ARTICLE NOT FOUND
          </p>
          <Link
            href="/blog"
            className="mt-6 inline-flex items-center gap-2 font-sans text-xs text-[#6ae4ff] transition hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> BACK TO BLOG
          </Link>
        </div>
      </PageShell>
    );
  return (
    <PageShell>
      <article className="w-full px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.14em] text-[#6ae4ff] transition hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> BACK TO BLOG
        </Link>
        <span className="mt-12 block font-sans text-[10px] tracking-[0.18em] text-[#ff5a1f]">
          TRANSMISSION / {post.category.replace("-", " ").toUpperCase()} /{" "}
          {post.author}
        </span>
        <h1 className="mt-4 font-sans text-5xl font-bold leading-[0.95] tracking-[-0.06em] sm:text-7xl">
          {post.title}
        </h1>
        <div className="mt-6 flex items-center gap-4 font-sans text-[10px] tracking-[0.12em] text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5 text-[#6ae4ff]" />{" "}
            {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString()}
          </span>
          <span>{post.slug}</span>
        </div>
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt=""
            className="mt-10 max-h-[32rem] w-full object-cover"
          />
        )}
        {post.videoUrl && <VideoPlayer url={post.videoUrl} />}
        <div className="prose prose-sm dark:prose-invert mt-10 max-w-none border-t border-border pt-8 font-sans leading-8 text-muted-foreground">
          <Streamdown>{post.content}</Streamdown>
        </div>
      </article>
    </PageShell>
  );
}
