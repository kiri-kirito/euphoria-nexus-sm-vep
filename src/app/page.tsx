export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text mb-6">
        Welcome to Euphoria Nexus
      </h1>
      <p className="text-lg text-slate-600 max-w-2xl mb-8">
        The smartest multi-vendor e-commerce platform. Shop, sell, negotiate in bulk, and discover local vendors near you.
      </p>
      
      <div className="flex gap-4">
        <button className="px-6 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary-dark transition-colors">
          Start Shopping
        </button>
        <button className="px-6 py-3 rounded-full border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition-colors">
          Become a Seller
        </button>
      </div>
    </main>
  );
}
