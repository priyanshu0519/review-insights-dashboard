import { Button } from "@/components/ui/button";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { AnalysisResult } from "@/lib/types";
import { exportCsv, exportPdf } from "@/lib/export";
import { useToast } from "@/hooks/use-toast";

interface Props {
  result: AnalysisResult;
}

const ExportButtons = ({ result }: Props) => {
  const { toast } = useToast();

  const handleCsv = () => {
    exportCsv(result);
    toast({ title: "CSV Downloaded", description: "Report saved as CSV file." });
  };

  const handlePdf = () => {
    exportPdf(result);
    toast({ title: "PDF Downloaded", description: "Report saved as PDF file." });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCsv} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="h-4 w-4 text-sentiment-positive" />
          Download CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePdf} className="gap-2 cursor-pointer">
          <FileText className="h-4 w-4 text-metric-blue" />
          Download PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButtons;
