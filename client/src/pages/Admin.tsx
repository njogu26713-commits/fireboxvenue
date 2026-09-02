import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  Boxes,
  BookOpen,
  Check,
  Database,
  HelpCircle,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import ThemeToggle from "@/components/ThemeToggle";
import BrandMark from "@/components/BrandMark";

type ServiceForm = {
  title: string;
  description: string;
  imageUrl: string;
  liveUrl: string;
  githubUrl: string;
  sortOrder: string;
};
type BlogForm = {
  title: string;
  slug: string;
  excerpt: string;
  category: "article" | "tutorial" | "case-study";
  content: string;
  imageUrl: string;
  videoUrl: string;
  author: string;
  status: "draft" | "published";
};

type ProjectForm = {
  title: string;
  client: string;
  description: string;
  imageUrl: string;
  liveUrl: string;
  githubUrl: string;
  sortOrder: string;
};

function blogVideoPreviewUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    if (parsed.hostname === "youtu.be") {
      return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
    }
    if (parsed.hostname.includes("vimeo.com")) {
      return `https://player.vimeo.com/video/${parsed.pathname.split("/").filter(Boolean).pop()}`;
    }
  } catch {
    return url;
  }
  return url;
}

const emptyService: ServiceForm = {
  title: "",
  description: "",
  imageUrl: "",
  liveUrl: "",
  githubUrl: "",
  sortOrder: "0",
};
const emptyProject: ProjectForm = {
  title: "",
  client: "",
  description: "",
  imageUrl: "",
  liveUrl: "",
  githubUrl: "",
  sortOrder: "0",
};
const emptyBlog: BlogForm = {
  title: "",
  slug: "",
  excerpt: "",
  category: "article",
  content: "",
  imageUrl: "",
  videoUrl: "",
  author: "Firebox Studios",
  status: "draft",
};
const emptyFaq: FaqForm = { question: "", answer: "", sortOrder: "0" };
const emptyDirectoryItem: DirectoryForm = {
  section: "products",
  title: "",
  description: "",
  href: "",
  sortOrder: "0",
};
const directorySections: Array<{
  value: DirectorySection;
  label: string;
  path: string;
}> = [
  { value: "products", label: "Products", path: "/products" },
  { value: "docs", label: "Documentation", path: "/docs" },
];

type SupportPlatform =
  | "whatsapp"
  | "tiktok"
  | "telegram"
  | "facebook"
  | "instagram"
  | "youtube";
type SupportForm = { label: string; value: string };
type FaqForm = { question: string; answer: string; sortOrder: string };
type DirectorySection = "products" | "developers" | "docs";
type DirectoryForm = {
  section: DirectorySection;
  title: string;
  description: string;
  href: string;
  sortOrder: string;
};
const supportPlatforms: Array<{
  platform: SupportPlatform;
  label: string;
  hint: string;
}> = [
  { platform: "whatsapp", label: "WhatsApp", hint: "Number or wa.me URL" },
  { platform: "tiktok", label: "TikTok", hint: "Profile URL" },
  { platform: "telegram", label: "Telegram", hint: "Channel or profile URL" },
  { platform: "facebook", label: "Facebook", hint: "Page URL" },
  { platform: "instagram", label: "Instagram", hint: "Profile URL" },
  { platform: "youtube", label: "YouTube", hint: "Channel URL" },
];
const emptySupportForms = Object.fromEntries(
  supportPlatforms.map(({ platform, label }) => [
    platform,
    { label, value: "" },
  ])
) as Record<SupportPlatform, SupportForm>;
const adminNavItems = [
  ["products", "01 / PRODUCTS"],
  ["services", "02 / SERVICES"],
  ["blog-editor", "03 / BLOG EDITOR"],
  ["support-channels", "03 / SUPPORT CHANNELS"],
  ["faq-editor", "04 / FAQ EDITOR"],
  ["directory-editor", "05 / RESOURCE EDITOR + URL"],
  ["live-index", "LIVE INDEX"],
  ["blog-archive", "BLOG ARCHIVE"],
  ["faq-archive", "FAQ ARCHIVE"],
  ["directory-archive", "RESOURCE ARCHIVE"],
  ["support-inbox", "SUPPORT INBOX"],
] as const;

