"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface StockRequest {
  id: number;
  sellerName: string;
  product: string;
  quantity: number;
  targetPrice: number;
  status: string;
}

export default function BlindBiddingPage() {
  const [requests, setRequests] = useState<StockRequest[]>([
    {
      id: 1,
      sellerName: "Anonymous Seller",
      product: "Mechanical Keyboard Keycaps (Blue/White)",
      quantity: 50,
      targetPrice: 2000,
      status: "Open",
    },
    {
      id: 2,
      sellerName: "Anonymous Seller",
      product: "Logitech MX Master 3S",
      quantity: 15,
      targetPrice: 8500,
      status: "Open",
    },
  ]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [bidAmounts, setBidAmounts] = useState<Record<number, number>>({});

  useEffect(() => {
    const newSocket = io("http://localhost:3001/bidding", {
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("Connected to bidding namespace:", newSocket.id);
    });

    newSocket.on("receive_stock_request", (data: StockRequest) => {
      setRequests((prev) => [data, ...prev]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleBidSubmit = (id: number) => {
    if (socket && bidAmounts[id]) {
      socket.emit("submit_bid", { requestId: id, bidPrice: bidAmounts[id] });
      alert(`Bid of ৳${bidAmounts[id]} submitted securely!`);
      // Hide or update UI to show bid was placed
      setRequests(prev => prev.map(req => req.id === id ? { ...req, status: "Bid Placed" } : req));
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inter-Seller Stock Exchange</h1>
          <p className="text-slate-500 text-sm mt-1">Source products anonymously from other sellers</p>
        </div>
        <button className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg transition-all">
          + Post Stock Request
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {requests.map((req) => (
          <div key={req.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{req.product}</h3>
                <p className="text-sm text-slate-500">Requested by: {req.sellerName}</p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                req.status === 'Open' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {req.status}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between mb-6">
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Quantity Needed</p>
                <p className="font-bold text-slate-900">{req.quantity} units</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Target Price / unit</p>
                <p className="font-bold text-slate-900">৳{req.targetPrice.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-auto">
              {req.status === 'Open' ? (
                <div className="flex gap-3">
                  <input 
                    type="number" 
                    placeholder="Your Bid Price (৳)"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    onChange={(e) => setBidAmounts({...bidAmounts, [req.id]: Number(e.target.value)})}
                  />
                  <button 
                    onClick={() => handleBidSubmit(req.id)}
                    className="bg-slate-900 hover:bg-black text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm whitespace-nowrap"
                  >
                    Submit Blind Bid
                  </button>
                </div>
              ) : (
                <div className="text-center p-3 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium">
                  Bid securely submitted. Awaiting response.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
