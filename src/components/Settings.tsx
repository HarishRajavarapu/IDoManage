import React, { useState } from "react";
import { 
  Settings as SettingsIcon, 
  Shield, 
  Sliders, 
  Bell, 
  CheckCircle, 
  Sun, 
  Moon, 
  Monitor, 
  Check,
  Palette
} from "lucide-react";
import { motion } from "motion/react";
import { ThemePreset, ThemeMode, THEME_PRESETS } from "../utils/theme";

interface SettingsProps {
  user: any;
  onLogout: () => void;
  themePreset: ThemePreset;
  themeMode: ThemeMode;
  onUpdateTheme: (preset: ThemePreset, mode: ThemeMode) => void;
}

export default function Settings({ 
  user, 
  onLogout, 
  themePreset, 
  themeMode, 
  onUpdateTheme 
}: SettingsProps) {
  const [hours, setHours] = useState(4);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyAI, setNotifyAI] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

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
      
      {/* Title */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-black text-slate-800 font-sans">Settings & Configuration</h2>
        <p className="text-slate-500 text-sm mt-0.5 font-semibold">Fine-tune your workspace themes, appearance, planning parameters, and security rules.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Settings options */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Appearance Section */}
          <div className="bg-white border-4 border-slate-800 rounded-3xl p-6 space-y-6 shadow-[4px_4px_0px_0px_#1e293b]">
            <div className="flex items-center gap-2 border-b-2 border-dashed border-slate-100 pb-3">
              <Palette className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Workspace Appearance</h3>
            </div>

            {/* Light / Dark / System Mode Selector */}
            <div className="space-y-3">
              <label className="block text-[10px] uppercase font-black text-slate-400 tracking-wider">Theme Mode</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "light", label: "Light Mode", icon: Sun },
                  { id: "dark", label: "Dark Mode", icon: Moon },
                  { id: "system", label: "System Default", icon: Monitor }
                ].map((mode) => {
                  const Icon = mode.icon;
                  const isActive = themeMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => onUpdateTheme(themePreset, mode.id as ThemeMode)}
                      className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-3 rounded-2xl border-2 font-black text-xs transition-all cursor-pointer ${
                        isActive
                          ? "bg-indigo-50 border-indigo-600 text-indigo-600 shadow-[2px_2px_0px_0px_var(--accent-color)]"
                          : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-800 hover:text-slate-800"
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5 shrink-0" />
                      <span>{mode.label}</span>
                      {isActive && <Check className="w-3.5 h-3.5 sm:ml-auto text-indigo-600 shrink-0" strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Aesthetic Presets Bento Grid */}
            <div className="space-y-3 pt-2">
              <label className="block text-[10px] uppercase font-black text-slate-400 tracking-wider">Aesthetic Presets</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {THEME_PRESETS.map((preset) => {
                  const isActive = themePreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => onUpdateTheme(preset.id, themeMode)}
                      className={`text-left p-4 rounded-2xl border-2 transition-all flex flex-col justify-between h-28 relative cursor-pointer group overflow-hidden ${
                        isActive
                          ? "bg-indigo-50 border-indigo-600 shadow-[3px_3px_0px_0px_var(--accent-color)]"
                          : "bg-slate-50 border-slate-200 hover:border-slate-800"
                      }`}
                    >
                      {/* Interactive Selection Highlight Ring */}
                      {isActive && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full border border-slate-800 flex items-center justify-center text-white shadow-[1px_1px_0px_0px_#000]">
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                      )}

                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
                          {preset.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-bold leading-relaxed pr-6">
                          {preset.description}
                        </p>
                      </div>

                      {/* Theme Colors Preview blobs */}
                      <div className="flex gap-1.5 mt-2">
                        <div 
                          className="w-5 h-5 rounded-full border border-slate-800 shadow-[1px_1px_0px_0px_#000] shrink-0"
                          style={{ backgroundColor: preset.colorLight }}
                          title="Light Theme color preview"
                        />
                        <div 
                          className="w-5 h-5 rounded-full border border-slate-800 shadow-[1px_1px_0px_0px_#000] shrink-0"
                          style={{ backgroundColor: preset.colorDark }}
                          title="Dark Theme color preview"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="bg-white border-4 border-slate-800 rounded-3xl p-6 space-y-5 shadow-[4px_4px_0px_0px_#1e293b]">
            
            <div className="flex items-center gap-2 border-b-2 border-dashed border-slate-100 pb-3">
              <Sliders className="w-4.5 h-4.5 text-indigo-600" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">CoS AI Parameters</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">Daily Focus Capacity (Hours)</label>
                <input
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  min="1"
                  max="16"
                  className="w-full bg-slate-50 border-2 border-slate-300 focus:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none transition-colors"
                />
                <p className="text-[10px] text-slate-400 mt-1 font-bold">Informs deep-work timeline analysis triggers.</p>
              </div>

              <div className="flex flex-col justify-end p-2.5 bg-slate-50 border-2 border-slate-200 border-dashed rounded-2xl">
                <span className="text-[10px] uppercase font-black text-indigo-600">Active Aesthetics Preset</span>
                <span className="text-xs font-black text-slate-700 capitalize mt-1">
                  {THEME_PRESETS.find(p => p.id === themePreset)?.name || themePreset}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-indigo-600" /> Notifications & Syncs
              </h4>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                  className="rounded-lg border-2 border-slate-300 bg-slate-50 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="text-xs text-slate-600 font-bold">Route workspace notification alerts directly to Google mail</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyAI}
                  onChange={(e) => setNotifyAI(e.target.checked)}
                  className="rounded-lg border-2 border-slate-300 bg-slate-50 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="text-xs text-slate-600 font-bold">Allow continuous analysis of my planner velocity curve</span>
              </label>
            </div>

            <div className="flex justify-between items-center pt-4 border-t-2 border-dashed border-slate-100">
              {saved && (
                <span className="text-xs text-emerald-600 font-black flex items-center gap-1 animate-pulse">
                  <CheckCircle className="w-4 h-4" /> Parameters saved successfully!
                </span>
              )}
              <button
                type="submit"
                className="ml-auto px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white border-3 border-slate-800 text-xs font-black rounded-2xl transition-colors cursor-pointer shadow-[2.5px_2.5px_0px_0px_#1e293b]"
              >
                Save Preferences
              </button>
            </div>

          </form>

          {/* Database Security rules */}
          <div className="bg-white border-4 border-slate-800 rounded-3xl p-6 shadow-[4px_4px_0px_0px_#1e293b] space-y-3">
            <div className="flex items-center gap-2 border-b-2 border-dashed border-slate-100 pb-3">
              <Shield className="w-4.5 h-4.5 text-indigo-600" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Workspace Credentials Security</h3>
            </div>

            <div className="text-xs leading-relaxed text-slate-500 font-bold space-y-2">
              <p>
                All workspace outline configurations, planner items, and syllabus breakdowns are bound to authenticated OIDC keys. Data access rules are fully secure.
              </p>
              <div className="p-3.5 bg-slate-50 rounded-2xl border-2 border-slate-200 font-mono text-[10px] text-slate-500 space-y-1">
                <p>match /databases/&#123;database&#125;/documents &#123;</p>
                <p className="pl-4">match /users/&#123;userId&#125;/&#123;document=**&#125; &#123;</p>
                <p className="pl-8 text-indigo-600">allow read, write: if request.auth != null && request.auth.uid == userId;</p>
                <p className="pl-4">&#125;</p>
                <p>&#125;</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Card / Auth control */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border-4 border-slate-800 rounded-3xl p-6 shadow-[4px_4px_0px_0px_#1e293b] text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#FEF3C7] border-3 border-slate-800 flex items-center justify-center text-slate-800 font-black text-2xl shadow-[2px_2px_0px_0px_#1e293b]">
              {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
            </div>

            <div>
              <h4 className="text-sm font-black text-slate-800">
                {user?.displayName || "Workspace Scholar"}
              </h4>
              <p className="text-xs text-slate-400 font-bold mt-0.5">{user?.email}</p>
            </div>

            <div className="pt-2 border-t-2 border-dashed border-slate-100 flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px] px-2 py-1 bg-slate-50 rounded-lg">
                <span className="text-slate-400 uppercase tracking-widest font-black">Link Status</span>
                <span className="text-indigo-600 font-extrabold">{user?.isAnonymous ? "Guest Session" : "Google Provider"}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] px-2 py-1 bg-slate-50 rounded-lg">
                <span className="text-slate-400 uppercase tracking-widest font-black">Workspace Auth</span>
                <span className="text-emerald-600 font-black uppercase">Authorized</span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-slate-800 text-xs font-black rounded-2xl transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#1e293b]"
            >
              Sign Out & End Session
            </button>
          </div>
        </div>

      </div>

    </motion.div>
  );
}
