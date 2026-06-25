import React, { useState } from "react";
import { Plus, Trash2, Calendar, Sparkles, AlertCircle, ArrowRight, CheckCircle, Clock, GripVertical, SlidersHorizontal } from "lucide-react";
import { Task, Milestone, Project } from "../types";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import ConfirmationDialog from "./ConfirmationDialog";

interface TaskManagerProps {
  tasks: Task[];
  milestones: Milestone[];
  activeProject: Project | null;
  onDecompose: (goal: string, targetDate: string) => Promise<void>;
  onAddTask: (title: string, priority: 'LOW' | 'MEDIUM' | 'HIGH', milestoneId?: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onSyncCalendar: () => Promise<void>;
}

export default function TaskManager({
  tasks,
  milestones,
  activeProject,
  onDecompose,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onSyncCalendar
}: TaskManagerProps) {
  const [goal, setGoal] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [isDecomposing, setIsDecomposing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manual task form state
  const [manualTitle, setManualTitle] = useState("");
  const [manualPriority, setManualPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>("MEDIUM");
  const [selectedMilestone, setSelectedMilestone] = useState("");

  // Filtering state
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | "LOW" | "MEDIUM" | "HIGH">("ALL");
  const [milestoneFilter, setMilestoneFilter] = useState<string>("ALL");

  // Deletion confirmation state
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // Drag and drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
  const [dragOverMilestoneId, setDragOverMilestoneId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "after">("before");

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverTaskId(null);
    setDragOverMilestoneId(null);
  };

  const handleDragOverTask = (e: React.DragEvent<HTMLDivElement>, targetTaskId: string) => {
    e.preventDefault();
    if (draggedTaskId === targetTaskId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const position = relativeY < rect.height / 2 ? "before" : "after";
    setDropPosition(position);
    setDragOverTaskId(targetTaskId);
    setDragOverMilestoneId(null);
  };

  const handleDropOnTask = (e: React.DragEvent<HTMLDivElement>, targetTask: Task) => {
    e.preventDefault();
    if (!draggedTaskId || draggedTaskId === targetTask.id) return;

    const draggedTask = tasks.find(t => t.id === draggedTaskId);
    if (!draggedTask) return;

    const targetMilestoneId = targetTask.milestoneId;
    
    // Get and sort other tasks in milestone
    const otherTasksInMilestone = tasks
      .filter(t => t.milestoneId === targetMilestoneId && t.id !== draggedTaskId)
      .sort((a, b) => {
        const orderA = a.order ?? 999999;
        const orderB = b.order ?? 999999;
        if (orderA !== orderB) return orderA - orderB;
        return a.createdAt - b.createdAt;
      });

    const targetIdx = otherTasksInMilestone.findIndex(t => t.id === targetTask.id);
    const insertIdx = dropPosition === "before" ? targetIdx : targetIdx + 1;
    otherTasksInMilestone.splice(insertIdx, 0, draggedTask);

    otherTasksInMilestone.forEach((t, index) => {
      const isDragged = t.id === draggedTaskId;
      const milestoneChanged = isDragged && draggedTask.milestoneId !== targetMilestoneId;
      const orderChanged = t.order !== index;
      
      if (isDragged || milestoneChanged || orderChanged) {
        onUpdateTask(t.id, {
          order: index,
          milestoneId: targetMilestoneId
        });
      }
    });

    handleDragEnd();
  };

  const handleDragOverMilestone = (e: React.DragEvent<HTMLDivElement>, milestoneId: string) => {
    e.preventDefault();
    if (!dragOverTaskId) {
      setDragOverMilestoneId(milestoneId);
    }
  };

  const handleDropOnMilestone = (e: React.DragEvent<HTMLDivElement>, milestoneId: string) => {
    e.preventDefault();
    if (dragOverTaskId) return;
    if (!draggedTaskId) return;

    const draggedTask = tasks.find(t => t.id === draggedTaskId);
    if (!draggedTask) return;

    if (draggedTask.milestoneId === milestoneId) {
      handleDragEnd();
      return;
    }

    const otherTasksInMilestone = tasks
      .filter(t => t.milestoneId === milestoneId && t.id !== draggedTaskId)
      .sort((a, b) => {
        const orderA = a.order ?? 999999;
        const orderB = b.order ?? 999999;
        if (orderA !== orderB) return orderA - orderB;
        return a.createdAt - b.createdAt;
      });

    const updatedTasks = [...otherTasksInMilestone, draggedTask];
    updatedTasks.forEach((t, index) => {
      onUpdateTask(t.id, {
        order: index,
        milestoneId: milestoneId
      });
    });

    handleDragEnd();
  };

  const handleDecompose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setIsDecomposing(true);
    setError(null);
    try {
      await onDecompose(goal, targetDate);
      setGoal("");
    } catch (err: any) {
      setError(err.message || "Decomposition failed. Ensure your GEMINI_API_KEY is configured.");
    } finally {
      setIsDecomposing(false);
    }
  };

  const handleAddManualTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    onAddTask(manualTitle, manualPriority, selectedMilestone || undefined);
    setManualTitle("");
    setSelectedMilestone("");
  };

  const handleSyncCalendarClick = async () => {
    setIsSyncingCalendar(true);
    setSyncSuccess(false);
    try {
      await onSyncCalendar();
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 4000);
    } catch (err) {
      console.error("Calendar Sync failed:", err);
    } finally {
      setIsSyncingCalendar(false);
    }
  };

  const filteredMilestones = milestones
    .filter((m) => milestoneFilter === "ALL" || m.id === milestoneFilter)
    .sort((a, b) => a.order - b.order);

  const displayedTasksCount = tasks.filter((t) => {
    const matchesMilestone = milestoneFilter === "ALL" || t.milestoneId === milestoneFilter;
    const matchesPriority = priorityFilter === "ALL" || t.priority === priorityFilter;
    return matchesMilestone && matchesPriority;
  }).length;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 14 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* AI Task Decomposition Generator Box */}
      <motion.div 
        variants={itemVariants} 
        className="bg-white border-4 border-slate-800 rounded-3xl p-6 shadow-[5px_5px_0px_0px_#1e293b] relative overflow-hidden"
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <h3 className="text-lg font-black text-slate-800">AI Task Breakdown & Planner</h3>
        </div>
        
