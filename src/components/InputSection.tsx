import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, FileUp, MessageSquareText } from "lucide-react";
import CsvUpload from "@/components/CsvUpload";
import ScrapeUrl from "@/components/ScrapeUrl";
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
      <CardContent className="p-3 sm:p-5 lg:p-6">
        <Tabs defaultValue="scrape" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-3 sm:max-w-md">
            <TabsTrigger value="scrape" className="gap-1 text-[11px] px-2 sm:gap-1.5 sm:text-sm sm:px-3">
              <Globe className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="hidden xs:inline">Scrape</span> URL
            </TabsTrigger>
            <TabsTrigger value="csv" className="gap-1 text-[11px] px-2 sm:gap-1.5 sm:text-sm sm:px-3">
              <FileUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              CSV
            </TabsTrigger>
            <TabsTrigger value="single" className="gap-1 text-[11px] px-2 sm:gap-1.5 sm:text-sm sm:px-3">
              <MessageSquareText className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Review
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
