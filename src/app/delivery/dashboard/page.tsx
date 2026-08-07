import Link from 'next/link';

export default function DeliveryDashboard() {
  const deliveries = [
    { id: 'ORD-8923', address: '123 Main St, Apt 4B', distance: '1.2 mi' },
    { id: 'ORD-8924', address: '456 Oak Ave, Floor 2', distance: '3.4 mi' },
  ];

  return (
    <div className="p-4 space-y-6">
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-500 mb-1">Earnings Today</h2>
        <div className="text-3xl font-extrabold text-gray-900">$84.50</div>
        <p className="text-xs font-medium text-green-600 mt-2 bg-green-50 inline-block px-2 py-1 rounded-md">
          +12% from yesterday
        </p>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Assigned Deliveries</h2>
          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">2 Active</span>
        </div>
        
        <div className="space-y-4">
          {deliveries.map((delivery) => (
            <div key={delivery.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-gray-900">{delivery.id}</h3>
                <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">Ready</span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-base">📍</span> {delivery.address}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="text-base">🚗</span> {delivery.distance}
                </div>
              </div>
              
              <Link 
                href={`/delivery/tasks/${delivery.id.split('-')[1]}`} 
                className="block w-full py-2.5 bg-blue-600 text-white text-center rounded-xl font-semibold text-sm hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm"
              >
                View Task
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
