import { ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
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

      <section className="w-full px-0 py-0" aria-label="Ask Firebox AI">
        <AIChatBox
          messages={messages}
          onSendMessage={handleSend}
          isLoading={ask.isPending || isTyping}
          className="h-[min(760px,calc(100vh-8rem))] w-full rounded-none border-x-0 border-y border-border bg-transparent shadow-none"
          placeholder="Ask about Firebox..."
          emptyStateMessage="Ask a question about Firebox"
          suggestedPrompts={[
            "What services does Firebox offer?",
            "Show me the latest tutorials",
            "How can I contact Support?",
          ]}
        />
        {(ask.isPending || isTyping) && (
          <div className="flex h-10 items-center gap-2 border-b border-border px-5 font-sans text-[10px] tracking-[0.16em] text-[#6ae4ff] sm:px-8 lg:px-12">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#6ae4ff]" />
            {ask.isPending ? statusText : "NARRATING ANSWER..."}
          </div>
        )}
        <div className="flex w-full flex-col gap-3 border-t border-border px-5 py-5 font-sans text-[10px] tracking-[0.12em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-[#6ae4ff]" /> PUBLIC
            CONTENT ONLY / PRIVATE ADMIN DATA HIDDEN
          </span>
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-[#ff5a1f]" /> LIVE KNOWLEDGE
            RETRIEVAL
          </span>
        </div>
      </section>
    </main>
  );
}
