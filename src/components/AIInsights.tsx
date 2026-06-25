import React, { useState } from "react";
import { Sparkles, Search, Lightbulb, TrendingUp, BookOpen, Mail, ShieldAlert } from "lucide-react";
import { AIInsight } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface AIInsightsProps {
  insights: AIInsight[];
}

export default function AIInsights({ insights = [] }: AIInsightsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "productivity" | "schedule" | "academic" | "email">("all");

  const filteredInsights = insights.filter(insight => {
    const matchesSearch = insight.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          insight.from.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "all" || insight.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "productivity":
        return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      case "schedule":
        return <Lightbulb className="w-5 h-5 text-indigo-500" />;
      case "academic":
        return <BookOpen className="w-5 h-5 text-amber-500" />;
      case "email":
        return <Mail className="w-5 h-5 text-rose-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-indigo-500" />;
    }
  };

  const getInsightBadgeStyle = (type: string) => {
    switch (type) {
      case "productivity":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "schedule":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "academic":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "email":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

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
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-black uppercase rounded-full border-2 border-amber-600 shadow-[1px_1px_0px_0px_#1e293b] mb-2.5">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Brain Hub
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-none">
          AI-Powered Work & Study Insights
        </h2>
        <p className="text-slate-500 text-xs font-semibold mt-2 leading-relaxed">
          The Chief of Staff actively scans your synchronized Google Accounts, Gmail threads, calendar deadlines, and daily progress to generate specialized advice.
        </p>
      </div>

      {/* Filters and search bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search AI insights..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border-3 border-slate-800 rounded-2xl text-xs font-bold shadow-[2px_2px_0px_0px_#1e293b] focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(["all", "productivity", "schedule", "academic", "email"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3.5 py-1.5 rounded-xl border-2 text-xs font-black uppercase tracking-wider cursor-pointer shadow-[1.5px_1.5px_0px_0px_#1e293b] transition-all hover:scale-102 active:scale-98 ${
                activeFilter === filter
                  ? "bg-slate-800 border-slate-800 text-white"
                  : "bg-white border-slate-800 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Grid containing insights */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredInsights.length > 0 ? (
            filteredInsights.map((insight) => (
              <motion.div
                key={insight.id}
                variants={itemVariants}
                layout
                className="bg-white p-5 rounded-3xl border-4 border-slate-800 shadow-[4px_4px_0px_0px_#1e293b] flex flex-col justify-between hover:translate-y-[-2px] transition-transform"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wide rounded-lg border-2 ${getInsightBadgeStyle(insight.type)}`}>
                      {insight.type}
                    </span>
                    <span className="text-[9px] font-mono font-black text-slate-400 uppercase">
                      via {insight.from}
                    </span>
                  </div>

                  <div className="flex gap-3 items-start pt-1">
                    <div className="p-2.5 bg-slate-50 border-2 border-slate-800 rounded-xl shadow-[1px_1px_0px_0px_#1e293b] shrink-0">
                      {getInsightIcon(insight.type)}
                    </div>
                    <p className="text-sm font-bold text-slate-800 leading-relaxed pt-0.5">
                      "{insight.text}"
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t-2 border-dashed border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <span>Generated recently</span>
                  <span>System Verified</span>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              variants={itemVariants}
              className="col-span-full py-16 bg-white border-4 border-dashed border-slate-300 rounded-3xl text-center"
            >
              <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-500 font-bold text-sm">No insights found matching your search or filters.</p>
              <p className="text-slate-400 text-xs font-semibold mt-1">Connect your Gmail or Ask your AI assistant to run inbox synthesis.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
