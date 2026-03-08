import { BarChart3, Sparkles } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                SentimentIQ
              </h1>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Aspect-Based Sentiment Analysis
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-accent px-3 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-accent-foreground" />
            <span className="text-xs font-medium text-accent-foreground">AI-Powered</span>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
};

export default DashboardLayout;
