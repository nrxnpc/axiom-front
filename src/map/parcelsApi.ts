import type { HeatPoint } from './mockData';
import type { DateRange } from './dateRange';
import { getMockParcelsAll, getMockScansAll, filterPointsByBounds } from './parcelsMock';

const MOCK_DELAY_MS = 180 + Math.floor(Math.random() * 120);

function addPadding(bbox: [number, number, number, number], paddingPercent = 0.15): [number, number, number, number] {
  const [west, south, east, north] = bbox;
  const latSpan = north - south;
  const lngSpan = east - west;
  const padLat = latSpan * paddingPercent;
  const padLng = lngSpan * paddingPercent;
  return [
    west - padLng,
    south - padLat,
    east + padLng,
    north + padLat,
  ];
}

export async function fetchParcelsByBounds(bbox: [number, number, number, number], dateRange?: DateRange): Promise<HeatPoint[]> {
  await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));
  const padded = addPadding(bbox);
  const all = getMockParcelsAll();
  return filterPointsByBounds(all, padded, dateRange);
}

const MOCK_SCAN_DELAY_MS = 150 + Math.floor(Math.random() * 100);

export async function fetchScansByBounds(bbox: [number, number, number, number], dateRange?: DateRange): Promise<HeatPoint[]> {
  await new Promise((r) => setTimeout(r, MOCK_SCAN_DELAY_MS));
  const padded = addPadding(bbox);
  const all = getMockScansAll();
  return filterPointsByBounds(all, padded, dateRange);
}
