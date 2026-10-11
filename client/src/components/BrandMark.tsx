import { Link } from "wouter";

type BrandMarkProps = {
  className?: string;
};

export default function BrandMark({ className = "" }: BrandMarkProps) {
  return (
    <Link
      href="/"
      aria-label="Firebox home"
      className={`relative z-10 inline-flex shrink-0 items-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a1f] ${className}`}
    >
      <img
        src="/firebox-ai-icon.svg"
        alt="Firebox icon"
        className="h-14 w-14 object-contain select-none sm:h-16 sm:w-16"
      />
    </Link>
  );
}
