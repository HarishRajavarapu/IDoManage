import React, { useState } from "react";
import { History, Search, Mail, Eye, Calendar, PlusCircle, CheckSquare, ShieldAlert } from "lucide-react";
import { ReadHistoryItem } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface HistoryLogProps {
  history: ReadHistoryItem[];
}

export default function HistoryLog({ history = [] }: HistoryLogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<ReadHistoryItem | null>(null);

  const filteredHistory = history.filter(item => {
    return item.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
           item.sender.toLowerCase().includes(searchQuery.toLowerCase()) || 
           item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
           item.source.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="bg-white p-6 rounded-3xl border-4 border-slate-800 shadow-[4px_4px_0px_0px_#1e293b]">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-black uppercase rounded-full border-2 border-indigo-600 shadow-[1px_1px_0px_0px_#1e293b] mb-2.5">
          <History className="w-3.5 h-3.5" /> Workspace Audit
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-none">
          Gmail & Resource History Log
        </h2>
        <p className="text-slate-500 text-xs font-semibold mt-2 leading-relaxed">
          The Workspace Audit maintains an chronological record of every email digested, co-founder sync, course update parsed, and autonomous tasks added to your schedule.
        </p>
      </div>

      {/* Filters and search bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit log history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border-3 border-slate-800 rounded-2xl text-xs font-bold shadow-[2px_2px_0px_0px_#1e293b] focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left side list */}
        <div className="lg:col-span-7 space-y-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    layout
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelectedItem(item)}
                    className={`p-4 bg-white rounded-3xl border-4 border-slate-800 shadow-[3px_3px_0px_0px_#1e293b] cursor-pointer transition-all ${
                      selectedItem?.id === item.id ? "ring-4 ring-indigo-500/30 bg-slate-50" : ""
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold rounded-md uppercase tracking-wide">
                        {item.source}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400">
                        {new Date(item.readAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>

                    <h3 className="text-xs font-black text-slate-800 truncate pr-4">
                      {item.subject}
                    </h3>

                    <p className="text-[10px] text-slate-500 font-bold mb-2 truncate">
                      From: {item.sender}
                    </p>

                    <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50/60 p-2.5 rounded-xl border border-slate-100 italic">
                      "{item.summary}"
                    </p>

                    {item.tasksCreated && item.tasksCreated.length > 0 && (
                      <div className="mt-2.5 flex items-center gap-1">
                        <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="text-[9px] font-mono text-indigo-600 font-black uppercase">
                          {item.tasksCreated.length} {item.tasksCreated.length === 1 ? "Task" : "Tasks"} Synthesized
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="py-16 bg-white border-4 border-dashed border-slate-300 rounded-3xl text-center">
                  <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-500 font-bold text-sm">No workspace history found.</p>
                  <p className="text-slate-400 text-xs font-semibold mt-1">Connect with Google Account and use AI to parse task sources.</p>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Right side detail card */}
        <div className="lg:col-span-5 lg:sticky lg:top-6">
          <AnimatePresence mode="wait">
            {selectedItem ? (
              <motion.div
                key={selectedItem.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white p-6 rounded-3xl border-4 border-slate-800 shadow-[5px_5px_0px_0px_#1e293b] space-y-4"
              >
                <div className="flex justify-between items-center border-b-2 border-slate-100 pb-3">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    SOURCE FILE / EMAIL AUDIT
                  </h4>
                  <span className="text-[9px] font-mono font-black text-indigo-600">
                    ID: {selectedItem.id.substring(0, 8)}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-800 leading-snug">
                    {selectedItem.subject}
                  </h3>
                  <p className="text-xs text-slate-500 font-extrabold flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> {selectedItem.sender}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold">
                    Captured: {new Date(selectedItem.readAt).toLocaleString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric"
                    })}
                  </p>
                </div>

                <div className="space-y-2 bg-indigo-50/50 border-2 border-indigo-100 p-4 rounded-2xl">
                  <span className="text-[9px] font-black uppercase text-indigo-600 tracking-widest block mb-1">
                    AI SUMMARY
                  </span>
                  <p className="text-xs font-bold text-slate-700 leading-relaxed italic">
                    "{selectedItem.summary}"
                  </p>
                </div>

                {selectedItem.tasksCreated && selectedItem.tasksCreated.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">
                      SYNTHESIZED TASKS
                    </span>
                    <div className="space-y-1.5">
                      {selectedItem.tasksCreated.map((taskName, idx) => (
                        <div key={idx} className="flex gap-2 items-center bg-slate-50 border-2 border-slate-200 p-2.5 rounded-xl">
                          <PlusCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="text-xs font-black text-slate-700 truncate">
                            {taskName}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="bg-slate-50 border-4 border-dashed border-slate-300 rounded-3xl p-8 text-center text-slate-400">
                <Eye className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold uppercase tracking-wider">Select a history item</p>
                <p className="text-[10px] font-semibold mt-0.5">Click any entry on the left to read full audit details.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
