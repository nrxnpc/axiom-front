import type { HeatPoint } from './mockData';
import type { MapOrder } from './ordersMock';
import type { DateRange } from './dateRange';

const MAP_API_BASE = import.meta.env.VITE_MAP_API_BASE ?? '';

const MOCK_DELAY_MS = 160 + Math.floor(Math.random() * 100);
const MOCK_ORDER_DELAY_MS = 120 + Math.floor(Math.random() * 80);

function addPadding(bbox: [number, number, number, number], paddingPercent = 0.15): [number, number, number, number] {
  const [west, south, east, north] = bbox;
  const latSpan = north - south;
  const lngSpan = east - west;
  const padLat = latSpan * paddingPercent;
  const padLng = lngSpan * paddingPercent;
  return [west - padLng, south - padLat, east + padLng, north + padLat];
}

function isInDateRange(dateStr: string, range?: DateRange): boolean {
  if (!range) return true;
  return dateStr >= range.start && dateStr <= range.end;
}

type DeliveryPointDto = { lat: number; lng: number; weight: number; date: string };

function filterByBboxAndDate<T extends { lat: number; lng: number; date?: string }>(
  items: T[],
  bbox: [number, number, number, number],
  dateRange?: DateRange
): T[] {
  const [west, south, east, north] = bbox;
  return items.filter(
    (o) =>
      o.lng >= west &&
      o.lng <= east &&
      o.lat >= south &&
      o.lat <= north &&
      (!o.date || isInDateRange(o.date, dateRange))
  );
}

async function mockFetchOrders(bbox: [number, number, number, number], dateRange?: DateRange): Promise<MapOrder[]> {
  await new Promise((r) => setTimeout(r, MOCK_ORDER_DELAY_MS));
  const res = await fetch(`${import.meta.env.BASE_URL}mocks/map/orders.json`);
  if (!res.ok) throw new Error('Map API: ' + res.status);
  const data = (await res.json()) as MapOrder[];
  const padded = addPadding(bbox, 0.12);
  return filterByBboxAndDate(data, padded, dateRange);
}

async function mockFetchDelivery(bbox: [number, number, number, number], dateRange?: DateRange): Promise<HeatPoint[]> {
  await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));
  const res = await fetch(`${import.meta.env.BASE_URL}mocks/map/delivery.json`);
  if (!res.ok) throw new Error('Map API: ' + res.status);
  const data = (await res.json()) as DeliveryPointDto[];
  const padded = addPadding(bbox);
  const filtered = filterByBboxAndDate(data, padded, dateRange);
  return filtered.map((p) => [p.lat, p.lng, p.weight] as HeatPoint);
}

async function mockFetchScans(bbox: [number, number, number, number], dateRange?: DateRange): Promise<HeatPoint[]> {
  await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));
  const res = await fetch(`${import.meta.env.BASE_URL}mocks/map/scans.json`);
  if (!res.ok) throw new Error('Map API: ' + res.status);
  const data = (await res.json()) as DeliveryPointDto[];
  const padded = addPadding(bbox);
  const filtered = filterByBboxAndDate(data, padded, dateRange);
  return filtered.map((p) => [p.lat, p.lng, p.weight] as HeatPoint);
}

function buildMapQuery(bbox: [number, number, number, number], dateRange?: DateRange): string {
  const p = new URLSearchParams();
  p.set('bbox', bbox.join(','));
  if (dateRange?.start) p.set('start', dateRange.start);
  if (dateRange?.end) p.set('end', dateRange.end);
  return p.toString();
}

export async function fetchOrdersByBounds(
  bbox: [number, number, number, number],
  dateRange?: DateRange
): Promise<MapOrder[]> {
  if (MAP_API_BASE) {
    const res = await fetch(`${MAP_API_BASE}/orders?${buildMapQuery(bbox, dateRange)}`);
    if (!res.ok) throw new Error('Map API: ' + res.status);
    return res.json();
  }
  return mockFetchOrders(bbox, dateRange);
}

export async function fetchDeliveryByBounds(
  bbox: [number, number, number, number],
  dateRange?: DateRange
): Promise<HeatPoint[]> {
  if (MAP_API_BASE) {
    const res = await fetch(`${MAP_API_BASE}/delivery?${buildMapQuery(bbox, dateRange)}`);
    if (!res.ok) throw new Error('Map API: ' + res.status);
    return res.json();
  }
  return mockFetchDelivery(bbox, dateRange);
}

export async function fetchScansByBounds(
  bbox: [number, number, number, number],
  dateRange?: DateRange
): Promise<HeatPoint[]> {
  if (MAP_API_BASE) {
    const res = await fetch(`${MAP_API_BASE}/scans?${buildMapQuery(bbox, dateRange)}`);
    if (!res.ok) throw new Error('Map API: ' + res.status);
    return res.json();
  }
  return mockFetchScans(bbox, dateRange);
}
