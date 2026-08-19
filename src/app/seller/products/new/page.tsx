"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";
import { useCurrentUser } from "@/hooks/useCurrentUser";

// Working, reliable image presets by category/keywords
const PRESET_IMAGE_MAP: Record<string, string[]> = {
  Electronics: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop&q=80", // headphones
    "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=600&fit=crop&q=80", // laptop
    "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=600&fit=crop&q=80", // phone
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=600&fit=crop&q=80", // smartwatch
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=600&fit=crop&q=80", // keyboard
    "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=600&fit=crop&q=80", // mouse
  ],
  Fashion: [
    "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=600&h=600&fit=crop&q=80", // shirt
    "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop&q=80", // jeans
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=600&fit=crop&q=80", // t-shirt
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop&q=80", // jacket
  ],
  Home: [
    "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600&h=600&fit=crop&q=80", // chair
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop&q=80", // sofa
    "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&h=600&fit=crop&q=80", // table
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&h=600&fit=crop&q=80", // lamp
  ],
  Sports: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop&q=80", // red shoes
    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&h=600&fit=crop&q=80", // fitness
    "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&h=600&fit=crop&q=80", // badminton
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=600&fit=crop&q=80", // gym
  ],
  Food: [
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=600&fit=crop&q=80", // burger
    "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&h=600&fit=crop&q=80", // snacks
    "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&h=600&fit=crop&q=80", // tea
    "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&h=600&fit=crop&q=80", // oil/honey
  ],
  Accessories: [
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop&q=80", // bag
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&q=80", // watch
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop&q=80", // sunglasses
    "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=600&fit=crop&q=80", // wallet
  ],
};

const KEYWORD_IMAGE_MAP: Record<string, string> = {
  headphone: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop&q=80",
  laptop: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=600&fit=crop&q=80",
  phone: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=600&fit=crop&q=80",
  iphone: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=600&fit=crop&q=80",
  keyboard: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=600&fit=crop&q=80",
  mouse: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=600&fit=crop&q=80",
  watch: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&q=80",
  shoe: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop&q=80",
  shirt: "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=600&h=600&fit=crop&q=80",
  tea: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&h=600&fit=crop&q=80",
  chair: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600&h=600&fit=crop&q=80",
  bag: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop&q=80",
  oil: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&h=600&fit=crop&q=80",
};

