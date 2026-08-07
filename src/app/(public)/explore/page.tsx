import FilterSidebar from "@/components/catalog/FilterSidebar";
import ProductGrid from "@/components/catalog/ProductGrid";

export default function ExplorePage() {
  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Page Header */}
      <div className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Explore Products</h1>
        <p className="text-slate-500 mt-2 text-lg">Browse thousands of products, find local sellers, and negotiate bulk deals.</p>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
        <FilterSidebar />
        <ProductGrid />
      </div>
    </main>
  );
}
