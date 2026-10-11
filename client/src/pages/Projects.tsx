import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Clock3,
  ExternalLink,
  Github,
  Rocket,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { Link } from "wouter";
import BrandMark from "@/components/BrandMark";
import ThemeToggle from "@/components/ThemeToggle";
import { trpc } from "@/lib/trpc";
import type {
  ProjectTrackerStatus,
  TrackedProject,
} from "../../../drizzle/schema";

const statuses: Array<{ value: ProjectTrackerStatus | "all"; label: string }> =
  [
    { value: "all", label: "All projects" },
    { value: "active", label: "In progress" },
    { value: "upcoming", label: "Upcoming releases" },
    { value: "completed", label: "Completed" },
    { value: "abandoned", label: "Abandoned" },
  ];

const statusDetails: Record<
  ProjectTrackerStatus,
  { label: string; icon: typeof CircleDashed; tone: string; line: string }
> = {
  active: {
    label: "In progress",
    icon: CircleDashed,
    tone: "border-cyan-300/25 bg-cyan-300/[0.07] text-cyan-200",
    line: "bg-cyan-300",
  },
  upcoming: {
    label: "Upcoming release",
    icon: Rocket,
    tone: "border-violet-300/25 bg-violet-300/[0.07] text-violet-200",
    line: "bg-violet-300",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    tone: "border-emerald-300/25 bg-emerald-300/[0.07] text-emerald-200",
    line: "bg-emerald-300",
  },
  abandoned: {
    label: "Abandoned",
    icon: TriangleAlert,
    tone: "border-orange-300/25 bg-orange-300/[0.07] text-orange-200",
    line: "bg-orange-300",
  },
};

function safeExternalUrl(value: string | null) {
  return value && /^https?:\/\//i.test(value) ? value : undefined;
}

