export const MAP_ORDER_QUERY_PARAM = 'order';

export function buildMapOrderSearchParams(orderNumber: string): string {
  return new URLSearchParams({ [MAP_ORDER_QUERY_PARAM]: orderNumber }).toString();
}

export function buildMapOrderPath(orderNumber: string): string {
  return `/map?${buildMapOrderSearchParams(orderNumber)}`;
}

export function getInitialMapModeFromLocation(): 'delivery' | 'scan' | 'orders' {
  if (typeof window === 'undefined') return 'delivery';
  const q = new URLSearchParams(window.location.search).get(MAP_ORDER_QUERY_PARAM)?.trim();
  return q ? 'orders' : 'delivery';
}
