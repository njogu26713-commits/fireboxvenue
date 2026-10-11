import { Link } from "wouter";

type BrandMarkProps = {
  className?: string;
};

export default function BrandMark({ className = "" }: BrandMarkProps) {
  return (
    <Link
      href="/"
      aria-label="FireboxTechs home"
      className={`relative z-10 inline-flex shrink-0 items-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a1f] ${className}`}
    >
      <img
        src="/firebox-ai-icon.svg"
        alt="FireboxTechs icon"
        className="h-14 w-14 object-contain select-none sm:h-16 sm:w-16"
      />
      <span className="ml-3 flex flex-col leading-none">
        <span className="font-sans text-lg font-bold tracking-[-0.04em] text-[#0b0b0b] dark:text-[#f7f4ef] sm:text-xl">
          Firebox<span className="font-medium text-[#ff5a1f]">Techs</span>
        </span>
        <span className="mt-1 font-sans text-[8px] font-medium tracking-[0.12em] text-muted-foreground sm:text-[9px]">
          Building intelligent technology.
        </span>
      </span>
    </Link>
  );
}
