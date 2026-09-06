import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Loader2, Send, User, Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Streamdown } from "streamdown";

/**
 * Message type matching server-side LLM Message interface
 */
export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
  activity?: string;
  actions?: Array<{
    label: string;
    href: string;
    kind?: "link" | "video";
    mediaUrl?: string;
  }>;
};

function videoEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    if (parsed.hostname === "youtu.be")
      return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
    if (parsed.hostname.includes("vimeo.com"))
      return `https://player.vimeo.com/video/${parsed.pathname.split("/").filter(Boolean).pop()}`;
  } catch {
    return url;
  }
  return url;
}

export type AIChatBoxProps = {
  /**
   * Messages array to display in the chat.
   * Should match the format used by invokeLLM on the server.
   */
  messages: Message[];

  /**
   * Callback when user sends a message.
   * Typically you'll call a tRPC mutation here to invoke the LLM.
   */
  onSendMessage: (content: string) => void;

  /**
   * Whether the AI is currently generating a response
   */
  isLoading?: boolean;

  /**
   * Placeholder text for the input field
   */
  placeholder?: string;

  /**
   * Custom className for the container
   */
  className?: string;

  /**
   * Height of the chat box (default: 600px)
   */
  height?: string | number;

  /**
   * Empty state message to display when no messages
   */
  emptyStateMessage?: string;

  /**
   * Suggested prompts to display in empty state
   * Click to send directly
   */
  suggestedPrompts?: string[];

  /** Render messages as full-width text rows instead of chat bubbles. */
  plain?: boolean;
};

/**
 * A ready-to-use AI chat box component that integrates with the LLM system.
 *
 * Features:
 * - Matches server-side Message interface for seamless integration
 * - Markdown rendering with Streamdown
 * - Auto-scrolls to latest message
 * - Loading states
 * - Uses global theme colors from index.css
 *
 * @example
 * ```tsx
 * const ChatPage = () => {
 *   const [messages, setMessages] = useState<Message[]>([
 *     { role: "system", content: "You are a helpful assistant." }
 *   ]);
 *
 *   const chatMutation = trpc.ai.chat.useMutation({
 *     onSuccess: (response) => {
 *       // Assuming your tRPC endpoint returns the AI response as a string
 *       setMessages(prev => [...prev, {
 *         role: "assistant",
 *         content: response
 *       }]);
 *     },
 *     onError: (error) => {
 *       console.error("Chat error:", error);
 *       // Optionally show error message to user
 *     }
 *   });
 *
 *   const handleSend = (content: string) => {
 *     const newMessages = [...messages, { role: "user", content }];
 *     setMessages(newMessages);
 *     chatMutation.mutate({ messages: newMessages });
 *   };
 *
 *   return (
 *     <AIChatBox
 *       messages={messages}
 *       onSendMessage={handleSend}
 *       isLoading={chatMutation.isPending}
 *       suggestedPrompts={[
 *         "Explain quantum computing",
 *         "Write a hello world in Python"
 *       ]}
 *     />
 *   );
 * };
 * ```
 */