export default function Admin() {
  const utils = trpc.useUtils();
  const { data, isLoading, isError } = trpc.content.list.useQuery();
  const { data: supportChannels, isLoading: supportChannelsLoading } =
    trpc.support.channels.useQuery();
  const { data: supportMessages, isLoading: supportMessagesLoading } =
    trpc.support.messages.useQuery();
  const { data: faqs, isLoading: faqsLoading } = trpc.faq.list.useQuery();
  const { data: directoryItems, isLoading: directoryItemsLoading } =
    trpc.directory.list.useQuery();
  const { data: blogPosts, isLoading: blogPostsLoading } =
    trpc.blog.adminList.useQuery();
  const [service, setService] = useState(emptyService);
  const [project, setProject] = useState(emptyProject);
  const [blog, setBlog] = useState(emptyBlog);
  const [editingBlogId, setEditingBlogId] = useState<number | null>(null);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [supportForms, setSupportForms] =
    useState<Record<SupportPlatform, SupportForm>>(emptySupportForms);
  const [faq, setFaq] = useState<FaqForm>(emptyFaq);
  const [editingFaqId, setEditingFaqId] = useState<number | null>(null);
  const [directoryItem, setDirectoryItem] =
    useState<DirectoryForm>(emptyDirectoryItem);
  const [editingDirectoryItemId, setEditingDirectoryItemId] = useState<
    number | null
  >(null);
  const [activeSection, setActiveSection] = useState(() =>
    typeof window === "undefined"
      ? "products"
      : window.location.hash.slice(1) || "products"
  );

  useEffect(() => {
    const syncSection = () =>
      setActiveSection(window.location.hash.slice(1) || "products");
    window.addEventListener("hashchange", syncSection);
    return () => window.removeEventListener("hashchange", syncSection);
  }, []);

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
    onSuccess: async () => {
      await utils.content.list.invalidate();
      setService(emptyService);
      toast.success("Service added to the channel");
    },
    onError: error => toast.error(error.message),
  });
  const addProject = trpc.content.addProject.useMutation({
    onSuccess: async () => {
      await utils.content.list.invalidate();
      setProject(emptyProject);
      toast.success("Project added to the archive");
    },
    onError: error => toast.error(error.message),
  });
  const updateService = trpc.content.updateService.useMutation({
    onSuccess: async () => {
      await utils.content.list.invalidate();
      setService(emptyService);
      setEditingServiceId(null);
      toast.success("Service updated");
    },
    onError: error => toast.error(error.message),
  });
  const updateProject = trpc.content.updateProject.useMutation({
    onSuccess: async () => {
      await utils.content.list.invalidate();
      setProject(emptyProject);
      setEditingProjectId(null);
      toast.success("Project updated");
    },
    onError: error => toast.error(error.message),
  });
  const deleteService = trpc.content.deleteService.useMutation({
    onSuccess: () => utils.content.list.invalidate(),
    onError: error => toast.error(error.message),
  });
  const deleteProject = trpc.content.deleteProject.useMutation({
    onSuccess: () => utils.content.list.invalidate(),
    onError: error => toast.error(error.message),
  });
  const addBlogPost = trpc.blog.add.useMutation({
    onSuccess: async () => {
      await utils.blog.adminList.invalidate();
      setBlog(emptyBlog);
      toast.success("Blog post saved");
    },
    onError: error => toast.error(error.message),
  });
  const updateBlogPost = trpc.blog.update.useMutation({
    onSuccess: async () => {
      await utils.blog.adminList.invalidate();
      setBlog(emptyBlog);
      setEditingBlogId(null);
      toast.success("Blog post updated");
    },
    onError: error => toast.error(error.message),
  });
  const deleteBlogPost = trpc.blog.delete.useMutation({
    onSuccess: () => utils.blog.adminList.invalidate(),
    onError: error => toast.error(error.message),
  });
  const saveSupportChannel = trpc.support.saveChannel.useMutation({
    onSuccess: () => {
      utils.support.channels.invalidate();
      toast.success("Support channel updated");
    },
    onError: error => toast.error(error.message),
  });
  const createFaq = trpc.faq.add.useMutation({
    onSuccess: async () => {
      await utils.faq.list.invalidate();
      setFaq(emptyFaq);
      toast.success("FAQ added to the archive");
    },
    onError: error => toast.error(error.message),
  });
  const updateFaqMutation = trpc.faq.update.useMutation({
    onSuccess: async () => {
      await utils.faq.list.invalidate();
      setFaq(emptyFaq);
      setEditingFaqId(null);
      toast.success("FAQ updated");
    },
    onError: error => toast.error(error.message),
  });
  const deleteFaqMutation = trpc.faq.delete.useMutation({
    onSuccess: () => utils.faq.list.invalidate(),
    onError: error => toast.error(error.message),
  });
  const createDirectoryItem = trpc.directory.add.useMutation({
    onSuccess: async () => {
      await utils.directory.list.invalidate();
      setDirectoryItem(emptyDirectoryItem);
      toast.success("Resource added to the directory");
    },
    onError: error => toast.error(error.message),
  });
  const updateDirectoryItemMutation = trpc.directory.update.useMutation({
    onSuccess: async () => {
      await utils.directory.list.invalidate();
      setDirectoryItem(emptyDirectoryItem);
      setEditingDirectoryItemId(null);
      toast.success("Resource updated");
    },
    onError: error => toast.error(error.message),
  });
  const deleteDirectoryItemMutation = trpc.directory.delete.useMutation({
    onSuccess: () => utils.directory.list.invalidate(),
    onError: error => toast.error(error.message),
  });

  const submitService = (event: FormEvent) => {
    event.preventDefault();
    const input = {
      ...service,
      imageUrl: service.imageUrl || undefined,
      liveUrl: service.liveUrl || undefined,
      githubUrl: service.githubUrl || undefined,
      sortOrder: Number(service.sortOrder) || 0,
    };
    if (editingServiceId)
      updateService.mutate({ ...input, id: editingServiceId });
    else addService.mutate(input);
  };

  const submitProject = (event: FormEvent) => {
    event.preventDefault();
    const input = {
      ...project,
      imageUrl: project.imageUrl || undefined,
      liveUrl: project.liveUrl || undefined,
      githubUrl: project.githubUrl || undefined,
      sortOrder: Number(project.sortOrder) || 0,
    };
    if (editingProjectId)
      updateProject.mutate({ ...input, id: editingProjectId });
    else addProject.mutate(input);
  };

  const submitBlog = (event: FormEvent) => {
    event.preventDefault();
    const input = {
      ...blog,
      imageUrl: blog.imageUrl || undefined,
      publishedAt: blog.status === "published" ? new Date() : null,
    };
    if (editingBlogId) updateBlogPost.mutate({ ...input, id: editingBlogId });
    else addBlogPost.mutate(input);
  };

  const submitFaq = (event: FormEvent) => {
    event.preventDefault();
    const input = {
      question: faq.question,
      answer: faq.answer,
      sortOrder: Number(faq.sortOrder) || 0,
    };
    if (editingFaqId) updateFaqMutation.mutate({ ...input, id: editingFaqId });
    else createFaq.mutate(input);
  };

  const submitDirectoryItem = (event: FormEvent) => {
    event.preventDefault();
    const input = {
      section: directoryItem.section,
      title: directoryItem.title,
      description: directoryItem.description,
      href: directoryItem.href || undefined,
      sortOrder: Number(directoryItem.sortOrder) || 0,
    };
    if (editingDirectoryItemId)
      updateDirectoryItemMutation.mutate({
        ...input,
        id: editingDirectoryItemId,
      });
    else createDirectoryItem.mutate(input);
  };

  return (
    <main className="min-h-screen bg-[#06080d] text-[#f5f1eb]">
      <header className="border-b border-white/10 bg-[#080b11] px-5 py-5 sm:px-8 lg:px-12">
        <div className="flex w-full items-center justify-between gap-4">
          <BrandMark />
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.14em] text-[#9da9b8] transition hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> BACK TO HOME
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="w-full px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-3 font-sans text-[10px] tracking-[0.2em] text-[#ff5a1f]">
              <span className="h-2 w-2 rounded-full bg-[#ff5a1f] shadow-[0_0_12px_#ff5a1f]" />{" "}
              ADMIN / CONTENT CONTROL
            </div>
            <h1 className="mt-5 font-sans text-5xl font-bold tracking-[-0.06em] sm:text-7xl">
              OPEN THE <span className="text-[#ff5a1f]">ARCHIVE.</span>
            </h1>
            <p className="mt-5 max-w-2xl font-sans text-xs leading-6 text-[#99a6b7]">
              Manage products, services, support channels, and incoming support
              messages. Authentication is intentionally deferred for this
              prototype.
            </p>
          </div>
          <div className="inline-flex items-center gap-3 border border-[#6ae4ff]/30 bg-[#6ae4ff]/5 px-4 py-3 font-sans text-[10px] tracking-[0.14em] text-[#6ae4ff]">
            <Database className="h-4 w-4" /> CONTENT DATABASE / ONLINE
          </div>
        </div>

        <div className="mt-10 grid gap-10 xl:grid-cols-[15rem_minmax(0,1fr)]">
          <nav
            aria-label="Admin sections"
            className="flex gap-2 overflow-x-auto border border-white/10 bg-[#080b11] p-3 xl:hidden"
          >
            {adminNavItems.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                aria-current={activeSection === id ? "page" : undefined}
                className={`shrink-0 border px-3 py-2 font-sans text-[9px] tracking-[0.12em] transition hover:border-[#ff5a1f] hover:text-[#ff5a1f] ${activeSection === id ? "border-[#ff5a1f] bg-[#ff5a1f]/10 text-[#ff5a1f]" : "border-white/10 text-[#9da9b8]"}`}
              >
                {label}
              </a>
            ))}
          </nav>
          <aside className="hidden self-start xl:sticky xl:top-6 xl:block">
            <nav
              aria-label="Admin sections"
              className="relative overflow-hidden border border-white/15 bg-[#080b11] p-3 shadow-[0_18px_50px_rgba(0,0,0,0.24)]"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff5a1f] to-transparent" />
              <div className="flex items-end justify-between border-b border-white/10 px-2 pb-4 pt-2">
                <div>
                  <p className="font-sans text-[9px] font-semibold tracking-[0.18em] text-[#6ae4ff]">
                    CONTROL DECK
                  </p>
                  <p className="mt-1 font-sans text-[8px] tracking-[0.12em] text-[#536073]">
                    ADMIN INDEX / {adminNavItems.length} NODES
                  </p>
                </div>
                <span className="h-2 w-2 rounded-full bg-[#ff5a1f] shadow-[0_0_12px_#ff5a1f]" />
              </div>
              <div className="mt-3 space-y-1">
                {adminNavItems.map(([id, label], index) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    aria-current={activeSection === id ? "page" : undefined}
                    className={`group flex min-h-10 items-center gap-3 border px-3 py-2 font-sans text-[9px] tracking-[0.1em] transition duration-200 hover:border-[#ff5a1f]/50 hover:bg-[#ff5a1f]/5 hover:text-[#ffae8c] ${index === 5 ? "mt-4 border-t-white/10" : "border-transparent"} ${activeSection === id ? "border-[#ff5a1f]/50 bg-[#ff5a1f]/10 text-[#ffae8c] shadow-[inset_3px_0_0_#ff5a1f]" : "text-[#9da9b8]"}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full transition ${activeSection === id ? "bg-[#ff5a1f] shadow-[0_0_8px_#ff5a1f]" : "bg-[#354052] group-hover:bg-[#ff5a1f]"}`}
                    />
                    <span className="leading-4">{label}</span>
                    <span
                      className={`ml-auto text-sm transition ${activeSection === id ? "translate-x-0 text-[#ff5a1f]" : "-translate-x-1 text-transparent group-hover:translate-x-0 group-hover:text-[#6ae4ff]"}`}
                    >
                      ›
                    </span>
                  </a>
                ))}
              </div>
            </nav>
          </aside>
          <section
            className={`space-y-8 ${activeSection === "live-index" || activeSection === "blog-archive" || activeSection === "faq-archive" || activeSection === "directory-archive" || activeSection === "support-inbox" ? "xl:hidden" : ""}`}
          >
            <form
              id="products"
              onSubmit={submitService}
              className={`scroll-mt-28 border border-white/10 bg-[#0a0e15] p-6 sm:p-8 ${activeSection === "products" ? "" : "hidden"}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-sans text-[10px] tracking-[0.16em] text-[#6ae4ff]">
                    01 / PRODUCT NODE
                  </span>
                  <h2 className="mt-2 font-sans text-2xl font-semibold">
                    {editingServiceId ? "EDIT PRODUCT" : "ADD PRODUCT"}
                  </h2>
                </div>
                <Plus className="h-5 w-5 text-[#ff5a1f]" />
              </div>
              <div className="mt-7 space-y-4">
                <label className="block">
                  <span className="field-label">Title</span>
                  <input
                    required
                    value={service.title}
                    onChange={event =>
                      setService({ ...service, title: event.target.value })
                    }
                    placeholder="e.g. Digital Worlds"
                    className="field-input"
                  />
                </label>
                <label className="block">
                  <span className="field-label">Description</span>
                  <textarea
                    required
                    rows={4}
                    value={service.description}
                    onChange={event =>
                      setService({
                        ...service,
                        description: event.target.value,
                      })
                    }
                    placeholder="Describe the capability..."
                    className="field-input resize-none"
                  />
                </label>
                <label className="block">
                  <span className="field-label">
                    Image URL <span className="text-[#738094]">(optional)</span>
                  </span>
                  <input
                    type="url"
                    value={service.imageUrl}
                    onChange={event =>
                      setService({ ...service, imageUrl: event.target.value })
                    }
                    placeholder="https://..."
                    className="field-input"
                  />
                </label>
                <div className="overflow-hidden border border-white/10 bg-[#0d141d]">
                  {service.imageUrl ? (
                    <img
                      src={service.imageUrl}
                      alt="Product image preview"
                      className="h-32 w-full object-cover opacity-85"
                    />
                  ) : (
                    <div className="grid h-20 place-items-center font-sans text-[10px] tracking-[0.14em] text-[#536073]">
                      PASTE IMAGE URL / PREVIEW SIGNAL
                    </div>
                  )}
                </div>
                <label className="block">
                  <span className="field-label">
                    Live URL <span className="text-[#738094]">(optional)</span>
                  </span>
                  <input
                    type="url"
                    value={service.liveUrl}
                    onChange={event =>
                      setService({ ...service, liveUrl: event.target.value })
                    }
                    placeholder="https://your-app.com"
                    className="field-input"
                  />
                </label>
                <label className="block">
                  <span className="field-label">
                    GitHub URL{" "}
                    <span className="text-[#738094]">(optional)</span>
                  </span>
                  <input
                    type="url"
                    value={service.githubUrl}
                    onChange={event =>
                      setService({ ...service, githubUrl: event.target.value })
                    }
                    placeholder="https://github.com/..."
                    className="field-input"
                  />
                </label>
                <label className="block">
                  <span className="field-label">Display order</span>
                  <input
                    type="number"
                    min="0"
                    value={service.sortOrder}
                    onChange={event =>
                      setService({ ...service, sortOrder: event.target.value })
                    }
                    className="field-input"
                  />
                </label>
              </div>
              <button
                disabled={addService.isPending || updateService.isPending}
                className="action-button mt-6"
              >
                <Check className="h-4 w-4" />{" "}
                {addService.isPending || updateService.isPending
                  ? "WRITING..."
                  : editingServiceId
                    ? "UPDATE PRODUCT"
                    : "WRITE PRODUCT"}
              </button>
            </form>

            <form
              id="services"
              onSubmit={submitProject}
              className={`scroll-mt-28 border border-white/10 bg-[#0a0e15] p-6 sm:p-8 ${activeSection === "services" ? "" : "hidden"}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-sans text-[10px] tracking-[0.16em] text-[#6ae4ff]">
                    02 / SERVICE NODE
                  </span>
                  <h2 className="mt-2 font-sans text-2xl font-semibold">
                    {editingProjectId ? "EDIT SERVICE" : "ADD SERVICE"}
                  </h2>
                </div>
                <Plus className="h-5 w-5 text-[#ff5a1f]" />
              </div>
              <div className="mt-7 space-y-4">
                <label className="block">
                  <span className="field-label">Service title</span>
                  <input
                    required
                    value={project.title}
                    onChange={event =>
                      setProject({ ...project, title: event.target.value })
                    }
                    placeholder="e.g. Terminal Horizon"
                    className="field-input"
                  />
                </label>
                <label className="block">
                  <span className="field-label">Service label</span>
                  <input
                    required
                    value={project.client}
                    onChange={event =>
                      setProject({ ...project, client: event.target.value })
                    }
                    placeholder="e.g. Internal R&D"
                    className="field-input"
                  />
                </label>
                <label className="block">
                  <span className="field-label">Description</span>
                  <textarea
                    required
                    rows={3}
                    value={project.description}
                    onChange={event =>
                      setProject({
                        ...project,
                        description: event.target.value,
                      })
                    }
                    placeholder="Describe the service offering..."
                    className="field-input resize-none"
                  />
                </label>
                <label className="block">
                  <span className="field-label">
                    Image URL <span className="text-[#738094]">(optional)</span>
                  </span>
                  <input
                    type="url"
                    value={project.imageUrl}
                    onChange={event =>
                      setProject({ ...project, imageUrl: event.target.value })
                    }
                    placeholder="https://..."
                    className="field-input"
                  />
                </label>
                <label className="block">
                  <span className="field-label">
                    Live URL <span className="text-[#738094]">(optional)</span>
                  </span>
                  <input
                    type="url"
                    value={project.liveUrl}
                    onChange={event =>
                      setProject({ ...project, liveUrl: event.target.value })
                    }
                    placeholder="https://your-project.com"
                    className="field-input"
                  />
                </label>
                <label className="block">
                  <span className="field-label">
                    GitHub URL{" "}
                    <span className="text-[#738094]">(optional)</span>
                  </span>
                  <input
                    type="url"
                    value={project.githubUrl}
                    onChange={event =>
                      setProject({ ...project, githubUrl: event.target.value })
                    }
                    placeholder="https://github.com/..."
                    className="field-input"
                  />
                </label>
                <label className="block">
                  <span className="field-label">Display order</span>
                  <input
                    type="number"
                    min="0"
                    value={project.sortOrder}
                    onChange={event =>
                      setProject({ ...project, sortOrder: event.target.value })
                    }
                    className="field-input"
                  />
                </label>
              </div>
              <button
                disabled={addProject.isPending || updateProject.isPending}
                className="action-button mt-6"
              >
                <Check className="h-4 w-4" />{" "}
                {addProject.isPending || updateProject.isPending
                  ? "WRITING..."
                  : editingProjectId
                    ? "UPDATE SERVICE"
                    : "WRITE SERVICE"}
              </button>
            </form>

            <form
              id="blog-editor"
              onSubmit={submitBlog}
              className={`scroll-mt-28 border border-white/10 bg-[#0a0e15] p-6 sm:p-8 ${activeSection === "blog-editor" ? "" : "hidden"}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-sans text-[10px] tracking-[0.16em] text-[#6ae4ff]">
                    03 / BLOG NODE
                  </span>
                  <h2 className="mt-2 font-sans text-2xl font-semibold">
                    {editingBlogId ? "EDIT BLOG POST" : "WRITE BLOG POST"}
                  </h2>
                </div>
                <BookOpen className="h-5 w-5 text-[#ff5a1f]" />
              </div>
              <div className="mt-7 space-y-4">
                <label className="block">
                  <span className="field-label">Title</span>
                  <input
                    required
                    value={blog.title}
                    onChange={event =>
                      setBlog({ ...blog, title: event.target.value })
                    }
                    placeholder="e.g. Designing digital systems that feel alive"
                    className="field-input"
                  />
                </label>
                <label className="block">
                  <span className="field-label">Slug</span>
                  <input
                    required
                    pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                    value={blog.slug}
                    onChange={event =>
                      setBlog({ ...blog, slug: event.target.value })
                    }
                    placeholder="designing-digital-systems"
                    className="field-input"
                  />
                </label>
                <label className="block">
                  <span className="field-label">Excerpt</span>
                  <textarea
                    required
                    rows={3}
                    maxLength={500}
                    value={blog.excerpt}
                    onChange={event =>
                      setBlog({ ...blog, excerpt: event.target.value })
                    }
                    placeholder="A short summary for the blog index..."
                    className="field-input resize-none"
                  />
                </label>
                <label className="block">
                  <span className="field-label">Post type</span>
                  <select
                    value={blog.category}
                    onChange={event =>
                      setBlog({
                        ...blog,
                        category: event.target.value as BlogForm["category"],
                      })
                    }
                    className="field-input"
                  >
                    <option value="article">Article</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="case-study">Case study</option>
                  </select>
                </label>
                <label className="block">
                  <span className="field-label">Article content</span>
                  <textarea
                    required
                    rows={12}
                    value={blog.content}
                    onChange={event =>
                      setBlog({ ...blog, content: event.target.value })
                    }
                    placeholder="Write the full article here..."
                    className="field-input resize-y"
                  />
                </label>
                <label className="block">
                  <span className="field-label">
                    Featured image URL{" "}
                    <span className="text-[#738094]">(optional)</span>
                  </span>
                  <input
                    type="url"
                    value={blog.imageUrl}
                    onChange={event =>
                      setBlog({ ...blog, imageUrl: event.target.value })
                    }
                    placeholder="https://..."
                    className="field-input"
                  />
                </label>
                <label className="block">
                  <span className="field-label">
                    Video URL{" "}
                    <span className="text-[#738094]">
                      (YouTube, Vimeo, or direct video)
                    </span>
                  </span>
                  <input
                    type="url"
                    value={blog.videoUrl}
                    onChange={event =>
                      setBlog({ ...blog, videoUrl: event.target.value })
                    }
                    placeholder="https://youtube.com/watch?v=..."
                    className="field-input"
                  />
                  {blog.videoUrl && (
                    <iframe
                      title="Blog video preview"
                      src={blogVideoPreviewUrl(blog.videoUrl)}
                      className="mt-3 aspect-video w-full border border-white/10 bg-black"
                      allowFullScreen
                    />
                  )}
                </label>
                <label className="block">
                  <span className="field-label">Author</span>
                  <input
                    required
                    value={blog.author}
                    onChange={event =>
                      setBlog({ ...blog, author: event.target.value })
                    }
                    className="field-input"
                  />
                </label>
                <label className="block">
                  <span className="field-label">Publication status</span>
                  <select
                    value={blog.status}
                    onChange={event =>
                      setBlog({
                        ...blog,
                        status: event.target.value as BlogForm["status"],
                      })
                    }
                    className="field-input"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </label>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  disabled={addBlogPost.isPending || updateBlogPost.isPending}
                  className="action-button"
                >
                  <Check className="h-4 w-4" />{" "}
                  {addBlogPost.isPending || updateBlogPost.isPending
                    ? "WRITING..."
                    : editingBlogId
                      ? "UPDATE BLOG POST"
                      : "SAVE BLOG POST"}
                </button>
                {editingBlogId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBlogId(null);
                      setBlog(emptyBlog);
                    }}
                    className="border border-white/20 px-4 py-3 font-sans text-[10px] tracking-[0.12em] text-[#9da9b8]"
                  >
                    CANCEL
                  </button>
                )}
              </div>
            </form>

            <section
              id="support-channels"
              className={`scroll-mt-28 border border-white/10 bg-[#0a0e15] p-6 sm:p-8 ${activeSection === "support-channels" ? "" : "hidden"}`}
            >
              <div>
                <span className="font-sans text-[10px] tracking-[0.16em] text-[#6ae4ff]">
                  03 / SUPPORT CHANNELS
                </span>
                <h2 className="mt-2 font-sans text-2xl font-semibold">
                  SET SUPPORT LINKS
                </h2>
                <p className="mt-3 font-sans text-[10px] leading-5 text-[#8491a2]">
                  Add a URL for each channel. WhatsApp also accepts a phone
                  number.
                </p>
              </div>
              <div className="mt-7 space-y-4">
                {supportPlatforms.map((item, index) => {
                  const form = supportForms[item.platform];
                  return (
                    <form
                      key={item.platform}
                      onSubmit={event => {
                        event.preventDefault();
                        saveSupportChannel.mutate({
                          platform: item.platform,
                          label: form.label,
                          value: form.value,
                          sortOrder: index,
                        });
                      }}
                      className="border-t border-white/10 pt-4"
                    >
                      <label className="block">
                        <span className="field-label">{item.label}</span>
                        <input
                          value={form.value}
                          onChange={event =>
                            setSupportForms(current => ({
                              ...current,
                              [item.platform]: {
                                ...current[item.platform],
                                value: event.target.value,
                              },
                            }))
                          }
                          placeholder={item.hint}
                          className="field-input"
                        />
                      </label>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="font-sans text-[9px] text-[#536073]">
                          {supportChannelsLoading
                            ? "SYNCING..."
                            : form.value
                              ? "CONFIGURED"
                              : "NOT CONFIGURED"}
                        </span>
                        <button
                          type="submit"
                          disabled={saveSupportChannel.isPending}
                          className="border border-[#6ae4ff]/35 px-3 py-2 font-sans text-[9px] tracking-[0.12em] text-[#6ae4ff] transition hover:border-[#6ae4ff] hover:bg-[#6ae4ff]/10"
                        >
                          SAVE
                        </button>
                      </div>
                    </form>
                  );
                })}
              </div>
            </section>

            <form
              id="faq-editor"
              onSubmit={submitFaq}
              className={`scroll-mt-28 border border-white/10 bg-[#0a0e15] p-6 sm:p-8 ${activeSection === "faq-editor" ? "" : "hidden"}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-sans text-[10px] tracking-[0.16em] text-[#6ae4ff]">
                    04 / FAQ NODE
                  </span>
                  <h2 className="mt-2 font-sans text-2xl font-semibold">
                    {editingFaqId ? "EDIT FAQ" : "ADD FAQ"}
                  </h2>
                </div>
                <HelpCircle className="h-5 w-5 text-[#ff5a1f]" />
              </div>
              <div className="mt-7 space-y-4">
                <label className="block">
                  <span className="field-label">Question</span>
                  <input
                    required
                    maxLength={255}
                    value={faq.question}
                    onChange={event =>
                      setFaq({ ...faq, question: event.target.value })
                    }
                    placeholder="e.g. What does Firebox build?"
                    className="field-input"
                  />
                </label>
                <label className="block">
                  <span className="field-label">Answer</span>
                  <textarea
                    required
                    maxLength={5000}
                    rows={6}
                    value={faq.answer}
                    onChange={event =>
                      setFaq({ ...faq, answer: event.target.value })
                    }
                    placeholder="Write a clear answer..."
                    className="field-input resize-none"
                  />
                </label>
                <label className="block">
                  <span className="field-label">Display order</span>
                  <input
                    type="number"
                    min="0"
                    value={faq.sortOrder}
                    onChange={event =>
                      setFaq({ ...faq, sortOrder: event.target.value })
                    }
                    className="field-input"
                  />
                </label>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={createFaq.isPending || updateFaqMutation.isPending}
                  className="action-button"
                >
                  <Check className="h-4 w-4" />{" "}
                  {createFaq.isPending || updateFaqMutation.isPending
                    ? "WRITING..."
                    : editingFaqId
                      ? "UPDATE FAQ"
                      : "WRITE FAQ"}
                </button>
                {editingFaqId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingFaqId(null);
                      setFaq(emptyFaq);
                    }}
                    className="border border-white/20 px-4 py-3 font-sans text-[10px] tracking-[0.12em] text-[#9da9b8] transition hover:border-[#ff5a1f] hover:text-[#ff5a1f]"
                  >
                    CANCEL
                  </button>
                )}
              </div>
            </form>
            <form
              id="directory-editor"
              onSubmit={submitDirectoryItem}
              className={`scroll-mt-28 border border-white/10 bg-[#0a0e15] p-6 sm:p-8 ${activeSection === "directory-editor" ? "" : "hidden"}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-sans text-[10px] tracking-[0.16em] text-[#6ae4ff]">
                    05 / RESOURCE NODE + URL
                  </span>
                  <h2 className="mt-2 font-sans text-2xl font-semibold">
                    {editingDirectoryItemId
                      ? "EDIT RESOURCE"
                      : "ADD RESOURCE + URL"}
                  </h2>
                </div>
                <Boxes className="h-5 w-5 text-[#ff5a1f]" />
              </div>
              <div className="mt-7 space-y-4">
                <label className="block">
                  <span className="field-label">Section</span>
                  <select
                    value={directoryItem.section}
                    onChange={event =>
                      setDirectoryItem({
                        ...directoryItem,
                        section: event.target.value as DirectorySection,
                      })
                    }
                    className="field-input"
                  >
                    <option value="products">Products</option>
                    <option value="docs">Documentation</option>
                  </select>
                </label>
                <label className="block">
                  <span className="field-label">Title</span>
                  <input
                    required
                    maxLength={255}
                    value={directoryItem.title}
                    onChange={event =>
                      setDirectoryItem({
                        ...directoryItem,
                        title: event.target.value,
                      })
                    }
                    placeholder="e.g. Firebox Starter Kit"
                    className="field-input"
                  />
                </label>
                <label className="block">
                  <span className="field-label">Description</span>
                  <textarea
                    required
                    maxLength={2000}
                    rows={5}
                    value={directoryItem.description}
                    onChange={event =>
                      setDirectoryItem({
                        ...directoryItem,
                        description: event.target.value,
                      })
                    }
                    placeholder="Describe this resource..."
                    className="field-input resize-none"
                  />
                </label>
                <label className="block rounded-sm border border-[#6ae4ff]/25 bg-[#6ae4ff]/[0.04] p-4">
                  <span className="field-label text-[#6ae4ff]">
                    Resource URL / Link{" "}
                    <span className="text-[#738094]">(optional)</span>
                  </span>
                  <p className="mb-3 font-sans text-[10px] leading-5 text-[#8491a2]">
                    Add the page URL for this{" "}
                    {directoryItem.section === "docs"
                      ? "documentation entry"
                      : "product"}
                    .
                  </p>
                  <input
                    value={directoryItem.href}
                    onChange={event =>
                      setDirectoryItem({
                        ...directoryItem,
                        href: event.target.value,
                      })
                    }
                    placeholder="Paste https://... or /path here"
                    aria-label="Resource URL or link"
                    className="field-input"
                  />
                </label>
                <label className="block">
                  <span className="field-label">Display order</span>
                  <input
                    type="number"
                    min="0"
                    value={directoryItem.sortOrder}
                    onChange={event =>
                      setDirectoryItem({
                        ...directoryItem,
                        sortOrder: event.target.value,
                      })
                    }
                    className="field-input"
                  />
                </label>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={
                    createDirectoryItem.isPending ||
                    updateDirectoryItemMutation.isPending
                  }
                  className="action-button"
                >
                  <Check className="h-4 w-4" />{" "}
                  {createDirectoryItem.isPending ||
                  updateDirectoryItemMutation.isPending
                    ? "WRITING..."
                    : editingDirectoryItemId
                      ? "UPDATE RESOURCE"
                      : "WRITE RESOURCE"}
                </button>
                {editingDirectoryItemId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingDirectoryItemId(null);
                      setDirectoryItem(emptyDirectoryItem);
                    }}
                    className="border border-white/20 px-4 py-3 font-sans text-[10px] tracking-[0.12em] text-[#9da9b8] transition hover:border-[#ff5a1f] hover:text-[#ff5a1f]"
                  >
                    CANCEL
                  </button>
                )}
              </div>
            </form>
          </section>

          <section
            id="live-index"
            className={`scroll-mt-28 border border-white/10 bg-[#080b11] p-6 sm:p-8 ${activeSection === "live-index" || activeSection === "faq-archive" || activeSection === "directory-archive" || activeSection === "support-inbox" || activeSection === "blog-archive" ? "" : "hidden"}`}
          >
            <div
              className={`${activeSection === "live-index" ? "" : "hidden"} flex items-end justify-between gap-4 border-b border-white/10 pb-5`}
            >
              <div>
                <span className="font-sans text-[10px] tracking-[0.16em] text-[#6ae4ff]">
                  LIVE INDEX
                </span>
                <h2 className="mt-2 font-sans text-3xl font-semibold">
                  CURRENT SIGNALS
                </h2>
              </div>
              <span className="font-sans text-[10px] text-[#768397]">
                {isLoading || faqsLoading || directoryItemsLoading
                  ? "SYNCING"
                  : `${(data?.products.length ?? 0) + (data?.services.length ?? 0) + (faqs?.length ?? 0) + (directoryItems?.length ?? 0)} RECORDS`}
              </span>
            </div>
            {isError && (
              <p className="mb-6 border border-[#ff5a1f]/30 bg-[#ff5a1f]/5 px-4 py-3 font-sans text-[10px] tracking-[0.12em] text-[#ffae8c]">
                CONTENT NODE OFFLINE / RETRY THE CONNECTION
              </p>
            )}
            <div
              className={`${activeSection === "live-index" ? "" : "hidden"} mt-8`}
            >
              <h3 className="font-sans text-[10px] tracking-[0.16em] text-[#ff5a1f]">
                PRODUCTS
              </h3>
              <div className="mt-3 divide-y divide-white/10">
                {data?.products.map(serviceItem => (
                  <div
                    key={serviceItem.id}
                    className="flex items-center justify-between gap-4 py-4"
                  >
                    <div>
                      <p className="font-sans text-lg font-medium">
                        {serviceItem.title}
                      </p>
                      <p className="mt-1 font-sans text-[10px] leading-5 text-[#8491a2]">
                        {serviceItem.description}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        aria-label={`Edit ${serviceItem.title}`}
                        onClick={() => {
                          setActiveSection("products");
                          setEditingServiceId(serviceItem.id);
                          setService({
                            title: serviceItem.title,
                            description: serviceItem.description,
                            imageUrl: serviceItem.imageUrl ?? "",
                            liveUrl: serviceItem.liveUrl ?? "",
                            githubUrl: serviceItem.githubUrl ?? "",
                            sortOrder: String(serviceItem.sortOrder),
                          });
                        }}
                        className="p-2 text-[#687588] transition hover:text-[#6ae4ff]"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        aria-label={`Delete ${serviceItem.title}`}
                        onClick={() =>
                          deleteService.mutate({ id: serviceItem.id })
                        }
                        className="p-2 text-[#687588] transition hover:text-[#ff5a1f]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div
              className={`${activeSection === "live-index" ? "" : "hidden"} mt-10`}
            >
              <h3 className="font-sans text-[10px] tracking-[0.16em] text-[#ff5a1f]">
                SERVICES
              </h3>
              <div className="mt-3 divide-y divide-white/10">
                {data?.services.map(projectItem => (
                  <div
                    key={projectItem.id}
                    className="flex items-center justify-between gap-4 py-4"
                  >
                    <div>
                      <p className="font-sans text-lg font-medium">
                        {projectItem.title}
                      </p>
                      <p className="mt-1 font-sans text-[10px] leading-5 text-[#8491a2]">
                        {projectItem.client} / {projectItem.description}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        aria-label={`Edit ${projectItem.title}`}
                        onClick={() => {
                          setActiveSection("services");
                          setEditingProjectId(projectItem.id);
                          setProject({
                            title: projectItem.title,
                            client: projectItem.client,
                            description: projectItem.description,
                            imageUrl: projectItem.imageUrl ?? "",
                            liveUrl: projectItem.liveUrl ?? "",
                            githubUrl: projectItem.githubUrl ?? "",
                            sortOrder: String(projectItem.sortOrder),
                          });
                        }}
                        className="p-2 text-[#687588] transition hover:text-[#6ae4ff]"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        aria-label={`Delete ${projectItem.title}`}
                        onClick={() =>
                          deleteProject.mutate({ id: projectItem.id })
                        }
                        className="p-2 text-[#687588] transition hover:text-[#ff5a1f]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div
              className={`${activeSection === "blog-archive" ? "" : "hidden"} mt-12 border-t border-white/10 pt-8`}
            >
              <div className="flex items-end justify-between gap-4">
                <div>
                  <span className="font-sans text-[10px] tracking-[0.16em] text-[#ff5a1f]">
                    BLOG ARCHIVE
                  </span>
                  <h3 className="mt-2 font-sans text-2xl font-semibold">
                    ALL POSTS
                  </h3>
                </div>
                <span className="font-sans text-[10px] text-[#768397]">
                  {blogPostsLoading
                    ? "SYNCING"
                    : `${blogPosts?.length ?? 0} POSTS`}
                </span>
              </div>
              {(blogPosts?.length ?? 0) === 0 && !blogPostsLoading && (
                <p className="mt-6 border border-white/10 bg-[#090d14] px-4 py-5 font-sans text-[10px] tracking-[0.14em] text-[#768397]">
                  NO BLOG POSTS YET
                </p>
              )}
              <div className="mt-6 divide-y divide-white/10">
                {blogPosts?.map(post => (
                  <div
                    key={post.id}
                    className="flex items-start justify-between gap-4 py-4"
                  >
                    <div>
                      <p className="font-sans text-lg font-medium">
                        {post.title}
                      </p>
                      <p className="mt-1 font-sans text-[10px] text-[#8491a2]">
                        {post.status.toUpperCase()} / {post.author}
                      </p>
                      <p className="mt-2 font-sans text-[10px] leading-5 text-[#8491a2]">
                        {post.excerpt}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        aria-label={`Edit ${post.title}`}
                        onClick={() => {
                          setActiveSection("blog-editor");
                          setEditingBlogId(post.id);
                          setBlog({
                            title: post.title,
                            slug: post.slug,
                            excerpt: post.excerpt,
                            category: post.category,
                            content: post.content,
                            imageUrl: post.imageUrl ?? "",
                            videoUrl: post.videoUrl ?? "",
                            author: post.author,
                            status: post.status,
                          });
                        }}
                        className="p-2 text-[#687588] hover:text-[#6ae4ff]"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        aria-label={`Delete ${post.title}`}
                        onClick={() => deleteBlogPost.mutate({ id: post.id })}
                        className="p-2 text-[#687588] hover:text-[#ff5a1f]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div
              id="faq-archive"
              className={`mt-12 scroll-mt-28 border-t border-white/10 pt-8 ${activeSection === "faq-archive" ? "" : "hidden"}`}
            >
              <div className="flex items-end justify-between gap-4">
                <div>
                  <span className="font-sans text-[10px] tracking-[0.16em] text-[#ff5a1f]">
                    04 / FAQ ARCHIVE
                  </span>
                  <h3 className="mt-2 font-sans text-2xl font-semibold">
                    FREQUENT SIGNALS
                  </h3>
                </div>
                <span className="font-sans text-[10px] text-[#768397]">
                  {faqsLoading ? "SYNCING" : `${faqs?.length ?? 0} ENTRIES`}
                </span>
              </div>
              {!faqsLoading && (faqs?.length ?? 0) === 0 && (
                <p className="mt-6 border border-white/10 bg-[#090d14] px-4 py-5 font-sans text-[10px] tracking-[0.14em] text-[#768397]">
                  NO FAQ ENTRIES YET
                </p>
              )}
              {(faqs?.length ?? 0) > 0 && (
                <div className="mt-6 divide-y divide-white/10">
                  {faqs?.map(faqItem => (
                    <div
                      key={faqItem.id}
                      className="flex items-start justify-between gap-4 py-4"
                    >
                      <div>
                        <p className="font-sans text-lg font-medium">
                          {faqItem.question}
                        </p>
                        <p className="mt-2 font-sans text-[10px] leading-5 text-[#8491a2]">
                          {faqItem.answer}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          aria-label={`Edit ${faqItem.question}`}
                          onClick={() => {
                            setActiveSection("faq-editor");
                            setEditingFaqId(faqItem.id);
                            setFaq({
                              question: faqItem.question,
                              answer: faqItem.answer,
                              sortOrder: String(faqItem.sortOrder),
                            });
                          }}
                          className="p-2 text-[#687588] transition hover:text-[#6ae4ff]"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          aria-label={`Delete ${faqItem.question}`}
                          onClick={() =>
                            deleteFaqMutation.mutate({ id: faqItem.id })
                          }
                          className="p-2 text-[#687588] transition hover:text-[#ff5a1f]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div
              id="directory-archive"
              className={`mt-12 scroll-mt-28 border-t border-white/10 pt-8 ${activeSection === "directory-archive" ? "" : "hidden"}`}
            >
              <div className="flex items-end justify-between gap-4">
                <div>
                  <span className="font-sans text-[10px] tracking-[0.16em] text-[#ff5a1f]">
                    RESOURCE ARCHIVE
                  </span>
                  <h3 className="mt-2 font-sans text-2xl font-semibold">
                    PRODUCTS / DOCS
                  </h3>
                </div>
                <span className="font-sans text-[10px] text-[#768397]">
                  {directoryItemsLoading
                    ? "SYNCING"
                    : `${directoryItems?.length ?? 0} ENTRIES`}
                </span>
              </div>
              {!directoryItemsLoading &&
                (directoryItems?.length ?? 0) === 0 && (
                  <p className="mt-6 border border-white/10 bg-[#090d14] px-4 py-5 font-sans text-[10px] tracking-[0.14em] text-[#768397]">
                    NO RESOURCES PUBLISHED YET
                  </p>
                )}
              {(directoryItems?.length ?? 0) > 0 && (
                <div className="mt-6 divide-y divide-white/10">
                  {directoryItems?.map(item => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-4 py-4"
                    >
                      <div>
                        <p className="font-sans text-lg font-medium">
                          {item.title}
                        </p>
                        <p className="mt-1 font-sans text-[10px] leading-5 text-[#8491a2]">
                          {
                            directorySections.find(
                              section => section.value === item.section
                            )?.label
                          }{" "}
                          / {item.description}
                        </p>
                        {item.href && (
                          <p className="mt-2 font-sans text-[10px] text-[#6ae4ff]">
                            {item.href}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          aria-label={`Edit ${item.title}`}
                          onClick={() => {
                            setActiveSection("directory-editor");
                            setEditingDirectoryItemId(item.id);
                            setDirectoryItem({
                              section: item.section,
                              title: item.title,
                              description: item.description,
                              href: item.href ?? "",
                              sortOrder: String(item.sortOrder),
                            });
                          }}
                          className="p-2 text-[#687588] transition hover:text-[#6ae4ff]"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          aria-label={`Delete ${item.title}`}
                          onClick={() =>
                            deleteDirectoryItemMutation.mutate({ id: item.id })
                          }
                          className="p-2 text-[#687588] transition hover:text-[#ff5a1f]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div
              id="support-inbox"
              className={`mt-12 scroll-mt-28 border-t border-white/10 pt-8 ${activeSection === "support-inbox" ? "" : "hidden"}`}
            >
              <div className="flex items-end justify-between gap-4">
                <div>
                  <span className="font-sans text-[10px] tracking-[0.16em] text-[#6ae4ff]">
                    05 / SUPPORT INBOX
                  </span>
                  <h3 className="mt-2 font-sans text-2xl font-semibold">
                    INCOMING SIGNALS
                  </h3>
                </div>
                <span className="font-sans text-[10px] text-[#768397]">
                  {supportMessagesLoading
                    ? "SYNCING"
                    : `${supportMessages?.length ?? 0} MESSAGES`}
                </span>
              </div>
              {supportMessagesLoading && (
                <p className="mt-6 font-sans text-xs text-[#9eabbc]">
                  SYNCING SUPPORT INBOX...
                </p>
              )}
              {!supportMessagesLoading &&
                (supportMessages?.length ?? 0) === 0 && (
                  <p className="mt-6 border border-white/10 bg-[#090d14] px-4 py-5 font-sans text-[10px] tracking-[0.14em] text-[#768397]">
                    NO SUPPORT MESSAGES YET
                  </p>
                )}
              {(supportMessages?.length ?? 0) > 0 && (
                <div className="mt-6 space-y-4">
                  {supportMessages?.map(message => (
                    <article
                      key={message.id}
                      className="border border-white/10 bg-[#090d14] p-5"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <h4 className="font-sans text-lg font-medium">
                          {message.name}
                        </h4>
                        <time className="font-sans text-[9px] text-[#768397]">
                          {new Date(message.createdAt).toLocaleString()}
                        </time>
                      </div>
                      <a
                        href={`mailto:${message.email}`}
                        className="mt-1 inline-block font-sans text-[10px] text-[#6ae4ff] hover:text-white"
                      >
                        {message.email}
                      </a>
                      <p className="mt-4 inline-flex border border-[#ff5a1f]/30 bg-[#ff5a1f]/5 px-2.5 py-1 font-sans text-[9px] tracking-[0.12em] text-[#ffae8c]">
                        {message.topic || "General inquiry"}
                      </p>
                      <p className="mt-4 whitespace-pre-wrap font-sans text-xs leading-6 text-[#b5c0cf]">
                        {message.message}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
