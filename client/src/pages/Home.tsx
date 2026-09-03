/**
 * Signal Furnace hero: an asymmetric cyberpunk command-deck viewport.
 * Cobalt-black space, Furnace Orange hierarchy, and compact sans-serif metadata
 * create a cinematic studio entry without decorative excess.
 */
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  ArrowUpRight,
  Crosshair,
  Menu,
  MoveDown,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import BrandMark from "@/components/BrandMark";
import { trpc } from "@/lib/trpc";

const heroArtwork = "/manus-storage/firebox-hero-tech-city_a9b6b884.png";
const headlineLines = ["MAKE THE", "SIGNAL", "UNMISSABLE."] as const;
const totalHeadlineLength = headlineLines.reduce(
  (total, line) => total + line.length,
  0
);

export default function Home() {
  const [typedCharacters, setTypedCharacters] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [highlightedSearchIndex, setHighlightedSearchIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const {
    data: siteSearchItems,
    isLoading: isSearchLoading,
    isError: isSearchError,
  } = trpc.search.list.useQuery();

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      setTypedCharacters(totalHeadlineLength);
      return;
    }

    let characterIndex = 0;
    let intervalId: number | undefined;
    const timeoutId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        characterIndex += 1;
        setTypedCharacters(characterIndex);

        if (characterIndex >= totalHeadlineLength && intervalId) {
          window.clearInterval(intervalId);
        }
      }, 52);
    }, 430);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    setHighlightedSearchIndex(0);
  }, [searchQuery]);

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const searchResults = normalizedSearchQuery
    ? (siteSearchItems ?? [])
        .filter(item =>
          `${item.title} ${item.description} ${item.category}`
            .toLowerCase()
            .includes(normalizedSearchQuery)
        )
        .slice(0, 8)
    : [];
  const showSearchDropdown = searchOpen && normalizedSearchQuery.length > 0;

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (searchResults.length > 0) {
        setSearchOpen(true);
        setHighlightedSearchIndex(index =>
          Math.min(index + 1, searchResults.length - 1)
        );
      }
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (searchResults.length > 0) {
        setHighlightedSearchIndex(index => Math.max(index - 1, 0));
      }
      return;
    }

    if (event.key === "Escape") {
      setSearchOpen(false);
      return;
    }

    if (event.key === "Enter" && searchResults[highlightedSearchIndex]) {
      event.preventDefault();
      window.location.href = searchResults[highlightedSearchIndex].href;
    }
  };

  const visibleCharactersForLine = (lineIndex: number) => {
    const charactersBeforeLine = headlineLines
      .slice(0, lineIndex)
      .reduce((total, line) => total + line.length, 0);
    return Math.min(
      Math.max(typedCharacters - charactersBeforeLine, 0),
      headlineLines[lineIndex].length
    );
  };

  const activeLineIndex = headlineLines.findIndex((line, index) => {
    const lineStart = headlineLines
      .slice(0, index)
      .reduce((total, item) => total + item.length, 0);
    return (
      typedCharacters >= lineStart && typedCharacters < lineStart + line.length
    );
  });

  return (
    <main
      id="top"
      className="min-h-svh overflow-hidden bg-background text-foreground"
    >
      <section
        aria-labelledby="hero-title"
        className="relative isolate flex min-h-svh flex-col overflow-hidden"
      >
        <div
          aria-hidden="true"
          className="hero-art absolute inset-0 -z-30 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroArtwork})` }}
        />
        <div
          aria-hidden="true"
          className="hero-overlay-horizontal absolute inset-0 -z-20"
        />
        <div
          aria-hidden="true"
          className="hero-overlay-vertical absolute inset-0 -z-20"
        />
        <div
          aria-hidden="true"
          className="signal-grid absolute inset-0 -z-10 opacity-50"
        />
        <div aria-hidden="true" className="scanlines absolute inset-0 -z-10" />

        <header className="relative z-20 flex items-center justify-between px-5 py-5 sm:px-8 sm:py-7 lg:px-12">
          <div className="flex w-full items-center justify-between gap-4">
            <BrandMark />
            <div className="flex items-center gap-4 sm:gap-5 lg:gap-6">
              <a
                href="/services"
                className="hidden items-center font-sans text-[10px] font-medium tracking-[0.12em] text-white transition duration-200 hover:text-[#ff5a1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a1f] lg:inline-flex"
              >
                SERVICES
              </a>
              <a
                href="/products"
                className="hidden items-center font-sans text-[10px] font-medium tracking-[0.12em] text-white transition duration-200 hover:text-[#ff5a1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a1f] lg:inline-flex"
              >
                PRODUCTS
              </a>
              <a
                href="/blog"
                className="hidden items-center font-sans text-[10px] font-medium tracking-[0.12em] text-white transition duration-200 hover:text-[#ff5a1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a1f] lg:inline-flex"
              >
                BLOG
              </a>
              <a
                href="/ask-ai"
                className="hidden items-center gap-2 font-sans text-[10px] font-medium tracking-[0.12em] text-[#6ae4ff] transition hover:text-[#ff5a1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a1f] lg:inline-flex"
              >
                ASK AI
              </a>
              <a
                href="/team"
                className="hidden items-center font-sans text-[10px] font-medium tracking-[0.12em] text-white transition hover:text-[#ff5a1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a1f] lg:inline-flex"
              >
                TEAM
              </a>
              <a
                href="/docs"
                className="hidden items-center font-sans text-[10px] font-medium tracking-[0.12em] text-white transition duration-200 hover:text-[#ff5a1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a1f] lg:inline-flex"
              >
                DOCS
              </a>
              <a
                href="/support"
                className="group hidden items-center gap-2 font-sans text-[10px] font-medium tracking-[0.14em] text-white transition duration-200 hover:text-[#ff5a1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a1f] sm:inline-flex"
              >
                SUPPORT
                <ArrowUpRight
                  className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  strokeWidth={2.2}
                />
              </a>
              <ThemeToggle />
              <button
                type="button"
                aria-label={
                  menuOpen ? "Close navigation menu" : "Open navigation menu"
                }
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(open => !open)}
                className="grid h-10 w-10 place-items-center text-white transition hover:text-[#ff5a1f] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a1f] sm:hidden"
              >
                {menuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          {menuOpen && (
            <div className="absolute right-5 top-[calc(100%-0.25rem)] z-30 w-[min(16rem,calc(100vw-2.5rem))] border border-white/15 bg-[#080c13]/95 p-2 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:hidden">
              <a
                href="/support"
                onClick={() => setMenuOpen(false)}
                className="group flex h-12 w-full items-center justify-between px-1 text-left font-sans text-[10px] font-semibold tracking-[0.14em] text-white transition hover:text-[#6ae4ff]"
              >
                SUPPORT
                <ArrowUpRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  strokeWidth={2.2}
                />
              </a>
              <a
                href="/services"
                onClick={() => setMenuOpen(false)}
                className="group flex h-12 w-full items-center justify-between px-1 text-left font-sans text-[10px] font-semibold tracking-[0.14em] text-white transition hover:text-[#6ae4ff]"
              >
                SERVICES
                <ArrowUpRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  strokeWidth={2.2}
                />
              </a>
              <a
                href="/products"
                onClick={() => setMenuOpen(false)}
                className="group flex h-12 w-full items-center justify-between px-1 text-left font-sans text-[10px] font-semibold tracking-[0.14em] text-white transition hover:text-[#6ae4ff]"
              >
                PRODUCTS
                <ArrowUpRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  strokeWidth={2.2}
                />
              </a>
              <a
                href="/blog"
                onClick={() => setMenuOpen(false)}
                className="group flex h-12 w-full items-center justify-between px-1 text-left font-sans text-[10px] font-semibold tracking-[0.14em] text-white transition hover:text-[#6ae4ff]"
              >
                BLOG
                <ArrowUpRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  strokeWidth={2.2}
                />
              </a>
              <a
                href="/ask-ai"
                onClick={() => setMenuOpen(false)}
                className="group flex h-12 w-full items-center justify-between px-1 text-left font-sans text-[10px] font-semibold tracking-[0.14em] text-[#6ae4ff] transition hover:text-white"
              >
                ASK AI
                <ArrowUpRight className="h-4 w-4" strokeWidth={2.2} />
              </a>
              <a
                href="/team"
                onClick={() => setMenuOpen(false)}
                className="group flex h-12 w-full items-center justify-between px-1 text-left font-sans text-[10px] font-semibold tracking-[0.14em] text-white transition hover:text-[#6ae4ff]"
              >
                TEAM
                <ArrowUpRight className="h-4 w-4" strokeWidth={2.2} />
              </a>
              <a
                href="/docs"
                onClick={() => setMenuOpen(false)}
                className="group flex h-12 w-full items-center justify-between px-1 text-left font-sans text-[10px] font-semibold tracking-[0.14em] text-white transition hover:text-[#6ae4ff]"
              >
                DOCS
                <ArrowUpRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  strokeWidth={2.2}
                />
              </a>
            </div>
          )}
        </header>

        <div className="relative z-10 flex flex-1 items-center px-5 pb-12 pt-14 sm:px-8 sm:pb-16 sm:pt-20 lg:px-12 lg:pb-20 lg:pt-24">
          <div className="flex max-w-[48rem] flex-col">
            <div className="hero-reveal hero-reveal-1 flex items-center gap-3 font-sans text-[10px] font-medium tracking-[0.2em] text-[#e7c6ba] sm:text-[11px]">
              <span className="inline-flex h-5 w-5 items-center justify-center border border-[#ff5a1f]/60 text-[#ff5a1f]">
                <Crosshair className="h-3 w-3" />
              </span>
              <span>EST. 2026 / GLOBAL TRANSMISSION</span>
              <span className="h-px w-10 bg-gradient-to-r from-[#ff5a1f] to-transparent" />
            </div>

            <h1
              id="hero-title"
              aria-label={headlineLines.join(" ")}
              className="hero-reveal hero-reveal-2 mt-7 max-w-3xl font-sans text-[clamp(3.5rem,8.5vw,7.8rem)] font-bold leading-[0.84] tracking-[-0.075em] text-[#f7f4ef]"
            >
              <span aria-hidden="true" className="type-line">
                {headlineLines[0].slice(0, visibleCharactersForLine(0))}
                {activeLineIndex === 0 && <span className="type-cursor" />}
              </span>
              <span
                aria-hidden="true"
                className="type-line mt-1 text-[#ff5a1f]"
              >
                {headlineLines[1].slice(0, visibleCharactersForLine(1))}
                {activeLineIndex === 1 && <span className="type-cursor" />}
              </span>
              <span
                aria-hidden="true"
                className="type-line mt-1 pl-[0.12em] text-[#f7f4ef]"
              >
                {headlineLines[2].slice(0, visibleCharactersForLine(2))}
                {activeLineIndex === 2 && <span className="type-cursor" />}
              </span>
            </h1>

            <form
              role="search"
              onSubmit={event => event.preventDefault()}
              className="hero-reveal hero-reveal-3 relative z-40 order-first mb-10 max-w-xl"
            >
              <label
                htmlFor="hero-site-search"
                className="mb-3 block font-sans text-[10px] font-medium tracking-[0.18em] text-[#9ba7b7]"
              >
                SEARCH THE SIGNAL
              </label>
              <div ref={searchRef} className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#6ae4ff]"
                  strokeWidth={1.8}
                />
                <input
                  id="hero-site-search"
                  type="search"
                  value={searchQuery}
                  onChange={event => {
                    setSearchQuery(event.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => {
                    if (normalizedSearchQuery) setSearchOpen(true);
                  }}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search services, products, support..."
                  autoComplete="off"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded={showSearchDropdown}
                  aria-controls="hero-search-results"
                  aria-activedescendant={
                    showSearchDropdown && searchResults[highlightedSearchIndex]
                      ? `hero-search-result-${highlightedSearchIndex}`
                      : undefined
                  }
                  className="h-14 w-full border border-white/30 bg-[#070b11] pl-12 pr-4 font-sans text-sm text-[#f7f4ef] outline-none transition placeholder:text-[#788597] hover:border-white/45 focus:border-[#6ae4ff] focus:ring-1 focus:ring-[#6ae4ff]/70"
                />
                {showSearchDropdown && (
                  <div
                    id="hero-search-results"
                    role="listbox"
                    aria-label="Search results"
                    className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-[min(28rem,calc(100svh-14rem))] overflow-y-auto overscroll-contain border border-[#6ae4ff]/60 bg-[#080c13] p-2 shadow-[0_18px_60px_rgba(0,0,0,0.75)]"
                  >
                    {isSearchLoading ? (
                      <p className="px-3 py-4 font-sans text-[10px] tracking-[0.12em] text-[#9ba7b7]">
                        SYNCING SITE CONTENT...
                      </p>
                    ) : isSearchError ? (
                      <p className="px-3 py-4 font-sans text-[10px] tracking-[0.12em] text-[#ffae8c]">
                        CONTENT NODE OFFLINE / TRY AGAIN
                      </p>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((item, index) => (
                        <a
                          id={`hero-search-result-${index}`}
                          key={item.id}
                          href={item.href}
                          role="option"
                          aria-selected={highlightedSearchIndex === index}
                          onMouseEnter={() => setHighlightedSearchIndex(index)}
                          className={`group flex items-center justify-between gap-4 border-b border-white/10 px-3 py-3 last:border-b-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[#6ae4ff] ${
                            highlightedSearchIndex === index
                              ? "bg-[#17202c]"
                              : "hover:bg-[#111922]"
                          }`}
                        >
                          <span className="min-w-0 text-left">
                            <span className="block truncate font-sans text-xs font-semibold tracking-[0.08em] text-[#f7f4ef] transition group-hover:text-[#6ae4ff]">
                              {item.title}
                            </span>
                            <span className="mt-1 block truncate font-sans text-[10px] leading-4 text-[#9ba7b7]">
                              {item.description}
                            </span>
                          </span>
                          <span className="shrink-0 font-sans text-[9px] tracking-[0.14em] text-[#ff5a1f]">
                            {item.category}
                          </span>
                        </a>
                      ))
                    ) : (
                      <p className="px-3 py-4 font-sans text-[10px] tracking-[0.12em] text-[#9ba7b7]">
                        NO SIGNALS FOUND / TRY ANOTHER QUERY
                      </p>
                    )}
                  </div>
                )}
              </div>
            </form>

            <div className="hero-reveal hero-reveal-3 mt-6 flex max-w-xl flex-col gap-6 sm:mt-8 sm:flex-row sm:items-end sm:gap-8">
              <p className="max-w-[23rem] border-l border-[#6ae4ff]/55 pl-4 font-sans text-[12px] leading-6 text-[#c7ced8] sm:text-[13px]">
                We turn creative ambition into high-voltage digital worlds,
                identities, and interactive experiences.
              </p>
              <a
                href="/support"
                className="group inline-flex w-fit items-center gap-4 border-b border-[#ff5a1f] pb-2 font-sans text-[11px] font-semibold tracking-[0.16em] text-[#fff7f2] outline-none transition duration-200 hover:border-[#6ae4ff] hover:text-[#6ae4ff] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#ff5a1f] focus-visible:ring-offset-4 focus-visible:ring-offset-[#05070b]"
              >
                START A TRANSMISSION
                <span className="grid h-7 w-7 place-items-center bg-[#ff5a1f] text-[#07090d] transition duration-200 group-hover:translate-x-1 group-hover:bg-[#6ae4ff]">
                  <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
                </span>
              </a>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col border-t border-border bg-background/72 px-5 py-4 backdrop-blur-md sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <div className="flex min-w-0 items-center gap-3 font-sans text-[10px] tracking-[0.16em] text-[#9ba7b7]">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff5a1f] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff5a1f]" />
            </span>
            <span className="hero-marquee-viewport min-w-0 md:overflow-visible">
              <span className="hero-marquee-track">
                <span>INTAKE WINDOW / OPEN</span>
                <span aria-hidden="true">INTAKE WINDOW / OPEN</span>
              </span>
            </span>
          </div>
          <div className="hero-marquee-viewport mt-4 min-w-0 overflow-hidden font-sans text-[10px] tracking-[0.14em] text-[#8a96a7] md:mt-0 md:overflow-visible">
            <div className="hero-marquee-track hero-marquee-track--capabilities">
              <span className="hero-marquee-set">
                <span>01 / DESIGN</span>
                <span>02 / DIGITAL</span>
                <span>03 / IMMERSIVE</span>
              </span>
              <span aria-hidden="true" className="hero-marquee-set">
                <span>01 / DESIGN</span>
                <span>02 / DIGITAL</span>
                <span>03 / IMMERSIVE</span>
              </span>
            </div>
          </div>
          <a
            href="#top"
            className="group mt-4 inline-flex items-center gap-2 self-start font-sans text-[10px] tracking-[0.16em] text-[#dce3ec] outline-none transition hover:text-[#ff5a1f] focus-visible:ring-2 focus-visible:ring-[#ff5a1f] md:mt-0 md:self-auto"
          >
            SCROLL TO IGNITE
            <MoveDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-y-0.5" />
          </a>
        </div>

        <div
          aria-hidden="true"
          className="absolute bottom-24 right-5 z-10 hidden items-center gap-3 md:flex lg:right-12"
        >
          <span className="font-sans text-[9px] tracking-[0.18em] text-[#8fa0b4]">
            FURNACE // 01
          </span>
          <span className="h-px w-16 bg-[#6ae4ff]/60" />
          <Sparkles className="h-3.5 w-3.5 text-[#6ae4ff]" />
        </div>
      </section>
    </main>
  );
}
