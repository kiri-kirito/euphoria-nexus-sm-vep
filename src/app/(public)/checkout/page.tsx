'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { createClient } from '@/utils/supabase/client';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const supabase = createClient();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zone, setZone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [trxId, setTrxId] = useState('');
  const [deliveryOption, setDeliveryOption] = useState(60);

  useEffect(() => {
    setMounted(true);
    // If user is empty but auth is checked, prefill logic could go here
  }, []);

  if (!mounted) return null;

  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  const subtotal = getTotal();
  const total = subtotal + deliveryOption;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to place an order.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Insert into orders table
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          buyer_id: user?.id || null,
          total_amount: total,
          status: 'pending',
          shipping_address: `${address}, ${city}, ${zone}`
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Insert order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        seller_id: item.sellerId || null,
        quantity: item.quantity,
        unit_price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Create initial delivery task
      try {
        await supabase
          .from('deliveries')
          .insert({
            order_id: order.id,
            pickup_address: 'Local Seller Hub',
            delivery_address: `${address}, ${city}, ${zone}`,
            status: 'assigned'
          });
      } catch (delErr) {
        console.warn('Delivery assignment warning:', delErr);
      }

      // 3. Clear cart and redirect
      clearCart();
      router.push('/checkout/success');
      
    } catch (err: any) {
      setError(err.message || 'Something went wrong while placing your order.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <form onSubmit={handlePlaceOrder} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Checkout</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Forms */}
          <div className="lg:w-2/3 space-y-8">
            
            {/* 1. Shipping Address */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-sm flex items-center justify-center">1</span>
                Shipping Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Full Name</label>
                  <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all" placeholder="John Doe" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Phone</label>
                  <input required type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all" placeholder="+880 1XXX-XXXXXX" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Full Address</label>
                  <textarea required value={address} onChange={e => setAddress(e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all" placeholder="House 123, Road 4, Block A..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">City</label>
                  <input required type="text" value={city} onChange={e => setCity(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all" placeholder="Dhaka" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Zone</label>
                  <select required value={zone} onChange={e => setZone(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all bg-white">
                    <option value="">Select Zone</option>
                    <option value="Gulshan">Gulshan</option>
                    <option value="Banani">Banani</option>
                    <option value="Dhanmondi">Dhanmondi</option>
                    <option value="Mirpur">Mirpur</option>
                    <option value="Uttara">Uttara</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Delivery Options */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-sm flex items-center justify-center">2</span>
                Delivery Options
              </h2>
              <div className="space-y-4">
                <label className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                  <input type="radio" name="delivery" checked={deliveryOption === 60} onChange={() => setDeliveryOption(60)} className="w-4 h-4 text-slate-900 focus:ring-slate-900" />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Standard Delivery (3-5 days)</p>
                    <p className="text-sm text-slate-500">Delivered within 3 to 5 business days.</p>
                  </div>
                  <span className="font-bold text-slate-900">৳60</span>
                </label>
                <label className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                  <input type="radio" name="delivery" checked={deliveryOption === 120} onChange={() => setDeliveryOption(120)} className="w-4 h-4 text-slate-900 focus:ring-slate-900" />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Express Delivery (24 hrs)</p>
                    <p className="text-sm text-slate-500">Delivered within 24 hours.</p>
                  </div>
                  <span className="font-bold text-slate-900">৳120</span>
                </label>
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-sm flex items-center justify-center">3</span>
                Payment Method
              </h2>
              <div className="space-y-4">
                <label className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                  <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-4 h-4 text-slate-900 focus:ring-slate-900" />
                  <div className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Cash on Delivery (COD)</p>
                  </div>
                </label>

                {/* Selected bKash */}
                <div className={`border-2 rounded-xl overflow-hidden shadow-sm transition-all ${paymentMethod === 'bkash' ? 'border-pink-500' : 'border-slate-200'}`}>
                  <label className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${paymentMethod === 'bkash' ? 'bg-pink-50/50' : 'hover:bg-slate-50'}`}>
                    <input type="radio" name="payment" checked={paymentMethod === 'bkash'} onChange={() => setPaymentMethod('bkash')} className="w-4 h-4 text-pink-600 focus:ring-pink-500" />
                    <div className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-slate-100 shadow-sm text-pink-600 font-bold text-xs">
                      bKash
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">bKash / Nagad</p>
                    </div>
                  </label>
                  {paymentMethod === 'bkash' && (
                    <div className="px-4 pb-5 pt-2 bg-pink-50/50 border-t border-pink-100 space-y-4">
                      <p className="text-sm text-slate-600">Please send ৳{total.toLocaleString()} to our bKash merchant number <strong>01712345678</strong> and enter the Transaction ID below.</p>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Transaction ID</label>
                        <input required type="text" value={trxId} onChange={e => setTrxId(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all bg-white" placeholder="e.g. 9F8G7H6" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Right: Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
              
              {/* Mini Cart Items */}
              <div className="space-y-4 mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4">
                    {item.image && <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg border border-slate-100" />}
                    <div className="flex-1 text-sm">
                      <h4 className="font-medium text-slate-900 line-clamp-1">{item.name}</h4>
                      <p className="text-slate-500 mt-0.5">Qty: {item.quantity}</p>
                      <p className="font-semibold text-slate-900 mt-1">৳{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 text-sm text-slate-600 mb-6 border-t border-slate-100 pt-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-medium text-slate-900">৳{deliveryOption}</span>
                </div>
                <div className="border-t border-slate-100 pt-4 mt-4 flex justify-between text-base">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="font-bold text-slate-900 text-lg">৳{total.toLocaleString()}</span>
                </div>
              </div>

              <button disabled={loading} type="submit" className="w-full flex justify-center items-center py-3.5 px-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50">
                {loading ? 'Processing...' : 'Place Order'}
              </button>
              
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
