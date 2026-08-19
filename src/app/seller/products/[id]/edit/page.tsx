"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const PRESET_IMAGE_MAP: Record<string, string[]> = {
  Electronics: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=600&fit=crop&q=80",
  ],
  Fashion: [
    "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=600&fit=crop&q=80",
  ],
  Home: [
    "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop&q=80",
  ],
  Sports: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&h=600&fit=crop&q=80",
  ],
  Food: [
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&h=600&fit=crop&q=80",
  ],
  Accessories: [
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop&q=80",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&q=80",
  ],
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;
  const { user } = useAuthStore();
  const { userId } = useCurrentUser();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
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
  const supabase = createClient();

  useEffect(() => {
    if (!productId) return;

    async function loadProduct() {
      setFetching(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .maybeSingle();

      if (error || !data) {
        alert("Could not load product details.");
        router.push("/seller/products");
        return;
      }

      let img = "";
      if (Array.isArray(data.images)) {
        img = data.images[0] || "";
      } else if (typeof data.images === "string") {
        try {
          const parsed = JSON.parse(data.images);
          img = Array.isArray(parsed) ? parsed[0] || "" : data.images;
        } catch {
          img = data.images;
        }
      }

      setFormData({
        name: data.name || "",
        category: data.category || "Electronics",
        description: data.description || "",
        price: data.price ? String(data.price) : "",
        comparePrice: data.compare_price ? String(data.compare_price) : "",
        quantity: data.quantity != null ? String(data.quantity) : "",
        moq: data.moq ? String(data.moq) : "1",
        status: data.status?.toLowerCase() === "draft" ? "draft" : "active",
        selectedImage: img,
      });
      setImagePreviewUrl(img);
      setFetching(false);
    }

    loadProduct();
  }, [productId, router]);

  // Update image suggestions on category change
  useEffect(() => {
    const catPresets = PRESET_IMAGE_MAP[formData.category] || PRESET_IMAGE_MAP.Electronics;
    setImageSuggestions(catPresets);
  }, [formData.category]);

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

  const handleUrlChange = (url: string) => {
    setFormData((prev) => ({ ...prev, selectedImage: url }));
    setImagePreviewUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let sellerId = user?.id || userId;
    let finalImageUrl = formData.selectedImage;

    if (fileInputRef.current?.files?.[0]) {
      const file = fileInputRef.current.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `products/${sellerId || "seller"}/${fileName}`;

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
        /* Base64 fallback */
      }
    }

    try {
      const { error } = await supabase
        .from("products")
        .update({
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: parseFloat(formData.price) || 0,
          compare_price: parseFloat(formData.comparePrice) || null,
          quantity: parseInt(formData.quantity, 10) || 0,
          category: formData.category,
          moq: parseInt(formData.moq, 10) || 1,
          status: formData.status.toLowerCase() === "draft" ? "draft" : "active",
          images: [finalImageUrl],
        })
        .eq("id", productId);

      if (error) throw error;

      router.push("/seller/products?updated=1");
    } catch (err: any) {
      console.error("Product update error:", err);
      alert("Error updating product: " + (err?.message || "Failed to update"));
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-slate-500 font-semibold animate-pulse">Loading product details...</p>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-slate-900">Edit Product</h1>
            <p className="text-slate-500 text-xs mt-0.5">Update catalog details, pricing, stock, and photos</p>
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
            {loading ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Product Info */}
        <div className="lg:col-span-2 space-y-6">
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
                  <option value="active">Active (Available in store)</option>
                  <option value="draft">Draft (Hidden)</option>
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
              />
            </div>
          </div>

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
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Minimum Order Quantity (MOQ)</label>
              <input
                required
                type="number"
                min={1}
                value={formData.moq}
                onChange={(e) => setFormData({ ...formData, moq: e.target.value })}
                className="w-full sm:w-1/2 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </div>

        {/* Right 1 Col: Image Manager */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-slate-900 text-base">Product Image</h2>

            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center">
              {imagePreviewUrl ? (
                <img src={imagePreviewUrl} alt="Product Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <span className="text-3xl block mb-1">🖼️</span>
                  <p className="text-xs text-slate-400 font-semibold">No Image</p>
                </div>
              )}
            </div>

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

            {imageUploadMethod === "suggest" && (
              <div className="grid grid-cols-2 gap-2">
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
            )}

            {imageUploadMethod === "upload" && (
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer"
                />
              </div>
            )}

            {imageUploadMethod === "url" && (
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-600">Online Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.selectedImage.startsWith("data:") ? "" : formData.selectedImage}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
