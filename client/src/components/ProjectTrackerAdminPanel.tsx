import { useState, type FormEvent } from "react";
import {
  Archive,
  Check,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Rocket,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import type {
  ProjectTrackerStatus,
  TrackedProject,
} from "../../../drizzle/schema";

type ProjectForm = {
  title: string;
  description: string;
  status: ProjectTrackerStatus;
  releasedVersion: string;
  plannedVersion: string;
  plannedReleaseDate: string;
  abandonmentReason: string;
  imageUrl: string;
  liveUrl: string;
  githubUrl: string;
  published: boolean;
  sortOrder: string;
};

const blankProject: ProjectForm = {
  title: "",
  description: "",
  status: "active",
  releasedVersion: "",
  plannedVersion: "",
  plannedReleaseDate: "",
  abandonmentReason: "",
  imageUrl: "",
  liveUrl: "",
  githubUrl: "",
  published: false,
  sortOrder: "0",
};

const statusLabels: Record<ProjectTrackerStatus, string> = {
  active: "In progress",
  upcoming: "Upcoming release",
  completed: "Completed",
  abandoned: "Abandoned",
};

function toProjectForm(project: TrackedProject): ProjectForm {
  return {
    title: project.title,
    description: project.description,
    status: project.status,
    releasedVersion: project.releasedVersion ?? "",
    plannedVersion: project.plannedVersion ?? "",
    plannedReleaseDate: project.plannedReleaseDate ?? "",
    abandonmentReason: project.abandonmentReason ?? "",
    imageUrl: project.imageUrl ?? "",
    liveUrl: project.liveUrl ?? "",
    githubUrl: project.githubUrl ?? "",
    published: project.published,
    sortOrder: String(project.sortOrder),
  };
}

export default function ProjectTrackerAdminPanel() {
  const utils = trpc.useUtils();
  const projects = trpc.projectTracker.adminList.useQuery();
  const [form, setForm] = useState<ProjectForm>(blankProject);
  const [editingId, setEditingId] = useState<number | null>(null);

  const resetForm = () => {
    setForm(blankProject);
    setEditingId(null);
  };

  const invalidateProjects = async () => {
    await Promise.all([
      utils.projectTracker.adminList.invalidate(),
      utils.projectTracker.publicList.invalidate(),
    ]);
  };

  const addProject = trpc.projectTracker.add.useMutation({
    onSuccess: async () => {
      await invalidateProjects();
      resetForm();
      toast.success("Project record added");
    },
    onError: error => toast.error(error.message),
  });
  const updateProject = trpc.projectTracker.update.useMutation({
    onSuccess: async () => {
      await invalidateProjects();
      resetForm();
      toast.success("Project record updated");
    },
    onError: error => toast.error(error.message),
  });
  const deleteProject = trpc.projectTracker.delete.useMutation({
    onSuccess: invalidateProjects,
    onError: error => toast.error(error.message),
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = {
      ...form,
      sortOrder: Number(form.sortOrder) || 0,
      imageUrl: form.imageUrl.trim(),
      liveUrl: form.liveUrl.trim(),
      githubUrl: form.githubUrl.trim(),
    };
    if (editingId !== null) updateProject.mutate({ ...input, id: editingId });
    else addProject.mutate(input);
  };

  const startEditing = (project: TrackedProject) => {
    setForm(toProjectForm(project));
    setEditingId(project.id);
    document.getElementById("project-tracker-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const isSaving = addProject.isPending || updateProject.isPending;

  return (
    <div className="space-y-8">
      <form
        id="project-tracker-form"
        onSubmit={submit}
        className="scroll-mt-28 border border-white/10 bg-[#0a0e15] p-6 sm:p-8"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="font-sans text-[10px] tracking-[0.16em] text-[#6ae4ff]">
              PROJECT LIFECYCLE / ADMIN
            </span>
            <h2 className="mt-2 font-sans text-2xl font-semibold">
              {editingId === null
                ? "ADD PROJECT RECORD"
                : "EDIT PROJECT RECORD"}
            </h2>
            <p className="mt-2 max-w-2xl font-sans text-xs leading-6 text-[#99a6b7]">
              Unpublished records stay private. Publishing makes the record and
              its status notes visible on the public Projects page.
            </p>
          </div>
          <Rocket className="h-5 w-5 text-[#ff5a1f]" />
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="field-label">Project name</span>
            <input
              required
              maxLength={255}
              value={form.title}
              onChange={event =>
                setForm({ ...form, title: event.target.value })
              }
              placeholder="e.g. Firebox Learn"
              className="field-input"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="field-label">Public summary</span>
            <textarea
              required
              rows={3}
              maxLength={2000}
              value={form.description}
              onChange={event =>
                setForm({ ...form, description: event.target.value })
              }
              placeholder="What the project does or what changed"
              className="field-input resize-y"
            />
          </label>
          <label className="block">
            <span className="field-label">Lifecycle status</span>
            <select
              value={form.status}
              onChange={event =>
                setForm({
                  ...form,
                  status: event.target.value as ProjectTrackerStatus,
                })
              }
              className="field-input"
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">Last released version</span>
            <input
              maxLength={64}
              value={form.releasedVersion}
              onChange={event =>
                setForm({ ...form, releasedVersion: event.target.value })
              }
              placeholder="e.g. 1.4.0"
              className="field-input"
            />
          </label>
          <label className="block">
            <span className="field-label">Next version to release</span>
            <input
              maxLength={64}
              value={form.plannedVersion}
              onChange={event =>
                setForm({ ...form, plannedVersion: event.target.value })
              }
              placeholder="e.g. 2.0.0"
              className="field-input"
            />
          </label>
          <label className="block">
            <span className="field-label">Target release date</span>
            <input
              type="date"
              value={form.plannedReleaseDate}
              onChange={event =>
                setForm({ ...form, plannedReleaseDate: event.target.value })
              }
              className="field-input"
            />
          </label>
          {form.status === "abandoned" && (
            <label className="block md:col-span-2">
              <span className="field-label">Reason for abandonment</span>
              <textarea
                required
                rows={3}
                maxLength={2000}
                value={form.abandonmentReason}
                onChange={event =>
                  setForm({ ...form, abandonmentReason: event.target.value })
                }
                placeholder="Explain why work stopped. This will be public if this record is published."
                className="field-input resize-y"
              />
            </label>
          )}
          <label className="block">
            <span className="field-label">Image URL (optional)</span>
            <input
              type="url"
              value={form.imageUrl}
              onChange={event =>
                setForm({ ...form, imageUrl: event.target.value })
              }
              placeholder="https://…"
              className="field-input"
            />
          </label>
          <label className="block">
            <span className="field-label">Live project URL (optional)</span>
            <input
              type="url"
              value={form.liveUrl}
              onChange={event =>
                setForm({ ...form, liveUrl: event.target.value })
              }
              placeholder="https://…"
              className="field-input"
            />
          </label>
          <label className="block">
            <span className="field-label">Repository URL (optional)</span>
            <input
              type="url"
              value={form.githubUrl}
              onChange={event =>
                setForm({ ...form, githubUrl: event.target.value })
              }
              placeholder="https://github.com/…"
              className="field-input"
            />
          </label>
          <label className="block">
            <span className="field-label">Display order</span>
            <input
              type="number"
              min="0"
              value={form.sortOrder}
              onChange={event =>
                setForm({ ...form, sortOrder: event.target.value })
              }
              className="field-input"
            />
          </label>
        </div>

        <label className="mt-6 flex cursor-pointer items-start gap-3 border border-white/10 bg-[#0d141d] p-4">
          <input
            type="checkbox"
            checked={form.published}
            onChange={event =>
              setForm({ ...form, published: event.target.checked })
            }
            className="mt-0.5 h-4 w-4 accent-[#ff5a1f]"
          />
          <span>
            <span className="block font-sans text-xs font-semibold text-white">
              Publish this record on the public Projects page
            </span>
            <span className="mt-1 block font-sans text-[10px] leading-5 text-[#8491a3]">
              Only published records are returned by the public API. Any
              abandonment reason on a published abandoned project is visible to
              visitors.
            </span>
          </span>
        </label>

        <div className="mt-6 flex flex-wrap gap-3">
          <button disabled={isSaving} className="action-button">
            {editingId === null ? (
              <Plus className="h-4 w-4" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {isSaving
              ? "SAVING…"
              : editingId === null
                ? "SAVE PROJECT"
                : "UPDATE PROJECT"}
          </button>
          {editingId !== null && (
            <button
              type="button"
              onClick={resetForm}
              className="border border-white/15 px-4 py-3 font-sans text-[10px] tracking-[0.12em] text-[#aab4c2] hover:border-white/40 hover:text-white"
            >
              CANCEL EDIT
            </button>
          )}
        </div>
      </form>

      <section
        className="border border-white/10 bg-[#080b11] p-6 sm:p-8"
        aria-labelledby="project-records-title"
      >
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <span className="font-sans text-[10px] tracking-[0.16em] text-[#ff5a1f]">
              ALL RECORDS / PRIVATE + PUBLISHED
            </span>
            <h2
              id="project-records-title"
              className="mt-2 font-sans text-2xl font-semibold"
            >
              PROJECT REGISTER
            </h2>
          </div>
          <span className="font-sans text-[10px] tracking-[0.1em] text-[#8f9bad]">
            {projects.data?.length ?? 0} RECORD
            {projects.data?.length === 1 ? "" : "S"}
          </span>
        </div>

        {projects.isLoading ? (
          <p className="py-8 font-sans text-xs text-[#9da9b8]">
            Loading project records…
          </p>
        ) : projects.isError ? (
          <p role="alert" className="py-8 font-sans text-xs text-[#ff8a70]">
            Could not load project records. {projects.error.message}
          </p>
        ) : projects.data?.length ? (
          <div className="mt-5 divide-y divide-white/10">
            {projects.data.map(project => (
              <article
                key={project.id}
                className="flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-sans text-base font-semibold text-white">
                      {project.title}
                    </h3>
                    <span className="border border-[#6ae4ff]/25 bg-[#6ae4ff]/[0.06] px-2 py-1 font-sans text-[9px] uppercase tracking-[0.1em] text-[#9befff]">
                      {statusLabels[project.status]}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 border px-2 py-1 font-sans text-[9px] uppercase tracking-[0.1em] ${project.published ? "border-emerald-400/25 text-emerald-300" : "border-white/10 text-[#8996a7]"}`}
                    >
                      {project.published ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <EyeOff className="h-3 w-3" />
                      )}
                      {project.published ? "Published" : "Private draft"}
                    </span>
                  </div>
                  <p className="mt-2 max-w-3xl line-clamp-2 font-sans text-xs leading-5 text-[#99a6b7]">
                    {project.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-sans text-[10px] text-[#768396]">
                    {project.releasedVersion && (
                      <span>Released: {project.releasedVersion}</span>
                    )}
                    {project.plannedVersion && (
                      <span>Planned: {project.plannedVersion}</span>
                    )}
                    {project.plannedReleaseDate && (
                      <span>Target: {project.plannedReleaseDate}</span>
                    )}
                    {project.status === "abandoned" &&
                      project.abandonmentReason && (
                        <span className="text-[#e4a599]">Reason recorded</span>
                      )}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => startEditing(project)}
                    aria-label={`Edit ${project.title}`}
                    className="inline-flex items-center gap-2 border border-white/15 px-3 py-2 font-sans text-[10px] tracking-[0.08em] text-[#c1cbd8] hover:border-[#6ae4ff]/50 hover:text-white"
                  >
                    <Pencil className="h-3.5 w-3.5" /> EDIT
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Delete the project record “${project.title}”?`
                        )
                      ) {
                        deleteProject.mutate({ id: project.id });
                      }
                    }}
                    disabled={deleteProject.isPending}
                    aria-label={`Delete ${project.title}`}
                    className="inline-flex items-center gap-2 border border-red-400/20 px-3 py-2 font-sans text-[10px] tracking-[0.08em] text-red-300 hover:border-red-400/50 hover:bg-red-400/5"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> DELETE
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="grid min-h-40 place-items-center text-center">
            <div>
              <Archive className="mx-auto h-6 w-6 text-[#586578]" />
              <p className="mt-3 font-sans text-xs text-[#9da9b8]">
                No project records yet. Add a project above to start the
                register.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
