import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  if (!toggleTheme) return null;

  const nextTheme = theme === "dark" ? "light" : "dark";
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      className="inline-flex h-10 items-center gap-2 border border-white/20 bg-white/[0.06] px-3 font-[IBM_Plex_Mono] text-[10px] font-medium tracking-[0.12em] text-white backdrop-blur-md transition duration-200 hover:border-[#ff5a1f]/80 hover:bg-[#ff5a1f] hover:text-[#07090d] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a1f] focus-visible:ring-offset-4 focus-visible:ring-offset-[#05070b] sm:h-11 sm:px-3.5"
    >
      <span className="hidden sm:inline">{isDark ? "LIGHT MODE" : "DARK MODE"}</span>
      {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
    </button>
  );
}
