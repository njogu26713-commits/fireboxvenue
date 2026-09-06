import {
  ArrowLeft,
  Sparkles,
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
      <header className="px-5 py-5 sm:px-8 lg:px-12">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4">
          <BrandMark />
          <div className="flex items-center gap-4 sm:gap-5">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.14em] text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> BACK TO HOME
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <section
        className="w-full px-4 pb-6 pt-16 sm:px-8 sm:pt-24"
        aria-label="Ask Firebox AI"
      >
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex flex-col items-center text-center">
            <Sparkles className="h-6 w-6 text-[#b69cff]" />
            <h1 className="mt-5 font-sans text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
              What can I help with?
            </h1>
            <p className="mt-3 max-w-md font-sans text-xs leading-6 text-muted-foreground">
              Ask anything about Firebox products, services, support, and documentation.
            </p>
          </div>
          <AIChatBox
            messages={messages}
            onSendMessage={handleSend}
            isLoading={ask.isPending || isTyping}
            plain
            className="h-[min(680px,calc(100vh-13rem))] w-full rounded-none border-0 bg-transparent shadow-none"
            placeholder="Message Firebox AI..."
            emptyStateMessage="Start a conversation"
            suggestedPrompts={[
              "What services does Firebox offer?",
              "Show me the latest tutorials",
              "How can I contact Support?",
            ]}
          />
        </div>
        {(ask.isPending || isTyping) && (
          <div className="mx-auto flex max-w-3xl items-center justify-center gap-2 px-5 pt-2 font-sans text-[10px] tracking-[0.16em] text-[#6ae4ff]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#6ae4ff]" />
            {ask.isPending ? statusText : "NARRATING ANSWER..."}
          </div>
        )}
      </section>
    </main>
  );
}
