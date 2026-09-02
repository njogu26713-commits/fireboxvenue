import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, Check, Database, Pencil, Plus, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import ThemeToggle from "@/components/ThemeToggle";

type ServiceForm = { title: string; description: string; imageUrl: string; liveUrl: string; githubUrl: string; sortOrder: string };
type ProjectForm = { title: string; client: string; description: string; imageUrl: string; liveUrl: string; githubUrl: string; sortOrder: string };

const emptyService: ServiceForm = { title: "", description: "", imageUrl: "", liveUrl: "", githubUrl: "", sortOrder: "0" };
const emptyProject: ProjectForm = { title: "", client: "", description: "", imageUrl: "", liveUrl: "", githubUrl: "", sortOrder: "0" };

type SupportPlatform = "whatsapp" | "tiktok" | "telegram" | "facebook" | "instagram" | "youtube";
type SupportForm = { label: string; value: string };
const supportPlatforms: Array<{ platform: SupportPlatform; label: string; hint: string }> = [
  { platform: "whatsapp", label: "WhatsApp", hint: "Number or wa.me URL" },
  { platform: "tiktok", label: "TikTok", hint: "Profile URL" },
  { platform: "telegram", label: "Telegram", hint: "Channel or profile URL" },
  { platform: "facebook", label: "Facebook", hint: "Page URL" },
  { platform: "instagram", label: "Instagram", hint: "Profile URL" },
  { platform: "youtube", label: "YouTube", hint: "Channel URL" },
];
const emptySupportForms = Object.fromEntries(supportPlatforms.map(({ platform, label }) => [platform, { label, value: "" }])) as Record<SupportPlatform, SupportForm>;

