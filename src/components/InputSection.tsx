import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import CsvUpload from "@/components/CsvUpload";
import ScrapeUrl from "@/components/ScrapeUrl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, FileUp, MessageSquareText } from "lucide-react";
import ReviewInput from "@/components/ReviewInput";

interface Props {
  onSingleReview: (text: string) => void;
  onCsvReviews: (reviews: string[]) => void;
  onScrape: (reviews: string[], url: string, title: string) => void;
  isLoading: boolean;
}

const InputSection = ({ onSingleReview, onCsvReviews, onScrape, isLoading }: Props) => {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-5 sm:p-6">
        <Tabs defaultValue="scrape" className="w-full">
          <TabsList className="mb-5 grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="scrape" className="gap-1.5 text-xs sm:text-sm">
              <Globe className="h-3.5 w-3.5" />
              Scrape URL
            </TabsTrigger>
            <TabsTrigger value="csv" className="gap-1.5 text-xs sm:text-sm">
              <FileUp className="h-3.5 w-3.5" />
              CSV Upload
            </TabsTrigger>
            <TabsTrigger value="single" className="gap-1.5 text-xs sm:text-sm">
              <MessageSquareText className="h-3.5 w-3.5" />
              Single Review
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scrape" className="mt-0">
            <ScrapeUrl onAnalyze={onScrape} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="csv" className="mt-0">
            <CsvUpload onAnalyze={onCsvReviews} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value="single" className="mt-0">
            <ReviewInput onAnalyze={onSingleReview} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default InputSection;
