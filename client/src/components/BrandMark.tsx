import { Link } from "wouter";

type BrandMarkProps = {
  className?: string;
};

export default function BrandMark({ className = "" }: BrandMarkProps) {
  return (
    <Link
      href="/"
      aria-label="FireboxStudios home"
      className={`relative z-10 inline-flex shrink-0 items-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a1f] ${className}`}
    >
      <img
        src="/firebox-logo.jpeg"
        alt="FireboxTechs logo"
        className="h-14 w-14 rounded-full object-cover select-none sm:h-16 sm:w-16"
      />
      <span className="ml-3 leading-none">
        <span className="block font-sans text-sm font-bold tracking-[-0.03em] text-foreground sm:text-base">
          Firebox<span className="text-[#9b35ff]">Techs</span>
        </span>
        <span className="mt-1 block font-sans text-[8px] font-medium uppercase tracking-[0.16em] text-muted-foreground sm:text-[9px]">
          Build · Code · Innovate
        </span>
      </span>
    </Link>
  );
}
