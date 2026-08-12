"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";

export default function BecomeSellerPage() {
  const { user, profile } = useAuthStore();
  const supabase = createClient();
  const [storeName, setStoreName] = useState("");
  const [ownerName, setOwnerName] = useState(profile?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      window.location.href = "/register";
      return;
    }
    if (!storeName.trim() || !phone.trim() || !category) {
      setError("Please fill all required fields.");
      return;
    }

    setSubmitting(true);
    setError("");

    const settings = {
      application: {
        owner_name: ownerName,
        email,
        category,
        location,
        submitted_at: new Date().toISOString(),
      },
      categories: [category],
      address: location,
    };

    const { data: existing } = await supabase.from("stores").select("user_id").eq("user_id", user.id).maybeSingle();

    let dbError;
    if (existing) {
      ({ error: dbError } = await supabase
        .from("stores")
        .update({
          store_name: storeName,
          description,
          phone,
          settings,
          is_approved: false,
        })
        .eq("user_id", user.id));
    } else {
      ({ error: dbError } = await supabase.from("stores").insert({
        user_id: user.id,
        store_name: storeName,
        description,
        phone,
        settings,
        is_approved: false,
      }));
    }

    setSubmitting(false);
    if (dbError) {
      setError(dbError.message);
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border p-10 max-w-md text-center shadow-sm">
          <div className="text-4xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted</h1>
          <p className="text-slate-600 mb-6">
            Our team will review your store application. You will be notified once approved.
          </p>
          <Link href="/" className="text-primary font-bold hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <img src="/logo-brand.png" alt="Euphoria Nexus" className="h-16 w-auto" />
            <span className="text-xl font-bold text-slate-900">Euphoria Nexus</span>
          </Link>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3">Become a Seller</h1>
          <p className="text-slate-500 text-lg max-w-md mx-auto">
            Join local sellers. Reach more buyers, negotiate bulk deals, and grow your business.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-5">
          <h2 className="text-lg font-bold text-slate-900">Store Information</h2>
          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Store Name *</label>
              <input
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Your Name *</label>
              <input
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Business Email *</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number *</label>
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Product Category *</label>
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white"
            >
              <option value="">Select a category</option>
              <option>Electronics</option>
              <option>Fashion</option>
              <option>Home</option>
              <option>Sports</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Store Location *</label>
            <input
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Mirpur, Dhaka"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Describe your business</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-bold disabled:opacity-50"
          >
            {submitting ? "Submitting..." : user ? "Submit Application" : "Sign in to Apply"}
          </button>
        </form>
      </div>
    </div>
  );
}
