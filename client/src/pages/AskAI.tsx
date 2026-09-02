import { ArrowLeft, BrainCircuit, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import BrandMark from "@/components/BrandMark";
import ThemeToggle from "@/components/ThemeToggle";
import { trpc } from "@/lib/trpc";

export default function AskAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const ask = trpc.ai.ask.useMutation({
    onSuccess: result => {
      setMessages(current => [
        ...current,
        { role: "assistant", content: result.answer },
      ]);
    },
    onError: error => {
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
    setMessages(current => [...current, { role: "user", content: question }]);
    ask.mutate({ question });
  };

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
        className="w-full border-b border-border px-5 py-14 sm:px-8 sm:py-20 lg:px-12"
        aria-labelledby="ask-ai-title"
      >
        <div className="flex items-end justify-between gap-6">
          <div>
            <span className="font-sans text-[10px] tracking-[0.18em] text-[#ff5a1f]">
              06 / INTELLIGENCE NODE
            </span>
            <h1
              id="ask-ai-title"
              className="mt-4 font-sans text-5xl font-bold tracking-[-0.06em] sm:text-7xl"
            >
              ASK AI
            </h1>
            <p className="mt-6 max-w-2xl font-sans text-xs leading-6 text-muted-foreground sm:text-sm">
              Ask about Firebox products, services, tutorials, FAQs, and public
              resources. Answers are grounded in the live website content
              managed by Admin.
            </p>
          </div>
          <BrainCircuit
            className="hidden h-12 w-12 text-[#6ae4ff] sm:block"
            strokeWidth={1.2}
          />
        </div>
      </section>

      <section
        className="w-full px-5 py-8 sm:px-8 lg:px-12"
        aria-label="Ask Firebox AI"
      >
        <AIChatBox
          messages={messages}
          onSendMessage={handleSend}
          isLoading={ask.isPending}
          className="h-[min(680px,calc(100vh-18rem))] w-full rounded-none border-x-0 border-y border-border bg-transparent shadow-none"
          placeholder="Ask about Firebox..."
          emptyStateMessage="Ask a question about Firebox"
          suggestedPrompts={[
            "What services does Firebox offer?",
            "Show me the latest tutorials",
            "How can I contact Support?",
          ]}
        />
        <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 font-sans text-[10px] tracking-[0.12em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
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
