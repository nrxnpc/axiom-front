import type { HeatPoint } from './mockData';

const CITIES: Array<{ lat: number; lng: number; count: number; spread: number }> = [
  { lat: 55.7558, lng: 37.6173, count: 78, spread: 0.045 },
  { lat: 59.9343, lng: 30.3351, count: 92, spread: 0.038 },
  { lat: 58.5213, lng: 31.271, count: 58, spread: 0.032 },
  { lat: 56.8587, lng: 35.9176, count: 65, spread: 0.035 },
  { lat: 57.6299, lng: 39.8737, count: 52, spread: 0.03 },
  { lat: 47.2313, lng: 39.7233, count: 55, spread: 0.032 },
  { lat: 51.6605, lng: 39.2005, count: 50, spread: 0.03 },
  { lat: 56.8389, lng: 60.6057, count: 58, spread: 0.038 },
  { lat: 56.0153, lng: 92.8932, count: 48, spread: 0.035 },
];

const MIDDLE_RUSSIA_TOWNS: Array<{ lat: number; lng: number; count: number; spread: number }> = [
  { lat: 55.08, lng: 38.78, count: 2, spread: 0.008 },
  { lat: 54.92, lng: 37.41, count: 3, spread: 0.007 },
  { lat: 55.43, lng: 37.55, count: 2, spread: 0.008 },
  { lat: 55.8, lng: 38.97, count: 2, spread: 0.007 },
  { lat: 55.85, lng: 38.44, count: 3, spread: 0.008 },
  { lat: 56.34, lng: 37.52, count: 2, spread: 0.007 },
  { lat: 56.33, lng: 36.73, count: 2, spread: 0.008 },
  { lat: 54.2, lng: 37.62, count: 3, spread: 0.01 },
  { lat: 54.63, lng: 39.74, count: 2, spread: 0.009 },
  { lat: 56.13, lng: 40.41, count: 3, spread: 0.008 },
  { lat: 56.36, lng: 41.32, count: 2, spread: 0.007 },
  { lat: 55.58, lng: 42.03, count: 2, spread: 0.008 },
  { lat: 56.99, lng: 40.97, count: 3, spread: 0.009 },
  { lat: 54.51, lng: 36.26, count: 2, spread: 0.008 },
  { lat: 55.1, lng: 36.61, count: 3, spread: 0.007 },
  { lat: 56.87, lng: 37.35, count: 2, spread: 0.008 },
  { lat: 56.26, lng: 34.33, count: 2, spread: 0.008 },
  { lat: 55.21, lng: 34.29, count: 2, spread: 0.007 },
  { lat: 54.78, lng: 32.04, count: 3, spread: 0.009 },
  { lat: 53.25, lng: 34.37, count: 2, spread: 0.008 },
  { lat: 52.97, lng: 36.07, count: 2, spread: 0.008 },
  { lat: 55.79, lng: 38.45, count: 2, spread: 0.007 },
  { lat: 55.57, lng: 38.23, count: 3, spread: 0.008 },
  { lat: 55.6, lng: 38.12, count: 2, spread: 0.007 },
  { lat: 55.68, lng: 37.89, count: 2, spread: 0.007 },
  { lat: 55.81, lng: 37.96, count: 3, spread: 0.008 },
  { lat: 55.91, lng: 37.73, count: 2, spread: 0.008 },
  { lat: 56.3, lng: 38.13, count: 2, spread: 0.008 },
  { lat: 56.4, lng: 38.71, count: 2, spread: 0.007 },
  { lat: 56.74, lng: 38.85, count: 2, spread: 0.008 },
  { lat: 57.77, lng: 40.93, count: 3, spread: 0.009 },
  { lat: 56.85, lng: 41.39, count: 2, spread: 0.007 },
  { lat: 56.5, lng: 39.68, count: 2, spread: 0.008 },
  { lat: 54.73, lng: 39.57, count: 2, spread: 0.008 },
  { lat: 53.15, lng: 34.37, count: 2, spread: 0.008 },
  { lat: 54.2, lng: 37.45, count: 2, spread: 0.007 },
  { lat: 55.45, lng: 37.37, count: 2, spread: 0.007 },
  { lat: 56.05, lng: 35.92, count: 2, spread: 0.008 },
  { lat: 57.0, lng: 40.4, count: 2, spread: 0.007 },
  { lat: 55.95, lng: 36.87, count: 2, spread: 0.008 },
];

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function generateCityPoints(
  lat: number,
  lng: number,
  count: number,
  spread: number
): HeatPoint[] {
  const points: HeatPoint[] = [];
  for (let i = 0; i < count; i++) {
    const latOffset = randomInRange(-spread, spread);
    const lngOffset = randomInRange(-spread, spread);
    const weight = randomInRange(0.2, 1);
    points.push([lat + latOffset, lng + lngOffset, weight]);
  }
  return points;
}

let cached: HeatPoint[] | null = null;

const SCAN_CITIES: Array<{ lat: number; lng: number; count: number; spread: number }> = [
  { lat: 55.7558, lng: 37.6173, count: 85, spread: 0.042 },
  { lat: 59.9343, lng: 30.3351, count: 72, spread: 0.04 },
  { lat: 58.5213, lng: 31.271, count: 62, spread: 0.03 },
  { lat: 56.8587, lng: 35.9176, count: 58, spread: 0.033 },
  { lat: 57.6299, lng: 39.8737, count: 48, spread: 0.028 },
  { lat: 47.2313, lng: 39.7233, count: 52, spread: 0.03 },
  { lat: 51.6605, lng: 39.2005, count: 46, spread: 0.028 },
  { lat: 56.8389, lng: 60.6057, count: 54, spread: 0.035 },
  { lat: 56.0153, lng: 92.8932, count: 44, spread: 0.032 },
];

let cachedScans: HeatPoint[] | null = null;

export function getMockParcelsAll(): HeatPoint[] {
  if (cached) return cached;
  cached = [
    ...CITIES.flatMap(({ lat, lng, count, spread }) => generateCityPoints(lat, lng, count, spread)),
    ...MIDDLE_RUSSIA_TOWNS.flatMap(({ lat, lng, count, spread }) => generateCityPoints(lat, lng, count, spread)),
  ];
  return cached;
}

export function getMockScansAll(): HeatPoint[] {
  if (cachedScans) return cachedScans;
  cachedScans = SCAN_CITIES.flatMap(({ lat, lng, count, spread }) =>
    generateCityPoints(lat, lng, count, spread)
  );
  return cachedScans;
}

export function filterPointsByBounds(
  points: HeatPoint[],
  bbox: [number, number, number, number]
): HeatPoint[] {
  const [west, south, east, north] = bbox;
  return points.filter(([lat, lng]) => {
    return lng >= west && lng <= east && lat >= south && lat <= north;
  });
}