function ProjectCard({ project }: { project: TrackedProject }) {
  const detail = statusDetails[project.status];
  const StatusIcon = detail.icon;
  const liveUrl = safeExternalUrl(project.liveUrl);
  const githubUrl = safeExternalUrl(project.githubUrl);

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0c121b]/90 transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-[#101824]">
      <div
        className={`absolute inset-x-0 top-0 h-px ${detail.line} opacity-50`}
      />
      {project.imageUrl && safeExternalUrl(project.imageUrl) && (
        <div className="aspect-[16/6] overflow-hidden border-b border-white/10 bg-[#080b11]">
          <img
            src={project.imageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-[1.02] group-hover:opacity-100"
          />
        </div>
      )}
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-sans text-[10px] font-medium tracking-[0.08em] ${detail.tone}`}
          >
            <StatusIcon className="h-3.5 w-3.5" /> {detail.label}
          </span>
          <span className="font-sans text-[10px] tracking-[0.12em] text-[#6d7a8c]">
            PROJECT / {String(project.sortOrder).padStart(2, "0")}
          </span>
        </div>

        <h2 className="mt-5 font-sans text-xl font-semibold tracking-[-0.04em] text-[#f4f1ec] sm:text-2xl">
          {project.title}
        </h2>
        <p className="mt-3 whitespace-pre-line font-sans text-sm leading-7 text-[#aab5c4]">
          {project.description}
        </p>

        {(project.releasedVersion ||
          project.plannedVersion ||
          project.plannedReleaseDate) && (
          <dl className="mt-5 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-2">
            {project.releasedVersion && (
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 py-3">
                <dt className="font-sans text-[9px] uppercase tracking-[0.14em] text-[#7f8c9d]">
                  Latest release
                </dt>
                <dd className="mt-1.5 font-sans text-sm font-medium text-white">
                  {project.releasedVersion}
                </dd>
              </div>
            )}
            {project.plannedVersion && (
              <div className="rounded-xl border border-violet-300/15 bg-violet-300/[0.035] px-3.5 py-3">
                <dt className="font-sans text-[9px] uppercase tracking-[0.14em] text-[#9c8cbd]">
                  Planned version
                </dt>
                <dd className="mt-1.5 font-sans text-sm font-medium text-violet-100">
                  {project.plannedVersion}
                </dd>
              </div>
            )}
            {project.plannedReleaseDate && (
              <div className="flex items-center gap-2.5 font-sans text-xs text-[#aeb8c6] sm:col-span-2">
                <CalendarDays className="h-4 w-4 text-[#9b87ce]" />
                Target release:{" "}
                {new Date(
                  `${project.plannedReleaseDate}T00:00:00`
                ).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            )}
          </dl>
        )}

        {project.status === "abandoned" && project.abandonmentReason && (
          <div className="mt-5 rounded-xl border border-orange-300/15 bg-orange-300/[0.04] p-4">
            <p className="font-sans text-[9px] font-semibold uppercase tracking-[0.15em] text-orange-200">
              Why work stopped
            </p>
            <p className="mt-2 whitespace-pre-line font-sans text-xs leading-6 text-[#c3b1a7]">
              {project.abandonmentReason}
            </p>
          </div>
        )}

        {(liveUrl || githubUrl) && (
          <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
            {liveUrl && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 font-sans text-[10px] tracking-[0.08em] text-[#d7e4f0] transition hover:border-cyan-200/40 hover:text-white"
              >
                OPEN PROJECT <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 font-sans text-[10px] tracking-[0.08em] text-[#d7e4f0] transition hover:border-white/30 hover:text-white"
              >
                SOURCE <Github className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default function Projects() {
  const [filter, setFilter] = useState<ProjectTrackerStatus | "all">("all");
  const projects = trpc.projectTracker.publicList.useQuery();

  const filteredProjects = useMemo(
    () =>
      (projects.data ?? []).filter(
        project => filter === "all" || project.status === filter
      ),
    [filter, projects.data]
  );
  const countFor = (status: ProjectTrackerStatus | "all") =>
    status === "all"
      ? (projects.data?.length ?? 0)
      : (projects.data?.filter(project => project.status === status).length ??
        0);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070a10] text-[#f5f1eb]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(106,228,255,0.10),transparent_38%),radial-gradient(ellipse_at_100%_45%,rgba(182,156,255,0.09),transparent_35%)]"
      />
      <header className="relative z-10 border-b border-white/10 bg-[#070a10]/75 px-5 py-4 backdrop-blur-xl sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <BrandMark />
          <nav
            aria-label="Project page navigation"
            className="flex items-center gap-4 sm:gap-6"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.13em] text-[#aab4c2] transition hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> HOME
            </Link>
            <Link
              href="/products"
              className="hidden font-sans text-[10px] tracking-[0.13em] text-[#aab4c2] transition hover:text-white sm:inline-flex"
            >
              PRODUCTS
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1018]/80 px-6 py-9 sm:px-10 sm:py-12 lg:px-14">
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-28 h-80 w-80 rounded-full border border-cyan-100/10"
          />
          <div
            aria-hidden="true"
            className="absolute -right-5 -top-12 h-52 w-52 rounded-full border border-violet-200/10"
          />
          <div className="relative max-w-3xl">
            <p className="inline-flex items-center gap-2 font-sans text-[10px] font-medium tracking-[0.2em] text-[#6ae4ff]">
              <Sparkles className="h-3.5 w-3.5" /> FIREBOX / PROJECT REGISTER
            </p>
            <h1 className="mt-5 font-sans text-4xl font-semibold leading-[1.02] tracking-[-0.065em] sm:text-5xl lg:text-6xl">
              What we’re building.
              <br />
              <span className="text-[#9b8ad2]">What’s next.</span>
            </h1>
            <p className="mt-5 max-w-2xl font-sans text-sm leading-7 text-[#9da9b8]">
              Follow current work, see the versions we’re preparing, explore
              completed projects, and understand why some projects were retired.
              Project details appear here only after an admin publishes them.
            </p>
          </div>
        </section>

        <section aria-label="Project status filters" className="mt-8">
          <div className="flex flex-wrap gap-2">
            {statuses.map(item => {
              const selected = filter === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  aria-pressed={selected}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 font-sans text-[10px] tracking-[0.08em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6ae4ff] ${selected ? "border-[#6ae4ff]/35 bg-[#6ae4ff]/10 text-[#c7f7ff]" : "border-white/10 bg-[#0b1018] text-[#9da9b8] hover:border-white/25 hover:text-white"}`}
                >
                  {item.label}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[9px] ${selected ? "bg-[#6ae4ff]/15 text-[#c7f7ff]" : "bg-white/[0.06] text-[#7f8c9d]"}`}
                  >
                    {countFor(item.value)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-7" aria-live="polite">
          {projects.isLoading ? (
            <div className="grid min-h-64 place-items-center rounded-2xl border border-white/10 bg-[#0b1018]/80 font-sans text-sm text-[#9da9b8]">
              Loading published projects…
            </div>
          ) : projects.isError ? (
            <div
              role="alert"
              className="rounded-2xl border border-red-300/20 bg-red-300/[0.04] p-6 font-sans text-sm text-red-100"
            >
              Project information could not be loaded right now. Please try
              again later.
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2">
              {filteredProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-white/15 bg-[#0b1018]/60 px-6 py-12 text-center">
              <div className="max-w-md">
                <Clock3 className="mx-auto h-7 w-7 text-[#748297]" />
                <h2 className="mt-4 font-sans text-lg font-semibold text-white">
                  {projects.data?.length
                    ? "No projects in this view yet"
                    : "Project updates are on the way"}
                </h2>
                <p className="mt-2 font-sans text-xs leading-6 text-[#8e9bad]">
                  {projects.data?.length
                    ? "Try another status filter to browse the published project register."
                    : "The team hasn’t published any project records yet. Check back for progress, version plans, and completed work."}
                </p>
                {projects.data?.length ? (
                  <button
                    type="button"
                    onClick={() => setFilter("all")}
                    className="mt-4 inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.1em] text-[#a9eefe] hover:text-white"
                  >
                    SHOW ALL PROJECTS <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </section>

        <footer className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 font-sans text-[10px] text-[#758194] sm:flex-row sm:items-center sm:justify-between">
          <p>
            Only records explicitly published by Firebox admins appear in this
            register.
          </p>
          <Link
            href="/support"
            className="inline-flex items-center gap-2 tracking-[0.1em] text-[#aab4c2] transition hover:text-white"
          >
            HAVE A QUESTION? CONTACT SUPPORT{" "}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </footer>
      </div>
    </main>
  );
}
