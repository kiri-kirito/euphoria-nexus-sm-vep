export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-medium text-slate-500 mb-1">Total Revenue</h3>
          <p className="text-3xl font-bold text-slate-800">$124,500</p>
          <p className="text-xs text-green-500 font-medium mt-2">+14% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-medium text-slate-500 mb-1">Total Users</h3>
          <p className="text-3xl font-bold text-slate-800">12,304</p>
          <p className="text-xs text-green-500 font-medium mt-2">+5% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-medium text-slate-500 mb-1">Total Commission</h3>
          <p className="text-3xl font-bold text-slate-800">$18,675</p>
          <p className="text-xs text-green-500 font-medium mt-2">+12% from last month</p>
        </div>
      </div>

      {/* Charts Area */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Revenue Over Time</h3>
        <div className="h-64 flex items-end justify-between space-x-2 pt-4 border-b border-slate-200">
          {/* Simple CSS Bar Chart */}
          {[40, 65, 45, 80, 55, 90, 75, 100, 85, 110, 95, 120].map((height, i) => (
            <div key={i} className="w-full relative group flex justify-center">
              <div 
                className="w-full bg-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-600" 
                style={{ height: `${height}%` }}
              ></div>
              <div className="absolute -top-8 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                ${height}k
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-2">
          <span>Jan</span>
          <span>Feb</span>
          <span>Mar</span>
          <span>Apr</span>
          <span>May</span>
          <span>Jun</span>
          <span>Jul</span>
          <span>Aug</span>
          <span>Sep</span>
          <span>Oct</span>
          <span>Nov</span>
          <span>Dec</span>
        </div>
      </div>
    </div>
  );
}
