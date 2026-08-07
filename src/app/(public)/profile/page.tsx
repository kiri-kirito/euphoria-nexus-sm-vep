import React from 'react';

export default function ProfilePage() {
  const orders = [
    { id: 'ORD-2026-8091', date: 'Aug 01, 2026', total: '$4,500.00', status: 'Delivered', items: 'Premium Copper Wire (1000 kg)' },
    { id: 'ORD-2026-7842', date: 'Jul 15, 2026', total: '$12,500.00', status: 'In Transit', items: 'Industrial Grade Steel Beams (10 tons), Heavy Duty Cogs (20 units)' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
      <div className="flex flex-col gap-8">
        {/* Personal Info Section */}
        <section className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Personal Information</h2>
            <button className="text-blue-600 text-sm font-medium hover:underline">Edit</button>
          </div>
          
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" defaultValue="John Doe" className="w-full border rounded-md p-2 bg-gray-50 text-gray-800" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" defaultValue="john.doe@example.com" className="w-full border rounded-md p-2 bg-gray-50 text-gray-800" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input type="text" defaultValue="Acme Industries" className="w-full border rounded-md p-2 bg-gray-50 text-gray-800" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="tel" defaultValue="+1 (555) 123-4567" className="w-full border rounded-md p-2 bg-gray-50 text-gray-800" readOnly />
            </div>
          </form>
        </section>

        {/* Order History Section */}
        <section className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-6">Order History</h2>
          
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4 flex flex-col md:flex-row justify-between gap-4 hover:bg-gray-50 transition">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">{order.id}</span>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">Placed on {order.date}</div>
                  <div className="text-sm text-gray-700 mt-2 line-clamp-1">{order.items}</div>
                </div>
                <div className="flex flex-col md:items-end justify-between">
                  <div className="font-bold text-lg">{order.total}</div>
                  <button className="text-blue-600 text-sm font-medium hover:underline mt-2 md:mt-0">View Details</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
