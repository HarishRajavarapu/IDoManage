import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, X, MessageSquare, ArrowRight } from "lucide-react";
import { AIConversationMessage, Task } from "../types";

interface AIAssistantProps {
  tasks: Task[];
  googleAccessToken: string | null;
  onAddTask: (title: string, priority: 'LOW' | 'MEDIUM' | 'HIGH') => void;
  onProcessAction: (actionData: {
    extractedTasks?: any[];
    insights?: any[];
    readHistory?: any[];
  }) => Promise<void>;
}

export default function AIAssistant({ 
  tasks, 
  googleAccessToken, 
  onAddTask, 
  onProcessAction 
}: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIConversationMessage[]>([
    {
      role: "model",
      text: "Hello! I am IDoManage, your Chief of Staff. How can I assist you with your productivity, schedules, or study plans today?",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedAction, setSuggestedAction] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: AIConversationMessage = {
      role: "user",
      text: textToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setSuggestedAction(null);

    try {
      // Build task summary state to provide context to Gemini
      const taskState = tasks.map(t => ({
        title: t.title,
        completed: t.completed,
        priority: t.priority
      }));

      // Pre-fetch real emails if asking for email analysis and Google is authenticated
      let fetchedEmails: any[] = [];
      const lowerText = textToSend.toLowerCase();
      const isEmailQuery = lowerText.includes("email") || lowerText.includes("mail") || lowerText.includes("inbox") || lowerText.includes("gmail") || lowerText.includes("read");

      if (isEmailQuery && googleAccessToken) {
        try {
          const listRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5", {
            headers: { Authorization: `Bearer ${googleAccessToken}` }
          });
          if (listRes.ok) {
            const listData = await listRes.json();
            if (listData.messages && listData.messages.length > 0) {
              for (const msg of listData.messages) {
                const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`, {
                  headers: { Authorization: `Bearer ${googleAccessToken}` }
                });
                if (msgRes.ok) {
                  const msgData = await msgRes.json();
                  const headers = msgData.payload.headers || [];
                  const subject = headers.find((h: any) => h.name.toLowerCase() === "subject")?.value || "(No Subject)";
                  const from = headers.find((h: any) => h.name.toLowerCase() === "from")?.value || "Unknown Sender";
                  const date = headers.find((h: any) => h.name.toLowerCase() === "date")?.value || "";
                  const snippet = msgData.snippet || "";
                  fetchedEmails.push({ subject, from, date, snippet });
                }
              }
            }
          }
        } catch (err) {
          console.warn("Real-time email fetching in Chat Bot failed:", err);
        }
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          taskState,
          emails: fetchedEmails,
          googleConnected: !!googleAccessToken
        })
      });

      if (!res.ok) {
        throw new Error("Failed to get response from Chief of Staff.");
      }

      const data = await res.json();
      
      setMessages(prev => [...prev, {
        role: "model",
        text: data.text,
        timestamp: Date.now()
      }]);

      if (data.suggestedAction) {
        setSuggestedAction(data.suggestedAction);
      }

      if (data.extractedTasks || data.insights || data.readHistory) {
        await onProcessAction({
          extractedTasks: data.extractedTasks,
          insights: data.insights,
          readHistory: data.readHistory
        });
      }
    } catch (error: any) {
      setMessages(prev => [...prev, {
        role: "model",
        text: `Error: ${error.message || "Failed to reach IDoManage. Check your GEMINI_API_KEY settings."}`,
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeSuggestedAction = () => {
    if (!suggestedAction) return;
    
    // Parse action name or title and perform quick mock addition
    onAddTask(suggestedAction, "HIGH");
    
    setMessages(prev => [...prev, {
      role: "model",
      text: `Successfully registered action item: "${suggestedAction}" into your Master Task List!`,
      timestamp: Date.now()
    }]);
    setSuggestedAction(null);
  };

  const quickPrompts = [
    "What is my next action?",
    "Predict my project deadline risk",
    "Give me study recommendations",
    "Draft a deep focus schedule"
  ];

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 flex flex-col items-end">
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          id="ai-assistant-trigger"
          className="w-14 h-14 bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] rounded-full flex items-center justify-center shadow-lg shadow-purple-500/40 hover:scale-105 transition-all cursor-pointer relative group"
        >
          <MessageSquare className="w-6 h-6 text-white group-hover:rotate-6 transition-transform" />
          <span className="absolute right-16 top-3 bg-black/80 backdrop-blur-md text-xs text-white px-3 py-1 rounded-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Ask your Chief of Staff
          </span>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#050816] animate-pulse" />
        </button>
      )}

      {/* Floating Chat Container */}
      {isOpen && (
        <div className="w-[calc(100vw-2rem)] sm:w-96 h-[480px] sm:h-[500px] bg-[#0c1024]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-[#7C3AED]/20 to-[#3B82F6]/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/30 flex items-center justify-center">
                <Bot className="w-4 h-4 text-[#A855F7]" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">IDoManage Chief of Staff</h4>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Continuous Monitoring</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "model" && (
                  <div className="w-7 h-7 rounded-full bg-[#7C3AED]/10 flex items-center justify-center text-xs text-[#A855F7] border border-[#7C3AED]/20 shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className={`max-w-[78%] rounded-xl p-3 text-xs leading-relaxed ${
                  m.role === "user" 
                    ? "bg-[#7C3AED] text-white rounded-br-none" 
                    : "bg-white/5 text-white/90 border border-white/10 rounded-bl-none"
                }`}>
                  <p className="whitespace-pre-line">{m.text}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-full bg-[#7C3AED]/10 flex items-center justify-center text-xs text-[#A855F7] border border-[#7C3AED]/20 shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl rounded-bl-none p-3 text-xs text-white/50 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#7C3AED] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-[#7C3AED] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-[#7C3AED] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {/* Suggested Action Pill */}
            {suggestedAction && (
              <div className="p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-[#7C3AED]/20 rounded-xl space-y-2 animate-in fade-in zoom-in-95">
                <p className="text-[11px] text-[#A855F7] font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Proposed Task Integration
                </p>
                <p className="text-xs text-white font-medium">"{suggestedAction}"</p>
                <button
                  onClick={executeSuggestedAction}
                  className="w-full py-1.5 bg-white text-black text-[11px] font-bold rounded-lg hover:opacity-95 transition-opacity flex items-center justify-center gap-1 cursor-pointer"
                >
                  Create Task Now <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length === 1 && (
            <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-white/5 bg-black/20">
              {quickPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(p)}
                  className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-white/60 hover:text-white transition-colors cursor-pointer border border-white/5"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Form Input */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }} 
            className="p-3 border-t border-white/10 bg-black/40 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Chief of Staff..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]/60"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40 text-white transition-colors cursor-pointer shrink-0"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
