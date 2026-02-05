export type HeatPoint = [number, number, number];

const centerLat = 55.7558;
const centerLng = 37.6173;

function point(latOffset: number, lngOffset: number, intensity: number): HeatPoint {
  return [centerLat + latOffset, centerLng + lngOffset, intensity];
}

export const mockDeliveryData: HeatPoint[] = [
  point(0, 0, 0.9),
  point(0.02, 0.01, 0.7),
  point(-0.015, 0.02, 0.8),
  point(0.01, -0.02, 0.6),
  point(-0.02, -0.01, 0.75),
  point(0.04, 0.03, 0.5),
  point(-0.03, 0.025, 0.65),
  point(0.025, -0.035, 0.55),
  point(-0.04, -0.02, 0.7),
  point(0.05, 0, 0.4),
  point(0, 0.05, 0.45),
  point(-0.05, 0.02, 0.5),
  point(0.02, 0.06, 0.35),
  point(-0.01, -0.05, 0.6),
  point(0.06, -0.03, 0.3),
];

export const mockScanData: HeatPoint[] = [
  point(0.01, 0.005, 0.95),
  point(-0.008, 0.015, 0.85),
  point(0.012, -0.01, 0.9),
  point(-0.01, -0.008, 0.88),
  point(0.03, 0.02, 0.7),
  point(-0.025, 0.03, 0.75),
  point(0.02, -0.025, 0.65),
  point(-0.03, -0.02, 0.72),
  point(0.04, 0, 0.5),
  point(0, 0.04, 0.55),
  point(-0.035, 0.01, 0.6),
  point(0.015, 0.045, 0.45),
  point(-0.02, -0.04, 0.58),
  point(0.045, -0.02, 0.4),
  point(-0.04, 0.02, 0.42),
  point(0.05, 0.03, 0.35),
  point(-0.05, -0.03, 0.38),
];
