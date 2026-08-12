'use client';

import dynamic from 'next/dynamic';

const OrderTrackingMap = dynamic(() => import('@/components/maps/OrderTrackingMap'), {
  ssr: false,
  loading: () => (
    <div className="h-56 w-full rounded-xl bg-slate-100 animate-pulse flex items-center justify-center text-sm text-slate-500">
      Loading map…
    </div>
  ),
});

export default OrderTrackingMap;
