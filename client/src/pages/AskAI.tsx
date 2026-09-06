import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Check,
  MessageCircleQuestion,
  Sparkles,
  Zap,
} from "lucide-react";
import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import BrandMark from "@/components/BrandMark";
import ThemeToggle from "@/components/ThemeToggle";
import { trpc } from "@/lib/trpc";

export default function AskAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [statusText, setStatusText] = useState("");
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statusRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ask = trpc.ai.ask.useMutation({
    onSuccess: result => {
      if (statusRef.current) clearInterval(statusRef.current);
      setStatusText("");
      setIsTyping(true);
      const answer = result.answer;
      const startedAt = Date.now();
      let index = 0;
      setMessages(current => [...current, { role: "assistant", content: "" }]);
      animationRef.current = setInterval(
        () => {
          index += 1;
          setMessages(current => {
            const next = [...current];
            const last = next[next.length - 1];
            if (last?.role === "assistant")
              last.content = answer.slice(0, index);
            return next;
          });
          if (Date.now() - startedAt >= 3000) {
            if (animationRef.current) clearInterval(animationRef.current);
            setMessages(current => {
              const next = [...current];
              const last = next[next.length - 1];
              if (last?.role === "assistant") {
                last.content = answer;
                last.actions = result.actions;
              }
              return next;
            });
            setIsTyping(false);
          }
        },
        Math.max(12, Math.floor(3000 / Math.max(answer.length, 1)))
      );
    },
    onError: error => {
      if (statusRef.current) clearInterval(statusRef.current);
      setStatusText("");
      setIsTyping(false);
      setMessages(current => [
        ...current,
        {
          role: "assistant",
          content: `I could not answer that right now. ${error.message}`,
        },
      ]);
    },
  });

  const handleSend = (question: string) => {
    if (animationRef.current) clearInterval(animationRef.current);
    setIsTyping(false);
    setStatusText("");
    setMessages(current => [...current, { role: "user", content: question }]);
    ask.mutate({ question });
  };

  useEffect(() => {
    if (!ask.isPending) return;
    const narration = "SEARCHING PUBLIC KNOWLEDGE...";
    let index = 0;
    statusRef.current = setInterval(() => {
      index = (index + 1) % (narration.length + 1);
      setStatusText(narration.slice(0, index));
    }, 100);
    return () => {
      if (statusRef.current) clearInterval(statusRef.current);
    };
  }, [ask.isPending]);

  useEffect(
    () => () => {
      if (animationRef.current) clearInterval(animationRef.current);
      if (statusRef.current) clearInterval(statusRef.current);
    },
    []
  );

  return (
    <main className="min-h-screen w-full bg-background text-foreground">
      <header className="border-b border-border bg-background/90 px-5 py-5 backdrop-blur-xl sm:px-8 lg:px-12">
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

      <section
        className="w-full px-5 py-12 sm:px-8 sm:py-20 lg:px-12 xl:px-20"
        aria-label="Ask Firebox AI"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:gap-16">
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 border border-[#6ae4ff]/30 bg-[#6ae4ff]/[0.06] px-3 py-2 font-sans text-[9px] font-semibold tracking-[0.16em] text-[#6ae4ff]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#6ae4ff]" />
                FIREBOX INTELLIGENCE / ONLINE
              </div>
              <h1 className="mt-7 max-w-xl font-sans text-5xl font-bold leading-[0.94] tracking-[-0.07em] sm:text-7xl">
                Find the signal.
              </h1>
              <p className="mt-7 max-w-md font-sans text-sm leading-7 text-muted-foreground">
                Ask about Firebox products, services, documentation, support,
                and the latest ideas from our public knowledge base.
              </p>

              <div className="mt-10 space-y-4 border-t border-border pt-6">
                <p className="font-sans text-[9px] font-semibold tracking-[0.16em] text-muted-foreground">
                  WHAT I CAN HELP WITH
                </p>
                {[
                  [BookOpen, "Products & services"],
                  [MessageCircleQuestion, "Support & documentation"],
                  [Zap, "Tutorials & latest updates"],
                ].map(([Icon, label]) => (
                  <div key={label as string} className="flex items-center gap-3 font-sans text-xs text-foreground">
                    <span className="flex h-7 w-7 items-center justify-center border border-border bg-card text-[#b69cff]">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    {label as string}
                    <Check className="ml-auto h-3.5 w-3.5 text-[#6ae4ff]" />
                  </div>
                ))}
              </div>

              <a
                href="/docs"
                className="mt-10 inline-flex items-center gap-2 font-sans text-[10px] font-semibold tracking-[0.14em] text-[#b69cff] transition hover:text-white"
              >
                BROWSE DOCUMENTATION <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="overflow-hidden border border-border bg-card shadow-2xl shadow-black/20">
              <div className="flex items-center justify-between border-b border-border bg-background/70 px-5 py-4 sm:px-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center border border-[#b69cff]/40 bg-[#b69cff]/10 text-[#b69cff]">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-sans text-[10px] font-semibold tracking-[0.16em] text-foreground">
                      ASK FIREBOX AI
                    </p>
                    <p className="mt-1 font-sans text-[9px] tracking-[0.12em] text-muted-foreground">
                      PUBLIC KNOWLEDGE ASSISTANT
                    </p>
                  </div>
                </div>
                <span className="font-sans text-[9px] tracking-[0.12em] text-[#6ae4ff]">
                  READY
                </span>
              </div>
              <AIChatBox
                messages={messages}
                onSendMessage={handleSend}
                isLoading={ask.isPending || isTyping}
                className="h-[min(680px,calc(100vh-11rem))] w-full rounded-none border-0 bg-transparent shadow-none"
                placeholder="Ask a question about Firebox..."
                emptyStateMessage="What would you like to discover?"
                suggestedPrompts={[
                  "What services does Firebox offer?",
                  "Show me the latest tutorials",
                  "How can I contact Support?",
                ]}
              />
            </div>
          </div>
        </div>
        {(ask.isPending || isTyping) && (
          <div className="flex h-10 items-center gap-2 border-b border-border px-5 font-sans text-[10px] tracking-[0.16em] text-[#6ae4ff] sm:px-8 lg:px-10">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#6ae4ff]" />
            {ask.isPending ? statusText : "NARRATING ANSWER..."}
          </div>
        )}
      </section>
    </main>
  );
}
