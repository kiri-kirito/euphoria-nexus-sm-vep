'use client';

import React, { useState, useEffect } from 'react';
import { exportOrdersToCSV } from './actions';
import { createClient } from '@/utils/supabase/client';

export default function AdminSettings() {
  const [commission, setCommission] = useState('10.0');
  const [minPayout, setMinPayout] = useState('50.00');
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string; is_active: boolean }[]>([]);
  const [newCategory, setNewCategory] = useState('');

  const supabase = createClient();

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('product_categories').select('*').order('name');
      setCategories(data || []);
    };
    fetchCategories();
  }, [supabase]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('platform_settings')
          .select('*')
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching settings:", error);
        } else if (data) {
          setCommission(data.commission_rate?.toString() || '10.0');
          setMinPayout(data.minimum_payout?.toString() || '50.00');
          setSettingsId(data.id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetching(false);
      }
    };
    fetchSettings();
  }, [supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const updates = {
        commission_rate: parseFloat(commission),
        minimum_payout: parseFloat(minPayout),
        updated_at: new Date().toISOString()
      };

      let error;
      if (settingsId) {
        const result = await supabase
          .from('platform_settings')
          .update(updates)
          .eq('id', settingsId);
        error = result.error;
      } else {
        const result = await supabase
          .from('platform_settings')
          .insert([updates])
          .select()
          .single();
        if (result.data) {
          setSettingsId(result.data.id);
        }
        error = result.error;
      }

      if (error) throw error;
      
      setToast('Platform settings saved dynamically to DB!');
    } catch (err: any) {
      console.error(err);
      setToast('Failed to save settings: ' + err.message);
    } finally {
      setIsLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    const slug = newCategory.trim().toLowerCase().replace(/\s+/g, '-');
    const { data, error } = await supabase
      .from('product_categories')
      .insert({ name: newCategory.trim(), slug })
      .select()
      .single();
    if (error) {
      setToast('Category error: ' + error.message);
    } else if (data) {
      setCategories((prev) => [...prev, data]);
      setNewCategory('');
      setToast('Category added.');
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const csv = await exportOrdersToCSV();
      if (!csv) {
        setToast('No orders found to export.');
        return;
      }
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; 
      a.download = 'euphoria-orders.csv';
      a.click();
      URL.revokeObjectURL(url);
      setToast('Export successful!');
    } catch (e) {
      setToast('Export failed.');
    } finally {
      setIsExporting(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  if (isFetching) {
    return <div className="text-white animate-pulse">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl z-50 animate-bounce">
          {toast}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Platform System Settings</h1>
          <p className="text-xs text-slate-400 mt-1">Configure transaction commission fees, payment gateways, and system rules (Live DB).</p>
        </div>
        <button 
          onClick={handleExportCSV}
          disabled={isExporting}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-lg disabled:opacity-50"
        >
          {isExporting ? 'Exporting...' : 'Export CSV (Orders)'}
        </button>
      </div>

      <form onSubmit={handleSave} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">Platform Commission Fee (%)</label>
            <input 
              type="number" 
              step="0.1"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              disabled={isLoading}
              className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-3 text-xs outline-none focus:border-blue-500 font-bold disabled:opacity-50" 
            />
            <p className="text-[11px] text-slate-500 mt-1">Commission charged on seller completed orders.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">Minimum Seller Payout (৳ Taka)</label>
            <input 
              type="number" 
              step="0.01"
              value={minPayout}
              onChange={(e) => setMinPayout(e.target.value)}
              disabled={isLoading}
              className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-3 text-xs outline-none focus:border-blue-500 font-bold disabled:opacity-50" 
            />
            <p className="text-[11px] text-slate-500 mt-1">Minimum threshold before sellers can request payout.</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-blue-600/30"
          >
            {isLoading ? 'Saving to DB...' : 'Save System Settings'}
          </button>
        </div>
      </form>

      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white">Product Categories</h2>
        <p className="text-xs text-slate-400">Manage platform-wide product categories for sellers.</p>
        <form onSubmit={handleAddCategory} className="flex gap-3">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category name"
            className="flex-1 bg-slate-900 border border-slate-800 text-white rounded-xl p-3 text-xs outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition"
          >
            Add Category
          </button>
        </form>
        <ul className="divide-y divide-slate-800">
          {categories.map((cat) => (
            <li key={cat.id} className="flex items-center justify-between py-2 text-sm text-slate-300">
              <span>{cat.name}</span>
              <span className="text-xs text-slate-500">{cat.slug}</span>
            </li>
          ))}
          {categories.length === 0 && (
            <li className="py-4 text-center text-slate-500 text-xs">No categories yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
