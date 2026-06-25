import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { TrendingUp, BarChart2, Activity, Percent, Zap, CheckSquare } from "lucide-react";
import { Task } from "../types";
import { motion } from "motion/react";

interface AnalyticsProps {
  tasks: Task[];
}

export default function Analytics({ tasks }: AnalyticsProps) {
  // Compute real metrics from active tasks
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Calculate mock/adaptive productivity analytics based on task counts
  const highPriorityCompleted = tasks.filter((t) => t.priority === "HIGH" && t.completed).length;
  const highPriorityTotal = tasks.filter((t) => t.priority === "HIGH").length;
  
  const productivityScore = totalTasks > 0 
    ? Math.min(100, Math.round((completedTasks / totalTasks) * 75 + (highPriorityCompleted / (highPriorityTotal || 1)) * 25))
    : 45;

  const focusScore = totalTasks > 0 
    ? Math.min(100, 65 + completedTasks * 4) 
    : 72;

  const deadlineSuccessRate = totalTasks > 0 
    ? Math.min(100, 80 + (completedTasks * 2))
    : 85;

  // Weekly mockup trend charts
  const weeklyTrendData = [
    { name: "Mon", completed: 3, target: 5, productivity: 68 },
    { name: "Tue", completed: 4, target: 6, productivity: 75 },
    { name: "Wed", completed: 5, target: 5, productivity: 84 },
    { name: "Thu", completed: 2, target: 4, productivity: 62 },
    { name: "Fri", completed: 6, target: 7, productivity: 92 },
    { name: "Sat", completed: 1, target: 3, productivity: 78 },
    { name: "Sun", completed: 3, target: 4, productivity: 81 }
  ];

  // Adjust recent completed value if there are real completions in state
  if (completedTasks > 0) {
    weeklyTrendData[4].completed = Math.min(7, completedTasks);
  }

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
      
      {/* Top Welcome Title */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-black text-slate-800">Performance & Analytics Command</h2>
        <p className="text-slate-500 text-sm mt-0.5 font-semibold">Real-time performance audits, focus scores, and milestone success metrics.</p>
      </motion.div>

      {/* Numerical Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Completion Rate */}
        <motion.div 
          variants={itemVariants}
          className="bg-white border-4 border-slate-800 rounded-3xl p-5 shadow-[4px_4px_0px_0px_#1e293b] flex items-center gap-4 hover:translate-x-[0.5px] hover:translate-y-[0.5px] transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border-2 border-slate-800 flex items-center justify-center text-indigo-600 shadow-[1px_1px_0px_0px_#1e293b]">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-tight">COMPLETION RATE</span>
            <span className="text-2xl font-black text-slate-800 leading-tight">{completionRate}%</span>
          </div>
        </motion.div>

        {/* Productivity Index */}
        <motion.div 
          variants={itemVariants}
          className="bg-white border-4 border-slate-800 rounded-3xl p-5 shadow-[4px_4px_0px_0px_#1e293b] flex items-center gap-4 hover:translate-x-[0.5px] hover:translate-y-[0.5px] transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border-2 border-slate-800 flex items-center justify-center text-amber-600 shadow-[1px_1px_0px_0px_#1e293b]">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-tight">PRODUCTIVITY INDEX</span>
            <span className="text-2xl font-black text-slate-800 leading-tight">{productivityScore}</span>
          </div>
        </motion.div>

        {/* Focus Score */}
        <motion.div 
          variants={itemVariants}
          className="bg-white border-4 border-slate-800 rounded-3xl p-5 shadow-[4px_4px_0px_0px_#1e293b] flex items-center gap-4 hover:translate-x-[0.5px] hover:translate-y-[0.5px] transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border-2 border-slate-800 flex items-center justify-center text-emerald-600 shadow-[1px_1px_0px_0px_#1e293b]">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-tight">FOCUS SCORE</span>
            <span className="text-2xl font-black text-slate-800 leading-tight">{focusScore}%</span>
          </div>
        </motion.div>

        {/* Deadline Success Rate */}
        <motion.div 
          variants={itemVariants}
          className="bg-white border-4 border-slate-800 rounded-3xl p-5 shadow-[4px_4px_0px_0px_#1e293b] flex items-center gap-4 hover:translate-x-[0.5px] hover:translate-y-[0.5px] transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border-2 border-slate-800 flex items-center justify-center text-sky-600 shadow-[1px_1px_0px_0px_#1e293b]">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-tight">DEADLINE STREAK</span>
            <span className="text-2xl font-black text-slate-800 leading-tight">{deadlineSuccessRate}%</span>
          </div>
        </motion.div>

      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* bar chart for daily completions */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-8 bg-white border-4 border-slate-800 rounded-3xl p-6 shadow-[5px_5px_0px_0px_#1e293b]"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 className="w-4.5 h-4.5 text-indigo-600" /> Weekly Target Success
            </h3>
            <span className="text-xs text-slate-400 font-bold">Current Cycle</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#ffffff", borderColor: "#1e293b", borderWidth: "2px", borderRadius: "12px" }}
                  labelStyle={{ color: "#1e293b", fontSize: 12, fontWeight: "900" }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10, fontWeight: "700" }} />
                <Bar dataKey="completed" name="Completed Tasks" fill="#6366f1" radius={[4, 4, 0, 0]} stroke="#1e293b" strokeWidth={1.5} />
                <Bar dataKey="target" name="Target Outline" fill="#e0e7ff" radius={[4, 4, 0, 0]} stroke="#1e293b" strokeWidth={1.5} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* area chart for productivity trend */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-4 bg-white border-4 border-slate-800 rounded-3xl p-6 shadow-[5px_5px_0px_0px_#1e293b] flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4.5 h-4.5 text-indigo-600" /> Velocity Curve
              </h3>
              <span className="text-xs text-slate-400 font-bold">Flow Curve</span>
            </div>

            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyTrendData}>
                  <defs>
                    <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#ffffff", borderColor: "#1e293b", borderWidth: "2px", borderRadius: "12px" }}
                    labelStyle={{ color: "#1e293b", fontSize: 11, fontWeight: "700" }}
                  />
                  <Area type="monotone" dataKey="productivity" name="Score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorProd)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-1 mt-4">
            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black">AI Chief of Staff Insights</span>
            <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
              Your workflow indicators indicate peak output occurs mid-week. Consider allocating complex, deep-thinking objectives for Wednesday mornings.
            </p>
          </div>
        </motion.div>

      </div>

    </motion.div>
  );
}
