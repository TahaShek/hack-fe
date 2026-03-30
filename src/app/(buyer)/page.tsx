import HeroSection from "@/components/buyer/HeroSection";
import MarqueeTicker from "@/components/buyer/MarqueeTicker";
import CategoryGrid from "@/components/buyer/CategoryGrid";
import FeaturedProducts from "@/components/buyer/FeaturedProducts";
import EditorialBand from "@/components/buyer/EditorialBand";
import RecommendedProducts from "@/components/ai/RecommendedProducts";

export default function HomePage() {
  return (
    <div className="relative">
      <HeroSection />
      <MarqueeTicker />
      <div data-testid="category-menu"><CategoryGrid /></div>
      <div data-testid="featured-products"><FeaturedProducts /></div>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <RecommendedProducts />
      </div>
      <EditorialBand />
    </div>
  );
}
