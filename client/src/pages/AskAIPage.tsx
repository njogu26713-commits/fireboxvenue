import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CircleHelp,
  Compass,
  Send,
  Sparkles,
} from "lucide-react";
import { Link } from "wouter";
import { harden } from "rehype-harden";
import { Streamdown } from "streamdown";
import BrandMark from "@/components/BrandMark";
import ThemeToggle from "@/components/ThemeToggle";
import { trpc } from "@/lib/trpc";

type AssistantAction = {
  label: string;
  href: string;
  kind?: "link" | "video";
  mediaUrl?: string;
};

type ConversationMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  activity?: string;
  actions?: AssistantAction[];
};

const suggestedQuestions = [
  {
    icon: Compass,
    title: "Explore Firebox",
    prompt: "What products and services does Firebox offer?",
  },
  {
    icon: BookOpen,
    title: "Find a guide",
    prompt: "Show me a useful Firebox tutorial or guide.",
  },
  {
    icon: CircleHelp,
    title: "Get support",
    prompt: "How can I contact Firebox Support?",
  },
];

export default function AskAIPage() {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [draft, setDraft] = useState("");
  const sendGuard = useRef(false);
  const endOfConversation = useRef<HTMLDivElement>(null);
  const ask = trpc.ai.ask.useMutation();

  useEffect(() => {
    endOfConversation.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, ask.isPending]);

  const sendQuestion = (rawQuestion: string) => {
    const question = rawQuestion.trim();
    if (!question || sendGuard.current || ask.isPending) return;

    sendGuard.current = true;
    const history = messages
      .filter(message => message.content.trim().length > 0)
      .slice(-12)
      .map(message => ({ role: message.role, content: message.content }));

    setMessages(current => [
      ...current,
      { id: crypto.randomUUID(), role: "user", content: question },
    ]);
    setDraft("");

    ask.mutate(
      { question, history },
      {
        onSuccess: result => {
          sendGuard.current = false;
          setMessages(current => [
            ...current,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: result.answer,
              activity: result.activity,
              actions: result.actions,
            },
          ]);
        },
        onError: error => {
          sendGuard.current = false;
          setMessages(current => [
            ...current,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: `I couldn’t answer that just now. ${error.message}`,
            },
          ]);
        },
      }
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendQuestion(draft);
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendQuestion(draft);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070a10] text-[#f5f1eb]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_0%,rgba(182,156,255,0.13),transparent_38%),radial-gradient(ellipse_at_100%_40%,rgba(106,228,255,0.08),transparent_32%)]"
      />

      <header className="relative z-10 border-b border-white/10 bg-[#070a10]/75 px-5 py-4 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <BrandMark />
          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.14em] text-[#aab4c2] transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b69cff]"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> HOME
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-8 sm:py-12 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-10 lg:px-12">
        <section aria-labelledby="ask-ai-title" className="min-w-0">
          <div className="mb-6 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl border border-[#b69cff]/30 bg-[#b69cff]/10 text-[#d2c1ff]">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="font-sans text-[10px] font-medium tracking-[0.18em] text-[#b69cff]">
                FIREBOX / AI COMPANION
              </p>
              <h1 id="ask-ai-title" className="mt-1 font-sans text-2xl font-semibold tracking-[-0.045em] sm:text-3xl">
                Ask Firebox anything.
              </h1>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1018]/90 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 sm:px-6">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-[#6ae4ff] shadow-[0_0_12px_rgba(106,228,255,0.8)]" />
                <span className="font-sans text-[10px] tracking-[0.13em] text-[#b9c3d0]">
                  PUBLIC KNOWLEDGE ASSISTANT
                </span>
              </div>
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setMessages([])}
                  className="font-sans text-[10px] tracking-[0.12em] text-[#8996a7] transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b69cff]"
                >
                  NEW CHAT
                </button>
              )}
            </div>

            <div
              aria-live="polite"
              aria-relevant="additions text"
              className="max-h-[min(58vh,38rem)] min-h-[22rem] overflow-y-auto px-4 py-6 sm:px-7 sm:py-8"
            >
              {messages.length === 0 ? (
                <div className="flex min-h-[19rem] flex-col items-center justify-center text-center">
                  <span className="mb-5 grid h-16 w-16 place-items-center rounded-3xl border border-[#6ae4ff]/20 bg-[#6ae4ff]/[0.06] text-[#6ae4ff]">
                    <Sparkles className="h-7 w-7" />
                  </span>
                  <h2 className="font-sans text-xl font-semibold tracking-[-0.03em] sm:text-2xl">
                    What are you looking for?
                  </h2>
                  <p className="mt-2 max-w-md font-sans text-xs leading-6 text-[#96a2b2]">
                    Ask about Firebox products, services, tutorials, documentation, or support.
                  </p>
                  <div className="mt-7 flex flex-wrap justify-center gap-2">
                    <span className="rounded-full border border-white/10 px-3 py-1.5 font-sans text-[10px] text-[#9da9b8]">Products</span>
                    <span className="rounded-full border border-white/10 px-3 py-1.5 font-sans text-[10px] text-[#9da9b8]">Guides</span>
                    <span className="rounded-full border border-white/10 px-3 py-1.5 font-sans text-[10px] text-[#9da9b8]">Support</span>
                  </div>
                </div>
              ) : (
                <div className="mx-auto flex max-w-3xl flex-col gap-6">
                  {messages.map(message => (
                    <article
                      key={message.id}
                      aria-label={message.role === "user" ? "Your message" : "Firebox AI response"}
                      className={`flex gap-3 sm:gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === "assistant" && (
                        <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-[#b69cff]/25 bg-[#b69cff]/10 text-[#d2c1ff]">
                          <Sparkles className="h-4 w-4" />
                        </span>
                      )}
                      <div className={`min-w-0 max-w-[88%] ${message.role === "user" ? "rounded-2xl rounded-br-md border border-[#6ae4ff]/20 bg-[#6ae4ff]/[0.08] px-4 py-3 text-[#edfaff]" : "pt-1 text-[#dce3ec]"}`}>
                        {message.activity && (
                          <p className="mb-2 font-sans text-[10px] tracking-[0.08em] text-[#8f9bab]">
                            {message.activity}
                          </p>
                        )}
                        {message.role === "assistant" ? (
                          <div className="ask-ai-answer font-sans text-sm leading-7">
                            <Streamdown
                              rehypePlugins={[
                                [
                                  harden,
                                  {
                                    defaultOrigin: window.location.origin,
                                    allowedImagePrefixes: ["https://"],
                                    allowedLinkPrefixes: [
                                      "https://",
                                      "http://",
                                      "mailto:",
                                    ],
                                    allowDataImages: false,
                                  },
                                ],
                              ]}
                            >
                              {message.content}
                            </Streamdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap font-sans text-sm leading-6">{message.content}</p>
                        )}
                        {message.actions && message.actions.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {message.actions.map(action => (
                              <a
                                key={`${message.id}-${action.href}`}
                                href={action.href}
                                target={action.href.startsWith("http") ? "_blank" : undefined}
                                rel={action.href.startsWith("http") ? "noreferrer" : undefined}
                                className="inline-flex items-center gap-2 rounded-lg border border-[#b69cff]/25 bg-[#b69cff]/[0.07] px-3 py-2 font-sans text-[10px] font-medium tracking-[0.08em] text-[#d6c8ff] transition hover:border-[#b69cff]/60 hover:bg-[#b69cff]/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6ae4ff]"
                              >
                                {action.label}
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                  {ask.isPending && (
                    <div className="flex items-center gap-3 text-[#a9b4c2]" role="status">
                      <span className="grid h-8 w-8 place-items-center rounded-xl border border-[#b69cff]/25 bg-[#b69cff]/10 text-[#d2c1ff]"><Sparkles className="h-4 w-4" /></span>
                      <span className="font-sans text-xs">Finding a helpful answer…</span>
                      <span className="flex gap-1"><i className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#b69cff]" /><i className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#b69cff] [animation-delay:150ms]" /><i className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#b69cff] [animation-delay:300ms]" /></span>
                    </div>
                  )}
                  <div ref={endOfConversation} />
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="border-t border-white/10 bg-[#080c12] p-3 sm:p-4">
              <label className="sr-only" htmlFor="ask-ai-input">Your question</label>
              <div className="flex items-end gap-3 rounded-xl border border-white/10 bg-[#0d141d] p-2 transition focus-within:border-[#b69cff]/50 focus-within:ring-2 focus-within:ring-[#b69cff]/10">
                <textarea
                  id="ask-ai-input"
                  value={draft}
                  onChange={event => setDraft(event.target.value)}
                  onKeyDown={handleComposerKeyDown}
                  maxLength={2000}
                  rows={2}
                  placeholder="Ask a question…"
                  disabled={ask.isPending}
                  className="max-h-40 min-h-12 flex-1 resize-y bg-transparent px-2 py-2 font-sans text-sm leading-6 text-white outline-none placeholder:text-[#687588] disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || ask.isPending}
                  aria-label="Send question"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#b69cff] text-[#10101a] transition hover:bg-[#d2c1ff] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6ae4ff]"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 px-1 font-sans text-[10px] text-[#778394]">
                Enter to send · Shift+Enter for a new line · Firebox public information only
              </p>
            </form>
          </div>
        </section>

        <aside className="space-y-5 lg:pt-[4.25rem]">
          <div>
            <p className="font-sans text-[10px] font-medium tracking-[0.16em] text-[#8996a7]">SUGGESTED STARTS</p>
            <h2 className="mt-2 font-sans text-lg font-semibold tracking-[-0.025em]">Choose a direction</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {suggestedQuestions.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.title}
                  type="button"
                  disabled={ask.isPending}
                  onClick={() => sendQuestion(item.prompt)}
                  className="group flex min-h-24 items-start gap-3 rounded-xl border border-white/10 bg-[#0b1018]/80 p-4 text-left transition hover:border-[#b69cff]/40 hover:bg-[#111723] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6ae4ff]"
                >
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/[0.04] text-[#b69cff] transition group-hover:bg-[#b69cff]/10">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block font-sans text-xs font-semibold text-[#e6eaf0]">{item.title}</span>
                    <span className="mt-1.5 block font-sans text-[11px] leading-5 text-[#8996a7]">{item.prompt}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="rounded-xl border border-[#6ae4ff]/15 bg-[#6ae4ff]/[0.035] p-4">
            <p className="font-sans text-[10px] font-medium tracking-[0.13em] text-[#6ae4ff]">ABOUT THIS ASSISTANT</p>
            <p className="mt-2 font-sans text-xs leading-6 text-[#a2adbb]">
              Answers are based on public Firebox products, services, guides, and support information. For personal help, contact the Support team.
            </p>
            <Link href="/support" className="mt-3 inline-flex items-center gap-2 font-sans text-[10px] font-medium tracking-[0.08em] text-[#c0f5ff] hover:text-white">
              VISIT SUPPORT <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