export function AIChatBox({
  messages,
  onSendMessage,
  isLoading = false,
  placeholder = "Type your message...",
  className,
  height = "600px",
  emptyStateMessage = "Start a conversation with AI",
  suggestedPrompts,
  plain = false,
}: AIChatBoxProps) {
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputAreaRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Filter out system messages
  const displayMessages = messages.filter(msg => msg.role !== "system");

  // Calculate min-height for last assistant message to push user message to top
  const [minHeightForLastMessage, setMinHeightForLastMessage] = useState(0);
  const [isCompactViewport, setIsCompactViewport] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");
    const updateViewportMode = () => setIsCompactViewport(mediaQuery.matches);
    updateViewportMode();
    mediaQuery.addEventListener("change", updateViewportMode);

    if (containerRef.current && inputAreaRef.current) {
      const containerHeight = containerRef.current.offsetHeight;
      const inputHeight = inputAreaRef.current.offsetHeight;
      const scrollAreaHeight = containerHeight - inputHeight;

      // Reserve space for:
      // - padding (p-4 = 32px top+bottom)
      // - user message: 40px (item height) + 16px (margin-top from space-y-4) = 56px
      // Note: margin-bottom is not counted because it naturally pushes the assistant message down
      const userMessageReservedHeight = 56;
      const calculatedHeight =
        scrollAreaHeight - 32 - userMessageReservedHeight;

      setMinHeightForLastMessage(Math.max(0, calculatedHeight));
    }

    return () => mediaQuery.removeEventListener("change", updateViewportMode);
  }, []);

  // Scroll to bottom helper function with smooth animation
  const scrollToBottom = () => {
    const viewport = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLDivElement;

    if (viewport) {
      requestAnimationFrame(() => {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: "smooth",
        });
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    onSendMessage(trimmedInput);
    setInput("");

    // Scroll immediately after sending
    scrollToBottom();

    // Keep focus on input
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col text-card-foreground",
        !plain && "rounded-lg border bg-card shadow-sm",
        className
      )}
      style={{ height }}
    >
      {/* Messages Area */}
      <div ref={scrollAreaRef} className="flex-1 overflow-hidden">
        {displayMessages.length === 0 ? (
          <div className="flex h-full flex-col p-0 sm:p-4">
            <div className="flex flex-1 flex-col items-center justify-center gap-6 text-muted-foreground">
              <div className="flex flex-col items-center gap-3">
                <Sparkles className="size-12 opacity-20" />
                <p className="text-sm">{emptyStateMessage}</p>
              </div>

              {suggestedPrompts && suggestedPrompts.length > 0 && (
                <div className="flex max-w-2xl flex-wrap justify-center gap-2">
                  {suggestedPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => onSendMessage(prompt)}
                      disabled={isLoading}
                      className="rounded-lg border border-border bg-card px-4 py-2 text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="flex flex-col space-y-4 p-0 sm:p-4">
              {displayMessages.map((message, index) => {
                // Apply min-height to last message only if NOT loading (when loading, the loading indicator gets it)
                const isLastMessage = index === displayMessages.length - 1;
                const shouldApplyMinHeight =
                  isLastMessage &&
                  !isCompactViewport &&
                  !isLoading &&
                  minHeightForLastMessage > 0;

                return (
                  <div
                    key={index}
                    className={cn(
                      "flex gap-3",
                      plain
                        ? message.role === "user"
                          ? "items-start justify-end"
                          : "items-start"
                        : message.role === "user"
                          ? "items-start justify-end"
                          : "items-start justify-start flex-col sm:flex-row"
                    )}
                    style={
                      shouldApplyMinHeight
                        ? { minHeight: `${minHeightForLastMessage}px` }
                        : undefined
                    }
                  >
                    {message.role === "assistant" && !plain && (
                      <div className="size-8 shrink-0 mt-1 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="size-4 text-primary" />
                      </div>
                    )}

                    <div
                      className={cn(
                        plain && message.role === "user"
                          ? "max-w-[80%] rounded-2xl bg-primary px-4 py-3 text-primary-foreground"
                          : plain
                            ? "w-full max-w-none bg-transparent px-0 py-2.5"
                          : "rounded-lg px-4 py-2.5 sm:max-w-[80%]",
                        !plain &&
                          (message.role === "user"
                            ? "max-w-[80%] bg-primary text-primary-foreground"
                            : "w-full bg-muted text-foreground sm:w-auto")
                      )}
                    >
                      {message.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          {message.activity && (
                            <p className="mb-2 font-sans text-[11px] text-muted-foreground">
                              {message.activity}
                            </p>
                          )}
                          <Streamdown>{message.content}</Streamdown>
                          {message.actions && message.actions.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2 not-prose">
                              {message.actions.map(action => (
                                action.kind === "video" && action.mediaUrl ? (
                                  <div key={action.href} className="w-full space-y-2">
                                    <p className="font-sans text-[10px] font-semibold tracking-[0.12em] text-[#ff5a1f]">
                                      {action.label}
                                    </p>
                                    {/\.(mp4|webm|ogg)(\?.*)?$/i.test(action.mediaUrl) ? (
                                      <video controls className="aspect-video w-full bg-black" src={action.mediaUrl} />
                                    ) : (
                                      <iframe
                                        title={action.label}
                                        src={videoEmbedUrl(action.mediaUrl)}
                                        className="aspect-video w-full bg-black"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                      />
                                    )}
                                    <a href={action.href} className="inline-flex font-sans text-[10px] text-muted-foreground hover:text-foreground">
                                      OPEN TUTORIAL
                                    </a>
                                  </div>
                                ) : (
                                  <button
                                    key={action.href}
                                    type="button"
                                    onClick={() => {
                                      window.location.href = action.href;
                                    }}
                                    className="inline-flex items-center gap-2 border border-[#ff5a1f]/50 px-3 py-2 font-sans text-[10px] font-semibold tracking-[0.12em] text-[#ff5a1f] transition hover:border-[#ff5a1f] hover:bg-[#ff5a1f] hover:text-[#07090d]"
                                  >
                                    {action.label}
                                  </button>
                                )
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap text-sm">
                          {message.content}
                        </p>
                      )}
                    </div>

                    {message.role === "user" && !plain && (
                      <div className="size-8 shrink-0 mt-1 rounded-full bg-secondary flex items-center justify-center">
                        <User className="size-4 text-secondary-foreground" />
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div
                  className={cn(
                    "flex items-start gap-2",
                    !plain && "flex-col sm:flex-row sm:gap-3"
                  )}
                  style={
                    !isCompactViewport && minHeightForLastMessage > 0
                      ? { minHeight: `${minHeightForLastMessage}px` }
                      : undefined
                  }
                >
                  {!plain && (
                    <div className="size-8 shrink-0 mt-1 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="size-4 text-primary" />
                    </div>
                  )}
                  <div className={cn(
                    plain
                      ? "w-full bg-transparent px-0 py-2.5"
                      : "w-full rounded-lg bg-muted px-4 py-2.5 sm:w-auto"
                  )}>
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Input Area */}
      <form
        ref={inputAreaRef}
        onSubmit={handleSubmit}
        className={cn(
          "flex items-end gap-3",
          plain
            ? "flex-col gap-2 rounded-2xl border border-border bg-card/80 p-3 shadow-sm backdrop-blur-sm"
            : "border-t border-border bg-background/80 p-4 sm:p-5"
        )}
      >
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "min-h-[52px] flex-1 resize-none text-sm leading-6 placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-[#ff5a1f]/60",
            plain
              ? "!w-full !rounded-xl !border-0 !bg-transparent !px-2 !py-1 !shadow-none outline-none focus-visible:!ring-0"
              : "rounded-xl border-border bg-card px-4 py-3 shadow-sm"
          )}
          rows={plain ? 2 : 1}
        />
        {plain && (
          <div className="flex w-full justify-end px-1">
            <Button
              type="submit"
              aria-label="Send message"
              disabled={!input.trim() || isLoading}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary p-0 text-primary-foreground"
            >
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </div>
        )}
        {!plain && (
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="h-[52px] shrink-0 gap-2 rounded-xl px-4 font-sans text-[10px] font-semibold tracking-[0.12em] sm:px-5"
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            <span className="hidden sm:inline">SEND</span>
          </Button>
        )}
      </form>
    </div>
  );
}
