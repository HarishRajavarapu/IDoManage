import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Send, 
  CheckCircle, 
  Clock, 
  Search, 
  Layers, 
  ChevronRight, 
  X, 
  Mail, 
  FileText, 
  HelpCircle,
  Play,
  ArrowRight
} from "lucide-react";
import { Task, Project } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface DashboardProps {
  user: any;
  tasks: Task[];
  projects: Project[];
  activeProject: Project | null;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onTriggerRecovery: () => void;
  googleAccessToken: string | null;
  onAddTask?: (title: string, priority: 'LOW' | 'MEDIUM' | 'HIGH') => void;
  onProcessAction?: (actionData: {
    extractedTasks?: any[];
    insights?: any[];
    readHistory?: any[];
  }) => Promise<void>;
}

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export default function Dashboard({
  user,
  tasks,
  projects,
  activeProject,
  onUpdateTask,
  onTriggerRecovery,
  googleAccessToken,
  onAddTask,
  onProcessAction
}: DashboardProps) {
  // Local states
  const [taskSearch, setTaskSearch] = useState("");
  const [taskFilter, setTaskFilter] = useState<"all" | "google">("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // AI Guide States
  const [guideLoading, setGuideLoading] = useState(false);
  const [guideData, setGuideData] = useState<{
    guide: string;
    estimatedTime: string;
    resources: string[];
  } | null>(null);

  // Chat bar states
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      text: "Hello! I am your AI Chief of Staff. I have fully indexed your active tasks and Gmail feeds. Ask me anything or click 'Ask AI' beside any task for complete insights!"
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatLoading]);

  // Fetch Task Insights
  const handleFetchTaskGuide = async (task: Task) => {
    setSelectedTask(task);
    setGuideLoading(true);
    setGuideData(null);
    try {
      const res = await fetch("/api/task-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task })
      });
      if (res.ok) {
        const data = await res.json();
        setGuideData(data);
      } else {
        throw new Error("Failed to fetch guide");
      }
    } catch (err) {
      console.error(err);
      setGuideData({
        guide: `## How to complete: ${task.title}\n\n1. Break the task down into clear parts.\n2. Work for a focused block of 25 minutes.\n3. Mark as complete once finished!`,
        estimatedTime: "30 minutes",
        resources: ["IDoManage Core Tools"]
      });
    } finally {
      setGuideLoading(false);
    }
  };

  // Submit chat query to AI
  const handleSendChat = async (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim() || isChatLoading) return;

    const updatedMsgs = [...chatMessages, { role: "user" as const, text }];
    setChatMessages(updatedMsgs);
    if (!textToSend) setChatInput("");
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMsgs.map(m => ({ role: m.role, text: m.text })),
          taskState: tasks,
          googleConnected: !!googleAccessToken
        })
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [
          ...prev, 
          { role: "model", text: data.text || "I processed your request, let me know if you need more details!" }
        ]);
        if (onProcessAction && (data.extractedTasks || data.insights || data.readHistory)) {
          await onProcessAction({
            extractedTasks: data.extractedTasks,
            insights: data.insights,
            readHistory: data.readHistory
          });
        }
      } else {
        throw new Error("Chat failed");
      }
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [
        ...prev,
        { role: "model", text: "I apologize, my mental connection is lagging. Please verify your connection or try again." }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Filter Tasks
  const activeTasks = tasks.filter(t => !t.completed);
  
  const filteredTasks = activeTasks.filter(t => {
    const isGoogle = !!t.sender || (t.attachments && t.attachments.length > 0);
    const matchesFilter = taskFilter === "all" || (taskFilter === "google" && isGoogle);
    const matchesSearch = t.title.toLowerCase().includes(taskSearch.toLowerCase()) || 
                          (t.description && t.description.toLowerCase().includes(taskSearch.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  // Simple custom inline Markdown parser
  const renderMarkdown = (text: string) => {
    if (!text) return null;
    return text.split("\n").map((line, idx) => {
      if (line.startsWith("### ")) {
        return <h4 key={idx} className="text-sm font-black text-slate-800 mt-3 mb-1.5">{line.replace("### ", "")}</h4>;
      }
      if (line.startsWith("## ")) {
        return <h3 key={idx} className="text-base font-black text-indigo-600 mt-4 mb-2">{line.replace("## ", "")}</h3>;
      }
      if (line.startsWith("# ")) {
        return <h2 key={idx} className="text-lg font-black text-slate-800 mt-5 mb-2.5">{line.replace("# ", "")}</h2>;
      }
      if (line.startsWith("* ") || line.startsWith("- ")) {
        const cleanText = line.substring(2);
        return (
          <ul key={idx} className="list-disc list-inside pl-3 mb-1.5">
            <li className="text-xs text-slate-700 font-semibold">{parseInlineBold(cleanText)}</li>
          </ul>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        const cleanText = line.replace(/^\d+\.\s/, "");
        const number = line.match(/^\d+/)?.[0];
        return (
          <ol key={idx} className="list-decimal list-inside pl-3 mb-1.5">
            <li className="text-xs text-slate-700 font-semibold">
              <span className="font-bold text-indigo-600 mr-1">{number}.</span>
              {parseInlineBold(cleanText)}
            </li>
          </ol>
        );
      }
      if (line.trim() === "") return <div key={idx} className="h-2" />;
      return <p key={idx} className="text-xs text-slate-600 font-semibold leading-relaxed mb-1.5">{parseInlineBold(line)}</p>;
    });
  };

  const parseInlineBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-black text-slate-800">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 125, damping: 14 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 relative"
    >
      {/* Top Welcome Banner */}
      <motion.div 
        variants={itemVariants} 
        className="bg-white p-6 rounded-3xl border-4 border-slate-800 shadow-[4px_4px_0px_0px_#1e293b] flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-black uppercase rounded-full border-2 border-indigo-600 shadow-[1px_1px_0px_0px_#1e293b] mb-2">
            <Layers className="w-3.5 h-3.5" /> Workspace Central
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-none">
            Welcome Back, <span className="font-doodle text-indigo-600 text-3xl">{user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "Scholar"}</span>!
          </h2>
          <p className="text-slate-500 text-xs font-semibold mt-1.5">
            You have <span className="text-indigo-600 font-extrabold">{activeTasks.length} pending tasks</span> waiting for action.
          </p>
        </div>

        {/* AI Recovery Mode quick launch if risk exists */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onTriggerRecovery}
            className="px-4 py-2 bg-amber-200 hover:bg-amber-300 border-3 border-slate-800 rounded-2xl text-xs font-black shadow-[2px_2px_0px_0px_#1e293b] cursor-pointer text-slate-800 flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" /> Quick AI Recovery
          </motion.button>
        </div>
      </motion.div>

      {/* Main Grid: Google Active Tasks List (Left) & Chat with AI Chief of Staff (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column - Active Tasks from Google Products */}
        <motion.div 
          variants={itemVariants}
          className="col-span-12 lg:col-span-7 bg-white border-4 border-slate-800 rounded-3xl p-6 shadow-[5px_5px_0px_0px_#1e293b] flex flex-col space-y-4 min-h-[500px]"
        >
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b-3 border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-800">
                Active Roadmap Tasks
              </h3>
              <p className="text-slate-400 text-xs font-bold mt-0.5">
                Checkboxes mark progress; 'Ask AI' creates complete guide.
              </p>
            </div>

            {/* Quick Toggle Filter */}
            <div className="flex bg-slate-100 p-1 rounded-xl border-2 border-slate-800 self-start sm:self-auto">
              <button
                onClick={() => setTaskFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  taskFilter === "all" ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                All Active
              </button>
              <button
                onClick={() => setTaskFilter("google")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                  taskFilter === "google" ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Mail className="w-3 h-3" /> Google Sync
              </button>
            </div>
          </div>

          {/* Local Task Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter tasks by name or description..."
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-3 border-slate-800 rounded-2xl text-xs font-bold shadow-[1.5px_1.5px_0px_0px_#1e293b] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Tasks Container */}
          <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => {
                  const isGoogleTask = !!task.sender || (task.attachments && task.attachments.length > 0);
                  return (
                    <motion.div
                      layout
                      key={task.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ scale: 1.01 }}
                      className={`p-4 rounded-3xl border-4 border-slate-800 shadow-[3px_3px_0px_0px_#1e293b] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                        isGoogleTask ? "bg-amber-50/50 hover:bg-amber-50" : "bg-white hover:bg-slate-50"
                      }`}
                    >
                      {/* Checkbox and task metadata */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => onUpdateTask(task.id, { completed: true })}
                          className="w-5.5 h-5.5 rounded-full border-3 border-slate-800 flex items-center justify-center cursor-pointer bg-white text-indigo-600 font-black text-xs shrink-0 mt-0.5"
                          title="Complete task"
                        >
                          <span className="opacity-0 hover:opacity-100 transition-opacity">✓</span>
                        </button>

                        <div className="space-y-1 min-w-0 flex-1">
                          {/* Title (Interactive) */}
                          <button
                            onClick={() => handleFetchTaskGuide(task)}
                            className="text-left font-extrabold text-sm text-slate-800 hover:text-indigo-600 transition-colors focus:outline-none block truncate pr-2 cursor-pointer"
                            title="Click for full AI insights"
                          >
                            {task.title}
                          </button>

                          {/* Description snippet */}
                          {task.description && (
                            <p className="text-xs text-slate-500 font-semibold line-clamp-1">
                              {task.description}
                            </p>
                          )}

                          {/* Indicators and Badges */}
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border-2 ${
                              task.priority === "HIGH" ? "bg-rose-100 text-rose-800 border-rose-600" :
                              task.priority === "MEDIUM" ? "bg-amber-100 text-amber-800 border-amber-600" : "bg-sky-100 text-sky-800 border-sky-600"
                            }`}>
                              {task.priority}
                            </span>

                            {task.deadline && (
                              <span className="text-[9px] font-mono font-black text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" /> {task.deadline}
                              </span>
                            )}

                            {isGoogleTask && (
                              <span className="text-[9px] font-black bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.5 rounded flex items-center gap-0.5 uppercase tracking-wide">
                                <Mail className="w-2.5 h-2.5" /> Google Sync
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Ask AI button */}
                      <div className="shrink-0 flex items-center self-end md:self-auto">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleFetchTaskGuide(task)}
                          className="px-3.5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white border-2 border-slate-800 text-xs font-black rounded-xl shadow-[2px_2px_0px_0px_#1e293b] flex items-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Ask AI
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="py-16 text-center text-xs text-slate-400 italic bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 font-medium">
                  {taskSearch ? "No active tasks matches your search filters!" : "All clean! Generate custom objectives or sync your inbox above!"}
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Right Column - Chat or Queries bar to Ask AI */}
        <motion.div 
          variants={itemVariants}
          className="col-span-12 lg:col-span-5 bg-white border-4 border-slate-800 rounded-3xl p-6 shadow-[5px_5px_0px_0px_#1e293b] flex flex-col h-[500px]"
        >
          <div className="border-b-3 border-slate-100 pb-3 mb-3 flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 border-2 border-indigo-600 text-indigo-700 rounded-xl">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800">
                AI Chief of Staff Assistant
              </h3>
              <p className="text-[10px] text-slate-400 font-bold">
                Query schedules, emails, or request action updates.
              </p>
            </div>
          </div>

          {/* Message History area */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
            {chatMessages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`p-3 max-w-[85%] rounded-2xl border-2 border-slate-800 shadow-[1.5px_1.5px_0px_0px_#1e293b] ${
                  msg.role === "user" 
                    ? "bg-slate-800 text-white font-bold text-xs" 
                    : "bg-[#FEFCE8] text-slate-800 font-extrabold text-xs leading-relaxed"
                }`}>
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}

            {isChatLoading && (
              <div className="flex justify-start">
                <div className="p-3 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs text-slate-500 font-bold italic flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  Chief of Staff is thinking...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick suggestions block */}
          {chatMessages.length === 1 && (
            <div className="py-2 flex flex-wrap gap-1.5">
              {[
                "Analyze my cs402 class schedule",
                "What's my highest priority tasks?",
                "Draft a study window routine"
              ].map((suggestion, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => handleSendChat(suggestion)}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-[9px] font-bold text-slate-600 transition-all cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Chat input bar */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendChat(); }}
            className="mt-3 flex gap-2 items-center"
          >
            <input
              type="text"
              placeholder="Ask anything or request action insights..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={isChatLoading}
              className="flex-1 px-4 py-2.5 bg-slate-50 border-3 border-slate-800 rounded-2xl text-xs font-bold shadow-[1.5px_1.5px_0px_0px_#1e293b] focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!chatInput.trim() || isChatLoading}
              className="p-3 bg-indigo-500 hover:bg-indigo-600 text-white border-2 border-slate-800 rounded-2xl shadow-[1.5px_1.5px_0px_0px_#1e293b] cursor-pointer disabled:opacity-45 flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </form>
        </motion.div>

      </div>

      {/* Task Complete Insights Overlay Panel (Right Slide-over Drawer) */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTask(null)}
              className="absolute inset-0 bg-slate-900"
            />

            {/* Slider Content */}
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="relative w-full max-w-lg bg-white h-full border-l-4 border-slate-800 shadow-2xl p-6 flex flex-col justify-between z-10"
            >
              <div className="space-y-6 overflow-y-auto flex-1 pr-1">
                {/* Header block */}
                <div className="flex justify-between items-start border-b-3 border-slate-100 pb-4">
                  <div>
                    <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-black uppercase rounded">
                      Task Guide & Insights
                    </span>
                    <h3 className="text-lg font-black text-slate-800 leading-snug mt-1.5">
                      {selectedTask.title}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setSelectedTask(null)}
                    className="p-1.5 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>

                {/* Main Guidance Block */}
                <div className="space-y-4">
                  {guideLoading ? (
                    <div className="py-16 flex flex-col items-center justify-center space-y-4 text-center">
                      <div className="relative">
                        <Sparkles className="w-10 h-10 text-indigo-600 animate-spin" />
                        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-700">Strategizing Action Path...</p>
                        <p className="text-xs text-slate-400 font-semibold mt-1">Chief of Staff is formulating user-friendly steps.</p>
                      </div>
                    </div>
                  ) : (
                    guideData && (
                      <div className="space-y-4">
                        {/* Summary / Metadata widgets */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-indigo-50/50 border-2 border-indigo-100 rounded-2xl flex items-center gap-2.5">
                            <Clock className="w-5 h-5 text-indigo-600 shrink-0" />
                            <div>
                              <p className="text-[9px] text-slate-400 font-black uppercase">Estimated Time</p>
                              <p className="text-xs font-black text-indigo-700">{guideData.estimatedTime || "30 minutes"}</p>
                            </div>
                          </div>

                          <div className="p-3 bg-amber-50/50 border-2 border-amber-100 rounded-2xl flex items-center gap-2.5">
                            <Layers className="w-5 h-5 text-amber-600 shrink-0" />
                            <div>
                              <p className="text-[9px] text-slate-400 font-black uppercase">Core Resources</p>
                              <p className="text-xs font-black text-amber-700 truncate">
                                {guideData.resources && guideData.resources.length > 0 ? guideData.resources[0] : "IDoManage Desk"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Guide description / Markdown instructions */}
                        <div className="bg-slate-50 border-2 border-slate-200 p-5 rounded-2xl space-y-2 leading-relaxed">
                          {renderMarkdown(guideData.guide)}
                        </div>

                        {/* Resources Badges Checklist */}
                        {guideData.resources && guideData.resources.length > 0 && (
                          <div className="space-y-1.5">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Required Tools Checklist</p>
                            <div className="flex flex-wrap gap-1.5">
                              {guideData.resources.map((resName, resIdx) => (
                                <span key={resIdx} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 shadow-sm flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                  {resName}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Mark Complete CTA */}
              <div className="border-t-2 border-slate-100 pt-4 flex gap-3">
                <button
                  onClick={() => {
                    onUpdateTask(selectedTask.id, { completed: true });
                    setSelectedTask(null);
                  }}
                  className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-600 text-white border-2 border-slate-800 text-xs font-black rounded-2xl shadow-[2.5px_2.5px_0px_0px_#1e293b] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" /> Mark Task Completed
                </button>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border-2 border-slate-800 text-xs font-bold rounded-2xl shadow-[2.5px_2.5px_0px_0px_#1e293b] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
