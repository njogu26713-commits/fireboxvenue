/**
 * Signal Furnace hero: an asymmetric cyberpunk command-deck viewport.
 * Cobalt-black space, Furnace Orange hierarchy, and compact IBM Plex Mono metadata
 * create a cinematic studio entry without decorative excess.
 */
import { useEffect, useState } from "react";
import { ArrowUpRight, Crosshair, Menu, MoveDown, Sparkles, X } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const heroArtwork = "/manus-storage/firebox-hero-tech-city_a9b6b884.png";
const logoGlyph = "/manus-storage/firebox-ember-glyph_1302f74c.png";
const headlineLines = ["MAKE THE", "SIGNAL", "UNMISSABLE."] as const;
const totalHeadlineLength = headlineLines.reduce((total, line) => total + line.length, 0);

export default function Home() {
  const [typedCharacters, setTypedCharacters] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  const visibleCharactersForLine = (lineIndex: number) => {
    const charactersBeforeLine = headlineLines
      .slice(0, lineIndex)
      .reduce((total, line) => total + line.length, 0);
    return Math.min(
      Math.max(typedCharacters - charactersBeforeLine, 0),
      headlineLines[lineIndex].length,
    );
  };

  const activeLineIndex = headlineLines.findIndex((line, index) => {
    const lineStart = headlineLines.slice(0, index).reduce((total, item) => total + item.length, 0);
    return typedCharacters >= lineStart && typedCharacters < lineStart + line.length;
  });

  return (
    <main id="top" className="min-h-svh overflow-hidden bg-background text-foreground">
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
        <div aria-hidden="true" className="signal-grid absolute inset-0 -z-10 opacity-50" />
        <div aria-hidden="true" className="scanlines absolute inset-0 -z-10" />

        <header className="relative z-20 flex items-center justify-between px-5 py-5 sm:px-8 sm:py-7 lg:px-12">
          <a
            href="#top"
            aria-label="fireboxStudios home"
            className="group flex items-center gap-3 rounded-sm outline-none transition-opacity duration-200 hover:opacity-85 focus-visible:ring-2 focus-visible:ring-[#ff5a1f] focus-visible:ring-offset-4 focus-visible:ring-offset-[#05070b]"
          >
            <span className="relative grid h-11 w-11 place-items-center overflow-hidden border border-[#ff5a1f]/45 bg-[#0b1018]/80 p-1.5 shadow-[0_0_28px_rgba(255,90,31,0.17)] backdrop-blur-sm sm:h-12 sm:w-12">
              <img
                src={logoGlyph}
                alt=""
                className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-110"
              />
            </span>
            <span className="leading-none">
              <span className="block font-[Space_Grotesk] text-sm font-bold tracking-[0.13em] text-white sm:text-base">
                FIREBOX<span className="text-[#ff5a1f]">//</span>STUDIOS
              </span>
              <span className="mt-1.5 block font-[IBM_Plex_Mono] text-[9px] font-medium tracking-[0.18em] text-[#93a1b4] sm:text-[10px]">
                CREATIVE TECHNOLOGY UNIT
              </span>
            </span>
          </a>

          <div className="flex items-center gap-2 sm:gap-3 lg:gap-5">
            <a href="/solutions" className="group hidden h-10 items-center gap-2 border border-white/20 bg-white/[0.06] px-3.5 font-[IBM_Plex_Mono] text-[10px] font-medium tracking-[0.14em] text-white backdrop-blur-md transition duration-200 hover:border-[#ff5a1f]/80 hover:bg-[#ff5a1f] hover:text-[#07090d] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a1f] focus-visible:ring-offset-4 focus-visible:ring-offset-[#05070b] sm:inline-flex sm:h-11 sm:px-4">
              SOLUTIONS
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2.2} />
            </a>
            <span className="hidden font-[IBM_Plex_Mono] text-[10px] tracking-[0.16em] text-[#aeb7c5] lg:block">
              SYS // ONLINE
            </span>
            <a
              href="/support"
              className="group hidden h-10 items-center gap-2 border border-white/20 bg-white/[0.06] px-3.5 font-[IBM_Plex_Mono] text-[10px] font-medium tracking-[0.14em] text-white backdrop-blur-md transition duration-200 hover:border-[#ff5a1f]/80 hover:bg-[#ff5a1f] hover:text-[#07090d] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a1f] focus-visible:ring-offset-4 focus-visible:ring-offset-[#05070b] sm:inline-flex sm:h-11 sm:px-4"
            >
              OPEN CHANNEL
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2.2} />
            </a>
            <ThemeToggle />
            <button
              type="button"
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(open => !open)}
              className="grid h-10 w-10 place-items-center border border-white/20 bg-white/[0.06] text-white backdrop-blur-md transition duration-200 hover:border-[#ff5a1f]/80 hover:text-[#ff5a1f] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a1f] sm:hidden"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
          {menuOpen && (
            <div className="absolute right-5 top-[calc(100%-0.25rem)] z-30 w-[min(16rem,calc(100vw-2.5rem))] border border-white/15 bg-[#080c13]/95 p-2 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:hidden">
              <a href="/solutions" onClick={() => setMenuOpen(false)} className="group flex h-12 items-center justify-between border border-[#ff5a1f]/70 bg-[#ff5a1f] px-3.5 font-[IBM_Plex_Mono] text-[10px] font-semibold tracking-[0.14em] text-[#07090d] transition hover:bg-[#6ae4ff]">
                SOLUTIONS
                <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2.2} />
              </a>
              <a href="/support" onClick={() => setMenuOpen(false)} className="group mt-2 flex h-12 w-full items-center justify-between border border-white/20 bg-white/[0.06] px-3.5 text-left font-[IBM_Plex_Mono] text-[10px] font-semibold tracking-[0.14em] text-white transition hover:border-[#6ae4ff] hover:text-[#6ae4ff]">
                OPEN CHANNEL
                <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2.2} />
              </a>
            </div>
          )}
        </header>

        <div className="relative z-10 flex flex-1 items-center px-5 pb-12 pt-14 sm:px-8 sm:pb-16 sm:pt-20 lg:px-12 lg:pb-20 lg:pt-24">
          <div className="max-w-[48rem]">
            <div className="hero-reveal hero-reveal-1 flex items-center gap-3 font-[IBM_Plex_Mono] text-[10px] font-medium tracking-[0.2em] text-[#e7c6ba] sm:text-[11px]">
              <span className="inline-flex h-5 w-5 items-center justify-center border border-[#ff5a1f]/60 text-[#ff5a1f]">
                <Crosshair className="h-3 w-3" />
              </span>
              <span>EST. 2026 / GLOBAL TRANSMISSION</span>
              <span className="h-px w-10 bg-gradient-to-r from-[#ff5a1f] to-transparent" />
            </div>

            <h1
              id="hero-title"
              aria-label={headlineLines.join(" ")}
              className="hero-reveal hero-reveal-2 mt-7 max-w-3xl font-[Space_Grotesk] text-[clamp(3.5rem,8.5vw,7.8rem)] font-bold leading-[0.84] tracking-[-0.075em] text-[#f7f4ef]"
            >
              <span aria-hidden="true" className="type-line">
                {headlineLines[0].slice(0, visibleCharactersForLine(0))}
                {activeLineIndex === 0 && <span className="type-cursor" />}
              </span>
              <span aria-hidden="true" className="type-line mt-1 text-[#ff5a1f]">
                {headlineLines[1].slice(0, visibleCharactersForLine(1))}
                {activeLineIndex === 1 && <span className="type-cursor" />}
              </span>
              <span aria-hidden="true" className="type-line mt-1 pl-[0.12em] text-[#f7f4ef]">
                {headlineLines[2].slice(0, visibleCharactersForLine(2))}
                {activeLineIndex === 2 && <span className="type-cursor" />}
              </span>
            </h1>

            <div className="hero-reveal hero-reveal-3 mt-8 flex max-w-xl flex-col gap-6 sm:mt-10 sm:flex-row sm:items-end sm:gap-8">
              <p className="max-w-[23rem] border-l border-[#6ae4ff]/55 pl-4 font-[IBM_Plex_Mono] text-[12px] leading-6 text-[#c7ced8] sm:text-[13px]">
                We turn creative ambition into high-voltage digital worlds, identities, and interactive experiences.
              </p>
              <a
                href="/support"
                className="group inline-flex w-fit items-center gap-4 border-b border-[#ff5a1f] pb-2 font-[IBM_Plex_Mono] text-[11px] font-semibold tracking-[0.16em] text-[#fff7f2] outline-none transition duration-200 hover:border-[#6ae4ff] hover:text-[#6ae4ff] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#ff5a1f] focus-visible:ring-offset-4 focus-visible:ring-offset-[#05070b]"
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
          <div className="flex items-center gap-3 font-[IBM_Plex_Mono] text-[10px] tracking-[0.16em] text-[#9ba7b7]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff5a1f] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff5a1f]" />
            </span>
            INTAKE WINDOW / OPEN
          </div>
          <div className="mt-4 flex items-center gap-7 font-[IBM_Plex_Mono] text-[10px] tracking-[0.14em] text-[#8a96a7] md:mt-0">
            <span>01 / DESIGN</span>
            <span>02 / DIGITAL</span>
            <span className="hidden sm:inline">03 / IMMERSIVE</span>
          </div>
          <a
            href="#top"
            className="group mt-4 inline-flex items-center gap-2 self-start font-[IBM_Plex_Mono] text-[10px] tracking-[0.16em] text-[#dce3ec] outline-none transition hover:text-[#ff5a1f] focus-visible:ring-2 focus-visible:ring-[#ff5a1f] md:mt-0 md:self-auto"
          >
            SCROLL TO IGNITE
            <MoveDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-y-0.5" />
          </a>
        </div>

        <div aria-hidden="true" className="absolute bottom-24 right-5 z-10 hidden items-center gap-3 md:flex lg:right-12">
          <span className="font-[IBM_Plex_Mono] text-[9px] tracking-[0.18em] text-[#8fa0b4]">FURNACE // 01</span>
          <span className="h-px w-16 bg-[#6ae4ff]/60" />
          <Sparkles className="h-3.5 w-3.5 text-[#6ae4ff]" />
        </div>
      </section>
    </main>
  );
}