export default function NewProductPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { userId } = useCurrentUser();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "Electronics",
    description: "",
    price: "",
    comparePrice: "",
    quantity: "",
    moq: "1",
    status: "active",
    selectedImage: "",
  });

  const [imageSuggestions, setImageSuggestions] = useState<string[]>([]);
  const [imageUploadMethod, setImageUploadMethod] = useState<"suggest" | "upload" | "url">("suggest");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate suggestions based on category and typed name
  useEffect(() => {
    const nameLower = formData.name.toLowerCase();
    const suggestions: string[] = [];

    // Check keyword matches
    for (const [kw, url] of Object.entries(KEYWORD_IMAGE_MAP)) {
      if (nameLower.includes(kw) && !suggestions.includes(url)) {
        suggestions.push(url);
      }
    }

    // Category presets
    const catPresets = PRESET_IMAGE_MAP[formData.category] || PRESET_IMAGE_MAP.Electronics;
    for (const url of catPresets) {
      if (!suggestions.includes(url)) {
        suggestions.push(url);
      }
    }

    const finalSuggestions = suggestions.slice(0, 6);
    setImageSuggestions(finalSuggestions);

    if (!formData.selectedImage && finalSuggestions.length > 0) {
      setFormData((prev) => ({ ...prev, selectedImage: finalSuggestions[0] }));
      setImagePreviewUrl(finalSuggestions[0]);
    }
  }, [formData.name, formData.category]);

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert("Image file size must be under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setFormData((prev) => ({ ...prev, selectedImage: base64 }));
          setImagePreviewUrl(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle URL change
  const handleUrlChange = (url: string) => {
    setFormData((prev) => ({ ...prev, selectedImage: url }));
    setImagePreviewUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    let sellerId = user?.id || userId;

    if (!sellerId) {
      const { data: sellers } = await supabase.from("users").select("id").eq("role", "seller").limit(1);
      sellerId = sellers?.[0]?.id;
    }

    if (!sellerId) {
      alert("You must be logged in as a seller to add a product.");
      return;
    }

    setLoading(true);

    let finalImageUrl =
      formData.selectedImage ||
      imageSuggestions[0] ||
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop&q=80";

    // If file input has a file, attempt Supabase Storage upload
    if (fileInputRef.current?.files?.[0]) {
      const file = fileInputRef.current.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `products/${sellerId}/${fileName}`;

      try {
        const { error: uploadError } = await supabase.storage.from("product-images").upload(filePath, file, {
          upsert: true,
        });

        if (!uploadError) {
          const { data: pubUrl } = supabase.storage.from("product-images").getPublicUrl(filePath);
          if (pubUrl?.publicUrl) {
            finalImageUrl = pubUrl.publicUrl;
          }
        }
      } catch {
        /* Base64 Data URL is kept as fallback */
      }
    }

    try {
      const priceNum = parseFloat(formData.price) || 0;
      const comparePriceNum = parseFloat(formData.comparePrice) || null;
      const qtyNum = parseInt(formData.quantity, 10) || 0;
      const moqNum = parseInt(formData.moq, 10) || 1;
      const statusLower = formData.status.toLowerCase() === "draft" ? "draft" : "active";

      const { data, error } = await supabase.from("products").insert({
        seller_id: sellerId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: priceNum,
        compare_price: comparePriceNum,
        quantity: qtyNum,
        category: formData.category,
        moq: moqNum,
        status: statusLower,
        images: [finalImageUrl],
      }).select("id").single();

      if (error) throw error;

      router.push("/seller/products?success=1");
    } catch (err: any) {
      console.error("Product insert error:", err);
      alert("Error adding product: " + (err?.message || "Database insert failed"));
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/seller/products" className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Add New Product</h1>
            <p className="text-slate-500 text-xs mt-0.5">List a new product for wholesale and retail buyers</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/seller/products")}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-primary hover:bg-primary-dark transition shadow-md shadow-primary/30 disabled:opacity-50"
          >
            {loading ? "Publishing..." : "Publish to Store 🚀"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Product Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-slate-900 text-base">General Information</h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Product Title *</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="e.g. Wireless Noise-Cancelling Over-Ear Headphones"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Home">Home & Furniture</option>
                  <option value="Food">Food & Grocery</option>
                  <option value="Sports">Sports & Fitness</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Industrial">Industrial & Tools</option>
                  <option value="Health">Health & Beauty</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                >
                  <option value="active">Active (Available for purchase)</option>
                  <option value="draft">Draft (Hidden from store)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Product Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Describe key features, materials, warranty, and specifications..."
              />
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-slate-900 text-base">Pricing & Inventory</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Unit Price (৳) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">৳</span>
                  <input
                    required
                    type="number"
                    min={1}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full pl-7 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Compare-at Price (৳)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">৳</span>
                  <input
                    type="number"
                    min={1}
                    value={formData.comparePrice}
                    onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                    className="w-full pl-7 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Available Stock *</label>
                <input
                  required
                  type="number"
                  min={0}
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="e.g. 50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Minimum Order Quantity (MOQ) for Bulk Deals</label>
              <input
                required
                type="number"
                min={1}
                value={formData.moq}
                onChange={(e) => setFormData({ ...formData, moq: e.target.value })}
                className="w-full sm:w-1/2 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="1"
              />
              <p className="text-[11px] text-slate-400 mt-1">Buyers ordering this quantity or higher can initiate bulk negotiations.</p>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Image Manager */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-slate-900 text-base">Product Image</h2>

            {/* Image Preview Box */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center">
              {imagePreviewUrl ? (
                <img src={imagePreviewUrl} alt="Product Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <span className="text-3xl block mb-1">🖼️</span>
                  <p className="text-xs text-slate-400 font-semibold">No Image Selected</p>
                </div>
              )}
            </div>

            {/* Method Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setImageUploadMethod("suggest")}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition ${
                  imageUploadMethod === "suggest" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
                }`}
              >
                Suggested
              </button>
              <button
                type="button"
                onClick={() => setImageUploadMethod("upload")}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition ${
                  imageUploadMethod === "upload" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setImageUploadMethod("url")}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition ${
                  imageUploadMethod === "url" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
                }`}
              >
                Paste URL
              </button>
            </div>

            {/* 1. Suggested Thumbnails */}
            {imageUploadMethod === "suggest" && (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-400 font-semibold">Click a thumbnail to use as product photo:</p>
                <div className="grid grid-cols-3 gap-2">
                  {imageSuggestions.map((imgUrl, i) => (
                    <div
                      key={imgUrl + i}
                      onClick={() => {
                        setFormData({ ...formData, selectedImage: imgUrl });
                        setImagePreviewUrl(imgUrl);
                      }}
                      className={`aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition hover:scale-105 ${
                        formData.selectedImage === imgUrl ? "border-primary ring-2 ring-primary/20" : "border-transparent"
                      }`}
                    >
                      <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. File Upload from Device */}
            {imageUploadMethod === "upload" && (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer"
                />
                <p className="text-[11px] text-slate-400">Supports PNG, JPG, JPEG, WEBP up to 5MB.</p>
              </div>
            )}

            {/* 3. Custom Image URL */}
            {imageUploadMethod === "url" && (
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-600">Online Image Address (URL)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.selectedImage.startsWith("data:") ? "" : formData.selectedImage}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <p className="text-[10px] text-slate-400">Paste any direct image URL from web.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