        <p className="text-slate-500 text-xs mb-5 max-w-2xl font-semibold leading-relaxed">
          Type down a big goal, select a deadline, and let the Chief of Staff auto-decompose it into distinct milestones, sequential tasks, duration estimates, and time blocks.
        </p>

        <form onSubmit={handleDecompose} className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6">
            <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">Big Goal</label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder='e.g., "Design final year presentation" or "Deploy AI platform"'
              className="w-full bg-slate-50 border-2 border-slate-300 focus:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-800 font-bold placeholder-slate-400 focus:outline-none transition-colors"
              required
            />
          </div>
          <div className="md:col-span-4">
            <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">Target Completion Date</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-300 focus:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none transition-colors"
            />
          </div>
          <div className="md:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={isDecomposing || !goal.trim()}
              className="w-full bg-[#FEF3C7] hover:bg-[#FDE68A] text-slate-800 font-black py-2.5 px-4 border-3 border-slate-800 rounded-2xl text-xs transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#1e293b]"
            >
              {isDecomposing ? (
                <>
                  <Clock className="w-4 h-4 animate-spin text-indigo-600" />
                  Generating...
                </>
              ) : (
                <>
                  Generate
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3.5 bg-rose-50 border-2 border-rose-400 text-rose-800 text-xs rounded-2xl flex items-center gap-2 font-bold">
            <AlertCircle className="w-4.5 h-4.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}
      </motion.div>

      {/* Main Roadmap Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Task Columns */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex justify-between items-center border-b-2 border-dashed border-slate-200 pb-3">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-1.5">
              Active Project Outline {activeProject && <span className="font-doodle text-indigo-600 text-base">({activeProject.name})</span>}
            </h3>

            {tasks.length > 0 && (
              <button
                onClick={handleSyncCalendarClick}
                disabled={isSyncingCalendar}
                className="px-3.5 py-1.5 bg-sky-50 hover:bg-sky-100 border-2 border-slate-800 text-slate-800 text-xs font-black rounded-2xl shadow-[2px_2px_0px_0px_#1e293b] transition-all cursor-pointer flex items-center gap-1.5"
              >
                {isSyncingCalendar ? (
                  <>
                    <Clock className="w-3.5 h-3.5 animate-spin text-sky-600" /> Syncing...
                  </>
                ) : syncSuccess ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Synced successfully!
                  </>
                ) : (
                  <>
                    <Calendar className="w-3.5 h-3.5" /> Sync Calendar Blocks
                  </>
                )}
              </button>
            )}
          </div>

          {milestones.length > 0 ? (
            <div className="space-y-4">
              {/* Filters Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border-3 border-slate-800 rounded-2xl p-3 shadow-[2px_2px_0px_0px_#1e293b] mb-2">
                <div className="flex flex-wrap items-center gap-3 md:gap-4 flex-1">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <SlidersHorizontal className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="text-xs font-black uppercase tracking-wider">Filters:</span>
                  </div>

                  {/* Priority Filter */}
                  <div className="flex items-center gap-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400">Priority</label>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value as any)}
                      className="bg-white border-2 border-slate-800 rounded-xl px-2 py-0.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="ALL">All</option>
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>
                  </div>

                  {/* Milestone Filter */}
                  <div className="flex items-center gap-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400">Milestone</label>
                    <select
                      value={milestoneFilter}
                      onChange={(e) => setMilestoneFilter(e.target.value)}
                      className="bg-white border-2 border-slate-800 rounded-xl px-2 py-0.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer max-w-[150px] truncate"
                    >
                      <option value="ALL">All Milestones</option>
                      {milestones
                        .sort((a, b) => a.order - b.order)
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            Phase {m.order}: {m.title}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Clear Button */}
                  {(priorityFilter !== "ALL" || milestoneFilter !== "ALL") && (
                    <button
                      onClick={() => {
                        setPriorityFilter("ALL");
                        setMilestoneFilter("ALL");
                      }}
                      className="text-[10px] font-black uppercase tracking-wide px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-300 rounded-xl transition-colors cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Counter Badge */}
                <div className="text-[10px] font-mono font-black text-indigo-600 bg-indigo-50/50 border border-indigo-200 rounded-lg px-2 py-0.5 shrink-0">
                  {displayedTasksCount} of {tasks.length} tasks matching
                </div>
              </div>

              {filteredMilestones.length > 0 ? (
                filteredMilestones.map((m) => {
                  const milestoneTasks = tasks
                    .filter((t) => t.milestoneId === m.id)
                    .filter((t) => priorityFilter === "ALL" || t.priority === priorityFilter)
                    .sort((a, b) => {
                      const orderA = a.order ?? 999999;
                      const orderB = b.order ?? 999999;
                      if (orderA !== orderB) return orderA - orderB;
                      return a.createdAt - b.createdAt;
                    });
                  return (
                    <div key={m.id} className="bg-white border-4 border-slate-800 rounded-3xl p-5 space-y-4 shadow-[3px_3px_0px_0px_#1e293b]">
                      {/* Milestone Header */}
                      <div className="flex items-center justify-between border-b-2 border-dashed border-slate-100 pb-2">
                        <h4 className="text-sm font-black text-indigo-600 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-slate-800" />
                          Phase {m.order}: {m.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-black uppercase">
                          {milestoneTasks.filter((t) => t.completed).length}/{milestoneTasks.length} Checked
                        </span>
                      </div>
 
                      {/* Milestone Task List */}
                      <div 
                        className={`space-y-2.5 p-1 rounded-2xl border-3 border-transparent transition-all duration-200 min-h-[70px] ${
                          dragOverMilestoneId === m.id ? "bg-indigo-50/50 border-dashed border-indigo-300" : ""
                        }`}
                        onDragOver={(e) => handleDragOverMilestone(e, m.id)}
                        onDrop={(e) => handleDropOnMilestone(e, m.id)}
                        onDragLeave={() => {
                          if (dragOverMilestoneId === m.id) setDragOverMilestoneId(null);
                        }}
                      >
                        {milestoneTasks.length > 0 ? (
                          milestoneTasks.map((t) => {
                            const isDraggingThis = draggedTaskId === t.id;
                            const isOverThis = dragOverTaskId === t.id;
                            return (
                              <React.Fragment key={t.id}>
                                {isOverThis && dropPosition === "before" && (
                                  <div className="h-1.5 bg-indigo-500 rounded-full animate-pulse my-2 relative">
                                    <div className="absolute -left-1 -top-[3px] w-3 h-3 rounded-full bg-indigo-600 border-2 border-white shadow-md" />
                                  </div>
                                )}
                                <div
                                  draggable={!t.completed}
                                  onDragStart={(e) => handleDragStart(e, t.id)}
                                  onDragEnd={handleDragEnd}
                                  onDragOver={(e) => handleDragOverTask(e, t.id)}
                                  onDrop={(e) => handleDropOnTask(e, t)}
                                  onDragLeave={() => {
                                    if (dragOverTaskId === t.id) setDragOverTaskId(null);
                                  }}
                                  className={`flex flex-col md:flex-row md:items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${
                                    t.completed
                                      ? "bg-slate-50 border-slate-300 opacity-60 cursor-default"
                                      : isDraggingThis
                                      ? "bg-indigo-50/40 border-dashed border-indigo-400 opacity-40 scale-[0.98] shadow-inner cursor-grabbing"
                                      : "bg-white border-slate-800 hover:translate-x-[1px] hover:translate-y-[1px] cursor-grab active:cursor-grabbing shadow-[2px_2px_0px_0px_#1e293b]"
                                  }`}
                                >
                                  <div className="flex items-start gap-3 flex-1 min-w-0 pr-4">
                                    {!t.completed && (
                                      <div className="text-slate-400 hover:text-slate-700 cursor-grab shrink-0 mt-0.5">
                                        <GripVertical className="w-4 h-4" />
                                      </div>
                                    )}
                                    <motion.button
                                      whileTap={{ scale: 0.85 }}
                                      onClick={() => {
                                        const nextCompleted = !t.completed;
                                        onUpdateTask(t.id, { completed: nextCompleted });
                                        if (nextCompleted) {
                                          confetti({
                                            particleCount: 75,
                                            spread: 60,
                                            origin: { y: 0.75 },
                                            colors: ["#6366F1", "#3B82F6", "#10B981", "#F59E0B", "#EC4899"]
                                          });
                                        }
                                      }}
                                      className={`w-6 h-6 rounded-full border-2.5 flex items-center justify-center cursor-pointer transition-all shrink-0 mt-0.5 relative overflow-hidden ${
                                        t.completed
                                          ? "bg-emerald-500 border-slate-800 text-white shadow-[1px_1px_0px_0px_#1e293b]"
                                          : "border-slate-300 hover:border-indigo-500 hover:scale-105 bg-white"
                                      }`}
                                    >
                                      {t.completed ? (
                                        <motion.svg
                                          className="w-3.5 h-3.5 text-white stroke-current"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          strokeWidth="4.5"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          initial={{ scale: 0.5, opacity: 0 }}
                                          animate={{ scale: 1, opacity: 1 }}
                                          transition={{ type: "spring", stiffness: 350, damping: 18 }}
                                        >
                                          <motion.polyline
                                            points="20 6 9 17 4 12"
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            transition={{ duration: 0.22, ease: "easeOut" }}
                                          />
                                        </motion.svg>
                                      ) : (
                                        <span className="w-1.5 h-1.5 rounded-full bg-transparent hover:bg-indigo-300 transition-colors" />
                                      )}
                                    </motion.button>
                                    <div className="min-w-0 flex-1 relative">
                                      <div className="relative inline-block max-w-full">
                                        <p className={`text-xs font-black transition-colors duration-300 ${t.completed ? "text-slate-400" : "text-slate-800"}`}>
                                          {t.title}
                                        </p>
                                        {/* Strike-through Line Pen Animation */}
                                        {t.completed && (
                                          <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 0.35, ease: "easeInOut" }}
                                            className="absolute left-0 top-[52%] h-[2.5px] bg-slate-400/80 rounded"
                                          />
                                        )}
                                      </div>
                                      {t.description && (
                                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed font-semibold">
                                          {t.description}
                                        </p>
                                      )}
                                      {t.sender && (
                                        <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-indigo-600 font-bold">
                                          <span className="px-1 py-0.2 bg-indigo-50 border border-indigo-200 rounded text-[8px] uppercase font-black">Gmail</span>
                                          <span>From: {t.sender}</span>
                                        </div>
                                      )}
                                      {t.attachments && t.attachments.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                          <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Attached Materials:</p>
                                          <div className="flex flex-wrap gap-1.5">
                                            {t.attachments.map((file, fIdx) => (
                                              <a
                                                key={fIdx}
                                                href={file.url}
                                                target="_blank"
                                                referrerPolicy="no-referrer"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border-2 border-slate-800 rounded-xl text-[10px] font-black text-slate-700 transition-colors shadow-[1px_1px_0px_0px_#1e293b] active:translate-y-[0.5px]"
                                              >
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                {file.name}
                                              </a>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      {t.dependencies && t.dependencies.length > 0 && (
                                        <div className="flex gap-1.5 items-center mt-2 flex-wrap">
                                          <span className="text-[9px] text-slate-400 font-black uppercase">Prerequisites:</span>
                                          {t.dependencies.map((depId) => {
                                            const depTask = tasks.find((tk) => tk.id === depId);
                                            return (
                                              <span key={depId} className="text-[9px] bg-rose-50 text-rose-700 border-2 border-rose-200 px-1.5 py-0.5 rounded-lg font-bold">
                                                {depTask ? depTask.title.slice(0, 15) : "Prior task"}...
                                              </span>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  </div>
 
                                  <div className="flex items-center gap-3 mt-2.5 md:mt-0 ml-8 md:ml-0 self-end md:self-auto">
                                    <span className={`text-[10px] font-black px-2 py-0.5 border-2 rounded-lg uppercase tracking-wider ${
                                      t.priority === "HIGH" ? "bg-rose-50 text-rose-700 border-rose-300" :
                                      t.priority === "MEDIUM" ? "bg-amber-50 text-amber-700 border-amber-300" :
                                      "bg-sky-50 text-sky-700 border-sky-300"
                                    }`}>
                                      {t.priority}
                                    </span>
 
                                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-bold border-2 border-slate-100 px-2 py-0.5 rounded-lg bg-slate-50">
                                      <Clock className="w-3.5 h-3.5" />
                                      <span>{t.estimatedDuration}h</span>
                                    </div>
 
                                    <button
                                      onClick={() => setTaskToDelete(t.id)}
                                      className="p-1 rounded text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                                      title="Delete task"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                {isOverThis && dropPosition === "after" && (
                                  <div className="h-1.5 bg-indigo-500 rounded-full animate-pulse my-2 relative">
                                    <div className="absolute -left-1 -top-[3px] w-3 h-3 rounded-full bg-indigo-600 border-2 border-white shadow-md" />
                                  </div>
                                )}
                              </React.Fragment>
                            );
                          })
                        ) : (
                          <div className="text-center py-5 text-xs text-slate-400 italic font-semibold border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/40">
                            {priorityFilter !== "ALL" 
                              ? `No ${priorityFilter.toLowerCase()} priority tasks found in this phase.` 
                              : "No active tasks in this phase. Drag task items here to rearrange!"
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white border-4 border-slate-800 rounded-3xl p-8 text-center text-xs text-slate-400 italic font-semibold shadow-[3px_3px_0px_0px_#1e293b]">
                  No phases match the selected milestone filter.
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border-4 border-slate-800 rounded-3xl p-8 text-center text-xs text-slate-400 italic font-semibold shadow-[3px_3px_0px_0px_#1e293b]">
              Your planner has no active project milestones. Enter a custom milestone goal above!
            </div>
          )}
        </div>

        {/* Manual Addition / Form Area */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border-4 border-slate-800 rounded-3xl p-5 shadow-[4px_4px_0px_0px_#1e293b]">
            <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-1.5">
              <Plus className="w-4.5 h-4.5 text-indigo-600" /> Create Task Item
            </h4>

            <form onSubmit={handleAddManualTask} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">Description</label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="e.g., 'Setup GitHub repository'"
                  className="w-full bg-slate-50 border-2 border-slate-300 focus:border-slate-800 rounded-2xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">Priority</label>
                <select
                  value={manualPriority}
                  onChange={(e) => setManualPriority(e.target.value as any)}
                  className="w-full bg-slate-50 border-2 border-slate-300 focus:border-slate-800 rounded-2xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none transition-colors"
                >
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority</option>
                </select>
              </div>

              {milestones.length > 0 && (
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">Target Phase</label>
                  <select
                    value={selectedMilestone}
                    onChange={(e) => setSelectedMilestone(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-300 focus:border-slate-800 rounded-2xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none transition-colors"
                  >
                    <option value="">No Map Phase</option>
                    {milestones.map((m) => (
                      <option key={m.id} value={m.id}>
                        Phase {m.order}: {m.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-black rounded-2xl text-xs border-3 border-slate-800 shadow-[3px_3px_0px_0px_#1e293b] cursor-pointer"
              >
                Add Action Item
              </button>
            </form>
          </div>
        </div>

      </div>

      <ConfirmationDialog
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => {
          if (taskToDelete) {
            onDeleteTask(taskToDelete);
          }
        }}
        title="Delete Action Item?"
        message="Are you sure you want to delete this action item from your roadmap? This action is permanent and cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

    </motion.div>
  );
}
