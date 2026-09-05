import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  Camera,
  Facebook,
  HelpCircle,
  Instagram,
  MessageCircle,
  Music2,
  Play,
  Send,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import ThemeToggle from "@/components/ThemeToggle";
import BrandMark from "@/components/BrandMark";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type SupportPlatform =
  | "whatsapp"
  | "tiktok"
  | "telegram"
  | "facebook"
  | "instagram"
  | "youtube";

const platformLabels: Record<SupportPlatform, string> = {
  whatsapp: "WhatsApp",
  tiktok: "TikTok",
  telegram: "Telegram",
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
};

function platformIcon(platform: SupportPlatform) {
  const icons = {
    whatsapp: MessageCircle,
    tiktok: Music2,
    telegram: Send,
    facebook: Facebook,
    instagram: Instagram,
    youtube: Play,
  };
  const Icon = icons[platform];
  return <Icon className="h-5 w-5" strokeWidth={1.8} />;
}

function channelHref(platform: SupportPlatform, value: string) {
  if (platform === "whatsapp" && !value.startsWith("http")) {
    return `https://wa.me/${value.replace(/\\D/g, "")}`;
  }
  return value;
}

export default function Support() {
  const {
    data: channels,
    isLoading: channelsLoading,
    isError: channelsError,
  } = trpc.support.channels.useQuery();
  const { data: directoryItems, isLoading: directoryItemsLoading } =
    trpc.directory.list.useQuery();
  const {
    data: faqs,
    isLoading: faqsLoading,
    isError: faqsError,
  } = trpc.faq.list.useQuery();
  const { data: quickHelp, isLoading: quickHelpLoading } =
    trpc.supportContent.quickHelp.useQuery();
  const { data: supportCategories, isLoading: supportCategoriesLoading } =
    trpc.supportContent.categories.useQuery();
  const submitMessage = trpc.support.submitMessage.useMutation({
    onSuccess: () => toast.success("Support signal received"),
    onError: error => toast.error(error.message),
  });
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    submitMessage.mutate(
      {
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        topic: String(form.get("topic") ?? "General inquiry"),
        message: String(form.get("message") ?? ""),
      },
      {
        onSuccess: () => {
          event.currentTarget.reset();
          setSent(true);
        },
      }
    );
  };

  const configuredChannels = channels?.filter(channel => channel.value) ?? [];
  const topicOptions = [
    { value: "General inquiry", label: "General inquiry" },
    { value: "Services", label: "Services" },
    { value: "Products", label: "Products" },
    { value: "Support", label: "Support" },
    ...(supportCategories ?? []).map(category => ({
      value: `Category: ${category.title}`,
      label: category.title,
    })),
    ...(directoryItems ?? [])
      .filter(item => item.section === "products")
      .map(item => ({
        value: `Product: ${item.title}`,
        label: `Product — ${item.title}`,
      })),
    { value: "Other", label: "Other" },
  ];

  return (
    <main className="min-h-screen bg-[#05070b] text-[#f5f1eb]">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#05070b]/90 px-5 py-5 backdrop-blur-xl sm:px-8 lg:px-12">
        <div className="flex w-full items-center justify-between gap-4">
          <BrandMark />
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.14em] text-[#9da9b8] transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a1f]"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> BACK TO HOME
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="w-full px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
        <section
          className="border-t border-white/10 pt-12"
          aria-labelledby="support-help-heading"
        >
          <div className="flex items-end justify-between gap-5 border-b border-white/10 pb-5">
            <div>
              <span className="font-sans text-[10px] tracking-[0.18em] text-[#6ae4ff]">
                01 / QUICK HELP
              </span>
              <h2
                id="support-help-heading"
                className="mt-3 font-sans text-3xl font-semibold tracking-[-0.05em] sm:text-4xl"
              >
                START HERE.
              </h2>
              <p className="mt-4 max-w-2xl font-sans text-xs leading-6 text-[#9eabbc]">
                Fast paths for the most common support requests, maintained from
                the Admin workspace.
              </p>
            </div>
            <HelpCircle className="h-7 w-7 text-[#6ae4ff]" />
          </div>
          {quickHelpLoading && (
            <p className="mt-7 font-sans text-xs text-[#9eabbc]">
              SYNCING QUICK HELP...
            </p>
          )}
          {!quickHelpLoading && (quickHelp?.length ?? 0) === 0 && (
            <p className="mt-7 border border-white/10 bg-[#090d14] px-4 py-5 font-sans text-[10px] tracking-[0.14em] text-[#768397]">
              NO QUICK HELP ENTRIES PUBLISHED YET
            </p>
          )}
          {(quickHelp?.length ?? 0) > 0 && (
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {quickHelp?.map(item => (
                <a
                  key={item.id}
                  href={item.href || "#support-form-heading"}
                  className="border border-white/10 bg-[#090d14] p-5 transition hover:border-[#ff5a1f]/70 hover:bg-[#0d141d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6ae4ff]"
                >
                  <h3 className="font-sans text-lg font-semibold">{item.title}</h3>
                  <p className="mt-3 font-sans text-xs leading-6 text-[#9eabbc]">
                    {item.description}
                  </p>
                  {item.href && (
                    <span className="mt-5 inline-block font-sans text-[10px] tracking-[0.12em] text-[#6ae4ff]">
                      OPEN HELP PATH →
                    </span>
                  )}
                </a>
              ))}
            </div>
          )}
        </section>

        <section
          className="mt-16 border-t border-white/10 pt-12"
          aria-labelledby="support-categories-heading"
        >
          <div className="border-b border-white/10 pb-5">
            <span className="font-sans text-[10px] tracking-[0.18em] text-[#ff5a1f]">
              02 / SUPPORT CATEGORIES
            </span>
            <h2
              id="support-categories-heading"
              className="mt-3 font-sans text-3xl font-semibold tracking-[-0.05em] sm:text-4xl"
            >
              CHOOSE A CHANNEL.
            </h2>
          </div>
          {supportCategoriesLoading && (
            <p className="mt-7 font-sans text-xs text-[#9eabbc]">
              SYNCING SUPPORT CATEGORIES...
            </p>
          )}
          {!supportCategoriesLoading && (supportCategories?.length ?? 0) === 0 && (
            <p className="mt-7 border border-white/10 bg-[#090d14] px-4 py-5 font-sans text-[10px] tracking-[0.14em] text-[#768397]">
              NO SUPPORT CATEGORIES CONFIGURED YET
            </p>
          )}
          {(supportCategories?.length ?? 0) > 0 && (
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {supportCategories?.map(category => (
                <a
                  key={category.id}
                  href="#support-form-heading"
                  className="border border-[#ff5a1f]/25 bg-[#0d1119] p-5 transition hover:border-[#ff5a1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6ae4ff]"
                >
                  <h3 className="font-sans text-lg font-semibold">{category.title}</h3>
                  <p className="mt-3 font-sans text-xs leading-6 text-[#9eabbc]">
                    {category.description}
                  </p>
                  <span className="mt-5 inline-block font-sans text-[10px] tracking-[0.12em] text-[#ffae8c]">
                    SELECT CATEGORY →
                  </span>
                </a>
              ))}
            </div>
          )}
        </section>

        <section
          className="mt-16 grid gap-10 border-t border-white/10 pt-12 lg:grid-cols-[0.7fr_1.3fr]"
          aria-labelledby="support-form-heading"
        >
          <div>
            <span className="font-sans text-[10px] tracking-[0.18em] text-[#6ae4ff]">
              03 / MESSAGE INTAKE
            </span>
            <h2
              id="support-form-heading"
              className="mt-3 font-sans text-4xl font-semibold tracking-[-0.05em] sm:text-5xl"
            >
              SEND A SIGNAL.
            </h2>
            <p className="mt-5 max-w-md font-sans text-xs leading-6 text-[#9eabbc]">
              Tell us what needs attention. The Firebox team will receive your
              support request in the Admin message inbox.
            </p>
            {sent && (
              <p className="mt-6 border border-[#6ae4ff]/30 bg-[#6ae4ff]/5 px-4 py-3 font-sans text-[10px] tracking-[0.12em] text-[#a9f2ff]">
                MESSAGE RECEIVED / CHANNEL OPEN
              </p>
            )}
          </div>
          <form
            onSubmit={handleSubmit}
            className="border border-white/10 bg-[#090d14] p-6 sm:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="field-label">Name</span>
                <input
                  required
                  name="name"
                  maxLength={120}
                  className="field-input"
                  placeholder="Your name"
                />
              </label>
              <label className="block">
                <span className="field-label">Email</span>
                <input
                  required
                  name="email"
                  type="email"
                  maxLength={320}
                  className="field-input"
                  placeholder="you@example.com"
                />
              </label>
            </div>
            <label className="mt-5 block">
              <span className="field-label">What is your message about?</span>
              <select
                required
                name="topic"
                defaultValue="General inquiry"
                disabled={directoryItemsLoading}
                className="field-input"
              >
                {topicOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-5 block">
              <span className="field-label">Support message</span>
              <textarea
                required
                name="message"
                maxLength={5000}
                rows={7}
                className="field-input resize-none"
                placeholder="Describe what you need help with..."
              />
            </label>
            <button
              disabled={submitMessage.isPending}
              className="action-button mt-6"
            >
              {submitMessage.isPending
                ? "TRANSMITTING..."
                : "SEND SUPPORT SIGNAL"}
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>

        <section
          id="faq"
          className="mt-16 border-t border-white/10 pt-12"
          aria-labelledby="support-faq-heading"
        >
          <div className="flex items-end justify-between gap-5 border-b border-white/10 pb-5">
            <div>
              <span className="font-sans text-[10px] tracking-[0.18em] text-[#ff5a1f]">
                04 / KNOWLEDGE NODE
              </span>
              <h2
                id="support-faq-heading"
                className="mt-3 font-sans text-3xl font-semibold tracking-[-0.05em] sm:text-4xl"
              >
                FREQUENTLY ASKED
              </h2>
              <p className="mt-4 max-w-2xl font-sans text-xs leading-6 text-[#9eabbc]">
                Find quick answers before sending a support signal. The Firebox
                team manages these answers from the Admin workspace.
              </p>
            </div>
            <HelpCircle className="h-7 w-7 text-[#6ae4ff]" />
          </div>
          {faqsLoading && (
            <p className="mt-7 font-sans text-xs text-[#9eabbc]">
              SYNCING KNOWLEDGE NODE...
            </p>
          )}
          {faqsError && (
            <p className="mt-7 border border-[#ff5a1f]/30 bg-[#ff5a1f]/5 px-4 py-3 font-sans text-[10px] tracking-[0.12em] text-[#ffae8c]">
              FAQ NODE OFFLINE
            </p>
          )}
          {!faqsLoading && !faqsError && faqs?.length === 0 && (
            <p className="mt-7 border border-white/10 bg-[#090d14] px-4 py-5 font-sans text-[10px] tracking-[0.14em] text-[#768397]">
              NO FAQ ENTRIES PUBLISHED YET
            </p>
          )}
          {!faqsLoading && !faqsError && (faqs?.length ?? 0) > 0 && (
            <Accordion
              type="single"
              collapsible
              className="mt-8 border-t border-white/10"
            >
              {faqs?.map((faq, index) => (
                <AccordionItem
                  key={faq.id}
                  value={String(faq.id)}
                  className="border-white/10"
                >
                  <AccordionTrigger className="gap-6 py-6 font-sans text-lg font-semibold tracking-[-0.025em] hover:no-underline sm:text-xl">
                    <span className="flex items-start gap-4 text-left">
                      <span className="pt-1 font-sans text-[10px] font-medium tracking-[0.12em] text-[#ff5a1f]">
                        0{index + 1}
                      </span>
                      <span>{faq.question}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pl-10 pr-8 font-sans text-xs leading-6 text-[#9eabbc] sm:text-sm">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </section>
        <section className="mt-2" aria-labelledby="support-channels-heading">
          <div className="flex items-end justify-between gap-5 border-b border-white/10 pb-5">
            <div>
              <span className="font-sans text-[10px] tracking-[0.18em] text-[#ff5a1f]">
                05 / DIRECT CHANNELS
              </span>
              <h2
                id="support-channels-heading"
                className="mt-3 font-sans text-3xl font-semibold tracking-[-0.05em] sm:text-4xl"
              >
                FIND SUPPORT
              </h2>
            </div>
            <MessageCircle className="h-7 w-7 text-[#6ae4ff]" />
          </div>
          {channelsLoading && (
            <p className="mt-7 font-sans text-xs text-[#9eabbc]">
              SYNCING SUPPORT CHANNELS...
            </p>
          )}
          {channelsError && (
            <p className="mt-7 border border-[#ff5a1f]/30 bg-[#ff5a1f]/5 px-4 py-3 font-sans text-[10px] tracking-[0.12em] text-[#ffae8c]">
              SUPPORT CHANNEL NODE OFFLINE
            </p>
          )}
          {!channelsLoading &&
            !channelsError &&
            configuredChannels.length === 0 && (
              <p className="mt-7 border border-white/10 bg-[#090d14] px-4 py-5 font-sans text-[10px] tracking-[0.14em] text-[#768397]">
                NO SUPPORT CHANNELS CONFIGURED / USE ADMIN TO ADD THEM
              </p>
            )}
          {configuredChannels.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {configuredChannels.map(channel => {
                const platform = channel.platform as SupportPlatform;
                return (
                  <a
                    key={channel.id}
                    href={channelHref(platform, channel.value)}
                    target="_blank"
                    rel="noreferrer"
                    title={`Open ${channel.label}`}
                    aria-label={`Open ${channel.label}`}
                    className="group flex min-h-28 flex-col justify-between border border-white/10 bg-[#090d14] p-4 transition hover:border-[#ff5a1f]/70 hover:bg-[#0d141d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6ae4ff]"
                  >
                    <span className="text-[#ff5a1f] transition group-hover:text-[#6ae4ff]">
                      {platformIcon(platform)}
                    </span>
                    <span className="font-sans text-[10px] tracking-[0.12em] text-[#d5dce6]">
                      {channel.label || platformLabels[platform]}
                    </span>
                  </a>
                );
              })}
            </div>
          )}
        </section>
      </div>
      <footer className="border-t border-white/10 px-5 py-8 sm:px-8 lg:px-12">
        <div className="flex w-full items-center justify-between font-sans text-[10px] tracking-[0.14em] text-[#768397]">
          <span>FIREBOX TECH / SUPPORT NODE</span>
          <span>CHANNEL OPEN</span>
        </div>
      </footer>
    </main>
  );
}
