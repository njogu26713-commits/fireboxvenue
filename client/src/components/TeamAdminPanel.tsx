import { useState } from "react";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type TeamForm = {
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  linkedinUrl: string;
  sortOrder: string;
};
const emptyForm: TeamForm = {
  name: "",
  role: "",
  bio: "",
  imageUrl: "",
  linkedinUrl: "",
  sortOrder: "0",
};

export default function TeamAdminPanel() {
  const utils = trpc.useUtils();
  const { data: members, isLoading } = trpc.team.list.useQuery();
  const [form, setForm] = useState<TeamForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const add = trpc.team.add.useMutation({
    onSuccess: () => {
      toast.success("Team member added");
      setForm(emptyForm);
      utils.team.list.invalidate();
    },
  });
  const update = trpc.team.update.useMutation({
    onSuccess: () => {
      toast.success("Team member updated");
      setEditingId(null);
      setForm(emptyForm);
      utils.team.list.invalidate();
    },
  });
  const remove = trpc.team.delete.useMutation({
    onSuccess: () => {
      toast.success("Team member removed");
      utils.team.list.invalidate();
    },
  });
  const pending = add.isPending || update.isPending;
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const input = {
      ...form,
      sortOrder: Number(form.sortOrder) || 0,
      imageUrl: form.imageUrl || undefined,
      linkedinUrl: form.linkedinUrl || undefined,
    };
    if (editingId) update.mutate({ id: editingId, ...input });
    else add.mutate(input);
  };
  const edit = (member: NonNullable<typeof members>[number]) => {
    setEditingId(member.id);
    setForm({
      name: member.name,
      role: member.role,
      bio: member.bio,
      imageUrl: member.imageUrl ?? "",
      linkedinUrl: member.linkedinUrl ?? "",
      sortOrder: String(member.sortOrder),
    });
  };
  return (
    <div className="space-y-8">
      <form
        id="team-editor"
        onSubmit={submit}
        className="scroll-mt-28 border border-white/10 bg-[#0a0e15] p-6 sm:p-8"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="font-sans text-[10px] tracking-[0.16em] text-[#6ae4ff]">
              06 / PEOPLE NODE
            </span>
            <h2 className="mt-2 font-sans text-2xl font-semibold">
              {editingId ? "EDIT TEAM MEMBER" : "ADD TEAM MEMBER"}
            </h2>
          </div>
          <Plus className="h-5 w-5 text-[#ff5a1f]" />
        </div>
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="field-label">Name</span>
            <input
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Alex Kim"
              className="field-input"
            />
          </label>
          <label className="block">
            <span className="field-label">Role</span>
            <input
              required
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              placeholder="e.g. Lead Engineer"
              className="field-input"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="field-label">Biography</span>
            <textarea
              required
              rows={4}
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              placeholder="Describe this person's work at Firebox..."
              className="field-input resize-none"
            />
          </label>
          <label className="block">
            <span className="field-label">
              Image URL <span className="text-[#738094]">(optional)</span>
            </span>
            <input
              type="url"
              value={form.imageUrl}
              onChange={e => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://..."
              className="field-input"
            />
          </label>
          <label className="block">
            <span className="field-label">
              LinkedIn URL <span className="text-[#738094]">(optional)</span>
            </span>
            <input
              type="url"
              value={form.linkedinUrl}
              onChange={e => setForm({ ...form, linkedinUrl: e.target.value })}
              placeholder="https://linkedin.com/in/..."
              className="field-input"
            />
          </label>
          <label className="block">
            <span className="field-label">Display order</span>
            <input
              type="number"
              min="0"
              value={form.sortOrder}
              onChange={e => setForm({ ...form, sortOrder: e.target.value })}
              className="field-input"
            />
          </label>
        </div>
        <div className="mt-6 flex gap-3">
          <button disabled={pending} className="action-button">
            <Check className="h-4 w-4" />{" "}
            {pending
              ? "WRITING..."
              : editingId
                ? "UPDATE MEMBER"
                : "WRITE MEMBER"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="border border-white/15 px-4 py-3 font-sans text-[10px] tracking-[0.12em] text-[#9da9b8]"
            >
              CANCEL
            </button>
          )}
        </div>
      </form>
      <section className="border border-white/10 bg-[#0a0e15] p-6 sm:p-8">
        <div className="flex items-end justify-between border-b border-white/10 pb-5">
          <div>
            <span className="font-sans text-[10px] tracking-[0.16em] text-[#ff5a1f]">
              TEAM ARCHIVE
            </span>
            <h2 className="mt-2 font-sans text-2xl font-semibold">
              CURRENT TEAM
            </h2>
          </div>
          <span className="font-sans text-[9px] tracking-[0.12em] text-[#738094]">
            {members?.length ?? 0} MEMBERS
          </span>
        </div>
        {isLoading ? (
          <p className="py-8 font-sans text-[10px] tracking-[0.12em] text-[#738094]">
            LOADING TEAM...
          </p>
        ) : members?.length ? (
          <div className="divide-y divide-white/10">
            {members.map(member => (
              <div
                key={member.id}
                className="flex items-start justify-between gap-4 py-5"
              >
                <div>
                  <p className="font-sans text-lg font-semibold">
                    {member.name}
                  </p>
                  <p className="mt-1 font-sans text-[10px] tracking-[0.14em] text-[#6ae4ff]">
                    {member.role}
                  </p>
                  <p className="mt-2 max-w-2xl font-sans text-xs leading-5 text-[#99a6b7]">
                    {member.bio}
                  </p>
                </div>
                <div className="flex shrink-0 gap-3">
                  <button
                    type="button"
                    onClick={() => edit(member)}
                    aria-label={`Edit ${member.name}`}
                    className="text-[#9da9b8] transition hover:text-[#6ae4ff]"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove.mutate({ id: member.id })}
                    aria-label={`Delete ${member.name}`}
                    className="text-[#9da9b8] transition hover:text-[#ff5a1f]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 font-sans text-[10px] tracking-[0.12em] text-[#738094]">
            NO TEAM MEMBERS ADDED YET
          </p>
        )}
      </section>
    </div>
  );
}
