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
        src="/firebox-logo.png"
        alt="FireboxStudios — Creative technology unit"
        className="h-12 w-auto max-w-[min(260px,78vw)] rounded-none object-contain object-left select-none sm:h-14"
      />
    </Link>
  );
}