export default function Admin() {
  const utils = trpc.useUtils();
  const { data, isLoading, isError } = trpc.content.list.useQuery();
  const { data: supportChannels, isLoading: supportChannelsLoading } = trpc.support.channels.useQuery();
  const { data: supportMessages, isLoading: supportMessagesLoading } = trpc.support.messages.useQuery();
  const [service, setService] = useState(emptyService);
  const [project, setProject] = useState(emptyProject);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [supportForms, setSupportForms] = useState<Record<SupportPlatform, SupportForm>>(emptySupportForms);

  useEffect(() => {
    if (!supportChannels) return;
    setSupportForms(current => {
      const next = { ...current };
      supportChannels.forEach(channel => {
        const platform = channel.platform as SupportPlatform;
        next[platform] = { label: channel.label, value: channel.value };
      });
      return next;
    });
  }, [supportChannels]);

  const addService = trpc.content.addService.useMutation({
    onSuccess: async () => { await utils.content.list.invalidate(); setService(emptyService); toast.success("Service added to the channel"); },
    onError: error => toast.error(error.message),
  });
  const addProject = trpc.content.addProject.useMutation({
    onSuccess: async () => { await utils.content.list.invalidate(); setProject(emptyProject); toast.success("Project added to the archive"); },
    onError: error => toast.error(error.message),
  });
  const updateService = trpc.content.updateService.useMutation({
    onSuccess: async () => { await utils.content.list.invalidate(); setService(emptyService); setEditingServiceId(null); toast.success("Service updated"); },
    onError: error => toast.error(error.message),
  });
  const updateProject = trpc.content.updateProject.useMutation({
    onSuccess: async () => { await utils.content.list.invalidate(); setProject(emptyProject); setEditingProjectId(null); toast.success("Project updated"); },
    onError: error => toast.error(error.message),
  });
  const deleteService = trpc.content.deleteService.useMutation({ onSuccess: () => utils.content.list.invalidate(), onError: error => toast.error(error.message) });
  const deleteProject = trpc.content.deleteProject.useMutation({ onSuccess: () => utils.content.list.invalidate(), onError: error => toast.error(error.message) });
  const saveSupportChannel = trpc.support.saveChannel.useMutation({ onSuccess: () => { utils.support.channels.invalidate(); toast.success("Support channel updated"); }, onError: error => toast.error(error.message) });

  const submitService = (event: FormEvent) => {
    event.preventDefault();
    const input = { ...service, imageUrl: service.imageUrl || undefined, liveUrl: service.liveUrl || undefined, githubUrl: service.githubUrl || undefined, sortOrder: Number(service.sortOrder) || 0 };
    if (editingServiceId) updateService.mutate({ ...input, id: editingServiceId });
    else addService.mutate(input);
  };

  const submitProject = (event: FormEvent) => {
    event.preventDefault();
    const input = { ...project, imageUrl: project.imageUrl || undefined, liveUrl: project.liveUrl || undefined, githubUrl: project.githubUrl || undefined, sortOrder: Number(project.sortOrder) || 0 };
    if (editingProjectId) updateProject.mutate({ ...input, id: editingProjectId });
    else addProject.mutate(input);
  };

  return (
    <main className="min-h-screen bg-[#06080d] text-[#f5f1eb]">
      <header className="border-b border-white/10 bg-[#080b11] px-5 py-5 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-5">
          <Link href="/" className="inline-flex items-center gap-3 font-[Space_Grotesk] text-sm font-bold tracking-[0.14em] text-white transition hover:text-[#ff5a1f]"><span className="grid h-9 w-9 place-items-center border border-[#ff5a1f]/60 text-[#ff5a1f]">F//</span> FIREBOX//STUDIOS</Link>
          <div className="flex items-center gap-4">
            <Link href="/solutions" className="inline-flex items-center gap-2 font-[IBM_Plex_Mono] text-[10px] tracking-[0.14em] text-[#9da9b8] transition hover:text-white"><ArrowLeft className="h-3.5 w-3.5" /> VIEW SOLUTIONS</Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end"><div><div className="flex items-center gap-3 font-[IBM_Plex_Mono] text-[10px] tracking-[0.2em] text-[#ff5a1f]"><span className="h-2 w-2 rounded-full bg-[#ff5a1f] shadow-[0_0_12px_#ff5a1f]" /> ADMIN / CONTENT CONTROL</div><h1 className="mt-5 font-[Space_Grotesk] text-5xl font-bold tracking-[-0.06em] sm:text-7xl">OPEN THE <span className="text-[#ff5a1f]">ARCHIVE.</span></h1><p className="mt-5 max-w-2xl font-[IBM_Plex_Mono] text-xs leading-6 text-[#99a6b7]">Manage services, projects, support channels, and incoming support messages. Authentication is intentionally deferred for this prototype.</p></div><div className="inline-flex items-center gap-3 border border-[#6ae4ff]/30 bg-[#6ae4ff]/5 px-4 py-3 font-[IBM_Plex_Mono] text-[10px] tracking-[0.14em] text-[#6ae4ff]"><Database className="h-4 w-4" /> CONTENT DATABASE / ONLINE</div></div>

        <div className="mt-10 grid gap-10 xl:grid-cols-[0.85fr_1.15fr]">
          <section className="space-y-8">
            <form onSubmit={submitService} className="border border-white/10 bg-[#0a0e15] p-6 sm:p-8"><div className="flex items-start justify-between"><div><span className="font-[IBM_Plex_Mono] text-[10px] tracking-[0.16em] text-[#6ae4ff]">01 / SERVICE NODE</span><h2 className="mt-2 font-[Space_Grotesk] text-2xl font-semibold">{editingServiceId ? "EDIT SERVICE" : "ADD SERVICE"}</h2></div><Plus className="h-5 w-5 text-[#ff5a1f]" /></div><div className="mt-7 space-y-4"><label className="block"><span className="field-label">Title</span><input required value={service.title} onChange={event => setService({ ...service, title: event.target.value })} placeholder="e.g. Digital Worlds" className="field-input" /></label><label className="block"><span className="field-label">Description</span><textarea required rows={4} value={service.description} onChange={event => setService({ ...service, description: event.target.value })} placeholder="Describe the capability..." className="field-input resize-none" /></label><label className="block"><span className="field-label">Image URL <span className="text-[#738094]">(optional)</span></span><input type="url" value={service.imageUrl} onChange={event => setService({ ...service, imageUrl: event.target.value })} placeholder="https://..." className="field-input" /></label><div className="overflow-hidden border border-white/10 bg-[#0d141d]">{service.imageUrl ? <img src={service.imageUrl} alt="Service image preview" className="h-32 w-full object-cover opacity-85" /> : <div className="grid h-20 place-items-center font-[IBM_Plex_Mono] text-[10px] tracking-[0.14em] text-[#536073]">PASTE IMAGE URL / PREVIEW SIGNAL</div>}</div><label className="block"><span className="field-label">Live URL <span className="text-[#738094]">(optional)</span></span><input type="url" value={service.liveUrl} onChange={event => setService({ ...service, liveUrl: event.target.value })} placeholder="https://your-app.com" className="field-input" /></label><label className="block"><span className="field-label">GitHub URL <span className="text-[#738094]">(optional)</span></span><input type="url" value={service.githubUrl} onChange={event => setService({ ...service, githubUrl: event.target.value })} placeholder="https://github.com/..." className="field-input" /></label><label className="block"><span className="field-label">Display order</span><input type="number" min="0" value={service.sortOrder} onChange={event => setService({ ...service, sortOrder: event.target.value })} className="field-input" /></label></div><button disabled={addService.isPending || updateService.isPending} className="action-button mt-6"><Check className="h-4 w-4" /> {addService.isPending || updateService.isPending ? "WRITING..." : editingServiceId ? "UPDATE SERVICE" : "WRITE SERVICE"}</button></form>

            <form onSubmit={submitProject} className="border border-white/10 bg-[#0a0e15] p-6 sm:p-8"><div className="flex items-start justify-between"><div><span className="font-[IBM_Plex_Mono] text-[10px] tracking-[0.16em] text-[#6ae4ff]">02 / PROJECT NODE</span><h2 className="mt-2 font-[Space_Grotesk] text-2xl font-semibold">{editingProjectId ? "EDIT PROJECT" : "ADD PROJECT"}</h2></div><Plus className="h-5 w-5 text-[#ff5a1f]" /></div><div className="mt-7 space-y-4"><label className="block"><span className="field-label">Project title</span><input required value={project.title} onChange={event => setProject({ ...project, title: event.target.value })} placeholder="e.g. Terminal Horizon" className="field-input" /></label><label className="block"><span className="field-label">Client / label</span><input required value={project.client} onChange={event => setProject({ ...project, client: event.target.value })} placeholder="e.g. Internal R&D" className="field-input" /></label><label className="block"><span className="field-label">Description</span><textarea required rows={3} value={project.description} onChange={event => setProject({ ...project, description: event.target.value })} placeholder="Describe the project..." className="field-input resize-none" /></label><label className="block"><span className="field-label">Image URL <span className="text-[#738094]">(optional)</span></span><input type="url" value={project.imageUrl} onChange={event => setProject({ ...project, imageUrl: event.target.value })} placeholder="https://..." className="field-input" /></label><label className="block"><span className="field-label">Live URL <span className="text-[#738094]">(optional)</span></span><input type="url" value={project.liveUrl} onChange={event => setProject({ ...project, liveUrl: event.target.value })} placeholder="https://your-project.com" className="field-input" /></label><label className="block"><span className="field-label">GitHub URL <span className="text-[#738094]">(optional)</span></span><input type="url" value={project.githubUrl} onChange={event => setProject({ ...project, githubUrl: event.target.value })} placeholder="https://github.com/..." className="field-input" /></label><label className="block"><span className="field-label">Display order</span><input type="number" min="0" value={project.sortOrder} onChange={event => setProject({ ...project, sortOrder: event.target.value })} className="field-input" /></label></div><button disabled={addProject.isPending || updateProject.isPending} className="action-button mt-6"><Check className="h-4 w-4" /> {addProject.isPending || updateProject.isPending ? "WRITING..." : editingProjectId ? "UPDATE PROJECT" : "WRITE PROJECT"}</button></form>

            <section className="border border-white/10 bg-[#0a0e15] p-6 sm:p-8"><div><span className="font-[IBM_Plex_Mono] text-[10px] tracking-[0.16em] text-[#6ae4ff]">03 / SUPPORT CHANNELS</span><h2 className="mt-2 font-[Space_Grotesk] text-2xl font-semibold">SET SUPPORT LINKS</h2><p className="mt-3 font-[IBM_Plex_Mono] text-[10px] leading-5 text-[#8491a2]">Add a URL for each channel. WhatsApp also accepts a phone number.</p></div><div className="mt-7 space-y-4">{supportPlatforms.map((item, index) => { const form = supportForms[item.platform]; return <form key={item.platform} onSubmit={event => { event.preventDefault(); saveSupportChannel.mutate({ platform: item.platform, label: form.label, value: form.value, sortOrder: index }); }} className="border-t border-white/10 pt-4"><label className="block"><span className="field-label">{item.label}</span><input value={form.value} onChange={event => setSupportForms(current => ({ ...current, [item.platform]: { ...current[item.platform], value: event.target.value } }))} placeholder={item.hint} className="field-input" /></label><div className="mt-3 flex items-center justify-between gap-3"><span className="font-[IBM_Plex_Mono] text-[9px] text-[#536073]">{supportChannelsLoading ? "SYNCING..." : form.value ? "CONFIGURED" : "NOT CONFIGURED"}</span><button type="submit" disabled={saveSupportChannel.isPending} className="border border-[#6ae4ff]/35 px-3 py-2 font-[IBM_Plex_Mono] text-[9px] tracking-[0.12em] text-[#6ae4ff] transition hover:border-[#6ae4ff] hover:bg-[#6ae4ff]/10">SAVE</button></div></form>; })}</div></section>
          </section>

          <section className="border border-white/10 bg-[#080b11] p-6 sm:p-8"><div className="flex items-end justify-between gap-4 border-b border-white/10 pb-5"><div><span className="font-[IBM_Plex_Mono] text-[10px] tracking-[0.16em] text-[#6ae4ff]">LIVE INDEX</span><h2 className="mt-2 font-[Space_Grotesk] text-3xl font-semibold">CURRENT SIGNALS</h2></div><span className="font-[IBM_Plex_Mono] text-[10px] text-[#768397]">{isLoading ? "SYNCING" : `${(data?.services.length ?? 0) + (data?.projects.length ?? 0)} RECORDS`}</span></div>{isError && <p className="mb-6 border border-[#ff5a1f]/30 bg-[#ff5a1f]/5 px-4 py-3 font-[IBM_Plex_Mono] text-[10px] tracking-[0.12em] text-[#ffae8c]">CONTENT NODE OFFLINE / RETRY THE CONNECTION</p>}<div className="mt-8"><h3 className="font-[IBM_Plex_Mono] text-[10px] tracking-[0.16em] text-[#ff5a1f]">SERVICES</h3><div className="mt-3 divide-y divide-white/10">{data?.services.map(serviceItem => <div key={serviceItem.id} className="flex items-center justify-between gap-4 py-4"><div><p className="font-[Space_Grotesk] text-lg font-medium">{serviceItem.title}</p><p className="mt-1 font-[IBM_Plex_Mono] text-[10px] leading-5 text-[#8491a2]">{serviceItem.description}</p></div><div className="flex shrink-0 items-center gap-1"><button aria-label={`Edit ${serviceItem.title}`} onClick={() => { setEditingServiceId(serviceItem.id); setService({ title: serviceItem.title, description: serviceItem.description, imageUrl: serviceItem.imageUrl ?? "", liveUrl: serviceItem.liveUrl ?? "", githubUrl: serviceItem.githubUrl ?? "", sortOrder: String(serviceItem.sortOrder) }); }} className="p-2 text-[#687588] transition hover:text-[#6ae4ff]"><Pencil className="h-4 w-4" /></button><button aria-label={`Delete ${serviceItem.title}`} onClick={() => deleteService.mutate({ id: serviceItem.id })} className="p-2 text-[#687588] transition hover:text-[#ff5a1f]"><Trash2 className="h-4 w-4" /></button></div></div>)}</div></div><div className="mt-10"><h3 className="font-[IBM_Plex_Mono] text-[10px] tracking-[0.16em] text-[#ff5a1f]">PROJECTS</h3><div className="mt-3 divide-y divide-white/10">{data?.projects.map(projectItem => <div key={projectItem.id} className="flex items-center justify-between gap-4 py-4"><div><p className="font-[Space_Grotesk] text-lg font-medium">{projectItem.title}</p><p className="mt-1 font-[IBM_Plex_Mono] text-[10px] leading-5 text-[#8491a2]">{projectItem.client} / {projectItem.description}</p></div><div className="flex shrink-0 items-center gap-1"><button aria-label={`Edit ${projectItem.title}`} onClick={() => { setEditingProjectId(projectItem.id); setProject({ title: projectItem.title, client: projectItem.client, description: projectItem.description, imageUrl: projectItem.imageUrl ?? "", liveUrl: projectItem.liveUrl ?? "", githubUrl: projectItem.githubUrl ?? "", sortOrder: String(projectItem.sortOrder) }); }} className="p-2 text-[#687588] transition hover:text-[#6ae4ff]"><Pencil className="h-4 w-4" /></button><button aria-label={`Delete ${projectItem.title}`} onClick={() => deleteProject.mutate({ id: projectItem.id })} className="p-2 text-[#687588] transition hover:text-[#ff5a1f]"><Trash2 className="h-4 w-4" /></button></div></div>)}</div></div><div className="mt-12 border-t border-white/10 pt-8"><div className="flex items-end justify-between gap-4"><div><span className="font-[IBM_Plex_Mono] text-[10px] tracking-[0.16em] text-[#6ae4ff]">04 / SUPPORT INBOX</span><h3 className="mt-2 font-[Space_Grotesk] text-2xl font-semibold">INCOMING SIGNALS</h3></div><span className="font-[IBM_Plex_Mono] text-[10px] text-[#768397]">{supportMessagesLoading ? "SYNCING" : `${supportMessages?.length ?? 0} MESSAGES`}</span></div>{supportMessagesLoading && <p className="mt-6 font-[IBM_Plex_Mono] text-xs text-[#9eabbc]">SYNCING SUPPORT INBOX...</p>}{!supportMessagesLoading && (supportMessages?.length ?? 0) === 0 && <p className="mt-6 border border-white/10 bg-[#090d14] px-4 py-5 font-[IBM_Plex_Mono] text-[10px] tracking-[0.14em] text-[#768397]">NO SUPPORT MESSAGES YET</p>}{(supportMessages?.length ?? 0) > 0 && <div className="mt-6 space-y-4">{supportMessages?.map(message => <article key={message.id} className="border border-white/10 bg-[#090d14] p-5"><div className="flex flex-wrap items-baseline justify-between gap-3"><h4 className="font-[Space_Grotesk] text-lg font-medium">{message.name}</h4><time className="font-[IBM_Plex_Mono] text-[9px] text-[#768397]">{new Date(message.createdAt).toLocaleString()}</time></div><a href={`mailto:${message.email}`} className="mt-1 inline-block font-[IBM_Plex_Mono] text-[10px] text-[#6ae4ff] hover:text-white">{message.email}</a><p className="mt-4 whitespace-pre-wrap font-[IBM_Plex_Mono] text-xs leading-6 text-[#b5c0cf]">{message.message}</p></article>)}</div>}</div></section>
        </div>
      </div>
    </main>
  );
}
