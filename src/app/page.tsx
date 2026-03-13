"use client";

import { useChat } from "@ai-sdk/react";
import { type UIMessage } from "ai";
import { useState } from "react";

const AGENT_INFO: Record<string, { label: string; color: string }> = {
  financialAnalyst: {
    label: "Financial Analyst",
    color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  },
  scientist: {
    label: "Scientist",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  journalist: {
    label: "Journalist",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  },
};

function AgentBadge({ name }: { name: string }) {
  const agent = AGENT_INFO[name];
  if (!agent) return null;
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${agent.color}`}>
      {agent.label}
    </span>
  );
}

const SUGGESTIONS = [
  "What did Apple report in their latest 10-K filing?",
  "What are the latest clinical trials for Alzheimer's treatments?",
  "What's the latest news on AI regulation?",
];

export default function Home() {
  const { messages, sendMessage, stop, status } = useChat();
  const [input, setInput] = useState("");

  const isLoading = status === "streaming" || status === "submitted";

  function send(text: string) {
    if (!text.trim()) return;
    sendMessage({ text });
    setInput("");
  }

  function getTextContent(message: UIMessage): string {
    return message.parts
      .filter((p): p is Extract<(typeof message.parts)[number], { type: "text" }> => p.type === "text")
      .map((p) => p.text)
      .join("");
  }

  function getToolParts(message: UIMessage) {
    return message.parts.filter(
      (p): p is Extract<(typeof message.parts)[number], { type: `tool-${string}` }> =>
        p.type.startsWith("tool-")
    );
  }

  function hasActiveToolCalls(message: UIMessage): boolean {
    return message.parts.some(
      (p) => p.type.startsWith("tool-") && "state" in p && p.state !== "output-available" && p.state !== "output-error"
    );
  }

  const lastMessage = messages[messages.length - 1];
  const showLoader =
    isLoading &&
    (lastMessage?.role === "user" || (lastMessage?.role === "assistant" && hasActiveToolCalls(lastMessage)));

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-sm font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
            M
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Multi-Agent Research System
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Financial Analyst &middot; Scientist &middot; Journalist
            </p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-6">
        {messages.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 py-20">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Ask anything across domains
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Your query will be routed to the right specialist agent
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                message.role === "user"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-white text-zinc-800 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-200 dark:ring-zinc-800"
              }`}
            >
              {/* Show agent badges for tool calls */}
              {message.role === "assistant" &&
                getToolParts(message).map((p, i) => (
                  <div key={i} className="mb-2">
                    <AgentBadge name={"toolName" in p ? String(p.toolName) : ""} />
                    {"state" in p && p.state === "input-streaming" && (
                      <span className="ml-2 text-xs text-zinc-400">researching...</span>
                    )}
                  </div>
                ))}

              {/* Render text content */}
              {getTextContent(message) && (
                <div className="whitespace-pre-wrap">{getTextContent(message)}</div>
              )}
            </div>
          </div>
        ))}

        {showLoader && (
          <div className="flex justify-start">
            <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
              <div className="relative flex h-5 w-5 items-center justify-center">
                <span className="absolute h-5 w-5 animate-ping rounded-full bg-violet-400/30" />
                <span className="h-3 w-3 animate-pulse rounded-full bg-violet-500" />
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Gathering insights for you while you sip your coffee...
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Input */}
      <div className="sticky bottom-0 border-t border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-3xl items-end gap-2 px-4 py-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask about finance, medicine, or news..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-zinc-500 focus:bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-500 dark:focus:bg-zinc-800"
          />
          {isLoading ? (
            <button
              type="button"
              onClick={stop}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              Stop
            </button>
          ) : (
            <button
              type="button"
              onClick={() => send(input)}
              disabled={!input.trim()}
              className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Send
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
