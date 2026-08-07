"use client";

import { useState } from "react";

const TABS = ["Store Info", "Payment Methods", "Notifications", "Security"];

function StoreInfoTab() {
  return (
    <div className="space-y-8">
      {/* Store Profile */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <h2 className="text-base font-bold text-slate-900">Store Profile</h2>
          <p className="text-sm text-slate-500 mt-1">Update your store photo and details.</p>
        </div>
        <div className="md:w-2/3 space-y-5">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-2xl font-extrabold text-primary">TH</div>
            <div>
              <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">Change Logo</button>
              <p className="text-xs text-slate-500 mt-1.5">JPG, GIF or PNG. 1MB max.</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Store Name</label>
            <input type="text" defaultValue="Tech Haven BD" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Store Description</label>
            <textarea rows={3} defaultValue="Premium electronics and tech accessories store based in Dhaka." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none" />
          </div>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Contact & Location */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <h2 className="text-base font-bold text-slate-900">Contact & Location</h2>
          <p className="text-sm text-slate-500 mt-1">Where can customers find you?</p>
        </div>
        <div className="md:w-2/3 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contact Email</label>
              <input type="email" defaultValue="contact@techhaven.bd" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
              <input type="tel" defaultValue="+880 1711 223344" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Store Address</label>
            <input type="text" defaultValue="Level 4, Multiplan Center, Elephant Road, Dhaka" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
          </div>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Business Details */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <h2 className="text-base font-bold text-slate-900">Business Details</h2>
          <p className="text-sm text-slate-500 mt-1">Categories and operating hours.</p>
        </div>
        <div className="md:w-2/3 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Store Categories</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {["Electronics", "Fashion", "Accessories", "Furniture", "Sports", "Home"].map((cat) => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked={cat === "Electronics" || cat === "Accessories"} className="w-4 h-4 rounded accent-primary" />
                  <span className="text-sm text-slate-700">{cat}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Opening Time</label>
              <input type="time" defaultValue="10:00" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Closing Time</label>
              <input type="time" defaultValue="20:00" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentTab() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <h2 className="text-base font-bold text-slate-900">Bank Account</h2>
          <p className="text-sm text-slate-500 mt-1">Payouts will be sent here.</p>
        </div>
        <div className="md:w-2/3 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bank Name</label>
            <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white text-slate-700">
              <option>Dutch-Bangla Bank (DBBL)</option>
              <option>bKash</option>
              <option>Nagad</option>
              <option>Brac Bank</option>
              <option>Islami Bank</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Account Number</label>
              <input type="text" placeholder="e.g. 1234567890" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Account Holder Name</label>
              <input type="text" placeholder="As on bank account" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Routing / Branch Code</label>
            <input type="text" placeholder="e.g. 090261234" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
          </div>
        </div>
      </div>

      <hr className="border-slate-100" />

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <h2 className="text-base font-bold text-slate-900">Mobile Banking</h2>
          <p className="text-sm text-slate-500 mt-1">Accept bKash / Nagad payments.</p>
        </div>
        <div className="md:w-2/3 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">bKash Number</label>
              <input type="tel" placeholder="+880 1XXXXXXXXX" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nagad Number</label>
              <input type="tel" placeholder="+880 1XXXXXXXXX" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="text-amber-500 text-xl">⚠️</span>
            <p className="text-sm text-amber-700">Payment verification requires NID and TIN submission. <span className="font-semibold underline cursor-pointer">Learn more</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationsTab() {
  const items = [
    { label: "New Order", desc: "Get notified when a buyer places a new order", defaultOn: true },
    { label: "Negotiation Request", desc: "When a buyer sends a bulk deal request", defaultOn: true },
    { label: "Low Stock Alert", desc: "When a product drops below 10 units", defaultOn: true },
    { label: "Order Shipped", desc: "When you mark an order as shipped", defaultOn: false },
    { label: "Payout Processed", desc: "When your weekly payout is sent", defaultOn: true },
    { label: "New Review", desc: "When a buyer leaves a review on your product", defaultOn: false },
    { label: "Promotional Emails", desc: "Tips, platform updates and feature announcements", defaultOn: false },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">Choose which notifications you want to receive.</p>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
            <div>
              <p className="text-sm font-semibold text-slate-900">{item.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
              <input type="checkbox" defaultChecked={item.defaultOn} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <h2 className="text-base font-bold text-slate-900">Change Password</h2>
          <p className="text-sm text-slate-500 mt-1">Use a strong password you don't use elsewhere.</p>
        </div>
        <div className="md:w-2/3 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Current Password</label>
            <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
            <input type="password" placeholder="Min. 8 characters" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
            <input type="password" placeholder="Repeat new password" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
          </div>
        </div>
      </div>

      <hr className="border-slate-100" />

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <h2 className="text-base font-bold text-slate-900">Two-Factor Auth</h2>
          <p className="text-sm text-slate-500 mt-1">Add an extra layer of security.</p>
        </div>
        <div className="md:w-2/3 space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📱</span>
              <div>
                <p className="text-sm font-semibold text-slate-900">SMS Verification</p>
                <p className="text-xs text-slate-500">Receive a code via +880 1711 223344</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">Enabled</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔐</span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Authenticator App</p>
                <p className="text-xs text-slate-500">Use Google or Microsoft Authenticator</p>
              </div>
            </div>
            <button className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-200 text-slate-600 hover:bg-primary hover:text-white transition-colors">Enable</button>
          </div>
        </div>
      </div>

      <hr className="border-slate-100" />

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <h2 className="text-base font-bold text-red-600">Danger Zone</h2>
          <p className="text-sm text-slate-500 mt-1">Irreversible account actions.</p>
        </div>
        <div className="md:w-2/3">
          <div className="p-4 border border-red-200 bg-red-50 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-red-700">Deactivate Store</p>
              <p className="text-xs text-red-500 mt-0.5">Your products will be hidden from buyers.</p>
            </div>
            <button className="px-4 py-2 border border-red-300 text-red-600 text-sm font-bold rounded-lg hover:bg-red-100 transition-colors">Deactivate</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState(0);

  const TAB_CONTENT = [<StoreInfoTab key="store" />, <PaymentTab key="payment" />, <NotificationsTab key="notif" />, <SecurityTab key="security" />];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Store Settings</h1>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                activeTab === i
                  ? "text-primary border-primary"
                  : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 md:p-8">
          {TAB_CONTENT[activeTab]}
        </div>

        {/* Save Button */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
          <button className="w-full md:w-auto px-8 py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors shadow-sm">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
