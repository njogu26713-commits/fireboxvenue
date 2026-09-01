/**
 * Signal Furnace hero: an asymmetric cyberpunk command-deck viewport.
 * Cobalt-black space, Furnace Orange hierarchy, and compact IBM Plex Mono metadata
 * create a cinematic studio entry without decorative excess.
 */
import { ArrowUpRight, Crosshair, MoveDown, Sparkles } from "lucide-react";
import { toast } from "sonner";

const heroArtwork = "/manus-storage/firebox-hero-tech-city_a9b6b884.png";
const logoGlyph = "/manus-storage/firebox-ember-glyph_1302f74c.png";

function notifyChannel() {
  toast("Studio channel is standing by", {
    description: "Contact details can be connected here when they are ready.",
  });
}

export default function Home() {
  return (
    <main id="top" className="min-h-svh overflow-hidden bg-[#05070b] text-[#f5f1eb]">
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
          className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(5,7,11,0.99)_0%,rgba(5,7,11,0.94)_30%,rgba(5,7,11,0.63)_54%,rgba(5,7,11,0.28)_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(5,7,11,0.45)_0%,transparent_23%,transparent_70%,rgba(5,7,11,0.96)_100%)]"
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

          <div className="flex items-center gap-3 sm:gap-5">
            <span className="hidden font-[IBM_Plex_Mono] text-[10px] tracking-[0.16em] text-[#aeb7c5] md:block">
              SYS // ONLINE
            </span>
            <button
              type="button"
              onClick={notifyChannel}
              className="group inline-flex h-10 items-center gap-2 border border-white/20 bg-white/[0.06] px-3.5 font-[IBM_Plex_Mono] text-[10px] font-medium tracking-[0.14em] text-white backdrop-blur-md transition duration-200 hover:border-[#ff5a1f]/80 hover:bg-[#ff5a1f] hover:text-[#07090d] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a1f] focus-visible:ring-offset-4 focus-visible:ring-offset-[#05070b] sm:h-11 sm:px-4"
            >
              OPEN CHANNEL
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2.2} />
            </button>
          </div>
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
              className="hero-reveal hero-reveal-2 mt-7 max-w-3xl font-[Space_Grotesk] text-[clamp(3.5rem,8.5vw,7.8rem)] font-bold leading-[0.84] tracking-[-0.075em] text-[#f7f4ef]"
            >
              MAKE THE
              <span className="mt-1 block text-[#ff5a1f]">SIGNAL</span>
              <span className="mt-1 block pl-[0.12em] text-[#f7f4ef]">UNMISSABLE.</span>
            </h1>

            <div className="hero-reveal hero-reveal-3 mt-8 flex max-w-xl flex-col gap-6 sm:mt-10 sm:flex-row sm:items-end sm:gap-8">
              <p className="max-w-[23rem] border-l border-[#6ae4ff]/55 pl-4 font-[IBM_Plex_Mono] text-[12px] leading-6 text-[#c7ced8] sm:text-[13px]">
                We turn creative ambition into high-voltage digital worlds, identities, and interactive experiences.
              </p>
              <button
                type="button"
                onClick={notifyChannel}
                className="group inline-flex w-fit items-center gap-4 border-b border-[#ff5a1f] pb-2 font-[IBM_Plex_Mono] text-[11px] font-semibold tracking-[0.16em] text-[#fff7f2] outline-none transition duration-200 hover:border-[#6ae4ff] hover:text-[#6ae4ff] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#ff5a1f] focus-visible:ring-offset-4 focus-visible:ring-offset-[#05070b]"
              >
                START A TRANSMISSION
                <span className="grid h-7 w-7 place-items-center bg-[#ff5a1f] text-[#07090d] transition duration-200 group-hover:translate-x-1 group-hover:bg-[#6ae4ff]">
                  <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col border-t border-white/10 bg-[#070a0f]/72 px-5 py-4 backdrop-blur-md sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
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
