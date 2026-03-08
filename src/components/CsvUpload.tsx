import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Loader2 } from "lucide-react";

interface CsvUploadProps {
  onAnalyze: (reviews: string[]) => void;
  isLoading: boolean;
}

const CsvUpload = ({ onAnalyze, isLoading }: CsvUploadProps) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [reviews, setReviews] = useState<string[]>([]);

  const parseFile = useCallback((file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").slice(1).map((l) => l.trim()).filter(Boolean);
      // Take the last column or first column as review text
      const parsed = lines.map((line) => {
        const parts = line.split(",");
        return parts[parts.length - 1]?.replace(/^"|"$/g, "").trim() || line;
      }).filter((r) => r.length > 10);
      const limited = parsed.slice(0, 50);
      setReviews(limited);
      setReviewCount(limited.length);
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file?.name.endsWith(".csv")) parseFile(file);
    },
    [parseFile]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  };

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 p-8 text-center transition-colors hover:border-primary/50 hover:bg-muted/50"
      >
        {fileName ? (
          <>
            <FileText className="mb-2 h-8 w-8 text-primary" />
            <p className="font-medium text-foreground">{fileName}</p>
            <p className="text-sm text-muted-foreground">{reviewCount} reviews loaded</p>
          </>
        ) : (
          <>
            <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="font-medium text-foreground">Drop a CSV file here</p>
            <p className="text-sm text-muted-foreground">or click to browse</p>
          </>
        )}
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="absolute inset-0 cursor-pointer opacity-0"
          style={{ position: "relative" }}
        />
      </div>
      <Button
        onClick={() => onAnalyze(reviews)}
        disabled={reviews.length === 0 || isLoading}
        className="w-full"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        {isLoading ? "Analyzing..." : `Analyze ${reviewCount} Reviews`}
      </Button>
    </div>
  );
};

export default CsvUpload;
