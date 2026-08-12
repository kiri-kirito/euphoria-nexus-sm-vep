/** Derive map coordinates from order/delivery data (Dhaka area defaults when geo missing) */
export function coordsFromSeed(seed: string, baseLat = 23.8103, baseLng = 90.4125) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const latOff = ((hash % 1000) / 1000 - 0.5) * 0.08;
  const lngOff = (((hash >> 8) % 1000) / 1000 - 0.5) * 0.08;
  return { lat: baseLat + latOff, lng: baseLng + lngOff };
}

export function deliveryMapPoints(order: {
  id: string;
  shipping_address?: string;
  status?: string;
  deliveries?: Array<{
    status?: string;
    pickup_address?: string;
    delivery_address?: string;
    agent_id?: string;
  }>;
}) {
  const delivery = order.deliveries?.[0];
  const status = delivery?.status || order.status || 'pending';
  const pickup = coordsFromSeed(`${order.id}-pickup`);
  const drop = coordsFromSeed(`${order.id}-drop`, 23.78, 90.42);
  const agent = coordsFromSeed(`${order.id}-agent`, (pickup.lat + drop.lat) / 2, (pickup.lng + drop.lng) / 2);

  return {
    status,
    pickup: {
      ...pickup,
      label: delivery?.pickup_address?.slice(0, 40) || 'Seller pickup',
    },
    delivery: {
      ...drop,
      label: delivery?.delivery_address?.slice(0, 40) || order.shipping_address?.slice(0, 40) || 'Your address',
    },
    agent: {
      ...agent,
      label: 'Delivery agent',
    },
  };
}
