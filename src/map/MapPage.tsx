import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Box, Paper, ToggleButtonGroup, ToggleButton, Typography, CircularProgress } from '@mui/material';
import Map, { Source, Layer, type MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { FeatureCollection } from 'geojson';
import { osmMapStyle } from './osmStyle';
import type { HeatPoint } from './mockData';
import { fetchParcelsByBounds, fetchScansByBounds } from './parcelsApi';

type MapMode = 'delivery' | 'scan';

const center = { longitude: 37.6173, latitude: 55.7558 };

function pointsToGeoJSON(points: HeatPoint[]): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: points.map(([lat, lng, weight]) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lng, lat] },
      properties: { weight },
    })),
  };
}

type BoundsGetter = () => { getWest: () => number; getSouth: () => number; getEast: () => number; getNorth: () => number };

function getBbox(map: { getBounds: BoundsGetter }): [number, number, number, number] {
  const b = map.getBounds();
  return [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()];
}

export const MapPage = () => {
  const [mode, setMode] = useState<MapMode>('delivery');
  const [viewportDeliveryPoints, setViewportDeliveryPoints] = useState<HeatPoint[]>([]);
  const [viewportScanPoints, setViewportScanPoints] = useState<HeatPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const deliveryRequestIdRef = useRef(0);
  const scanRequestIdRef = useRef(0);

  const heatPoints = useMemo(
    () => (mode === 'delivery' ? viewportDeliveryPoints : viewportScanPoints),
    [mode, viewportDeliveryPoints, viewportScanPoints]
  );

  const geojson = useMemo(() => pointsToGeoJSON(heatPoints), [heatPoints]);

  const loadParcelsForView = useCallback((map: { getBounds: BoundsGetter }) => {
    const id = ++deliveryRequestIdRef.current;
    setLoading(true);
    fetchParcelsByBounds(getBbox(map)).then((points) => {
      if (id !== deliveryRequestIdRef.current) return;
      setViewportDeliveryPoints(points);
      setLoading(false);
    });
  }, []);

  const loadScansForView = useCallback((map: { getBounds: BoundsGetter }) => {
    const id = ++scanRequestIdRef.current;
    setLoading(true);
    fetchScansByBounds(getBbox(map)).then((points) => {
      if (id !== scanRequestIdRef.current) return;
      setViewportScanPoints(points);
      setLoading(false);
    });
  }, []);

  const mapRef = useRef<MapRef | null>(null);

  const handleMoveEnd = useCallback(
    (e: { target: { getBounds: BoundsGetter } }) => {
      if (mode === 'delivery') loadParcelsForView(e.target);
      else loadScansForView(e.target);
    },
    [mode, loadParcelsForView, loadScansForView]
  );

  useEffect(() => {
    const map = mapRef.current?.getMap?.();
    if (!map?.getBounds) return;
    if (mode === 'delivery') loadParcelsForView(map);
    else loadScansForView(map);
  }, [mode, loadParcelsForView, loadScansForView]);

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', p: 2 }}>
      <Paper sx={{ p: 1.5, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="subtitle1" fontWeight={500}>
          Режим:
        </Typography>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_, value) => value != null && setMode(value)}
          size="small"
        >
          <ToggleButton value="delivery">Доставка</ToggleButton>
          <ToggleButton value="scan">Сканирования</ToggleButton>
        </ToggleButtonGroup>
        <Typography variant="caption" color="text.secondary">
          {mode === 'delivery'
            ? 'Тепловая карта по данным доставки'
            : 'Тепловая карта по сканированиям QR-кодов'}
        </Typography>
        {loading && (
          <CircularProgress size={20} sx={{ ml: 1 }} />
        )}
      </Paper>
      <Box sx={{ flex: 1, minHeight: 0, borderRadius: 1, overflow: 'hidden', position: 'relative' }}>
        <Map
          ref={mapRef}
          initialViewState={{ ...center, zoom: 11 }}
          style={{ width: '100%', height: '100%' }}
          mapStyle={osmMapStyle as import('maplibre-gl').StyleSpecification}
          onMoveEnd={handleMoveEnd}
          onLoad={(e) => {
            if (mode === 'delivery') loadParcelsForView(e.target);
            else loadScansForView(e.target);
          }}
        >
          <Source id="heatmap" type="geojson" data={geojson}>
            <Layer
              id="heatmap-layer"
              type="heatmap"
              paint={{
                'heatmap-weight': ['get', 'weight'],
                'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 0.5, 14, 1.5],
                'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 15, 14, 40],
                'heatmap-opacity': 0.6,
                'heatmap-color': [
                  'interpolate',
                  ['linear'],
                  ['heatmap-density'],
                  0,
                  'rgba(33,102,172,0)',
                  0.2,
                  'rgb(103,169,207)',
                  0.4,
                  'rgb(209,229,240)',
                  0.6,
                  'rgb(253,219,199)',
                  0.8,
                  'rgb(239,138,98)',
                  1,
                  'rgb(178,24,43)',
                ],
              }}
            />
          </Source>
        </Map>
      </Box>
    </Box>
  );
};
