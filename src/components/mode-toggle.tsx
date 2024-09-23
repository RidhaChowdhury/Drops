import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  // Function to toggle between light and dark modes
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="hover:bg-transparent focus:ring-0 active:bg-transparent" // Disable background, focus, and active effects
      style={{ backgroundColor: "transparent", color: "inherit" }} // Inherit color and background
    >
      {/* Smooth transition between Sun and Moon icons */}
      <Sun
        className={`h-[1.2rem] w-[1.2rem] transition-transform duration-300 ${
          theme === "dark" ? "rotate-90 scale-0" : "rotate-0 scale-100"
        }`}
      />
      <Moon
        className={`absolute h-[1.2rem] w-[1.2rem] transition-transform duration-300 ${
          theme === "dark" ? "rotate-0 scale-100 text-white" : "rotate-90 scale-0"
        }`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
