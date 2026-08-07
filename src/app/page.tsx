import Hero from "@/components/home/Hero";
import FeaturedBundles from "@/components/home/FeaturedBundles";
import DailyDeals from "@/components/home/DailyDeals";
import LocalSellers from "@/components/home/LocalSellers";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto">
      <Hero />
      <FeaturedBundles />
      <DailyDeals />
      <LocalSellers />
    </main>
  );
}
