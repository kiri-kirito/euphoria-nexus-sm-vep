export default function TaskDetails({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col min-h-[calc(100vh-60px)] bg-gray-50">
      <div className="p-4 bg-white shadow-sm z-10 relative flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Order #ORD-{params.id}</h1>
          <p className="text-sm font-medium text-orange-600">Pickup in 5 mins</p>
        </div>
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-lg">📞</span>
        </div>
      </div>

      {/* Mock Map Area */}
      <div className="flex-1 min-h-[250px] bg-slate-200 relative flex items-center justify-center overflow-hidden">
        {/* Subtle grid pattern to mock map look */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(#9ca3af_1px,transparent_1px),linear-gradient(90deg,#9ca3af_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        
        {/* Route Line Mock */}
        <div className="absolute top-1/2 left-1/4 right-1/4 h-1 bg-blue-500 rounded-full z-0 opacity-50 transform -translate-y-1/2 rotate-12"></div>
        
        <div className="relative z-10 flex flex-col items-center -mt-10">
          <div className="text-5xl drop-shadow-md animate-bounce">📍</div>
          <div className="bg-gray-900 text-white px-3 py-1 rounded-full shadow-lg text-xs font-bold mt-1">
            Delivery Location
          </div>
        </div>
      </div>

      {/* Info & Actions */}
      <div className="bg-white rounded-t-3xl -mt-6 p-5 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] relative z-20 flex-1 flex flex-col pb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Delivery Details</h2>
        
        <div className="space-y-5 flex-1">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xl shrink-0">
              👤
            </div>
            <div>
              <p className="font-bold text-gray-900 text-base">Sarah Jenkins</p>
              <p className="text-sm text-gray-500 font-medium">Customer • (555) 123-4567</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center text-xl shrink-0">
              🏠
            </div>
            <div>
              <p className="font-bold text-gray-900 text-base">123 Main St, Apt 4B</p>
              <p className="text-sm text-gray-500 font-medium">Leave at door. Do not ring bell.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 mt-6">
          <button className="w-full py-4 bg-gray-100 text-gray-800 font-bold rounded-2xl active:bg-gray-200 transition-colors">
            Picked Up
          </button>
          <button className="w-full py-4 bg-blue-100 text-blue-800 font-bold rounded-2xl active:bg-blue-200 transition-colors">
            On the Way
          </button>
          <button className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl active:bg-green-700 transition-colors shadow-lg shadow-green-200/50 flex items-center justify-center gap-2">
            <span>✓</span> Delivered
          </button>
        </div>
      </div>
    </div>
  );
}
