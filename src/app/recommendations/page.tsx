import { RecommendationsClientPage } from "@/components/recommendations-client-page";

export default function RecommendationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-headline mb-2">AI Product Finder</h1>
          <p className="text-lg text-muted-foreground">
            Enter a phone model and select a component to find the exact part you need from our inventory.
          </p>
        </div>
        <RecommendationsClientPage />
      </div>
    </div>
  );
}
