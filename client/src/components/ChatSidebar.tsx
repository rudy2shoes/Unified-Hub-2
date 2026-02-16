import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, X, Send, Plus, Trash2, Bot, User, Loader2,
  Key, Settings, ChevronLeft, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatConversation, ChatMessage } from "@shared/schema";

interface ChatSidebarProps {
  open: boolean;
  onClose: () => void;
  theme?: string;
}

export function ChatSidebar({ open, onClose, theme = "dark" }: ChatSidebarProps) {
  const isLight = theme === "light";
  const queryClient = useQueryClient();
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<"anthropic" | "openai">("anthropic");
  const [savingKey, setSavingKey] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: aiSettings } = useQuery<{ provider: string | null; hasKey: boolean }>({
    queryKey: ["/api/ai/settings"],
    queryFn: async () => {
      const res = await fetch("/api/ai/settings", { credentials: "include" });
      if (!res.ok) return { provider: null, hasKey: false };
      return res.json();
    },
    enabled: open,
  });

  const { data: conversations = [] } = useQuery<ChatConversation[]>({
    queryKey: ["/api/ai/conversations"],
    queryFn: async () => {
      const res = await fetch("/api/ai/conversations", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: open && !!aiSettings?.hasKey,
  });

  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["/api/ai/conversations", activeConversation, "messages"],
    queryFn: async () => {
      const res = await fetch(`/api/ai/conversations/${activeConversation}/messages`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!activeConversation,
  });

  const createConversation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ai/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: "New Chat" }),
      });
      return res.json();
    },
    onSuccess: (conv: ChatConversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations"] });
      setActiveConversation(conv.id);
    },
  });

  const deleteConversation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/ai/conversations/${id}`, { method: "DELETE", credentials: "include" });
    },
    onSuccess: () => {
      setActiveConversation(null);
      queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations"] });
    },
  });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, scrollToBottom]);

  useEffect(() => {
    if (open && inputRef.current && activeConversation) {
      inputRef.current.focus();
    }
  }, [open, activeConversation]);

  const handleSend = async () => {
    if (!input.trim() || streaming || !activeConversation) return;
    const msg = input.trim();
    setInput("");
    setStreaming(true);
    setStreamingText("");

    queryClient.setQueryData(
      ["/api/ai/conversations", activeConversation, "messages"],
      (old: ChatMessage[] | undefined) => [
        ...(old || []),
        { id: "temp-user", conversationId: activeConversation, role: "user", content: msg, createdAt: new Date().toISOString() },
      ]
    );

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ conversationId: activeConversation, message: msg }),
      });

      if (!res.ok) {
        const err = await res.json();
        setStreamingText(`Error: ${err.message}`);
        setStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) { setStreaming(false); return; }

      const decoder = new TextDecoder();
      let accumulated = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "text") {
                accumulated += data.text;
                setStreamingText(accumulated);
              } else if (data.type === "error") {
                setStreamingText(`Error: ${data.error}`);
              }
            } catch {}
          }
        }
      }
    } catch (err: any) {
      setStreamingText(`Error: ${err.message}`);
    }

    setStreaming(false);
    setStreamingText("");
    queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations", activeConversation, "messages"] });
    queryClient.invalidateQueries({ queryKey: ["/api/ai/conversations"] });
  };

  const handleSaveKey = async () => {
    if (!apiKey.trim()) return;
    setSavingKey(true);
    try {
      await fetch("/api/ai/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ provider, apiKey: apiKey.trim() }),
      });
      setApiKey("");
      setShowSettings(false);
      queryClient.invalidateQueries({ queryKey: ["/api/ai/settings"] });
    } catch {}
    setSavingKey(false);
  };

  const handleRemoveKey = async () => {
    await fetch("/api/ai/settings", { method: "DELETE", credentials: "include" });
    queryClient.invalidateQueries({ queryKey: ["/api/ai/settings"] });
    setActiveConversation(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderSetupView = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
      <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center", isLight ? "bg-[#EF4444]/10" : "bg-[#EF4444]/15")}>
        <Sparkles className="w-8 h-8 text-[#EF4444]" />
      </div>
      <div>
        <h3 className={cn("text-lg font-semibold mb-1", isLight ? "text-gray-800" : "text-white")}>AI Assistant</h3>
        <p className={cn("text-sm", isLight ? "text-gray-500" : "text-white/50")}>
          Connect your own AI service to chat with HUB's assistant. Your API key stays private and is used only for your conversations.
        </p>
      </div>
      <div className="w-full space-y-3 mt-2">
        <div className="flex gap-2">
          <button
            onClick={() => setProvider("anthropic")}
            className={cn("flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all",
              provider === "anthropic"
                ? "border-[#EF4444] bg-[#EF4444]/10 text-[#EF4444]"
                : isLight ? "border-gray-200 text-gray-500 hover:border-gray-300" : "border-white/10 text-white/50 hover:border-white/20"
            )}
            data-testid="button-provider-anthropic"
          >
            Claude
          </button>
          <button
            onClick={() => setProvider("openai")}
            className={cn("flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all",
              provider === "openai"
                ? "border-[#EF4444] bg-[#EF4444]/10 text-[#EF4444]"
                : isLight ? "border-gray-200 text-gray-500 hover:border-gray-300" : "border-white/10 text-white/50 hover:border-white/20"
            )}
            data-testid="button-provider-openai"
          >
            OpenAI
          </button>
        </div>
        <input
          type="password"
          placeholder={provider === "anthropic" ? "sk-ant-..." : "sk-..."}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className={cn("w-full px-3 py-2.5 rounded-lg text-sm border outline-none transition-colors",
            isLight ? "bg-white border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-[#EF4444]"
              : "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#EF4444]"
          )}
          data-testid="input-api-key"
        />
        <button
          onClick={handleSaveKey}
          disabled={!apiKey.trim() || savingKey}
          className="w-full py-2.5 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] disabled:opacity-50 text-white text-sm font-medium transition-colors"
          data-testid="button-save-api-key"
        >
          {savingKey ? "Saving..." : "Connect AI"}
        </button>
      </div>
    </div>
  );

  const renderConversationList = () => (
    <div className="flex-1 flex flex-col">
      <div className="p-3 flex items-center justify-between">
        <button
          onClick={() => createConversation.mutate()}
          className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            isLight ? "bg-black/5 hover:bg-black/10 text-gray-700" : "bg-white/5 hover:bg-white/10 text-white/80"
          )}
          data-testid="button-new-chat"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
        <button
          onClick={() => setShowSettings(true)}
          className={cn("p-2 rounded-lg transition-colors", isLight ? "hover:bg-black/5 text-gray-500" : "hover:bg-white/5 text-white/40")}
          data-testid="button-ai-settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 space-y-1 scrollbar-none">
        {conversations.length === 0 ? (
          <div className={cn("text-center py-12 text-sm", isLight ? "text-gray-400" : "text-white/30")}>
            No conversations yet. Start a new chat!
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setActiveConversation(conv.id)}
              className={cn("group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
                isLight ? "hover:bg-black/5 text-gray-700" : "hover:bg-white/5 text-white/70"
              )}
              data-testid={`conversation-${conv.id}`}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0 opacity-50" />
              <span className="flex-1 text-sm truncate">{conv.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); deleteConversation.mutate(conv.id); }}
                className={cn("opacity-0 group-hover:opacity-100 p-1 rounded transition-all",
                  isLight ? "hover:bg-black/10 text-gray-400" : "hover:bg-white/10 text-white/30"
                )}
                data-testid={`button-delete-conversation-${conv.id}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderSettingsView = () => (
    <div className="flex-1 flex flex-col p-4 gap-4">
      <button
        onClick={() => setShowSettings(false)}
        className={cn("flex items-center gap-2 text-sm", isLight ? "text-gray-500 hover:text-gray-700" : "text-white/50 hover:text-white/80")}
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>
      <h3 className={cn("text-lg font-semibold", isLight ? "text-gray-800" : "text-white")}>AI Settings</h3>
      <div className={cn("p-3 rounded-lg border", isLight ? "bg-green-50 border-green-200" : "bg-green-500/10 border-green-500/20")}>
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-green-500" />
          <span className={cn("text-sm font-medium", isLight ? "text-green-700" : "text-green-400")}>
            {aiSettings?.provider === "anthropic" ? "Claude" : "OpenAI"} key connected
          </span>
        </div>
      </div>
      <div className="space-y-3">
        <p className={cn("text-sm", isLight ? "text-gray-500" : "text-white/50")}>Update your API key or switch providers:</p>
        <div className="flex gap-2">
          <button
            onClick={() => setProvider("anthropic")}
            className={cn("flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all",
              provider === "anthropic"
                ? "border-[#EF4444] bg-[#EF4444]/10 text-[#EF4444]"
                : isLight ? "border-gray-200 text-gray-500" : "border-white/10 text-white/50"
            )}
          >
            Claude
          </button>
          <button
            onClick={() => setProvider("openai")}
            className={cn("flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all",
              provider === "openai"
                ? "border-[#EF4444] bg-[#EF4444]/10 text-[#EF4444]"
                : isLight ? "border-gray-200 text-gray-500" : "border-white/10 text-white/50"
            )}
          >
            OpenAI
          </button>
        </div>
        <input
          type="password"
          placeholder="Enter new API key..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className={cn("w-full px-3 py-2.5 rounded-lg text-sm border outline-none transition-colors",
            isLight ? "bg-white border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-[#EF4444]"
              : "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#EF4444]"
          )}
        />
        <button
          onClick={handleSaveKey}
          disabled={!apiKey.trim() || savingKey}
          className="w-full py-2.5 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] disabled:opacity-50 text-white text-sm font-medium transition-colors"
        >
          {savingKey ? "Saving..." : "Update Key"}
        </button>
        <button
          onClick={handleRemoveKey}
          className={cn("w-full py-2.5 rounded-lg text-sm font-medium border transition-colors",
            isLight ? "border-red-200 text-red-600 hover:bg-red-50" : "border-red-500/20 text-red-400 hover:bg-red-500/10"
          )}
        >
          Remove Key
        </button>
      </div>
    </div>
  );

  const renderChatView = () => (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-3 py-2 flex items-center gap-2 border-b border-white/5">
        <button
          onClick={() => setActiveConversation(null)}
          className={cn("p-1.5 rounded-lg transition-colors", isLight ? "hover:bg-black/5 text-gray-500" : "hover:bg-white/5 text-white/50")}
          data-testid="button-back-to-conversations"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className={cn("text-sm font-medium truncate flex-1", isLight ? "text-gray-700" : "text-white/80")}>
          {conversations.find(c => c.id === activeConversation)?.title || "Chat"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-none">
        {messages.length === 0 && !streaming && (
          <div className={cn("text-center py-12 text-sm", isLight ? "text-gray-400" : "text-white/30")}>
            Send a message to start the conversation
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex gap-2.5", msg.role === "user" ? "justify-end" : "justify-start")}>
            {msg.role === "assistant" && (
              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", isLight ? "bg-[#EF4444]/10" : "bg-[#EF4444]/15")}>
                <Bot className="w-4 h-4 text-[#EF4444]" />
              </div>
            )}
            <div className={cn("max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
              msg.role === "user"
                ? "bg-[#EF4444] text-white rounded-br-md"
                : isLight ? "bg-gray-100 text-gray-800 rounded-bl-md" : "bg-white/[0.07] text-white/90 rounded-bl-md"
            )} data-testid={`message-${msg.id}`}>
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", isLight ? "bg-gray-200" : "bg-white/10")}>
                <User className="w-4 h-4 opacity-60" />
              </div>
            )}
          </div>
        ))}
        {streaming && streamingText && (
          <div className="flex gap-2.5 justify-start">
            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", isLight ? "bg-[#EF4444]/10" : "bg-[#EF4444]/15")}>
              <Bot className="w-4 h-4 text-[#EF4444]" />
            </div>
            <div className={cn("max-w-[80%] px-3.5 py-2.5 rounded-2xl rounded-bl-md text-sm leading-relaxed whitespace-pre-wrap",
              isLight ? "bg-gray-100 text-gray-800" : "bg-white/[0.07] text-white/90"
            )}>
              {streamingText}
              <span className="inline-block w-1.5 h-4 bg-[#EF4444] ml-0.5 animate-pulse rounded-sm" />
            </div>
          </div>
        )}
        {streaming && !streamingText && (
          <div className="flex gap-2.5 justify-start">
            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", isLight ? "bg-[#EF4444]/10" : "bg-[#EF4444]/15")}>
              <Bot className="w-4 h-4 text-[#EF4444]" />
            </div>
            <div className={cn("px-3.5 py-2.5 rounded-2xl rounded-bl-md", isLight ? "bg-gray-100" : "bg-white/[0.07]")}>
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-[#EF4444]/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-[#EF4444]/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-[#EF4444]/50 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={cn("p-3 border-t", isLight ? "border-gray-200" : "border-white/5")}>
        <div className={cn("flex items-end gap-2 rounded-xl border px-3 py-2 transition-colors",
          isLight ? "bg-white border-gray-200 focus-within:border-[#EF4444]" : "bg-white/5 border-white/10 focus-within:border-[#EF4444]/50"
        )}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className={cn("flex-1 bg-transparent text-sm outline-none resize-none max-h-32",
              isLight ? "text-gray-800 placeholder:text-gray-400" : "text-white placeholder:text-white/30"
            )}
            disabled={streaming}
            data-testid="input-chat-message"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || streaming}
            className={cn("p-1.5 rounded-lg transition-all",
              input.trim() && !streaming
                ? "bg-[#EF4444] text-white hover:bg-[#DC2626]"
                : isLight ? "text-gray-300" : "text-white/20"
            )}
            data-testid="button-send-message"
          >
            {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className={cn(
            "fixed right-0 top-0 bottom-0 w-[380px] z-50 flex flex-col border-l shadow-2xl",
            isLight ? "bg-white border-gray-200" : "bg-[#0d0d0d] border-white/5"
          )}
          data-testid="chat-sidebar"
        >
          <div className={cn("flex items-center justify-between px-4 py-3 border-b", isLight ? "border-gray-200" : "border-white/5")}>
            <div className="flex items-center gap-2">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", isLight ? "bg-[#EF4444]/10" : "bg-[#EF4444]/15")}>
                <Sparkles className="w-4.5 h-4.5 text-[#EF4444]" />
              </div>
              <span className={cn("text-sm font-semibold", isLight ? "text-gray-800" : "text-white")}>HUB AI</span>
            </div>
            <button
              onClick={onClose}
              className={cn("p-1.5 rounded-lg transition-colors", isLight ? "hover:bg-black/5 text-gray-400" : "hover:bg-white/5 text-white/40")}
              data-testid="button-close-chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!aiSettings?.hasKey && !showSettings ? renderSetupView() : null}
          {aiSettings?.hasKey && showSettings ? renderSettingsView() : null}
          {aiSettings?.hasKey && !showSettings && !activeConversation ? renderConversationList() : null}
          {aiSettings?.hasKey && !showSettings && activeConversation ? renderChatView() : null}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
