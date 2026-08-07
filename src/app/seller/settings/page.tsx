export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Store Settings</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto">
          <button className="px-6 py-4 text-sm font-bold text-primary border-b-2 border-primary whitespace-nowrap">
            Store Info
          </button>
          <button className="px-6 py-4 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 whitespace-nowrap transition-colors">
            Payment Methods
          </button>
          <button className="px-6 py-4 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 whitespace-nowrap transition-colors">
            Notifications
          </button>
          <button className="px-6 py-4 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 whitespace-nowrap transition-colors">
            Security
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-8">
          
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
              <h2 className="text-lg font-bold text-slate-900">Store Profile</h2>
              <p className="text-sm text-slate-500 mt-1">Update your store's photo and details here.</p>
            </div>
            
            <div className="md:w-2/3 space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl font-bold text-slate-400 overflow-hidden">
                  TH
                </div>
                <div>
                  <button type="button" className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                    Change Logo
                  </button>
                  <p className="text-xs text-slate-500 mt-2">JPG, GIF or PNG. 1MB max.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Store Name</label>
                <input type="text" defaultValue="Tech Haven BD" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Store Description</label>
                <textarea rows={4} defaultValue="Premium electronics and tech accessories store based in Dhaka." className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"></textarea>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
              <h2 className="text-lg font-bold text-slate-900">Contact & Location</h2>
              <p className="text-sm text-slate-500 mt-1">Where can customers find you?</p>
            </div>
            
            <div className="md:w-2/3 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
                  <input type="email" defaultValue="contact@techhaven.bd" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <input type="tel" defaultValue="+880 1711 223344" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Store Address</label>
                <input type="text" defaultValue="Level 4, Multiplan Center, Elephant Road" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
              <h2 className="text-lg font-bold text-slate-900">Business Details</h2>
              <p className="text-sm text-slate-500 mt-1">Categories and operating hours.</p>
            </div>
            
            <div className="md:w-2/3 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Store Categories</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Electronics', 'Fashion', 'Accessories', 'Furniture', 'Sports', 'Home'].map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked={cat === 'Electronics' || cat === 'Accessories'} className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300 accent-primary" />
                      <span className="text-sm text-slate-700">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Opening Time</label>
                  <input type="time" defaultValue="10:00" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Closing Time</label>
                  <input type="time" defaultValue="20:00" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
              </div>
            </div>
          </div>

        </div>
        
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
          <button type="button" className="w-full md:w-auto px-8 py-2.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors shadow-sm">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
