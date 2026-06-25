import React, { useState } from "react";
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  ArrowUpRight, 
  HelpCircle,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Task } from "../types";

interface GoogleCalendarProps {
  googleAccessToken: string | null;
  onGoogleLogin: () => Promise<void>;
  tasks: Task[];
  onSyncCalendar: () => Promise<void>;
}

export default function GoogleCalendar({ 
  googleAccessToken, 
  onGoogleLogin, 
  tasks,
  onSyncCalendar 
}: GoogleCalendarProps) {
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);
  const [calendarSuccess, setCalendarSuccess] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);

  const handleSyncCalendarClick = async () => {
    setIsSyncingCalendar(true);
    setCalendarSuccess(false);
    setCalendarError(null);
    try {
      await onSyncCalendar();
      setCalendarSuccess(true);
      setTimeout(() => setCalendarSuccess(false), 4000);
    } catch (err: any) {
      console.error(err);
      setCalendarError("Could not sync with Google Calendar. Ensure scopes are allowed.");
    } finally {
      setIsSyncingCalendar(false);
    }
  };

  const highPriorityTasks = tasks.filter(t => !t.completed && t.priority === "HIGH");

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border-4 border-slate-800 shadow-[4px_4px_0px_0px_#1e293b] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-700 text-xs font-black uppercase rounded-full border-2 border-sky-500 shadow-[1px_1px_0px_0px_#1e293b] mb-2">
            Google Calendar Scheduler
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">AI Time-Block Scheduler</h2>
          <p className="text-slate-500 text-xs mt-1.5 font-bold leading-relaxed">
            Instantly turns your high-priority study subjects or critical workspace roadmap tasks into dedicated Deep Work blocks on your real Google Calendar.
          </p>
        </div>

        <div>
          {googleAccessToken ? (
            <div className="flex items-center gap-2 bg-emerald-50 border-2 border-slate-800 px-3.5 py-1.5 rounded-2xl shadow-[1.5px_1.5px_0px_0px_#1e293b]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-800 animate-ping" />
              <span className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wider">Calendar Synced</span>
            </div>
          ) : (
            <button
              onClick={onGoogleLogin}
              className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-black rounded-2xl border-3 border-slate-800 shadow-[2.5px_2.5px_0px_0px_#1e293b] active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
            >
              Connect Calendar 📅
            </button>
          )}
        </div>
      </div>

      {/* Onboarding block if not logged in */}
      {!googleAccessToken && (
        <div className="bg-[#FAF6EE] border-4 border-slate-800 rounded-3xl p-6 shadow-[5px_5px_0px_0px_#1e293b] space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 border-2 border-slate-800 flex items-center justify-center font-bold text-lg">📅</div>
            <div>
              <h3 className="text-base font-black text-slate-800">Learn to Schedule Focus Blocks!</h3>
              <p className="text-xs text-slate-500 font-bold">Why align your calendar? Even kids can do it easily!</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="bg-white p-4 rounded-2xl border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1e293b] space-y-2">
              <span className="w-8 h-8 rounded-full bg-sky-100 border-2 border-slate-800 flex items-center justify-center font-black text-sm text-sky-600">1</span>
              <h4 className="text-xs font-black text-slate-800 uppercase">Set Priority to HIGH</h4>
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                Give your most important task or exam goal a "HIGH" priority rating in the Task Manager tab.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1e293b] space-y-2">
              <span className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-slate-800 flex items-center justify-center font-black text-sm text-indigo-600">2</span>
              <h4 className="text-xs font-black text-slate-800 uppercase">Sync One-Click</h4>
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                Connect your Google Calendar and click the Sync button to schedule your homework sessions.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1e293b] space-y-2">
              <span className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-slate-800 flex items-center justify-center font-black text-sm text-emerald-600">3</span>
              <h4 className="text-xs font-black text-slate-800 uppercase">Time Block Aligned</h4>
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                Check your actual phone or computer Google Calendar! You will see 1-hour "Deep Work" slots reserved for your tasks automatically.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Sync Controls Panel */}
        <div className="bg-white border-4 border-slate-800 rounded-3xl p-6 shadow-[5px_5px_0px_0px_#1e293b] space-y-4">
          <div className="flex justify-between items-center border-b-2 border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-800 uppercase">Trigger Active Sync</h3>
          </div>

          <p className="text-xs text-slate-500 font-bold leading-relaxed">
            Clicking the Sync button reads all pending HIGH priority tasks and schedules dedicated, distraction-free study blocks for them on your primary Google Calendar.
          </p>

          <div className="p-4 bg-slate-50 border-2 border-slate-800 rounded-2xl space-y-2.5">
            <p className="font-black text-[10px] text-slate-400 uppercase tracking-widest">FOCUS BLOCKING PREVIEW</p>
            <ul className="space-y-1.5 text-xs text-slate-600 font-semibold font-mono">
              <li className="flex items-center gap-2"><ArrowUpRight className="w-4 h-4 text-sky-500" /> High-Priority Exam Prep Blocks</li>
              <li className="flex items-center gap-2"><ArrowUpRight className="w-4 h-4 text-sky-500" /> Milestone Project Outline Blocks</li>
              <li className="flex items-center gap-2"><ArrowUpRight className="w-4 h-4 text-sky-500" /> Problem Decomposing Focus Slots</li>
            </ul>
          </div>

          {calendarError && (
            <div className="p-3 bg-rose-50 border-2 border-rose-200 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{calendarError}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleSyncCalendarClick}
              disabled={isSyncingCalendar || !googleAccessToken}
              className={`w-full py-3 border-3 border-slate-800 text-xs font-black rounded-2xl transition-all cursor-pointer shadow-[3px_3px_0px_0px_#000] flex items-center justify-center gap-2 uppercase tracking-wider ${
                googleAccessToken
                  ? "bg-sky-500 hover:bg-sky-600 text-white active:scale-95"
                  : "bg-slate-100 text-slate-400 border-slate-300 cursor-not-allowed shadow-none"
              }`}
            >
              {isSyncingCalendar ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" /> Syncing calendar...
                </>
              ) : calendarSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Focus Blocks Synchronized!
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" /> Schedule Focus Blocks Now
                </>
              )}
            </button>
            {!googleAccessToken && (
              <p className="text-center text-[10px] text-slate-400 font-extrabold uppercase mt-2.5 tracking-wider">
                ⚠️ Connect Google Account above to activate scheduling button.
              </p>
            )}
          </div>
        </div>

        {/* Target Tasks Queue */}
        <div className="bg-white border-4 border-slate-800 rounded-3xl p-6 shadow-[5px_5px_0px_0px_#1e293b] space-y-4">
          <div className="flex justify-between items-center border-b-2 border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-800 uppercase flex items-center gap-1.5">
              <span>⚠️ Target HIGH Priority Queue</span>
              <span className="text-[10px] bg-rose-50 border border-rose-200 text-rose-700 px-1.5 py-0.5 rounded-md">
                {highPriorityTasks.length}
              </span>
            </h3>
          </div>

          {highPriorityTasks.length > 0 ? (
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
              {highPriorityTasks.map((t) => (
                <div 
                  key={t.id}
                  className="p-3 bg-slate-50 border-2 border-slate-800 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-slate-800 truncate">{t.title}</h4>
                    <p className="text-[10px] text-slate-400 font-bold truncate">{t.description || "No description provided."}</p>
                  </div>
                  <span className="text-[9px] bg-indigo-50 text-indigo-700 border-2 border-indigo-400 font-black px-2 py-0.5 rounded-md shrink-0 uppercase">
                    TO BLOCK
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400 italic bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl font-semibold flex flex-col items-center justify-center gap-2">
              <p>No high-priority tasks in your roadmap!</p>
              <p className="text-[10px] text-slate-400 font-normal px-4">
                Go to the Task Manager and change a task's priority to "HIGH" so it gets aligned onto your Calendar.
              </p>
            </div>
          )}

          <div className="p-3.5 bg-emerald-50 border-2 border-emerald-400 text-emerald-800 text-[11px] rounded-2xl flex items-start gap-2 font-bold leading-normal">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold uppercase text-[9px] tracking-wider block mb-0.5 text-emerald-950">Safe & Secure Sync</span>
              We only create deep-work slots and never delete or modify any of your existing personal calendar meetings.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
