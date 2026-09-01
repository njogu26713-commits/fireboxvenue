import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, Cpu, Layers3, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

type PublicContent = {
  services: Array<{ id: number; title: string; description: string; sortOrder: number }>;
  projects: Array<{ id: number; title: string; client: string; description: string; imageUrl?: string | null; sortOrder: number }>;
};

const fallback: PublicContent = {
  services: [
    { id: 1, title: "Digital Worlds", description: "Immersive 3D environments and interactive web experiences built for high-end brand storytelling.", sortOrder: 1 },
    { id: 2, title: "Identity Systems", description: "Cyberpunk and industrial design languages, motion graphics, and robust brand guidelines.", sortOrder: 2 },
    { id: 3, title: "Creative Engineering", description: "Custom frontend architecture, WebGL integrations, and high-performance interactive systems.", sortOrder: 3 },
  ],
  projects: [
    { id: 1, title: "Network Atrium", client: "Internal R&D", description: "A suspended energy core environment built to test our new lighting and particle systems.", imageUrl: "/manus-storage/firebox-network-atrium_1879ff5e.png", sortOrder: 1 },
    { id: 2, title: "Circuit Abyss", client: "Confidential", description: "Abstract technical background visuals for a secure data management platform.", imageUrl: "/manus-storage/firebox-circuit-abyss_0d3067b7.png", sortOrder: 2 },
    { id: 3, title: "Terminal Horizon", client: "Neon Grid", description: "A cinematic rooftop command deck interface designed for a futuristic digital studio.", imageUrl: "/manus-storage/firebox-terminal-horizon_dcc40768.png", sortOrder: 3 },
  ],
};

