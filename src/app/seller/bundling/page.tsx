"use client";

import { useState } from "react";

export default function BundlingPage() {
  const [activeTab, setActiveTab] = useState("explore");

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cross-Seller Bundling</h1>
          <p className="text-slate-500 text-sm mt-1">Collaborate with other sellers to create combined product bundles.</p>
        </div>
        <button className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg transition-all">
          + Create New Bundle Proposal
        </button>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab("explore")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === "explore" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          Explore Proposals
        </button>
        <button 
          onClick={() => setActiveTab("my-bundles")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === "my-bundles" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          My Active Bundles
        </button>
      </div>

      {activeTab === "explore" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">AT</div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">AudioTech</h3>
                <p className="text-xs text-slate-500">Looking for: Keyboards / Mice</p>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
              <h4 className="font-semibold text-slate-800 text-sm mb-2">Proposed Bundle: "The Ultimate WFH Setup"</h4>
              <p className="text-xs text-slate-600 mb-2">I will provide: <b>Wireless Noise-Cancelling Headphones</b></p>
              <p className="text-xs text-slate-600">Profit Split: <b>50/50</b> based on final discounted price.</p>
            </div>
            <button className="w-full bg-slate-900 hover:bg-black text-white font-semibold py-2 rounded-lg transition-colors text-sm">
              Propose Partnership
            </button>
          </div>
        </div>
      )}

      {activeTab === "my-bundles" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Active Bundles</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">You aren't part of any cross-seller bundles yet. Explore proposals or create a new one to increase sales.</p>
          </div>
        </div>
      )}
    </div>
  );
}
