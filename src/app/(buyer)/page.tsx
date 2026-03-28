import HeroSection from "@/components/buyer/HeroSection";
import MarqueeTicker from "@/components/buyer/MarqueeTicker";
import CategoryGrid from "@/components/buyer/CategoryGrid";
import FeaturedProducts from "@/components/buyer/FeaturedProducts";
import EditorialBand from "@/components/buyer/EditorialBand";
import EditorialCollection from "@/components/buyer/EditorialCollection";
import PromoBanner from "@/components/buyer/PromoBanner";
import TrendingList from "@/components/buyer/TrendingList";

export default function HomePage() {
  return (
    <div className="relative">
      <HeroSection />
      <MarqueeTicker />
      <CategoryGrid />
      <FeaturedProducts />
      <EditorialBand />
      <EditorialCollection />
      <PromoBanner />
      <TrendingList />
    </div>
  );
}