export default function Solutions() {
  const { data, isLoading, isError } = trpc.content.list.useQuery();
  const [localData, setLocalData] = useState(fallback);

  useEffect(() => {
    if (data) setLocalData(data);
  }, [data]);

  return (
    <main className="min-h-screen bg-[#05070b] text-[#f5f1eb]">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#05070b]/85 px-5 py-5 backdrop-blur-xl sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="group inline-flex items-center gap-3 font-[Space_Grotesk] text-sm font-bold tracking-[0.13em] text-white outline-none transition hover:text-[#ff5a1f] focus-visible:ring-2 focus-visible:ring-[#ff5a1f]">
            <span className="grid h-9 w-9 place-items-center border border-[#ff5a1f]/60 text-[#ff5a1f]">F//</span>
            FIREBOX<span className="text-[#ff5a1f]">//</span>STUDIOS
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="hidden font-[IBM_Plex_Mono] text-[10px] tracking-[0.14em] text-[#ff5a1f] transition hover:text-white sm:block">CONTENT CONTROL</Link>
            <Link href="/" className="inline-flex items-center gap-2 font-[IBM_Plex_Mono] text-[10px] tracking-[0.14em] text-[#9da9b8] transition hover:text-white">
              <ArrowLeft className="h-3.5 w-3.5" /> RETURN TO HERO
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-white/10 px-5 pb-20 pt-20 sm:px-8 sm:pt-28 lg:px-12">
        <div className="signal-grid absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex items-center gap-3 font-[IBM_Plex_Mono] text-[10px] tracking-[0.2em] text-[#e7c6ba]"><span className="h-px w-8 bg-[#ff5a1f]" /> FIREBOX TECH / SOLUTIONS</div>
          <div className="mt-7 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <h1 className="max-w-4xl font-[Space_Grotesk] text-[clamp(3.3rem,7vw,7rem)] font-bold leading-[0.86] tracking-[-0.075em]">BUILD THE <span className="text-[#ff5a1f]">NEXT</span><br />LAYER.</h1>
            <p className="max-w-md border-l border-[#6ae4ff]/60 pl-4 font-[IBM_Plex_Mono] text-xs leading-6 text-[#aeb9c8]">Firebox tech is the system behind the signal: strategy, visual identity, and interactive technology for ambitious teams.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12" aria-labelledby="services-heading">
        <div className="flex items-end justify-between gap-6 border-b border-white/10 pb-5"><div><span className="font-[IBM_Plex_Mono] text-[10px] tracking-[0.18em] text-[#6ae4ff]">01 / CAPABILITIES</span><h2 id="services-heading" className="mt-3 font-[Space_Grotesk] text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">SERVICES</h2></div><Cpu className="h-7 w-7 text-[#ff5a1f]" /></div>
        <div className="mt-10 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3">
          {localData.services.map((service, index) => <article key={service.id} className="group bg-[#090d14] p-7 transition hover:bg-[#0d141d] sm:p-9"><div className="flex items-center justify-between"><span className="font-[IBM_Plex_Mono] text-[11px] text-[#ff5a1f]">0{index + 1}</span><ArrowUpRight className="h-4 w-4 text-[#738094] transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#6ae4ff]" /></div><h3 className="mt-14 font-[Space_Grotesk] text-2xl font-semibold tracking-[-0.04em]">{service.title}</h3><p className="mt-4 font-[IBM_Plex_Mono] text-xs leading-6 text-[#9eabbc]">{service.description}</p></article>)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:px-12" aria-labelledby="projects-heading">
        <div className="flex items-end justify-between gap-6 border-b border-white/10 pb-5"><div><span className="font-[IBM_Plex_Mono] text-[10px] tracking-[0.18em] text-[#6ae4ff]">02 / SELECTED SIGNALS</span><h2 id="projects-heading" className="mt-3 font-[Space_Grotesk] text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">PROJECTS</h2></div><Layers3 className="h-7 w-7 text-[#ff5a1f]" /></div>
          {isLoading && <p className="mt-8 font-[IBM_Plex_Mono] text-xs text-[#9eabbc]">SYNCING CONTENT DATABASE...</p>}
          {isError && <p className="mt-8 border border-[#ff5a1f]/30 bg-[#ff5a1f]/5 px-4 py-3 font-[IBM_Plex_Mono] text-[10px] tracking-[0.12em] text-[#ffae8c]">CONTENT NODE OFFLINE / SHOWING LAST KNOWN SIGNALS</p>}
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {localData.projects.map((project, index) => <article key={project.id} className="group border border-white/10 bg-[#090d14]"><div className="relative aspect-[4/3] overflow-hidden bg-[#0d141d]"><img src={project.imageUrl || "/manus-storage/firebox-circuit-abyss_0d3067b7.png"} alt="" className="h-full w-full object-cover opacity-75 transition duration-500 group-hover:scale-105 group-hover:opacity-100" /><div className="absolute inset-0 bg-gradient-to-t from-[#090d14] via-transparent to-transparent" /><span className="absolute left-4 top-4 font-[IBM_Plex_Mono] text-[10px] tracking-[0.15em] text-[#d4dde8]">0{index + 1} / ARCHIVE</span></div><div className="p-6"><div className="flex items-center justify-between gap-4 font-[IBM_Plex_Mono] text-[10px] tracking-[0.14em] text-[#ff5a1f]"><span>{project.client}</span><span>2026</span></div><h3 className="mt-4 font-[Space_Grotesk] text-2xl font-semibold tracking-[-0.04em]">{project.title}</h3><p className="mt-3 font-[IBM_Plex_Mono] text-xs leading-6 text-[#9eabbc]">{project.description}</p></div></article>)}
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-8 sm:px-8 lg:px-12"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 font-[IBM_Plex_Mono] text-[10px] tracking-[0.14em] text-[#768397] sm:flex-row"><span>FIREBOX TECH / CONTENT NODE 02</span><span className="inline-flex items-center gap-2"><Sparkles className="h-3 w-3 text-[#6ae4ff]" /> SIGNAL IS LIVE</span></div></footer>
    </main>
  );
}
