import { Link } from "wouter";

type BrandMarkProps = {
  className?: string;
};

export default function BrandMark({ className = "" }: BrandMarkProps) {
  return (
    <Link
      href="/"
      aria-label="FireboxStudios home"
      className={`fixed left-4 top-4 z-50 inline-flex items-center gap-3 rounded-sm border border-border bg-background/90 px-2.5 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur-xl transition hover:border-[#ff5a1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a1f] sm:left-8 sm:top-6 sm:px-3 lg:left-12 ${className}`}
    >
      <span className="grid h-9 w-9 place-items-center bg-gradient-to-br from-[#ff5a1f] via-[#ff7c3d] to-[#6ae4ff] font-sans text-sm font-black tracking-[-0.12em] text-[#05070b] shadow-[0_0_22px_rgba(255,90,31,0.22)] sm:h-10 sm:w-10">
        FB
      </span>
      <span className="leading-none">
        <span className="block font-sans text-sm font-bold tracking-[-0.03em] text-foreground sm:text-base">Firebox<span className="text-[#ff5a1f]">Studios</span></span>
        <span className="mt-1 block font-sans text-[8px] font-medium uppercase tracking-[0.16em] text-muted-foreground sm:text-[9px]">Creative technology unit</span>
      </span>
    </Link>
  );
}
