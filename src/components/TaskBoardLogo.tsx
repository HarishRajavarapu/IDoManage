import React from "react";
import { 
  ClipboardCheck, 
  Sparkles, 
  Leaf, 
  Waves, 
  Smartphone, 
  Terminal, 
  Zap, 
  Compass, 
  Bot, 
  Layers, 
  Flame 
} from "lucide-react";
import { ThemePreset } from "../utils/theme";

interface TaskBoardLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  themePreset?: ThemePreset;
  isDark?: boolean;
}

export default function TaskBoardLogo({ 
  size = "md", 
  className = "", 
  themePreset = "standard", 
  isDark = false 
}: TaskBoardLogoProps) {
  const isLg = size === "lg";
  const isSm = size === "sm";

  // Sizes for the logo container
  const containerSize = isLg 
    ? "w-14 h-14" 
    : isSm 
    ? "w-8 h-8" 
    : "w-11 h-11";

  // Sizes for the icon size
  const iconSize = isLg ? 26 : isSm ? 16 : 22;

  // Render different logo styles based on the theme preset
  const renderLogoIcon = () => {
    switch (themePreset) {
      case "brutalist":
        return (
          <div className={`relative ${containerSize} shrink-0 bg-[#FDDE14] border-4 border-slate-900 rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center`}>
            <ClipboardCheck size={iconSize} className="text-slate-900 stroke-[3]" />
          </div>
        );

      case "lavender":
        return (
          <div className={`relative ${containerSize} shrink-0 bg-gradient-to-tr from-purple-400 to-indigo-300 rounded-full flex items-center justify-center shadow-md border border-purple-200/50`}>
            <Sparkles size={iconSize - 2} className="text-white animate-pulse" />
          </div>
        );

      case "forest":
        return (
          <div className={`relative ${containerSize} shrink-0 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-sm border-2 border-emerald-800/20`}>
            <Leaf size={iconSize - 2} className="text-emerald-100" />
          </div>
        );

      case "crimson":
        return (
          <div className={`relative ${containerSize} shrink-0 bg-rose-950 border-2 border-red-500 rounded-lg flex items-center justify-center shadow-lg shadow-red-950/40`}>
            <Flame size={iconSize - 2} className="text-red-500" />
          </div>
        );

      case "ocean":
        return (
          <div className={`relative ${containerSize} shrink-0 bg-cyan-500 rounded-2xl flex items-center justify-center shadow-[0px_4px_10px_rgba(6,182,212,0.3)]`}>
            <Waves size={iconSize - 2} className="text-white" />
          </div>
        );

      case "glassmorphism":
        return (
          <div className={`relative ${containerSize} shrink-0 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center shadow-lg`}>
            <Layers size={iconSize - 2} className="text-indigo-300 animate-pulse" />
          </div>
        );

      case "ios":
        return (
          <div className={`relative ${containerSize} shrink-0 bg-gradient-to-b from-slate-50 to-slate-200 dark:from-neutral-800 dark:to-neutral-900 rounded-[22%] flex items-center justify-center shadow-md border border-black/5 dark:border-white/5`}>
            <Smartphone size={iconSize - 2} className="text-indigo-600 dark:text-indigo-400 stroke-[2.5]" />
          </div>
        );

      case "github":
        return (
          <div className={`relative ${containerSize} shrink-0 bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-center font-mono text-emerald-400`}>
            <Terminal size={iconSize - 4} className="stroke-[2.5]" />
          </div>
        );

      case "rapido":
        return (
          <div className={`relative ${containerSize} shrink-0 bg-[#FDDE14] border-3 border-slate-950 rounded-xl shadow-[2px_2px_0px_0px_#000] flex flex-col items-center justify-center`}>
            <div className="absolute top-0.5 inset-x-0 flex justify-between px-1 text-[5px] font-black leading-none text-slate-950">
              <span>🚖</span><span>🚖</span>
            </div>
            <Zap size={iconSize - 4} className="text-slate-950 stroke-[3.5] mt-1" />
          </div>
        );

      case "ola":
        return (
          <div className={`relative ${containerSize} shrink-0 bg-[#A1D030] border-2 border-slate-900 rounded-full flex items-center justify-center shadow-sm`}>
            <Compass size={iconSize - 2} className="text-slate-950 stroke-[2.5]" />
          </div>
        );

      case "chatgpt":
        return (
          <div className={`relative ${containerSize} shrink-0 bg-[#10A37F] rounded-xl flex items-center justify-center shadow-sm`}>
            <Bot size={iconSize - 2} className="text-white stroke-[2]" />
          </div>
        );

      case "googleaistudio":
        return (
          <div className={`relative ${containerSize} shrink-0 bg-slate-950 border border-blue-500/50 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]`}>
            <div className="absolute inset-0.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 opacity-25 animate-pulse" />
            <Sparkles size={iconSize - 2} className="text-blue-400 relative z-10" />
          </div>
        );

      case "standard":
      default:
        return (
          <div className={`relative ${containerSize} shrink-0 group`}>
            {/* Shadow Layer 1 (Dark Deep Shadow) */}
            <div className="absolute inset-0 bg-slate-800 rounded-2xl translate-x-[4px] translate-y-[4px]" />
            {/* Shadow Layer 2 (Vibrant Accent Glow-shadow) */}
            <div className="absolute inset-0 bg-indigo-700 rounded-2xl translate-x-[2px] translate-y-[2px]" />
            {/* Main Board Body Layer */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-blue-600 to-indigo-700 rounded-2xl border-2.5 border-slate-800 flex flex-col p-1.5 justify-between shadow-[inset_0_3px_5px_rgba(255,255,255,0.3)] overflow-hidden">
              <div className="mx-auto bg-slate-100 border border-slate-800 rounded-md flex items-center justify-center shadow-sm" style={{ height: isSm ? '4px' : '7px', width: isSm ? '14px' : '20px' }}>
                <div className="w-1.5 h-[1.5px] bg-slate-500 rounded-full" />
              </div>
              <div className="flex flex-col gap-1 mt-1 px-0.5">
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-emerald-300 rounded-full shrink-0 animate-pulse" />
                  <div className="h-1 bg-white/40 rounded-full w-4/5" />
                </div>
                <div className="h-1 bg-white/60 rounded-full w-full" />
              </div>
            </div>
          </div>
        );
    }
  };

  // Render specific brand names & fonts depending on the theme preset
  const getBrandDetails = () => {
    switch (themePreset) {
      case "brutalist":
        return {
          title: (
            <h1 className={`${isLg ? 'text-2xl' : isSm ? 'text-sm' : 'text-lg'} font-black uppercase text-slate-900 tracking-tighter`} style={{ textShadow: "2px 2px 0px #FDDE14, 4px 4px 0px #000" }}>
              IDO<span className="bg-slate-900 text-[#FDDE14] px-1 ml-0.5">MANAGE</span>
            </h1>
          ),
          subtitle: "RAW BRUTALIST SPACE"
        };

      case "lavender":
        return {
          title: (
            <h1 className={`${isLg ? 'text-2xl' : isSm ? 'text-sm' : 'text-lg'} font-semibold tracking-wide text-indigo-900 dark:text-indigo-100 italic`}>
              IDo<span className="text-purple-600 font-extrabold not-italic">Manage</span>
            </h1>
          ),
          subtitle: "CALM MIND COMPASS"
        };

      case "forest":
        return {
          title: (
            <h1 className={`${isLg ? 'text-2xl' : isSm ? 'text-sm' : 'text-lg'} font-bold tracking-tight text-emerald-800 dark:text-emerald-300`}>
              IDo<span className="text-emerald-500 font-light">Manage</span>
            </h1>
          ),
          subtitle: "MINT ORGANIC ORGANIZER"
        };

      case "crimson":
        return {
          title: (
            <h1 className={`${isLg ? 'text-2xl' : isSm ? 'text-sm' : 'text-lg'} font-serif tracking-widest text-red-700 dark:text-red-400 uppercase`}>
              IDo<span className="text-slate-800 dark:text-slate-100 font-black">Manage</span>
            </h1>
          ),
          subtitle: "RAW INDUSTRIAL CONSOLE"
        };

      case "ocean":
        return {
          title: (
            <h1 className={`${isLg ? 'text-2xl' : isSm ? 'text-sm' : 'text-lg'} font-bold tracking-widest text-cyan-700 dark:text-cyan-300 uppercase`}>
              IDo<span className="text-blue-500 font-black">Manage</span>
            </h1>
          ),
          subtitle: "FRESH PRODUCTIVE WATERS"
        };

      case "glassmorphism":
        return {
          title: (
            <h1 className={`${isLg ? 'text-2xl' : isSm ? 'text-sm' : 'text-lg'} font-black tracking-tight text-violet-950 dark:text-white`}>
              IDo<span className="text-indigo-400 font-extrabold bg-indigo-500/10 px-1.5 py-0.5 rounded-lg border border-indigo-400/20 backdrop-blur-sm">Manage</span>
            </h1>
          ),
          subtitle: "FROSTED TRANSPARENT GRID"
        };

      case "ios":
        return {
          title: (
            <h1 className={`${isLg ? 'text-2xl' : isSm ? 'text-sm' : 'text-lg'} font-bold tracking-tight text-slate-900 dark:text-white`}>
              IDo<span className="text-indigo-600 font-black">Manage</span>
            </h1>
          ),
          subtitle: "APPLE FLUID DESIGN"
        };

      case "github":
        return {
          title: (
            <h1 className={`${isLg ? 'text-xl' : isSm ? 'text-xs' : 'text-sm'} font-mono tracking-tight text-slate-800 dark:text-slate-200`}>
              $ <span className="text-emerald-500 font-bold">ido</span>manage
            </h1>
          ),
          subtitle: "COMMIT COMPLETED TASKS"
        };

      case "rapido":
        return {
          title: (
            <h1 className={`${isLg ? 'text-2xl' : isSm ? 'text-sm' : 'text-lg'} font-extrabold italic uppercase tracking-tighter text-slate-950 dark:text-[#FDDE14] bg-[#FDDE14] dark:bg-transparent px-1 border-2 border-slate-950 dark:border-transparent rounded-sm`}>
              IDo<span className="text-slate-700 dark:text-white font-black">Manage</span>
            </h1>
          ),
          subtitle: "SPEEDY ON-TIME WORK"
        };

      case "ola":
        return {
          title: (
            <h1 className={`${isLg ? 'text-2xl' : isSm ? 'text-sm' : 'text-lg'} font-black tracking-tight text-slate-900 dark:text-[#A1D030]`}>
              IDo<span className="text-[#A1D030] dark:text-white font-bold ml-0.5">Manage</span>
            </h1>
          ),
          subtitle: "NEON GREEN RIDE TRACKER"
        };

      case "chatgpt":
        return {
          title: (
            <h1 className={`${isLg ? 'text-2xl' : isSm ? 'text-sm' : 'text-lg'} font-bold tracking-tight text-slate-800 dark:text-white`}>
              IDo<span className="text-[#10A37F] font-black bg-[#10A37F]/10 dark:bg-transparent px-1 rounded-md">Manage</span>
            </h1>
          ),
          subtitle: "INTELLIGENT SYSTEM"
        };

      case "googleaistudio":
        return {
          title: (
            <h1 className={`${isLg ? 'text-2xl' : isSm ? 'text-sm' : 'text-lg'} font-black tracking-wider text-slate-900 dark:text-white uppercase`}>
              IDo<span className="text-blue-500 font-black dark:text-blue-400">Manage</span>
            </h1>
          ),
          subtitle: "GOOGLE DEVELOPER LAB"
        };

      case "standard":
      default:
        const text3DStyle = isLg
          ? { textShadow: "1px 1px 0px #A5B4FC, 2px 2px 0px #6366F1, 3.5px 3.5px 0px #1E293B" }
          : isSm
          ? { textShadow: "0.5px 0.5px 0px #A5B4FC, 1px 1px 0px #6366F1, 2px 2px 0px #1E293B" }
          : { textShadow: "1px 1px 0px #A5B4FC, 1.8px 1.8px 0px #6366F1, 3px 3px 0px #1E293B" };
        return {
          title: (
            <h1 
              className={`${isLg ? 'text-3xl' : isSm ? 'text-base' : 'text-xl'} font-black uppercase font-sans text-slate-800 tracking-wider select-none leading-none`}
              style={isDark ? {} : text3DStyle}
            >
              IDo<span className="text-indigo-600">Manage</span>
            </h1>
          ),
          subtitle: "Unified Productivity Suite"
        };
    }
  };

  const { title, subtitle } = getBrandDetails();

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {renderLogoIcon()}
      <div className="flex flex-col justify-center leading-none whitespace-nowrap">
        <div className="flex items-center">
          {title}
        </div>
        {isLg && (
          <span className="text-[8px] uppercase tracking-widest font-black text-slate-400 mt-1 pl-0.5">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
