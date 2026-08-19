'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { createClient } from '@/utils/supabase/client';
import { isValidUuid, resolveProductImage } from '@/utils/productImages';
import { calcShippingFee, countDeliveryUnits, shippingLabel } from '@/utils/deliveryFee';
import { processBundleOrderAfterCheckout } from '@/utils/bundlePayouts';
import { configureLocalDelivery } from '@/utils/localDelivery';
import { recordCommissionLogs } from '@/utils/commissionLogs';
import { createNotification } from '@/utils/localDelivery';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const negotiationId = searchParams.get('negotiation');

  const { items, getTotal, clearCart, addItem } = useCartStore();
  const { user, profile } = useAuthStore();
  const supabase = createClient();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [negotiationLoading, setNegotiationLoading] = useState(!!negotiationId);
  const [activeNegotiationId, setActiveNegotiationId] = useState<string | null>(null);
  const [dealLabel, setDealLabel] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Dhaka');
  const [zone, setZone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [trxId, setTrxId] = useState('');
  const [deliveryOption, setDeliveryOption] = useState(60);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!negotiationId || !user?.id) {
      if (negotiationId && mounted && !user) {
        setNegotiationLoading(false);
        setError('Please log in to complete your bulk deal checkout.');
      }
      return;
    }

    let cancelled = false;

    async function loadNegotiationCheckout() {
      setNegotiationLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('negotiations')
        .select(`
          id, buyer_id, seller_id, product_id, current_price, final_price, quantity, status,
          products (id, name, price, images, seller_id)
        `)
        .eq('id', negotiationId)
        .maybeSingle();

      if (cancelled) return;

      if (fetchError || !data) {
        setError('This bulk deal link is invalid or has expired.');
        setNegotiationLoading(false);
        return;
      }

      if (data.buyer_id !== user!.id) {
        setError('This checkout link belongs to another account.');
        setNegotiationLoading(false);
        return;
      }

      if (data.status === 'ordered') {
        setError('This bulk deal has already been checked out.');
        setNegotiationLoading(false);
        return;
      }

      if (data.status !== 'accepted') {
        setError('This deal is not ready for checkout yet. Wait for the seller to accept your offer.');
        setNegotiationLoading(false);
        return;
      }

      const rawProduct = data.products;
      const product = (Array.isArray(rawProduct) ? rawProduct[0] : rawProduct) as {
        id: string;
        name: string;
        images?: unknown;
        seller_id?: string;
      } | null;

      if (!product?.id) {
        setError('Product for this deal could not be found.');
        setNegotiationLoading(false);
        return;
      }

      const unitPrice = Number(data.final_price ?? data.current_price);
      const qty = Number(data.quantity) || 1;

      clearCart();
      addItem({
        id: product.id,
        name: product.name,
        price: unitPrice,
        quantity: qty,
        image: resolveProductImage(product),
        sellerId: data.seller_id || product.seller_id,
      });

      setActiveNegotiationId(data.id);
      setDealLabel(`${product.name} · ${qty} unit${qty > 1 ? 's' : ''} @ ৳${unitPrice.toLocaleString()}`);
      setNegotiationLoading(false);
    }

    loadNegotiationCheckout();

    return () => {
      cancelled = true;
    };
  }, [negotiationId, user?.id, mounted, supabase, clearCart, addItem]);

  useEffect(() => {
    if (!user) return;

    async function loadProfile() {
      const { data } = await supabase
        .from('users')
        .select('name, phone, address')
        .eq('id', user!.id)
        .maybeSingle();

      const p = data || profile;
      if (p?.name) setFullName(p.name);
      if (p?.phone) setPhone(p.phone);
      if (p?.address) {
        const parts = String(p.address).split(',').map((s: string) => s.trim());
        if (parts.length >= 1) setAddress(parts[0]);
        if (parts.length >= 2) setCity(parts[1]);
        if (parts.length >= 3) setZone(parts[2]);
      }
    }

    loadProfile();
  }, [user, profile, supabase]);

  if (!mounted) return null;

  if (negotiationLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 animate-pulse">Loading your bulk deal checkout...</p>
      </div>
    );
  }

  if (items.length === 0 && !negotiationId && !isSuccess) {
    // Only redirect if we haven't placed an order yet
    router.push('/cart');
    return null;
  }

  if (items.length === 0 && error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 max-w-md text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => router.push('/profile')}
            className="text-primary font-bold hover:underline"
          >
            Go to Profile →
          </button>
        </div>
      </div>
    );
  }

  const subtotal = getTotal();
  const deliveryRate = deliveryOption;
  const shippingFee = calcShippingFee(items, deliveryRate);
  const deliveryUnits = countDeliveryUnits(items);
  const total = subtotal + shippingFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to place an order.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const shippingAddress = `${address}, ${city}${zone ? `, ${zone}` : ''}`;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          buyer_id: user.id,
          total_amount: total,
          status: 'pending',
          shipping_address: shippingAddress,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: isValidUuid(item.id) ? item.id : null,
        seller_id: isValidUuid(item.sellerId) ? item.sellerId : null,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      for (const item of items) {
        if (!isValidUuid(item.id)) continue;
        const { data: prod } = await supabase.from('products').select('quantity').eq('id', item.id).maybeSingle();
        if (prod) {
          await supabase
            .from('products')
            .update({ quantity: Math.max(0, (prod.quantity || 0) - item.quantity) })
            .eq('id', item.id);
        }
      }

      await supabase.from('payments').insert({
        order_id: order.id,
        amount: total,
        status: paymentMethod === 'cod' ? 'pending' : 'paid',
        transaction_id: paymentMethod === 'bkash' ? trxId : `COD-${order.id.slice(0, 8)}`,
      });

      await supabase.from('deliveries').insert({
        order_id: order.id,
        agent_id: null,
        pickup_address: 'Seller Hub — Dhaka',
        delivery_address: shippingAddress,
        status: 'pending',
        pickup_stops: [],
      });

      await processBundleOrderAfterCheckout(supabase, order.id, items, shippingAddress);
      await configureLocalDelivery(supabase, order.id, items, deliveryOption === 120);
      await recordCommissionLogs(supabase, order.id, total);

      const sellerIds = [...new Set(items.map((i) => i.sellerId).filter(Boolean))] as string[];
      await Promise.all(
        sellerIds.map((sid) =>
          createNotification(
            supabase,
            sid,
            'New order received',
            `Order #${order.id.slice(0, 8)} — ৳${total.toLocaleString()}`,
            '/seller/orders'
          )
        )
      );

      if (activeNegotiationId) {
        await supabase
          .from('negotiations')
          .update({ status: 'ordered' })
          .eq('id', activeNegotiationId);
      }

      setIsSuccess(true);
      clearCart();
      router.push(`/checkout/success?orderId=${order.id}&total=${total}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong while placing your order.';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <form onSubmit={handlePlaceOrder} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Checkout</h1>
        {dealLabel && (
          <p className="mb-6 text-sm font-semibold text-purple-700 bg-purple-50 border border-purple-100 rounded-xl px-4 py-3">
            Bulk deal checkout — {dealLabel}
          </p>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">{error}</div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-sm flex items-center justify-center">1</span>
                Shipping Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Full Name</label>
                  <input required type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/20" placeholder="John Doe" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Phone</label>
                  <input required type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/20" placeholder="+880 1XXX-XXXXXX" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Full Address</label>
                  <textarea required value={address} onChange={(e) => setAddress(e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/20" placeholder="House 123, Road 4, Block A..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">City</label>
                  <input required type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/20" placeholder="e.g. Dhaka" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Zone / Area</label>
                  <input required type="text" value={zone} onChange={(e) => setZone(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/20" placeholder="e.g. Gulshan, Agrabad" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-sm flex items-center justify-center">2</span>
                Delivery Options
              </h2>
              <div className="space-y-4">
                <label className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                  <input type="radio" name="delivery" checked={deliveryOption === 60} onChange={() => setDeliveryOption(60)} className="w-4 h-4" />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Standard Delivery (3-5 days)</p>
                    <p className="text-xs text-slate-500">৳60 per bundle or seller group</p>
                  </div>
                  <span className="font-bold">৳60</span>
                </label>
                <label className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                  <input type="radio" name="delivery" checked={deliveryOption === 120} onChange={() => setDeliveryOption(120)} className="w-4 h-4" />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Express Delivery (24 hrs)</p>
                    <p className="text-xs text-slate-500">৳120 per bundle or seller group</p>
                  </div>
                  <span className="font-bold">৳120</span>
                </label>
                {deliveryUnits > 1 && (
                  <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                    {shippingLabel(items)} — {deliveryUnits} delivery unit{deliveryUnits > 1 ? 's' : ''} × ৳{deliveryRate} = ৳{shippingFee}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-sm flex items-center justify-center">3</span>
                Payment Method
              </h2>
              <div className="space-y-4">
                <label className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                  <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-4 h-4" />
                  <p className="font-semibold text-slate-900">Cash on Delivery (COD)</p>
                </label>
                <div className={`border-2 rounded-xl overflow-hidden ${paymentMethod === 'bkash' ? 'border-pink-500' : 'border-slate-200'}`}>
                  <label className="flex items-center gap-4 p-4 cursor-pointer">
                    <input type="radio" name="payment" checked={paymentMethod === 'bkash'} onChange={() => setPaymentMethod('bkash')} className="w-4 h-4" />
                    <p className="font-semibold text-slate-900">bKash / Nagad</p>
                  </label>
                  {paymentMethod === 'bkash' && (
                    <div className="px-4 pb-5 pt-2 bg-pink-50/50 border-t border-pink-100">
                      <input required type="text" value={trxId} onChange={(e) => setTrxId(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-pink-200 bg-white mt-2" placeholder="Transaction ID" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    {item.image && <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg border" />}
                    <div className="flex-1 text-sm">
                      <h4 className="font-medium line-clamp-1">{item.name}</h4>
                      <p className="text-slate-500">Qty: {item.quantity}</p>
                      <p className="font-semibold">৳{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-4 text-sm mb-6 border-t pt-6">
                <div className="flex justify-between"><span>Subtotal</span><span>৳{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Shipping ({shippingLabel(items)})</span><span>৳{shippingFee.toLocaleString()}</span></div>
                <div className="flex justify-between font-bold text-lg border-t pt-4"><span>Total</span><span>৳{total.toLocaleString()}</span></div>
              </div>
              <button disabled={loading} type="submit" className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 disabled:opacity-50">
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <p className="text-slate-500 animate-pulse">Loading checkout...</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
