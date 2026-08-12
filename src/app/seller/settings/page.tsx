"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";

const TABS = ["Store Info", "Payment Methods", "Notifications", "Security"];
const CATEGORIES = ["Electronics", "Fashion", "Accessories", "Furniture", "Sports", "Home"];

type StoreSettings = {
  contact_email?: string;
  address?: string;
  categories?: string[];
  open_time?: string;
  close_time?: string;
  same_day_delivery?: boolean;
  bank_name?: string;
  account_number?: string;
  account_holder?: string;
  routing_code?: string;
  bkash?: string;
  nagad?: string;
  notifications?: Record<string, boolean>;
  lat?: number;
  lng?: number;
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [settings, setSettings] = useState<StoreSettings>({
    categories: ["Electronics"],
    open_time: "10:00",
    close_time: "20:00",
    same_day_delivery: false,
    notifications: {},
  });
  const supabase = createClient();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user?.id) return;
    loadStore(user.id);
  }, [user?.id]);

  async function loadStore(userId: string) {
    setLoading(true);
    const { data } = await supabase.from("stores").select("*").eq("user_id", userId).maybeSingle();
    if (data) {
      setStoreName(data.store_name || "");
      setDescription(data.description || "");
      setPhone(data.phone || "");
      setSettings({ ...(data.settings || {}), same_day_delivery: data.settings?.same_day_delivery ?? false });
    }
    setLoading(false);
  }

  const updateSetting = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const toggleCategory = (cat: string) => {
    const cats = settings.categories || [];
    updateSetting(
      "categories",
      cats.includes(cat) ? cats.filter((c) => c !== cat) : [...cats, cat]
    );
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    const payload = {
      store_name: storeName,
      description,
      phone,
      settings,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("stores").update(payload).eq("user_id", user.id);
    setSaving(false);
    if (error) {
      setToast("Save failed: " + error.message);
    } else {
      setToast("Store settings saved successfully!");
    }
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) return <div className="p-8 text-slate-500 animate-pulse">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}
      <h1 className="text-2xl font-bold text-slate-900">Store Settings</h1>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                activeTab === i ? "text-primary border-primary" : "text-slate-500 border-transparent hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8">
          {activeTab === 0 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Store Name</label>
                <input
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Store Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contact Email</label>
                  <input
                    type="email"
                    value={settings.contact_email || user?.email || ""}
                    onChange={(e) => updateSetting("contact_email", e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Store Address</label>
                <input
                  value={settings.address || ""}
                  onChange={(e) => updateSetting("address", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.same_day_delivery ?? false}
                  onChange={(e) => updateSetting("same_day_delivery", e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm font-semibold text-slate-700">Offer same-day local delivery</span>
              </label>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Store Categories</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {CATEGORIES.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(settings.categories || []).includes(cat)}
                        onChange={() => toggleCategory(cat)}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-sm text-slate-700">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Opening Time</label>
                  <input
                    type="time"
                    value={settings.open_time || "10:00"}
                    onChange={(e) => updateSetting("open_time", e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Closing Time</label>
                  <input
                    type="time"
                    value={settings.close_time || "20:00"}
                    onChange={(e) => updateSetting("close_time", e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bank Name</label>
                <select
                  value={settings.bank_name || "DBBL"}
                  onChange={(e) => updateSetting("bank_name", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white"
                >
                  {["Dutch-Bangla Bank (DBBL)", "bKash", "Nagad", "Brac Bank", "Islami Bank"].map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Account Number</label>
                  <input
                    value={settings.account_number || ""}
                    onChange={(e) => updateSetting("account_number", e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Account Holder</label>
                  <input
                    value={settings.account_holder || ""}
                    onChange={(e) => updateSetting("account_holder", e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">bKash Number</label>
                  <input
                    value={settings.bkash || ""}
                    onChange={(e) => updateSetting("bkash", e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nagad Number</label>
                  <input
                    value={settings.nagad || ""}
                    onChange={(e) => updateSetting("nagad", e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 2 && (
            <div className="space-y-2">
              {[
                { key: "new_order", label: "New Order", desc: "When a buyer places a new order" },
                { key: "negotiation", label: "Negotiation Request", desc: "Bulk deal requests" },
                { key: "low_stock", label: "Low Stock Alert", desc: "Product below 10 units" },
                { key: "payout", label: "Payout Processed", desc: "Weekly payout sent" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications?.[item.key] !== false}
                    onChange={(e) =>
                      updateSetting("notifications", {
                        ...(settings.notifications || {}),
                        [item.key]: e.target.checked,
                      })
                    }
                    className="w-5 h-5 accent-primary"
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === 3 && (
            <p className="text-sm text-slate-500">
              Password and 2FA are managed through your account profile. Contact admin to deactivate your store.
            </p>
          )}
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
