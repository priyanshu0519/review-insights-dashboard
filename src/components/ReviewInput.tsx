import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";

interface ReviewInputProps {
  onAnalyze: (text: string) => void;
  isLoading: boolean;
}

const ReviewInput = ({ onAnalyze, isLoading }: ReviewInputProps) => {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (text.trim()) onAnalyze(text.trim());
  };

  return (
    <div className="space-y-3">
      <Textarea
        placeholder="Enter a product review to analyze... e.g. 'The battery life is great but the camera quality is terrible for the price.'"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-[120px] resize-none"
      />
      <Button onClick={handleSubmit} disabled={!text.trim() || isLoading} className="w-full">
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Send className="mr-2 h-4 w-4" />
        )}
        {isLoading ? "Analyzing..." : "Analyze Sentiment"}
      </Button>
    </div>
  );
};

export default ReviewInput;
