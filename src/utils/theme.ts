export type ThemeMode = "light" | "dark" | "system";

export type ThemePreset = 
  | "standard"   // Playful Doodle
  | "brutalist"  // Neo-Brutalist
  | "cyberpunk"  // Cyberpunk Neon
  | "lavender"   // Calm Lavender
  | "forest"     // Forest Mint
  | "crimson"    // Crimson Rust
  | "ocean"      // Ocean Breeze
  | "glassmorphism" // Frosted Glass UI
  | "ios"        // iOS Style UI
  | "github"     // GitHub Dev Style
  | "rapido"     // Yellow-Taxi
  | "ola"        // Lime-Charcoal
  | "chatgpt"    // ChatGPT Dark
  | "googleaistudio"; // Google AI Studio Dark Glow

export interface ThemeConfig {
  id: ThemePreset;
  name: string;
  description: string;
  colorLight: string; // Preview color for light
  colorDark: string;  // Preview color for dark
}

export const THEME_PRESETS: ThemeConfig[] = [
  {
    id: "standard",
    name: "Playful Doodle (Standard)",
    description: "Our signature organic hand-drawn design with playful outlines.",
    colorLight: "#faf6ee",
    colorDark: "#121214"
  },
  {
    id: "glassmorphism",
    name: "Frosted Glass UI",
    description: "Vibrant gradient backdrops with sleek frosted glass cards.",
    colorLight: "#faf5ff",
    colorDark: "#030712"
  },
  {
    id: "ios",
    name: "iOS Style UI",
    description: "Apple-inspired fluid layouts with elegant light grids and soft shadows.",
    colorLight: "#F2F2F7",
    colorDark: "#000000"
  },
  {
    id: "github",
    name: "GitHub Dev Style",
    description: "Monospace elements, clean card lists, and octocat slate greys.",
    colorLight: "#F6F8FA",
    colorDark: "#0D1117"
  },
  {
    id: "rapido",
    name: "Yellow-Taxi",
    description: "Energetic bright yellows, stark dark details, and heavy action buttons.",
    colorLight: "#FDDE14",
    colorDark: "#0F0F11"
  },
  {
    id: "ola",
    name: "Lime-Charcoal",
    description: "Vibrant neon lime-greens combined with clean modern layouts.",
    colorLight: "#F5F6F3",
    colorDark: "#111215"
  },
  {
    id: "chatgpt",
    name: "ChatGPT Minimal",
    description: "Clean conversational cards, charcoal layers, and emerald buttons.",
    colorLight: "#F7F7F8",
    colorDark: "#202123"
  },
  {
    id: "googleaistudio",
    name: "Google AI Studio",
    description: "Dark space-blue theme with glowing borders and developer-first console layout.",
    colorLight: "#F8F9FA",
    colorDark: "#08090C"
  },
  {
    id: "brutalist",
    name: "Neo-Brutalist",
    description: "High-contrast block styling with stark thick borders and loud yellows.",
    colorLight: "#FFFBEB",
    colorDark: "#0B0F19"
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk Neon",
    description: "Energetic digital grids with glowing pink outlines and cyber-cyan text.",
    colorLight: "#F1F5F9",
    colorDark: "#0A0B10"
  },
  {
    id: "lavender",
    name: "Calm Lavender",
    description: "Dreamy serene purple pastels to lower your heartbeat.",
    colorLight: "#FAF5FF",
    colorDark: "#120E2E"
  },
  {
    id: "forest",
    name: "Forest Mint",
    description: "Organic sage greens and cozy sand backgrounds.",
    colorLight: "#F0FDF4",
    colorDark: "#04231C"
  },
  {
    id: "crimson",
    name: "Crimson Rust",
    description: "Terracotta warmth and deep rich coral reds for scholars.",
    colorLight: "#FFF5F5",
    colorDark: "#280509"
  },
  {
    id: "ocean",
    name: "Ocean Breeze",
    description: "Crisp turquoise waters and refreshing cool blue waves.",
    colorLight: "#F0F9FF",
    colorDark: "#041D2D"
  }
];

