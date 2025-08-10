import { RecommendationsClientPage } from "@/components/recommendations-client-page";

export default function RecommendationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-headline mb-2">AI Accessory Recommender</h1>
          <p className="text-lg text-muted-foreground">
            Not sure what you need? Enter your phone model below and let our AI suggest the perfect accessories for you.
          </p>
        </div>
        <RecommendationsClientPage />
      </div>
    </div>
  );
}
