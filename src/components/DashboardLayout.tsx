import { BarChart3 } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-5 sm:px-6">
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              <span className="font-extrabold italic">Aspect-Based Sentiment Analysis</span>{" "}
              <span className="font-normal text-muted-foreground">Dashboard</span>
            </h1>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 sm:px-6 lg:py-8">{children}</main>
    </div>
  );
};

export default DashboardLayout;
