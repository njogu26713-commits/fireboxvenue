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
      <span className="ml-3 font-sans text-sm font-bold tracking-[-0.03em] text-foreground sm:text-base">
        FIREBOXTECHS
      </span>
    </Link>
  );
}
