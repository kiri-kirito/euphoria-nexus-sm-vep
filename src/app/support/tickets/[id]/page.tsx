import React from 'react';

export default function TicketDetails({ params }: { params: { id: string } }) {
  const messages = [
    { id: 1, sender: 'User', text: 'Hi, I received my order today but one of the items is missing.', time: '10:00 AM' },
    { id: 2, sender: 'Support', text: 'Hello Alice, I am sorry to hear that. Can you please confirm which item is missing?', time: '10:05 AM' },
    { id: 3, sender: 'User', text: 'The "Pro Wireless Mouse" is not in the box.', time: '10:12 AM' },
  ];

  return (
    <div className="flex h-full">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white border-r border-slate-200">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Ticket #{params.id}</h2>
            <p className="text-sm text-slate-500">Missing item in order</p>
          </div>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">Open</span>
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'Support' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[75%] rounded-lg p-4 ${
                msg.sender === 'Support' 
                  ? 'bg-teal-600 text-white rounded-tr-none' 
                  : 'bg-slate-100 text-slate-800 rounded-tl-none'
              }`}>
                <p>{msg.text}</p>
              </div>
              <span className="text-xs text-slate-400 mt-1">{msg.sender} • {msg.time}</span>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <form className="flex space-x-4">
            <input 
              type="text" 
              placeholder="Type your message..." 
              className="flex-1 border border-slate-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <button 
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Right Sidebar - Order Details */}
      <div className="w-1/3 bg-slate-50 p-6 overflow-y-auto">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Order Details</h3>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-500">Order #</span>
            <span className="font-semibold text-slate-800">ORD-98234</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-500">Status</span>
            <span className="text-sm font-medium text-blue-600">Delivered</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Date</span>
            <span className="text-sm text-slate-800">Oct 24, 2023</span>
          </div>
        </div>

        <h4 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wider">Items</h4>
        <div className="space-y-3">
          <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center space-x-3">
            <div className="w-12 h-12 bg-slate-100 rounded flex-shrink-0 flex items-center justify-center text-slate-400 text-xs">
              Img
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800 line-clamp-1">Pro Mechanical Keyboard</p>
              <p className="text-xs text-slate-500">Qty: 1</p>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center space-x-3">
            <div className="w-12 h-12 bg-slate-100 rounded flex-shrink-0 flex items-center justify-center text-slate-400 text-xs">
              Img
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800 line-clamp-1">Pro Wireless Mouse</p>
              <p className="text-xs text-slate-500">Qty: 1 <span className="text-red-500 font-medium">(Reported Missing)</span></p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button className="w-full bg-white border border-slate-300 text-slate-700 font-medium py-2 px-4 rounded-md hover:bg-slate-50 transition-colors mb-3">
            View Full Order
          </button>
          <button className="w-full bg-slate-800 text-white font-medium py-2 px-4 rounded-md hover:bg-slate-900 transition-colors">
            Process Refund
          </button>
        </div>
      </div>
    </div>
  );
}
