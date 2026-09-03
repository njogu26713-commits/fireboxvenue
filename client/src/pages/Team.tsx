import { ArrowLeft, ArrowUpRight, Linkedin, Users } from "lucide-react";
import { Link } from "wouter";
import BrandMark from "@/components/BrandMark";
import ThemeToggle from "@/components/ThemeToggle";
import { trpc } from "@/lib/trpc";

export default function Team() {
  const { data: members, isLoading, isError } = trpc.team.list.useQuery();
  return (
    <main className="min-h-screen w-full bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 px-5 py-5 backdrop-blur-xl sm:px-8 lg:px-12">
        <div className="flex w-full items-center justify-between gap-4">
          <BrandMark />
          <div className="flex items-center gap-4 sm:gap-5">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.14em] text-muted-foreground transition hover:text-[#ff5a1f]"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> BACK TO HOME
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <section className="w-full border-b border-border px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
        <div className="flex items-end justify-between gap-6">
          <div>
            <span className="font-sans text-[10px] tracking-[0.18em] text-[#ff5a1f]">
              07 / HUMAN SYSTEMS
            </span>
            <h1 className="mt-4 font-sans text-5xl font-bold tracking-[-0.06em] sm:text-7xl">
              THE TEAM
            </h1>
            <p className="mt-6 max-w-2xl font-sans text-xs leading-6 text-muted-foreground sm:text-sm">
              Meet the people building Firebox products, services, and technical
              systems.
            </p>
          </div>
          <Users
            className="hidden h-12 w-12 text-[#6ae4ff] sm:block"
            strokeWidth={1.2}
          />
        </div>
      </section>
      <section className="w-full px-5 py-12 sm:px-8 lg:px-12">
        {isLoading && (
          <p className="font-sans text-xs tracking-[0.12em] text-muted-foreground">
            LOADING TEAM NODE...
          </p>
        )}
        {isError && (
          <p className="border border-[#ff5a1f]/30 bg-[#ff5a1f]/5 px-4 py-4 font-sans text-[10px] tracking-[0.12em] text-[#ffae8c]">
            TEAM NODE OFFLINE / RETRY THE CONNECTION
          </p>
        )}
        {!isLoading && !isError && members?.length === 0 && (
          <div className="border border-border px-6 py-10">
            <p className="font-sans text-[10px] tracking-[0.14em] text-muted-foreground">
              TEAM PROFILES COMING SOON
            </p>
            <p className="mt-3 font-sans text-xs leading-6 text-muted-foreground">
              Team profiles will appear here after they are added from the Admin
              workspace.
            </p>
          </div>
        )}
        {!isLoading && !isError && (members?.length ?? 0) > 0 && (
          <div className="grid w-full gap-px bg-border md:grid-cols-2 xl:grid-cols-3">
            {members?.map((member, index) => (
              <article key={member.id} className="bg-background p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <span className="font-sans text-[10px] tracking-[0.16em] text-[#ff5a1f]">
                    0{index + 1}
                  </span>
                  {member.linkedinUrl && (
                    <a
                      href={member.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${member.name} on LinkedIn`}
                      className="text-muted-foreground transition hover:text-[#6ae4ff]"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                </div>
                {member.imageUrl ? (
                  <img
                    src={member.imageUrl}
                    alt={member.name}
                    className="mt-8 aspect-square w-full object-cover grayscale transition duration-300 hover:grayscale-0"
                  />
                ) : (
                  <div className="mt-8 grid aspect-square w-full place-items-center border border-border bg-card">
                    <Users className="h-10 w-10 text-[#6ae4ff]/50" />
                  </div>
                )}
                <h2 className="mt-7 font-sans text-2xl font-semibold tracking-[-0.04em]">
                  {member.name}
                </h2>
                <p className="mt-2 font-sans text-[10px] font-medium tracking-[0.16em] text-[#6ae4ff]">
                  {member.role}
                </p>
                <p className="mt-5 font-sans text-xs leading-6 text-muted-foreground">
                  {member.bio}
                </p>
                <Link
                  href="/support"
                  className="mt-7 inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.14em] text-muted-foreground transition hover:text-[#ff5a1f]"
                >
                  WORK WITH THE TEAM <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
