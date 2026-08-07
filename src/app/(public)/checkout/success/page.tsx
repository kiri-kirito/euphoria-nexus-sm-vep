import Link from "next/link";

export default function CheckoutSuccessPage() {
  // Estimated delivery date (3 days from now)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const formattedDate = deliveryDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-slate-200 text-center">
          
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Order Placed Successfully!</h1>
          <p className="text-slate-500 mb-8">Thank you for your purchase. We've sent a confirmation email with your order details.</p>
          
          <div className="bg-slate-50 rounded-xl p-5 mb-8 text-left border border-slate-100 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Order ID:</span>
              <span className="font-semibold text-slate-900">#ORD-84392</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total Amount:</span>
              <span className="font-semibold text-slate-900">৳41,060</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Estimated Delivery:</span>
              <span className="font-semibold text-slate-900 text-right">{formattedDate}</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/profile/orders" className="flex-1 flex justify-center items-center py-3 px-4 bg-white text-slate-700 border border-slate-300 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
              View Order Status
            </Link>
            <Link href="/" className="flex-1 flex justify-center items-center py-3 px-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors">
              Continue Shopping
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