export function generateThemeStyles(preset: ThemePreset, isDark: boolean): string {
  // Styles definitions
  let primaryBg = "#FAF6EE";
  let secondaryBg = "#FFFFFF";
  let subBg = "#F8FAF6";
  let textPrimary = "#1E293B";
  let textSecondary = "#475569";
  let textMuted = "#94A3B8";
  let borderCol = "#1E293B";
  let accentCol = "#6366F1";
  let accentHover = "#4F46E5";
  let borderWidthHeavy = "4px";
  let borderWidthMedium = "3px";
  let borderWidthLight = "2px";
  let shadowHeavy = "5px 5px 0px 0px #1E293B";
  let shadowMedium = "4px 4px 0px 0px #1E293B";
  let shadowLight = "2px 2px 0px 0px #1E293B";
  let gridBg = "radial-gradient(#1E293B12 1px, transparent 1px), radial-gradient(#1E293B12 1px, #FAF6EE 1px); background-size: 20px 20px; background-position: 0 0, 10px 10px;";

  switch (preset) {
    case "standard":
      if (isDark) {
        primaryBg = "#121214";
        secondaryBg = "#1A1A1E";
        subBg = "#25252A";
        textPrimary = "#F8FAF4";
        textSecondary = "#CBD5E1";
        textMuted = "#64748B";
        borderCol = "#F8FAF4";
        accentCol = "#818CF8";
        accentHover = "#6366F1";
        shadowHeavy = "5px 5px 0px 0px #F8FAF4";
        shadowMedium = "4px 4px 0px 0px #F8FAF4";
        shadowLight = "2px 2px 0px 0px #F8FAF4";
        gridBg = "radial-gradient(#FFFFFF0C 1px, transparent 1px), radial-gradient(#FFFFFF0C 1px, #121214 1px); background-size: 20px 20px; background-position: 0 0, 10px 10px;";
      }
      break;

    case "brutalist":
      if (!isDark) {
        primaryBg = "#FFFBEB";
        secondaryBg = "#FFFFFF";
        subBg = "#FEF3C7";
        textPrimary = "#000000";
        textSecondary = "#1F2937";
        textMuted = "#4B5563";
        borderCol = "#000000";
        accentCol = "#F59E0B";
        accentHover = "#D97706";
        borderWidthHeavy = "4px";
        borderWidthMedium = "3px";
        borderWidthLight = "2px";
        shadowHeavy = "6px 6px 0px 0px #000000";
        shadowMedium = "4px 4px 0px 0px #000000";
        shadowLight = "2px 2px 0px 0px #000000";
        gridBg = "linear-gradient(#00000008 1px, transparent 1px), linear-gradient(90deg, #00000008 1px, transparent 1px); background-size: 24px 24px;";
      } else {
        primaryBg = "#0B0F19";
        secondaryBg = "#151D30";
        subBg = "#1E293B";
        textPrimary = "#FFFFFF";
        textSecondary = "#E2E8F0";
        textMuted = "#94A3B8";
        borderCol = "#FFFFFF";
        accentCol = "#FBBF24";
        accentHover = "#F59E0B";
        borderWidthHeavy = "4px";
        borderWidthMedium = "3px";
        borderWidthLight = "2px";
        shadowHeavy = "6px 6px 0px 0px #FFFFFF";
        shadowMedium = "4px 4px 0px 0px #FFFFFF";
        shadowLight = "2px 2px 0px 0px #FFFFFF";
        gridBg = "linear-gradient(#FFFFFF05 1px, transparent 1px), linear-gradient(90deg, #FFFFFF05 1px, transparent 1px); background-size: 24px 24px;";
      }
      break;

    case "cyberpunk":
      if (!isDark) {
        primaryBg = "#F1F5F9";
        secondaryBg = "#FFFFFF";
        subBg = "#E2E8F0";
        textPrimary = "#0F172A";
        textSecondary = "#334155";
        textMuted = "#64748B";
        borderCol = "#0F172A";
        accentCol = "#D946EF";
        accentHover = "#C084FC";
        borderWidthHeavy = "2px";
        borderWidthMedium = "2px";
        borderWidthLight = "1.5px";
        shadowHeavy = "0 10px 15px -3px rgba(217, 70, 239, 0.15)";
        shadowMedium = "0 4px 6px -1px rgba(217, 70, 239, 0.1)";
        shadowLight = "0 2px 4px -1px rgba(217, 70, 239, 0.05)";
        gridBg = "linear-gradient(#0F172A05 1px, transparent 1px), linear-gradient(90deg, #0F172A05 1px, transparent 1px); background-size: 20px 20px;";
      } else {
        primaryBg = "#0A0B10";
        secondaryBg = "#11131E";
        subBg = "#1B1E30";
        textPrimary = "#00F0FF";
        textSecondary = "#E2E8F0";
        textMuted = "#64748B";
        borderCol = "#FF007F";
        accentCol = "#FF007F";
        accentHover = "#D946EF";
        borderWidthHeavy = "2px";
        borderWidthMedium = "2px";
        borderWidthLight = "1.5px";
        shadowHeavy = "0 0 15px rgba(255, 0, 127, 0.4)";
        shadowMedium = "0 0 10px rgba(255, 0, 127, 0.25)";
        shadowLight = "0 0 5px rgba(255, 0, 127, 0.15)";
        gridBg = "linear-gradient(#FF007F0D 1px, transparent 1px), linear-gradient(90deg, #FF007F0D 1px, transparent 1px); background-size: 25px 25px;";
      }
      break;

    case "lavender":
      if (!isDark) {
        primaryBg = "#FAF5FF";
        secondaryBg = "#FFFFFF";
        subBg = "#F3E8FF";
        textPrimary = "#4C1D95";
        textSecondary = "#6D28D9";
        textMuted = "#A78BFA";
        borderCol = "#8B5CF6";
        accentCol = "#8B5CF6";
        accentHover = "#7C3AED";
        borderWidthHeavy = "2px";
        borderWidthMedium = "2px";
        borderWidthLight = "1.5px";
        shadowHeavy = "0 10px 15px -3px rgba(139, 92, 246, 0.1)";
        shadowMedium = "0 4px 6px -1px rgba(139, 92, 246, 0.08)";
        shadowLight = "0 2px 4px -1px rgba(139, 92, 246, 0.04)";
        gridBg = "none; background-color: #FAF5FF;";
      } else {
        primaryBg = "#120E2E";
        secondaryBg = "#1E184A";
        subBg = "#2D236C";
        textPrimary = "#F3E8FF";
        textSecondary = "#D8B4FE";
        textMuted = "#8B5CF6";
        borderCol = "#A78BFA";
        accentCol = "#A78BFA";
        accentHover = "#C084FC";
        borderWidthHeavy = "2px";
        borderWidthMedium = "2px";
        borderWidthLight = "1.5px";
        shadowHeavy = "0 10px 25px rgba(0, 0, 0, 0.3)";
        shadowMedium = "0 8px 16px rgba(0, 0, 0, 0.2)";
        shadowLight = "0 4px 8px rgba(0, 0, 0, 0.15)";
        gridBg = "none; background-color: #120E2E;";
      }
      break;

    case "forest":
      if (!isDark) {
        primaryBg = "#F0FDF4";
        secondaryBg = "#FFFFFF";
        subBg = "#DCFCE7";
        textPrimary = "#064E3B";
        textSecondary = "#0F766E";
        textMuted = "#6EE7B7";
        borderCol = "#10B981";
        accentCol = "#10B981";
        accentHover = "#059669";
        borderWidthHeavy = "2.5px";
        borderWidthMedium = "2px";
        borderWidthLight = "1.5px";
        shadowHeavy = "0 10px 15px -3px rgba(16, 185, 129, 0.1)";
        shadowMedium = "0 4px 6px -1px rgba(16, 185, 129, 0.08)";
        shadowLight = "0 2px 4px -1px rgba(16, 185, 129, 0.04)";
        gridBg = "radial-gradient(#10B9810A 1px, transparent 1px); background-size: 16px 16px;";
      } else {
        primaryBg = "#04231C";
        secondaryBg = "#0A362C";
        subBg = "#104E40";
        textPrimary = "#DCFCE7";
        textSecondary = "#A7F3D0";
        textMuted = "#34D399";
        borderCol = "#34D399";
        accentCol = "#34D399";
        accentHover = "#6EE7B7";
        borderWidthHeavy = "2.5px";
        borderWidthMedium = "2px";
        borderWidthLight = "1.5px";
        shadowHeavy = "0 10px 25px rgba(0, 0, 0, 0.3)";
        shadowMedium = "0 8px 16px rgba(0, 0, 0, 0.2)";
        shadowLight = "0 4px 8px rgba(0, 0, 0, 0.15)";
        gridBg = "radial-gradient(#34D39908 1px, transparent 1px); background-size: 16px 16px;";
      }
      break;

    case "crimson":
      if (!isDark) {
        primaryBg = "#FFF5F5";
        secondaryBg = "#FFFFFF";
        subBg = "#FEE2E2";
        textPrimary = "#7F1D1D";
        textSecondary = "#991B1B";
        textMuted = "#F87171";
        borderCol = "#EF4444";
        accentCol = "#EF4444";
        accentHover = "#DC2626";
        borderWidthHeavy = "2.5px";
        borderWidthMedium = "2px";
        borderWidthLight = "1.5px";
        shadowHeavy = "0 10px 15px -3px rgba(239, 68, 68, 0.1)";
        shadowMedium = "0 4px 6px -1px rgba(239, 68, 68, 0.08)";
        shadowLight = "0 2px 4px -1px rgba(239, 68, 68, 0.04)";
        gridBg = "radial-gradient(#EF444408 1px, transparent 1px); background-size: 18px 18px;";
      } else {
        primaryBg = "#280509";
        secondaryBg = "#3B0B11";
        subBg = "#52131A";
        textPrimary = "#FFE4E6";
        textSecondary = "#FECDD3";
        textMuted = "#FDA4AF";
        borderCol = "#FDA4AF";
        accentCol = "#EF4444";
        accentHover = "#F43F5E";
        borderWidthHeavy = "2.5px";
        borderWidthMedium = "2px";
        borderWidthLight = "1.5px";
        shadowHeavy = "0 10px 25px rgba(0, 0, 0, 0.35)";
        shadowMedium = "0 8px 16px rgba(0, 0, 0, 0.25)";
        shadowLight = "0 4px 8px rgba(0, 0, 0, 0.15)";
        gridBg = "radial-gradient(#FDA4AF08 1px, transparent 1px); background-size: 18px 18px;";
      }
      break;

    case "ocean":
      if (!isDark) {
        primaryBg = "#F0F9FF";
        secondaryBg = "#FFFFFF";
        subBg = "#E0F2FE";
        textPrimary = "#0369A1";
        textSecondary = "#0284C7";
        textMuted = "#38BDF8";
        borderCol = "#0EA5E9";
        accentCol = "#0EA5E9";
        accentHover = "#0284C7";
        borderWidthHeavy = "2.5px";
        borderWidthMedium = "2px";
        borderWidthLight = "1.5px";
        shadowHeavy = "0 10px 15px -3px rgba(14, 165, 233, 0.1)";
        shadowMedium = "0 4px 6px -1px rgba(14, 165, 233, 0.08)";
        shadowLight = "0 2px 4px -1px rgba(14, 165, 233, 0.04)";
        gridBg = "radial-gradient(#0EA5E90C 1px, transparent 1px); background-size: 20px 20px;";
      } else {
        primaryBg = "#041D2D";
        secondaryBg = "#0A2B3D";
        subBg = "#113F59";
        textPrimary = "#E0F2FE";
        textSecondary = "#BAE6FD";
        textMuted = "#38BDF8";
        borderCol = "#38BDF8";
        accentCol = "#0EA5E9";
        accentHover = "#38BDF8";
        borderWidthHeavy = "2.5px";
        borderWidthMedium = "2px";
        borderWidthLight = "1.5px";
        shadowHeavy = "0 10px 25px rgba(0, 0, 0, 0.3)";
        shadowMedium = "0 8px 16px rgba(0, 0, 0, 0.2)";
        shadowLight = "0 4px 8px rgba(0, 0, 0, 0.15)";
        gridBg = "radial-gradient(#38BDF808 1px, transparent 1px); background-size: 20px 20px;";
      }
      break;

    case "glassmorphism":
      if (!isDark) {
        primaryBg = "#FAF5FF";
        secondaryBg = "rgba(255, 255, 255, 0.45)";
        subBg = "rgba(255, 255, 255, 0.25)";
        textPrimary = "#4C1D95";
        textSecondary = "#6D28D9";
        textMuted = "#A78BFA";
        borderCol = "rgba(255, 255, 255, 0.35)";
        accentCol = "#8B5CF6";
        accentHover = "#7C3AED";
        borderWidthHeavy = "1px";
        borderWidthMedium = "1px";
        borderWidthLight = "1px";
        shadowHeavy = "0 8px 32px 0 rgba(31, 38, 135, 0.06)";
        shadowMedium = "0 8px 16px 0 rgba(31, 38, 135, 0.04)";
        shadowLight = "0 4px 8px 0 rgba(31, 38, 135, 0.02)";
        gridBg = "radial-gradient(at 0% 0%, #e0e7ff 0px, transparent 50%), radial-gradient(at 50% 0%, #fbcfe8 0px, transparent 50%), radial-gradient(at 100% 0%, #c084fc 0px, transparent 50%), radial-gradient(at 0% 100%, #fed7aa 0px, transparent 50%), #faf5ff;";
      } else {
        primaryBg = "#030712";
        secondaryBg = "rgba(17, 24, 39, 0.45)";
        subBg = "rgba(17, 24, 39, 0.25)";
        textPrimary = "#F3E8FF";
        textSecondary = "#D8B4FE";
        textMuted = "#8B5CF6";
        borderCol = "rgba(255, 255, 255, 0.08)";
        accentCol = "#A78BFA";
        accentHover = "#C084FC";
        borderWidthHeavy = "1px";
        borderWidthMedium = "1px";
        borderWidthLight = "1px";
        shadowHeavy = "0 8px 32px 0 rgba(0, 0, 0, 0.37)";
        shadowMedium = "0 8px 16px 0 rgba(0, 0, 0, 0.2)";
        shadowLight = "0 4px 8px 0 rgba(0, 0, 0, 0.1)";
        gridBg = "radial-gradient(at 0% 0%, #1e1b4b 0px, transparent 50%), radial-gradient(at 50% 0%, #4c1d95 0px, transparent 50%), radial-gradient(at 100% 0%, #030712 0px, transparent 50%), #030712;";
      }
      break;

    case "ios":
      if (!isDark) {
        primaryBg = "#F2F2F7";
        secondaryBg = "#FFFFFF";
        subBg = "#E5E5EA";
        textPrimary = "#000000";
        textSecondary = "#3A3A3C";
        textMuted = "#8E8E93";
        borderCol = "#D1D1D6";
        accentCol = "#007AFF";
        accentHover = "#0056B3";
        borderWidthHeavy = "1px";
        borderWidthMedium = "1px";
        borderWidthLight = "1px";
        shadowHeavy = "0 10px 30px rgba(0, 0, 0, 0.04)";
        shadowMedium = "0 4px 12px rgba(0, 0, 0, 0.03)";
        shadowLight = "0 2px 6px rgba(0, 0, 0, 0.02)";
        gridBg = "none; background-color: #F2F2F7;";
      } else {
        primaryBg = "#000000";
        secondaryBg = "#1C1C1E";
        subBg = "#2C2C2E";
        textPrimary = "#FFFFFF";
        textSecondary = "#AEAEB2";
        textMuted = "#636366";
        borderCol = "#38383A";
        accentCol = "#0A84FF";
        accentHover = "#0066CC";
        borderWidthHeavy = "1px";
        borderWidthMedium = "1px";
        borderWidthLight = "1px";
        shadowHeavy = "0 10px 30px rgba(0, 0, 0, 0.3)";
        shadowMedium = "0 8px 16px rgba(0, 0, 0, 0.2)";
        shadowLight = "0 4px 8px rgba(0, 0, 0, 0.15)";
        gridBg = "none; background-color: #000000;";
      }
      break;

    case "github":
      if (!isDark) {
        primaryBg = "#F6F8FA";
        secondaryBg = "#FFFFFF";
        subBg = "#EAEEF2";
        textPrimary = "#24292F";
        textSecondary = "#57606A";
        textMuted = "#8C959F";
        borderCol = "#D0D7DE";
        accentCol = "#0969DA";
        accentHover = "#0550AE";
        borderWidthHeavy = "1px";
        borderWidthMedium = "1px";
        borderWidthLight = "1px";
        shadowHeavy = "0 1px 3px rgba(0, 0, 0, 0.05)";
        shadowMedium = "0 1px 2px rgba(0, 0, 0, 0.05)";
        shadowLight = "0 1px 1px rgba(0, 0, 0, 0.02)";
        gridBg = "none; background-color: #F6F8FA;";
      } else {
        primaryBg = "#0D1117";
        secondaryBg = "#161B22";
        subBg = "#21262D";
        textPrimary = "#C9D1D9";
        textSecondary = "#8B949E";
        textMuted = "#484F58";
        borderCol = "#30363D";
        accentCol = "#58A6FF";
        accentHover = "#1F6FEB";
        borderWidthHeavy = "1px";
        borderWidthMedium = "1px";
        borderWidthLight = "1px";
        shadowHeavy = "0 1px 3px rgba(0, 0, 0, 0.5)";
        shadowMedium = "0 1px 2px rgba(0, 0, 0, 0.3)";
        shadowLight = "0 1px 1px rgba(0, 0, 0, 0.2)";
        gridBg = "none; background-color: #0D1117;";
      }
      break;

    case "rapido":
      if (!isDark) {
        primaryBg = "#FDDE14";
        secondaryBg = "#FFFFFF";
        subBg = "#FFF9CC";
        textPrimary = "#111111";
        textSecondary = "#444444";
        textMuted = "#777777";
        borderCol = "#111111";
        accentCol = "#FF5E00";
        accentHover = "#E04D00";
        borderWidthHeavy = "4px";
        borderWidthMedium = "3px";
        borderWidthLight = "2px";
        shadowHeavy = "5px 5px 0px 0px #111111";
        shadowMedium = "3.5px 3.5px 0px 0px #111111";
        shadowLight = "2px 2px 0px 0px #111111";
        gridBg = "linear-gradient(#11111108 1px, transparent 1px), linear-gradient(90deg, #11111108 1px, transparent 1px); background-size: 24px 24px;";
      } else {
        primaryBg = "#0F0F11";
        secondaryBg = "#1B1B1E";
        subBg = "#28282D";
        textPrimary = "#FFFFFF";
        textSecondary = "#E2E8F0";
        textMuted = "#88888D";
        borderCol = "#FDDE14";
        accentCol = "#FDDE14";
        accentHover = "#E0C30F";
        borderWidthHeavy = "3px";
        borderWidthMedium = "2.5px";
        borderWidthLight = "1.5px";
        shadowHeavy = "5px 5px 0px 0px #FDDE14";
        shadowMedium = "3.5px 3.5px 0px 0px #FDDE14";
        shadowLight = "2px 2px 0px 0px #FDDE14";
        gridBg = "linear-gradient(#FDDE1408 1px, transparent 1px), linear-gradient(90deg, #FDDE1408 1px, transparent 1px); background-size: 24px 24px;";
      }
      break;

    case "ola":
      if (!isDark) {
        primaryBg = "#F5F6F3";
        secondaryBg = "#FFFFFF";
        subBg = "#E9F2CD";
        textPrimary = "#1C1C1C";
        textSecondary = "#555555";
        textMuted = "#999999";
        borderCol = "#A1D030";
        accentCol = "#A1D030";
        accentHover = "#8CB924";
        borderWidthHeavy = "2px";
        borderWidthMedium = "2px";
        borderWidthLight = "1.5px";
        shadowHeavy = "0 10px 15px -3px rgba(161, 208, 48, 0.15)";
        shadowMedium = "0 4px 6px -1px rgba(161, 208, 48, 0.1)";
        shadowLight = "0 2px 4px -1px rgba(161, 208, 48, 0.05)";
        gridBg = "none; background-color: #F5F6F3;";
      } else {
        primaryBg = "#111215";
        secondaryBg = "#1A1D24";
        subBg = "#232731";
        textPrimary = "#FFFFFF";
        textSecondary = "#CBD5E1";
        textMuted = "#64748B";
        borderCol = "#A1D030";
        accentCol = "#A1D030";
        accentHover = "#8CB924";
        borderWidthHeavy = "2px";
        borderWidthMedium = "2px";
        borderWidthLight = "1.5px";
        shadowHeavy = "0 0 15px rgba(161, 208, 48, 0.25)";
        shadowMedium = "0 0 10px rgba(161, 208, 48, 0.15)";
        shadowLight = "0 0 5px rgba(161, 208, 48, 0.08)";
        gridBg = "none; background-color: #111215;";
      }
      break;

    case "chatgpt":
      if (!isDark) {
        primaryBg = "#F7F7F8";
        secondaryBg = "#FFFFFF";
        subBg = "#ECECF1";
        textPrimary = "#202123";
        textSecondary = "#5D5E6F";
        textMuted = "#9A9B9F";
        borderCol = "#E5E5E7";
        accentCol = "#10A37F";
        accentHover = "#0E8A6B";
        borderWidthHeavy = "1px";
        borderWidthMedium = "1px";
        borderWidthLight = "1px";
        shadowHeavy = "0 4px 12px rgba(0, 0, 0, 0.03)";
        shadowMedium = "0 2px 6px rgba(0, 0, 0, 0.02)";
        shadowLight = "0 1px 3px rgba(0, 0, 0, 0.01)";
        gridBg = "none; background-color: #F7F7F8;";
      } else {
        primaryBg = "#202123";
        secondaryBg = "#2D2D31";
        subBg = "#343541";
        textPrimary = "#ECECF1";
        textSecondary = "#C5C5D2";
        textMuted = "#8E8EA0";
        borderCol = "#4d4d4f";
        accentCol = "#10A37F";
        accentHover = "#15B891";
        borderWidthHeavy = "1px";
        borderWidthMedium = "1px";
        borderWidthLight = "1px";
        shadowHeavy = "0 10px 25px rgba(0, 0, 0, 0.25)";
        shadowMedium = "0 8px 16px rgba(0, 0, 0, 0.15)";
        shadowLight = "0 4px 8px rgba(0, 0, 0, 0.1)";
        gridBg = "none; background-color: #202123;";
      }
      break;

    case "googleaistudio":
      if (!isDark) {
        primaryBg = "#F8F9FA";
        secondaryBg = "#FFFFFF";
        subBg = "#E8EAED";
        textPrimary = "#1F2023";
        textSecondary = "#3C4043";
        textMuted = "#70757A";
        borderCol = "#DADCE0";
        accentCol = "#1A73E8";
        accentHover = "#1557B0";
        borderWidthHeavy = "1px";
        borderWidthMedium = "1px";
        borderWidthLight = "1px";
        shadowHeavy = "0 1px 3px rgba(0, 0, 0, 0.08)";
        shadowMedium = "0 1px 2px rgba(0, 0, 0, 0.08)";
        shadowLight = "0 1px 1px rgba(0, 0, 0, 0.05)";
        gridBg = "none; background-color: #F8F9FA;";
      } else {
        primaryBg = "#08090C";
        secondaryBg = "#101216";
        subBg = "#1B1D23";
        textPrimary = "#E8EAED";
        textSecondary = "#9AA0A6";
        textMuted = "#5F6368";
        borderCol = "#3C4043";
        accentCol = "#8AB4F8";
        accentHover = "#AECBFA";
        borderWidthHeavy = "1px";
        borderWidthMedium = "1px";
        borderWidthLight = "1px";
        shadowHeavy = "0 0 15px rgba(138, 180, 248, 0.2)";
        shadowMedium = "0 0 10px rgba(138, 180, 248, 0.1)";
        shadowLight = "0 0 5px rgba(138, 180, 248, 0.05)";
        gridBg = "radial-gradient(#8AB4F80D 1px, transparent 1px); background-size: 20px 20px;";
      }
      break;
  }

  // Generate CSS rules to inject
  return `
    :root {
      --primary-bg: ${primaryBg};
      --secondary-bg: ${secondaryBg};
      --sub-bg: ${subBg};
      --text-primary: ${textPrimary};
      --text-secondary: ${textSecondary};
      --text-muted: ${textMuted};
      --border-color: ${borderCol};
      --accent-color: ${accentCol};
      --accent-hover: ${accentHover};
      --border-width-heavy: ${borderWidthHeavy};
      --border-width-medium: ${borderWidthMedium};
      --border-width-light: ${borderWidthLight};
      --shadow-heavy: ${shadowHeavy};
      --shadow-medium: ${shadowMedium};
      --shadow-light: ${shadowLight};
    }

    body, html, .notebook-grid, main, aside, .flex-1, .bg-\\[\\#FAF6EE\\], .bg-\\[\\#FCFAF5\\] {
      background-color: var(--primary-bg) !important;
      background-image: ${gridBg} !important;
    }

    /* Primary Container / Cards Overrides */
    .bg-white {
      background-color: var(--secondary-bg) !important;
    }

    .bg-slate-50, .bg-slate-100, .bg-\\[\\#FEFCE8\\], .bg-\\[\\#FEF3C7\\] {
      background-color: var(--sub-bg) !important;
    }

    .dark\\:bg-slate-900, .dark\\:bg-slate-800 {
      background-color: var(--sub-bg) !important;
    }

    /* Text elements overrides */
    .text-slate-800, .text-slate-700, .dark\\:text-slate-100, .dark\\:text-slate-200 {
      color: var(--text-primary) !important;
    }

    .text-slate-600, .text-slate-500, .dark\\:text-slate-300, .dark\\:text-slate-400 {
      color: var(--text-secondary) !important;
    }

    .text-slate-400, .dark\\:text-slate-500 {
      color: var(--text-muted) !important;
    }

    /* Border line styles overrides */
    .border-slate-800, .border-slate-300, .border-slate-200, .border-slate-100,
    .dark\\:border-slate-700, .dark\\:border-slate-800 {
      border-color: var(--border-color) !important;
    }

    .border-4 {
      border-width: var(--border-width-heavy) !important;
    }

    .border-3 {
      border-width: var(--border-width-medium) !important;
    }

    .border-2 {
      border-width: var(--border-width-light) !important;
    }

    /* Shadow effects overrides */
    .shadow-\\[1\\.5px_1\\.5px_0px_0px_\\#1e293b\\], .shadow-\\[1\\.5px_1\\.5px_0px_0px_\\#000\\] {
      box-shadow: var(--shadow-light) !important;
    }

    .shadow-\\[2px_2px_0px_0px_\\#1e293b\\], .shadow-\\[2\\.5px_2\\.5px_0px_0px_\\#1e293b\\], .shadow-\\[3px_3px_0px_0px_\\#1e293b\\] {
      box-shadow: var(--shadow-light) !important;
    }

    .shadow-\\[4px_4px_0px_0px_\\#1e293b\\], .shadow-\\[4px_4px_0px_0px_\\#000\\], .shadow-\\[5px_5px_0px_0px_\\#1e293b\\], .shadow-\\[5px_5px_0px_0px_\\#1e293b\\] {
      box-shadow: var(--shadow-medium) !important;
    }

    .shadow-\\[6px_6px_0px_0px_\\#1e293b\\], .shadow-\\[6px_6px_0px_0px_\\#000\\] {
      box-shadow: var(--shadow-heavy) !important;
    }

    /* Buttons Accent Background overrides */
    .bg-indigo-500, .bg-indigo-600 {
      background-color: var(--accent-color) !important;
    }

    .hover\\:bg-indigo-600:hover, .hover\\:bg-indigo-500:hover {
      background-color: var(--accent-hover) !important;
    }

    /* Text & Border Accent overrides */
    .text-indigo-600, .text-indigo-500 {
      color: var(--accent-color) !important;
    }

    .border-indigo-500, .border-indigo-600 {
      border-color: var(--accent-color) !important;
    }

    /* Doodle specific custom fonts if needed */
    ${preset === "brutalist" ? `
      * {
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      }
    ` : ""}

    /* Glassmorphism glass card overlays */
    ${preset === "glassmorphism" ? `
      .bg-white, .bg-slate-50, .bg-slate-100 {
        background-color: var(--secondary-bg) !important;
        backdrop-filter: blur(14px) !important;
        -webkit-backdrop-filter: blur(14px) !important;
      }
    ` : ""}

    /* Apple iOS and Glassmorphism clean font */
    ${preset === "ios" || preset === "glassmorphism" ? `
      * {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
      }
    ` : ""}

    /* GitHub monospace and sans-serif rules */
    ${preset === "github" ? `
      * {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji" !important;
      }
      code, pre, .font-mono {
        font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace !important;
      }
    ` : ""}

    /* Google AI Studio tech-forward font rules */
    ${preset === "googleaistudio" ? `
      * {
        font-family: "Google Sans", "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
      }
      code, pre, .font-mono {
        font-family: "Roboto Mono", ui-monospace, monospace !important;
      }
    ` : ""}
  `;
}
