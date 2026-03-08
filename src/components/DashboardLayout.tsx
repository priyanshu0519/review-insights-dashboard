import { BarChart3, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-3 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary sm:h-10 sm:w-10">
              <BarChart3 className="h-4 w-4 text-primary-foreground sm:h-5 sm:w-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-foreground sm:text-xl lg:text-2xl">
                <span className="font-extrabold italic">Sentiment Analysis</span>
                <span className="hidden sm:inline font-extrabold italic"> Dashboard</span>
              </h1>
              <p className="hidden md:block text-xs text-muted-foreground">
                Aspect-Based · AI-Powered
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-8 w-8 sm:h-9 sm:w-9"
          >
            <Sun className="h-3.5 w-3.5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0 sm:h-4 sm:w-4" />
            <Moon className="absolute h-3.5 w-3.5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100 sm:h-4 sm:w-4" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </header>
      <main className="container mx-auto px-3 py-4 sm:px-6 sm:py-6 lg:py-8">{children}</main>
    </div>
  );
};

export default DashboardLayout;
